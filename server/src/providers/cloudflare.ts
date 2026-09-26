import sharp from "sharp";
import type { ImageProvider } from "./types";
import { detectMimetype } from "../images";

const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const INPUT_MAX = 512; // модель приймає вхідні картинки до 512x512
const OUTPUT_MAX = 768; // безкоштовний рівень: результат не більший за 768px

function toValidSize(n: number) {
  return Math.min(1920, Math.max(256, Math.round(n / 16) * 16));
}

export function createCloudflareProvider(accountId: string, apiToken: string): ImageProvider {
  return {
    name: "cloudflare-flux-2-klein-4b",
    async restyle(image, mimetype, prompt) {
      const input = await sharp(image)
        .resize(INPUT_MAX, INPUT_MAX, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();

      const { width = INPUT_MAX, height = INPUT_MAX } = await sharp(input).metadata();
      const scale = OUTPUT_MAX / Math.max(width, height);

      const form = new FormData();
      form.append("prompt", prompt);
      form.append("input_image_0", new Blob([new Uint8Array(input)], { type: "image/jpeg" }), "input.jpg");
      form.append("width", String(toValidSize(width * scale)));
      form.append("height", String(toValidSize(height * scale)));

      console.log(`[cloudflare] sending ${width}x${height} image to ${MODEL}...`);
      const startedAt = Date.now();

      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiToken}` },
          body: form,
          signal: AbortSignal.timeout(90_000),
        }
      );

      console.log(`[cloudflare] response ${res.status} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

      const body = await res.json().catch(() => null);
      const b64: unknown = body?.result?.image;

      if (!res.ok || typeof b64 !== "string") {
        throw new Error(`Cloudflare AI error ${res.status}: ${JSON.stringify(body?.errors ?? body)}`);
      }

      const data = Buffer.from(b64, "base64");
      return { data, mimetype: await detectMimetype(data) };
    },
  };
}
