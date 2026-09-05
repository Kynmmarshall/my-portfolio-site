import { test, expect } from "@playwright/test";

test("the portrait photo replaces the text mark as the site logo in header and footer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const headerLogo = page.locator(".site-header .brand-mark img");
  await expect(headerLogo).toBeVisible();
  await expect
    .poll(() =>
      headerLogo.evaluate(
        (element) => (element as HTMLImageElement).naturalWidth,
      ),
    )
    .toBeGreaterThan(0);
  await expect(headerLogo).toHaveAttribute("src", /portrait/);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  const footerLogo = page.locator(".site-footer .brand-mark img");
  await expect(footerLogo).toBeVisible();
  await expect
    .poll(() =>
      footerLogo.evaluate(
        (element) => (element as HTMLImageElement).naturalWidth,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole("link", { name: "Kynmmarshall home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
