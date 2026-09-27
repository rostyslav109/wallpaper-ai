import sharp from "sharp";
import { env } from "../config";

// Зменшуємо картинку перед відправкою: моделі вистачає 1024px, а платимо ми за розмір
export async function toPreview(image: Buffer) {
  const data = await sharp(image)
    .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}

export async function askVisionJson(instructions: string, text: string, images: string[]): Promise<unknown> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENROUTER_VISION_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: instructions },
        {
          role: "user",
          content: [
            { type: "text", text },
            ...images.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const body = await res.json().catch(() => null);
  const content = body?.choices?.[0]?.message?.content;

  if (!res.ok || typeof content !== "string") {
    throw new Error(`Vision error ${res.status}: ${JSON.stringify(body?.error ?? body)}`);
  }

  return JSON.parse(content);
}