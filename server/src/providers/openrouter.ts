import type { ImageProvider } from "./types";
import { detectMimetype } from "../images";

export function createOpenRouterProvider(apiKey: string, model: string): ImageProvider {
  return {
    name: `openrouter-${model}`,
    async restyle(image, mimetype, prompt) {
      console.log(`[openrouter] sending image to ${model}...`);
      const startedAt = Date.now();

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimetype};base64,${image.toString("base64")}` },
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(120_000),
      });

      console.log(`[openrouter] response ${res.status} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);

      const body = await res.json().catch(() => null);
      const url: unknown = body?.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!res.ok || typeof url !== "string") {
        throw new Error(`OpenRouter error ${res.status}: ${JSON.stringify(body?.error ?? body)}`);
      }

      const base64 = url.slice(url.indexOf(",") + 1);
      const data = Buffer.from(base64, "base64");
      return { data, mimetype: await detectMimetype(data) };
    },
  };
}
