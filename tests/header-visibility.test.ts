import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HIDE_AFTER,
  SHOW_AFTER,
  SHOW_AT_TOP,
  initialHeaderScroll,
  nextHeaderScroll,
  type HeaderScroll,
} from "../lib/visuals/header-visibility.ts";

const run = (positions: number[], start: HeaderScroll = initialHeaderScroll(0)) =>
  positions.reduce((state, y) => nextHeaderScroll(state, y), start);

test("the header stays visible near the top however the page is scrolled", () => {
  assert.equal(run([0, 10, 40, SHOW_AT_TOP]).hidden, false);
  assert.equal(nextHeaderScroll({ hidden: true, pivot: 500 }, 20).hidden, false);
  assert.equal(nextHeaderScroll(initialHeaderScroll(0), -40).pivot, 0);
});

test("scrolling down past the threshold hides the header and scrolling up brings it back", () => {
  const down = run([100, 100 + HIDE_AFTER + 1]);
  assert.equal(down.hidden, true);
  const up = nextHeaderScroll(down, down.pivot - SHOW_AFTER);
  assert.equal(up.hidden, false);
});

test("small movements and jitter never flip the header", () => {
  const start: HeaderScroll = { hidden: false, pivot: 400 };
  assert.equal(run([403, 401, 405, 402], start).hidden, false);
  const hidden = run([400 + HIDE_AFTER + 5], start);
  assert.equal(hidden.hidden, true);
  assert.equal(run([hidden.pivot - 3, hidden.pivot - 1, hidden.pivot - 4], hidden).hidden, true);
});

test("the pivot follows the furthest point so a deliberate reversal reveals it right away", () => {
  let state = run([300, 340, 420, 900, 1500]);
  assert.equal(state.hidden, true);
  assert.equal(state.pivot, 1500);
  state = nextHeaderScroll(state, 1500 - SHOW_AFTER + 1);
  assert.equal(state.hidden, true);
  state = nextHeaderScroll(state, 1500 - SHOW_AFTER);
  assert.equal(state.hidden, false);
});

test("a header that is already visible keeps tracking upward so the next downward scroll is measured from there", () => {
  let state = run([600, 500, 450]);
  assert.equal(state.hidden, false);
  assert.equal(state.pivot, 450);
  state = nextHeaderScroll(state, 450 + HIDE_AFTER - 1);
  assert.equal(state.hidden, false);
  state = nextHeaderScroll(state, 450 + HIDE_AFTER);
  assert.equal(state.hidden, true);
});
