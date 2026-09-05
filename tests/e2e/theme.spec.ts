import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";
import { enableCanvasReadback } from "./canvas-readback";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  page.on("close", () => expect(errors).toEqual([]));
});

test("every launch follows the system despite previous choices", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("portfolio-theme", "dark"),
  );
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(250, 251, 248)",
  );
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(250, 251, 248)",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(23, 26, 25)",
  );
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(23, 26, 25)",
  );
});

test("system colors apply before JavaScript even with a stale preference", async ({
  browser,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme,
    });
    const page = await context.newPage();
    await page.goto(`${test.info().project.use.baseURL}/`);
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      colorScheme === "dark" ? "rgb(23, 26, 25)" : "rgb(250, 251, 248)",
    );
    await context.close();
  }
});

test("system changes and keyboard controls work without saving the theme", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Switch to light theme" }),
  ).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  const toggle = page.getByRole("button", { name: "Switch to dark theme" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Switch to light theme" }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(
    await page.evaluate(() => localStorage.getItem("portfolio-theme")),
  ).toBeNull();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(250, 251, 248)",
  );
});

test("theme toggle remains usable when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("header controls fit desktop and mobile without overlap", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await mkdir(".data/screenshots", { recursive: true });
  for (const width of [320, 390, 640, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator(".theme-toggle")).toBeVisible();
    await expect(page.locator(".site-header .brand-mark")).toBeVisible();
    const layout = await page.locator(".header-inner").evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const children = Array.from(element.children)
        .map((child) => child.getBoundingClientRect())
        .filter((rect) => rect.width > 0);
      return {
        fits: children.every(
          (rect) =>
            rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1,
        ),
        separated: children.every(
          (rect, index) =>
            index === 0 || rect.left >= children[index - 1].right,
        ),
      };
    });
    expect(layout, `Header at ${width}px`).toEqual({
      fits: true,
      separated: true,
    });
    await page
      .locator(".site-header")
      .screenshot({ path: `.data/screenshots/theme-header-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Profile" })
    .click();
  await expect(page).toHaveURL(/\/resume$/);
});

for (const route of [
  "/",
  "/projects",
  "/expertise",
  "/resume",
  "/insights",
  "/projects/trip-io",
]) {
  test(`dark theme contrast and surfaces on ${route}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto(route);
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(23, 26, 25)",
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await mkdir(".data/screenshots", { recursive: true });
    await page.screenshot({
      path: `.data/screenshots/theme-dark-${route.replaceAll("/", "-")}.png`,
      fullPage: true,
    });
    if (route === "/resume") {
      await expect(page.locator(".resume-document")).toHaveCSS(
        "background-color",
        "rgba(23, 26, 25, 0.96)",
      );
      await page.getByRole("button", { name: "Switch to light theme" }).click();
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
      await page.emulateMedia({ media: "print" });
      await expect(page.locator(".resume-document")).toHaveCSS(
        "background-color",
        "rgb(255, 255, 255)",
      );
      await expect(page.locator(".resume-summary p").first()).toHaveCSS(
        "color",
        "rgb(83, 97, 77)",
      );
    }
  });
}

test("portrait icons are served as the browser and touch icons", async ({
  page,
  request,
}) => {
  await page.goto("/");
  for (const [rel, file, size] of [
    ["icon", "icon.png", 64],
    ["apple-touch-icon", "apple-icon.png", 180],
  ] as const) {
    const icon = page.locator(`link[rel="${rel}"]`);
    await expect(icon).toHaveAttribute(
      "href",
      new RegExp(file.replace(".", "\\.")),
    );
    const response = await request.get((await icon.getAttribute("href"))!);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
    const bytes = await response.body();
    expect(bytes.equals(await readFile(`app/${file}`))).toBe(true);
    const metadata = await sharp(bytes).metadata();
    expect([metadata.width, metadata.height]).toEqual([size, size]);
    expect((await sharp(bytes).stats()).channels[0].stdev).toBeGreaterThan(20);
  }
});

test("dark mode keeps portrait and terrain canvases visible and responsive", async ({
  page,
}) => {
  await enableCanvasReadback(page);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await mkdir(".data/screenshots", { recursive: true });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const portrait = page.locator(".hero-scene canvas");
    const terrain = page.locator(".terrain-background canvas");
    for (const canvas of [portrait, terrain]) {
      await expect(canvas).toBeVisible();
      await expect
        .poll(async () => {
          const image = await canvas.evaluate((element) =>
            (element as HTMLCanvasElement).toDataURL(),
          );
          const stats = await sharp(
            Buffer.from(image.split(",")[1], "base64"),
          ).stats();
          return Math.max(...stats.channels.map((channel) => channel.stdev));
        })
        .toBeGreaterThan(5);
    }
    const firstFrame = await portrait.evaluate((element) =>
      (element as HTMLCanvasElement).toDataURL(),
    );
    await page.mouse.move(width - 25, 200);
    await expect
      .poll(() =>
        portrait.evaluate((element) =>
          (element as HTMLCanvasElement).toDataURL(),
        ),
      )
      .not.toBe(firstFrame);
    await page.screenshot({
      path: `.data/screenshots/theme-dark-canvas-${width}.png`,
    });
  }
});
