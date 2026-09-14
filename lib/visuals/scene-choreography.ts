/**
 * Scroll-to-scene choreography.
 *
 * Pure module so the mapping from scroll depth to camera/mesh/material values can
 * be asserted without a browser, a GPU or GSAP.
 */

export type SceneKey =
  | "hero"
  | "work"
  | "insights"
  | "about"
  | "contact"
  | "collection"
  | "detail"
  | "expertise"
  | "analytics"
  | "reading";

export type ScenePose = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  targetX: number;
  targetY: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  morph: number;
  transmission: number;
  accent: number;
  presence: number;
};

/** Every field is interpolated, so the list is explicit rather than derived at runtime. */
const POSE_FIELDS = [
  "cameraX",
  "cameraY",
  "cameraZ",
  "targetX",
  "targetY",
  "positionX",
  "positionY",
  "positionZ",
  "rotationX",
  "rotationY",
  "rotationZ",
  "scale",
  "morph",
  "transmission",
  "accent",
  "presence",
] as const satisfies readonly (keyof ScenePose)[];

const BASE_POSE: ScenePose = {
  cameraX: 0,
  cameraY: 0,
  cameraZ: 9,
  targetX: 0,
  targetY: 0,
  positionX: 3.9,
  positionY: 0.35,
  positionZ: -0.5,
  rotationX: 0.2,
  rotationY: 0.4,
  rotationZ: -0.1,
  scale: 1,
  morph: 0.25,
  transmission: 1,
  accent: 0.5,
  presence: 1,
};

export function createScenePose(): ScenePose {
  return { ...BASE_POSE };
}

/**
 * Section poses. Rotation increases monotonically across a route so the sculpture
 * keeps turning the same way instead of unwinding between sections, and every
 * pose stays in the right margin, which is the part of the backdrop that the
 * readability scrim leaves visible.
 */
const POSES: Record<SceneKey, ScenePose> = {
  hero: { ...BASE_POSE },
  work: {
    ...BASE_POSE,
    cameraX: 0.3,
    cameraY: -0.12,
    cameraZ: 9.6,
    positionX: 3.3,
    positionY: -0.65,
    positionZ: -1.4,
    rotationX: 0.62,
    rotationY: 1.55,
    rotationZ: 0.18,
    scale: 0.8,
    morph: 0.58,
    transmission: 0.82,
    accent: 0.34,
  },
  insights: {
    ...BASE_POSE,
    cameraX: -0.25,
    cameraY: 0.18,
    cameraZ: 10.4,
    positionX: 4.05,
    positionY: 0.85,
    positionZ: -2.4,
    rotationX: 0.95,
    rotationY: 2.45,
    rotationZ: 0.32,
    scale: 0.6,
    morph: 0.3,
    transmission: 0.5,
    accent: 0.2,
    presence: 0.7,
  },
  about: {
    ...BASE_POSE,
    cameraX: 0.18,
    cameraY: 0.1,
    cameraZ: 9.2,
    positionX: 3.05,
    positionY: 0.25,
    positionZ: -0.9,
    rotationX: 1.25,
    rotationY: 3.25,
    rotationZ: -0.2,
    scale: 0.86,
    morph: 0.72,
    transmission: 0.92,
    accent: 0.42,
  },
  contact: {
    ...BASE_POSE,
    cameraX: 0,
    cameraY: -0.05,
    cameraZ: 8.4,
    positionX: 3.6,
    positionY: -0.3,
    positionZ: 0.4,
    rotationX: 1.5,
    rotationY: 4.15,
    rotationZ: 0.08,
    scale: 1.02,
    morph: 0.36,
    transmission: 1,
    accent: 0.62,
  },
  collection: {
    ...BASE_POSE,
    cameraZ: 10,
    positionX: 3.8,
    positionY: 0.5,
    positionZ: -1.8,
    rotationX: 0.5,
    rotationY: 1.1,
    scale: 0.72,
    morph: 0.4,
    transmission: 0.7,
    accent: 0.28,
    presence: 0.75,
  },
  detail: {
    ...BASE_POSE,
    cameraZ: 10.8,
    positionX: 4.1,
    positionY: 0.6,
    positionZ: -2.6,
    rotationX: 0.8,
    rotationY: 2.1,
    scale: 0.58,
    morph: 0.5,
    transmission: 0.45,
    accent: 0.18,
    presence: 0.55,
  },
  expertise: {
    ...BASE_POSE,
    cameraZ: 9.8,
    positionX: 3.5,
    positionY: -0.35,
    positionZ: -1.4,
    rotationX: 0.7,
    rotationY: 1.8,
    scale: 0.78,
    morph: 0.62,
    transmission: 0.75,
    accent: 0.55,
    presence: 0.8,
  },
  analytics: {
    ...BASE_POSE,
    cameraZ: 11,
    positionX: 4.2,
    positionY: 0.75,
    positionZ: -3,
    rotationX: 1,
    rotationY: 2.6,
    scale: 0.55,
    morph: 0.28,
    transmission: 0.4,
    accent: 0.16,
    presence: 0.5,
  },
  reading: {
    ...BASE_POSE,
    positionX: 4.4,
    positionY: 0.4,
    positionZ: -3.5,
    scale: 0.45,
    morph: 0.2,
    transmission: 0.3,
    accent: 0.12,
    presence: 0.35,
  },
};

export type SceneSection = { key: SceneKey; top: number; height: number };
export type SceneStop = { key: SceneKey; at: number; pose: ScenePose };

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * Maps measured section boxes onto normalized scroll progress. `at` is the
 * progress at which a section sits in the middle of the viewport, so the pose
 * peaks while the section is actually being read.
 */
export function resolveStops(
  sections: SceneSection[],
  scrollRange: number,
  viewportHeight: number,
): SceneStop[] {
  const usable = sections.filter(
    (section) => POSES[section.key] !== undefined && section.height >= 0,
  );
  if (usable.length === 0) return [];
  // A page that does not scroll still needs a single deterministic pose.
  if (!Number.isFinite(scrollRange) || scrollRange <= 0)
    return [{ key: usable[0].key, at: 0, pose: POSES[usable[0].key] }];

  const stops = usable
    .map((section) => ({
      key: section.key,
      at: clamp01(
        (section.top + section.height / 2 - viewportHeight / 2) / scrollRange,
      ),
      pose: POSES[section.key],
    }))
    .sort((first, second) => first.at - second.at);

  // Keep `at` strictly increasing so interpolation never divides by zero.
  for (let index = 1; index < stops.length; index++)
    if (stops[index].at <= stops[index - 1].at)
      stops[index] = {
        ...stops[index],
        at: Math.min(1, stops[index - 1].at + 0.0001),
      };
  return stops;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Writes the interpolated pose into `target` in place; no allocation per frame. */
export function applyPoseAtProgress(
  target: ScenePose,
  stops: SceneStop[],
  progress: number,
): ScenePose {
  if (stops.length === 0) return target;
  const position = clamp01(progress);
  if (stops.length === 1 || position <= stops[0].at) {
    for (const field of POSE_FIELDS) target[field] = stops[0].pose[field];
    return target;
  }
  const last = stops[stops.length - 1];
  if (position >= last.at) {
    for (const field of POSE_FIELDS) target[field] = last.pose[field];
    return target;
  }
  let index = 0;
  while (index < stops.length - 2 && position > stops[index + 1].at) index++;
  const from = stops[index];
  const to = stops[index + 1];
  const blend = smoothstep((position - from.at) / (to.at - from.at));
  for (const field of POSE_FIELDS)
    target[field] =
      from.pose[field] + (to.pose[field] - from.pose[field]) * blend;
  return target;
}
