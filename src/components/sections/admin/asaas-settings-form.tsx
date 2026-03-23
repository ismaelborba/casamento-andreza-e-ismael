"use client";

import { useMemo, useState } from "react";
import type { AsaasSettingsStatus } from "@/src/lib/asaas-config";

type Props = {
  initialStatus: AsaasSettingsStatus;
};

export function AsaasSettingsForm({ initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [environment, setEnvironment] = useState<"sandbox" | "production">(
    initialStatus.environment,
  );
  const [apiKey, setApiKey] = useState("");
  const [webhookToken, setWebhookToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const helperCopy = useMemo(() => {
    if (status.source === "database") {
      return "As credenciais ativas já estão salvas com criptografia no banco. Deixe um campo em branco para manter o valor atual.";
    }

    if (status.source === "env") {
      return "Hoje o Asaas está sendo lido do .env. Ao salvar aqui, o painel passa a usar a credencial cadastrada no banco.";
    }

    return "Cadastre a API Key e, se quiser, o token do webhook para centralizar a integração do Asaas no painel.";
  }, [status.source]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/settings/asaas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment,
          apiKey,
          webhookToken,
        }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          json?.error?.formErrors?.[0] ??
            json?.error ??
            "Não foi possível salvar as credenciais do Asaas.",
        );
      }

      setStatus(json.status);
      setApiKey("");
      setWebhookToken("");
      setSuccess("Credenciais do Asaas validadas e salvas com sucesso.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar as credenciais do Asaas.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-grid-2">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Credenciais do Asaas</h2>
            <p>{helperCopy}</p>
          </div>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="asaas-environment">Ambiente</label>
            <select
              id="asaas-environment"
              className="admin-input"
              value={environment}
              onChange={(event) =>
                setEnvironment(event.target.value === "production" ? "production" : "sandbox")
              }
            >
              <option value="sandbox">Sandbox</option>
              <option value="production">Produção</option>
            </select>
          </div>

          <div className="admin-field">
            <label htmlFor="asaas-api-key">API Key</label>
            <input
              id="asaas-api-key"
              className="admin-input"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={
                status.hasApiKey
                  ? "Já existe uma chave salva. Preencha apenas se quiser trocar."
                  : "$aact_..."
              }
            />
          </div>

          <div className="admin-field">
            <label htmlFor="asaas-webhook-token">Token do webhook</label>
            <input
              id="asaas-webhook-token"
              className="admin-input"
              value={webhookToken}
              onChange={(event) => setWebhookToken(event.target.value)}
              placeholder={
                status.hasWebhookToken
                  ? "Já existe um token salvo. Preencha apenas se quiser trocar."
                  : "whsec_..."
              }
            />
          </div>

          <p className="admin-inline-note">
            Antes de salvar, o painel valida a chave no ambiente selecionado. Se houver erro,
            mostramos uma mensagem mais clara para você corrigir sem precisar olhar o JSON bruto.
          </p>

          <p className="admin-inline-note">
            Para reforçar a criptografia, defina <code>ASAAS_SETTINGS_SECRET</code> no ambiente.
            Se ele não existir, o sistema usa <code>ADMIN_SESSION_SECRET</code> ou{" "}
            <code>ADMIN_PASSWORD</code> como fallback.
          </p>

          {error ? <p className="admin-form-error">{error}</p> : null}
          {success ? <p className="admin-form-success">{success}</p> : null}

          <div className="admin-actions-inline">
            <button
              type="button"
              className="admin-button"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Validando e salvando..." : "Salvar credenciais"}
            </button>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Status da integração</h2>
            <p>Resumo rápido do que está ativo hoje para a comunicação com o Asaas.</p>
          </div>
        </div>

        <div className="admin-stat-grid">
          <div className="admin-mini-card">
            <strong>Origem ativa</strong>
            <span>
              {status.source === "database"
                ? "Banco de dados"
                : status.source === "env"
                  ? ".env.local"
                  : "Não configurado"}
            </span>
          </div>
          <div className="admin-mini-card">
            <strong>Ambiente</strong>
            <span>{status.environment === "production" ? "Produção" : "Sandbox"}</span>
          </div>
          <div className="admin-mini-card">
            <strong>API Key</strong>
            <span>{status.hasApiKey ? "Configurada" : "Não configurada"}</span>
          </div>
          <div className="admin-mini-card">
            <strong>Webhook</strong>
            <span>{status.hasWebhookToken ? "Configurado" : "Opcional / vazio"}</span>
          </div>
        </div>

        <p className="admin-inline-note">
          {status.updatedAt
            ? `Última atualização: ${new Date(status.updatedAt).toLocaleString("pt-BR")}.`
            : "Ainda não existe uma credencial salva no painel."}
        </p>
      </section>
    </div>
  );
}
