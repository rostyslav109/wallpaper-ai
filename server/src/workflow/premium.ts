import { analyzePhoto, type PhotoAnalysis } from "./analyze";
import { buildPrompt } from "./prompt";
import { reviewResult, type Review } from "./review";
import type { ImageProvider, ImageResult } from "../providers/types";
import type { GenerationStep } from "./steps";

export type PromptPlan = {
  prompt: string;
  analysis: PhotoAnalysis | null;
};

export async function planPremiumPrompt(image: Buffer, stylePrompt: string): Promise<PromptPlan> {
  try {
    const analysis = await analyzePhoto(image);
    console.log(`[workflow] ${analysis.sceneType}: ${analysis.subject}`);
    return { prompt: buildPrompt(stylePrompt, analysis), analysis };
  } catch (error) {
    console.error("[workflow] analysis failed, using the base style prompt", error);
    return { prompt: stylePrompt, analysis: null };
  }
}

const MAX_ATTEMPTS = 2; // максимум одна повторна генерація — контроль витрат
const PASS_SCORE = 7; // з якої оцінки результат вважається добрим

export type WorkflowRun = {
  result: ImageResult;
  prompt: string;
  analysis: PhotoAnalysis | null;
  reviews: Review[];
};

// Увесь преміум-процес: аналіз → промпт → генерація → оцінка → (корекція)
export async function runPremiumWorkflow(
  provider: ImageProvider,
  image: Buffer,
  mimetype: string,
  style: { name: string; prompt: string },
  onStep: (step: GenerationStep) => Promise<void>
): Promise<WorkflowRun> {
  await onStep("analyzing");
  const plan = await planPremiumPrompt(image, style.prompt);

  let prompt = plan.prompt;
  let best: { result: ImageResult; score: number } | null = null;
  const reviews: Review[] = [];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await onStep(attempt === 1 ? "painting" : "improving");
    const result = await provider.restyle(image, mimetype, prompt);

    let review: Review;
    try {
      await onStep("reviewing");
      review = await reviewResult(image, result.data, style.name);
    } catch (error) {
      // Не змогли оцінити — не ламаємо генерацію, приймаємо результат як є
      console.error("[workflow] review failed, accepting the result", error);
      return { result, prompt, analysis: plan.analysis, reviews };
    }

    reviews.push(review);
    console.log(`[workflow] attempt ${attempt}: score ${review.score}`, review.issues);

    if (!best || review.score > best.score) {
      best = { result, score: review.score };
    }

    if (review.score >= PASS_SCORE || !review.fix) break;

    prompt = `${plan.prompt} Important correction: ${review.fix}`;
  }

  return { result: best!.result, prompt, analysis: plan.analysis, reviews };
}

