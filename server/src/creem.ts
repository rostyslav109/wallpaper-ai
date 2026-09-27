import crypto from "node:crypto";
import { env } from "./config";

// Creem — Merchant of Record: продає пакети кредитів від свого імені, сам рахує й сплачує ПДВ.
// Sandbox (ключі creem_test_...) і production працюють на різних адресах.
const API_URL = env.CREEM_MODE === "production" ? "https://api.creem.io" : "https://test-api.creem.io";

export const isCreemConfigured = Boolean(env.CREEM_API_KEY && env.CREEM_WEBHOOK_SECRET);

async function creemRequest(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "x-api-key": env.CREEM_API_KEY ?? "", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Creem ${path} error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

type CheckoutParams = {
  productId: string;
  userId: string;
  email: string;
  packId: string;
};

// Створює сторінку оплати в Creem і повертає її адресу
export async function createCheckout({ productId, userId, email, packId }: CheckoutParams) {
  const data = await creemRequest("/v1/checkouts", {
    product_id: productId,
    request_id: `${userId}:${packId}:${Date.now()}`,
    customer: { email },
    success_url: `${env.APP_URL}/?checkout=success`,
    metadata: { user_id: userId, pack_id: packId },
  });

  if (typeof data?.checkout_url !== "string") {
    throw new Error(`Creem checkout without url: ${JSON.stringify(data)}`);
  }
  return data.checkout_url as string;
}

// Підпис вебхука: HMAC-SHA256 від сирого тіла запиту з секретом вебхука, у hex,
// приходить у заголовку creem-signature. Порівнюємо за сталий час (timingSafeEqual),
// щоб не можна було підібрати підпис за часом відповіді.
export function verifyWebhook(rawBody: Buffer, signature: string | undefined): CreemEvent {
  if (!signature) throw new Error("Missing creem-signature");

  const expected = crypto.createHmac("sha256", env.CREEM_WEBHOOK_SECRET ?? "").update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(signature, "utf-8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Invalid creem-signature");
  }

  return JSON.parse(rawBody.toString("utf-8")) as CreemEvent;
}

export type CreemEvent = {
  id: string;
  eventType: string;
  object: {
    id: string;
    request_id?: string;
    order?: { id: string; product?: string; amount?: number; currency?: string };
    product?: { id: string; name?: string };
    customer?: { id: string; email?: string };
    metadata?: Record<string, unknown>;
  };
};

export class ModerationError extends Error {
  decision: string;

  constructor(decision: string) {
    super(`Prompt rejected by moderation (${decision})`);
    this.decision = decision;
  }
}

// Creem вимагає: жоден промпт не йде в модель генерації зображень без рішення Moderation API.
// "allow" — можна генерувати; "flag" і "deny" — блокуємо.
// Якщо API недоступне — кидаємо помилку (fail closed): краще повернути кредит, ніж згенерувати без перевірки.
export async function moderatePrompt(prompt: string): Promise<void> {
  if (!env.CREEM_API_KEY) return; // локальна розробка без Creem — модерації немає

  const data = await creemRequest("/v1/moderation/prompt", { prompt });
  const decision = String(data?.decision ?? "unknown");
  if (decision !== "allow") throw new ModerationError(decision);
}
