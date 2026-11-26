/**
 * Scroll-to-scene choreography.
 *
 * Pure module so the mapping from scroll depth to keyboard framing, explode amount
 * and glow can be asserted without a browser, a GPU or GSAP.
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
  /** Pan along the keyboard's long axis: -1 is one end, 1 the other, within the room the zoom leaves. */
  panX: number;
  /** Pan along the keyboard's short axis, in the same -1 to 1 range. */
  panY: number;
  /** Magnification over the scale that just covers the viewport; never below 1. */
  zoom: number;
  /** Perspective tilt in radians; the back of the keyboard leans away. */
  tilt: number;
  /** Extra in-plane roll in radians, on top of the 90 degree turn on narrow screens. */
  roll: number;
  /** Explode amount: 0 is assembled, 1 has every layer fully apart. */
  morph: number;
  /** Continuous layer index the glow favours: 0 case, 1 board, 2 plate, 3 switches, 4 keycaps. */
  layer: number;
  accent: number;
  presence: number;
};

/** Every field is interpolated, so the list is explicit rather than derived at runtime. */
const POSE_FIELDS = [
  "panX",
  "panY",
  "zoom",
  "tilt",
  "roll",
  "morph",
  "layer",
  "accent",
  "presence",
] as const satisfies readonly (keyof ScenePose)[];

const BASE_POSE: ScenePose = {
  panX: 0.15,
  panY: 0,
  zoom: 1,
  tilt: 0.42,
  roll: 0,
  morph: 0.06,
  layer: 4,
  accent: 0.7,
  presence: 1,
};

export function createScenePose(): ScenePose {
  return { ...BASE_POSE };
}

/**
 * Section poses. The keyboard fills the viewport on every page; scrolling pans
 * across it and takes it apart a layer at a time: keycaps first, then the
 * switches and plate, then the bare board, before it comes back together at the
 * contact section. Interior routes stay assembled and dimmer.
 */
const POSES: Record<SceneKey, ScenePose> = {
  hero: { ...BASE_POSE },
  work: {
    ...BASE_POSE,
    panX: 0.55,
    panY: 0.2,
    zoom: 1.05,
    tilt: 0.5,
    roll: 0.04,
    morph: 0.4,
    layer: 4,
    accent: 0.6,
    presence: 0.9,
  },
  insights: {
    ...BASE_POSE,
    panX: -0.5,
    panY: -0.2,
    zoom: 1.15,
    tilt: 0.55,
    roll: -0.04,
    morph: 0.75,
    layer: 3,
    accent: 0.6,
    presence: 0.85,
  },
  about: {
    ...BASE_POSE,
    panX: 0.1,
    panY: 0,
    zoom: 1.1,
    tilt: 0.6,
    roll: 0.03,
    morph: 1,
    layer: 1,
    accent: 0.8,
    presence: 0.85,
  },
  contact: {
    ...BASE_POSE,
    panX: 0.7,
    panY: 0.2,
    zoom: 1.25,
    tilt: 0.4,
    roll: 0,
    morph: 0.15,
    layer: 4,
    accent: 1,
    presence: 0.95,
  },
  collection: {
    ...BASE_POSE,
    panX: 0.3,
    morph: 0.2,
    tilt: 0.45,
    accent: 0.5,
    presence: 0.8,
  },
  detail: {
    ...BASE_POSE,
    panX: -0.4,
    morph: 0.3,
    layer: 3,
    tilt: 0.5,
    accent: 0.4,
    presence: 0.65,
  },
  expertise: {
    ...BASE_POSE,
    panX: -0.2,
    zoom: 1.05,
    morph: 0.5,
    layer: 2,
    tilt: 0.5,
    accent: 0.55,
    presence: 0.75,
  },
  analytics: {
    ...BASE_POSE,
    panX: 0.4,
    morph: 0.6,
    layer: 3,
    tilt: 0.5,
    accent: 0.4,
    presence: 0.65,
  },
  reading: {
    ...BASE_POSE,
    panX: 0,
    morph: 0.1,
    tilt: 0.45,
    accent: 0.3,
    presence: 0.5,
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
