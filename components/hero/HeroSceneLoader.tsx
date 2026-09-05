"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Box, Grid3X3, Pause, Play } from "lucide-react";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";

const Scene = dynamic(() => import("@/components/three/ArchitecturalScene"), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}
export function HeroSceneLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    if (!context) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    const timer = window.setTimeout(() => setEnabled(true), 150);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(container);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);
  return <div className="hero-scene" ref={root} aria-hidden="true"><Image src="/media/hero/poster.webp" alt="" fill priority sizes="100vw" className="scene-poster" />{enabled && <SceneBoundary><Scene visible={visible} /></SceneBoundary>}</div>;
}
export function SceneControls() {
  const { mode, setMode, paused, setPaused, reducedMotion } = useVisualPreferences();
  return <div className="scene-controls"><div className="segmented" role="group" aria-label="Scene appearance"><button aria-pressed={mode === "artistic"} onClick={() => setMode("artistic")}><Box size={13} /> Artistic</button><button aria-pressed={mode === "wireframe"} onClick={() => setMode("wireframe")}><Grid3X3 size={13} /> Wireframe</button></div><button className="icon-button" disabled={reducedMotion} onClick={() => setPaused(!paused)} aria-label={reducedMotion ? "Motion disabled by system preference" : paused ? "Resume animation" : "Pause animation"} title={reducedMotion ? "Reduced motion enabled" : paused ? "Resume animation" : "Pause animation"}>{paused || reducedMotion ? <Play size={13} /> : <Pause size={13} />}</button></div>;
}