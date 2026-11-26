import type { Localized } from "../lib/i18n.ts";

/**
 * Display names for descriptive tags. Product and technology names (Flutter,
 * Docker, PostgreSQL...) are proper nouns and are never listed here: a tag that
 * is not in this table renders as-is in both languages. Keys stay English
 * because they double as identifiers (logo lookup, `data-technology`).
 */
const TRANSLATED_TERMS: Record<string, string> = {
  "Release automation": "Automatisation des releases",
  Observability: "Observabilité",
  Backups: "Sauvegardes",
  "Security hardening": "Durcissement de la sécurité",
  "Game loops": "Boucles de jeu",
  "Custom C++ engine": "Moteur C++ sur mesure",
  "REST APIs": "API REST",
  "Design patterns": "Patrons de conception",
  Testing: "Tests",
  "Unit testing": "Tests unitaires",
  "Integration testing": "Tests d'intégration",
  "Smoke testing": "Tests de fumée",
  "Cross-platform": "Multiplateforme",
  Itineraries: "Itinéraires",
  "Game logic": "Logique de jeu",
  "Educational games": "Jeux éducatifs",
  "Windows APIs": "API Windows",
};

export const termLabel = (name: string): Localized => ({
  en: name,
  fr: TRANSLATED_TERMS[name] ?? name,
});

export const translatedTerms = Object.keys(TRANSLATED_TERMS);

/** Short descriptors shown under each technology. Keys are the English text. */
const KIND_FR = {
  "CI/CD": "CI/CD",
  Automation: "Automatisation",
  "Web server": "Serveur web",
  Infrastructure: "Infrastructure",
  "Version control": "Gestion de versions",
  "Code collaboration": "Collaboration de code",
  Containers: "Conteneurs",
  Orchestration: "Orchestration",
  "Logs & metrics": "Logs et métriques",
  "Operations practice": "Pratique d'exploitation",
  "Delivery practice": "Pratique de livraison",
  "Game engine": "Moteur de jeu",
  "Game library": "Bibliothèque de jeu",
  Language: "Langage",
  "Graphics library": "Bibliothèque graphique",
  "Level editor": "Éditeur de niveaux",
  "Graphics API": "API graphique",
  "Shader language": "Langage de shaders",
  "Graphics engineering": "Ingénierie graphique",
  "Runtime design": "Conception du runtime",
  "UI framework": "Framework d'interface",
  "UI library": "Bibliothèque d'interface",
  "Web framework": "Framework web",
  Styling: "Mise en forme",
  Runtime: "Environnement d'exécution",
  "API framework": "Framework d'API",
  Database: "Base de données",
  Markup: "Balisage",
  Stylesheets: "Feuilles de style",
  "API design": "Conception d'API",
  "Language / exploring": "Langage / en exploration",
  "Build system": "Système de build",
  "Typesetting / LaTeX": "Composition / LaTeX",
  "System modelling": "Modélisation de systèmes",
  "Software design": "Conception logicielle",
  "Engineering practice": "Pratique d'ingénierie",
} as const;

export type Kind = keyof typeof KIND_FR;
export const kindLabel = (kind: Kind): Localized => ({
  en: kind,
  fr: KIND_FR[kind],
});
