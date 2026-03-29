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
          <div className="admin-auth-story-inner">
            <span className="admin-auth-badge">Área privada</span>
            <h1>Acesso ao painel do casamento</h1>
            <p>
              Entre para acompanhar pedidos, confirmações e presentes em um único
              painel, com uma experiência mais clara e reservada para vocês.
            </p>

            <div className="admin-auth-points">
              <div className="admin-auth-point">
                <strong>Tudo centralizado</strong>
                <span>Presentes, pedidos e RSVP reunidos no mesmo lugar.</span>
              </div>
              <div className="admin-auth-point">
                <strong>Acesso mais discreto</strong>
                <span>Uma entrada direta, sem instruções técnicas expostas na tela.</span>
              </div>
            </div>

            <p className="admin-auth-story-note">
              Use a senha do admin para continuar.
            </p>
          </div>
        </section>

        <section className="admin-auth-card">
          <div className="admin-auth-card-head">
            <span className="admin-auth-card-eyebrow">Login</span>
            <h2>Entrar</h2>
            <p>Digite sua senha para abrir o painel administrativo.</p>
          </div>

          <AdminLoginForm nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
