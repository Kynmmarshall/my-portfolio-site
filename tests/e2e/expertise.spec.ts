import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { pillars } from "../../content/profile";
import { githubStackSource } from "../../content/github-stack";

test("Expertise has its own route and remains accessible from desktop and mobile navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".skill-pillar")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Explore my expertise" }),
  ).toHaveAttribute("href", "/expertise");
  const desktopLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Expertise", exact: true });
  await desktopLink.click();
  await expect(page).toHaveURL(/\/expertise$/);
  await expect(
    page.getByRole("heading", { name: "Engineering expertise.", level: 1 }),
  ).toBeVisible();
  await expect(page.locator(".skill-pillar")).toHaveCount(4);
  await expect(page.locator(".technology-mark")).toHaveCount(
    pillars.reduce((count, pillar) => count + pillar.tools.length, 0),
  );
  for (const technology of githubStackSource.technologies)
    await expect(
      page.locator(`[data-technology="${technology}"]`).first(),
    ).toHaveCount(1);
  for (const image of await page.locator(".technology-logo").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations.map((violation) => violation.id)).toEqual([]);
  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({
    path: ".data/screenshots/expertise-desktop.png",
    fullPage: true,
  });
  await expect(desktopLink).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Expertise", exact: true })
    .click();
  await expect(page).toHaveURL(/\/expertise$/);
  await expect(page.locator(".skill-pillar")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".data/screenshots/expertise-mobile.png",
    fullPage: true,
  });
});
