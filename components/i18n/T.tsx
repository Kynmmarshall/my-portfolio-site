import type { ReactNode } from "react";
import {
  formatNumber,
  formatPercent,
  formatUtcDateTime,
  type Localized,
} from "@/lib/i18n";

/**
 * Both languages, one visible.
 *
 * Works in server and client components alike: nothing here reads state. The
 * wrappers are custom elements with `display: contents`, so they add no box and
 * cannot be caught by structural selectors such as `.row > span`. CSS hides the
 * inactive one using the `lang` attribute on <html>, and each carries its own
 * `lang` so screen readers pronounce the visible text correctly.
 */
export function T({ en, fr }: { en: ReactNode; fr: ReactNode }) {
  return (
    <>
      <t-en lang="en">{en}</t-en>
      <t-fr lang="fr">{fr}</t-fr>
    </>
  );
}

/** A translated data field. */
export function L({ text }: { text: Localized }) {
  return <T en={text.en} fr={text.fr} />;
}

/** A number written the way each language writes it (1,234 / 1 234). */
export function NumberText({ value }: { value: number }) {
  return <T en={formatNumber(value, "en")} fr={formatNumber(value, "fr")} />;
}

export function PercentText({ value }: { value: number }) {
  return <T en={formatPercent(value, "en")} fr={formatPercent(value, "fr")} />;
}

export function UtcDateTimeText({ iso }: { iso: string }) {
  return (
    <T en={formatUtcDateTime(iso, "en")} fr={formatUtcDateTime(iso, "fr")} />
  );
}

/** Text for assistive technology only, in the active language. */
export function SrOnly({ en, fr }: { en: ReactNode; fr: ReactNode }) {
  return (
    <span className="sr-only">
      <T en={en} fr={fr} />
    </span>
  );
}

/**
 * Accessible name for a landmark in server components, which cannot read the
 * language: render it once and point `aria-labelledby` at its id. The inactive
 * language is `display: none`, so only the visible one contributes to the name.
 */
export function NameFor({ id, text }: { id: string; text: Localized }) {
  return (
    <span id={id} className="sr-only">
      <L text={text} />
    </span>
  );
}
