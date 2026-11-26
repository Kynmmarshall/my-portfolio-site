import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAME_INTERVAL,
  MAX_AUTO_QUALITY,
  MAX_PIXEL_RATIO,
  MAX_RECOVERIES,
  QUALITY_WINDOW_MS,
  RECOVERY_WINDOWS,
  STALL_MS,
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
  assert.equal(mobile.vertices, 20_878);
  assert.ok(mobile.vertices <= mobile.vertexLimit);

  const lowest = sceneBudget(1920, 1080, 3, 2);
  assert.ok(1920 * 1080 * lowest.ratio ** 2 <= 90_001);
  assert.equal(lowest.vertices, 13_373);
  assert.ok(lowest.vertices <= lowest.vertexLimit);

  const desktop = sceneBudget(1440, 900, 1, 0);
  assert.ok(1440 * 900 * desktop.ratio ** 2 <= 800_001);
  assert.equal(desktop.vertices, 33_831);
  assert.ok(desktop.vertices <= desktop.vertexLimit);
});

test("pixel ratio never exceeds the hard ceiling on high density displays", () => {
  for (const quality of [0, 1, 2, 3] as SceneQuality[]) {
    const budget = sceneBudget(360, 640, 4, quality);
    assert.ok(budget.ratio <= MAX_PIXEL_RATIO);
    assert.ok(budget.ratio <= (quality === 0 ? 1 : 0.75));
  }
});

test("reflections are reserved for the top tier, shadows stay off and draws stay few", () => {
  assert.equal(sceneBudget(1440, 900, 1, 0).reflections, true);
  for (const quality of [1, 2, 3] as SceneQuality[])
    assert.equal(sceneBudget(390, 844, 2, quality).reflections, false);
  for (const quality of [0, 1, 2, 3] as SceneQuality[]) {
    const budget = sceneBudget(390, 844, 2, quality);
    assert.equal(budget.shadows, false);
    assert.ok(budget.drawCalls <= 12);
    assert.ok(budget.maxDrawCount <= budget.drawCountLimit);
  }
});

test("lower tiers shed geometry detail and legend resolution", () => {
  const top = sceneBudget(1440, 900, 1, 0);
  const bottom = sceneBudget(390, 844, 2, 2);
  assert.ok(bottom.vertices < top.vertices);
  assert.ok(bottom.detail.keyCorner < top.detail.keyCorner);
  assert.ok(bottom.detail.legendTile < top.detail.legendTile);
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

const feed = (
  monitor: SceneQualityMonitor,
  quality: SceneQuality,
  frames: number,
  interval: number,
) => {
  for (let index = 0; index < frames; index++)
    quality = monitor.observe(interval, quality);
  return quality;
};
/** Frames needed to fill one measurement window at a given interval. */
const framesPerWindow = (interval: number) =>
  Math.ceil(QUALITY_WINDOW_MS / interval) + 1;

test("quality drops only after two consecutive slow windows and never freezes on its own", () => {
  const monitor = new SceneQualityMonitor();
  let quality: SceneQuality = 1;
  quality = feed(monitor, quality, 300, FRAME_INTERVAL);
  assert.equal(quality, 1);
  quality = feed(monitor, quality, framesPerWindow(1000 / 30), 1000 / 30);
  assert.equal(quality, 1);
  quality = feed(monitor, quality, framesPerWindow(1000 / 30), 1000 / 30);
  assert.equal(quality, 2);
  // Sustained pressure stops at the lowest live tier; the frozen tier is never automatic.
  quality = feed(monitor, quality, 600, 1000 / 30);
  assert.equal(quality, MAX_AUTO_QUALITY);
  assert.equal(quality, 2);
});

test("throttled, covered or backgrounded frames are ignored instead of degrading the scene", () => {
  const monitor = new SceneQualityMonitor();
  // An idle window gets about one frame per second from the browser, for minutes.
  let quality = feed(monitor, 0, 600, 1000);
  assert.equal(quality, 0);
  quality = feed(monitor, quality, 40, STALL_MS);
  assert.equal(quality, 0);
  // A single long gap between two slow windows breaks the "consecutive" requirement.
  quality = feed(monitor, quality, framesPerWindow(1000 / 30), 1000 / 30);
  quality = monitor.observe(120_000, quality);
  quality = feed(monitor, quality, framesPerWindow(1000 / 30), 1000 / 30);
  assert.equal(quality, 0);
  // Coming back to a healthy page leaves quality where it was.
  quality = feed(monitor, quality, 600, FRAME_INTERVAL);
  assert.equal(quality, 0);
});

test("genuinely slow visible frames still reduce quality, and a reset discards earlier pressure", () => {
  const monitor = new SceneQualityMonitor();
  let quality: SceneQuality = 1;
  quality = feed(monitor, quality, 10, 500);
  assert.equal(quality, 2);
  quality = feed(monitor, quality, 5, 500);
  monitor.reset();
  quality = feed(monitor, quality, 300, FRAME_INTERVAL);
  assert.equal(quality, 2);
});

test("quality is won back after a sustained healthy stretch, never above where it started", () => {
  const monitor = new SceneQualityMonitor();
  const healthyStretch = Math.ceil((RECOVERY_WINDOWS * QUALITY_WINDOW_MS) / FRAME_INTERVAL) + 150;
  let quality: SceneQuality = 1;
  quality = feed(monitor, quality, 20, 1000 / 20);
  assert.equal(quality, 1);
  quality = feed(monitor, quality, framesPerWindow(1000 / 30) * 2, 1000 / 30);
  assert.equal(quality, 2);
  // A short healthy stretch is not enough.
  quality = feed(monitor, quality, 300, FRAME_INTERVAL);
  assert.equal(quality, 2);
  quality = feed(monitor, quality, healthyStretch, FRAME_INTERVAL);
  assert.equal(quality, 1);
  // It started at tier 1, so tier 0 is never reached however long it runs well.
  quality = feed(monitor, quality, healthyStretch * 2, FRAME_INTERVAL);
  assert.equal(quality, 1);
});

test("a marginal GPU cannot flap between tiers forever", () => {
  const monitor = new SceneQualityMonitor();
  const healthyStretch = Math.ceil((RECOVERY_WINDOWS * QUALITY_WINDOW_MS) / FRAME_INTERVAL) + 150;
  let quality: SceneQuality = 0;
  let promotions = 0;
  for (let cycle = 0; cycle < 8; cycle++) {
    const before = quality;
    quality = feed(monitor, quality, framesPerWindow(1000 / 30) * 2, 1000 / 30);
    const lowered = quality;
    quality = feed(monitor, quality, healthyStretch, FRAME_INTERVAL);
    if (quality < lowered) promotions++;
    assert.ok(quality >= 0 && quality <= MAX_AUTO_QUALITY, `cycle ${cycle} from ${before}`);
  }
  assert.ok(promotions <= MAX_RECOVERIES, `${promotions} recoveries`);
});
