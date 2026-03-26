import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { buyers, gifts, orders, payments, rsvps } from "@/src/db/schema";
import { getAsaasSettingsStatus } from "@/src/lib/asaas-config";
import { parseAsaasError, type AsaasRenderedError } from "@/src/lib/asaas-errors";
import { getAsaasBalance, getPaymentStatistics } from "@/src/lib/asaasFinance";

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
  if (status === "paid") return "Pago";
  if (status === "pending") return "Pendente";
  if (status === "failed") return "Falhou";
  if (status === "canceled") return "Cancelado";
  if (status === "refunded") return "Estornado";
  if (status === "expired") return "Expirado";
  if (status === "RECEIVED") return "Recebido";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "PENDING") return "Pendente";
  if (status === "OVERDUE") return "Vencido";
  if (status === "REFUNDED") return "Estornado";
  if (status === "CANCELED") return "Cancelado";
  return status ?? "-";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDateLabel(date: Date | null | undefined) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPaymentMethodLabel(method?: string | null, installmentCount?: number | null) {
  if (method === "credit_card") {
    return installmentCount && installmentCount > 1 ? `Cartão ${installmentCount}x` : "Cartão";
  }

  if (method === "pix") {
    return "Pix";
  }

  if (method === "boleto") {
    return "Boleto";
  }

  return method ?? "-";
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
  const now = new Date();
  const result: {
    config: Awaited<ReturnType<typeof getAsaasSettingsStatus>>;
    balance: Awaited<ReturnType<typeof getAsaasBalance>> | null;
    received: ReturnType<typeof normalizeFinanceStats> | null;
    pending: ReturnType<typeof normalizeFinanceStats> | null;
    card: {
      quantity: number;
      grossValue: number;
      feeValue: number;
      netValue: number;
      averageNetValue: number;
      awaitingReleaseValue: number;
      releasedEstimatedValue: number;
      nextReleaseDateLabel: string | null;
    } | null;
    lastPayments: Array<{
      id: string;
      method: string;
      methodLabel: string;
      status: string;
      statusLabel: string;
      value: number;
      netValue: number;
      feeValue: number;
      dateLabel: string;
      releaseDateLabel: string;
      externalReference: string;
      payerName: string;
      detailsLabel: string;
    }>;
    errors: AsaasRenderedError[];
  } = {
    config,
    balance: null,
    received: null,
    pending: null,
    card: null,
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
    const paidCardPayments = await db
      .select({
        amountCents: payments.amountCents,
        feeAmountCents: payments.feeAmountCents,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(and(eq(payments.method, "credit_card"), eq(payments.status, "paid")))
      .orderBy(desc(payments.createdAt));

    const cardRows = paidCardPayments.map((payment) => {
      const grossValue = payment.amountCents / 100;
      const feeValue = payment.feeAmountCents / 100;
      const netValue = Math.max(0, grossValue - feeValue);
      const releaseDate = addDays(payment.createdAt, 32);

      return {
        grossValue,
        feeValue,
        netValue,
        releaseDate,
      };
    });

    const nextReleaseDate =
      cardRows
        .filter((row) => row.releaseDate > now)
        .sort((left, right) => left.releaseDate.getTime() - right.releaseDate.getTime())[0]
        ?.releaseDate ?? null;

    result.card = {
      quantity: cardRows.length,
      grossValue: cardRows.reduce((sum, row) => sum + row.grossValue, 0),
      feeValue: cardRows.reduce((sum, row) => sum + row.feeValue, 0),
      netValue: cardRows.reduce((sum, row) => sum + row.netValue, 0),
      averageNetValue:
        cardRows.length > 0
          ? cardRows.reduce((sum, row) => sum + row.netValue, 0) / cardRows.length
          : 0,
      awaitingReleaseValue: cardRows
        .filter((row) => row.releaseDate > now)
        .reduce((sum, row) => sum + row.netValue, 0),
      releasedEstimatedValue: cardRows
        .filter((row) => row.releaseDate <= now)
        .reduce((sum, row) => sum + row.netValue, 0),
      nextReleaseDateLabel: nextReleaseDate ? formatDateLabel(nextReleaseDate) : null,
    };

    const recentPayments = await db
      .select({
        id: payments.asaasPaymentId,
        method: payments.method,
        status: payments.status,
        amountCents: payments.amountCents,
        feeAmountCents: payments.feeAmountCents,
        installmentCount: payments.installmentCount,
        cardBrand: payments.cardBrand,
        cardLast4: payments.cardLast4,
        createdAt: payments.createdAt,
        orderId: orders.id,
        payerName: buyers.name,
      })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .innerJoin(buyers, eq(orders.buyerId, buyers.id))
      .orderBy(desc(payments.createdAt))
      .limit(12);

    result.lastPayments = recentPayments.map((payment) => {
      const grossValue = payment.amountCents / 100;
      const feeValue = payment.feeAmountCents / 100;
      const netValue = Math.max(0, grossValue - feeValue);
      const releaseDate =
        payment.method === "credit_card" ? addDays(payment.createdAt, 32) : null;

      return {
        id: payment.id,
        method: payment.method,
        methodLabel: formatPaymentMethodLabel(payment.method, payment.installmentCount),
        status: payment.status,
        statusLabel: normalizePaymentStatus(payment.status),
        value: grossValue,
        netValue,
        feeValue,
        dateLabel: formatDateLabel(payment.createdAt),
        releaseDateLabel:
          payment.method === "credit_card" ? formatDateLabel(releaseDate) : "Imediata",
        externalReference: `order_${payment.orderId}`,
        payerName: payment.payerName,
        detailsLabel:
          payment.method === "credit_card"
            ? `${payment.cardBrand ?? "Cartão"}${payment.cardLast4 ? ` final ${payment.cardLast4}` : ""}`
            : payment.id,
      };
    });
  } catch (cause) {
    result.errors.push(parseAsaasError(cause, "Erro ao consolidar pagamentos."));
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
