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
    GEMINI_IMAGE_MODEL: z.string().default("gemini-3.1-flash-image-preview"),
    GOOGLE_CLIENT_ID: z.string().min(1),
});

export const env = envSchema.parse(process.env);