"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Code2, GitBranch, Activity } from "lucide-react";
import {
  analyticsSchema,
  type Analytics,
  type Snapshot,
} from "@/lib/schemas/analytics";
import { LanguageBreakdown } from "./LanguageBreakdown";
import { T } from "@/components/i18n/T";
import { useLocale, useText } from "@/hooks/useLocale";
import { formatNumber } from "@/lib/i18n";

export function InsightsPreview() {
  const root = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<Analytics> | null>(null);
  const locale = useLocale();
  const t = useText();
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch("/api/insights", { signal: controller.signal })
          .then((response) => {
            if (!response.ok) throw new Error("Insights unavailable");
            return response.json();
          })
          .then((response) => {
            setSnapshot({
              ...response,
              data: response.data ? analyticsSchema.parse(response.data) : null,
            });
          })
          .catch(() => {
            if (!controller.signal.aborted)
              setSnapshot({
                state: "unavailable",
                collectedAt: null,
                data: null,
              });
          });
      },
      { rootMargin: "200px" },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, []);
  let note = t({
    en: "Source: public GitHub repositories",
    fr: "Source : dépôts GitHub publics",
  });
  if (snapshot?.collectedAt) {
    const stale = snapshot.state === "stale";
    const date = snapshot.collectedAt.slice(0, 10);
    note = t({
      en: `GitHub / ${stale ? "stale snapshot" : "cached snapshot"} / ${date}`,
      fr: `GitHub / ${stale ? "instantané périmé" : "instantané en cache"} / ${date}`,
    });
  }
  let languagesNote = t({
    en: "Repository insights are awaiting a successful data refresh.",
    fr: "Les statistiques des dépôts attendent une actualisation réussie des données.",
  });
  if (snapshot === null)
    languagesNote = t({
      en: "Loading repository data...",
      fr: "Chargement des données des dépôts...",
    });
  return (
    <div ref={root}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span /> <T en="THE WORK, IN NUMBERS" fr="LE TRAVAIL, EN CHIFFRES" />
          </p>
          <h2>
            <T en="A look under the hood." fr="Un coup d'œil sous le capot." />
          </h2>
        </div>
        <Link href="/insights" className="text-link">
          <T en="Explore the insights" fr="Explorer les statistiques" />{" "}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="insights-preview">
        <div className="insight-numbers">
          <div>
            <Code2 size={19} />
            <strong>{snapshot?.data?.repositories ?? "--"}</strong>
            <span>
              <T en="Public repositories" fr="Dépôts publics" />
            </span>
          </div>
          <div>
            <GitBranch size={19} />
            <strong>
              {snapshot?.data?.contributions == null
                ? "--"
                : formatNumber(snapshot.data.contributions, locale)}
            </strong>
            <span>
              <T en="Yearly contributions" fr="Contributions annuelles" />
            </span>
          </div>
          <div>
            <Activity size={19} />
            <strong>04</strong>
            <span>
              <T en="Engineering disciplines" fr="Disciplines d'ingénierie" />
            </span>
          </div>
        </div>
        <div className="preview-languages">
          <h3>
            <T en="Languages in the codebase" fr="Langages dans le code" />
          </h3>
          {snapshot?.data?.languages.length ? (
            <LanguageBreakdown languages={snapshot.data.languages} compact />
          ) : (
            <p className="data-note">{languagesNote}</p>
          )}
          <p className="data-note">{note}</p>
        </div>
      </div>
    </div>
  );
}
