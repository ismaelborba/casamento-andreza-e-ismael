import "server-only";

import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/src/db";
import { buyers, gifts, orders, payments, rsvps } from "@/src/db/schema";
import { getAsaasSettingsStatus } from "@/src/lib/asaas-config";
import { parseAsaasError, type AsaasRenderedError } from "@/src/lib/asaas-errors";
import {
  getAsaasBalance,
  getPaymentStatistics,
  listPayments,
  type AsaasPaymentRecord,
} from "@/src/lib/asaasFinance";

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
  const normalizedMethod = (method ?? "").toLowerCase();

  if (normalizedMethod === "credit_card") {
    return installmentCount && installmentCount > 1 ? `Cartão ${installmentCount}x` : "Cartão";
  }

  if (normalizedMethod === "pix") {
    return "Pix";
  }

  if (normalizedMethod === "boleto") {
    return "Boleto";
  }

  return method ?? "-";
}

function parseAsaasDate(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.includes(" ") ? trimmed.replace(" ", "T") : trimmed;
  const parsed = new Date(normalized);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const fallback = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function resolveAsaasPaymentValue(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

function estimateCardReleaseDate(payment: AsaasPaymentRecord) {
  const baseDate =
    parseAsaasDate(payment.clientPaymentDate) ??
    parseAsaasDate(payment.paymentDate) ??
    parseAsaasDate(payment.dueDate) ??
    parseAsaasDate(payment.originalDueDate) ??
    parseAsaasDate(payment.dateCreated);

  return baseDate ? addDays(baseDate, 32) : null;
}

function extractOrderIdFromExternalReference(value?: string | null) {
  if (!value?.startsWith("order_")) {
    return null;
  }

  return value.slice("order_".length) || null;
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
    const paymentsResponse = await listPayments({ limit: 20 });
    const asaasPayments = paymentsResponse.data ?? [];

    const orderIds = Array.from(
      new Set(
        asaasPayments
          .map((payment) => extractOrderIdFromExternalReference(payment.externalReference))
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const relatedOrders =
      orderIds.length > 0
        ? await db
            .select({
              orderId: orders.id,
              buyerName: buyers.name,
            })
            .from(orders)
            .innerJoin(buyers, eq(orders.buyerId, buyers.id))
            .where(inArray(orders.id, orderIds))
        : [];

    const buyerNameByOrderId = new Map(
      relatedOrders.map((row) => [row.orderId, row.buyerName]),
    );

    const cardRows = asaasPayments
      .filter(
        (payment) =>
          payment.billingType === "CREDIT_CARD" &&
          payment.status !== "CANCELED" &&
          payment.status !== "REFUNDED",
      )
      .map((payment) => {
        const grossValue = resolveAsaasPaymentValue(payment.value);
        const netValue = Math.max(0, resolveAsaasPaymentValue(payment.netValue) || grossValue);
        const feeValue = Math.max(0, grossValue - netValue);
        const releaseDate = estimateCardReleaseDate(payment);

        return {
          grossValue,
          feeValue,
          netValue,
          releaseDate,
        };
      });

    const nextReleaseDate =
      cardRows
        .filter(
          (row): row is typeof row & { releaseDate: Date } =>
            row.releaseDate instanceof Date && row.releaseDate > now,
        )
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
        .filter(
          (row): row is typeof row & { releaseDate: Date } =>
            row.releaseDate instanceof Date && row.releaseDate > now,
        )
        .reduce((sum, row) => sum + row.netValue, 0),
      releasedEstimatedValue: cardRows
        .filter(
          (row): row is typeof row & { releaseDate: Date } =>
            row.releaseDate instanceof Date && row.releaseDate <= now,
        )
        .reduce((sum, row) => sum + row.netValue, 0),
      nextReleaseDateLabel: nextReleaseDate ? formatDateLabel(nextReleaseDate) : null,
    };

    result.lastPayments = [...asaasPayments]
      .sort((left, right) => {
        const leftDate =
          parseAsaasDate(left.dateCreated)?.getTime() ??
          parseAsaasDate(left.dueDate)?.getTime() ??
          0;
        const rightDate =
          parseAsaasDate(right.dateCreated)?.getTime() ??
          parseAsaasDate(right.dueDate)?.getTime() ??
          0;

        return rightDate - leftDate;
      })
      .slice(0, 12)
      .map((payment) => {
        const grossValue = resolveAsaasPaymentValue(payment.value);
        const netValue = Math.max(0, resolveAsaasPaymentValue(payment.netValue) || grossValue);
        const feeValue = Math.max(0, grossValue - netValue);
        const releaseDate =
          payment.billingType === "CREDIT_CARD" ? estimateCardReleaseDate(payment) : null;
        const orderId = extractOrderIdFromExternalReference(payment.externalReference);
        const payerName =
          (orderId ? buyerNameByOrderId.get(orderId) : null) ??
          payment.description ??
          "Pagamento Asaas";

        return {
          id: String(payment.id ?? "-"),
          method: String(payment.billingType ?? "-"),
          methodLabel:
            payment.billingType === "CREDIT_CARD"
              ? "Cartão"
              : formatPaymentMethodLabel(String(payment.billingType ?? "-")),
          status: String(payment.status ?? "-"),
          statusLabel: normalizePaymentStatus(payment.status),
          value: grossValue,
          netValue,
          feeValue,
          dateLabel:
            formatDateLabel(
              parseAsaasDate(payment.paymentDate) ??
                parseAsaasDate(payment.clientPaymentDate) ??
                parseAsaasDate(payment.dueDate) ??
                parseAsaasDate(payment.dateCreated),
            ),
          releaseDateLabel:
            payment.billingType === "CREDIT_CARD"
              ? formatDateLabel(releaseDate)
              : "Imediata",
          externalReference: String(payment.externalReference ?? "-"),
          payerName,
          detailsLabel:
            payment.description ??
            String(payment.id ?? "-"),
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
