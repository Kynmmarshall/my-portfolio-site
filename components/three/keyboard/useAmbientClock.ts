"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSceneMotion } from "@/context/ScrollMotionProvider";

/**
 * Seconds of ambient animation. It stands still while motion is paused or
 * reduced, so typing, glow and trace pulses freeze together and a one-shot
 * redraw never advances them.
 */
export function useAmbientClock() {
  const controller = useSceneMotion();
  const time = useRef(0);
  useFrame((_state, delta) => {
    if (controller.isAmbient()) time.current += Math.min(delta, 0.06);
  });
  return time;
}
