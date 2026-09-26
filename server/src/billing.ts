import { prisma } from "./db";
import { env } from "./config";

export type Tier = "FREE" | "PREMIUM";
export type ReserveResult = Tier | "NO_CREDITS" | "FREE_DAILY_LIMIT";

export async function reserveGeneration(userId: string): Promise<ReserveResult> {
  const paid = await prisma.user.updateMany({
    where: { id: userId, credits: { gt: 0 } },
    data: { credits: { decrement: 1 } },
  });
  if (paid.count === 1) return "PREMIUM";

  const free = await prisma.user.updateMany({
    where: { id: userId, freeGenerations: { gt: 0 } },
    data: { freeGenerations: { decrement: 1 } },
  });
  if (free.count === 0) return "NO_CREDITS";

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const usedToday = await prisma.generation.count({
    where: {
      tier: "FREE",
      status: { not: "FAILED" },
      createdAt: { gte: startOfDay },
    },
  });

  if (usedToday >= env.FREE_DAILY_LIMIT) {
    await refundGeneration(userId, "FREE");
    return "FREE_DAILY_LIMIT";
  }

  return "FREE";
}

export async function refundGeneration(userId: string, tier: Tier) {
  await prisma.user.update({
    where: { id: userId },
    data:
      tier === "PREMIUM"
        ? { credits: { increment: 1 } }
        : { freeGenerations: { increment: 1 } },
  });
}