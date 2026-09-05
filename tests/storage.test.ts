import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { z } from "zod";
import {
  getDatabase,
  readSnapshot,
  saveSnapshot,
  withJobLock,
} from "../lib/storage/database.ts";

const directory = mkdtempSync(join(tmpdir(), "portfolio-storage-test-"));
process.env.PORTFOLIO_DB_PATH = join(directory, "test.sqlite");
after(() => {
  getDatabase().close();
  rmSync(directory, { recursive: true, force: true });
});

test("persisted snapshots validate payloads and preserve collection times", () => {
  const schema = z.object({ total: z.number() });
  const collectedAt = "2026-09-05T10:00:00.000Z";
  saveSnapshot("test", { total: 5 }, collectedAt);
  assert.deepEqual(readSnapshot("test", schema), {
    data: { total: 5 },
    collectedAt,
  });
  saveSnapshot("test", { total: "invalid" }, collectedAt);
  assert.equal(readSnapshot("test", schema), null);
});
test("overlapping refresh jobs do not acquire the same lease", async () => {
  let calls = 0;
  await withJobLock("test-job", async () => {
    calls++;
    await withJobLock("test-job", async () => {
      calls++;
    });
  });
  assert.equal(calls, 1);
  await withJobLock("test-job", async () => {
    calls++;
  });
  assert.equal(calls, 2);
});
