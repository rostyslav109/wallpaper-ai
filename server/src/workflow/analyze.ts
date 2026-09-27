import { z } from "zod";
import { askVisionJson, toPreview } from "./vision";

const analysisSchema = z.object({
  sceneType: z.enum(["portrait", "group", "landscape", "cityscape", "interior", "animal", "object", "other"]),
  subject: z.string(),
  lighting: z.string(),
  mood: z.string(),
  dominantColors: z.array(z.string()).max(5),
  hasPeople: z.boolean(),
});

export type PhotoAnalysis = z.infer<typeof analysisSchema>;

const INSTRUCTIONS = `You analyze a photo that will be repainted in an artistic style.
Return ONLY a JSON object with these fields:
- sceneType: one of portrait, group, landscape, cityscape, interior, animal, object, other
- subject: the main subject in a few words
- lighting: a short description of the light, e.g. "soft golden hour", "harsh midday", "night neon"
- mood: one or two words
- dominantColors: up to 5 color names
- hasPeople: true or false`;

export async function analyzePhoto(image: Buffer): Promise<PhotoAnalysis> {
  const json = await askVisionJson(INSTRUCTIONS, "Analyze this photo.", [await toPreview(image)]);
  return analysisSchema.parse(json);
}