/**
 * Scroll rules for the auto-hiding header.
 *
 * Pure module: no DOM or React, so the thresholds are unit testable. The state
 * follows the furthest point reached in the current direction (`pivot`), which
 * gives hysteresis: small jitters and trackpad bounce never flip the header, but a
 * deliberate scroll in the other direction brings it back almost immediately.
 */

/** The header is always shown this close to the top of the page. */
export const SHOW_AT_TOP = 80;
/** Pixels scrolled down before a visible header slides away. */
export const HIDE_AFTER = 14;
/** Pixels scrolled up before a hidden header returns. */
export const SHOW_AFTER = 8;

export type HeaderScroll = { hidden: boolean; pivot: number };

export const initialHeaderScroll = (y: number): HeaderScroll => ({
  hidden: false,
  pivot: Math.max(0, y),
});

export function nextHeaderScroll(state: HeaderScroll, scrollY: number): HeaderScroll {
  const y = Math.max(0, scrollY);
  if (y <= SHOW_AT_TOP) return state.hidden || state.pivot !== y ? { hidden: false, pivot: y } : state;
  if (state.hidden) {
    if (y > state.pivot) return { hidden: true, pivot: y };
    if (state.pivot - y >= SHOW_AFTER) return { hidden: false, pivot: y };
    return state;
  }
  if (y < state.pivot) return { hidden: false, pivot: y };
  if (y - state.pivot >= HIDE_AFTER) return { hidden: true, pivot: y };
  return state;
}
