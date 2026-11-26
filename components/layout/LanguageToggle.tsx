"use client";

import { LOCALES, type Locale } from "@/lib/i18n";
import { setLocale, useLocale } from "@/hooks/useLocale";
import { T } from "@/components/i18n/T";

const NAMES: Record<Locale, string> = { en: "English", fr: "Français" };

/** Compact EN | FR switch. Each button is named in its own language. */
export function LanguageToggle() {
  const locale = useLocale();
  return (
    <fieldset className="lang-toggle">
      <legend className="sr-only">
        <T en="Language" fr="Langue" />
      </legend>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          aria-label={NAMES[code]}
          title={NAMES[code]}
          onClick={() => setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </fieldset>
  );
}
