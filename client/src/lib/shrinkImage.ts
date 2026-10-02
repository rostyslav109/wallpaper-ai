// Зменшує великі фото прямо в браузері перед завантаженням.
// Сервер усе одно ріже зображення до 2048 px, тож надсилати 20-мегабайтний
// оригінал немає сенсу: так швидше і не впираємося в ліміт розміру файлу.
const MAX_SIDE = 2560;
const MAX_BYTES = 4 * 1024 * 1024;
const QUALITY = 0.9;

export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

  // Маленький файл з нормальною роздільністю — відправляємо як є
  if (scale === 1 && file.size <= MAX_BYTES) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
