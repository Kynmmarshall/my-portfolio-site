import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pillars } from "../../content/profile";
import { projects } from "../../content/projects";

const EMAIL = "kynmmarshall@gmail.com";
const PAGES = [
  "/",
  "/projects",
  "/projects/batchit",
  "/projects/fruit-collector",
  "/projects/pick-my-dish",
  "/expertise",
  "/resume",
  "/insights",
  "/privacy",
  "/no-such-page",
];
/** Words that only English text contains; any in a French page is a missed translation. */
const ENGLISH_WORDS = /\b(the|and|with|your|from|for|this|that|are|is|our|you)\b/i;
/** Texts that are legitimately identical in both languages: these and every technology name. */
const SAME_IN_BOTH = new Set([
  ...pillars.flatMap((pillar) => pillar.tools),
  ...projects.flatMap((project) => project.stack),
  "Expertise",
  "Contact",
  "Application",
  "Applications",
  "Discipline",
  "Pause",
  "Gameplay",
  "Questions",
  "Contributions",
  "Date (UTC)",
  "Infrastructure",
  "Orchestration",
  "Localisation",
  "ScrumMaster / DevOps / localisation",
  "Flutter + Provider",
  "Node.js + Express",
  "PostgreSQL",
]);

async function ready(page: Page) {
  await expect(page.locator(".boot-loader")).toHaveCount(0);
}

/** Client components switch language after hydration, so wait for one of them. */
async function hydrated(page: Page, label: string) {
  await expect(page.locator(`[aria-label="${label}"]`)).toHaveCount(1);
}

test.describe("browser language", () => {
  test.describe("French browser", () => {
    test.use({ locale: "fr-FR" });

    test("a first visit opens in French, with the title and no saved choice", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      await expect(page.locator(".hero-copy")).toContainText(
        "Du premier pixel au déploiement final",
        { useInnerText: true },
      );
      await expect(page).toHaveTitle(/Logiciels, systèmes/);
      expect(
        await page.evaluate(() => localStorage.getItem("portfolio-lang")),
      ).toBeNull();
    });

    test("a saved English choice beats the browser language", async ({
      page,
    }) => {
      await page.addInitScript(() =>
        localStorage.setItem("portfolio-lang", "en"),
      );
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator(".hero-copy")).toContainText(
        "From the first pixel",
        { useInnerText: true },
      );
    });
  });

  test.describe("English browser", () => {
    test.use({ locale: "en-GB" });

    test("a first visit opens in English", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page).toHaveTitle(/Software, systems/);
    });
  });

  test.describe("other browser language", () => {
    test.use({ locale: "de-DE" });

    test("falls back to English", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });
});

test("the toggle switches the language and the choice survives reloads and navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const copy = page.locator(".hero-copy");
  const french = page.getByRole("button", { name: "Français", exact: true });
  const english = page.getByRole("button", { name: "English", exact: true });
  await expect(english).toHaveAttribute("aria-pressed", "true");
  await expect(copy).toContainText("From the first pixel", {
    useInnerText: true,
  });
  await expect(copy).not.toContainText("Du premier pixel", {
    useInnerText: true,
  });

  await french.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(french).toHaveAttribute("aria-pressed", "true");
  await expect(copy).toContainText("Du premier pixel", { useInnerText: true });
  await expect(copy).not.toContainText("From the first pixel", {
    useInnerText: true,
  });
  await expect(page).toHaveTitle(/Logiciels, systèmes/);
  expect(
    await page.evaluate(() => localStorage.getItem("portfolio-lang")),
  ).toBe("fr");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(copy).toContainText("Du premier pixel", { useInnerText: true });

  await page.getByRole("link", { name: "Projets", exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("h1")).toHaveText(/Conçu avec intention/, {
    useInnerText: true,
  });
  await expect(page).toHaveTitle("Projets sélectionnés | Kynmmarshall");

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("h1")).toHaveText(/Built with intention/, {
    useInnerText: true,
  });
  await expect(page).toHaveTitle("Selected work | Kynmmarshall");
});

test("the language changes in another tab are followed", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Français", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("the mailto subject and form labels follow the language", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("portfolio-lang", "fr"));
  await page.goto("/");
  await hydrated(page, "Ouvrir la navigation");
  const contact = page.locator("#contact");
  const action = contact.getByRole("link", { name: "Me contacter" });
  const subject = (intent: string) =>
    `mailto:${EMAIL}?subject=${encodeURIComponent(`${intent} / Demande depuis le portfolio`)}`;
  await expect(action).toHaveAttribute("href", subject("Un projet"));
  await contact.getByRole("radio", { name: "Un poste", exact: true }).check();
  await expect(action).toHaveAttribute("href", subject("Un poste"));
  const gmail = contact.getByRole("link", { name: "Écrire dans Gmail" });
  const url = new URL((await gmail.getAttribute("href"))!);
  expect(url.searchParams.get("su")).toBe("Un poste / Demande depuis le portfolio");

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    contact.getByRole("link", { name: "Get in touch", exact: true }),
  ).toHaveAttribute(
    "href",
    `mailto:${EMAIL}?subject=${encodeURIComponent("A role / Portfolio inquiry")}`,
  );
});

test("accessible names follow the language", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("portfolio-lang", "fr"));
  await page.goto("/");
  await hydrated(page, "Navigation principale");
  await expect(
    page.getByRole("navigation", { name: "Navigation principale" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Me retrouver en ligne" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Passer au thème clair" }).or(
      page.getByRole("button", { name: "Passer au thème sombre" }),
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Langue" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Accueil Kynmmarshall" }),
  ).toBeVisible();
});

test("a heading's closing punctuation stays attached in the accessible name", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/expertise");
  await expect(
    page.getByRole("heading", { name: "Engineering expertise.", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Français", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Expertise en ingénierie.", level: 1 }),
  ).toBeVisible();
});

test("French mobile menu is translated", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem("portfolio-lang", "fr"));
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Ouvrir la navigation" }).click();
  const menu = page.getByRole("navigation", { name: "Navigation mobile" });
  await expect(menu.getByRole("link", { name: "Projets" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Profil" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Fermer la navigation" }),
  ).toBeVisible();
});

test.describe("French pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() =>
      localStorage.setItem("portfolio-lang", "fr"),
    );
  });

  for (const route of PAGES) {
    test(`${route} has no untranslated text`, async ({ page }) => {
      await page.goto(route);
      await ready(page);
      await hydrated(page, "Ouvrir la navigation");
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");

      const report = await page.evaluate(() => {
        const identical: string[] = [];
        let missing = 0;
        for (const english of document.querySelectorAll("t-en")) {
          const french = english.nextElementSibling;
          if (french?.tagName !== "T-FR") missing += 1;
          else if (french.textContent === english.textContent)
            identical.push(english.textContent ?? "");
        }
        const attributes: string[] = [];
        for (const element of document.querySelectorAll(
          "[aria-label], [title], img[alt]",
        )) {
          for (const name of ["aria-label", "title", "alt"]) {
            const value = element.getAttribute(name);
            if (value) attributes.push(value);
          }
        }
        const lines = (document.body.innerText ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        return { identical, missing, attributes, lines };
      });

      expect(report.missing, "a <t-en> without its <t-fr>").toBe(0);
      const untranslated = report.identical.filter(
        (text) =>
          !SAME_IN_BOTH.has(text.trim()) && /[a-z]{4,}/.test(text),
      );
      expect(untranslated).toEqual([]);
      expect(report.lines.filter((line) => ENGLISH_WORDS.test(line))).toEqual(
        [],
      );
      expect(
        report.attributes.filter((value) => ENGLISH_WORDS.test(value)),
      ).toEqual([]);
    });

    test(`${route} does not overflow on a phone`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await ready(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }

  for (const scheme of ["light", "dark"] as const) {
    test(`French text passes colour contrast in ${scheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      for (const route of ["/", "/projects", "/expertise", "/resume", "/privacy"]) {
        await page.goto(route);
        await ready(page);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(results.violations, route).toEqual([]);
      }
    });
  }
});

test.describe("narrow touch phone", () => {
  test.use({
    viewport: { width: 320, height: 640 },
    isMobile: true,
    hasTouch: true,
  });

  test("every header control stays on screen beside the language switch", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    // The tilt control only exists on touch devices, which makes the header its tightest.
    await expect(page.locator(".tilt-control")).toBeVisible();
    for (const control of await page
      .locator(".header-inner")
      .locator("a:visible, button:visible")
      .all()) {
      const box = (await control.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
    }
  });
});

test("the language toggle is keyboard operable and named in its own language", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const french = page.getByRole("button", { name: "Français", exact: true });
  await french.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(french).toHaveAttribute("aria-pressed", "true");
  await expect(french).toHaveAttribute("lang", "fr");
});
