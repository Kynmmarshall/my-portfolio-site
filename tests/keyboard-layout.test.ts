import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CASE,
  KEYBOARD_COLUMNS,
  KEY_COUNT,
  LAYER_GAP,
  frameScale,
  keyIndexForCode,
  keyboardKeys,
  layerLift,
  layerWeight,
  panLimits,
  pressedKey,
  type FrameInput,
} from "../lib/visuals/keyboard-layout.ts";

const wide: FrameInput = {
  aspect: 16 / 10,
  fov: 38,
  distance: 10,
  tilt: 0.42,
  rotated: false,
};

test("every row is as wide as the case and keys never overlap", () => {
  const keys = keyboardKeys();
  assert.equal(keys.length, KEY_COUNT);
  const rows = new Map<number, typeof keys>();
  for (const key of keys) rows.set(key.row, [...(rows.get(key.row) ?? []), key]);
  for (const [row, members] of rows) {
    const total = members.reduce((sum, key) => sum + key.width, 0);
    // Only the tab row is half a pitch narrower, like the real layout it copies.
    assert.ok(total >= KEYBOARD_COLUMNS - 0.5 && total <= KEYBOARD_COLUMNS, `row ${row}: ${total}`);
    const sorted = [...members].sort((first, second) => first.x - second.x);
    for (let index = 1; index < sorted.length; index++)
      assert.ok(
        sorted[index].x - sorted[index].width / 2 >=
          sorted[index - 1].x + sorted[index - 1].width / 2 - 1e-9,
      );
  }
  for (const key of keys)
    assert.ok(Math.abs(key.x) + key.width / 2 <= CASE.width / 2, key.code);
});

test("physical key codes map to unique caps and unknown codes map to none", () => {
  const codes = keyboardKeys().map((key) => key.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.equal(keyboardKeys()[keyIndexForCode("KeyA")!].legend, "a");
  assert.equal(keyboardKeys()[keyIndexForCode("Enter")!].kind, "accent");
  assert.equal(keyboardKeys()[keyIndexForCode("Escape")!].legend, "esc");
  assert.equal(keyIndexForCode("IntlRo"), undefined);
  assert.equal(keyIndexForCode(""), undefined);
});

test("automatic typing is deterministic, stays on the board and presses then releases", () => {
  for (let slot = 0; slot < 3; slot++) {
    let peak = 0;
    let released = false;
    for (let time = 0; time < 12; time += 0.01) {
      const first = pressedKey(time, slot);
      assert.deepEqual(first, pressedKey(time, slot));
      assert.ok(first.index >= 0 && first.index < KEY_COUNT);
      assert.ok(first.press >= 0 && first.press <= 1);
      peak = Math.max(peak, first.press);
      if (peak > 0.9 && first.press === 0) released = true;
    }
    assert.ok(peak > 0.9, `slot ${slot} never bottoms out`);
    assert.ok(released, `slot ${slot} never releases`);
  }
});

test("layers rise in order, stay put at rest and never cross", () => {
  for (let layer = 0; layer < LAYER_GAP.length; layer++) {
    assert.equal(layerLift(0, layer), 0);
    assert.equal(layerLift(1, layer), LAYER_GAP[layer]);
    assert.equal(layerLift(5, layer), LAYER_GAP[layer]);
    assert.equal(layerLift(-1, layer), 0);
  }
  for (const morph of [0.2, 0.5, 0.9])
    for (let layer = 1; layer < LAYER_GAP.length; layer++)
      assert.ok(layerLift(morph, layer) > layerLift(morph, layer - 1));
});

test("focus weight peaks on its own layer and fades one layer away", () => {
  assert.equal(layerWeight(2, 2), 1);
  assert.equal(layerWeight(2.5, 2), 0.5);
  assert.equal(layerWeight(2, 4), 0);
  assert.equal(layerWeight(4, 4), 1);
});

test("the keyboard fills the viewport on wide, ultra-wide and tall screens", () => {
  for (const aspect of [0.46, 1, 16 / 10, 21 / 9]) {
    const rotated = aspect < 0.8;
    const input = { ...wide, aspect, rotated, fill: 1 };
    const scale = frameScale(input);
    const height = 2 * input.distance * Math.tan((input.fov * Math.PI) / 360);
    const width = height * aspect;
    const across = rotated ? CASE.depth : CASE.width;
    const down = rotated ? CASE.width : CASE.depth;
    assert.ok(across * scale >= width - 1e-9, `aspect ${aspect}: too narrow`);
    assert.ok(down * scale * Math.cos(input.tilt) >= height - 1e-9, `aspect ${aspect}: too short`);
  }
});

test("a smaller fill leaves desk around the keyboard and a rotated one turns the long side upright", () => {
  assert.ok(frameScale({ ...wide, fill: 0.7 }) < frameScale({ ...wide, fill: 1 }));
  const tall = { ...wide, aspect: 0.46, rotated: true, fill: 1 };
  const landscape = { ...tall, rotated: false };
  assert.ok(frameScale(tall) > 0);
  assert.ok(panLimits(tall).long > panLimits(tall).short);
  assert.ok(panLimits(landscape).long >= 0);
});

test("pan room only appears when the keyboard overfills the screen and grows with zoom", () => {
  const exact = { ...wide, fill: 1 };
  assert.ok(panLimits(exact, 1).short >= 0 && panLimits(exact, 1).long >= 0);
  assert.ok(panLimits(exact, 1.4).long > panLimits(exact, 1).long);
  assert.ok(panLimits(exact, 1.4).short > panLimits(exact, 1).short);
  assert.equal(panLimits({ ...wide, fill: 0.3 }, 1).long, 0);
});
