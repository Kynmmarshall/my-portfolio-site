import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

test("Profile navigation opens the resume on desktop and mobile", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const desktop = page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Profile", exact: true });
  await expect(desktop).toHaveAttribute("href", "/resume");
  await desktop.click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(desktop).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation", exact: true })
    .getByRole("link", { name: "Profile", exact: true })
    .click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Kamdeu Yamdjeuson Neil Marshall",
  );
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("resume presents a polished profile with logos and a working print layout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/resume");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Kamdeu Yamdjeuson Neil Marshall",
  );
  await expect(page.locator(".resume-project")).toHaveCount(5);
  await expect(
    page.locator(".resume-technologies .technology-logo"),
  ).toHaveCount(12);
  for (const image of await page.locator(".resume-document img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printRequested = "true";
    };
  });
  await page.getByRole("button", { name: "Print / Save PDF" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-print-requested",
    "true",
  );
  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({
    path: ".data/screenshots/resume-desktop.png",
    fullPage: true,
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations.map((violation) => violation.id)).toEqual([]);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.data/screenshots/resume-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".terrain-background")).toBeHidden();
  await expect(page.locator(".resume-toolbar")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.pdf({
    path: ".data/screenshots/resume.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.screenshot({
    path: ".data/screenshots/resume-print.png",
    fullPage: true,
  });
});
