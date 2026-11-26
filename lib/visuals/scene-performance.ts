/**
 * Hardware budget policy for the WebGL scenes.
 *
 * Pure module: no Three.js, DOM or React imports, so the thresholds stay unit
 * testable and the renderers cannot drift from the documented limits.
 */

import { keyboardStats, type KeyboardDetail } from "./keyboard-layout.ts";

export const FRAME_INTERVAL = 1000 / 60;
export const QUALITY_WINDOW_MS = 2500;

/** Hard ceiling for high-density displays, independent of the per-tier ceiling. */
export const MAX_PIXEL_RATIO = 2;

export type SceneQuality = 0 | 1 | 2 | 3;

const PIXEL_LIMITS = [800_000, 180_000, 90_000, 90_000] as const;
const RATIO_CEILINGS = [1, 0.75, 0.75, 0.75] as const;

/** Geometry subdivision per tier; the lowest two tiers use sharp boxes. */
const DETAIL = [
  { keyCorner: 2, caseCorner: 2, tubular: 40, tube: 6, legendTile: 96 },
  { keyCorner: 1, caseCorner: 1, tubular: 28, tube: 5, legendTile: 64 },
  { keyCorner: 0, caseCorner: 0, tubular: 16, tube: 4, legendTile: 48 },
  { keyCorner: 0, caseCorner: 0, tubular: 16, tube: 4, legendTile: 48 },
] as const satisfies readonly KeyboardDetail[];

/** Ceilings on rendered vertices and on the largest single draw's element count. */
const VERTEX_LIMITS = [34_000, 21_000, 13_500, 13_500] as const;
const DRAW_COUNT_LIMITS = [5_100, 5_100, 5_100, 5_100] as const;

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
  const detail = DETAIL[quality];
  const stats = keyboardStats(detail);
  const ratio = Math.min(
    deviceRatio || 1,
    MAX_PIXEL_RATIO,
    RATIO_CEILINGS[quality],
    Math.sqrt(PIXEL_LIMITS[quality] / Math.max(1, width * height)),
  );
  return {
    ratio,
    detail,
    vertices: stats.vertices,
    vertexLimit: VERTEX_LIMITS[quality],
    maxDrawCount: stats.maxDrawCount,
    drawCountLimit: DRAW_COUNT_LIMITS[quality],
    drawCalls: stats.drawCalls,
    // Studio reflections cost an extra render of the environment, so only the top tier pays.
    reflections: quality === 0,
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
 * An interval this long is a throttled, covered or backgrounded page, not a slow
 * GPU. Browsers drop animation frames to about one per second for idle windows,
 * so such frames say nothing about rendering cost and must never demote quality.
 */
export const STALL_MS = 750;
/** Automatic demotion stops here. The frozen tier is never chosen automatically. */
export const MAX_AUTO_QUALITY: SceneQuality = 2;
/** Consecutive healthy windows (15 seconds) before one tier is won back. */
export const RECOVERY_WINDOWS = 6;
/** Tiers that may be won back in one mount, so a marginal GPU cannot flap forever. */
export const MAX_RECOVERIES = 3;

/**
 * Demotes quality only after sustained pressure on a page that is actually being
 * drawn, and wins it back after a sustained healthy stretch (never above the tier
 * the mount started at). Stalled intervals are discarded, so idling, switching
 * windows or a sleeping laptop cannot degrade the scene.
 */
export class SceneQualityMonitor {
  private elapsed = 0;
  private frames = 0;
  private missed = 0;
  private slowWindows = 0;
  private healthyWindows = 0;
  private best: SceneQuality | null = null;
  private recoveries = 0;

  /** Drops the window being measured; used on pause, resume and focus changes. */
  reset() {
    this.elapsed = 0;
    this.frames = 0;
    this.missed = 0;
    this.slowWindows = 0;
    this.healthyWindows = 0;
  }

  observe(interval: number, quality: SceneQuality): SceneQuality {
    if (!Number.isFinite(interval) || interval <= 0) return quality;
    if (this.best === null) this.best = quality;
    if (interval >= STALL_MS) {
      this.reset();
      return quality;
    }
    this.elapsed += interval;
    this.frames++;
    if (interval > FRAME_INTERVAL * 1.45) this.missed++;
    if (this.elapsed < QUALITY_WINDOW_MS) return quality;

    const average = this.elapsed / this.frames;
    const missedShare = this.missed / this.frames;
    const overloaded = average > 20 || missedShare > 0.15;
    const healthy = !overloaded && average <= 18.5 && missedShare <= 0.05;
    this.slowWindows = overloaded ? this.slowWindows + 1 : 0;
    this.healthyWindows = healthy ? this.healthyWindows + 1 : 0;
    this.elapsed = 0;
    this.frames = 0;
    this.missed = 0;

    if (this.slowWindows >= 2 && quality < MAX_AUTO_QUALITY) {
      this.slowWindows = 0;
      this.healthyWindows = 0;
      return (quality + 1) as SceneQuality;
    }
    if (
      this.healthyWindows >= RECOVERY_WINDOWS &&
      quality > this.best &&
      this.recoveries < MAX_RECOVERIES
    ) {
      this.recoveries++;
      this.slowWindows = 0;
      this.healthyWindows = 0;
      return (quality - 1) as SceneQuality;
    }
    return quality;
  }
}
