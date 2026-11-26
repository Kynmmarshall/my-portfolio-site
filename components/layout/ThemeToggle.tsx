"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { useText } from "@/hooks/useLocale";
import { T } from "@/components/i18n/T";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useText();

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      title={t({ en: "Toggle light/dark theme", fr: "Basculer entre thème clair et sombre" })}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="theme-to-dark">
        <Moon size={16} aria-hidden="true" />
        <span className="sr-only">
          <T en="Switch to dark theme" fr="Passer au thème sombre" />
        </span>
      </span>
      <span className="theme-to-light">
        <Sun size={16} aria-hidden="true" />
        <span className="sr-only">
          <T en="Switch to light theme" fr="Passer au thème clair" />
        </span>
      </span>
    </button>
  );
}
