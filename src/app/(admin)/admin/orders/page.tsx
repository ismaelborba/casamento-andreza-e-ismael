import { centsToBRL } from "@/src/lib/money";
import { getAdminOrders } from "@/src/lib/admin-data";
import {
  AdminEmptyState,
  AdminPageHeader,
  formatStatusLabel,
  statusClassName,
} from "@/src/components/sections/admin/admin-ui";

function formatPaymentMethod(method: string | null | undefined, installmentCount: number | null | undefined) {
  switch (method) {
    case "credit_card":
      return installmentCount && installmentCount > 1 ? `Cartão ${installmentCount}x` : "Cartão";
    case "pix":
      return "Pix";
    case "boleto":
      return "Boleto";
    default:
      return "Ainda não escolhido";
  }
}

export default async function AdminOrdersPage() {
  const rows = await getAdminOrders();

  return (
    <>
      <AdminPageHeader
        kicker="Compras"
        title="Pedidos e pagamentos em um fluxo mais claro."
        description="Aqui vocês acompanham quem comprou, quanto entrou, o status do pedido e o link direto da cobrança quando precisarem consultar algo no Asaas."
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Histórico de pedidos</h2>
            <p>Lista ordenada dos pedidos mais recentes para os mais antigos.</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <AdminEmptyState>
            Ainda não existe nenhum pedido criado no fluxo de presentes.
          </AdminEmptyState>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Comprador</th>
                  <th>Status do pedido</th>
                  <th>Status do pagamento</th>
                  <th>Asaas</th>
                  <th className="admin-align-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.orderId}>
                    <td>
                      <span className="admin-table-title">
                        {new Date(row.createdAt).toLocaleString("pt-BR")}
                      </span>
                      <span className="admin-table-copy">{row.orderId}</span>
                    </td>
                    <td>
                      <span className="admin-table-title">{row.buyerName}</span>
                      <span className="admin-table-copy">{row.buyerEmail}</span>
                      <span className="admin-order-message">
                        {row.buyerMessage
                          ? `Mensagem: ${row.buyerMessage}`
                          : "Sem mensagem para o casal."}
                      </span>
                    </td>
                    <td>
                      <span className={statusClassName(row.status)}>
                        {formatStatusLabel(row.status)}
                      </span>
                    </td>
                    <td>
                      <span className={statusClassName(row.paymentStatus)}>
                        {formatStatusLabel(row.paymentStatus)}
                      </span>
                      <span className="admin-table-copy">
                        {formatPaymentMethod(row.paymentMethod, row.installmentCount)}
                      </span>
                    </td>
                    <td>
                      {row.invoiceUrl ? (
                        <a
                          className="admin-link"
                          href={row.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir cobrança
                        </a>
                      ) : (
                        <span className="admin-table-copy">Sem link disponível</span>
                      )}
                    </td>
                    <td className="admin-align-right">
                      <span className="admin-table-title">
                        {centsToBRL(Number(row.chargedTotalCents ?? row.totalCents))}
                      </span>
                      {row.feeAmountCents ? (
                        <span className="admin-table-copy">
                          inclui {centsToBRL(Number(row.feeAmountCents))} de taxa
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
