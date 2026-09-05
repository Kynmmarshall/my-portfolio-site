"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";

const Scene = dynamic(() => import("@/components/three/PortraitScene"), {
  ssr: false,
});
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export function HeroSceneLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
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
  return (
    <div className="hero-scene" ref={root} aria-hidden="true">
      <Image
        src="/media/profile/portrait.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 90vw, 38vw"
        className="scene-poster portrait-fallback"
      />
      {enabled && (
        <SceneBoundary>
          <Scene visible={visible} />
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
