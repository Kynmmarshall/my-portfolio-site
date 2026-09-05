import { test, expect } from "@playwright/test";

const appUrl =
  "https://play.google.com/store/apps/details?id=com.kynmmarshall.fruitcollector&hl=fr";
const developerUrl =
  "https://play.google.com/store/apps/developer?id=Kamdeu+Yamdjeuson+Neil+Marshall";

test("Google Play app and developer links are visible on the portfolio and resume", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page
      .getByRole("navigation", { name: "Connect with Marshall", exact: true })
      .getByRole("link", { name: "Google Play", exact: true }),
  ).toHaveAttribute("href", developerUrl);
  await page.goto("/projects/fruit-collector");
  await expect(
    page.getByRole("link", { name: "Get it on Google Play" }),
  ).toHaveAttribute("href", appUrl);
  await expect(page.locator(".store-release")).toContainText(
    "Kamdeu Yamdjeuson Neil Marshall",
  );
  await expect(page.locator(".store-release a")).toHaveAttribute(
    "href",
    developerUrl,
  );
  await page.goto("/projects");
  const game = page
    .locator(".project-card")
    .filter({
      has: page.getByRole("heading", { name: "Fruit Collector", exact: true }),
    });
  await expect(
    game.getByRole("link", { name: "Google Play", exact: true }),
  ).toHaveAttribute("href", appUrl);
  await page.goto("/resume");
  await expect(page.locator(".resume-publication")).toContainText(
    "Fruit Collector on Google Play",
  );
  await expect(
    page.getByRole("link", { name: "View published game" }),
  ).toHaveAttribute("href", appUrl);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const social = page.getByRole("navigation", {
    name: "Connect with Marshall",
    exact: true,
  });
  await social.scrollIntoViewIfNeeded();
  await expect(
    social.getByRole("link", { name: "Google Play", exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
