"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "system" | "light" | "dark";

const ThemeContext = createContext<{
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
} | null>(null);

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerTheme(): "light" | "dark" {
  return "light";
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme requires ThemeProvider");
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerTheme,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        resolvedTheme: theme === "system" ? systemTheme : theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
