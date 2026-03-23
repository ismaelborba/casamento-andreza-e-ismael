import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { asaasSettings } from "@/src/db/schema";
import { normalizeAsaasSecret, parseAsaasError } from "@/src/lib/asaas-errors";

export type AsaasEnv = "sandbox" | "production";
export type AsaasConfigSource = "database" | "env" | "none";

export type AsaasSettingsStatus = {
  source: AsaasConfigSource;
  ready: boolean;
  hasStoredCredentials: boolean;
  environment: AsaasEnv;
  hasApiKey: boolean;
  hasWebhookToken: boolean;
  updatedAt: string | null;
};

function readFirstEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return normalizeAsaasSecret(value);
    }
  }

  return "";
}

function getEncryptionKey() {
  const raw =
    process.env.ASAAS_SETTINGS_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "";

  if (!raw.trim()) {
    throw new Error(
      "Configure ASAAS_SETTINGS_SECRET ou ADMIN_SESSION_SECRET para criptografar as credenciais do Asaas.",
    );
  }

  return createHash("sha256").update(raw).digest();
}

function encryptValue(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptValue(payload: string) {
  const [ivPart, tagPart, encryptedPart] = payload.split(":");

  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error("Credencial criptografada do Asaas está inválida.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivPart, "base64"),
  );

  decipher.setAuthTag(Buffer.from(tagPart, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function normalizeEnv(value: string | null | undefined): AsaasEnv {
  return value === "production" ? "production" : "sandbox";
}

async function getStoredSettingsRow() {
  return (
    await db.select().from(asaasSettings).orderBy(desc(asaasSettings.updatedAt)).limit(1)
  )[0] ?? null;
}

async function validateAsaasCredentials(environment: AsaasEnv, apiKey: string) {
  const baseUrl =
    environment === "production"
      ? "https://api.asaas.com/v3"
      : "https://api-sandbox.asaas.com/v3";

  const response = await fetch(`${baseUrl}/finance/balance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(parseAsaasError(raw).description);
  }
}

export async function getAsaasSettingsStatus(): Promise<AsaasSettingsStatus> {
  const stored = await getStoredSettingsRow();

  if (stored) {
    return {
      source: "database",
      ready: true,
      hasStoredCredentials: true,
      environment: stored.environment,
      hasApiKey: Boolean(stored.encryptedApiKey),
      hasWebhookToken: Boolean(stored.encryptedWebhookToken),
      updatedAt: stored.updatedAt?.toISOString() ?? null,
    };
  }

  const envApiKey = readFirstEnv("ASAAS_API_KEY", "ASAAAS_API_KEY");
  const envWebhookToken = readFirstEnv("ASAAS_WEBHOOK_TOKEN", "ASAAAS_WEBHOOK_TOKEN");
  const environment = normalizeEnv(readFirstEnv("ASAAS_ENV", "ASAAAS_ENV"));

  if (envApiKey) {
    return {
      source: "env",
      ready: true,
      hasStoredCredentials: false,
      environment,
      hasApiKey: true,
      hasWebhookToken: Boolean(envWebhookToken),
      updatedAt: null,
    };
  }

  return {
    source: "none",
    ready: false,
    hasStoredCredentials: false,
    environment,
    hasApiKey: false,
    hasWebhookToken: false,
    updatedAt: null,
  };
}

export async function getAsaasRuntimeConfig() {
  const stored = await getStoredSettingsRow();

  if (stored) {
    return {
      source: "database" as const,
      environment: stored.environment,
      apiKey: decryptValue(stored.encryptedApiKey),
      webhookToken: stored.encryptedWebhookToken
        ? decryptValue(stored.encryptedWebhookToken)
        : "",
    };
  }

  const apiKey = readFirstEnv("ASAAS_API_KEY", "ASAAAS_API_KEY");
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY is missing.");
  }

  return {
    source: "env" as const,
    environment: normalizeEnv(readFirstEnv("ASAAS_ENV", "ASAAAS_ENV")),
    apiKey,
    webhookToken: readFirstEnv("ASAAS_WEBHOOK_TOKEN", "ASAAAS_WEBHOOK_TOKEN"),
  };
}

export async function getAsaasWebhookToken() {
  const stored = await getStoredSettingsRow();

  if (stored?.encryptedWebhookToken) {
    return decryptValue(stored.encryptedWebhookToken);
  }

  return readFirstEnv("ASAAS_WEBHOOK_TOKEN", "ASAAAS_WEBHOOK_TOKEN");
}

export async function saveAsaasSettings(input: {
  environment: AsaasEnv;
  apiKey?: string;
  webhookToken?: string;
}) {
  const existing = await getStoredSettingsRow();

  const nextApiKey = input.apiKey?.trim()
    ? normalizeAsaasSecret(input.apiKey)
    : existing?.encryptedApiKey
      ? decryptValue(existing.encryptedApiKey)
      : "";

  const nextWebhookToken = input.webhookToken?.trim()
    ? normalizeAsaasSecret(input.webhookToken)
    : existing?.encryptedWebhookToken
      ? decryptValue(existing.encryptedWebhookToken)
      : "";

  if (!nextApiKey) {
    throw new Error("Informe a API Key do Asaas.");
  }

  await validateAsaasCredentials(input.environment, nextApiKey);

  const values = {
    environment: input.environment,
    encryptedApiKey: encryptValue(nextApiKey),
    encryptedWebhookToken: nextWebhookToken ? encryptValue(nextWebhookToken) : null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(asaasSettings).set(values).where(eq(asaasSettings.id, existing.id));
  } else {
    await db.insert(asaasSettings).values(values);
  }

  return getAsaasSettingsStatus();
}
