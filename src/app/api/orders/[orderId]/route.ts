import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { buyers, orderItems, orders, payments, gifts } from "@/src/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { orderId } = await params;
  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  const order = orderRows[0];
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const payment = (await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1))[0];
  const buyer = (await db.select().from(buyers).where(eq(buyers.id, order.buyerId)).limit(1))[0];

  const items = await db
    .select({
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      giftName: gifts.name,
    })
    .from(orderItems)
    .innerJoin(gifts, eq(orderItems.giftId, gifts.id))
    .where(eq(orderItems.orderId, order.id));

  const itemsSubtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  const totalChargeCents = payment?.amountCents ?? order.totalAmountCents;
  const feeAmountCents = payment?.feeAmountCents ?? 0;

  return NextResponse.json({
    order,
    payment,
    buyer,
    items,
    summary: {
      itemsSubtotalCents,
      feeAmountCents,
      totalChargeCents,
      installmentCount: payment?.installmentCount ?? 1,
    },
  });
}
