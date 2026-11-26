import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
} from "three";
import {
  keyboardKeys,
  type KeyboardPalette,
} from "@/lib/visuals/keyboard-layout";

const PADDING = 2;
const MAX_WIDTH = 2048;
const FONT = '"IBM Plex Mono", ui-monospace, Consolas, "Courier New", monospace';

type Tile = { x: number; y: number; width: number; height: number };

/** Shelf-packs one tile per key; a tile is as wide as its key so legends keep their proportions. */
function layout(tile: number) {
  const keys = keyboardKeys();
  const tiles: Tile[] = [];
  let x = 0;
  let y = 0;
  for (const key of keys) {
    const width = Math.round(tile * key.width);
    if (x + width + PADDING * 2 > MAX_WIDTH) {
      x = 0;
      y += tile + PADDING * 2;
    }
    tiles.push({ x: x + PADDING, y: y + PADDING, width, height: tile });
    x += width + PADDING * 2;
  }
  const width = Math.max(...tiles.map((entry) => entry.x + entry.width + PADDING));
  return { tiles, width, height: y + tile + PADDING * 2 };
}

function draw(
  context: CanvasRenderingContext2D,
  tiles: Tile[],
  tile: number,
  palette: KeyboardPalette,
) {
  const keys = keyboardKeys();
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  keys.forEach((key, index) => {
    const area = tiles[index];
    const text = key.legend;
    let size = tile * (text.length > 1 ? 0.34 : 0.46);
    context.font = `600 ${size}px ${FONT}`;
    const room = Math.min(area.width, tile * 2.4) * 0.8;
    const measured = context.measureText(text).width;
    if (measured > room) {
      size *= room / measured;
      context.font = `600 ${size}px ${FONT}`;
    }
    context.fillStyle = key.kind === "accent" ? palette.legendAccent : palette.legend;
    context.fillText(text, area.x + area.width / 2, area.y + area.height / 2 + size * 0.04);
  });
}

export type LegendAtlas = {
  texture: CanvasTexture;
  /** Per key: u offset, v offset, u size, v size of its tile. */
  rects: Float32Array;
  /** Repaints with another palette or after the web font arrives. */
  redraw: (palette: KeyboardPalette) => void;
  dispose: () => void;
};

/** Developer legends drawn once into a canvas, so no image is downloaded. */
export function createLegendAtlas(
  palette: KeyboardPalette,
  tile: number,
): LegendAtlas {
  const { tiles, width, height } = layout(tile);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is unavailable");

  const rects = new Float32Array(tiles.length * 4);
  tiles.forEach((area, index) => {
    rects[index * 4] = area.x / width;
    rects[index * 4 + 1] = 1 - (area.y + area.height) / height;
    rects[index * 4 + 2] = area.width / width;
    rects[index * 4 + 3] = area.height / height;
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 4;

  const redraw = (next: KeyboardPalette) => {
    draw(context, tiles, tile, next);
    texture.needsUpdate = true;
  };
  redraw(palette);

  return {
    texture,
    rects,
    redraw,
    dispose: () => texture.dispose(),
  };
}
