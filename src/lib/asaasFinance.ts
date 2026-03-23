import { getAsaasRuntimeConfig } from "@/src/lib/asaas-config";

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
  billingType?: "PIX" | "CREDIT_CARD" | "BOLETO";
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
  return res.json() as Promise<any>;
}

export async function listPayments(params: {
  status?: "RECEIVED" | "PENDING" | "OVERDUE" | "CONFIRMED" | "REFUNDED" | "CANCELED";
  billingType?: "PIX" | "CREDIT_CARD" | "BOLETO";
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
  return res.json() as Promise<{ data: any[]; totalCount?: number }>;
}
