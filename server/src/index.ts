import "dotenv/config";
import path from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { generateRouter } from "./routes/generate";
import { generationsRouter } from "./routes/generations";
import { billingRouter, polarWebhookHandler } from "./routes/billing";
import { env } from "./config";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = env.PORT;
const isProduction = env.NODE_ENV === "production";

// На хостингу запити приходять через проксі — довіряємо йому, щоб бачити справжній IP (для rate limiting)
if (isProduction) {
  app.set("trust proxy", 1);
}

// Вебхук оплати — до express.json(): йому потрібне сире тіло для перевірки підпису
app.post("/api/webhooks/polar", express.raw({ type: "application/json" }), polarWebhookHandler);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api", generateRouter);
app.use("/api/generations", generationsRouter);
app.use("/api/billing", billingRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// У продакшні той самий сервер віддає зібраний фронтенд (client/dist)
if (isProduction) {
  app.use(express.static(path.resolve("../client/dist")));
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});