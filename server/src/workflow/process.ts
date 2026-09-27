import { prisma } from "../db";
import { refundGeneration, type Tier } from "../billing";
import { addWatermark } from "../images";
import { IMAGE_EXTENSIONS, saveFile } from "../storage";
import type { ImageProvider, ImageResult } from "../providers/types";
import { runPremiumWorkflow } from "./premium";
import type { GenerationStep } from "./steps";

type GenerationJob = {
  generationId: string;
  userId: string;
  tier: Tier;
  provider: ImageProvider;
  image: Buffer;
  mimetype: string;
  style: { name: string; prompt: string };
};

async function setStep(generationId: string, step: GenerationStep) {
  await prisma.generation.update({ where: { id: generationId }, data: { step } });
}

// Виконує генерацію у фоні: HTTP-відповідь уже відправлена, клієнт опитує статус.
// Усі помилки обробляються тут — ця функція ніколи не кидає назовні.
export async function processGeneration(job: GenerationJob) {
  const { generationId } = job;
  const onStep = (step: GenerationStep) => setStep(generationId, step);

  try {
    let result: ImageResult;

    if (job.tier === "PREMIUM") {
      const run = await runPremiumWorkflow(job.provider, job.image, job.mimetype, job.style, onStep);
      result = run.result;

      await prisma.generation.update({
        where: { id: generationId },
        data: {
          prompt: run.prompt,
          reviews: run.reviews,
          ...(run.analysis ? { analysis: run.analysis } : {}),
        },
      });
    } else {
      await onStep("painting");
      const raw = await job.provider.restyle(job.image, job.mimetype, job.style.prompt);
      result = await addWatermark(raw.data);
    }

    await onStep("saving");
    const resultKey = await saveFile(result.data, IMAGE_EXTENSIONS[result.mimetype] ?? "png");

    await prisma.generation.update({
      where: { id: generationId },
      data: { status: "DONE", step: "done", resultKey },
    });
    console.log(`[generation ${generationId}] done`);
  } catch (error) {
    console.error(`[generation ${generationId}] failed`, error);

    await prisma.generation
      .update({ where: { id: generationId }, data: { status: "FAILED", step: "failed" } })
      .catch((e: unknown) => console.error("[generation] could not mark as failed", e));

    await refundGeneration(job.userId, job.tier).catch((e: unknown) => console.error("[generation] refund failed", e));
  }
}

// Фонові завдання живуть у пам'яті процесу. Якщо сервер перезапустився посеред генерації,
// вона назавжди лишилася б PENDING — тому при старті позначаємо такі як FAILED і повертаємо кредит.
// (Працює, поки сервер один. З кількома копіями знадобиться справжня черга — BullMQ.)
export async function recoverStuckGenerations() {
  const stuck = await prisma.generation.findMany({ where: { status: "PENDING" } });

  for (const generation of stuck) {
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "FAILED", step: "failed" },
    });
    await refundGeneration(generation.userId, generation.tier);
  }

  if (stuck.length > 0) {
    console.log(`[recovery] ${stuck.length} interrupted generation(s) marked as failed and refunded`);
  }
}
