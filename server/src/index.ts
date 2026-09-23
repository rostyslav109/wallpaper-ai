import "dotenv/config";
import express from "express";
import multer from "multer";
import {styles} from "./styles"

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {filesSize: 10 * 1024 * 1024},
})

app.get("/api/health", (req, res) =>{
    res.json({status: "ok"});
});

app.get("/api/styles", (req, res) => {
  const publicStyles = styles.map((style) => ({
    id: style.id,
    name: style.name,
  }));
  res.json(publicStyles);
});

app.post("/api/upload", upload.single("image"), (req, res)=>{
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

app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
})  