import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`navigation stays visible while browsing at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const header = page.locator(".site-header");
    for (const route of ["/", "/projects", "/resume"]) {
      await page.goto(route);
      await expect(header).toHaveCSS("position", "sticky");
      await expect
        .poll(() =>
          page
            .locator("main")
            .evaluate((element) => element.getBoundingClientRect().top),
        )
        .toBeGreaterThanOrEqual(70);
      for (const position of [600, 100000]) {
        await page.evaluate(
          (scrollPosition) => window.scrollTo(0, scrollPosition),
          position,
        );
        await expect
          .poll(() => page.evaluate(() => scrollY))
          .toBeGreaterThan(100);
        await expect
          .poll(() =>
            header.evaluate((element) => element.getBoundingClientRect().top),
          )
          .toBe(0);
        await expect(page.locator(".theme-toggle")).toBeInViewport();
        await expect(page.locator(".site-header .brand-mark")).toBeInViewport();
      }
    }
    await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    if (viewport.width < 640) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Contact", exact: true })
        .click();
    } else {
      await page.getByRole("link", { name: "Let's talk", exact: true }).click();
    }
    await expect(page).toHaveURL(/\/#contact$/);
    await expect
      .poll(() =>
        page
          .locator("#contact")
          .evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeGreaterThanOrEqual(87);
    await expect(
      page.getByRole("link", { name: "Get in touch", exact: true }),
    ).toBeInViewport();
    await expect
      .poll(() =>
        header.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBe(0);
    await mkdir(".data/screenshots", { recursive: true });
    await page.screenshot({
      path: `.data/screenshots/sticky-navigation-${viewport.width}.png`,
    });
    await page.emulateMedia({ media: "print" });
    await expect(header).toBeHidden();
  });
}

test("mobile navigation scrolls on short screens without hiding the controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.getByRole("button", { name: "Open navigation" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect
    .poll(() =>
      menu.evaluate((element) => element.scrollHeight > element.clientHeight),
    )
    .toBe(true);
  await expect
    .poll(() =>
      menu.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(320);
  const contact = menu.getByRole("link", { name: "Contact", exact: true });
  await contact.scrollIntoViewIfNeeded();
  await expect(contact).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toBeInViewport();
  await contact.focus();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect
    .poll(() =>
      page
        .locator(".site-header")
        .evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBe(0);
});
