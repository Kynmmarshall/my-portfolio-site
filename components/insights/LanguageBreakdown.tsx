import type { Language } from "@/lib/schemas/analytics";
import { PercentText, T } from "@/components/i18n/T";
const colors = [
  "#258675",
  "#c58d5b",
  "#7f8fbc",
  "#859b52",
  "#a7769d",
  "#577b9b",
  "#99a398",
];
export function LanguageBreakdown({
  languages,
  compact = false,
}: {
  languages: Language[];
  compact?: boolean;
}) {
  return (
    <>
      <div className="language-bar" aria-hidden="true">
        {languages.map((language, index) => (
          <span
            key={language.name}
            style={{
              width: `${language.share}%`,
              background: colors[index % colors.length],
            }}
          />
        ))}
      </div>
      <div className={compact ? "language-legend compact" : "language-legend"}>
        {languages.map((language, index) => (
          <div key={language.name}>
            <span className="language-label">
              <i style={{ background: colors[index % colors.length] }} />
              {language.name === "Other" ? (
                <T en="Other" fr="Autres" />
              ) : (
                language.name
              )}
            </span>
            <span className="mono">
              <PercentText value={language.share} />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
