// Кроки, які бачить користувач у таймлайні генерації
export type GenerationStep =
  | "queued"
  | "analyzing"
  | "painting"
  | "reviewing"
  | "improving"
  | "saving"
  | "done"
  | "failed";
