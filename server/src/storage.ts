import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "./config";

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

export function contentTypeForKey(key: string) {
  const ext = key.split(".").pop() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

// Сховище вміє дві речі: зберегти файл і прочитати його за ключем.
// Локально файли лежать у папці storage/, у продакшні — у Cloudflare R2.
type Storage = {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
};

function createLocalStorage(): Storage {
  const dir = path.resolve("storage");

  return {
    async put(key, data) {
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, key), data);
    },
    async get(key) {
      return readFile(path.join(dir, key));
    },
  };
}

function createR2Storage(accountId: string, accessKeyId: string, secretAccessKey: string, bucket: string): Storage {
  // R2 сумісний з API Amazon S3, тому використовуємо офіційний S3-клієнт
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    async put(key, data) {
      await client.send(
        new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: contentTypeForKey(key) })
      );
    },
    async get(key) {
      const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!object.Body) throw new Error(`Empty object: ${key}`);
      return Buffer.from(await object.Body.transformToByteArray());
    },
  };
}

const storage: Storage =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET
    ? createR2Storage(env.R2_ACCOUNT_ID, env.R2_ACCESS_KEY_ID, env.R2_SECRET_ACCESS_KEY, env.R2_BUCKET)
    : createLocalStorage();

console.log(`[storage] using ${env.R2_BUCKET ? `R2 bucket "${env.R2_BUCKET}"` : "local folder"}`);

export async function saveFile(data: Buffer, ext: string) {
  const key = `${randomUUID()}.${ext}`;
  await storage.put(key, data);
  return key;
}

export function readStoredFile(key: string) {
  return storage.get(key);
}
