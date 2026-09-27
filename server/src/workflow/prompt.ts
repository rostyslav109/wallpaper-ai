import type {PhotoAnalysis} from "./analyze";

const SCENE_HINTS: Record<PhotoAnalysis["sceneType"], string> = {
  portrait: "Preserve the person's facial features, expression and proportions exactly.",
  group: "Keep every person recognizable and in the same position.",
  landscape: "Emphasize depth and the sky, with expressive detail in the distance.",
  cityscape: "Keep architectural lines straight and buildings recognizable.",
  interior: "Keep the room layout, furniture and perspective intact.",
  animal: "Preserve the animal's features, fur pattern and pose.",
  object: "Keep the object's shape and silhouette clearly readable.",
  other: "",
};

export function buildPrompt(stylePrompt: string, analysis: PhotoAnalysis): string {
  const parts = [
    stylePrompt,
    SCENE_HINTS[analysis.sceneType],
    `The main subject is ${analysis.subject}.`,
    `Keep the original ${analysis.lighting} lighting and ${analysis.mood} mood.`,
    `Main colors to keep: ${analysis.dominantColors.join(", ")}.`,
    analysis.hasPeople ? "Do not change anyone's identity, age or body." : "",
    "The result will be used as a wallpaper: no text, no borders, no signature.",
  ];

  return parts.filter(Boolean).join(" ");
}