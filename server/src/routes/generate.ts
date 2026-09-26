import { Router } from "express";
import multer from "multer";
import { styles } from "../styles";
import { restyleImage } from "../ai";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { saveFile, IMAGE_EXTENSIONS } from "../storage";

export const generateRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

generateRouter.get("/styles", (req, res) => {
    const publicStyles = styles.map((style) => ({
        id: style.id,
        name: style.name,
    }));
    res.json(publicStyles);
});



generateRouter.post("/upload", upload.single("image"), (req, res) => {
    if(!req.file){
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    res.json({
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
    });
});

generateRouter.post("/generate", requireAuth, upload.single("image"), async (req, res) => {
    if(!req.file){
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    const style = styles.find((s) => s.id === req.body.style);
    if(!style){
        res.status(400).json({ error: "Invalid style" });
        return;
    }

    const ext = IMAGE_EXTENSIONS[req.file.mimetype];
    if (!ext) {
        res.status(400).json({ error: "Unsupported image type" });
        return;
    }

    const userId = req.userId!;

    const charged = await prisma.user.updateMany({
        where: { id: userId, credits: { gt: 0 } },
        data: { credits: { decrement: 1 } },
    });

    if (charged.count === 0) {
        res.status(402).json({ error: "Not enough credits" });
        return;
    }

      let generationId: string | null = null;

    try {
        const originalKey = await saveFile(req.file.buffer, ext);

        const generation = await prisma.generation.create({
        data: { userId, styleId: style.id, originalKey },
        });
        generationId = generation.id;

        const result = await restyleImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        style.prompt
        );

        const resultExt = IMAGE_EXTENSIONS[result.mimetype] ?? "png";
        const resultKey = await saveFile(result.data, resultExt);

        await prisma.generation.update({
        where: { id: generation.id },
        data: { status: "DONE", resultKey },
        });

        res.type(result.mimetype).send(result.data);
    } catch (error) {
        console.error(error);

        if (generationId) {
        await prisma.generation.update({
            where: { id: generationId },
            data: { status: "FAILED" },
        });
        }

        await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 1 } },
        });

        res.status(500).json({ error: "Generation failed" });
    }
});