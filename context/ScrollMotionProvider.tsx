"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import {
  FRAME_INTERVAL,
  nextFrameDeadline,
} from "@/lib/visuals/scene-performance";
import {
  createScenePose,
  type ScenePose,
} from "@/lib/visuals/scene-choreography";

gsap.registerPlugin(ScrollTrigger);

/** GSAP's documented defaults, restored when this provider releases the ticker. */
const DEFAULT_LAG_THRESHOLD = 500;
const DEFAULT_LAG_ADJUSTED = 33;

type FrameCallback = (deltaSeconds: number) => void;

type SceneInput = { x: number; y: number; manual: boolean };

type Engine = {
  subscribers: Set<FrameCallback>;
  pending: number;
  ambient: boolean;
  locks: number;
  lenis: Lenis | null;
  input: SceneInput;
};

export type SceneMotionController = {
  /** Mutable scene state written by the scroll timeline and read during a frame. */
  pose: ScenePose;
  subscribe: (callback: FrameCallback) => () => void;
  /** Schedules exactly one frame, for resize, theme, readiness or direct input. */
  requestFrame: () => void;
  /** True while ambient animation is allowed (not paused, reduced or hidden). */
  isAmbient: () => boolean;
  /** Temporarily locks page scrolling; the returned release is idempotent. */
  lockScroll: () => () => void;
  setInput: (x: number, y: number, manual?: boolean) => void;
  resetInput: () => void;
  readInput: () => Readonly<SceneInput>;
};

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

function createController() {
  const engine: Engine = {
    subscribers: new Set(),
    pending: 0,
    ambient: false,
    locks: 0,
    lenis: null,
    input: { x: 0, y: 0, manual: false },
  };
  let last = 0;
  let deadline = 0;

  const controller: SceneMotionController = {
    pose: createScenePose(),
    subscribe(callback) {
      engine.subscribers.add(callback);
      return () => {
        engine.subscribers.delete(callback);
      };
    },
    requestFrame() {
      engine.pending = Math.min(engine.pending + 1, 2);
    },
    isAmbient: () => engine.ambient,
    lockScroll() {
      engine.locks += 1;
      engine.lenis?.stop();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        engine.locks = Math.max(0, engine.locks - 1);
        if (engine.locks === 0) engine.lenis?.start();
      };
    },
    setInput(x, y, manual = false) {
      engine.input.x = clamp(x);
      engine.input.y = clamp(y);
      if (manual) engine.input.manual = true;
    },
    resetInput() {
      engine.input.x = 0;
      engine.input.y = 0;
      engine.input.manual = false;
    },
    readInput: () => engine.input,
  };

  // Every mutation of the engine lives here, so the provider only calls methods.
  const runtime = {
    attachScroller(lenis: Lenis | null) {
      engine.lenis = lenis;
      if (engine.locks > 0) lenis?.stop();
      // Lenis owns smoothing while it is active. The stylesheet keeps
      // `scroll-behavior: smooth` as the no-JS fallback, and leaving both on lets
      // native smooth scrolling fight the controller during programmatic jumps.
      if (lenis) document.documentElement.style.scrollBehavior = "auto";
      last = 0;
      deadline = 0;
    },
    detachScroller() {
      engine.lenis = null;
      document.documentElement.style.removeProperty("scroll-behavior");
    },
    setAmbient(active: boolean) {
      engine.ambient = active;
    },
    clearPending() {
      engine.pending = 0;
    },
    advance(now: number) {
      // Always advance Lenis first: scrolling must never depend on render gating.
      engine.lenis?.raf(now);
      if (!engine.ambient && engine.pending === 0) {
        last = now;
        deadline = now + FRAME_INTERVAL;
        return;
      }
      // The deadline applies to one-shot frames too, so the 60 Hz cap holds even
      // on displays and headless browsers that tick faster than the target.
      if (now + 0.5 < deadline) return;
      const delta = Math.min(Math.max(now - last, 0), 70) / 1000;
      last = now;
      deadline = nextFrameDeadline(deadline, now);
      if (engine.pending > 0) engine.pending -= 1;
      for (const callback of engine.subscribers) callback(delta);
    },
  };

  return { controller, runtime };
}

const MotionContext = createContext<SceneMotionController | null>(null);

export function useSceneMotion() {
  const controller = useContext(MotionContext);
  if (!controller) throw new Error("Scene motion requires ScrollMotionProvider");
  return controller;
}

export function ScrollMotionProvider({ children }: { children: ReactNode }) {
  const { paused, reducedMotion } = useVisualPreferences();
  const pageVisible = usePageVisibility();
  const [{ controller, runtime }] = useState(createController);

  useEffect(() => {
    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        autoRaf: false,
        // Next.js and the browser keep owning hash navigation and scroll restoration.
        anchors: false,
        autoResize: true,
        respectReducedMotion: true,
        smoothWheel: true,
        syncTouch: false,
        overscroll: true,
        lerp: 0.11,
      });
    } catch {
      lenis = null;
    }
    runtime.attachScroller(lenis);

    const syncTriggers = () => ScrollTrigger.update();
    lenis?.on("scroll", syncTriggers);
    gsap.ticker.lagSmoothing(0);

    const tick = (time: number) => runtime.advance(time * 1000);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(DEFAULT_LAG_THRESHOLD, DEFAULT_LAG_ADJUSTED);
      lenis?.off("scroll", syncTriggers);
      lenis?.destroy();
      runtime.detachScroller();
    };
  }, [runtime]);

  useEffect(() => {
    runtime.setAmbient(!paused && !reducedMotion && pageVisible);
    if (!pageVisible) {
      runtime.clearPending();
      return;
    }
    // Draw one frame so a resumed, paused or reduced-motion page still shows a
    // correct static composition instead of a stale or blank canvas.
    controller.requestFrame();
  }, [controller, runtime, paused, reducedMotion, pageVisible]);

  return (
    <MotionContext.Provider value={controller}>
      {children}
    </MotionContext.Provider>
  );
}
