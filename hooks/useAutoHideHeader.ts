"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initialHeaderScroll,
  nextHeaderScroll,
} from "@/lib/visuals/header-visibility";

/**
 * Hides the header while the page is scrolled down and brings it back on the way
 * up. `disabled` pins it visible (reduced motion, open menu). `reveal` shows it
 * from the outside, for keyboard focus and a pointer at the top edge.
 */
export function useAutoHideHeader(disabled: boolean) {
  const [state, setState] = useState(() => initialHeaderScroll(0));

  useEffect(() => {
    if (disabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setState((current) => nextHeaderScroll(current, window.scrollY));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // A pointer pushed against the top edge asks for the header, like a menu bar.
    const onPointer = (event: PointerEvent) => {
      if (event.clientY <= 10)
        setState((current) =>
          current.hidden ? { hidden: false, pivot: window.scrollY } : current,
        );
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [disabled]);

  const reveal = useCallback(
    () =>
      setState((current) =>
        current.hidden ? { hidden: false, pivot: window.scrollY } : current,
      ),
    [],
  );

  return { hidden: state.hidden && !disabled, reveal };
}
