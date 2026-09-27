import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    FREE_DAILY_LIMIT: z.coerce.number().default(50),
    CLOUDFLARE_ACCOUNT_ID: z.string().min(1).optional(),
    CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENROUTER_IMAGE_MODEL: z.string().default("google/gemini-3.1-flash-image"),
    OPENROUTER_VISION_MODEL: z.string().default("google/gemini-3.6-flash"),
    PREMIUM_WORKFLOW: z.enum(["on", "off"]).default("on"),
    PREMIUM_MIN_SCORE: z.coerce.number().min(1).max(10).default(7),
    PREMIUM_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(3).default(2),
    GEMINI_IMAGE_MODEL: z.string().default("gemini-3.1-flash-image-preview"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    APP_URL: z.string().url().default("http://localhost:5173"),
    CREEM_MODE: z.enum(["sandbox", "production"]).default("sandbox"),
    CREEM_API_KEY: z.string().min(1).optional(),
    CREEM_WEBHOOK_SECRET: z.string().min(1).optional(),
    CREEM_PRODUCT_STARTER: z.string().min(1).optional(),
    CREEM_PRODUCT_POPULAR: z.string().min(1).optional(),
    CREEM_PRODUCT_PRO: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);