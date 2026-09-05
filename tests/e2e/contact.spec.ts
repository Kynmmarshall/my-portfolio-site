import { test, expect } from "@playwright/test";

test("Get in touch uses the correct mailto recipient and subject on click and Enter", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const activated: string[] = [];
  await page.exposeFunction("recordMailto", (href: string) =>
    activated.push(href),
  );
  await page.addInitScript(() => {
    document.addEventListener("click", (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href^="mailto:"]')
          : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      event.preventDefault();
      void (
        window as unknown as { recordMailto: (href: string) => Promise<void> }
      ).recordMailto(link.href);
    });
  });
  await page.goto("/");
  const contact = page.locator("#contact");
  const action = contact.getByRole("link", {
    name: "Get in touch",
    exact: true,
  });
  const email = "kynmmarshall@gmail.com";
  const expected = (intent: string) =>
    `mailto:${email}?subject=${encodeURIComponent(`${intent} / Portfolio inquiry`)}`;
  await expect(action).toHaveAttribute("href", expected("A project"));
  for (const [index, intent] of [
    "A project",
    "A role",
    "A collaboration",
  ].entries()) {
    await contact.getByRole("radio", { name: intent, exact: true }).check();
    await expect(action).toHaveAttribute("href", expected(intent));
    await action.click();
    await expect.poll(() => activated.length).toBe(index + 1);
    expect(activated[index]).toBe(expected(intent));
  }
  await action.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => activated.length).toBe(4);
  expect(activated[3]).toBe(expected("A collaboration"));
  await contact.getByRole("link", { name: email, exact: true }).click();
  await expect.poll(() => activated.length).toBe(5);
  expect(activated[4]).toBe(`mailto:${email}`);
});

test("browser email fallback opens Gmail with the selected subject", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await context.route("https://mail.google.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<title>Compose test</title>",
    }),
  );
  await page.goto("/");
  const contact = page.locator("#contact");
  const gmail = contact.getByRole("link", { name: "Compose in Gmail" });
  for (const intent of ["A project", "A role", "A collaboration"]) {
    await contact.getByRole("radio", { name: intent, exact: true }).check();
    const url = new URL((await gmail.getAttribute("href"))!);
    expect(url.origin).toBe("https://mail.google.com");
    expect(url.searchParams.get("to")).toBe("kynmmarshall@gmail.com");
    expect(url.searchParams.get("su")).toBe(`${intent} / Portfolio inquiry`);
  }
  const popupPromise = page.waitForEvent("popup");
  await gmail.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  await expect(popup).toHaveTitle("Compose test");
  expect(new URL(popup.url()).searchParams.get("to")).toBe(
    "kynmmarshall@gmail.com",
  );
  await popup.close();
});
