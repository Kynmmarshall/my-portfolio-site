import { KEY_COUNT, TYPING_SLOTS, pressedKey } from "@/lib/visuals/keyboard-layout";

/** Pressing attacks fast and releases slower, like a real switch. */
const ATTACK = 30;
const RELEASE = 11;

/**
 * Eased pressed amount per key, from the automatic typists and from keys the
 * visitor is physically holding. One instance is shared by the keycaps and the
 * underglow, so both read the same values in a frame.
 */
export class PressedKeys {
  private readonly eased = new Float32Array(KEY_COUNT);
  private readonly wanted = new Float32Array(KEY_COUNT);

  update(delta: number, time: number, held: ReadonlySet<number>) {
    const step = Math.min(delta, 0.06);
    this.wanted.fill(0);
    for (let slot = 0; slot < TYPING_SLOTS; slot++) {
      const { index, press } = pressedKey(time, slot);
      this.wanted[index] = Math.max(this.wanted[index], press);
    }
    for (const index of held) this.wanted[index] = 1;
    for (let index = 0; index < KEY_COUNT; index++) {
      const rate = this.wanted[index] > this.eased[index] ? ATTACK : RELEASE;
      this.eased[index] +=
        (this.wanted[index] - this.eased[index]) * (1 - Math.exp(-step * rate));
    }
  }

  /** 0 up, 1 fully pressed. */
  level(index: number) {
    return this.eased[index];
  }
}
