import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { findPackByProductId, packs } from "../packs";
import { createCheckout, isPolarConfigured, verifyWebhook } from "../polar";

export const billingRouter = Router();

// Список пакетів для сторінки цін (id продуктів Polar назовні не віддаємо)
billingRouter.get("/packs", (req, res) => {
  res.json(
    packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      credits: pack.credits,
      price: pack.price,
      highlight: pack.highlight,
      available: isPolarConfigured && Boolean(pack.productId),
    }))
  );
});

const checkoutSchema = z.object({ packId: z.string().min(1) });

billingRouter.post("/checkout", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  const pack = parsed.success ? packs.find((p) => p.id === parsed.data.packId) : undefined;

  if (!pack) {
    res.status(400).json({ error: "Unknown pack" });
    return;
  }

  if (!isPolarConfigured || !pack.productId) {
    res.status(503).json({ error: "Payments are not available yet" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const url = await createCheckout({
    productId: pack.productId,
    userId: user.id,
    email: user.email,
    packId: pack.id,
  });

  res.json({ url });
});

// Вебхук від Polar. Підключається в index.ts ДО express.json(),
// бо для перевірки підпису потрібне сире тіло запиту (req.body — Buffer).
export async function polarWebhookHandler(req: Request, res: Response) {
  let event;
  try {
    event = verifyWebhook(req.body as Buffer, req.headers);
  } catch {
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  // Нас цікавить лише оплачене замовлення; на решту подій просто відповідаємо «прийнято»
  if (event.type !== "order.paid") {
    res.status(202).end();
    return;
  }

  const order = event.data;
  const pack = order.product_id ? findPackByProductId(order.product_id) : undefined;
  const userId = order.customer?.external_id ?? order.metadata?.user_id;

  if (!pack || typeof userId !== "string") {
    console.error("[polar] cannot match order", order.id, order.product_id, userId);
    res.status(202).end(); // 2xx, щоб Polar не повторював запит, який ми все одно не обробимо
    return;
  }

  try {
    // Одна транзакція: або записали платіж І додали кредити, або нічого
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          provider: "polar",
          providerOrderId: order.id,
          packId: pack.id,
          credits: pack.credits,
          amount: order.total_amount ?? 0,
          currency: order.currency ?? "eur",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: pack.credits } },
      }),
    ]);
    console.log(`[polar] +${pack.credits} credits for user ${userId} (order ${order.id})`);
  } catch (error) {
    // P2002 = порушення унікальності providerOrderId: це замовлення вже оброблене раніше
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(202).end();
      return;
    }
    throw error;
  }

  res.status(202).end();
}
