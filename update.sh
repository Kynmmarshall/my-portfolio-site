#!/usr/bin/env bash
main() {
set -Eeuo pipefail
umask 077

REPO_DIR="${REPO_DIR:-/root/my-portfolio-site}"
DEPLOY_DIR="${DEPLOY_DIR:-/root/kynmmarshall-deploy}"
NODE_BIN="${NODE_BIN:-/opt/kynmmarshall-node24/bin/node}"
APP_NAME="kynmmarshall-portfolio"
PORT=3100
export SITE_URL="https://kynmmarshall.is-a.dev"
export NEXT_TELEMETRY_DISABLED=1

fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '\n%s\n' "$*"; }

for command in git flock curl tar mktemp pm2; do
  command -v "$command" >/dev/null || fail "Required command missing: $command"
done
PM2_BIN="$(command -v pm2)"
[[ -x "$NODE_BIN" ]] || fail "Node runtime not found: $NODE_BIN"
[[ "$("$NODE_BIN" -p 'process.versions.node.split(".")[0]')" == 24 ]] || fail "Node.js 24 is required."
export PATH="$(dirname "$NODE_BIN"):$PATH"
command -v npm >/dev/null || fail "npm is unavailable alongside Node 24."

REPO_DIR="$(cd "$REPO_DIR" && pwd -P)"
git_root="$(git -C "$REPO_DIR" rev-parse --show-toplevel)"
[[ "$(cd "$git_root" && pwd -P)" == "$REPO_DIR" ]] || fail "REPO_DIR must be the Git repository root."
mkdir -p "$DEPLOY_DIR/releases"
DEPLOY_DIR="$(cd "$DEPLOY_DIR" && pwd -P)"
case "$DEPLOY_DIR/" in "$REPO_DIR/"*) fail "DEPLOY_DIR must be outside the Git checkout." ;; esac
exec 9>"$DEPLOY_DIR/update.lock"
flock -n 9 || fail "Another update is already running."

pm2_command() { "$PM2_BIN" "$@" 9>&-; }
health_check() {
  curl --fail --silent --show-error --output /dev/null \
    --connect-timeout 2 --max-time 5 --retry 12 --retry-delay 1 \
    --retry-connrefused --retry-all-errors --retry-max-time 45 \
    -H 'Host: kynmmarshall.is-a.dev' "http://127.0.0.1:$PORT/"
}

[[ -z "$(git -C "$REPO_DIR" status --porcelain)" ]] || fail "Git checkout has local changes. Back them up and reconcile them with GitHub before updating; nothing was discarded."
branch="$(git -C "$REPO_DIR" symbolic-ref --quiet --short HEAD)" || fail "Checkout is on a detached HEAD."
remote="$(git -C "$REPO_DIR" config --get "branch.$branch.remote")" || fail "The current branch has no upstream remote."
[[ "$remote" != . ]] || fail "A remote upstream is required."
log "Fetching the configured upstream for $branch..."
git -C "$REPO_DIR" fetch "$remote"
upstream="$(git -C "$REPO_DIR" rev-parse --symbolic-full-name '@{upstream}')"
git -C "$REPO_DIR" merge-base --is-ancestor HEAD "$upstream" || fail "Local commits are ahead of or diverge from upstream; resolve this manually."
git -C "$REPO_DIR" merge --ff-only "$upstream"
commit="$(git -C "$REPO_DIR" rev-parse HEAD)"
release="$(mktemp -d "$DEPLOY_DIR/releases/$(date -u +%Y%m%dT%H%M%SZ)-${commit:0:12}-XXXXXX")"

log "Capturing only $APP_NAME for rollback..."
pm2_command jlist | "$NODE_BIN" -e '
const fs = require("node:fs");
const [name, release, interpreter, siteUrl] = process.argv.slice(1);
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const apps = JSON.parse(input).filter(app => app.name === name);
  if (apps.length !== 1) throw new Error("Expected exactly one existing portfolio process in PM2.");
  const current = apps[0].pm2_env;
  if (current.status !== "online" || current.exec_mode !== "fork_mode") {
    throw new Error("The existing portfolio must be online in fork mode before updating.");
  }
  const args = current.args || [];
  if (!Array.isArray(args) || args.join(" ") !== "start -H 127.0.0.1 -p 3100") {
    throw new Error("Unexpected portfolio arguments; expected start -H 127.0.0.1 -p 3100.");
  }
  if (!current.pm_exec_path.endsWith("/node_modules/next/dist/bin/next")) {
    throw new Error("Unexpected portfolio script; refusing to replace it.");
  }
  const previous = {
    name, script: current.pm_exec_path, cwd: current.pm_cwd,
    interpreter: current.exec_interpreter, args,
    exec_mode: "fork", instances: 1, autorestart: true,
    env: current.env || {},
  };
  const next = {
    ...previous, script: `${release}/node_modules/next/dist/bin/next`,
    cwd: release, interpreter,
    env: { ...previous.env, NODE_ENV: "production", SITE_URL: siteUrl, NEXT_TELEMETRY_DISABLED: "1" },
  };
  for (const [file, app] of [["previous.config.cjs", previous], ["ecosystem.config.cjs", next]]) {
    fs.writeFileSync(`${release}/${file}`, `module.exports = ${JSON.stringify({ apps: [app] }, null, 2)};\n`, { mode: 0o600 });
  }
});
' "$APP_NAME" "$release" "$NODE_BIN" "$SITE_URL"

git -C "$REPO_DIR" archive HEAD | tar -x -C "$release"
for environment in .env .env.local .env.production .env.production.local; do
  if git -C "$REPO_DIR" ls-files --error-unmatch "$environment" >/dev/null 2>&1; then
    fail "Environment file is tracked in Git: $environment. Remove secrets from version control before deploying."
  fi
  if [[ -f "$REPO_DIR/$environment" ]]; then
    cp "$REPO_DIR/$environment" "$release/$environment"
    chmod 600 "$release/$environment"
  fi
done
mkdir -p "$REPO_DIR/.data"
ln -s "$REPO_DIR/.data" "$release/.data"

log "Building $commit in $release; the current app remains online..."
(
  cd "$release"
  npm ci --include=dev --no-audit --no-fund
  npm test
  NODE_OPTIONS=--max-old-space-size=2048 npm run build
)
[[ -s "$release/.next/BUILD_ID" ]] || fail "Build did not create .next/BUILD_ID."
health_check || fail "The existing app is unhealthy; refusing to switch releases."

switching=0
finish() {
  status=$?
  trap - EXIT INT TERM
  if (( status != 0 && switching == 1 )); then
    log "Deployment failed. Restoring the previous portfolio release..."
    pm2_command delete "$APP_NAME" >/dev/null 2>&1 || true
    if pm2_command start "$release/previous.config.cjs" --only "$APP_NAME" && health_check; then
      pm2_command save || true
      log "Previous release restored. The failed build is retained at $release."
    else
      printf 'ROLLBACK FAILED. Inspect: pm2 logs %s --lines 50 --nostream\n' "$APP_NAME" >&2
    fi
  fi
  exit "$status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

dump="${PM2_HOME:-$HOME/.pm2}/dump.pm2"
if [[ -f "$dump" ]]; then
  cp "$dump" "$release/pm2-dump.backup.json"
  chmod 600 "$release/pm2-dump.backup.json"
fi
log "Switching the portfolio only. A brief restart interruption is expected..."
switching=1
pm2_command delete "$APP_NAME"
pm2_command start "$release/ecosystem.config.cjs" --only "$APP_NAME"
health_check
pm2_command save
switching=0
log "Deployed $commit at $SITE_URL (local health check passed)."
log "NGINX/DNS/certificates were not changed. Releases remain under $DEPLOY_DIR/releases; monitor disk usage."
}

main "$@"