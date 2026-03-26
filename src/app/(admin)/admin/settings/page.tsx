import { AdminPageHeader } from "@/src/components/sections/admin/admin-ui";
import { AsaasSettingsForm } from "@/src/components/sections/admin/asaas-settings-form";
import { getAsaasSettingsStatus } from "@/src/lib/asaas-config";
import { parseAsaasError } from "@/src/lib/asaas-errors";
import {
  automaticAnticipationRate,
  getAutomaticAnticipationStatus,
} from "@/src/lib/asaasFinance";

export default async function AdminSettingsPage() {
  const status = await getAsaasSettingsStatus();
  const anticipation =
    status.ready
      ? await getAutomaticAnticipationStatus()
          .then((result) => ({
            available: true,
            enabled: Boolean(result.creditCardAutomaticEnabled),
            rate: automaticAnticipationRate(),
            estimatedPayoutDays: 2,
            error: null,
          }))
          .catch((cause) => ({
            available: false,
            enabled: false,
            rate: automaticAnticipationRate(),
            estimatedPayoutDays: 2,
            error: parseAsaasError(
              cause,
              "Não foi possível consultar a antecipação automática do Asaas.",
            ).description,
          }))
      : {
          available: false,
          enabled: false,
          rate: automaticAnticipationRate(),
          estimatedPayoutDays: 2,
          error: null,
        };

  return (
    <>
      <AdminPageHeader
        kicker="Configurações"
        title="Credenciais e integração do Asaas."
        description="Cadastre aqui a chave da conta que receberá os pagamentos do site e centralize essa configuração no admin."
      />

      <AsaasSettingsForm initialStatus={status} initialAnticipation={anticipation} />
    </>
  );
}
