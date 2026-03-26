import { getAsaasRuntimeConfig } from "@/src/lib/asaas-config";

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO";
export type AsaasPaymentStatus =
  | "RECEIVED"
  | "PENDING"
  | "OVERDUE"
  | "CONFIRMED"
  | "REFUNDED"
  | "CANCELED";

export type AsaasPaymentStatistics = {
  quantity?: number;
  value?: number;
  netValue?: number;
};

export type AsaasPaymentRecord = {
  id?: string;
  customer?: string;
  billingType?: AsaasBillingType;
  status?: AsaasPaymentStatus;
  value?: number;
  netValue?: number;
  originalValue?: number;
  dueDate?: string;
  originalDueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  dateCreated?: string;
  externalReference?: string;
  description?: string;
  installmentNumber?: number;
  invoiceNumber?: string;
};

export type AsaasPaymentListResponse = {
  data: AsaasPaymentRecord[];
  totalCount?: number;
};

async function requestConfig() {
  const config = await getAsaasRuntimeConfig();

  return {
    baseUrl:
      config.environment === "production"
        ? "https://api.asaas.com/v3"
        : "https://api-sandbox.asaas.com/v3",
    headers: {
      "Content-Type": "application/json",
      access_token: config.apiKey,
    } as Record<string, string>,
  };
}

export async function getAsaasBalance() {
  const config = await requestConfig();
  const res = await fetch(`${config.baseUrl}/finance/balance`, {
    method: "GET",
    headers: config.headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    balance?: number;
    availableBalance?: number;
    blockedBalance?: number;
  }>;
}

export async function getPaymentStatistics(params: {
  status: "RECEIVED" | "PENDING" | "OVERDUE" | "REFUNDED";
  billingType?: AsaasBillingType;
  externalReference?: string;
  dateCreatedGe?: string; // yyyy-mm-dd
  dateCreatedLe?: string; // yyyy-mm-dd
}) {
  const config = await requestConfig();
  const qs = new URLSearchParams();
  qs.set("status", params.status);
  if (params.billingType) qs.set("billingType", params.billingType);
  if (params.externalReference) qs.set("externalReference", params.externalReference);
  if (params.dateCreatedGe) qs.set("dateCreated[ge]", params.dateCreatedGe);
  if (params.dateCreatedLe) qs.set("dateCreated[le]", params.dateCreatedLe);

  const res = await fetch(`${config.baseUrl}/finance/payment/statistics?${qs.toString()}`, {
    method: "GET",
    headers: config.headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<AsaasPaymentStatistics>;
}

export async function listPayments(params: {
  status?: AsaasPaymentStatus;
  billingType?: AsaasBillingType;
  externalReference?: string;
  limit?: number;
  offset?: number;
}) {
  const config = await requestConfig();
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.billingType) qs.set("billingType", params.billingType);
  if (params.externalReference) qs.set("externalReference", params.externalReference);
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.offset) qs.set("offset", String(params.offset));

  const res = await fetch(`${config.baseUrl}/payments?${qs.toString()}`, {
    method: "GET",
    headers: config.headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<AsaasPaymentListResponse>;
}
