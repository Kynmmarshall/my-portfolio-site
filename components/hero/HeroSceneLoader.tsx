"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { SceneBoundary } from "@/components/three/SceneBoundary";

const Scene = dynamic(() => import("@/components/three/PortraitScene"), {
  ssr: false,
});

export function HeroSceneLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;
    const memory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const limitedDevice =
      navigator.hardwareConcurrency <= 4 ||
      (memory !== undefined && memory <= 4);
    // Low-capability touch devices keep the real portrait and the single
    // background context instead of paying for a second WebGL context.
    if (limitedDevice && window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    const timer = window.setTimeout(() => setEnabled(true), 150);
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(container);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const handleFail = useCallback(() => setReady(false), []);
  const handleReady = useCallback((value: boolean) => setReady(value), []);

  return (
    <div
      className="hero-scene"
      ref={root}
      aria-hidden="true"
      data-ready={ready ? "true" : "false"}
    >
      <Image
        src="/media/profile/portrait.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 90vw, 38vw"
        className="scene-poster portrait-fallback"
      />
      {enabled && (
        <SceneBoundary onFail={handleFail}>
          <Scene visible={visible} onReady={handleReady} />
        </SceneBoundary>
      )}
    </div>
  );
}

export function SceneControls() {
  const { paused, setPaused, reducedMotion } = useVisualPreferences();
  return (
    <div className="scene-controls">
      <button
        className="icon-button"
        disabled={reducedMotion}
        onClick={() => setPaused(!paused)}
        aria-label={
          reducedMotion
            ? "Motion disabled by system preference"
            : paused
              ? "Resume animation"
              : "Pause animation"
        }
        title={
          reducedMotion
            ? "Reduced motion enabled"
            : paused
              ? "Resume animation"
              : "Pause animation"
        }
      >
        {paused || reducedMotion ? <Play size={13} /> : <Pause size={13} />}
      </button>
    </div>
  );
}
