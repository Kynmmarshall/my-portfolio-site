import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Matrix4,
  Path,
  PlaneGeometry,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  mergeGeometries,
  mergeVertices,
} from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  BOARD,
  CABLE,
  CABLE_RADIUS,
  KEYCAP,
  LED,
  PLATE,
  SWITCH,
  keyboardKeys,
  keyboardParts,
  type KeyboardDetail,
  type KeyboardPalette,
  type PartSpec,
} from "./keyboard-layout.ts";

function tint(geometry: BufferGeometry, color: Color) {
  const count = geometry.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  return geometry;
}

/** Only position, normal and colour survive, so every layer merges cleanly. */
function strip(geometry: BufferGeometry) {
  for (const name of Object.keys(geometry.attributes))
    if (name !== "position" && name !== "normal" && name !== "color")
      geometry.deleteAttribute(name);
  return geometry;
}

function partGeometry(spec: PartSpec, detail: KeyboardDetail) {
  const [width, height, depth] = spec.size;
  let geometry: BufferGeometry =
    !spec.glow && spec.radius > 0 && detail.caseCorner > 0
      ? new RoundedBoxGeometry(width, height, depth, detail.caseCorner, spec.radius)
      : new BoxGeometry(width, height, depth);
  // RoundedBoxGeometry is non-indexed and mergeGeometries needs one convention per
  // layer: the case layer is non-indexed, the glow layer stays indexed.
  if (!spec.glow && geometry.index) {
    const flat = geometry.toNonIndexed();
    geometry.dispose();
    geometry = flat;
  }
  geometry.translate(spec.position[0], spec.position[1], spec.position[2]);
  return strip(geometry);
}

function mergeParts(
  glow: boolean,
  palette: KeyboardPalette,
  detail: KeyboardDetail,
  extra: BufferGeometry[] = [],
) {
  const geometries = keyboardParts()
    .filter((spec) => spec.glow === glow)
    .map((spec) => tint(partGeometry(spec, detail), new Color(palette[spec.role])));
  const merged = mergeGeometries([...geometries, ...extra]);
  geometries.forEach((geometry) => geometry.dispose());
  extra.forEach((geometry) => geometry.dispose());
  return merged;
}

/** The case tray: a floor and four walls, in one non-indexed draw. */
export function buildCaseGeometry(
  palette: KeyboardPalette,
  detail: KeyboardDetail,
) {
  return mergeParts(false, palette, detail);
}

/** Unlit accents on the case plus the USB cable, in one indexed draw. */
export function buildGlowGeometry(
  palette: KeyboardPalette,
  detail: KeyboardDetail,
) {
  const curve = new CatmullRomCurve3(
    CABLE.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    "catmullrom",
    0.4,
  );
  const cable = strip(
    tint(
      new TubeGeometry(curve, detail.tubular, CABLE_RADIUS, detail.tube, false),
      new Color(palette.accent),
    ),
  );
  return mergeParts(true, palette, detail, [cable]);
}

export function buildBoardGeometry(palette: KeyboardPalette) {
  const board = new BoxGeometry(BOARD.width, BOARD.thickness, BOARD.depth);
  board.translate(0, BOARD.y, 0);
  return strip(tint(board, new Color(palette.board)));
}

/** The board's top face, drawn by the trace shader; `position.xz` is the board coordinate. */
export function buildTraceGeometry() {
  const plane = new PlaneGeometry(BOARD.width - 0.1, BOARD.depth - 0.1);
  plane.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
  plane.translate(0, BOARD.y + BOARD.thickness / 2 + 0.004, 0);
  return plane;
}

/** Metal plate with one square cutout per switch. */
export function buildPlateGeometry() {
  const halfWidth = PLATE.width / 2;
  const halfDepth = PLATE.depth / 2;
  const shape = new Shape();
  shape.moveTo(-halfWidth, -halfDepth);
  shape.lineTo(halfWidth, -halfDepth);
  shape.lineTo(halfWidth, halfDepth);
  shape.lineTo(-halfWidth, halfDepth);
  shape.closePath();
  const half = PLATE.hole / 2;
  for (const key of keyboardKeys()) {
    // The shape's y axis becomes -z once the plate is laid flat.
    const y = -key.z;
    const hole = new Path();
    hole.moveTo(key.x - half, y - half);
    hole.lineTo(key.x - half, y + half);
    hole.lineTo(key.x + half, y + half);
    hole.lineTo(key.x + half, y - half);
    hole.closePath();
    shape.holes.push(hole);
  }
  const plate = new ExtrudeGeometry(shape, {
    depth: PLATE.thickness,
    bevelEnabled: false,
    steps: 1,
  });
  plate.applyMatrix4(new Matrix4().makeRotationX(-Math.PI / 2));
  plate.translate(0, PLATE.y - PLATE.thickness / 2, 0);
  return plate;
}

/** One switch: housing plus a coloured stem, positioned by instance matrix. */
export function buildSwitchGeometry(palette: KeyboardPalette) {
  const housing = new BoxGeometry(SWITCH.size, SWITCH.height, SWITCH.size);
  housing.translate(0, SWITCH.y, 0);
  const stem = new BoxGeometry(SWITCH.stem, SWITCH.stemHeight, SWITCH.stem);
  stem.translate(0, SWITCH.y + SWITCH.height / 2 + SWITCH.stemHeight / 2, 0);
  const merged = mergeGeometries([
    strip(tint(housing, new Color(palette.switchBody))),
    strip(tint(stem, new Color(palette.stem))),
  ]);
  housing.dispose();
  stem.dispose();
  return merged;
}

/** A flat emissive pad under each switch, visible through the gaps between caps. */
export function buildUnderglowGeometry() {
  const pad = new BoxGeometry(LED.size, LED.thickness, LED.size);
  pad.translate(0, LED.y, 0);
  return pad;
}

/**
 * A unit keycap: narrower at the top, with rounded edges on the upper tiers. Instance
 * matrices scale it to the key's size. Merged to an indexed mesh so each vertex is
 * shaded once, not once per triangle corner.
 */
export function buildKeycapGeometry(detail: KeyboardDetail) {
  const source =
    detail.keyCorner > 0
      ? new RoundedBoxGeometry(1, 1, 1, detail.keyCorner, 0.16)
      : new BoxGeometry(1, 1, 1);
  const position = source.getAttribute("position");
  for (let index = 0; index < position.count; index++) {
    const lift = position.getY(index) + 0.5;
    const shrink = 1 - KEYCAP.taper * lift;
    position.setX(index, position.getX(index) * shrink);
    position.setZ(index, position.getZ(index) * shrink);
  }
  position.needsUpdate = true;
  if (!source.index) {
    const merged = mergeVertices(source, 1e-5);
    source.dispose();
    return merged;
  }
  return source;
}
