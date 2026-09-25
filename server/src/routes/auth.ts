import {Router} from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import jwt from "jsonwebtoken";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    const {email, password} = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    if (password.length < 8) {
        res.status(400).json({ error: "Password must be at least 8 characters" });
        return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({where: {email: normalizedEmail}});
    if (existing) {
        res.status(409).json({ error: "Email already registered" });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email: normalizedEmail, passwordHash },
    });

    res.status(201).json({
        id: user.id,
        email: user.email,
        credits: user.credits,
    });

});

authRouter.post("/login", async (req,res) => {
    const {email, password} = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({id: user.id, email: user.email, credits: user.credits});
});

authRouter.get("/me", async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {userId: string};
        const user = await prisma.user.findUnique({where: {id: payload.userId}});
        if (!user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        res.json({id: user.id, email: user.email, credits: user.credits});
    } catch (error) {
        res.status(401).json({ error: "Not authenticated" });
    }

});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
})
