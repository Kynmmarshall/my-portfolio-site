#!/usr/bin/env bash
set -euo pipefail

scenario="$1"
updater="$PWD/update.sh"
temporary="$(mktemp -d)"
trap 'rm -rf -- "$temporary"' EXIT
export TEST_NODE="$(command -v node)"
export TEST_STATE="$temporary/state"
export TEST_EVENTS="$temporary/events"
export TEST_SCENARIO="$scenario"
export REPO_DIR="$temporary/repo"
export DEPLOY_DIR="$temporary/deployment"
export NODE_BIN="$temporary/bin/node"
export PM2_HOME="$temporary/pm2-home"
mkdir -p "$temporary/bin" "$temporary/source" "$PM2_HOME"
printf 'old' > "$TEST_STATE"
: > "$TEST_EVENTS"
printf 'saved-process-list' > "$PM2_HOME/dump.pm2"

cat > "$NODE_BIN" <<'MOCK'
#!/usr/bin/env bash
exec "$TEST_NODE" "$@"
MOCK
cat > "$temporary/bin/flock" <<'MOCK'
#!/usr/bin/env bash
[[ "$*" == '-n 9' ]]
[[ "$TEST_SCENARIO" != locked ]]
MOCK
cat > "$temporary/bin/npm" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf 'npm %s\n' "$*" >> "$TEST_EVENTS"
case "$1" in
  ci) [[ "$TEST_SCENARIO" != install-failure ]] ;;
  test) [[ "$TEST_SCENARIO" != test-failure ]] ;;
  run)
    [[ "$2" == build ]]
    [[ "$TEST_SCENARIO" != build-failure ]]
    [[ "$(cat "$TEST_STATE")" == old ]]
    [[ -f .env.local && -f .env && -d .data ]]
    if [[ "$OSTYPE" != msys* ]]; then
      [[ -L .data ]]
    fi
    [[ "$SITE_URL" == https://kynmmarshall.is-a.dev ]]
    mkdir -p .next node_modules/next/dist/bin
    printf 'test-build' > .next/BUILD_ID
    ;;
  *) exit 1 ;;
esac
MOCK
cat > "$temporary/bin/pm2" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
case "$1" in
  jlist)
    printf '[{"name":"kynmmarshall-portfolio","pm2_env":{"status":"online","exec_mode":"fork_mode","pm_cwd":"%s","pm_exec_path":"%s/node_modules/next/dist/bin/next","exec_interpreter":"%s","args":["start","-H","127.0.0.1","-p","3100"],"env":{"PRESERVED_VALUE":"test-only"}}},{"name":"unrelated-app","pm2_env":{"status":"online"}}]' "$REPO_DIR" "$REPO_DIR" "$NODE_BIN"
    ;;
  delete)
    [[ "$2" == kynmmarshall-portfolio ]]
    printf 'delete portfolio\n' >> "$TEST_EVENTS"
    printf 'none' > "$TEST_STATE"
    ;;
  start)
    [[ "$3" == --only && "$4" == kynmmarshall-portfolio ]]
    if [[ "$2" == *previous.config.cjs ]]; then
      printf 'restore portfolio\n' >> "$TEST_EVENTS"
      printf 'old' > "$TEST_STATE"
    else
      printf 'start portfolio\n' >> "$TEST_EVENTS"
      [[ "$TEST_SCENARIO" != start-failure ]]
      printf 'new' > "$TEST_STATE"
    fi
    ;;
  save) printf 'save\n' >> "$TEST_EVENTS" ;;
  *) exit 1 ;;
esac
MOCK
cat > "$temporary/bin/curl" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
[[ "${!#}" == http://127.0.0.1:3100/ ]]
[[ "$(cat "$TEST_STATE")" != none ]]
if [[ "$TEST_SCENARIO" == health-failure && "$(cat "$TEST_STATE")" == new ]]; then
  exit 22
fi
MOCK
chmod +x "$temporary/bin/"*
export PATH="$temporary/bin:$PATH"

git init --quiet --bare --initial-branch=main "$temporary/remote.git"
git -C "$temporary/source" init --quiet --initial-branch=main
git -C "$temporary/source" config user.name 'Deployment Test'
git -C "$temporary/source" config user.email 'test@example.invalid'
git -C "$temporary/source" config core.autocrlf false
cp "$updater" "$temporary/source/update.sh"
printf '.env*\n.data/\n' > "$temporary/source/.gitignore"
printf 'original\n' > "$temporary/source/version.txt"
git -C "$temporary/source" add .
git -C "$temporary/source" commit --quiet -m initial
git -C "$temporary/source" remote add origin "$temporary/remote.git"
git -C "$temporary/source" push --quiet -u origin main
git -c core.autocrlf=false clone --quiet "$temporary/remote.git" "$REPO_DIR"
git -C "$REPO_DIR" config user.name 'Deployment Test'
git -C "$REPO_DIR" config user.email 'test@example.invalid'
git -C "$REPO_DIR" config core.autocrlf false
printf 'TEST_ONLY=not-a-secret\n' > "$REPO_DIR/.env.local"
printf 'GITHUB_TOKEN=fake-test-token\n' > "$REPO_DIR/.env"
mkdir -p "$REPO_DIR/.next"
printf 'old-build' > "$REPO_DIR/.next/BUILD_ID"
printf '.next/\n' >> "$REPO_DIR/.git/info/exclude"

printf 'updated\n' > "$temporary/source/version.txt"
printf '#!/usr/bin/env bash\nexit 99\n' > "$temporary/source/update.sh"
git -C "$temporary/source" add .
git -C "$temporary/source" commit --quiet -m update
git -C "$temporary/source" push --quiet

case "$scenario" in
  dirty) printf 'local edits\n' > "$REPO_DIR/version.txt" ;;
  diverged)
    printf 'local commit\n' > "$REPO_DIR/version.txt"
    git -C "$REPO_DIR" commit --quiet -am local
    ;;
esac

result=0
bash "$REPO_DIR/update.sh" > "$temporary/output" 2>&1 || result=$?
if [[ "$scenario" == success ]]; then
  [[ "$result" == 0 ]] || { cat "$temporary/output"; exit 1; }
  [[ "$(cat "$TEST_STATE")" == new ]]
  [[ "$(cat "$REPO_DIR/version.txt")" == updated ]]
  grep -q '^save$' "$TEST_EVENTS"
  config="$(find "$DEPLOY_DIR/releases" -name ecosystem.config.cjs)"
  "$TEST_NODE" -e 'const assert=require("node:assert/strict"); const config=require(process.argv[1]); assert.equal(config.apps.length,1); assert.equal(config.apps[0].env.PRESERVED_VALUE,"test-only"); assert.equal(config.apps[0].args.at(-1),"3100");' "$config"
else
  [[ "$result" != 0 ]] || { cat "$temporary/output"; exit 1; }
  [[ "$(cat "$TEST_STATE")" == old ]]
  case "$scenario" in
    health-failure|start-failure) grep -q '^restore portfolio$' "$TEST_EVENTS" ;;
    *)
      ! grep -q '^delete ' "$TEST_EVENTS"
      case "$scenario" in
        install-failure) grep -q '^npm ci ' "$TEST_EVENTS" ;;
        test-failure) grep -q '^npm test$' "$TEST_EVENTS" ;;
        build-failure) grep -q '^npm run build$' "$TEST_EVENTS" ;;
        dirty) grep -q 'checkout has local changes' "$temporary/output" ;;
        diverged) grep -q 'ahead of or diverge' "$temporary/output" ;;
        locked) grep -q 'Another update' "$temporary/output" ;;
      esac
      ;;
  esac
fi
[[ "$(cat "$REPO_DIR/.next/BUILD_ID")" == old-build ]]
printf '%s passed\n' "$scenario"