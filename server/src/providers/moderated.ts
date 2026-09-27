import { moderatePrompt } from "../creem";
import type { ImageProvider } from "./types";

// Декоратор: перед кожним викликом моделі промпт проходить модерацію Creem.
// Обгортаємо провайдер цілком, тож перевірку неможливо «забути» ні в безкоштовній генерації,
// ні в преміум-workflow з повторною спробою.
export function withModeration(provider: ImageProvider): ImageProvider {
  return {
    name: provider.name,
    async restyle(image, mimetype, prompt) {
      await moderatePrompt(prompt);
      return provider.restyle(image, mimetype, prompt);
    },
  };
}
