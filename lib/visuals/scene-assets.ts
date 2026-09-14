import {
  LoadingManager,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import { failScene, reportSceneAssets } from "./scene-loading";

const PORTRAIT_URL = "/media/profile/portrait.webp";

let texture: Texture | null = null;
let pending: Promise<Texture | null> | null = null;
let manager: LoadingManager | null = null;
let refCount = 0;
/** Invalidates in-flight loads whose owner unmounted before they resolved. */
let generation = 0;

/**
 * Ref-counted portrait texture backed by a scene-owned LoadingManager.
 *
 * Owning the resource explicitly (instead of relying on the `useTexture` cache)
 * keeps disposal deterministic and gives the loading UI real item counts.
 */
export function acquirePortraitTexture(): Promise<Texture | null> {
  refCount += 1;
  if (texture) return Promise.resolve(texture);
  if (pending) return pending;

  const owned = generation;
  manager = new LoadingManager();
  manager.onStart = (_url, loaded, total) => reportSceneAssets(loaded, total);
  manager.onProgress = (_url, loaded, total) => reportSceneAssets(loaded, total);

  pending = new Promise<Texture | null>((resolve) => {
    new TextureLoader(manager ?? undefined).load(
      PORTRAIT_URL,
      (loaded) => {
        loaded.colorSpace = SRGBColorSpace;
        if (owned !== generation) {
          // Released while the request was still in flight.
          loaded.dispose();
          resolve(null);
          return;
        }
        texture = loaded;
        resolve(loaded);
      },
      undefined,
      () => {
        if (owned === generation) failScene();
        resolve(null);
      },
    );
  });
  return pending;
}

export function releasePortraitTexture() {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;
  generation += 1;
  texture?.dispose();
  texture = null;
  pending = null;
  if (manager) {
    const noop = () => {};
    manager.onStart = noop;
    manager.onProgress = noop;
    manager = null;
  }
}
