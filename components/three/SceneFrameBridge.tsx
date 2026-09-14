"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useSceneMotion } from "@/context/ScrollMotionProvider";

/**
 * Drives one React Three Fiber root from the shared motion ticker.
 *
 * The canvas runs `frameloop="never"`, so this is the only thing that renders it.
 * `advance` is root-local and takes seconds: R3F assigns the timestamp straight to
 * `clock.elapsedTime` and derives the `useFrame` delta from it, so an accumulated
 * virtual clock (rather than the Lenis millisecond clock) is what must be passed.
 */
export function SceneFrameBridge() {
  const advance = useThree((state) => state.advance);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const dpr = useThree((state) => state.viewport.dpr);
  const controller = useSceneMotion();

  useEffect(() => {
    let elapsed = 0;
    return controller.subscribe((delta) => {
      elapsed += delta;
      advance(elapsed, false);
    });
  }, [advance, controller]);

  // A resize or pixel-ratio change resizes the drawing buffer but never draws.
  useEffect(() => {
    controller.requestFrame();
  }, [controller, width, height, dpr]);

  return null;
}
