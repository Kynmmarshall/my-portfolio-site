import { test, expect } from "@playwright/test";

test("Trip-io uses supplied app screenshots on its detail page and keeps its listing logo", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects/trip-io");
  await expect(page.locator(".detail-cover .project-image")).toHaveAttribute(
    "src",
    /destinations/,
  );
  const thumbnails = page.locator(".landscape-gallery button");
  await expect(thumbnails).toHaveCount(6);
  for (const thumbnail of await thumbnails.all()) {
    await thumbnail.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        thumbnail
          .locator("img")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  const first = thumbnails.first();
  await first.click();
  await expect(page.getByRole("dialog")).toContainText("1 of 6");
  for (let index = 2; index <= 6; index++) {
    await page
      .getByRole("button", { name: "Next screenshot", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(`${index} of 6`);
    await expect
      .poll(() =>
        page
          .locator(".dialog-image img")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await page.keyboard.press("Escape");
  await expect(first).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".data/screenshots/trip-io-gallery.png",
    fullPage: true,
  });
  await page.goto("/projects");
  const logo = page.locator('[data-project="trip-io"] img');
  await expect(logo).toHaveAttribute("src", /logo/);
  await expect(page.locator(".project-card .project-image")).toHaveCount(0);
});
