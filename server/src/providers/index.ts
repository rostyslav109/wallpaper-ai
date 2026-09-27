import { env } from "../config";
import type { ImageProvider } from "./types";
import { createMockProvider } from "./mock";
import { createCloudflareProvider } from "./cloudflare";
import { createGeminiProvider } from "./gemini";
import { createOpenRouterProvider } from "./openrouter";
import { createOpenRouterVision, type VisionProvider } from "./vision";
import { withModeration } from "./moderated";

export const freeProvider: ImageProvider = withModeration(
  env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN
    ? createCloudflareProvider(env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN)
    : createMockProvider("free")
);

// Пріоритет: OpenRouter → Gemini напряму → заглушка
export const premiumProvider: ImageProvider = withModeration(
  env.OPENROUTER_API_KEY
    ? createOpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_IMAGE_MODEL)
    : env.GEMINI_API_KEY
      ? createGeminiProvider(env.GEMINI_API_KEY, env.GEMINI_IMAGE_MODEL)
      : createMockProvider("premium")
);

// Vision-модель для преміум-workflow (аналіз, план, оцінка). Без OpenRouter — workflow вимкнений.
export const visionProvider: VisionProvider | null =
  env.OPENROUTER_API_KEY && env.PREMIUM_WORKFLOW === "on"
    ? createOpenRouterVision(env.OPENROUTER_API_KEY, env.OPENROUTER_VISION_MODEL)
    : null;

console.log(
  `[providers] free=${freeProvider.name}, premium=${premiumProvider.name}, vision=${visionProvider?.name ?? "off"}`
);
