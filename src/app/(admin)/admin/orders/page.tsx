import { getAdminOrders } from "@/src/lib/admin-data";
import {
  AdminEmptyState,
  AdminPageHeader,
} from "@/src/components/sections/admin/admin-ui";
import { AdminOrdersClient } from "@/src/components/sections/admin/admin-orders-client";

export default async function AdminOrdersPage() {
  const rows = await getAdminOrders();

  return (
    <>
      <AdminPageHeader
        kicker="Compras"
        title="Pedidos & Pagamentos"
        description="Aqui vocês acompanham quem comprou, quanto entrou, o status do pedido e o link direto da cobrança quando precisarem consultar algo no Asaas."
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Historico de pedidos</h2>
            <p>Lista ordenada dos pedidos mais recentes para os mais antigos.</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <AdminEmptyState>Ainda nao existe nenhum pedido criado no fluxo de presentes.</AdminEmptyState>
        ) : (
          <AdminOrdersClient rows={rows} />
        )}
      </section>
    </>
  );
}
