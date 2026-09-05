import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const directory = "public/media/projects/trip-io";
const screenshots = [
  {
    original: "destinations.png",
    filename: "destinations.webp",
    label: "Destination discovery and filters",
  },
  {
    original: "iternary.png",
    filename: "itinerary.webp",
    label: "Itinerary planning",
  },
  { original: "map.png", filename: "map.webp", label: "Destination map" },
  {
    original: "TIA assist.png",
    filename: "tia-assistant.webp",
    label: "TIA assistant",
  },
  { original: "chat.png", filename: "chat.webp", label: "Community chat" },
  { original: "about.png", filename: "about.webp", label: "About Trip-io" },
];
const records = [];
for (const image of screenshots) {
  const source = `${directory}/${image.original}`;
  const bytes = await readFile(source);
  const output = `${directory}/${image.filename}`;
  const metadata = await sharp(bytes).metadata();
  const result = await sharp(bytes)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(output);
  records.push({
    label: image.label,
    source,
    output,
    provenance: "User-supplied application screenshot",
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    width: result.width,
    height: result.height,
    bytes: result.size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  console.log(
    `${image.filename}: ${result.width}x${result.height}, ${Math.round(result.size / 1024)}KB`,
  );
}
await writeFile(
  `${directory}/screenshots.json`,
  JSON.stringify(records, null, 2),
);
