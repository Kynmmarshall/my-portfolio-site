"use client";

import { useEffect, useRef } from "react";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { keyIndexForCode } from "@/lib/visuals/keyboard-layout";

/**
 * Keys the visitor is physically holding, as indices into the keyboard layout.
 *
 * Only which cap is down is kept, never what was typed: nothing is stored,
 * logged or sent, and the events are never cancelled, so typing, shortcuts and
 * form fields behave exactly as before. Presses are ignored while ambient
 * motion is off (paused, reduced motion, hidden tab).
 */
export function useRealTyping() {
  const controller = useSceneMotion();
  const held = useRef(new Set<number>());

  useEffect(() => {
    const keys = held.current;
    const press = (event: KeyboardEvent) => {
      if (!controller.isAmbient()) return;
      const index = keyIndexForCode(event.code);
      if (index !== undefined) keys.add(index);
    };
    const release = (event: KeyboardEvent) => {
      const index = keyIndexForCode(event.code);
      if (index !== undefined) keys.delete(index);
    };
    // Focus changes swallow key-up events, which would leave a cap stuck down.
    const clear = () => keys.clear();
    window.addEventListener("keydown", press);
    window.addEventListener("keyup", release);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("keydown", press);
      window.removeEventListener("keyup", release);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      keys.clear();
    };
  }, [controller]);

  return held;
}
