import { expect, test } from "@playwright/test";

// The boot splash is covered by its own spec; these tests are about the header.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("boot-seen", "1"));
});

const headerTop = (page: import("@playwright/test").Page) =>
  page
    .locator(".site-header")
    .evaluate((element) => Math.round(element.getBoundingClientRect().top));

test("the header slides away while scrolling down and returns on the way up", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-hidden", "false");
  expect(await headerTop(page)).toBe(0);

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveAttribute("data-hidden", "true");
  await expect.poll(() => headerTop(page)).toBeLessThan(-40);
  await expect(page.locator("main")).toBeInViewport();

  // A small move the other way is enough to bring it back.
  await page.evaluate(() => window.scrollBy(0, -140));
  await expect(header).toHaveAttribute("data-hidden", "false");
  await expect.poll(() => headerTop(page)).toBe(0);

  // Further down again hides it, and the top of the page always shows it.
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect(header).toHaveAttribute("data-hidden", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).toHaveAttribute("data-hidden", "false");
  await expect.poll(() => headerTop(page)).toBe(0);
});

test("keyboard focus and a pointer at the top edge bring a hidden header back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  const header = page.locator(".site-header");
  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect(header).toHaveAttribute("data-hidden", "true");

  await page.locator(".site-header .brand").focus();
  await expect(header).toHaveAttribute("data-hidden", "false");

  await page.evaluate(() => window.scrollBy(0, 500));
  await expect(header).toHaveAttribute("data-hidden", "true");
  await page.mouse.move(700, 4);
  await expect(header).toHaveAttribute("data-hidden", "false");
});

test("an open mobile menu keeps the header in view while the page scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/projects");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator(".site-header")).toHaveAttribute(
    "data-hidden",
    "false",
  );
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeInViewport();
});

test("reduced motion keeps the header pinned", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/projects");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(page.locator(".site-header")).toHaveAttribute(
    "data-hidden",
    "false",
  );
  await expect.poll(() => headerTop(page)).toBe(0);
});
