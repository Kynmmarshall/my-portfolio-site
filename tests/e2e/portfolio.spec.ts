import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { featuredProjects } from "../../content/projects";

test("3D scene renders, moves, switches mode and remains readable on mobile", async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Kamdeu");
  const canvas = page.locator(".hero-scene canvas");
  await expect(canvas).toBeVisible();
  await expect.poll(async () => {
    const statistics = await sharp(await canvas.screenshot()).stats();
    return statistics.channels[0].stdev;
  }).toBeGreaterThan(10);
  const firstFrame = await canvas.screenshot();
  await page.mouse.move(1100, 310);
  await expect.poll(async () => Buffer.compare(firstFrame, await canvas.screenshot())).not.toBe(0);
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({ path: ".data/screenshots/desktop.png" });
  await sharp(await canvas.screenshot()).webp({ quality: 88 }).toFile("public/media/hero/poster.webp");
  await page.getByRole("button", { name: "Wireframe", exact: true }).click();
  await expect(page.getByRole("button", { name: "Wireframe", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toBeVisible();
  await page.screenshot({ path: ".data/screenshots/wireframe.png" });
  await page.reload();
  await expect(page.getByRole("button", { name: "Wireframe", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Artistic", exact: true }).click();
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await expect(canvas).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: `.data/screenshots/home-${viewport.width}.png` });
  }
  expect(errors).toEqual([]);
});

test("project collection, exact live URLs, filters and media work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  await expect(page.locator(".project-card")).toHaveCount(7);
  for (const project of featuredProjects) await expect(page.locator(`a[href="${project.liveUrl}"]`)).toBeVisible();
  for (const image of await page.locator(".project-image").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.getByRole("link", { name: "Games (4)", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(4);
  await page.goBack();
  await expect(page.locator(".project-card")).toHaveCount(7);
  for (const project of featuredProjects) {
    await page.goto(`/projects/${project.slug}`);
    await expect(page.locator("h1")).toContainText(project.title);
    await expect(page.getByRole("link", { name: "Visit live project" })).toHaveAttribute("href", project.liveUrl);
  }
  const response = await page.goto("/projects/not-a-project");
  expect(response?.status()).toBe(404);
});

test("reduced motion, navigation, contact and accessibility", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Motion disabled by system preference" })).toBeDisabled();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("radio", { name: "A role", exact: true }).check();
  await expect(page.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", /A%20role/);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) }))).toEqual([]);
  await page.goto("/insights");
  await expect(page.locator("h1")).toContainText("Behind the commits");
  await page.goto("/status");
  await expect(page.locator(".service-row")).toHaveCount(5);
  await expect(page.locator(".service-foot").first()).toContainText("collecting history");
});