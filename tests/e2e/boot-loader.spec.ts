import { expect, test } from "@playwright/test";

test("the boot splash plays on a first visit, never blocks the page and is skipped on repeat visits", async ({
  page,
}) => {
  await page.goto("/");
  const loader = page.locator(".boot-loader");
  await expect(loader).toBeVisible();
  // Decorative only: assistive technology reads the page, not the splash.
  await expect(loader).toHaveAttribute("aria-hidden", "true");
  await expect(loader).toContainText("npm run dev");
  // It clears by itself, and the page behind it was server-rendered all along.
  await expect(loader).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator("h1")).toContainText("Kamdeu");

  // A repeat visit in the same tab is skipped before the first paint.
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-boot", "skip");
  await expect(page.locator(".boot-loader")).toBeHidden();
});

test("reduced motion never shows the boot splash", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".boot-loader")).toBeHidden();
  await expect(page.locator("h1")).toContainText("Kamdeu");
});

test("the splash cannot trap a visitor when the scene never becomes ready", async ({
  page,
}) => {
  // No WebGL: the scene never reports ready, so only the time limit can end the splash.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      options?: unknown,
    ) {
      if (contextId === "webgl2" || contextId === "webgl") return null;
      return original.call(this, contextId, options as never);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".boot-loader")).toHaveCount(0, { timeout: 12000 });
  await expect(page.locator("h1")).toContainText("Kamdeu");
  await expect(page.locator(".scene-background canvas")).toHaveCount(0);
});

test("the splash is never part of the printed page", async ({ page }) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".boot-loader")).toBeHidden();
});
