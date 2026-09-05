import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAME_INTERVAL,
  TerrainQualityMonitor,
  initialTerrainQuality,
  nextFrameDeadline,
  terrainBudget,
} from "../lib/visuals/terrain-performance.ts";

test("terrain starts conservatively on mobile and lower capability devices", () => {
  assert.equal(
    initialTerrainQuality({
      width: 390,
      coarsePointer: true,
      cores: 4,
      memory: 2,
    }),
    1,
  );
  assert.equal(
    initialTerrainQuality({ width: 1440, coarsePointer: false, cores: 4 }),
    1,
  );
  assert.equal(
    initialTerrainQuality({
      width: 1440,
      coarsePointer: false,
      cores: 8,
      memory: 8,
    }),
    0,
  );
});

test("terrain bounds mobile fragment and vertex work independently of DPR", () => {
  const mobile = terrainBudget(390, 844, 3, 1);
  assert.ok(390 * 844 * mobile.ratio ** 2 <= 180_001);
  assert.equal((mobile.widthSegments + 1) * (mobile.heightSegments + 1), 1271);
  const lowest = terrainBudget(1920, 1080, 3, 2);
  assert.ok(1920 * 1080 * lowest.ratio ** 2 <= 90_001);
  assert.equal((lowest.widthSegments + 1) * (lowest.heightSegments + 1), 475);
});

test("frame scheduling keeps 60 Hz cadence without losing time or catch-up bursts", () => {
  assert.equal(nextFrameDeadline(0, 0), FRAME_INTERVAL);
  const next = nextFrameDeadline(FRAME_INTERVAL, 101);
  assert.ok(next > 101 && next <= 101 + FRAME_INTERVAL);
  let deadline = 0;
  let draws = 0;
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
  const monitor = new TerrainQualityMonitor();
  let quality: 0 | 1 | 2 | 3 = 1;
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
  const monitor = new TerrainQualityMonitor();
  let quality: 0 | 1 | 2 | 3 = 1;
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
