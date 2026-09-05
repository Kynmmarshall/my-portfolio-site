export const FRAME_INTERVAL = 1000 / 60;
export const QUALITY_WINDOW_MS = 2500;
export type TerrainQuality = 0 | 1 | 2 | 3;

export function initialTerrainQuality({
  width,
  coarsePointer,
  cores,
  memory,
}: {
  width: number;
  coarsePointer: boolean;
  cores?: number;
  memory?: number;
}): TerrainQuality {
  return width < 768 ||
    coarsePointer ||
    (cores !== undefined && cores <= 4) ||
    (memory !== undefined && memory <= 4)
    ? 1
    : 0;
}

export function terrainBudget(
  width: number,
  height: number,
  deviceRatio: number,
  quality: TerrainQuality,
) {
  const limits = [800_000, 180_000, 90_000, 90_000];
  const segments = [
    [64, 48],
    [40, 30],
    [24, 18],
    [24, 18],
  ] as const;
  const ratio = Math.min(
    deviceRatio || 1,
    quality === 0 ? 1 : 0.75,
    Math.sqrt(limits[quality] / Math.max(1, width * height)),
  );
  return {
    ratio,
    widthSegments: segments[quality][0],
    heightSegments: segments[quality][1],
  };
}

export function nextFrameDeadline(deadline: number, now: number) {
  return (
    deadline +
    (Math.floor(Math.max(0, now - deadline) / FRAME_INTERVAL) + 1) *
      FRAME_INTERVAL
  );
}

export class TerrainQualityMonitor {
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

  observe(interval: number, quality: TerrainQuality): TerrainQuality {
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
    return Math.min(3, quality + 1) as TerrainQuality;
  }
}
