import { AdminPageHeader } from "@/src/components/sections/admin/admin-ui";
import { AsaasSettingsForm } from "@/src/components/sections/admin/asaas-settings-form";
import { getAsaasSettingsStatus } from "@/src/lib/asaas-config";

export default async function AdminSettingsPage() {
  const status = await getAsaasSettingsStatus();

  return (
    <>
      <AdminPageHeader
        kicker="Configurações"
        title="Credenciais e integração do Asaas."
        description="Cadastre aqui a chave da conta que receberá os pagamentos do site e centralize essa configuração no admin."
      />

      <AsaasSettingsForm initialStatus={status} />
    </>
  );
}
