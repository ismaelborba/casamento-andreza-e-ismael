import { AdminLoginForm } from "@/src/components/sections/admin/admin-login-form";

type PageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const nextPath = params?.next || "/admin";

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-shell">
        <section className="admin-auth-story">
          <span className="admin-auth-badge">Painel do casamento</span>
          <h1>Um admin novo, mais claro e pronto para a lista de presentes.</h1>
          <p>
            O acesso agora fica restrito ao Gmail do casal. Assim vocês podem
            gerenciar pedidos, confirmações e presentes em um lugar único, com
            uma interface mais organizada e segura.
          </p>

          <div className="admin-auth-points">
            <div className="admin-auth-point">
              <strong>Lista de presentes centralizada</strong>
              <span>
                Cadastre, edite, ative ou pause presentes e acompanhe o andamento
                das cotas em tempo real.
              </span>
            </div>
            <div className="admin-auth-point">
              <strong>Pedidos e RSVP no mesmo painel</strong>
              <span>
                Fica muito mais fácil enxergar o que entrou, o que está pendente
                e quem confirmou presença.
              </span>
            </div>
            <div className="admin-auth-point">
              <strong>Compra dentro do próprio site</strong>
              <span>
                Os convidados escolhem o presente na página de gifts e seguem
                para o pagamento Pix sem sair da experiência do site.
              </span>
            </div>
          </div>
        </section>

        <section className="admin-auth-card">
          <div>
            <h2>Entrar no admin</h2>
            <p>
              Apenas o e-mail <strong>casamento.ismaeleandreza@gmail.com</strong>{" "}
              está autorizado a acessar esta área.
            </p>
          </div>

          <AdminLoginForm nextPath={nextPath} />

          <p className="admin-auth-footer">
            Se quiser reforçar a segurança depois, dá para separar a sessão em
            uma chave própria com <code>ADMIN_SESSION_SECRET</code>.
          </p>
        </section>
      </div>
    </main>
  );
}
