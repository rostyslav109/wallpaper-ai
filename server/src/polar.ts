import { Webhook } from "standardwebhooks";
import { env } from "./config";

const API_URL = env.POLAR_SERVER === "production" ? "https://api.polar.sh" : "https://sandbox-api.polar.sh";

export const isPolarConfigured = Boolean(env.POLAR_ACCESS_TOKEN && env.POLAR_WEBHOOK_SECRET);

type CheckoutParams = {
  productId: string;
  userId: string;
  email: string;
  packId: string;
};

// Створює сторінку оплати в Polar і повертає її адресу
export async function createCheckout({ productId, userId, email, packId }: CheckoutParams) {
  const res = await fetch(`${API_URL}/v1/checkouts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: [productId],
      customer_email: email,
      external_customer_id: userId,
      success_url: `${env.APP_URL}/?checkout=success`,
      metadata: { user_id: userId, pack_id: packId },
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || typeof body?.url !== "string") {
    throw new Error(`Polar checkout error ${res.status}: ${JSON.stringify(body)}`);
  }

  return body.url as string;
}

// Перевіряє підпис вебхука (стандарт Standard Webhooks) і повертає розібрану подію.
// Якщо підпис неправильний — кидає помилку.
export function verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>) {
  // Polar очікує, що секрет буде закодований у base64 перед перевіркою
  const secret = Buffer.from(env.POLAR_WEBHOOK_SECRET ?? "", "utf-8").toString("base64");
  const webhook = new Webhook(secret);

  const flatHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") flatHeaders[key] = value;
  }

  return webhook.verify(rawBody.toString("utf-8"), flatHeaders) as PolarEvent;
}

export type PolarEvent = {
  type: string;
  data: {
    id: string;
    product_id?: string;
    total_amount?: number;
    currency?: string;
    metadata?: Record<string, unknown>;
    customer?: { external_id?: string | null };
  };
};
