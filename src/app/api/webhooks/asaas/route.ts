import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { gifts, orderItems, orders, payments } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import { getAsaasWebhookToken } from "@/src/lib/asaas-config";

async function assertToken(req: Request) {
  const expected = await getAsaasWebhookToken();
  if (!expected) return; // dev
  const got = req.headers.get("asaas-access-token");
  if (got !== expected) throw new Error("Invalid webhook token.");
}

type EventPayload = { event: string; payment?: { id: string } };

function mapStatus(event: string) {
  if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") return "paid" as const;
  if (event === "PAYMENT_OVERDUE") return "expired" as const;
  if (event === "PAYMENT_DELETED") return "canceled" as const;
  if (event === "PAYMENT_REFUNDED" || event === "PAYMENT_PARTIALLY_REFUNDED") return "refunded" as const;
  if (event === "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED") return "failed" as const;
  return null;
}

export async function POST(req: Request) {
  try {
    await assertToken(req);
    const body = (await req.json()) as EventPayload;
    const asaasPaymentId = body?.payment?.id;
    if (!asaasPaymentId) return NextResponse.json({ ok: true });

    const finalStatus = mapStatus(body.event);
    if (!finalStatus) return NextResponse.json({ ok: true });

    await db.transaction(async (tx) => {
      const pay = (await tx.select().from(payments).where(eq(payments.asaasPaymentId, asaasPaymentId)).limit(1))[0];
      if (!pay) return;
      if (pay.status === finalStatus) return; // idempotente

      const order = (await tx.select().from(orders).where(eq(orders.id, pay.orderId)).limit(1))[0];
      if (!order) return;

      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));

      if (finalStatus === "paid" && order.status !== "paid") {
        for (const item of items) {
          await tx
            .update(gifts)
            .set({
              reservedQuantity: sql`${gifts.reservedQuantity} - ${item.quantity}`,
              purchasedQuantity: sql`${gifts.purchasedQuantity} + ${item.quantity}`,
            })
            .where(eq(gifts.id, item.giftId));
        }
      } else {
        // libera reserva se ainda estava pending
        if (order.status === "pending") {
          for (const item of items) {
            await tx
              .update(gifts)
              .set({ reservedQuantity: sql`${gifts.reservedQuantity} - ${item.quantity}` })
              .where(eq(gifts.id, item.giftId));
          }
        }
      }

      await tx.update(payments).set({ status: finalStatus }).where(eq(payments.id, pay.id));
      await tx.update(orders).set({ status: finalStatus }).where(eq(orders.id, order.id));
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Webhook error" }, { status: 401 });
  }
}
