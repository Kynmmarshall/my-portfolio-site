import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const bash =
  process.platform === "win32"
    ? "C:\\Program Files\\Git\\bin\\bash.exe"
    : "bash";

for (const scenario of [
  "success",
  "dirty",
  "diverged",
  "locked",
  "install-failure",
  "test-failure",
  "build-failure",
  "start-failure",
  "health-failure",
]) {
  test(`VPS updater: ${scenario}`, () => {
    const result = spawnSync(
      bash,
      ["tests/fixtures/update-script.sh", scenario],
      {
        encoding: "utf8",
        timeout: 60000,
      },
    );
    assert.equal(
      result.status,
      0,
      `${result.error ?? ""}\n${result.stdout}\n${result.stderr}`,
    );
  });
}
