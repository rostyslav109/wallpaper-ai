import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { styles } from "../styles";
import { contentTypeForKey, readStoredFile } from "../storage";
import type { Generation } from "../../generated/prisma/client";

export const generationsRouter = Router();

generationsRouter.use(requireAuth);

// Оцінки якості з кроку перевірки (поле reviews — JSON у базі)
function scoresOf(reviews: unknown): number[] {
  if (!Array.isArray(reviews)) return [];
  return reviews
    .map((review) => (review as { score?: unknown })?.score)
    .filter((score): score is number => typeof score === "number");
}

function toPublicGeneration(g: Generation) {
  return {
    id: g.id,
    styleName: styles.find((s) => s.id === g.styleId)?.name ?? g.styleId,
    status: g.status,
    step: g.step,
    tier: g.tier,
    scores: scoresOf(g.reviews),
    createdAt: g.createdAt,
    originalUrl: `/api/generations/${g.id}/original`,
    resultUrl: g.resultKey ? `/api/generations/${g.id}/result` : null,
  };
}

generationsRouter.get("/", async (req, res) => {
  const generations = await prisma.generation.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(generations.map(toPublicGeneration));
});

// Статус однієї генерації — його опитує фронтенд, поки йде обробка
generationsRouter.get("/:id", async (req, res) => {
  const generation = await prisma.generation.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });

  if (!generation) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(toPublicGeneration(generation));
});

generationsRouter.get("/:id/:kind", async (req, res) => {
  const { id, kind } = req.params;

  if (kind !== "original" && kind !== "result") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const generation = await prisma.generation.findFirst({
    where: { id, userId: req.userId! },
  });

  if (!generation) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const key = kind === "original" ? generation.originalKey : generation.resultKey;
  if (!key) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const data = await readStoredFile(key);
  res.type(contentTypeForKey(key)).send(data);
});