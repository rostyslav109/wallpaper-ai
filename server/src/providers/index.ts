import { env } from "../config";
import type { ImageProvider } from "./types";
import { createMockProvider } from "./mock";
import { createCloudflareProvider } from "./cloudflare";
import { createGeminiProvider } from "./gemini";
import { createOpenRouterProvider } from "./openrouter";

export const freeProvider: ImageProvider =
  env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN
    ? createCloudflareProvider(env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN)
    : createMockProvider("free");

// Пріоритет: OpenRouter → Gemini напряму → заглушка
export const premiumProvider: ImageProvider = env.OPENROUTER_API_KEY
  ? createOpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_IMAGE_MODEL)
  : env.GEMINI_API_KEY
    ? createGeminiProvider(env.GEMINI_API_KEY, env.GEMINI_IMAGE_MODEL)
    : createMockProvider("premium");

console.log(`[providers] free=${freeProvider.name}, premium=${premiumProvider.name}`);
