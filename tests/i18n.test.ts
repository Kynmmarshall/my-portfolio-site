import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {
  LOCALE_BOOTSTRAP_SCRIPT,
  LOCALE_STORAGE_KEY,
  detectLocale,
  formatNumber,
  formatPercent,
  formatUtcDateTime,
  type Localized,
} from "../lib/i18n.ts";
import { PAGE_META, metaForPath } from "../lib/i18n-meta.ts";
import { pillars, profile } from "../content/profile.ts";
import { CATEGORY_LABEL, projects } from "../content/projects.ts";
import { kindLabel, termLabel, translatedTerms } from "../content/terms.ts";
import { BOOT_STEPS } from "../lib/visuals/boot-sequence.ts";

test("a saved choice beats the browser language", () => {
  assert.equal(detectLocale("fr", ["en-US"]), "fr");
  assert.equal(detectLocale("en", ["fr-FR"]), "en");
});

test("without a saved choice only the first browser language decides", () => {
  for (const tag of ["fr", "fr-FR", "fr-CA", "FR-be", "fr_CH"])
    assert.equal(detectLocale(null, [tag]), "fr", tag);
  assert.equal(detectLocale(null, ["en-US", "fr"]), "en");
  assert.equal(detectLocale(null, ["de-DE"]), "en");
  assert.equal(detectLocale(null, ["fra"]), "en");
  assert.equal(detectLocale(null, []), "en");
});

test("an unknown stored value is ignored", () => {
  assert.equal(detectLocale("de", ["fr-FR"]), "fr");
  assert.equal(detectLocale("", ["en-GB"]), "en");
});

type Environment = {
  stored?: string | null;
  languages?: string[];
  language?: string;
  storageThrows?: boolean;
};

function runBootstrap({
  stored = null,
  languages,
  language = "",
  storageThrows = false,
}: Environment) {
  const documentElement: { lang?: string } = {};
  vm.runInNewContext(LOCALE_BOOTSTRAP_SCRIPT, {
    localStorage: {
      getItem(key: string) {
        if (storageThrows) throw new Error("blocked");
        return key === LOCALE_STORAGE_KEY ? stored : null;
      },
    },
    navigator: { languages, language },
    document: { documentElement },
  });
  return documentElement.lang;
}

test("the pre-paint script agrees with detectLocale", () => {
  const cases: Environment[] = [
    { stored: "fr", languages: ["en-US"] },
    { stored: "en", languages: ["fr-FR"] },
    { languages: ["fr-FR", "en"] },
    { languages: ["en-US", "fr"] },
    { languages: ["de-DE"] },
    { stored: "de", languages: ["fr"] },
    { languages: [], language: "fr-CA" },
  ];
  for (const environment of cases) {
    const languages = environment.languages?.length
      ? environment.languages
      : [environment.language ?? ""];
    assert.equal(
      runBootstrap(environment),
      detectLocale(environment.stored, languages),
      JSON.stringify(environment),
    );
  }
});

test("blocked storage cannot break the page", () => {
  assert.doesNotThrow(() => runBootstrap({ storageThrows: true }));
  assert.equal(runBootstrap({ storageThrows: true }), undefined);
});

/** Texts that are legitimately the same in both languages. */
const SAME_IN_BOTH = new Set([
  "ScrumMaster / DevOps / localisation",
  "Applications",
  "Expertise",
  "Contact",
  "Discipline",
  "Pause",
  "Gameplay",
  "Questions",
  "Contributions",
  "Date (UTC)",
  "Application",
  "Infrastructure",
  "Orchestration",
  "CI/CD",
  "Localisation",
  "Flutter + Provider",
  "Node.js + Express",
  "PostgreSQL",
]);

function isLocalized(value: unknown): value is Localized {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Localized).en === "string" &&
    typeof (value as Localized).fr === "string"
  );
}

function collect(value: unknown, path: string, found: [string, Localized][]) {
  if (isLocalized(value)) found.push([path, value]);
  else if (Array.isArray(value))
    value.forEach((item, index) => collect(item, `${path}[${index}]`, found));
  else if (typeof value === "object" && value !== null)
    for (const [key, child] of Object.entries(value))
      collect(child, `${path}.${key}`, found);
}

test("every translated field in the content data has a real French text", () => {
  const found: [string, Localized][] = [];
  collect(profile, "profile", found);
  collect(pillars, "pillars", found);
  collect(projects, "projects", found);
  collect(CATEGORY_LABEL, "category", found);
  collect(PAGE_META, "meta", found);
  assert.ok(found.length > projects.length * 8, "the data walk found too little");
  for (const [path, text] of found) {
    assert.ok(text.en.trim(), `${path}: English is empty`);
    assert.ok(text.fr.trim(), `${path}: French is empty`);
    if (text.fr === text.en)
      assert.ok(SAME_IN_BOTH.has(text.en), `${path} was not translated`);
    assert.equal(text.fr, text.fr.trim(), `${path}: stray whitespace`);
  }
});

test("descriptive tags are translated and brand names pass through", () => {
  assert.equal(termLabel("Unit testing").fr, "Tests unitaires");
  assert.equal(termLabel("Flutter").fr, "Flutter");
  assert.equal(termLabel("Flutter").en, "Flutter");
  for (const term of translatedTerms)
    assert.notEqual(termLabel(term).fr, term, term);
  assert.equal(kindLabel("Database").fr, "Base de données");
});

test("every descriptive tool and project tag has a French label", () => {
  const descriptive = [
    ...pillars.flatMap((pillar) => pillar.tools),
    ...projects.flatMap((project) => project.stack),
  ].filter((name) => /\s/.test(name) && !/[+.]/.test(name));
  for (const name of descriptive)
    if (!["GitHub Actions", "Tailwind CSS", "Custom C++ engine"].includes(name))
      assert.notEqual(termLabel(name).fr, name, `${name} has no French label`);
});

test("page titles and descriptions exist in both languages", () => {
  assert.equal(metaForPath("/nowhere"), null);
  assert.equal(metaForPath("/projects/batchit"), null);
  assert.equal(metaForPath("/projects/")?.title.fr, "Projets sélectionnés | Kynmmarshall");
  assert.equal(
    metaForPath("/")?.title.en,
    "Kynmmarshall | Software, systems & a little play",
  );
  for (const path of Object.keys(PAGE_META)) {
    const meta = metaForPath(path)!;
    assert.notEqual(meta.title.fr, meta.title.en, path);
    assert.ok(meta.description.fr.length > 0, path);
  }
});

test("the boot sequence has a French line for every step", () => {
  for (const step of BOOT_STEPS) {
    assert.ok(step.fr.trim(), step.label);
    assert.notEqual(step.fr, step.label);
  }
});

test("numbers, percentages and dates follow the language", () => {
  assert.equal(formatNumber(1234, "en"), "1,234");
  assert.match(formatNumber(1234, "fr"), /^1\s234$/u);
  assert.equal(formatPercent(12.34, "en"), "12.3%");
  assert.equal(formatPercent(12.34, "fr"), "12,3\u00a0%");
  const iso = "2026-03-05T14:07:00.000Z";
  assert.match(formatUtcDateTime(iso, "en"), /Mar 5, 2026.*UTC$/u);
  assert.match(formatUtcDateTime(iso, "fr"), /5 mars 2026.*UTC$/u);
});
