import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { projectLogos } from "../content/logos.ts";

const manifest = [];
for (const logo of projectLogos) {
  const response = await fetch(logo.source, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`${logo.slug}: logo request returned ${response.status}`);
  const original = Buffer.from(await response.arrayBuffer());
  if (original.length > 10_000_000)
    throw new Error(`${logo.slug}: logo exceeds import limit`);
  const directory = `public/media/projects/${logo.slug}`;
  await mkdir(directory, { recursive: true });
  const image = await sharp(original)
    .trim({ threshold: 8 })
    .resize({
      width: 640,
      height: 640,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 92 })
    .toFile(`${directory}/logo.webp`);
  manifest.push({
    ...logo,
    local: `/media/projects/${logo.slug}/logo.webp`,
    width: image.width,
    height: image.height,
    bytes: image.size,
    sha256: createHash("sha256").update(original).digest("hex"),
    importedAt: new Date().toISOString(),
  });
  console.log(
    `${logo.slug}: ${image.width}x${image.height}, ${Math.round(image.size / 1024)}KB`,
  );
}
await writeFile("public/media/logos.json", JSON.stringify(manifest, null, 2));
