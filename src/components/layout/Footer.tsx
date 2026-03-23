"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-shell">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <span className="site-footer-kicker">Casamento</span>
            <h2>Andreza & Ismael</h2>
            <p>
              Estamos preparando esse dia com muito carinho e vamos amar celebrar com quem faz
              parte da nossa história.
            </p>
          </div>

          <div className="site-footer-links">
            <h3>Links</h3>
            <div className="site-footer-link-list">
              <Link href="/#home">Início</Link>
              <Link href="/#couple">Os noivos</Link>
              <Link href="/#story">História</Link>
              <Link href="/gifts">Presentes</Link>
            </div>
          </div>

          <div className="site-footer-contact">
            <h3>Informações</h3>
            <div className="site-footer-contact-lines">
              <p>03 de Maio de 2026</p>
              <p>Cerimônia às 16h</p>
              <p>Em breve mais detalhes por aqui</p>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Andreza & Ismael</span>
          <span>03 de Maio de 2026</span>
        </div>
      </div>
    </footer>
  );
}
