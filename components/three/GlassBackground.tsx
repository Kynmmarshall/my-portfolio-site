"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/context/ThemeProvider";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { GlassSculpture } from "@/components/three/GlassSculpture";
import { SceneBoundary } from "@/components/three/SceneBoundary";
import { SceneFrameBridge } from "@/components/three/SceneFrameBridge";
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

export default function GlassBackground() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useSceneMotion();
  const { resolvedTheme } = useTheme();

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

  // Sustained slow frames demote quality; tier 3 unmounts the bridge and freezes.
  useEffect(() => {
    if (!start || lost || failed) return;
    const monitor = new SceneQualityMonitor();
    let previous = performance.now();
    return controller.subscribe(() => {
      const now = performance.now();
      const interval = now - previous;
      previous = now;
      const next = monitor.observe(interval, qualityRef.current);
      if (next === qualityRef.current) return;
      qualityRef.current = next;
      setQuality(next);
    });
  }, [controller, failed, lost, start]);

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
      data-target-fps={quality === 3 ? "0" : "60"}
    >
      {active && budget && (
        <SceneBoundary onFail={handleFail}>
          <Canvas
            camera={{ fov: 38, position: [0, 0, 9], near: 0.1, far: 40 }}
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
              // Halves the extra full-scene pass that transmission renders each frame.
              gl.transmissionResolutionScale =
                budget.transmissionResolutionScale;
            }}
            onPointerMissed={undefined}
          >
            {quality !== 3 && <SceneFrameBridge />}
            <GlassSculpture
              budget={budget}
              theme={resolvedTheme}
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
