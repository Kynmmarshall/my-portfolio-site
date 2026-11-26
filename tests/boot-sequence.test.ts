import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOOT_MAX_MS,
  BOOT_MIN_MS,
  BOOT_STEPS,
  BOOT_TICK_MS,
  WAITING_CEILING,
  bootProgress,
  reachedSteps,
} from "../lib/visuals/boot-sequence.ts";

test("the splash always plays for its minimum time, even when the scene is instant", () => {
  assert.equal(bootProgress(0, "ready"), 0);
  assert.ok(bootProgress(BOOT_MIN_MS / 2, "ready") < 100);
  assert.equal(bootProgress(BOOT_MIN_MS, "ready"), 100);
});

test("it waits for the scene instead of faking completion", () => {
  assert.equal(bootProgress(BOOT_MIN_MS, "preparing"), WAITING_CEILING);
  assert.equal(bootProgress(BOOT_MAX_MS - 1, "idle"), WAITING_CEILING);
});

test("a failed scene still lets the page through", () => {
  assert.equal(bootProgress(BOOT_MIN_MS, "failed"), 100);
});

test("a missing or slow scene can never trap the visitor", () => {
  for (const phase of ["idle", "preparing"] as const)
    assert.equal(bootProgress(BOOT_MAX_MS, phase), 100);
  assert.equal(bootProgress(60_000, "idle"), 100);
});

test("progress never goes backwards over time", () => {
  for (const phase of ["idle", "preparing", "ready", "failed"] as const) {
    let previous = -1;
    for (let elapsed = 0; elapsed <= BOOT_MAX_MS + 500; elapsed += 50) {
      const value = bootProgress(elapsed, phase);
      assert.ok(value >= previous && value >= 0 && value <= 100);
      previous = value;
    }
  }
});

test("a stalled main thread stretches the sequence instead of skipping it", () => {
  // Real time races ahead of the splash's own clock, but pacing stays virtual.
  assert.ok(bootProgress(BOOT_TICK_MS, "ready", 5_000) < 10);
  assert.equal(bootProgress(BOOT_MIN_MS, "idle", BOOT_MAX_MS), 100);
  assert.equal(bootProgress(BOOT_MIN_MS, "idle", 200), WAITING_CEILING);
});

test("steps appear in order and all of them show by the end", () => {
  assert.equal(reachedSteps(0).length, 1);
  assert.equal(reachedSteps(100).length, BOOT_STEPS.length);
  for (let index = 1; index < BOOT_STEPS.length; index++)
    assert.ok(BOOT_STEPS[index].at > BOOT_STEPS[index - 1].at);
  assert.ok(BOOT_STEPS[BOOT_STEPS.length - 1].at <= WAITING_CEILING);
});
