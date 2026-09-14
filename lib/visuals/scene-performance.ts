/**
 * Hardware budget policy for the WebGL scenes.
 *
 * Pure module: no Three.js, DOM or React imports, so the thresholds stay unit
 * testable and the renderers cannot drift from the documented limits.
 */

export const FRAME_INTERVAL = 1000 / 60;
export const QUALITY_WINDOW_MS = 2500;

/** Hard ceiling for high-density displays, independent of the per-tier ceiling. */
export const MAX_PIXEL_RATIO = 2;

export type SceneQuality = 0 | 1 | 2 | 3;

const PIXEL_LIMITS = [800_000, 180_000, 90_000, 90_000] as const;
const RATIO_CEILINGS = [1, 0.75, 0.75, 0.75] as const;

/** TorusKnot [tubular, radial] subdivisions per tier. */
const KNOT_SEGMENTS = [
  [96, 24],
  [64, 12],
  [32, 8],
  [32, 8],
] as const;

/** Wireframe accent subdivisions; zero disables the accent entirely. */
const ACCENT_SEGMENTS = [
  [64, 6],
  [40, 4],
  [0, 0],
  [0, 0],
] as const;

const VERTEX_LIMITS = [3185, 1271, 475, 475] as const;

const gridVertices = (tubular: number, radial: number) =>
  tubular > 0 && radial > 0 ? (tubular + 1) * (radial + 1) : 0;

export function initialSceneQuality({
  width,
  coarsePointer,
  cores,
  memory,
}: {
  width: number;
  coarsePointer: boolean;
  cores?: number;
  memory?: number;
}): SceneQuality {
  return width < 768 ||
    coarsePointer ||
    (cores !== undefined && cores <= 4) ||
    (memory !== undefined && memory <= 4)
    ? 1
    : 0;
}

export function sceneBudget(
  width: number,
  height: number,
  deviceRatio: number,
  quality: SceneQuality,
) {
  const [tubularSegments, radialSegments] = KNOT_SEGMENTS[quality];
  const [accentTubularSegments, accentRadialSegments] = ACCENT_SEGMENTS[quality];
  const ratio = Math.min(
    deviceRatio || 1,
    MAX_PIXEL_RATIO,
    RATIO_CEILINGS[quality],
    Math.sqrt(PIXEL_LIMITS[quality] / Math.max(1, width * height)),
  );
  return {
    ratio,
    tubularSegments,
    radialSegments,
    accentTubularSegments,
    accentRadialSegments,
    vertices:
      gridVertices(tubularSegments, radialSegments) +
      gridVertices(accentTubularSegments, accentRadialSegments),
    vertexLimit: VERTEX_LIMITS[quality],
    // Physical transmission needs an extra scene pass, so only the top tier pays for it.
    transmission: quality === 0,
    transmissionResolutionScale: 0.5,
    shadows: false,
  };
}

export function nextFrameDeadline(deadline: number, now: number) {
  return (
    deadline +
    (Math.floor(Math.max(0, now - deadline) / FRAME_INTERVAL) + 1) *
      FRAME_INTERVAL
  );
}

/**
 * Demotes quality only after sustained pressure, and never promotes again during
 * a mount so a struggling GPU is not repeatedly reloaded.
 */
export class SceneQualityMonitor {
  private elapsed = 0;
  private frames = 0;
  private missed = 0;
  private slowWindows = 0;

  reset() {
    this.elapsed = 0;
    this.frames = 0;
    this.missed = 0;
    this.slowWindows = 0;
  }

  observe(interval: number, quality: SceneQuality): SceneQuality {
    if (!Number.isFinite(interval) || interval <= 0 || quality === 3)
      return quality;
    this.elapsed += Math.min(interval, QUALITY_WINDOW_MS);
    this.frames++;
    if (interval > FRAME_INTERVAL * 1.45) this.missed++;
    if (this.elapsed < QUALITY_WINDOW_MS) return quality;
    const overloaded =
      this.elapsed / this.frames > 20 || this.missed / this.frames > 0.15;
    this.slowWindows = overloaded ? this.slowWindows + 1 : 0;
    this.elapsed = 0;
    this.frames = 0;
    this.missed = 0;
    if (this.slowWindows < 2) return quality;
    this.slowWindows = 0;
    return Math.min(3, quality + 1) as SceneQuality;
  }
}
