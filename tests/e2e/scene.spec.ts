import { test, expect, type Locator, type Page } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { enableCanvasReadback } from "./canvas-readback";

test.beforeEach(async ({ page }, info) => {
  if (!info.title.includes("budgets")) await enableCanvasReadback(page);
});

async function pixels(canvas: Locator) {
  const data = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL(),
  );
  return Buffer.from(data.split(",")[1], "base64");
}

async function nextFrames(page: Page, count = 12) {
  await page.evaluate(
    (total) =>
      new Promise<void>((resolve) => {
        let seen = 0;
        const next = () => {
          if (++seen === total) resolve();
          else requestAnimationFrame(next);
        };
        requestAnimationFrame(next);
      }),
    count,
  );
}

/**
 * A glass frame issues several draw calls (body, accent, transmission pass), so
 * draw calls cannot be counted as frames. Calls inside one frame land close
 * together even under CPU throttling, while frames are ~16ms apart, so an 8ms
 * gap separates clusters unambiguously.
 */
function clusterFrames(times: number[]) {
  const sizes: number[] = [];
  for (let index = 0; index < times.length; index++) {
    if (index === 0 || times[index] - times[index - 1] > 8) sizes.push(1);
    else sizes[sizes.length - 1] += 1;
  }
  return sizes;
}

test("background renders beneath content, reacts to input, and pauses without blocking navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/expertise");
  const host = page.locator(".scene-background");
  const canvas = host.locator("canvas");
  await expect(host).toHaveAttribute("data-ready", "true");

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

  const beforeScroll = await pixels(canvas);
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  await expect
    .poll(async () => Buffer.compare(beforeScroll, await pixels(canvas)))
    .not.toBe(0);

  const style = await host.evaluate((element) => ({
    pointer: getComputedStyle(element).pointerEvents,
    zIndex: getComputedStyle(element).zIndex,
    position: getComputedStyle(element).position,
    canvasPointer: getComputedStyle(element.querySelector("canvas")!)
      .pointerEvents,
  }));
  expect(style).toEqual({
    pointer: "none",
    zIndex: "-1",
    position: "fixed",
    canvasPointer: "none",
  });

  await page
    .getByRole("button", { name: "Pause background effects", exact: true })
    .click();
  await nextFrames(page);
  const paused = await pixels(canvas);
  await page.mouse.move(120, 650);
  await nextFrames(page);
  expect(Buffer.compare(paused, await pixels(canvas))).toBe(0);

  await mkdir(".data/screenshots", { recursive: true });
  await page.screenshot({ path: ".data/screenshots/scene-desktop.png" });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() =>
        canvas.evaluate((element) => {
          const node = element as HTMLCanvasElement;
          return node.width <= innerWidth && node.width * node.height <= 800_000;
        }),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.data/screenshots/scene-${viewport.width}.png`,
    });
  }

  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(host).toHaveAttribute("data-ready", "true");
  expect(errors).toEqual([]);
});

test("reduced motion freezes the scene and context loss leaves a safe fallback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/expertise");
  const host = page.locator(".scene-background");
  const canvas = host.locator("canvas");
  await expect(host).toHaveAttribute("data-ready", "true");
  await nextFrames(page);
  const first = await pixels(canvas);
  await page.mouse.move(1000, 350);
  await nextFrames(page);
  expect(Buffer.compare(first, await pixels(canvas))).toBe(0);

  // Scrolling must still work while the scene is frozen.
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);

  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(host).toHaveAttribute("data-ready", "false");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the opt-in control shapes the sculpture with pointer and keyboard", async ({
  page,
}) => {
  await page.goto("/");
  const host = page.locator(".scene-background");
  const canvas = host.locator("canvas");
  await expect(host).toHaveAttribute("data-ready", "true");
  await page
    .getByRole("button", { name: "Pause background effects", exact: true })
    .click();
  await nextFrames(page);

  const control = page.getByRole("button", {
    name: /Shape the background sculpture/,
  });
  await expect(control).toBeVisible();
  const before = await pixels(canvas);

  await control.focus();
  for (let press = 0; press < 6; press++)
    await page.keyboard.press("ArrowRight");
  await nextFrames(page);
  expect(Buffer.compare(before, await pixels(canvas))).not.toBe(0);

  // Page scrolling is untouched by the control.
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);

  const reset = page.getByRole("button", {
    name: "Reset the background sculpture",
    exact: true,
  });
  await expect(reset).toBeVisible();
  await reset.click();
  await nextFrames(page);
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

test("scene rendering stays within its frame and geometry budgets", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElements;
    const state = window as unknown as {
      sceneDraws: { at: number; count: number }[];
    };
    state.sceneDraws = [];
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      original.apply(this, args);
      if (
        this.canvas instanceof HTMLCanvasElement &&
        this.canvas.closest(".scene-background")
      )
        state.sceneDraws.push({ at: performance.now(), count: args[1] });
    };
  });
  await page.goto("/expertise");
  const host = page.locator(".scene-background");
  const canvas = host.locator("canvas");
  await expect(host).toHaveAttribute("data-ready", "true");
  await nextFrames(page);

  const attributes = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).getContext("webgl2")?.getContextAttributes(),
  );
  expect(attributes?.preserveDrawingBuffer).toBe(false);
  expect(attributes?.stencil).toBe(false);
  // Real overlapping 3D geometry needs a depth buffer, unlike the old flat surface.
  expect(attributes?.depth).toBe(true);

  const measurement = await page.evaluate(async () => {
    const state = window as unknown as {
      sceneDraws: { at: number; count: number }[];
    };
    state.sceneDraws = [];
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const next = () => {
        if (performance.now() - start >= 2000) resolve();
        else requestAnimationFrame(next);
      };
      requestAnimationFrame(next);
    });
    return {
      draws: state.sceneDraws.slice(),
      duration: performance.now() - start,
    };
  });

  const { draws } = measurement;
  expect(draws.length).toBeGreaterThan(0);
  const clusters = clusterFrames(draws.map((draw) => draw.at));
  const frames = clusters.length;
  const maxDrawsPerFrame = Math.max(...clusters);

  // At most one scene frame per browser frame, capped at 60 Hz.
  expect(frames).toBeLessThanOrEqual(
    Math.ceil(measurement.duration / (1000 / 60)) + 2,
  );
  expect(maxDrawsPerFrame).toBeLessThanOrEqual(12);
  // Index count of the densest allowed knot: tubular * radial * 6.
  expect(Math.max(...draws.map((draw) => draw.count))).toBeLessThanOrEqual(
    96 * 24 * 6,
  );

  const budget = await host.evaluate((element) => ({
    vertices: Number(element.getAttribute("data-vertices")),
    quality: Number(element.getAttribute("data-quality")),
  }));
  expect(budget.vertices).toBeLessThanOrEqual(
    [3185, 1271, 475, 475][budget.quality],
  );

  console.log(
    `Scene: ${frames} frames over ${(measurement.duration / 1000).toFixed(2)}s; ${maxDrawsPerFrame} draws per frame max; quality ${budget.quality}; ${budget.vertices} vertices; readback disabled.`,
  );
});
