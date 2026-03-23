import { getAdminGifts } from "@/src/lib/admin-data";
import { AdminPageHeader } from "@/src/components/sections/admin/admin-ui";
import { AdminGiftsManager } from "@/src/components/sections/admin/gifts-manager";

export default async function AdminGiftsPage() {
  const rows = await getAdminGifts();

  return (
    <>
      <AdminPageHeader
        kicker="Lista de presentes"
        title="Cadastro de presentes com cara de painel de verdade."
        description="Voces conseguem montar toda a lista aqui, com controle de valor, quantidade, visibilidade e acompanhamento das cotas vendidas ou reservadas."
      />

      <AdminGiftsManager initialRows={rows} />
    </>
  );
}
