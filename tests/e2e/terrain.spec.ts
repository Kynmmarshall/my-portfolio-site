import { test, expect, type Locator } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

async function pixels(canvas: Locator) {
  const data = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL(),
  );
  return Buffer.from(data.split(",")[1], "base64");
}

async function nextFrames(canvas: Locator) {
  await canvas.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let count = 0;
        const next = () => {
          if (++count === 12) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
  );
}

test("terrain is rendered beneath content, morphs, and pauses without blocking navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/expertise");
  const canvas = page.locator(".terrain-background canvas");
  await expect(page.locator(".terrain-background")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await expect
    .poll(
      async () => (await sharp(await pixels(canvas)).stats()).channels[3].max,
    )
    .toBeGreaterThan(10);
  const first = await pixels(canvas);
  await page.mouse.move(1200, 200);
  await expect
    .poll(async () => Buffer.compare(first, await pixels(canvas)))
    .not.toBe(0);
  await page.evaluate(() => window.scrollTo(0, 450));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  const style = await page
    .locator(".terrain-background")
    .evaluate((element) => ({
      pointer: getComputedStyle(element).pointerEvents,
      zIndex: getComputedStyle(element).zIndex,
      position: getComputedStyle(element).position,
    }));
  expect(style).toEqual({ pointer: "none", zIndex: "-1", position: "fixed" });
  await page
    .getByRole("button", { name: "Pause background effects", exact: true })
    .click();
  await nextFrames(canvas);
  const paused = await pixels(canvas);
  await page.mouse.move(120, 650);
  await nextFrames(canvas);
  expect(Buffer.compare(paused, await pixels(canvas))).toBe(0);
  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({ path: ".data/screenshots/terrain-desktop.png" });
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() =>
        canvas.evaluate((element) => (element as HTMLCanvasElement).width),
      )
      .toBe(viewport.width);
    await expect
      .poll(
        async () => (await sharp(await pixels(canvas)).stats()).channels[3].max,
      )
      .toBeGreaterThan(10);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.data/screenshots/terrain-${viewport.width}.png`,
    });
  }
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  expect(errors).toEqual([]);
});

test("reduced motion freezes the terrain and context loss leaves a safe fallback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/expertise");
  const canvas = page.locator(".terrain-background canvas");
  await expect(page.locator(".terrain-background")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await nextFrames(canvas);
  const first = await pixels(canvas);
  await page.mouse.move(1000, 350);
  await nextFrames(canvas);
  expect(Buffer.compare(first, await pixels(canvas))).toBe(0);
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.locator(".terrain-background")).toHaveAttribute(
    "data-ready",
    "false",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("device tilt is explicitly enabled, handles permission denial, and responds to sensor input", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      const state = window as unknown as {
        tiltRequests: number;
        tiltSamples: { x: number; y: number }[];
      };
      state.tiltRequests = 0;
      state.tiltSamples = [];
      Object.defineProperty(
        window.DeviceOrientationEvent,
        "requestPermission",
        {
          configurable: true,
          value: async () =>
            ++state.tiltRequests === 1 ? "denied" : "granted",
        },
      );
      window.addEventListener("portfolio:tilt", (event) =>
        state.tiltSamples.push((event as CustomEvent).detail),
      );
    });
    await page.goto("/expertise");
    const enable = page.getByRole("button", {
      name: "Enable device tilt",
      exact: true,
    });
    await expect(enable).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as unknown as { tiltRequests: number }).tiltRequests,
      ),
    ).toBe(0);
    await enable.click();
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "permission was not granted" }),
    ).toHaveCount(1);
    await expect(enable).toHaveAttribute("aria-pressed", "false");
    await enable.click();
    const disable = page.getByRole("button", {
      name: "Disable device tilt",
      exact: true,
    });
    await expect(disable).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => {
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { beta: 0, gamma: 0 }),
      );
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", {
          beta: 12,
          gamma: 15,
        }),
      );
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (
              window as unknown as { tiltSamples: { x: number }[] }
            ).tiltSamples.at(-1)?.x,
        ),
      )
      .toBeGreaterThan(0.5);
    await disable.click();
    await expect(enable).toHaveAttribute("aria-pressed", "false");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});

test("terrain rendering stays within its frame and geometry budgets", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElements;
    const state = window as unknown as {
      terrainDraws: { at: number; duration: number; count: number }[];
    };
    state.terrainDraws = [];
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      const start = performance.now();
      original.apply(this, args);
      if (
        this.canvas instanceof HTMLCanvasElement &&
        this.canvas.closest(".terrain-background")
      )
        state.terrainDraws.push({
          at: start,
          duration: performance.now() - start,
          count: args[1],
        });
    };
  });
  await page.goto("/expertise");
  const canvas = page.locator(".terrain-background canvas");
  await expect(page.locator(".terrain-background")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await nextFrames(canvas);
  await page.evaluate(() => {
    (window as unknown as { terrainDraws: unknown[] }).terrainDraws = [];
  });
  await canvas.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const end = performance.now() + 2000;
        const next = () => {
          if (performance.now() >= end) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
  );
  const draws = await page.evaluate(
    () =>
      (
        window as unknown as {
          terrainDraws: { at: number; duration: number; count: number }[];
        }
      ).terrainDraws,
  );
  expect(draws.length).toBeGreaterThan(0);
  expect(draws.length).toBeLessThanOrEqual(64);
  expect(Math.max(...draws.map((draw) => draw.count))).toBeLessThanOrEqual(
    84 * 64 * 6,
  );
  const times = draws
    .map((draw) => draw.duration)
    .sort((first, second) => first - second);
  console.log(
    `Terrain: ${draws.length} draws over 2s; p95 WebGL draw submission ${times[Math.floor(times.length * 0.95)].toFixed(2)}ms; 5,525 vertices / one draw per frame.`,
  );
});
