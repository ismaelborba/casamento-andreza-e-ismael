export type AsaasRenderedError = {
  code: string | null;
  title: string;
  description: string;
};

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeCode(code: string | null | undefined) {
  return code?.trim().toLowerCase() ?? null;
}

function humanizeCode(code: string) {
  return code
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeAsaasSecret(value: string) {
  return value.trim().replace(/^["']|["']$/g, "").replace(/\\\$/g, "$");
}

export function parseAsaasError(
  input: unknown,
  fallback = "Não foi possível concluir a operação com o Asaas.",
): AsaasRenderedError {
  const raw =
    typeof input === "string"
      ? input
      : input instanceof Error
        ? input.message
        : input
          ? JSON.stringify(input)
          : "";

  if (raw.includes("ASAAS_API_KEY is missing.")) {
    return {
      code: "missing_api_key",
      title: "Credencial ausente",
      description:
        "Cadastre a API Key do Asaas em Configurações para liberar a integração financeira.",
    };
  }

  const parsed = raw ? safeParseJson(raw) : null;
  const firstItem =
    parsed && typeof parsed === "object" && Array.isArray((parsed as { errors?: unknown[] }).errors)
      ? (parsed as { errors: Array<{ code?: string; description?: string }> }).errors[0]
      : null;

  const code = normalizeCode(firstItem?.code);
  const description = firstItem?.description?.trim();

  if (code === "invalid_access_token") {
    return {
      code,
      title: "API Key inválida",
      description:
        "A chave do Asaas foi recusada. Verifique se a API Key corresponde ao ambiente selecionado e salve novamente em Configurações.",
    };
  }

  if (code) {
    return {
      code,
      title: humanizeCode(code),
      description: description || fallback,
    };
  }

  return {
    code: null,
    title: "Erro no Asaas",
    description: raw || fallback,
  };
}
