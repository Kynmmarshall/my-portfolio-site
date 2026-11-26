"use client";

import { Pause, Play } from "lucide-react";
import { useVisualPreferences } from "@/context/VisualPreferencesContext";
import { useText } from "@/hooks/useLocale";

export function SceneControls() {
  const { paused, setPaused, reducedMotion } = useVisualPreferences();
  const t = useText();
  let label = t({ en: "Pause animation", fr: "Mettre l'animation en pause" });
  if (reducedMotion)
    label = t({
      en: "Motion disabled by system preference",
      fr: "Animation désactivée par la préférence système",
    });
  else if (paused)
    label = t({ en: "Resume animation", fr: "Reprendre l'animation" });
  return (
    <div className="scene-controls">
      <button
        className="icon-button"
        disabled={reducedMotion}
        onClick={() => setPaused(!paused)}
        aria-label={label}
        title={
          reducedMotion
            ? t({
                en: "Reduced motion enabled",
                fr: "Réduction des animations activée",
              })
            : label
        }
      >
        {paused || reducedMotion ? <Play size={18} /> : <Pause size={18} />}
      </button>
    </div>
  );
}
