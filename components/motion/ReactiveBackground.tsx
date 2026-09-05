"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";

export function ReactiveBackground() {
  const { paused, reducedMotion, mode } = useVisualPreferences();
  const visible = usePageVisibility();
  const pathname = usePathname();
  useEffect(() => {
    const root = document.getElementById("main");
    if (!root) return;
    root.dataset.backgroundMode = mode;
    if (paused || reducedMotion || !visible) return;
    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScroll = window.scrollY * 0.04;
    let targetScroll = currentScroll;
    const update = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      currentScroll += (targetScroll - currentScroll) * 0.12;
      root.style.setProperty("--ambient-x", `${currentX.toFixed(2)}px`);
      root.style.setProperty("--ambient-y", `${currentY.toFixed(2)}px`);
      root.style.setProperty(
        "--ambient-scroll",
        `${currentScroll.toFixed(2)}px`,
      );
      if (
        Math.abs(targetX - currentX) +
          Math.abs(targetY - currentY) +
          Math.abs(targetScroll - currentScroll) >
        0.1
      )
        frame = requestAnimationFrame(update);
      else frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 32;
      targetY = (event.clientY / window.innerHeight - 0.5) * 24;
      schedule();
    };
    const scroll = () => {
      targetScroll = window.scrollY * 0.04;
      schedule();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, [paused, reducedMotion, visible, pathname, mode]);
  return null;
}
