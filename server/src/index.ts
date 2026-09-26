import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { generateRouter } from "./routes/generate";
import { generationsRouter } from "./routes/generations";
import { env } from "./config";

const app = express();
const PORT = env.PORT;

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", generateRouter);
app.use("/api/generations", generationsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});