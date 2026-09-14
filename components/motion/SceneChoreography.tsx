"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import {
  applyPoseAtProgress,
  resolveStops,
  type SceneKey,
  type SceneStop,
} from "@/lib/visuals/scene-choreography";

gsap.registerPlugin(ScrollTrigger);

/**
 * Binds scroll depth to the shared scene pose.
 *
 * Uses a plain ScrollTrigger `onUpdate` rather than a scrubbed tween: Lenis
 * already owns the smoothing, so a second easing layer here would show up as lag
 * between the content and the background.
 *
 * Nothing is drawn from here. While motion is paused or reduced the pose still
 * tracks scroll, but no frame is requested, so the canvas stays frozen.
 */
export function SceneChoreography() {
  const pathname = usePathname();
  const controller = useSceneMotion();

  useEffect(() => {
    let stops: SceneStop[] = [];

    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scene]"),
      ).map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          key: element.dataset.scene as SceneKey,
          top: rect.top + window.scrollY,
          height: rect.height,
        };
      });
      const range = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      stops = resolveStops(sections, range, window.innerHeight);
      applyPoseAtProgress(
        controller.pose,
        stops,
        range > 0 ? window.scrollY / range : 0,
      );
    };

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        onRefresh: measure,
        onUpdate: (self) =>
          applyPoseAtProgress(controller.pose, stops, self.progress),
      });
    });

    measure();
    controller.requestFrame();

    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastHeight = document.documentElement.scrollHeight;
    // Streamed content, font swaps and orientation changes all move section boxes.
    // Our own stops are cheap to recompute, but a global ScrollTrigger refresh
    // resets and restores scroll position, which would cancel an in-flight scroll.
    // So refresh only when the document height really changed, and in safe mode so
    // GSAP defers it until scrolling stops.
    const resync = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        measure();
        const height = document.documentElement.scrollHeight;
        if (height === lastHeight) return;
        lastHeight = height;
        ScrollTrigger.refresh(true);
      }, 200);
    };
    document.fonts?.ready.then(resync).catch(() => {});
    const observer = new ResizeObserver(resync);
    observer.observe(document.body);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      context.revert();
    };
  }, [controller, pathname]);

  return null;
}
