"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  pick,
  type Locale,
  type Localized,
} from "@/lib/i18n";

/** The `lang` attribute on <html> is the single source of truth, set before first paint. */
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  return () => observer.disconnect();
};
const current = (): Locale => {
  const lang = document.documentElement.lang;
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
};

/** Server rendering and hydration use the default; the real language follows right after. */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, current, () => DEFAULT_LOCALE);
}

export function setLocale(next: Locale) {
  document.documentElement.lang = next;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Storage can be blocked; the choice then lasts for this visit only.
  }
}

/** For text that must be a string (attributes, titles, messages) rather than markup. */
export function useText() {
  const locale = useLocale();
  return useCallback((text: Localized) => pick(text, locale), [locale]);
}
