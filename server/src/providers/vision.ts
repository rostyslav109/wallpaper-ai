// Vision LLM — модель, яка «дивиться» на зображення і відповідає текстом (JSON).
// У workflow вона аналізує фото, складає промпт і оцінює результат. Малює — інша модель.

export type VisionImage = { data: Buffer; mimetype: string };

export type VisionProvider = {
  name: string;
  askJson(prompt: string, images: VisionImage[]): Promise<unknown>;
};

export function createOpenRouterVision(apiKey: string, model: string): VisionProvider {
  return {
    name: `openrouter-${model}`,
    async askJson(prompt, images) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                ...images.map((image) => ({
                  type: "image_url",
                  image_url: { url: `data:${image.mimetype};base64,${image.data.toString("base64")}` },
                })),
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      });

      const body = await res.json().catch(() => null);
      const text: unknown = body?.choices?.[0]?.message?.content;

      if (!res.ok || typeof text !== "string") {
        throw new Error(`Vision error ${res.status}: ${JSON.stringify(body?.error ?? body)}`);
      }

      // Деякі моделі обгортають JSON у ```json ... ``` — беремо лише частину між першою { і останньою }
      return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    },
  };
}
