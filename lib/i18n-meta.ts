import type { Localized } from "./i18n.ts";

/**
 * Titles and descriptions per page, in both languages. Used to retitle the
 * document when the language changes, because the server-rendered <title> is
 * static. Project pages are not listed: their titles are product names.
 */

export const TITLE_SUFFIX = "Kynmmarshall";

export const SITE_TITLE: Localized = {
  en: "Kynmmarshall | Software, systems & a little play",
  fr: "Kynmmarshall | Logiciels, systèmes et un peu de jeu",
};

export const SITE_DESCRIPTION: Localized = {
  en: "Kamdeu Yamdjeuson Neil Marshall. Software engineer building cross-platform applications, interactive games, and deployment automation in Cameroon.",
  fr: "Kamdeu Yamdjeuson Neil Marshall. Ingénieur logiciel qui conçoit des applications multiplateformes, des jeux interactifs et de l'automatisation du déploiement au Cameroun.",
};

export type PageMeta = { title: Localized; description?: Localized };

export const PAGE_META: Record<string, PageMeta> = {
  "/projects": {
    title: { en: "Selected work", fr: "Projets sélectionnés" },
    description: {
      en: "Applications, games, and the engineering behind them. Explore projects by Kynmmarshall.",
      fr: "Des applications, des jeux et l'ingénierie qui les soutient. Découvrez les projets de Kynmmarshall.",
    },
  },
  "/expertise": {
    title: { en: "Engineering expertise", fr: "Expertise en ingénierie" },
    description: {
      en: "Explore Kamdeu Yamdjeuson Neil Marshall's languages, frameworks, tools, and project-backed experience across full-stack development, games, DevOps, and core engineering.",
      fr: "Découvrez les langages, frameworks, outils et l'expérience appuyée par des projets de Kamdeu Yamdjeuson Neil Marshall en développement full-stack, jeux, DevOps et ingénierie de fond.",
    },
  },
  "/resume": {
    title: {
      en: "Resume & engineering profile",
      fr: "CV et profil d'ingénieur",
    },
    description: {
      en: "Kamdeu Yamdjeuson Neil Marshall's engineering profile, selected projects, technical toolkit, and contact details. Print-friendly and ready to save as PDF.",
      fr: "Le profil d'ingénieur de Kamdeu Yamdjeuson Neil Marshall, ses projets sélectionnés, sa boîte à outils technique et ses coordonnées. Prêt à imprimer ou à enregistrer en PDF.",
    },
  },
  "/insights": {
    title: { en: "Developer insights", fr: "Statistiques de développement" },
    description: {
      en: "Public repository language distribution and GitHub developer activity with transparent data sources.",
      fr: "Répartition des langages des dépôts publics et activité GitHub, avec des sources de données transparentes.",
    },
  },
  "/privacy": {
    title: { en: "Privacy", fr: "Confidentialité" },
  },
};

const clean = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, "") : path;

/** Title and description for a path, or null when the page keeps its own. */
export function metaForPath(
  path: string,
): { title: Localized; description: Localized } | null {
  const normalized = clean(path);
  if (normalized === "/")
    return { title: SITE_TITLE, description: SITE_DESCRIPTION };
  const page = PAGE_META[normalized];
  if (!page) return null;
  const withSuffix = (text: string) => `${text} | ${TITLE_SUFFIX}`;
  return {
    title: {
      en: withSuffix(page.title.en),
      fr: withSuffix(page.title.fr),
    },
    description: page.description ?? SITE_DESCRIPTION,
  };
}
