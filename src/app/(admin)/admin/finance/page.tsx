import Link from "next/link";
import { getAdminFinance } from "@/src/lib/admin-data";
import {
  AdminMetricCard,
  AdminPageHeader,
  statusClassName,
} from "@/src/components/sections/admin/admin-ui";

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function AdminFinancePage() {
  const data = await getAdminFinance();
  const balance = data.balance?.availableBalance ?? data.balance?.balance ?? null;
  const nextCardRelease = data.card?.nextReleaseDateLabel ?? "Sem agenda";
  const config = data.config;
  const usingEnvFallback = config.source === "env" && !config.hasStoredCredentials;

  return (
    <>
      <AdminPageHeader
        kicker="Financeiro"
        title="Acompanhem o Asaas com leitura mais clara."
        description="Saldo, Pix, cartão e previsão de liberação ficam organizados aqui para uma leitura rápida do que entrou e do que ainda vai cair na conta."
      />

      {!config.ready ? (
        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Configure a integração antes de consultar o financeiro</h2>
              <p>
                Ainda não existe uma credencial do Asaas cadastrada no painel. Cadastre a
                conta em Configurações para liberar saldo, recebimentos e histórico.
              </p>
            </div>
            <div className="admin-actions-inline">
              <Link href="/admin/settings" className="admin-button">
                Ir para Configurações
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {usingEnvFallback ? (
        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Integração ativa via ambiente</h2>
              <p>
                O Asaas está funcionando com credenciais do <code>.env.local</code>. Se quiser
                centralizar isso no painel, salve a chave em Configurações.
              </p>
            </div>
            <div className="admin-actions-inline">
              <Link href="/admin/settings" className="admin-button-secondary">
                Cadastrar no painel
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="admin-metrics">
        <AdminMetricCard
          label="Saldo disponível"
          value={balance != null ? brl(Number(balance)) : "-"}
          copy="Leitura atual do saldo retornado pela conta do Asaas."
        />
        <AdminMetricCard
          label="Pix recebidos"
          value={data.received ? String(data.received.quantity) : "-"}
          copy="Quantidade de recebimentos via Pix retornada pelo Asaas."
        />
        <AdminMetricCard
          label="Cartões pagos"
          value={data.card ? String(data.card.quantity) : "-"}
          copy={
            data.card
              ? `${brl(data.card.awaitingReleaseValue)} ainda em janela de liberação.`
              : "Leitura dos pagamentos de cartão aprovados no site."
          }
        />
        <AdminMetricCard
          label="Próxima liberação"
          value={nextCardRelease}
          copy="No cartão, o Asaas tende a liberar o valor 32 dias após o pagamento efetivado."
        />
      </section>

      {config.ready ? (
        <>
          {data.errors.length ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Alertas da integração</h2>
                  <p>Esses retornos ajudam a diagnosticar a credencial ou a configuração ativa.</p>
                </div>
              </div>

              <div className="admin-stat-grid">
                {data.errors.map((error, index) => (
                  <div
                    key={`${index}-${error.code ?? "no-code"}-${error.description}`}
                    className="admin-mini-card"
                  >
                    <strong>{error.title}</strong>
                    {error.code ? <span>Código: {error.code}</span> : null}
                    <span>{error.description}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-finance-panels">
            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Recebidos via Pix</h2>
                  <p>Resumo do que já entrou na conta pela leitura atual do Asaas.</p>
                </div>
              </div>

              <div className="admin-gift-summary-stats admin-finance-stats">
                <div>
                  <span>Quantidade</span>
                  <strong>{data.received?.quantity ?? 0}</strong>
                </div>
                <div>
                  <span>Valor bruto</span>
                  <strong>{brl(data.received?.value ?? 0)}</strong>
                </div>
                <div>
                  <span>Valor líquido</span>
                  <strong>{brl(data.received?.netValue ?? 0)}</strong>
                </div>
                <div>
                  <span>Ticket médio</span>
                  <strong>{brl(data.received?.averageValue ?? 0)}</strong>
                </div>
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Pendentes via Pix</h2>
                  <p>Visão rápida do que ainda está aguardando pagamento.</p>
                </div>
              </div>

              <div className="admin-gift-summary-stats admin-finance-stats">
                <div>
                  <span>Quantidade</span>
                  <strong>{data.pending?.quantity ?? 0}</strong>
                </div>
                <div>
                  <span>Valor bruto</span>
                  <strong>{brl(data.pending?.value ?? 0)}</strong>
                </div>
                <div>
                  <span>Valor líquido</span>
                  <strong>{brl(data.pending?.netValue ?? 0)}</strong>
                </div>
                <div>
                  <span>Ticket médio</span>
                  <strong>{brl(data.pending?.averageValue ?? 0)}</strong>
                </div>
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Cartão confirmado</h2>
                  <p>
                    Os pagamentos no cartão são aprovados na hora, mas o valor costuma ser
                    liberado pelo Asaas 32 dias depois.
                  </p>
                </div>
              </div>

              <div className="admin-gift-summary-stats admin-finance-stats">
                <div>
                  <span>Quantidade</span>
                  <strong>{data.card?.quantity ?? 0}</strong>
                </div>
                <div>
                  <span>Valor bruto</span>
                  <strong>{brl(data.card?.grossValue ?? 0)}</strong>
                </div>
                <div>
                  <span>Valor líquido</span>
                  <strong>{brl(data.card?.netValue ?? 0)}</strong>
                </div>
                <div>
                  <span>A liberar</span>
                  <strong>{brl(data.card?.awaitingReleaseValue ?? 0)}</strong>
                </div>
              </div>

              <div className="admin-finance-mini-grid">
                <div className="admin-mini-card">
                  <strong>Próxima liberação estimada</strong>
                  <span>{data.card?.nextReleaseDateLabel ?? "Nenhuma prevista no momento."}</span>
                </div>
                <div className="admin-mini-card">
                  <strong>Já liberado estimado</strong>
                  <span>{brl(data.card?.releasedEstimatedValue ?? 0)}</span>
                </div>
              </div>
            </article>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Últimos pagamentos</h2>
                <p>Histórico recente do site com Pix e cartão, incluindo a previsão de liberação do Asaas.</p>
              </div>
            </div>

            <div className="admin-table-shell">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pagamento</th>
                    <th>Método</th>
                    <th>Status</th>
                    <th>Valores</th>
                    <th>Pago em</th>
                    <th>Liberação Asaas</th>
                    <th>Referência</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lastPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <span className="admin-table-title">{payment.payerName}</span>
                        <span className="admin-table-copy">{payment.detailsLabel}</span>
                      </td>
                      <td>
                        <span className="admin-table-title">{payment.methodLabel}</span>
                        <span className="admin-table-copy">{payment.id}</span>
                      </td>
                      <td>
                        <span className={statusClassName(payment.status)}>{payment.statusLabel}</span>
                      </td>
                      <td>
                        <span className="admin-table-title">{brl(payment.value)}</span>
                        <span className="admin-table-copy">Líquido previsto {brl(payment.netValue)}</span>
                      </td>
                      <td>
                        <span className="admin-table-copy">{payment.dateLabel}</span>
                      </td>
                      <td>
                        <span className="admin-table-copy">{payment.releaseDateLabel}</span>
                      </td>
                      <td>
                        <span className="admin-table-copy">{payment.externalReference}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
