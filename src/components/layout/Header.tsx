"use client";

import Image from "next/image";
import Link from "next/link";
import { HeaderCart } from "@/src/components/layout/HeaderCart";

type HeaderProps = {
  brandHref?: string | null;
  showCart?: boolean;
  floating?: boolean;
};

export function Header({ brandHref = "/", showCart = true, floating = true }: HeaderProps) {
  const brand = (
    <>
      <Image
        src="/assets/images/logo-sem-fundo.png"
        width={72}
        height={72}
        alt="Andreza e Ismael"
      />
      <div className="site-header-brand-copy">
        <span>Andreza & Ismael</span>
        <strong>03 de Maio de 2026</strong>
      </div>
    </>
  );

  return (
    <header id="header" className={`site-header${floating ? "" : " is-flow"}`}>
      <div className={`site-header-shell${showCart ? "" : " is-centered"}`}>
        {brandHref ? (
          <Link href={brandHref} className="site-header-brand" aria-label="Voltar para a home">
            {brand}
          </Link>
        ) : (
          <div className="site-header-brand is-static" aria-label="Andreza e Ismael">
            {brand}
          </div>
        )}

        {showCart ? (
          <div className="site-header-actions">
            <HeaderCart />
          </div>
        ) : null}
      </div>
    </header>
  );
}
