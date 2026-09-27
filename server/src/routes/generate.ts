import { Router } from "express";
import multer from "multer";
import { styles } from "../styles";
import { freeProvider, premiumProvider } from "../providers";
import { reserveGeneration, refundGeneration } from "../billing";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { saveFile } from "../storage";
import { prepareImage, InvalidImageError } from "../images";
import { generateLimiter } from "../middleware/rateLimits";
import { processGeneration } from "../workflow/process";

export const generateRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

generateRouter.get("/styles", (req, res) => {
    const publicStyles = styles.map((style) => ({
        id: style.id,
        name: style.name,
        description: style.description,
    }));
    res.json(publicStyles);
});



// generateRouter.post("/upload", upload.single("image"), (req, res) => {
//     if(!req.file){
//         res.status(400).json({ error: "No file uploaded" });
//         return;
//     }

//     res.json({
//         name: req.file.originalname,
//         size: req.file.size,
//         type: req.file.mimetype,
//     });
// });

generateRouter.post("/generate", requireAuth, generateLimiter, upload.single("image"), async (req, res) => {
    if(!req.file){
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    const style = styles.find((s) => s.id === req.body.style);
    if(!style){
        res.status(400).json({ error: "Invalid style" });
        return;
    }

    let prepared: Awaited<ReturnType<typeof prepareImage>>;
    try {
        prepared = await prepareImage(req.file.buffer);
    } catch (error) {
        if (error instanceof InvalidImageError) {
            res.status(400).json({ error: "Invalid or unsupported image" });
            return;
        }
        throw error;
    }

    const userId = req.userId!;

    const tier = await reserveGeneration(userId);

    if (tier === "NO_CREDITS") {
        res.status(402).json({ error: "Not enough credits", code: "NO_CREDITS" });
        return;
    }

    if (tier === "FREE_DAILY_LIMIT") {
        res.status(429).json({
            error: "Free generations are used up for today. Try again tomorrow or buy credits.",
            code: "FREE_DAILY_LIMIT",
        });
        return;
    }

    const provider = tier === "PREMIUM" ? premiumProvider : freeProvider;
    console.log(`[generate] user=${userId} tier=${tier} provider=${provider.name} style=${style.id}`);

    // Зберігаємо оригінал і створюємо запис. Якщо тут щось впало — повертаємо кредит.
    let generationId: string;
    try {
        const originalKey = await saveFile(prepared.data, prepared.ext);
        const generation = await prisma.generation.create({
            data: { userId, styleId: style.id, originalKey, tier, step: "queued" },
        });
        generationId = generation.id;
    } catch (error) {
        await refundGeneration(userId, tier);
        throw error;
    }

    // Відповідаємо одразу — генерація йде у фоні, клієнт опитує GET /api/generations/:id
    res.status(202).json({ id: generationId, tier });

    void processGeneration({
        generationId,
        userId,
        tier,
        provider,
        image: prepared.data,
        mimetype: prepared.mimetype,
        style,
    });
});
