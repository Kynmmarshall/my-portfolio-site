"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      title="Toggle light/dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="theme-to-dark">
        <Moon size={16} aria-hidden="true" />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="theme-to-light">
        <Sun size={16} aria-hidden="true" />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}
