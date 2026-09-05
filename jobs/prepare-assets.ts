import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";
import { chromium } from "@playwright/test";
import { imageSources, animationSources } from "../content/media.ts";

const exec = promisify(execFile);
const root = join(process.cwd(), "public/media");
const manifest: Record<string, unknown>[] = [];

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function download(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Asset HTTP ${response.status}: ${url}`);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > 100_000_000) throw new Error("Asset exceeds 100MB import limit");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 100_000_000)
    throw new Error("Asset exceeds 100MB import limit");
  return bytes;
}
async function optimize(bytes: Buffer, output: string, source: string) {
  await mkdir(dirname(output), { recursive: true });
  const metadata = await sharp(bytes).metadata();
  const result = await sharp(bytes)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 84 })
    .toFile(output);
  manifest.push({
    source,
    local: output.replace(process.cwd(), "").replaceAll("\\", "/"),
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    width: result.width,
    height: result.height,
    bytes: result.size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    importedAt: new Date().toISOString(),
    attribution:
      "Project media supplied through the developer's public portfolio and repositories; underlying game-art credits retained.",
  });
  console.log(
    `Prepared ${output.split("media")[1]} (${Math.round(result.size / 1024)}KB)`,
  );
}

for (const source of imageSources) {
  try {
    await optimize(
      await download(source.url),
      join(root, "projects", source.destination),
      source.url,
    );
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
await optimize(
  await readFile("images/me.png"),
  join(root, "profile/portrait.webp"),
  "images/me.png",
);
await mkdir(".data/original-media", { recursive: true });
for (const source of animationSources) {
  try {
    const bytes = await download(source.url);
    const original = join(
      process.cwd(),
      `.data/original-media/${source.slug}.gif`,
    );
    await writeFile(original, bytes);
    const output = join(root, `projects/${source.slug}`);
    await mkdir(output, { recursive: true });
    if (!(await exists(join(output, "cover.webp"))))
      await optimize(bytes, join(output, "cover.webp"), source.url);
    if (!ffmpeg) throw new Error("FFmpeg executable unavailable");
    await exec(
      ffmpeg,
      [
        "-y",
        "-i",
        original,
        "-t",
        "10",
        "-vf",
        "fps=24,scale=960:-2",
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "27",
        "-movflags",
        "+faststart",
        join(output, "preview.mp4"),
      ],
      { timeout: 120000 },
    );
    manifest.push({
      source: source.url,
      local: `/media/projects/${source.slug}/preview.mp4`,
      kind: "gameplay",
      durationLimit: 10,
      importedAt: new Date().toISOString(),
    });
    console.log(`Converted ${source.slug} gameplay`);
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  }
}
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
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
  await page.screenshot({ path: ".data/original-media/trip-io.png" });
  await optimize(
    await readFile(".data/original-media/trip-io.png"),
    join(root, "projects/trip-io/cover.webp"),
    source,
  );
} finally {
  await browser.close();
}
await mkdir("public/media/hero", { recursive: true });
if (!(await exists("public/media/hero/poster.webp")))
  await sharp({
    create: { width: 1600, height: 800, channels: 3, background: "#f2f4ed" },
  })
    .webp()
    .toFile("public/media/hero/poster.webp");
await writeFile(join(root, "manifest.json"), JSON.stringify(manifest, null, 2));
