import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAME_INTERVAL,
  MAX_PIXEL_RATIO,
  SceneQualityMonitor,
  initialSceneQuality,
  nextFrameDeadline,
  sceneBudget,
  type SceneQuality,
} from "../lib/visuals/scene-performance.ts";

test("scene starts conservatively on mobile and lower capability devices", () => {
  assert.equal(
    initialSceneQuality({
      width: 390,
      coarsePointer: true,
      cores: 4,
      memory: 2,
    }),
    1,
  );
  assert.equal(
    initialSceneQuality({ width: 1440, coarsePointer: false, cores: 4 }),
    1,
  );
  assert.equal(
    initialSceneQuality({
      width: 1440,
      coarsePointer: false,
      cores: 8,
      memory: 8,
    }),
    0,
  );
});

test("scene bounds fragment and vertex work independently of device pixel ratio", () => {
  const mobile = sceneBudget(390, 844, 3, 1);
  assert.ok(390 * 844 * mobile.ratio ** 2 <= 180_001);
  assert.equal(mobile.vertices, 1050);
  assert.ok(mobile.vertices <= mobile.vertexLimit);

  const lowest = sceneBudget(1920, 1080, 3, 2);
  assert.ok(1920 * 1080 * lowest.ratio ** 2 <= 90_001);
  assert.equal(lowest.vertices, 297);
  assert.ok(lowest.vertices <= lowest.vertexLimit);

  const desktop = sceneBudget(1440, 900, 1, 0);
  assert.ok(1440 * 900 * desktop.ratio ** 2 <= 800_001);
  assert.equal(desktop.vertices, 2880);
  assert.ok(desktop.vertices <= desktop.vertexLimit);
});

test("pixel ratio never exceeds the hard ceiling on high density displays", () => {
  for (const quality of [0, 1, 2, 3] as SceneQuality[]) {
    const budget = sceneBudget(360, 640, 4, quality);
    assert.ok(budget.ratio <= MAX_PIXEL_RATIO);
    assert.ok(budget.ratio <= (quality === 0 ? 1 : 0.75));
  }
});

test("expensive material features are reserved for the top tier and shadows stay off", () => {
  assert.equal(sceneBudget(1440, 900, 1, 0).transmission, true);
  assert.equal(sceneBudget(1440, 900, 1, 0).transmissionResolutionScale, 0.5);
  for (const quality of [1, 2, 3] as SceneQuality[]) {
    const budget = sceneBudget(390, 844, 2, quality);
    assert.equal(budget.transmission, false);
  }
  for (const quality of [0, 1, 2, 3] as SceneQuality[])
    assert.equal(sceneBudget(390, 844, 2, quality).shadows, false);
});

test("the lowest tier drops the wireframe accent entirely", () => {
  assert.ok(sceneBudget(1440, 900, 1, 0).accentTubularSegments > 0);
  assert.equal(sceneBudget(390, 844, 2, 2).accentTubularSegments, 0);
});

test("frame scheduling keeps 60 Hz cadence without losing time or catch-up bursts", () => {
  assert.equal(nextFrameDeadline(0, 0), FRAME_INTERVAL);
  const next = nextFrameDeadline(FRAME_INTERVAL, 101);
  assert.ok(next > 101 && next <= 101 + FRAME_INTERVAL);
  let deadline = 0;
  let draws = 0;
  // A 120 Hz display must still only produce about 60 scene frames per second.
  for (let frame = 0; frame < 240; frame++) {
    const now = (frame * 1000) / 120;
    if (now + 0.5 >= deadline) {
      draws++;
      deadline = nextFrameDeadline(deadline, now);
    }
  }
  assert.ok(draws >= 119 && draws <= 121);
});

test("quality adapts only to sustained pressure and never oscillates upward", () => {
  const monitor = new SceneQualityMonitor();
  let quality: SceneQuality = 1;
  for (let index = 0; index < 300; index++)
    quality = monitor.observe(FRAME_INTERVAL, quality);
  assert.equal(quality, 1);
  for (let index = 0; index < 80; index++)
    quality = monitor.observe(1000 / 30, quality);
  assert.equal(quality, 1);
  for (let index = 0; index < 80; index++)
    quality = monitor.observe(1000 / 30, quality);
  assert.equal(quality, 2);
  for (let index = 0; index < 160; index++)
    quality = monitor.observe(1000 / 30, quality);
  assert.equal(quality, 3);
  monitor.reset();
  assert.equal(monitor.observe(1000, 1), 1);
});

test("severely slow visible frames still reduce quality and a pause reset discards earlier pressure", () => {
  const monitor = new SceneQualityMonitor();
  let quality: SceneQuality = 1;
  for (let index = 0; index < 10; index++)
    quality = monitor.observe(500, quality);
  assert.equal(quality, 2);
  for (let index = 0; index < 5; index++)
    quality = monitor.observe(500, quality);
  monitor.reset();
  for (let index = 0; index < 300; index++)
    quality = monitor.observe(FRAME_INTERVAL, quality);
  assert.equal(quality, 2);
});
