"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Boxes,
  Database,
  GitBranch,
  Monitor,
  Server,
  ShieldCheck,
} from "lucide-react";
import { L, T } from "@/components/i18n/T";
import { useText } from "@/hooks/useLocale";
import type { Localized } from "@/lib/i18n";

type Step = { icon: typeof Monitor; title: Localized; description: Localized };
const same = (text: string): Localized => ({ en: text, fr: text });

const flows: Record<"application" | "delivery", Step[]> = {
  application: [
    {
      icon: Monitor,
      title: same("Flutter + Provider"),
      description: {
        en: "Cross-platform screens, state management, and recipe discovery.",
        fr: "Écrans multiplateformes, gestion d'état et découverte de recettes.",
      },
    },
    {
      icon: Server,
      title: same("Node.js + Express"),
      description: {
        en: "Documented REST service boundaries for recipes, profiles, and authentication.",
        fr: "Frontières de services REST documentées pour les recettes, les profils et l'authentification.",
      },
    },
    {
      icon: Database,
      title: same("PostgreSQL"),
      description: {
        en: "Relational persistence for users, recipes, and saved favourites.",
        fr: "Persistance relationnelle pour les utilisateurs, les recettes et les favoris enregistrés.",
      },
    },
  ],
  delivery: [
    {
      icon: GitBranch,
      title: { en: "Source repository", fr: "Dépôt du code source" },
      description: {
        en: "The shared application source and versioned Jenkins pipeline.",
        fr: "Le code source partagé de l'application et le pipeline Jenkins versionné.",
      },
    },
    {
      icon: ShieldCheck,
      title: { en: "Analysis + tests", fr: "Analyse + tests" },
      description: {
        en: "Flutter analysis, automated tests, and coverage report generation.",
        fr: "Analyse Flutter, tests automatisés et génération du rapport de couverture.",
      },
    },
    {
      icon: Boxes,
      title: { en: "Build + package", fr: "Build + packaging" },
      description: {
        en: "Android APK and App Bundle creation, with archived build artifacts.",
        fr: "Création de l'APK et de l'App Bundle Android, avec archivage des artefacts de build.",
      },
    },
    {
      icon: Server,
      title: { en: "VPS delivery", fr: "Livraison sur VPS" },
      description: {
        en: "The documented pipeline copies the website and release artifacts into the hosted project directory.",
        fr: "Le pipeline documenté copie le site web et les artefacts de publication dans le répertoire du projet hébergé.",
      },
    },
  ],
};
export function ArchitectureExplorer() {
  const [mode, setMode] = useState<keyof typeof flows>("application");
  const t = useText();
  return (
    <section className="architecture-explorer">
      <div className="architecture-heading">
        <div>
          <p className="eyebrow">
            <T en="DOCUMENTED ARCHITECTURE" fr="ARCHITECTURE DOCUMENTÉE" />
          </p>
          <h2>
            <T en="How the parts connect." fr="Comment les pièces s'assemblent." />
          </h2>
        </div>
        <div
          className="segmented"
          role="group"
          aria-label={t({ en: "Architecture view", fr: "Vue de l'architecture" })}
        >
          <button
            aria-pressed={mode === "application"}
            onClick={() => setMode("application")}
          >
            <T en="Application" fr="Application" />
          </button>
          <button
            aria-pressed={mode === "delivery"}
            onClick={() => setMode("delivery")}
          >
            <T en="Delivery" fr="Livraison" />
          </button>
        </div>
      </div>
      <ol className="architecture-flow">
        {flows[mode].map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title.en}>
              <span className="architecture-icon">
                <Icon size={22} />
              </span>
              <div>
                <h3>
                  <L text={step.title} />
                </h3>
                <p>
                  <L text={step.description} />
                </p>
              </div>
              {index < flows[mode].length - 1 && (
                <ArrowDown className="flow-arrow" size={14} />
              )}
            </li>
          );
        })}
      </ol>
      <a
        className="text-link"
        href="https://github.com/Kynmmarshall/Pick-My-Dish"
        target="_blank"
        rel="noreferrer"
      >
        <T en="Source documentation" fr="Documentation du code source" />{" "}
        <ArrowUpRight size={14} />
      </a>
    </section>
  );
}
