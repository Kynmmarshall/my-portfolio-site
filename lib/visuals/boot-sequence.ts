/**
 * Boot sequence shown while the site starts up.
 *
 * Pure module: no DOM or React, so the pacing rules are unit testable. The
 * sequence never fakes readiness. It always runs for at least BOOT_MIN_MS so the
 * lines can be read, then waits at WAITING_CEILING until the background scene
 * reports ready (or failed), and gives up waiting after BOOT_MAX_MS so a missing
 * WebGL context or a slow first compile can never trap a visitor on the splash.
 */

import { KEY_COUNT } from "./keyboard-layout.ts";
import type { ScenePhase } from "./scene-loading.ts";

export const BOOT_MIN_MS = 1100;
export const BOOT_MAX_MS = 2600;
/** How long the exit animation plays before the splash is removed. */
export const BOOT_EXIT_MS = 900;
/** Progress held while the scene is still preparing. */
export const WAITING_CEILING = 88;

export type BootStep = { at: number; label: string; fr: string };

export const BOOT_STEPS: readonly BootStep[] = [
  { at: 0, label: "mounting layout", fr: "montage de la mise en page" },
  {
    at: 20,
    label: "compiling 5 keyboard layers",
    fr: "compilation de 5 couches de clavier",
  },
  {
    at: 42,
    label: `wiring ${KEY_COUNT} switches`,
    fr: `câblage de ${KEY_COUNT} switches`,
  },
  { at: 64, label: "tuning the legends", fr: "réglage des légendes" },
  {
    at: 86,
    label: "starting the render loop",
    fr: "démarrage de la boucle de rendu",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Interval at which the splash advances its own clock. */
export const BOOT_TICK_MS = 60;

/**
 * Progress from 0 to 100.
 *
 * `paced` is a virtual clock that only moves when the splash ticks, so a stalled
 * main thread (hydration, a slow first compile) stretches the sequence instead of
 * collapsing it into one frame. `waited` is real time and only controls how long
 * the splash is willing to wait for the scene, so it can never hang.
 */
export function bootProgress(
  paced: number,
  phase: ScenePhase,
  waited: number = paced,
): number {
  const pace = clamp(paced / BOOT_MIN_MS, 0, 1) * 100;
  const settled =
    phase === "ready" || phase === "failed" || waited >= BOOT_MAX_MS;
  return Math.round(Math.min(pace, settled ? 100 : WAITING_CEILING));
}

/** The steps that have been reached at this progress. */
export function reachedSteps(progress: number): readonly BootStep[] {
  return BOOT_STEPS.filter((step) => step.at <= progress);
}
