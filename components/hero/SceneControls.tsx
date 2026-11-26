"use client";

import { Pause, Play } from "lucide-react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";

export function SceneControls() {
  const { paused, setPaused, reducedMotion } = useVisualPreferences();
  const label = reducedMotion
    ? "Motion disabled by system preference"
    : paused
      ? "Resume animation"
      : "Pause animation";
  return (
    <div className="scene-controls">
      <button
        className="icon-button"
        disabled={reducedMotion}
        onClick={() => setPaused(!paused)}
        aria-label={label}
        title={reducedMotion ? "Reduced motion enabled" : label}
      >
        {paused || reducedMotion ? <Play size={18} /> : <Pause size={18} />}
      </button>
    </div>
  );
}
