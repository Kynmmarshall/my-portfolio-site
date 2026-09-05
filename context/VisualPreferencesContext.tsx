"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

type Preferences = {
  mode: "artistic" | "wireframe";
  setMode: (mode: "artistic" | "wireframe") => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
  reducedMotion: boolean;
};
const VisualContext = createContext<Preferences | null>(null);
let memoryMode: Preferences["mode"] | null = null;
const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("scene-preference", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("scene-preference", callback);
  };
};
const getMode = (): Preferences["mode"] => {
  if (memoryMode) return memoryMode;
  try {
    return localStorage.getItem("scene-mode") === "wireframe"
      ? "wireframe"
      : "artistic";
  } catch {
    return "artistic";
  }
};

export function VisualPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const mode = useSyncExternalStore(
    subscribeStorage,
    getMode,
    () => "artistic" as const,
  );
  const reducedMotion = useSyncExternalStore(
    subscribe,
    getReducedMotion,
    () => true,
  );
  const [paused, setPaused] = useState(false);
  function setMode(nextMode: Preferences["mode"]) {
    memoryMode = nextMode;
    try {
      localStorage.setItem("scene-mode", nextMode);
    } catch {
      memoryMode = nextMode;
    }
    window.dispatchEvent(new Event("scene-preference"));
  }
  return (
    <VisualContext.Provider
      value={{ mode, setMode, paused, setPaused, reducedMotion }}
    >
      {children}
    </VisualContext.Provider>
  );
}

export function useVisualPreferences() {
  const context = useContext(VisualContext);
  if (!context) throw new Error("Visual preferences require a provider");
  return context;
}
