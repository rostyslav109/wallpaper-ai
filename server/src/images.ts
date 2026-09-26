import sharp from "sharp";

const MAX_SIDE = 2048;
const ALLOWED_FORMATS = ["jpeg", "png", "webp"];

export class InvalidImageError extends Error {}

export async function prepareImage(input: Buffer) {
  let format: string | undefined;

  try {
    const meta = await sharp(input).metadata();
    format = meta.format;
  } catch {
    throw new InvalidImageError("Not an image");
  }

  if (!format || !ALLOWED_FORMATS.includes(format)) {
    throw new InvalidImageError("Unsupported image format");
  }

  const data = await sharp(input, { limitInputPixels: 25_000_000 })
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();

  return { data, mimetype: "image/jpeg", ext: "jpg" };
}

export async function detectMimetype(data: Buffer) {
  const { format } = await sharp(data).metadata();
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}

export async function addWatermark(input: Buffer) {
  const { width = 768, height = 768 } = await sharp(input).metadata();
  const fontSize = Math.max(14, Math.round(width / 28));

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${width - fontSize}" y="${height - fontSize}" text-anchor="end"
    font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold"
    fill="white" fill-opacity="0.65" stroke="black" stroke-opacity="0.35" stroke-width="1">
    Wallpaper AI · free preview
  </text>
</svg>`;

  const data = await sharp(input)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toBuffer();

  return { data, mimetype: "image/jpeg" };
}
