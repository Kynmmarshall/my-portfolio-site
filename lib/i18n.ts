/**
 * Language support.
 *
 * Pure module: no DOM or React, so the rules are unit testable. The site carries
 * both languages in the page and CSS shows the active one, selected by the `lang`
 * attribute on <html>. That attribute is the single source of truth; the inline
 * bootstrap below sets it before first paint, so there is never a flash of the
 * wrong language and static rendering is untouched.
 */

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "portfolio-lang";

/** A string in every supported language. */
export type Localized = { readonly en: string; readonly fr: string };

export const isLocale = (value: unknown): value is Locale =>
  value === "en" || value === "fr";

/** The saved choice wins; otherwise the browser's first preferred language decides. */
export function detectLocale(
  stored: string | null | undefined,
  languages: readonly string[],
): Locale {
  if (isLocale(stored)) return stored;
  return /^fr(?:[-_]|$)/i.test(languages[0] ?? "") ? "fr" : DEFAULT_LOCALE;
}

export const pick = (text: Localized, locale: Locale) => text[locale];

/** BCP 47 tags for number and date formatting. */
export const FORMAT_LOCALE: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

export const formatNumber = (value: number, locale: Locale) =>
  value.toLocaleString(FORMAT_LOCALE[locale]);

/** One decimal place, with the locale's separator and percent spacing. */
export function formatPercent(value: number, locale: Locale) {
  const digits = value.toLocaleString(FORMAT_LOCALE[locale], {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return locale === "fr" ? `${digits}\u00a0%` : `${digits}%`;
}

export const formatUtcDateTime = (iso: string, locale: Locale) =>
  `${new Date(iso).toLocaleString(FORMAT_LOCALE[locale], {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;

/**
 * Inline script that runs before first paint. It mirrors `detectLocale` and is
 * covered by a unit test that executes it against fake browser globals.
 */
export const LOCALE_BOOTSTRAP_SCRIPT = `try{var k=${JSON.stringify(LOCALE_STORAGE_KEY)},l=localStorage.getItem(k);if(l!=='en'&&l!=='fr'){var n=(navigator.languages&&navigator.languages[0])||navigator.language||'';l=/^fr(?:[-_]|$)/i.test(n)?'fr':'en'}document.documentElement.lang=l}catch(e){}`;
