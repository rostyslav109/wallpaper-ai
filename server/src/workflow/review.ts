import { z } from "zod";
import { askVisionJson, toPreview } from "./vision";

const reviewSchema = z.object({
  score: z.number().min(1).max(10),
  issues: z.array(z.string()).max(5),
  fix: z.string(),
});

export type Review = z.infer<typeof reviewSchema>;

const INSTRUCTIONS = `You are a strict art director reviewing an AI restyle of a photo.
The first image is the original photo, the second is the restyled result.
Score the result from 1 to 10 using this checklist:
- the composition and main subject of the original are preserved
- people or animals keep their identity and natural proportions
- the requested art style is clearly and consistently applied
- no artifacts: distorted faces or hands, extra limbs, melted details, garbled text
- it works as a wallpaper: no text, borders or signatures
Return ONLY a JSON object:
- score: number from 1 to 10
- issues: up to 5 short problems (empty array if none)
- fix: one short instruction that would fix the main problem (empty string if none)`;

export async function reviewResult(original: Buffer, result: Buffer, styleName: string): Promise<Review> {
  const json = await askVisionJson(
    INSTRUCTIONS,
    `Requested style: ${styleName}. Review the result.`,
    [await toPreview(original), await toPreview(result)]
  );
  return reviewSchema.parse(json);
}
