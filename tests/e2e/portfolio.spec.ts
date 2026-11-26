import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { featuredProjects } from "../../content/projects";
import { enableCanvasReadback } from "./canvas-readback";

test.beforeEach(async ({ page }) => {
  await enableCanvasReadback(page);
});

async function canvasPixels(canvas: Locator) {
  const dataUrl = await canvas.evaluate(
    (element) => (element as HTMLCanvasElement).toDataURL("image/png"),
    undefined,
    { timeout: 5000 },
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

test("the hero portrait is a still image that stays put across scrolling, input and resizing", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Kamdeu");
  await expect(
    page.getByRole("group", { name: "Scene appearance" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /^(Artistic|Wireframe)$/ }),
  ).toHaveCount(0);
  // The portrait is a plain image: no second WebGL canvas, nothing to drift or reappear.
  await expect(page.locator(".hero-scene canvas")).toHaveCount(0);
  const portrait = page.locator(".portrait-fallback");
  await expect(portrait).toHaveAttribute("src", /portrait/);
  await expect(portrait).toBeVisible();
  await expect
    .poll(() =>
      portrait.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const box = async () =>
    portrait.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        x: Math.round(rect.x + scrollX),
        y: Math.round(rect.y + scrollY),
        width: Math.round(rect.width),
        visibility: style.visibility,
        opacity: style.opacity,
        animation: style.animationName,
      };
    });
  const resting = await box();
  expect(resting.visibility).toBe("visible");
  expect(resting.opacity).toBe("1");
  expect(resting.animation).toBe("none");

  await page.mouse.move(1100, 310);
  await page.waitForTimeout(500);
  expect(await box()).toEqual(resting);
  for (const position of [160, 700, 0]) {
    await page.evaluate((top) => window.scrollTo(0, top), position);
    await page.waitForTimeout(400);
    expect(await box()).toEqual(resting);
  }
  await expect(portrait).toBeVisible();

  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({ path: ".data/screenshots/desktop.png" });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
    { width: 768, height: 1024 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: `.data/screenshots/home-${viewport.width}.png`,
    });
  }
  expect(errors).toEqual([]);
});

test("project logos animate and respect the global pause control", async ({
  page,
}) => {
  await page.goto("/projects");
  const artwork = page.locator(".project-logo-art").first();
  const container = page.locator(".project-logo").first();
  await container.scrollIntoViewIfNeeded();
  const firstTransform = await artwork.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await expect
    .poll(() =>
      artwork.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(firstTransform);
  await page
    .getByRole("button", { name: "Pause background effects", exact: true })
    .click();
  await container.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      artwork.evaluate((element) => getComputedStyle(element).transform),
    )
    .toBe("none");
  await page.mouse.move(300, 500);
  const background = await canvasPixels(
    page.locator(".scene-background canvas"),
  );
  await page.mouse.move(1000, 400);
  expect(
    Buffer.compare(
      background,
      await canvasPixels(page.locator(".scene-background canvas")),
    ),
  ).toBe(0);
});

test("project collection, exact live URLs, filters and media work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  await expect(page.locator(".project-card")).toHaveCount(7);
  for (const project of featuredProjects)
    await expect(page.locator(`a[href="${project.liveUrl}"]`)).toBeVisible();
  await expect(page.locator(".project-logo-image")).toHaveCount(7);
  await expect(
    page.locator(".project-card video, .project-card .project-image"),
  ).toHaveCount(0);
  for (const image of await page.locator(".project-logo-image").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.screenshot({
    path: ".data/screenshots/logo-listing.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Games (4)", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(4);
  await page.goBack();
  await expect(page.locator(".project-card")).toHaveCount(7);
  for (const project of featuredProjects) {
    await page.goto(`/projects/${project.slug}`);
    await expect(page.locator("h1")).toContainText(project.title);
    await expect(page.locator(".detail-cover .project-image")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Visit live project" }),
    ).toHaveAttribute("href", project.liveUrl);
  }
  const response = await page.goto("/projects/not-a-project");
  expect(response?.status()).toBe(404);
  await page.goto("/projects/pick-my-dish");
  await page.getByRole("button", { name: "Delivery", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Build + package" }),
  ).toBeVisible();
  const thumbnail = page.getByRole("button", {
    name: "Open Pick My Dish screenshot 1",
    exact: true,
  });
  await thumbnail.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Next screenshot" }).click();
  await expect(page.getByRole("dialog")).toContainText("2 of 3");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(thumbnail).toBeFocused();
});

test("reduced motion, navigation, contact and accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Motion disabled by system preference" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator('a[href="/status"]')).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("radio", { name: "A role", exact: true }).check();
  await expect(
    page.getByRole("link", { name: "Get in touch" }),
  ).toHaveAttribute("href", /A%20role/);
  await expect(page.locator(".boot-loader")).toHaveCount(0);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  await page.goto("/insights");
  await expect(page.locator("h1")).toContainText("Behind the commits");
  const removedStatus = await page.goto("/status");
  expect(removedStatus?.status()).toBe(404);
  await expect(page.locator(".service-row")).toHaveCount(0);
});

test("gameplay previews, dashboard accessibility and full-page composition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/fruit-collector");
  await page
    .getByRole("button", { name: "Play Fruit Collector preview" })
    .click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Pause Fruit Collector preview" })
    .click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).paused),
    )
    .toBe(true);
  for (const path of ["/insights", "/projects/pick-my-dish"]) {
    await page.goto(path);
    await expect(page.locator(".boot-loader")).toHaveCount(0);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `.data/screenshots/${path.replaceAll("/", "-")}.png`,
      fullPage: true,
    });
  }
  await page.goto("/");
  await expect(page.locator(".portrait-fallback")).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          await sharp(
            await canvasPixels(page.locator(".scene-background canvas")),
          ).stats()
        ).channels[0].stdev,
    )
    .toBeGreaterThan(5);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.locator(".insights-preview").scrollIntoViewIfNeeded();
  await expect(page.locator(".preview-languages")).not.toContainText(
    "Loading repository data...",
  );
  await page.locator("#main").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".data/screenshots/full-desktop.png",
    fullPage: true,
  });
});
