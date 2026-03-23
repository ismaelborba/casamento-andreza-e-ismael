import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { buyers, gifts, orderItems, orders } from "@/src/db/schema";
import { db } from "@/src/db";

const itemSchema = z.object({
  giftId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(30),
  buyerName: z.string().min(2).max(80),
  buyerEmail: z.string().email().max(120),
  buyerMessage: z.string().max(280).optional().nullable(),
});

export async function POST(req: Request) {
  const rawBody = await req.json().catch(() => null);
  const payload =
    rawBody && typeof rawBody === "object" && "giftId" in rawBody && "quantity" in rawBody
      ? {
          items: [{ giftId: rawBody.giftId, quantity: rawBody.quantity }],
          buyerName: rawBody.buyerName,
          buyerEmail: rawBody.buyerEmail,
          buyerMessage: rawBody.buyerMessage,
        }
      : rawBody;

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, buyerEmail, buyerName, buyerMessage } = parsed.data;

  const mergedItems = Array.from(
    items.reduce((map, item) => {
      const current = map.get(item.giftId) ?? 0;
      map.set(item.giftId, current + item.quantity);
      return map;
    }, new Map<string, number>()),
  ).map(([giftId, quantity]) => ({ giftId, quantity }));

  const result = await db.transaction(async (tx) => {
    const existingBuyer = await tx.select().from(buyers).where(eq(buyers.email, buyerEmail)).limit(1);
    const buyer =
      existingBuyer[0] ??
      (await tx.insert(buyers).values({ email: buyerEmail, name: buyerName }).returning())[0];

    const resolvedItems: Array<{
      giftId: string;
      priceCents: number;
      quantity: number;
    }> = [];

    for (const item of mergedItems) {
      const giftRow = await tx.select().from(gifts).where(eq(gifts.id, item.giftId)).limit(1);
      const gift = giftRow[0];

      if (!gift || !gift.active) {
        throw new Error("Um dos presentes selecionados não está mais disponível.");
      }

      const available = gift.totalQuantity - gift.purchasedQuantity - gift.reservedQuantity;
      if (available < item.quantity) {
        throw new Error(`Quantidade indisponivel para o presente ${gift.name}.`);
      }

      resolvedItems.push({
        giftId: gift.id,
        priceCents: gift.priceCents,
        quantity: item.quantity,
      });
    }

    for (const item of resolvedItems) {
      await tx
        .update(gifts)
        .set({ reservedQuantity: sql`${gifts.reservedQuantity} + ${item.quantity}` })
        .where(eq(gifts.id, item.giftId));
    }

    const subtotal = resolvedItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );

    const order = (
      await tx
        .insert(orders)
        .values({
          buyerId: buyer.id,
          buyerMessage: buyerMessage ?? null,
          totalAmountCents: subtotal,
          status: "pending",
        })
        .returning()
    )[0];

    await tx.insert(orderItems).values(
      resolvedItems.map((item) => ({
        orderId: order.id,
        giftId: item.giftId,
        quantity: item.quantity,
        unitPriceCents: item.priceCents,
      })),
    );

    return { orderId: order.id };
  });

  return NextResponse.json(result);
}
