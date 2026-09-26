import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { styles } from "../styles";
import { getFilePath } from "../storage";

export const generationsRouter = Router();

generationsRouter.use(requireAuth);

generationsRouter.get("/", async (req, res) => {
    const generations = await prisma.generation.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(generations.map((g) =>({
    id: g.id,
    styleName: styles.find((s) => s.id === g.styleId)?.name ?? g.styleId,
    status: g.status,
    tier: g.tier,
    createdAt: g.createdAt,
    originalUrl: `/api/generations/${g.id}/original`,
    resultUrl: g.resultKey ? `/api/generations/${g.id}/result` : null,
  })))
})

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

  res.sendFile(getFilePath(key));
});