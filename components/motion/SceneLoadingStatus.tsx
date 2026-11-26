"use client";

import { useSyncExternalStore } from "react";
import { useText } from "@/hooks/useLocale";
import type { Localized } from "@/lib/i18n";
import {
  getSceneLoadingSnapshot,
  getServerSceneLoadingSnapshot,
  subscribeSceneLoading,
} from "@/lib/visuals/scene-loading";

function describe(phase: string, loaded: number, total: number): Localized | null {
  if (phase === "failed")
    return {
      en: "Background scene unavailable. Page is ready.",
      fr: "Scène d'arrière-plan indisponible. La page est prête.",
    };
  if (phase === "ready")
    return { en: "Background scene ready.", fr: "Scène d'arrière-plan prête." };
  if (phase !== "preparing") return null;
  return total > 0
    ? {
        en: `Preparing background scene. ${loaded} of ${total} assets loaded.`,
        fr: `Préparation de la scène d'arrière-plan. ${loaded} ressources sur ${total} chargées.`,
      }
    : {
        en: "Preparing background scene.",
        fr: "Préparation de la scène d'arrière-plan.",
      };
}

/**
 * Non-blocking loading presentation.
 *
 * Lives outside the aria-hidden canvas so assistive technology gets the
 * milestones, and never covers or gates the page: content is server-rendered and
 * usable while this reports progress.
 */
export function SceneLoadingStatus() {
  const { phase, loaded, total } = useSyncExternalStore(
    subscribeSceneLoading,
    getSceneLoadingSnapshot,
    getServerSceneLoadingSnapshot,
  );
  const determinate = total > 0;
  const t = useText();
  const message = describe(phase, loaded, total);
  return (
    <>
      <div className="scene-loader" data-phase={phase} aria-hidden="true">
        <span
          className="scene-loader-bar"
          data-determinate={determinate ? "true" : "false"}
          style={
            determinate
              ? { transform: `scaleX(${Math.min(loaded / total, 1)})` }
              : undefined
          }
        />
      </div>
      <p className="sr-only" role="status">
        {message ? t(message) : ""}
      </p>
    </>
  );
}
