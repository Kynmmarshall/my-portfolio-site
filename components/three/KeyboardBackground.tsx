"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { SceneBoundary } from "@/components/three/SceneBoundary";
import { SceneFrameBridge } from "@/components/three/SceneFrameBridge";
import { Keyboard } from "@/components/three/keyboard/Keyboard";
import {
  SceneQualityMonitor,
  initialSceneQuality,
  sceneBudget,
  type SceneQuality,
} from "@/lib/visuals/scene-performance";
import {
  beginScenePreparation,
  completeScene,
  failScene,
  resetSceneLoading,
} from "@/lib/visuals/scene-loading";

type Viewport = { width: number; height: number; ratio: number };

/** Redraw interval while nothing animates, to repaint a canvas the browser discarded. */
const KEEPALIVE_MS = 15_000;
/** Wait before rebuilding the canvas after a lost context. */
const RECOVERY_DELAY_MS = 800;
/** Rebuilds allowed within RECOVERY_PERIOD_MS before the scene is given up on. */
const MAX_CONTEXT_RECOVERIES = 3;
const RECOVERY_PERIOD_MS = 60_000;

function readViewport(): Viewport {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  };
}

/** Eligibility is decided before any WebGL context is kept. */
function eligible() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return false;
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function KeyboardBackground() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useSceneMotion();

  // This module is only ever imported with `ssr: false`, so measuring during the
  // first client render avoids a blank frame and a cascading state update.
  const [start] = useState(() =>
    eligible()
      ? {
          viewport: readViewport(),
          quality: initialSceneQuality({
            width: window.innerWidth,
            coarsePointer: matchMedia("(pointer: coarse)").matches,
            cores: navigator.hardwareConcurrency,
            memory: (navigator as Navigator & { deviceMemory?: number })
              .deviceMemory,
          }),
        }
      : null,
  );
  const [viewport, setViewport] = useState<Viewport | null>(
    start?.viewport ?? null,
  );
  const [quality, setQuality] = useState<SceneQuality>(start?.quality ?? 1);
  const [failed, setFailed] = useState(false);
  const [lost, setLost] = useState(false);
  // Bumped to build a fresh canvas (and WebGL context) after a context loss.
  const [generation, setGeneration] = useState(0);
  // One monitor for the whole mount, so the tier it started at stays the ceiling.
  const [monitor] = useState(() => new SceneQualityMonitor());
  const losses = useRef<number[]>([]);
  const qualityRef = useRef<SceneQuality>(start?.quality ?? 1);

  useEffect(() => {
    if (!start) return;
    beginScenePreparation();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const resize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setViewport(readViewport()), 120);
    };
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", resize);
      resetSceneLoading();
    };
  }, [start]);

  // Pointer and sensor input feed the shared controller, never React state.
  useEffect(() => {
    if (!start) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || controller.readInput().manual) return;
      controller.setInput(
        (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1,
        (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1,
      );
    };
    const tilt = (event: Event) => {
      if (controller.readInput().manual) return;
      const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
      if (!Number.isFinite(detail?.x) || !Number.isFinite(detail?.y)) return;
      controller.setInput(detail.x, detail.y);
    };
    const blur = () => {
      if (!controller.readInput().manual) controller.setInput(0, 0);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("portfolio:tilt", tilt);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("portfolio:tilt", tilt);
      window.removeEventListener("blur", blur);
    };
  }, [controller, start]);

  // Sustained slow frames demote quality and a healthy stretch wins it back. Gaps
  // in the frame stream (an idle, covered or backgrounded page) are discarded by
  // the monitor and by the resets below, never counted as a slow GPU.
  useEffect(() => {
    if (!start || lost || failed) return;
    const clock = { previous: performance.now() };
    const resume = () => {
      clock.previous = performance.now();
      monitor.reset();
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("blur", resume);
    const unsubscribe = controller.subscribe(() => {
      const now = performance.now();
      const interval = now - clock.previous;
      clock.previous = now;
      const next = monitor.observe(interval, qualityRef.current);
      if (next === qualityRef.current) return;
      qualityRef.current = next;
      setQuality(next);
    });
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("blur", resume);
    };
  }, [controller, failed, lost, monitor, start]);

  // A browser may discard the pixels of an idle canvas. While something animates
  // every frame repaints them; when nothing does (paused, reduced motion) these
  // redraws put the picture back on return and slowly in the meantime.
  useEffect(() => {
    if (!start) return;
    const redraw = () => controller.requestFrame();
    const onVisible = () => {
      if (!document.hidden) redraw();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", redraw);
    window.addEventListener("pageshow", redraw);
    const timer = setInterval(() => {
      if (!controller.isAmbient() && !document.hidden) redraw();
    }, KEEPALIVE_MS);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", redraw);
      window.removeEventListener("pageshow", redraw);
    };
  }, [controller, start]);

  // A lost context (the GPU reclaimed it while the page idled, or a driver reset)
  // is recovered by building a new canvas. A few recoveries are allowed per minute;
  // beyond that the page settles without a background rather than flapping.
  useEffect(() => {
    if (!lost || failed) return;
    const timer = setTimeout(() => {
      const now = performance.now();
      const recent = [
        ...losses.current.filter((at) => now - at < RECOVERY_PERIOD_MS),
        now,
      ];
      losses.current = recent;
      if (recent.length > MAX_CONTEXT_RECOVERIES) {
        failScene();
        setFailed(true);
        return;
      }
      setGeneration((current) => current + 1);
      setLost(false);
    }, RECOVERY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [failed, lost]);

  const budget = viewport
    ? sceneBudget(viewport.width, viewport.height, viewport.ratio, quality)
    : null;

  const handleFirstFrame = useCallback(() => {
    if (host.current) host.current.dataset.ready = "true";
    completeScene();
  }, []);

  const handleFail = useCallback(() => {
    failScene();
    setFailed(true);
  }, []);

  const active = Boolean(start) && budget !== null && !lost && !failed;

  return (
    <div
      ref={host}
      className="scene-background"
      aria-hidden="true"
      data-ready="false"
      data-quality={quality}
      data-vertices={budget?.vertices ?? 0}
      data-vertex-limit={budget?.vertexLimit ?? 0}
      data-draw-calls={budget?.drawCalls ?? 0}
      data-draw-limit={budget?.drawCountLimit ?? 0}
      data-target-fps={quality === 3 ? "0" : "60"}
    >
      {active && budget && (
        <SceneBoundary onFail={handleFail}>
          <Canvas
            key={generation}
            camera={{ fov: 38, position: [0, 0, 10], near: 0.1, far: 400 }}
            dpr={budget.ratio}
            frameloop="never"
            gl={{
              alpha: true,
              antialias: quality === 0,
              powerPreference: "low-power",
              preserveDrawingBuffer: false,
              stencil: false,
              depth: true,
            }}
            onCreated={({ gl }) => {
              gl.setClearAlpha(0);
              gl.shadowMap.enabled = false;
            }}
            onPointerMissed={undefined}
          >
            {quality !== 3 && <SceneFrameBridge />}
            <Keyboard
              budget={budget}
              onFirstFrame={handleFirstFrame}
            />
          </Canvas>
        </SceneBoundary>
      )}
      <ContextLossWatcher host={host} onLost={() => setLost(true)} />
    </div>
  );
}

/** Watches the live canvas for context loss without re-attaching on every render. */
function ContextLossWatcher({
  host,
  onLost,
}: {
  host: React.RefObject<HTMLDivElement | null>;
  onLost: () => void;
}) {
  useEffect(() => {
    const element = host.current;
    const canvas = element?.querySelector("canvas");
    if (!canvas) return;
    const handle = (event: Event) => {
      event.preventDefault();
      if (element) element.dataset.ready = "false";
      onLost();
    };
    canvas.addEventListener("webglcontextlost", handle);
    return () => canvas.removeEventListener("webglcontextlost", handle);
  });
  return null;
}
