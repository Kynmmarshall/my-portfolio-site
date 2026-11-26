/**
 * Pure description of the mechanical keyboard.
 *
 * No Three.js, DOM or React imports: the key table, layer stack, explode offsets,
 * typing schedule, framing math and vertex accounting are plain data and math, so
 * they stay unit testable and the renderer cannot drift from the documented budget.
 *
 * One unit is one key pitch. The keyboard lies flat with its key tops facing +y,
 * rows run along z (row 0 at the back, negative z) and columns along x.
 */

export type Vec3 = readonly [number, number, number];

export type KeyKind = "alpha" | "mod" | "accent";

export type KeySpec = {
  index: number;
  row: number;
  /** Centre offset from the keyboard centre, in key pitches. */
  x: number;
  z: number;
  /** Width in key pitches. */
  width: number;
  /** `KeyboardEvent.code`, used to answer real key presses. */
  code: string;
  /** Short developer-flavoured legend printed on the cap. */
  legend: string;
  kind: KeyKind;
};

type KeyDefinition = readonly [
  code: string,
  legend: string,
  width: number,
  kind?: KeyKind,
];

const alpha = (code: string, legend: string): KeyDefinition => [code, legend, 1];
const mod = (code: string, legend: string, width: number): KeyDefinition => [
  code,
  legend,
  width,
  "mod",
];
const accent = (code: string, legend: string, width: number): KeyDefinition => [
  code,
  legend,
  width,
  "accent",
];
const letters = (text: string) =>
  [...text].map((letter) => alpha(`Key${letter}`, letter.toLowerCase()));

/** A 75% layout, 16 key pitches wide in every row. */
const KEY_DEFINITIONS: readonly (readonly KeyDefinition[])[] = [
  [
    accent("Escape", "esc", 1),
    ...Array.from({ length: 12 }, (_, index) =>
      mod(`F${index + 1}`, `F${index + 1}`, 1),
    ),
    mod("PrintScreen", "</>", 1),
    mod("Delete", "rm", 1),
    mod("Home", "cd", 1),
  ],
  [
    alpha("Backquote", "~"),
    ...Array.from("1234567890", (digit) =>
      alpha(`Digit${digit}`, digit),
    ),
    alpha("Minus", "-"),
    alpha("Equal", "="),
    mod("Backspace", "del", 2),
    mod("PageUp", "pgup", 1),
  ],
  [
    mod("Tab", "tab", 1.5),
    ...letters("QWERTYUIOP"),
    alpha("BracketLeft", "{"),
    alpha("BracketRight", "}"),
    mod("Backslash", "\\", 1.5),
    mod("PageDown", "pgdn", 1),
  ],
  [
    mod("CapsLock", "caps", 1.75),
    ...letters("ASDFGHJKL"),
    alpha("Semicolon", ";"),
    alpha("Quote", "'"),
    accent("Enter", "enter", 2.25),
    mod("End", "end", 1),
  ],
  [
    mod("ShiftLeft", "shift", 2.25),
    ...letters("ZXCVBNM"),
    alpha("Comma", ","),
    alpha("Period", "."),
    alpha("Slash", "/"),
    mod("ShiftRight", "shift", 2.75),
    mod("ArrowUp", "↑", 1),
  ],
  [
    mod("ControlLeft", "ctrl", 1.25),
    mod("MetaLeft", "git", 1.25),
    mod("AltLeft", "alt", 1.25),
    accent("Space", "git push", 6.25),
    mod("AltRight", "alt", 1),
    mod("ContextMenu", "fn", 1),
    mod("ControlRight", "ctrl", 1),
    mod("ArrowLeft", "←", 1),
    mod("ArrowDown", "↓", 1),
    mod("ArrowRight", "→", 1),
  ],
];

export const ROW_COUNT = KEY_DEFINITIONS.length;
export const KEYBOARD_COLUMNS = 16;

let cachedKeys: KeySpec[] | null = null;

export function keyboardKeys(): readonly KeySpec[] {
  if (cachedKeys) return cachedKeys;
  const keys: KeySpec[] = [];
  KEY_DEFINITIONS.forEach((definitions, row) => {
    let cursor = -KEYBOARD_COLUMNS / 2;
    for (const [code, legend, width, kind = "alpha"] of definitions) {
      keys.push({
        index: keys.length,
        row,
        x: cursor + width / 2,
        z: row - (ROW_COUNT - 1) / 2,
        width,
        code,
        legend,
        kind,
      });
      cursor += width;
    }
  });
  cachedKeys = keys;
  return keys;
}

export const KEY_COUNT = KEY_DEFINITIONS.reduce((sum, row) => sum + row.length, 0);

let cachedCodes: Map<string, number> | null = null;

/** The key a physical `KeyboardEvent.code` presses, if the layout has it. */
export function keyIndexForCode(code: string): number | undefined {
  if (!cachedCodes)
    cachedCodes = new Map(keyboardKeys().map((key) => [key.code, key.index]));
  return cachedCodes.get(code);
}

export type KeyboardPalette = {
  desk: string;
  case: string;
  plate: string;
  board: string;
  trace: string;
  alpha: string;
  mod: string;
  accent: string;
  switchBody: string;
  stem: string;
  legend: string;
  legendAccent: string;
  led: string;
  warm: string;
};

/** The keyboard stays dark in both site themes; only the page around it changes. */
export const KEYBOARD_PALETTE: KeyboardPalette = {
  desk: "#1d2723",
  case: "#27322e",
  plate: "#58675f",
  board: "#0c1f1b",
  trace: "#52e0c2",
  alpha: "#34413c",
  mod: "#222b28",
  accent: "#52e0c2",
  switchBody: "#7c8b84",
  stem: "#ffb454",
  legend: "#c9efe3",
  legendAccent: "#0b1210",
  led: "#52e0c2",
  warm: "#ffb454",
};

/** Geometry subdivision and texture size for one quality tier. */
export type KeyboardDetail = {
  /** Corner subdivisions of keycaps; zero means sharp boxes. */
  keyCorner: number;
  /** Corner subdivisions of the case tray. */
  caseCorner: number;
  /** Cable length and cross-section segments. */
  tubular: number;
  tube: number;
  /** Pixel size of one legend tile in the atlas. */
  legendTile: number;
};

export type LayerName = "case" | "board" | "plate" | "switches" | "keys";
export const LAYERS: readonly LayerName[] = [
  "case",
  "board",
  "plate",
  "switches",
  "keys",
];

/** Height each layer rises at full explode, bottom to top. */
export const LAYER_GAP = [0, 1.2, 2.4, 3.6, 5] as const;

export const layerLift = (morph: number, layer: number) =>
  Math.min(1, Math.max(0, morph)) * LAYER_GAP[layer];

/** How strongly a layer is the scene's current focus (1 on it, 0 two layers away). */
export const layerWeight = (focus: number, layer: number) =>
  Math.max(0, 1 - Math.abs(focus - layer));

export const CASE = { width: 16.9, depth: 6.9, wall: 0.45, floor: 0.2, height: 0.75 } as const;
export const BOARD = { width: 16.1, depth: 6.1, y: 0.32, thickness: 0.08 } as const;
export const PLATE = { width: 16.2, depth: 6.2, y: 0.7, thickness: 0.08, hole: 0.8 } as const;
export const SWITCH = { y: 0.93, height: 0.4, size: 0.62, stem: 0.26, stemHeight: 0.2 } as const;
export const KEYCAP = { y: 1.5, height: 0.62, gap: 0.08, taper: 0.2, press: 0.16 } as const;
export const LED = { y: 0.78, size: 0.94, thickness: 0.02 } as const;

export type PartSpec = {
  id: string;
  size: Vec3;
  position: Vec3;
  radius: number;
  role: keyof KeyboardPalette;
  layer: LayerName;
  glow: boolean;
};

const part = (
  id: string,
  layer: LayerName,
  role: keyof KeyboardPalette,
  size: Vec3,
  position: Vec3,
  radius = 0,
  glow = false,
): PartSpec => ({ id, layer, role, size, position, radius, glow });

let cachedParts: PartSpec[] | null = null;

/** Boxes that make up the case tray and the glow strips; the geometry builder consumes this. */
export function keyboardParts(): readonly PartSpec[] {
  if (cachedParts) return cachedParts;
  const { width, depth, wall, floor, height } = CASE;
  const wallHeight = height - floor;
  const stripY = 0.4;
  cachedParts = [
    part("case-floor", "case", "case", [width, floor, depth], [0, floor / 2, 0], 0.1),
    part("case-back", "case", "case", [width, wallHeight, wall], [0, floor + wallHeight / 2, -(depth - wall) / 2], 0.12),
    part("case-front", "case", "case", [width, wallHeight, wall], [0, floor + wallHeight / 2, (depth - wall) / 2], 0.12),
    part("case-left", "case", "case", [wall, wallHeight, depth - wall * 2], [-(width - wall) / 2, floor + wallHeight / 2, 0], 0.12),
    part("case-right", "case", "case", [wall, wallHeight, depth - wall * 2], [(width - wall) / 2, floor + wallHeight / 2, 0], 0.12),
    part("glow-front", "case", "trace", [width - 1.2, 0.05, 0.03], [0, stripY, depth / 2 + 0.012], 0, true),
    part("glow-back", "case", "trace", [width - 1.2, 0.05, 0.03], [0, stripY, -depth / 2 - 0.012], 0, true),
    part("glow-left", "case", "trace", [0.03, 0.05, depth - 1.2], [-width / 2 - 0.012, stripY, 0], 0, true),
    part("glow-right", "case", "trace", [0.03, 0.05, depth - 1.2], [width / 2 + 0.012, stripY, 0], 0, true),
  ];
  return cachedParts;
}

/** USB cable route as control points, leaving the back edge of the case. */
export const CABLE: readonly Vec3[] = [
  [0, 0.42, -CASE.depth / 2 + 0.2],
  [0, 0.45, -CASE.depth / 2 - 1],
  [1.4, 0.55, -CASE.depth / 2 - 2.4],
  [0.8, 0.9, -CASE.depth / 2 - 4.4],
];
export const CABLE_RADIUS = 0.11;

export const TYPING_SLOTS = 3;

const hash = (value: number) => {
  const raw = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return raw - Math.floor(raw);
};

/**
 * Deterministic "typing": which key a slot is pressing at `time` and how far it
 * is down (0 up, 1 fully pressed). A fast press and slower release read as a
 * keystroke without any random state to carry between frames.
 */
export function pressedKey(
  time: number,
  slot: number,
  keyCount: number = KEY_COUNT,
): { index: number; press: number } {
  const stepped = time * (3.2 + slot * 0.7) + slot * 7.31;
  const step = Math.floor(stepped);
  const phase = stepped - step;
  const index = Math.floor(hash(step * 1.37 + slot * 19.19) * keyCount) % keyCount;
  const press = phase < 0.2 ? phase / 0.2 : Math.max(0, 1 - (phase - 0.2) / 0.5);
  return { index, press };
}

/** Switch underglow: a slow wave across the board, lifted by key presses. */
export function ledLevel(time: number, x: number, z: number, press: number): number {
  const wave = 0.5 + 0.5 * Math.sin(time * 0.9 - x * 0.45 + z * 0.35);
  return Math.min(1, 0.3 + 0.4 * wave + press);
}

/* Framing. The keyboard is scaled to cover the viewport, then panned inside it. */

export type FrameInput = {
  /** Viewport width over height. */
  aspect: number;
  /** Vertical field of view in degrees. */
  fov: number;
  /** Camera distance to the keyboard centre. */
  distance: number;
  /** Perspective tilt in radians; the back of the keyboard leans away. */
  tilt: number;
  /** True when the keyboard is rolled 90 degrees to fill a tall screen. */
  rotated: boolean;
  /**
   * Fraction of the exact cover scale to use. 1 makes the keyboard fill the
   * viewport edge to edge; less leaves room for the desk mat around it.
   */
  fill?: number;
};

const visibleHeight = (fov: number, distance: number) =>
  2 * distance * Math.tan((fov * Math.PI) / 360);

/** Which keyboard dimension runs across and down the screen. */
const screenExtents = (rotated: boolean) => ({
  across: rotated ? CASE.depth : CASE.width,
  down: rotated ? CASE.width : CASE.depth,
});

/** Scale at which the keyboard, times `fill`, fills the viewport in both directions. */
export function frameScale({
  aspect,
  fov,
  distance,
  tilt,
  rotated,
  fill = 1,
}: FrameInput): number {
  const height = visibleHeight(fov, distance);
  const width = height * Math.max(aspect, 0.1);
  const { across, down } = screenExtents(rotated);
  const foreshortened = Math.max(Math.cos(tilt), 0.2);
  // The far half of a tilted plane also shrinks with perspective.
  const perspective = 1 + 0.5 * Math.sin(Math.abs(tilt));
  return (
    Math.max(width / across, height / (down * foreshortened)) *
    perspective *
    fill
  );
}

/**
 * How far the view can pan along the keyboard's long and short axes, in key
 * pitches, before an edge would come into view. Zero when the keyboard is
 * smaller than the viewport along that axis.
 */
export function panLimits(input: FrameInput, zoom = 1) {
  const scale = frameScale(input) * Math.max(zoom, 1);
  const height = visibleHeight(input.fov, input.distance);
  const width = height * Math.max(input.aspect, 0.1);
  const { across, down } = screenExtents(input.rotated);
  const acrossRoom = Math.max(0, (across * scale - width) / 2 / scale);
  const downRoom = Math.max(0, (down * scale - height) / 2 / scale);
  return input.rotated
    ? { long: downRoom, short: acrossRoom }
    : { long: acrossRoom, short: downRoom };
}

/** Opacity of the whole canvas; interior pages dim the scene, never erase it. */
export const presenceOpacity = (presence: number) =>
  Math.min(1, Math.max(0.2, presence));

/* Vertex accounting. Each formula is an upper bound for the Three.js geometry it names. */

/** RoundedBoxGeometry is non-indexed: 36 * (2 * segments + 1) ^ 2 vertices. */
const roundedBoxVertices = (segments: number) => 36 * (2 * segments + 1) ** 2;
/** The same box after `mergeVertices`: at most one grid of (2 * segments + 2) ^ 2 per face. */
const indexedRoundedBoxVertices = (segments: number) => 6 * (2 * segments + 2) ** 2;
const roundedBoxIndices = (segments: number) => 36 * (2 * segments + 1) ** 2;
const BOX_VERTICES = 24;
const BOX_INDICES = 36;
const tubeVertices = (tubular: number, tube: number) => (tubular + 1) * (tube + 1);
const tubeIndices = (tubular: number, tube: number) => tubular * tube * 6;

/**
 * Non-indexed extrude of a plate with one square hole per key and no bevel. A
 * triangulation that only uses contour vertices has at most `N + 2h - 2`
 * triangles per cap, so this is an upper bound; the real plate is smaller.
 */
export function plateVertices(holes: number = KEY_COUNT): number {
  const contour = 4 + holes * 4;
  const capTriangles = contour + 2 * holes - 2;
  return 2 * capTriangles * 3 + contour * 6;
}

export type KeyboardStats = {
  /** Vertices processed per frame, instances included. */
  vertices: number;
  /** Element count of the single largest draw call (per instance when instanced). */
  maxDrawCount: number;
  drawCalls: number;
};

export function keyboardStats(detail: KeyboardDetail): KeyboardStats {
  let caseVertices = 0;
  let glowVertices = tubeVertices(detail.tubular, detail.tube);
  let glowIndices = tubeIndices(detail.tubular, detail.tube);
  for (const spec of keyboardParts()) {
    if (spec.glow) {
      glowVertices += BOX_VERTICES;
      glowIndices += BOX_INDICES;
    } else {
      caseVertices +=
        spec.radius > 0 && detail.caseCorner > 0
          ? roundedBoxVertices(detail.caseCorner)
          : BOX_INDICES;
    }
  }
  const rounded = detail.keyCorner > 0;
  const keycapVertices = rounded ? indexedRoundedBoxVertices(detail.keyCorner) : BOX_VERTICES;
  const keycapIndices = rounded ? roundedBoxIndices(detail.keyCorner) : BOX_INDICES;
  const plate = plateVertices();
  const switchVertices = BOX_VERTICES * 2;
  return {
    vertices:
      caseVertices +
      glowVertices +
      BOX_VERTICES +
      4 +
      plate +
      KEY_COUNT * (keycapVertices + switchVertices + BOX_VERTICES),
    maxDrawCount: Math.max(caseVertices, glowIndices, plate, keycapIndices, BOX_INDICES * 2),
    // desk, case, glow, board, traces, plate, switches, underglow, keycaps
    drawCalls: 9,
  };
}
