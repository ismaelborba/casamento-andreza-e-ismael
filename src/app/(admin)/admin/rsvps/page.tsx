import { getAdminRsvps } from "@/src/lib/admin-data";
import {
  AdminEmptyState,
  AdminPageHeader,
  statusClassName,
} from "@/src/components/sections/admin/admin-ui";

export default async function AdminRsvpsPage() {
  const rows = await getAdminRsvps();

  return (
    <>
      <AdminPageHeader
        kicker="Confirmações"
        title="RSVP organizado para acompanhar quem vem e quem não vem."
        description="As respostas ficam centralizadas com nome, contato, quantidade de acompanhantes e mensagem enviada pelo convidado."
      />

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Lista de respostas</h2>
            <p>Consolidado das confirmações recebidas pelo site.</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <AdminEmptyState>Ainda não existem respostas de RSVP cadastradas.</AdminEmptyState>
        ) : (
          <div className="admin-table-shell">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Convidado</th>
                  <th>Resposta</th>
                  <th>Acompanhantes</th>
                  <th>Contato</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="admin-table-title">
                        {new Date(row.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table-title">{row.name}</span>
                    </td>
                    <td>
                      <span className={statusClassName(row.attending ? "confirmed" : "declined")}>
                        {row.attending ? "Vai ao casamento" : "Não vai conseguir ir"}
                      </span>
                    </td>
                    <td>{row.guestsCount}</td>
                    <td>
                      <span className="admin-table-copy">{row.email ?? "-"}</span>
                      <span className="admin-table-copy">{row.phone ?? "-"}</span>
                    </td>
                    <td>
                      <span className="admin-table-copy">{row.message ?? "-"}</span>
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
