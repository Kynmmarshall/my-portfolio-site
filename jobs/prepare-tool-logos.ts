import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const sources = [
  {
    name: "Flame",
    slug: "flame",
    url: "https://user-images.githubusercontent.com/6718144/101553774-3bc7b000-39ad-11eb-8a6a-de2daa31bd64.png",
    provenance: "https://github.com/flame-engine/flame",
  },
  {
    name: "Pygame",
    slug: "pygame",
    url: "https://www.pygame.org/docs/_images/pygame_logo.png",
    provenance: "https://www.pygame.org/docs/logos.html",
  },
];
await mkdir("public/media/technologies", { recursive: true });
const records = [];
for (const source of sources) {
  const response = await fetch(source.url, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`${source.name} logo returned ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const output = `public/media/technologies/${source.slug}.webp`;
  const result = await sharp(bytes)
    .trim()
    .resize({
      width: 320,
      height: 160,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 92 })
    .toFile(output);
  records.push({
    ...source,
    output,
    width: result.width,
    height: result.height,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  console.log(`${source.name}: ${result.width}x${result.height}`);
}
await writeFile(
  "public/media/technologies/sources.json",
  JSON.stringify(records, null, 2),
);
