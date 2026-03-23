"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/src/components/sections/admin/logout-button";

const items = [
  {
    href: "/admin",
    label: "Visão geral",
    description: "Pedidos, cotas e resumo do site",
  },
  {
    href: "/admin/gifts",
    label: "Presentes",
    description: "Cadastro, status e disponibilidade",
  },
  {
    href: "/admin/orders",
    label: "Pedidos",
    description: "Compras, pagamentos e links",
  },
  {
    href: "/admin/rsvps",
    label: "RSVP",
    description: "Confirmações e mensagens",
  },
  {
    href: "/admin/finance",
    label: "Financeiro",
    description: "Saldo, repasses e recebimentos",
  },
  {
    href: "/admin/settings",
    label: "Configurações",
    description: "Credenciais e integrações",
  },
];

type Props = {
  userEmail: string;
  children: ReactNode;
};

export function AdminShellClient({ userEmail, children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = items.find(
    (item) =>
      pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)),
  );

  return (
    <div className="admin-shell" data-sidebar-open={mobileOpen ? "true" : "false"}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">AI</span>
          <div className="admin-brand-copy">
            <span className="admin-brand-eyebrow">Área privada</span>
            <strong>Painel do casamento</strong>
            <span className="admin-brand-meta">Andreza & Ismael</span>
          </div>
        </div>

        <nav className="admin-nav">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`admin-nav-link ${active ? "is-active" : ""}`}
              >
                <span className="admin-nav-copy">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
                <span aria-hidden="true">+</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-card">
          <strong>Acesso autorizado</strong>
          <p>
            O painel está liberado apenas para <strong>{userEmail}</strong> e a
            sessão fica protegida por cookie seguro.
          </p>
        </div>

        <div className="admin-sidebar-footer">
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-breadcrumbs">
            <button
              type="button"
              className="admin-button-secondary admin-mobile-toggle"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? "Fechar menu" : "Abrir menu"}
            </button>
            <span>Admin</span>
            <span>/</span>
            <strong>{activeItem?.label ?? "Painel"}</strong>
          </div>

          <div className="admin-topbar-meta">
            <div className="admin-topbar-user">
              <strong>Casamento Andreza & Ismael</strong>
              <span>{userEmail}</span>
            </div>
            <span className="admin-hide-desktop">
              <AdminLogoutButton />
            </span>
          </div>
        </div>

        <div className="admin-layout-content">{children}</div>
      </div>
    </div>
  );
}
