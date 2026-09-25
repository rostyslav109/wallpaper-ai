import { Router } from "express";
import multer from "multer";
import { styles } from "../styles";
import { restyleImage } from "../ai";

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

generateRouter.post("/generate", upload.single("image"), async (req, res) => {
    if(!req.file){
        res.status(400).json({ error: "No file uploaded" });
        return;
    }

    const style = styles.find((s) => s.id === req.body.style);
    if(!style){
        res.status(400).json({ error: "Invalid style" });
        return;
    }

    try{
        const result = await restyleImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            style.prompt
        );
        res.type(result.mimetype).send(result.data);
    }catch (error){
        console.error(error);
        res.status(500).json({ error: "Generation failed" });
    }
});