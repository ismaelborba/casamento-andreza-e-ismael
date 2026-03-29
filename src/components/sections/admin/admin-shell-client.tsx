"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
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
    label: "Convidados",
    description: "Cadastro, confirmações e mensagens",
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1080) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="admin-shell" data-sidebar-open={mobileOpen ? "true" : "false"}>
      {mobileOpen ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className="admin-sidebar" id="admin-sidebar">
        <div className="admin-sidebar-scroll">
          <div className="admin-brand">
            <Image
              src="/assets/images/logo-sem-fundo.png"
              width={72}
              height={72}
              className="admin-brand-logo"
              alt="Andreza e Ismael"
            />
            <div className="admin-brand-copy">
              <span className="admin-brand-eyebrow">Área privada</span>
              <strong>Painel do casamento</strong>
              <span className="admin-brand-meta">Andreza & Ismael</span>
            </div>
            <button
              type="button"
              className="admin-button-secondary admin-sidebar-close admin-hide-desktop"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              Fechar
            </button>
          </div>

          <nav className="admin-nav" aria-label="Menu administrativo">
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

          <div className="admin-sidebar-footer">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-breadcrumbs">
            <button
              type="button"
              className="admin-button-secondary admin-mobile-toggle"
              aria-expanded={mobileOpen}
              aria-controls="admin-sidebar"
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
