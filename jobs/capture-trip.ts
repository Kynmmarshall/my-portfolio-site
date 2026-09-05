import { chromium } from "@playwright/test";
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.goto("https://trip-io.duckdns.org/app/", {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  let source = "https://trip-io.duckdns.org/app/";
  try {
    await page
      .locator("flutter-view, flt-glass-pane")
      .first()
      .waitFor({ state: "visible", timeout: 30000 });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          let frames = 0;
          const frame = () => {
            if (++frames > 60) resolve();
            else requestAnimationFrame(frame);
          };
          requestAnimationFrame(frame);
        }),
    );
  } catch {
    source = "https://trip-io.duckdns.org/";
    await page.goto(source, { waitUntil: "networkidle", timeout: 60000 });
    await page.locator("h1").waitFor({ state: "visible" });
  }
  const screenshot = await page.screenshot();
  await sharp(screenshot)
    .resize({ width: 1400 })
    .webp({ quality: 85 })
    .toFile("public/media/projects/trip-io/cover.webp");
  const manifest = JSON.parse(
    await readFile("public/media/manifest.json", "utf8"),
  ) as Record<string, unknown>[];
  const entry = manifest.find((item) =>
    String(item.local).endsWith("trip-io/cover.webp"),
  );
  if (entry) {
    entry.source = source;
    entry.importedAt = new Date().toISOString();
    entry.capture =
      "Browser screenshot after application element readiness, or public website if the app does not initialize.";
  }
  await writeFile(
    "public/media/manifest.json",
    JSON.stringify(manifest, null, 2),
  );
  console.log(`Trip-io capture: ${source}; title: ${await page.title()}`);
} finally {
  await browser.close();
}
