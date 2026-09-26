import {Router} from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/requireAuth";
import { env } from "../config";
import { loginSchema, registerSchema } from "../schemas";
import { authLimiter } from "../middleware/rateLimits";
import type { Response } from "express";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { googleSchema } from "../schemas";

export const authRouter = Router();
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function publicUser(user: { id: string; email: string; credits: number; freeGenerations: number }) {
    return {
        id: user.id,
        email: user.email,
        credits: user.credits,
        freeGenerations: user.freeGenerations,
    };
}

function setAuthCookie(res: Response, userId: string) {
  const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

authRouter.post("/register", authLimiter, async (req, res) => {

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

    res.status(201).json(publicUser(user));

});

authRouter.post("/login", authLimiter, async (req,res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message });
        return;
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }

    setAuthCookie(res, user.id);

    res.json(publicUser(user));
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(publicUser(user));
});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
})

authRouter.post("/google", authLimiter, async (req, res) => {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Missing Google credential" });
        return;
    }

    let payload: TokenPayload | undefined;
    try {
        const ticket = await googleClient.verifyIdToken({
        idToken: parsed.data.credential,
        audience: env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        res.status(401).json({ error: "Invalid Google token" });
        return;
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        res.status(401).json({ error: "Google account email is not verified" });
        return;
    }
    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    let isNew = false;

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
        const existing = await prisma.user.findUnique({ where: { email } });

        if (existing) {
        user = await prisma.user.update({
            where: { id: existing.id },
            data: { googleId },
        });
        } else {
        user = await prisma.user.create({ data: { email, googleId } });
        isNew = true;
        }
    }

    setAuthCookie(res, user.id);
    res.json({ ...publicUser(user), isNew });
});
