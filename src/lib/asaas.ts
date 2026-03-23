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

export async function createCustomer(input: {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
}) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/customers`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { id: string };
}

export async function updateCustomer(
  customerId: string,
  input: {
    name: string;
    email: string;
    cpfCnpj?: string;
    phone?: string;
    mobilePhone?: string;
  },
) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/customers/${customerId}`, {
    method: "PUT",
    headers: config.headers,
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { id: string };
}

export async function createPixPayment(input: {
  customerId: string;
  value: number; // decimal
  description: string;
  externalReference: string;
  dueDate: string; // YYYY-MM-DD
}) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/payments`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      billingType: "PIX",
      customer: input.customerId,
      value: input.value,
      description: input.description,
      externalReference: input.externalReference,
      dueDate: input.dueDate,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { id: string; invoiceUrl?: string };
}

export async function getPixQrCode(paymentId: string) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/payments/${paymentId}/pixQrCode`, {
    method: "GET",
    headers: config.headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { encodedImage?: string; payload?: string };
}

export async function deletePayment(paymentId: string) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/payments/${paymentId}`, {
    method: "DELETE",
    headers: config.headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json().catch(() => ({ deleted: true }));
}

export async function createCreditCardPayment(input: {
  customerId: string;
  value: number;
  installmentCount: number;
  installmentValue?: number;
  description: string;
  externalReference: string;
  dueDate: string;
  remoteIp: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone?: string;
    mobilePhone?: string;
  };
}) {
  const config = await requestConfig();

  const res = await fetch(`${config.baseUrl}/lean/payments`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "CREDIT_CARD",
      value: input.value,
      installmentCount: input.installmentCount > 1 ? input.installmentCount : undefined,
      installmentValue:
        input.installmentCount > 1 ? input.installmentValue ?? undefined : undefined,
      description: input.description,
      externalReference: input.externalReference,
      dueDate: input.dueDate,
      creditCard: input.creditCard,
      creditCardHolderInfo: input.creditCardHolderInfo,
      remoteIp: input.remoteIp,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as {
    id: string;
    status?: string;
    invoiceUrl?: string;
    installment?: string;
    creditCard?: { creditCardBrand?: string; creditCardNumber?: string };
  };
}
