/**
 * Scene loading state.
 *
 * Deliberately free of Three.js and React imports so the status UI can subscribe
 * without pulling the WebGL bundle into the initial page payload.
 *
 * Counts represent real file requests tracked by a Three.js LoadingManager. A
 * fully procedural scene downloads nothing, so `total` stays 0 and readiness is
 * reported by the renderer instead of by a fabricated percentage.
 */

export type ScenePhase = "idle" | "preparing" | "ready" | "failed";

export type SceneLoadingSnapshot = {
  phase: ScenePhase;
  loaded: number;
  total: number;
};

const IDLE: SceneLoadingSnapshot = { phase: "idle", loaded: 0, total: 0 };

let snapshot: SceneLoadingSnapshot = IDLE;
const listeners = new Set<() => void>();

function publish(next: SceneLoadingSnapshot) {
  if (
    next.phase === snapshot.phase &&
    next.loaded === snapshot.loaded &&
    next.total === snapshot.total
  )
    return;
  snapshot = next;
  for (const listener of listeners) listener();
}

export function getSceneLoadingSnapshot() {
  return snapshot;
}

export function getServerSceneLoadingSnapshot() {
  return IDLE;
}

export function subscribeSceneLoading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function beginScenePreparation() {
  if (snapshot.phase === "ready") return;
  publish({ ...snapshot, phase: "preparing" });
}

export function reportSceneAssets(loaded: number, total: number) {
  publish({
    phase: snapshot.phase === "idle" ? "preparing" : snapshot.phase,
    loaded,
    total,
  });
}

export function completeScene() {
  publish({ ...snapshot, phase: "ready" });
}

export function failScene() {
  publish({ ...snapshot, phase: "failed" });
}

export function resetSceneLoading() {
  publish(IDLE);
}
