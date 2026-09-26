import {Router} from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/requireAuth";
import { env } from "../config";
import { loginSchema, registerSchema } from "../schemas";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message });
        return;
    }

    const { email, password } = parsed.data;
    // const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({where: {email: email}});
    if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email: email, passwordHash },
    });

    res.status(201).json({
        id: user.id,
        email: user.email,
        credits: user.credits,
    });

});

authRouter.post("/login", async (req,res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message });
        return;
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({id: user.id, email: user.email, credits: user.credits});
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({ id: user.id, email: user.email, credits: user.credits });
});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
})
