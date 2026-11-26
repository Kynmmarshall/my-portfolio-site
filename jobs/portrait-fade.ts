import sharp from "sharp";

/** Longest side of the shipped portrait, in pixels. */
const SIZE = 1000;
/**
 * The original cut-out carries a 3 to 5 pixel rim of near-white pixels that are
 * still mostly opaque (remnants of its old background), which reads as a white
 * outline around the head and shoulders on a dark backdrop. Pulling the alpha edge
 * in by more than the rim removes it; the pixels that become the new edge are
 * real skin, hair and shirt.
 */
const EDGE_TRIM = 4;

/** Separable grey-scale erosion; indices clamp at the border so the image edge never erodes. */
function erode(alpha: Uint8Array, width: number, height: number, radius: number) {
  const pass = (source: Uint8Array, horizontal: boolean) => {
    const target = new Uint8Array(source.length);
    const length = horizontal ? width : height;
    const lines = horizontal ? height : width;
    for (let line = 0; line < lines; line++)
      for (let position = 0; position < length; position++) {
        let lowest = 255;
        for (let offset = -radius; offset <= radius; offset++) {
          const at = Math.min(length - 1, Math.max(0, position + offset));
          const value = horizontal
            ? source[line * width + at]
            : source[at * width + line];
          if (value < lowest) lowest = value;
        }
        target[horizontal ? line * width + position : position * width + line] =
          lowest;
      }
    return target;
  };
  return pass(pass(alpha, true), false);
}

/** 3x3 binomial smoothing so the trimmed edge is anti-aliased rather than stair-stepped. */
function smooth(alpha: Uint8Array, width: number, height: number) {
  const pass = (source: Uint8Array, horizontal: boolean) => {
    const target = new Uint8Array(source.length);
    const length = horizontal ? width : height;
    const lines = horizontal ? height : width;
    for (let line = 0; line < lines; line++)
      for (let position = 0; position < length; position++) {
        const read = (at: number) => {
          const clamped = Math.min(length - 1, Math.max(0, at));
          return horizontal
            ? source[line * width + clamped]
            : source[clamped * width + line];
        };
        target[horizontal ? line * width + position : position * width + line] =
          Math.round(
            (read(position - 1) + 2 * read(position) + read(position + 1)) / 4,
          );
      }
    return target;
  };
  return pass(pass(alpha, true), false);
}

/**
 * Prepares the site portrait.
 *
 * Two flaws of the source photo are fixed here: the white rim around the cut-out
 * (see EDGE_TRIM), and the shoulders running to the last row at full width, which
 * ends in a hard straight edge. Fading the lower part of the alpha channel
 * dissolves that edge into whatever sits behind the picture, in the hero, the
 * About card and the header avatar alike, without touching the face.
 */
export async function preparePortrait(input: Buffer, fade = 0.3) {
  const { data, info } = await sharp(input)
    .rotate()
    .resize({
      width: SIZE,
      height: SIZE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const alpha = new Uint8Array(width * height);
  for (let index = 0; index < alpha.length; index++) alpha[index] = data[index * 4 + 3];
  const trimmed = smooth(erode(alpha, width, height, EDGE_TRIM), width, height);
  for (let index = 0; index < alpha.length; index++) data[index * 4 + 3] = trimmed[index];

  const start = Math.round(height * (1 - fade));
  for (let y = start; y < height; y++) {
    const t = (y - start) / Math.max(1, height - 1 - start);
    const keep = 1 - t * t * (3 - 2 * t);
    for (let x = 0; x < width; x++) {
      const alpha = (y * width + x) * 4 + 3;
      data[alpha] = Math.round(data[alpha] * keep);
    }
  }
  return sharp(data, { raw: { width, height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 92, effort: 5 })
    .toBuffer({ resolveWithObject: true });
}
