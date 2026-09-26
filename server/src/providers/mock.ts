import type { ImageProvider } from "./types";

export function createMockProvider(name: string): ImageProvider {
  return {
    name,
    async restyle(image, mimetype, prompt) {
      console.log(`[MOCK:${name}] ${prompt}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { data: image, mimetype };
    },
  };
}