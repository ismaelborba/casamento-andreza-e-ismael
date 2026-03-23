import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/src/db";
import { buyers, gifts, orderItems, orders, payments } from "@/src/db/schema";
import {
  createCreditCardPayment,
  createCustomer,
  createPixPayment,
  deletePayment,
  getPixQrCode,
  updateCustomer,
} from "@/src/lib/asaas";
import { parseAsaasError } from "@/src/lib/asaas-errors";
import { calculateCreditCardCharge } from "@/src/lib/payment-pricing";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const pixSchema = z.object({
  method: z.literal("pix"),
  cpfCnpj: z.string().min(11).max(18),
  phone: z.string().min(10).max(16).optional().nullable(),
});

const creditCardSchema = z.object({
  method: z.literal("credit_card"),
  installmentCount: z.number().int().min(1).max(12),
  card: z.object({
    holderName: z.string().min(3).max(120),
    number: z.string().min(13).max(19),
    expiryMonth: z.string().regex(/^\d{2}$/),
    expiryYear: z.string().regex(/^\d{2,4}$/),
    ccv: z.string().min(3).max(4),
  }),
  holder: z.object({
    cpfCnpj: z.string().min(11).max(18),
    postalCode: z.string().min(8).max(10),
    addressNumber: z.string().min(1).max(20),
    addressComplement: z.string().max(80).optional().nullable(),
    phone: z.string().min(10).max(16),
  }),
});

const schema = z.discriminatedUnion("method", [pixSchema, creditCardSchema]);

function todayISO() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }

  return req.headers.get("x-real-ip") ?? "127.0.0.1";
}

function paymentDescription(items: Array<{ name: string; quantity: number }>) {
  return items.length === 1
    ? `Presente: ${items[0].name} (x${items[0].quantity})`
    : `Lista de presentes (${items.length} itens)`;
}

async function ensureAsaasCustomer(input: {
  currentCustomerId: string | null;
  buyer: { id: string; name: string; email: string };
  cpfCnpj?: string | null;
  phone?: string | null;
}) {
  const payload = {
    name: input.buyer.name,
    email: input.buyer.email,
    cpfCnpj: input.cpfCnpj ? onlyDigits(input.cpfCnpj) : undefined,
  };

  if (input.currentCustomerId) {
    await updateCustomer(input.currentCustomerId, payload);
    return input.currentCustomerId;
  }

  const customer = await createCustomer(payload);
  await db
    .update(buyers)
    .set({ asaasCustomerId: customer.id })
    .where(eq(buyers.id, input.buyer.id));

  return customer.id;
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { orderId } = await params;
    const parsed = schema.safeParse(await req.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const buyer = (await db.select().from(buyers).where(eq(buyers.id, order.buyerId)).limit(1))[0];
    if (!buyer) {
      return NextResponse.json({ error: "Comprador não encontrado." }, { status: 404 });
    }

    const items = await db
      .select({
        id: orderItems.id,
        giftId: orderItems.giftId,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
        name: gifts.name,
      })
      .from(orderItems)
      .innerJoin(gifts, eq(orderItems.giftId, gifts.id))
      .where(eq(orderItems.orderId, order.id));

    if (!items.length) {
      return NextResponse.json({ error: "Pedido sem itens." }, { status: 400 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 409 });
    }

    const existingPayment = (
      await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1)
    )[0];

    if (existingPayment?.status === "paid") {
      return NextResponse.json(
        { error: "Este pedido já possui um pagamento confirmado." },
        { status: 409 },
      );
    }

    if (existingPayment?.asaasPaymentId) {
      try {
        await deletePayment(existingPayment.asaasPaymentId);
      } catch {
        // best effort only
      }
    }

    const subtotalCents = items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0,
    );

    const description = paymentDescription(
      items.map((item) => ({ name: item.name, quantity: item.quantity })),
    );

    if (parsed.data.method === "pix") {
      const asaasCustomerId = await ensureAsaasCustomer({
        currentCustomerId: buyer.asaasCustomerId ?? null,
        buyer,
        cpfCnpj: parsed.data.cpfCnpj,
        phone: parsed.data.phone ?? null,
      });

      const payment = await createPixPayment({
        customerId: asaasCustomerId,
        value: subtotalCents / 100,
        description,
        externalReference: `order_${order.id}`,
        dueDate: todayISO(),
      });

      const qr = await getPixQrCode(payment.id);

      const paymentValues = {
        orderId: order.id,
        asaasPaymentId: payment.id,
        method: "pix" as const,
        status: "pending" as const,
        amountCents: subtotalCents,
        feeAmountCents: 0,
        installmentCount: 1,
        installmentId: null,
        cardBrand: null,
        cardLast4: null,
        invoiceUrl: payment.invoiceUrl ?? null,
        pixQrCode: qr.encodedImage ?? null,
        pixPayload: qr.payload ?? null,
      };

      if (existingPayment) {
        await db.update(payments).set(paymentValues).where(eq(payments.id, existingPayment.id));
      } else {
        await db.insert(payments).values(paymentValues);
      }

      return NextResponse.json({
        method: "pix",
        status: "pending",
        payment: paymentValues,
      });
    }

    const asaasCustomerId = await ensureAsaasCustomer({
      currentCustomerId: buyer.asaasCustomerId ?? null,
      buyer,
      cpfCnpj: parsed.data.holder.cpfCnpj,
      phone: parsed.data.holder.phone,
    });

    const pricing = calculateCreditCardCharge(subtotalCents, parsed.data.installmentCount);
    const expiryYear =
      parsed.data.card.expiryYear.length === 2
        ? `20${parsed.data.card.expiryYear}`
        : parsed.data.card.expiryYear;

    const cardPayment = await createCreditCardPayment({
      customerId: asaasCustomerId,
      value: pricing.totalAmountCents / 100,
      installmentCount: pricing.installmentCount,
      installmentValue: pricing.installmentAmountCents / 100,
      description,
      externalReference: `order_${order.id}`,
      dueDate: todayISO(),
      remoteIp: clientIp(req),
      creditCard: {
        holderName: parsed.data.card.holderName,
        number: onlyDigits(parsed.data.card.number),
        expiryMonth: parsed.data.card.expiryMonth,
        expiryYear,
        ccv: onlyDigits(parsed.data.card.ccv),
      },
      creditCardHolderInfo: {
        name: parsed.data.card.holderName,
        email: buyer.email,
        cpfCnpj: onlyDigits(parsed.data.holder.cpfCnpj),
        postalCode: onlyDigits(parsed.data.holder.postalCode),
        addressNumber: parsed.data.holder.addressNumber.trim(),
        addressComplement: parsed.data.holder.addressComplement?.trim() || undefined,
        phone: onlyDigits(parsed.data.holder.phone),
        mobilePhone: onlyDigits(parsed.data.holder.phone),
      },
    });

    const paymentValues = {
      orderId: order.id,
      asaasPaymentId: cardPayment.id,
      method: "credit_card" as const,
      status: "paid" as const,
      amountCents: pricing.totalAmountCents,
      feeAmountCents: pricing.feeAmountCents,
      installmentCount: pricing.installmentCount,
      installmentId: cardPayment.installment ?? null,
      cardBrand: cardPayment.creditCard?.creditCardBrand ?? null,
      cardLast4:
        cardPayment.creditCard?.creditCardNumber?.slice(-4) ??
        onlyDigits(parsed.data.card.number).slice(-4),
      invoiceUrl: cardPayment.invoiceUrl ?? null,
      pixQrCode: null,
      pixPayload: null,
    };

    await db.transaction(async (tx) => {
      if (existingPayment) {
        await tx.update(payments).set(paymentValues).where(eq(payments.id, existingPayment.id));
      } else {
        await tx.insert(payments).values(paymentValues);
      }

      for (const item of items) {
        await tx
          .update(gifts)
          .set({
            reservedQuantity: sql`${gifts.reservedQuantity} - ${item.quantity}`,
            purchasedQuantity: sql`${gifts.purchasedQuantity} + ${item.quantity}`,
          })
          .where(eq(gifts.id, item.giftId));
      }

      await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
    });

    return NextResponse.json({
      method: "credit_card",
      status: "paid",
      payment: paymentValues,
    });
  } catch (cause) {
    const message =
      cause instanceof Error
        ? parseAsaasError(cause.message).description
        : "Não foi possível criar a cobrança.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
