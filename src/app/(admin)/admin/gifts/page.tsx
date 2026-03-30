import { AdminGiftCreateButton } from "@/src/components/sections/admin/admin-gift-create-button";
import { AdminPageHeader } from "@/src/components/sections/admin/admin-ui";
import { AdminGiftsManager } from "@/src/components/sections/admin/gifts-manager";
import { getAdminGifts } from "@/src/lib/admin-data";

export default async function AdminGiftsPage() {
  const rows = await getAdminGifts();

  return (
    <>
      <AdminPageHeader
        kicker="Lista de presentes"
        title="Acompanhe seus Presentes"
        description="Voces conseguem montar toda a lista aqui, com controle de valor, quantidade, visibilidade e acompanhamento das cotas vendidas ou reservadas."
        actions={<AdminGiftCreateButton />}
      />

      <AdminGiftsManager initialRows={rows} />
    </>
  );
}
