import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/requireAuth";
import { findPackByProductId, packs } from "../packs";
import { createCheckout, isCreemConfigured, verifyWebhook } from "../creem";

export const billingRouter = Router();

// Список пакетів для сторінки цін (id продуктів Creem назовні не віддаємо)
billingRouter.get("/packs", (req, res) => {
  res.json(
    packs.map((pack) => ({
      id: pack.id,
      name: pack.name,
      credits: pack.credits,
      price: pack.price,
      highlight: pack.highlight,
      available: isCreemConfigured && Boolean(pack.productId),
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

  if (!isCreemConfigured || !pack.productId) {
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

// Вебхук від Creem. Підключається в index.ts ДО express.json(),
// бо підпис рахується від сирого тіла запиту (req.body — Buffer).
// Creem повторює доставку до 5 разів, поки не отримає 200, тому обробка ідемпотентна.
export async function creemWebhookHandler(req: Request, res: Response) {
  let event;
  try {
    event = verifyWebhook(req.body as Buffer, req.header("creem-signature"));
  } catch {
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  if (event.eventType === "refund.created") {
    // Повернення коштів робиш вручну в панелі Creem; тут лише лог, щоб помітити й забрати кредити
    console.warn("[creem] refund created", event.object.id);
    res.status(200).end();
    return;
  }

  // Кредити нараховуємо лише за завершену оплату; на решту подій відповідаємо «прийнято»
  if (event.eventType !== "checkout.completed") {
    res.status(200).end();
    return;
  }

  const checkout = event.object;
  const orderId = checkout.order?.id ?? checkout.id;
  const productId = checkout.product?.id ?? checkout.order?.product;
  const pack = productId ? findPackByProductId(productId) : undefined;
  const userId = checkout.metadata?.user_id;

  if (!pack || typeof userId !== "string") {
    console.error("[creem] cannot match checkout", checkout.id, productId, userId);
    res.status(200).end(); // 200, щоб Creem не повторював запит, який ми все одно не обробимо
    return;
  }

  try {
    // Одна транзакція: або записали платіж І додали кредити, або нічого
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          userId,
          provider: "creem",
          providerOrderId: orderId,
          packId: pack.id,
          credits: pack.credits,
          amount: checkout.order?.amount ?? 0,
          currency: (checkout.order?.currency ?? "eur").toLowerCase(),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: pack.credits } },
      }),
    ]);
    console.log(`[creem] +${pack.credits} credits for user ${userId} (order ${orderId})`);
  } catch (error) {
    // P2002 = порушення унікальності providerOrderId: це замовлення вже оброблене (повторна доставка)
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(200).end();
      return;
    }
    throw error;
  }

  res.status(200).end();
}
