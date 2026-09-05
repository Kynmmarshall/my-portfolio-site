import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("CPU-throttled mobile terrain keeps bounded buffers and stops drawing while hidden", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 });
      Object.defineProperty(navigator, "deviceMemory", { value: 2 });
      const state = window as unknown as {
        terrainTimes: number[];
        testHidden: boolean;
      };
      state.terrainTimes = [];
      state.testHidden = false;
      Object.defineProperty(document, "hidden", {
        get: () => state.testHidden,
        configurable: true,
      });
      const draw = WebGL2RenderingContext.prototype.drawElements;
      WebGL2RenderingContext.prototype.drawElements = function (...args) {
        draw.apply(this, args);
        if (
          this.canvas instanceof HTMLCanvasElement &&
          this.canvas.closest(".terrain-background")
        )
          state.terrainTimes.push(performance.now());
      };
    });
    await page.goto("/");
    const host = page.locator(".terrain-background");
    await expect(host).toHaveAttribute("data-ready", "true");
    await expect(page.locator("canvas")).toHaveCount(1);
    const measurement = await page.evaluate(async () => {
      const state = window as unknown as { terrainTimes: number[] };
      state.terrainTimes = [];
      const start = performance.now();
      await new Promise<void>((resolve) => {
        const sample = () => {
          if (performance.now() - start >= 3000) resolve();
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      return {
        times: state.terrainTimes.slice(),
        duration: performance.now() - start,
      };
    });
    const { times } = measurement;
    const intervals = times
      .slice(1)
      .map((time, index) => time - times[index])
      .sort((first, second) => first - second);
    expect(times.length).toBeGreaterThan(0);
    expect(times.length).toBeLessThanOrEqual(
      Math.ceil(measurement.duration / (1000 / 60)) + 2,
    );
    const metrics = await host.locator("canvas").evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return {
        pixels: canvas.width * canvas.height,
        attributes: canvas.getContext("webgl2")?.getContextAttributes(),
      };
    });
    expect(metrics.pixels).toBeLessThanOrEqual(180_000);
    expect(metrics.attributes?.preserveDrawingBuffer).toBe(false);
    console.log(
      `4x CPU-throttled mobile: ${((times.length / measurement.duration) * 1000).toFixed(1)} FPS over ${(measurement.duration / 1000).toFixed(2)}s; p95 frame interval ${intervals[Math.floor(intervals.length * 0.95)]?.toFixed(1)}ms; ${metrics.pixels} pixels; no second WebGL canvas.`,
    );
    await mkdir(".data/screenshots", { recursive: true });
    await page.screenshot({
      path: ".data/screenshots/terrain-mobile-optimized.png",
    });
    await page.evaluate(() => {
      (window as unknown as { testHidden: boolean }).testHidden = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const before = await page.evaluate(
      () =>
        (window as unknown as { terrainTimes: number[] }).terrainTimes.length,
    );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let count = 0;
          const next = () => {
            if (++count > 20) resolve();
            else requestAnimationFrame(next);
          };
          requestAnimationFrame(next);
        }),
    );
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { terrainTimes: number[] }).terrainTimes.length,
      ),
    ).toBe(before);
    await page.evaluate(() => {
      (window as unknown as { testHidden: boolean }).testHidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
