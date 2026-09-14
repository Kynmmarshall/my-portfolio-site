"use client";

import { useSyncExternalStore } from "react";
import {
  getSceneLoadingSnapshot,
  getServerSceneLoadingSnapshot,
  subscribeSceneLoading,
} from "@/lib/visuals/scene-loading";

function describe(phase: string, loaded: number, total: number) {
  if (phase === "failed") return "Background scene unavailable. Page is ready.";
  if (phase === "ready") return "Background scene ready.";
  if (phase !== "preparing") return "";
  return total > 0
    ? `Preparing background scene. ${loaded} of ${total} assets loaded.`
    : "Preparing background scene.";
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
        {describe(phase, loaded, total)}
      </p>
    </>
  );
}
