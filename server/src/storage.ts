import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_DIR = path.resolve("storage");

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function saveFile(data: Buffer, ext: string){
    await mkdir(STORAGE_DIR, { recursive: true });
    const key = `${randomUUID()}.${ext}`;
    await writeFile(path.join(STORAGE_DIR, key), data);
    return key;
}

export function getFilePath(key: string){
    return path.join(STORAGE_DIR, key);
}