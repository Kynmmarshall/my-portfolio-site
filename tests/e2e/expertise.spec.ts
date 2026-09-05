import { test, expect } from "@playwright/test";

test("Expertise has its own route and remains accessible from desktop and mobile navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".skill-pillar")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore my expertise" })).toHaveAttribute("href", "/expertise");
  const desktopLink = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Expertise", exact: true });
  await desktopLink.click();
  await expect(page).toHaveURL(/\/expertise$/);
  await expect(page.getByRole("heading", { name: "Engineering expertise.", level: 1 })).toBeVisible();
  await expect(page.locator(".skill-pillar")).toHaveCount(4);
  await expect(desktopLink).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Expertise", exact: true }).click();
  await expect(page).toHaveURL(/\/expertise$/);
  await expect(page.locator(".skill-pillar")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
});