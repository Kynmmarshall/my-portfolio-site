import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPoseAtProgress,
  createScenePose,
  resolveStops,
  type SceneKey,
  type SceneSection,
} from "../lib/visuals/scene-choreography.ts";

const home: SceneSection[] = [
  { key: "hero", top: 0, height: 800 },
  { key: "work", top: 800, height: 800 },
  { key: "contact", top: 1600, height: 800 },
];

const near = (actual: number, expected: number) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `expected ${actual} to be within 1e-9 of ${expected}`,
  );

test("stops sit where a section is centred in the viewport", () => {
  const stops = resolveStops(home, 1600, 800);
  assert.deepEqual(
    stops.map((stop) => stop.key),
    ["hero", "work", "contact"],
  );
  assert.equal(stops[0].at, 0);
  assert.equal(stops[1].at, 0.5);
  assert.equal(stops[2].at, 1);
});

test("a page that cannot scroll still resolves one deterministic pose", () => {
  const stops = resolveStops([{ key: "reading", top: 0, height: 400 }], 0, 800);
  assert.equal(stops.length, 1);
  assert.equal(stops[0].at, 0);
  const pose = applyPoseAtProgress(createScenePose(), stops, 0.7);
  assert.equal(pose.presence, stops[0].pose.presence);
});

test("unknown markers are ignored instead of breaking the timeline", () => {
  const stops = resolveStops(
    [
      { key: "nonsense" as SceneKey, top: 0, height: 100 },
      { key: "about", top: 200, height: 400 },
    ],
    1000,
    800,
  );
  assert.deepEqual(
    stops.map((stop) => stop.key),
    ["about"],
  );
});

test("stop positions stay strictly increasing so interpolation cannot divide by zero", () => {
  const stops = resolveStops(
    [
      { key: "hero", top: 0, height: 0 },
      { key: "work", top: 0, height: 0 },
      { key: "about", top: 0, height: 0 },
    ],
    1000,
    0,
  );
  for (let index = 1; index < stops.length; index++)
    assert.ok(stops[index].at > stops[index - 1].at);
});

test("progress maps onto section poses and interpolates between them", () => {
  const stops = resolveStops(home, 1600, 800);
  const pose = createScenePose();

  applyPoseAtProgress(pose, stops, 0);
  near(pose.positionX, stops[0].pose.positionX);

  applyPoseAtProgress(pose, stops, 0.5);
  near(pose.positionX, stops[1].pose.positionX);

  applyPoseAtProgress(pose, stops, 1);
  near(pose.positionX, stops[2].pose.positionX);

  applyPoseAtProgress(pose, stops, 0.25);
  const low = Math.min(stops[0].pose.rotationY, stops[1].pose.rotationY);
  const high = Math.max(stops[0].pose.rotationY, stops[1].pose.rotationY);
  assert.ok(pose.rotationY > low && pose.rotationY < high);
});

test("out of range progress clamps to the end poses and reuses the same object", () => {
  const stops = resolveStops(home, 1600, 800);
  const pose = createScenePose();
  assert.equal(applyPoseAtProgress(pose, stops, -5), pose);
  near(pose.positionX, stops[0].pose.positionX);
  applyPoseAtProgress(pose, stops, 5);
  near(pose.positionX, stops[2].pose.positionX);
});

test("interior routes stay calmer than the homepage hero", () => {
  const hero = resolveStops([{ key: "hero", top: 0, height: 100 }], 0, 800)[0];
  for (const key of ["detail", "analytics", "reading"] as SceneKey[]) {
    const stop = resolveStops([{ key, top: 0, height: 100 }], 0, 800)[0];
    assert.ok(stop.pose.presence < hero.pose.presence);
    assert.ok(stop.pose.scale < hero.pose.scale);
  }
});
