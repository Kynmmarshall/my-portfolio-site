import { test, expect } from "@playwright/test";

test("recognizable social logos link to verified profiles in hero and footer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const destinations = [
    { name: "GitHub", href: "https://github.com/Kynmmarshall" },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/kamdeu-yamdjeuson-neil-marshall-a70566298",
    },
    { name: "itch.io", href: "https://kynmarshall.itch.io" },
    { name: "WhatsApp", href: "https://wa.me/237676093910" },
  ];
  for (const label of ["Connect with Marshall", "Social profiles"]) {
    const navigation = page.getByRole("navigation", {
      name: label,
      exact: true,
    });
    for (const destination of destinations) {
      const link = navigation.getByRole("link", {
        name: destination.name,
        exact: true,
      });
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", destination.href);
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect
        .poll(() =>
          link
            .locator("img")
            .evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    await expect(
      navigation.getByRole("link", { name: "Email", exact: true }),
    ).toHaveAttribute("href", "mailto:kynmmarshall@gmail.com");
  }
  await expect(
    page
      .locator("#contact")
      .getByRole("link", { name: "WhatsApp: +237 676 093 910" }),
  ).toHaveAttribute("href", "https://wa.me/237676093910");
  await page.setViewportSize({ width: 320, height: 568 });
  const heroLinks = page.getByRole("navigation", {
    name: "Connect with Marshall",
    exact: true,
  });
  await heroLinks.scrollIntoViewIfNeeded();
  for (const link of await heroLinks.getByRole("link").all())
    await expect(link).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
