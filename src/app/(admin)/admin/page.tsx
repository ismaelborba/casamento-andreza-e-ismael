import { centsToBRL } from "@/src/lib/money";
import { getAdminOverview } from "@/src/lib/admin-data";
import { AdminPageHeader, AdminMetricCard } from "@/src/components/sections/admin/admin-ui";

function percentageValue(total: number, part: number) {
  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((part / total) * 100));
}

export default async function AdminDashboardPage() {
  const data = await getAdminOverview();
  const totalPaid = Number(data.orders?.totalPaidCents ?? 0);
  const paidOrders = Number(data.orders?.paidOrders ?? 0);
  const pendingOrders = Number(data.orders?.pendingOrders ?? 0);
  const totalOrders = Number(data.orders?.totalOrders ?? 0);
  const yesRsvps = Number(data.rsvps?.yesRsvps ?? 0);
  const noRsvps = Number(data.rsvps?.noRsvps ?? 0);
  const guestsYes = Number(data.rsvps?.totalGuestsYes ?? 0);
  const asaasBalance =
    data.asaas.balance?.availableBalance ?? data.asaas.balance?.balance ?? null;

  return (
    <>
      <AdminPageHeader
        kicker="Painel principal"
        title="Visão Geral"
        description="Acompanhamento rápido da arrecadação, confirmações e dos presentes com mais movimento. O foco aqui é deixar vocês no controle sem precisar vasculhar o sistema."
      />

      <section className="admin-metrics">
        <AdminMetricCard
          label="Total recebido"
          value={centsToBRL(totalPaid)}
          copy="Soma apenas dos pedidos marcados como pagos no banco."
        />
        <AdminMetricCard
          label="Pedidos pagos"
          value={`${paidOrders}`}
          copy={`${pendingOrders} pedidos ainda aguardam pagamento.`}
        />
        <AdminMetricCard
          label="RSVP confirmado"
          value={`${yesRsvps}`}
          copy={`${guestsYes} convidados confirmados para o evento.`}
        />
        <AdminMetricCard
          label="Saldo Asaas"
          value={asaasBalance != null ? `R$ ${Number(asaasBalance).toFixed(2)}` : "-"}
          copy={data.asaas.error ?? "Consulta direta ao saldo configurado no Asaas."}
        />
      </section>

      <section className="admin-grid-2">
        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Resumo operacional</h2>
              <p>Uma leitura rápida de como o site está performando agora.</p>
            </div>
          </div>

          <div className="admin-stat-grid">
            <div className="admin-mini-card">
              <strong>{totalOrders}</strong>
              <span>Pedidos totais criados na área de presentes.</span>
            </div>
            <div className="admin-mini-card">
              <strong>{noRsvps}</strong>
              <span>Convidados responderam que não poderão comparecer.</span>
            </div>
            <div className="admin-mini-card">
              <strong>{data.gifts.length}</strong>
              <span>Presentes cadastrados no admin para alimentar a lista pública.</span>
            </div>
            <div className="admin-mini-card">
              <strong>{data.gifts.filter((gift) => gift.active).length}</strong>
              <span>Itens atualmente visíveis para compra em <code>/gifts</code>.</span>
            </div>
          </div>
        </article>

        <article className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Os favoritos da galera</h2>
              <p>Os itens abaixo ajudam a entender o ritmo da lista.</p>
            </div>
          </div>

          <div className="admin-progress-list">
            {data.topGifts.map((gift) => {
              const sold = gift.purchasedQuantity + gift.reservedQuantity;
              const progress = percentageValue(gift.totalQuantity, sold);
              const available =
                gift.totalQuantity - gift.purchasedQuantity - gift.reservedQuantity;

              return (
                <article key={gift.id} className="admin-progress-item">
                  <header>
                    <div>
                      <h3>{gift.name}</h3>
                      <div className="admin-progress-meta">
                        {centsToBRL(gift.priceCents)} por cota
                      </div>
                    </div>
                    <div className="admin-progress-meta">
                      {Math.max(0, available)} disponíveis
                    </div>
                  </header>

                  <div className="admin-progress-bar">
                    <span style={{ width: progress === 0 ? "0%" : `max(${progress}%, 12px)` }} />
                  </div>

                  <div className="admin-progress-meta">
                    {gift.purchasedQuantity} compradas, {gift.reservedQuantity} reservadas,{" "}
                    {gift.totalQuantity} no total.
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}
