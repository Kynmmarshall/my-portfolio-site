"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_STORAGE_KEY, isLocale, pick } from "@/lib/i18n";
import { metaForPath } from "@/lib/i18n-meta";
import { useLocale } from "@/hooks/useLocale";

/**
 * Keeps the document in step with the chosen language.
 *
 * The server-rendered <title> and description are static, so this retitles the
 * page when the language or the route changes, and follows a change made in
 * another tab. A mutation observer re-applies the title if the framework rewrites
 * it during a client navigation. Link-preview cards come from the static HTML and
 * stay English.
 */
export function LocaleEffects() {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    const meta = metaForPath(pathname);
    if (!meta) return;
    const apply = () => {
      const title = pick(meta.title, locale);
      if (document.title !== title) document.title = title;
      const description = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      const text = pick(meta.description, locale);
      if (description && description.content !== text)
        description.content = text;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [locale, pathname]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCALE_STORAGE_KEY && isLocale(event.newValue))
        document.documentElement.lang = event.newValue;
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
