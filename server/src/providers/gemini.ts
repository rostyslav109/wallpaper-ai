import type { ImageProvider } from "./types";

export function createGeminiProvider(apiKey: string, model: string): ImageProvider {
  return {
    name: `gemini-${model}`,
    async restyle(image, mimetype, prompt) {
      console.log(`[gemini] sending image to ${model}...`);
      const startedAt = Date.now();

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mimetype, data: image.toString("base64") } },
                ],
              },
            ],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
          signal: AbortSignal.timeout(120_000),
        }
      );

      console.log(`[gemini] response ${res.status} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

      const body = await res.json().catch(() => null);
      const parts: any[] = body?.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p) => p?.inlineData?.data);

      if (!res.ok || !imagePart) {
        throw new Error(
          `Gemini error ${res.status}: ${JSON.stringify(body?.error ?? body?.promptFeedback ?? body)}`
        );
      }

      return {
        data: Buffer.from(imagePart.inlineData.data, "base64"),
        mimetype: imagePart.inlineData.mimeType ?? "image/png",
      };
    },
  };
}
