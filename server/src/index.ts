import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { generateRouter } from "./routes/generate";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", generateRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});