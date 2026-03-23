import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { buyers, gifts, orders, payments, rsvps } from "@/src/db/schema";
import { getAsaasSettingsStatus } from "@/src/lib/asaas-config";
import { parseAsaasError, type AsaasRenderedError } from "@/src/lib/asaas-errors";
import { getAsaasBalance, getPaymentStatistics, listPayments } from "@/src/lib/asaasFinance";

function normalizeFinanceStats(payload: unknown) {
  const source = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const quantity =
    typeof source.quantity === "number"
      ? source.quantity
      : Number(source.quantity ?? 0) || 0;
  const value =
    typeof source.value === "number" ? source.value : Number(source.value ?? 0) || 0;
  const netValue =
    typeof source.netValue === "number"
      ? source.netValue
      : Number(source.netValue ?? 0) || 0;

  return {
    quantity,
    value,
    netValue,
    averageValue: quantity > 0 ? value / quantity : 0,
  };
}

function normalizePaymentStatus(status?: string | null) {
  if (status === "RECEIVED") return "Recebido";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "PENDING") return "Pendente";
  if (status === "OVERDUE") return "Vencido";
  if (status === "REFUNDED") return "Estornado";
  if (status === "CANCELED") return "Cancelado";
  return status ?? "-";
}

export async function getPublicGifts() {
  return db.select().from(gifts).where(eq(gifts.active, true)).orderBy(desc(gifts.createdAt));
}

export async function getAdminGifts() {
  return db.select().from(gifts).orderBy(desc(gifts.createdAt));
}

export async function getAdminOverview() {
  const [orderAgg] = await db
    .select({
      totalOrders: sql<number>`count(*)`.mapWith(Number),
      paidOrders: sql<number>`sum(case when ${orders.status} = 'paid' then 1 else 0 end)`.mapWith(Number),
      pendingOrders: sql<number>`sum(case when ${orders.status} = 'pending' then 1 else 0 end)`.mapWith(Number),
      totalPaidCents: sql<number>`coalesce(sum(case when ${orders.status} = 'paid' then ${orders.totalAmountCents} else 0 end), 0)`.mapWith(Number),
    })
    .from(orders);

  const [rsvpAgg] = await db
    .select({
      totalRsvps: sql<number>`count(*)`.mapWith(Number),
      yesRsvps: sql<number>`sum(case when ${rsvps.attending} = true then 1 else 0 end)`.mapWith(Number),
      noRsvps: sql<number>`sum(case when ${rsvps.attending} = false then 1 else 0 end)`.mapWith(Number),
      totalGuestsYes: sql<number>`coalesce(sum(case when ${rsvps.attending} = true then ${rsvps.guestsCount} else 0 end), 0)`.mapWith(Number),
    })
    .from(rsvps);

  const giftRows = await getAdminGifts();
  const topGifts = [...giftRows]
    .sort((left, right) => {
      const leftScore = left.purchasedQuantity + left.reservedQuantity;
      const rightScore = right.purchasedQuantity + right.reservedQuantity;
      return rightScore - leftScore;
    })
    .slice(0, 6);

  const config = await getAsaasSettingsStatus();
  let asaasBalance: Awaited<ReturnType<typeof getAsaasBalance>> | null = null;
  let asaasError: string | null = null;

  if (config.ready) {
    try {
      asaasBalance = await getAsaasBalance();
    } catch (cause) {
      asaasError = parseAsaasError(cause, "Não foi possível consultar o Asaas.").description;
    }
  } else {
    asaasError = "Configure as credenciais do Asaas em Configurações para liberar o financeiro.";
  }

  return {
    orders: orderAgg,
    rsvps: rsvpAgg,
    gifts: giftRows,
    topGifts,
    asaas: {
      balance: asaasBalance,
      error: asaasError,
      config,
    },
  };
}

export async function getAdminOrders() {
  return db
    .select({
      orderId: orders.id,
      status: orders.status,
      totalCents: orders.totalAmountCents,
      chargedTotalCents: payments.amountCents,
      feeAmountCents: payments.feeAmountCents,
      createdAt: orders.createdAt,
      buyerName: buyers.name,
      buyerEmail: buyers.email,
      buyerMessage: orders.buyerMessage,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      installmentCount: payments.installmentCount,
      invoiceUrl: payments.invoiceUrl,
      asaasPaymentId: payments.asaasPaymentId,
    })
    .from(orders)
    .innerJoin(buyers, eq(orders.buyerId, buyers.id))
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

export async function getAdminRsvps() {
  return db.select().from(rsvps).orderBy(desc(rsvps.createdAt)).limit(300);
}

export async function getAdminFinance() {
  const config = await getAsaasSettingsStatus();
  const result: {
    config: Awaited<ReturnType<typeof getAsaasSettingsStatus>>;
    balance: Awaited<ReturnType<typeof getAsaasBalance>> | null;
    received: ReturnType<typeof normalizeFinanceStats> | null;
    pending: ReturnType<typeof normalizeFinanceStats> | null;
    lastPayments: Array<{
      id: string;
      status: string;
      statusLabel: string;
      value: number;
      dateLabel: string;
      externalReference: string;
      payerName: string;
    }>;
    errors: AsaasRenderedError[];
  } = {
    config,
    balance: null,
    received: null,
    pending: null,
    lastPayments: [],
    errors: [],
  };

  if (!config.ready) {
    return result;
  }

  try {
    result.balance = await getAsaasBalance();
  } catch (cause) {
    result.errors.push(parseAsaasError(cause, "Erro ao consultar saldo."));
  }

  try {
    result.received = normalizeFinanceStats(
      await getPaymentStatistics({ status: "RECEIVED", billingType: "PIX" }),
    );
  } catch (cause) {
    result.errors.push(parseAsaasError(cause, "Erro ao consultar recebidos."));
  }

  try {
    result.pending = normalizeFinanceStats(
      await getPaymentStatistics({ status: "PENDING", billingType: "PIX" }),
    );
  } catch (cause) {
    result.errors.push(parseAsaasError(cause, "Erro ao consultar pendentes."));
  }

  try {
    const paymentResponse = await listPayments({
      status: "RECEIVED",
      billingType: "PIX",
      limit: 10,
    });
    result.lastPayments = (paymentResponse.data ?? []).map((payment: any) => ({
      id: String(payment.id ?? "-"),
      status: String(payment.status ?? "-"),
      statusLabel: normalizePaymentStatus(payment.status),
      value: Number(payment.value ?? 0) || 0,
      dateLabel: String(payment.dateCreated ?? payment.paymentDate ?? "-"),
      externalReference: String(payment.externalReference ?? "-"),
      payerName: String(payment.customer ?? payment.name ?? "Pagamento Asaas"),
    }));
  } catch (cause) {
    result.errors.push(parseAsaasError(cause, "Erro ao listar pagamentos."));
  }

  result.errors = result.errors.filter(
    (error, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.code === error.code && candidate.description === error.description,
      ) === index,
  );

  return result;
}
