import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Invalid email"));

export const registerSchema = z.object({
    email,
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password is too long"),
});

export const loginSchema = z.object({
    email,
    password: z.string().min(1, "Password is required").max(72),
})

export const googleSchema = z.object({
  credential: z.string().min(1),
});