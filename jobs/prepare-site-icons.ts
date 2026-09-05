import sharp from "sharp";

const source = "public/media/profile/portrait.webp";
const { width, height } = await sharp(source).metadata();
if (!width || !height) throw new Error("Portrait dimensions unavailable");
const side = Math.round(Math.min(width, height) * 0.6);

for (const [output, size] of [
  ["app/icon.png", 64],
  ["app/apple-icon.png", 180],
] as const) {
  await sharp(source)
    .extract({
      left: Math.round((width - side) / 2),
      top: Math.round(height * 0.1),
      width: side,
      height: side,
    })
    .resize(size, size)
    .flatten({ background: "#e7eddf" })
    .png()
    .toFile(output);
  console.log(`Prepared ${output} (${size}x${size})`);
}
