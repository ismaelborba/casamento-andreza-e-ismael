"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HeaderCart } from "@/src/components/layout/HeaderCart";

const NAV_ITEMS = [
  { id: "home", label: "Início" },
  { id: "couple", label: "Os noivos" },
  { id: "recommendations", label: "Recomendações" },
  { id: "gifts", label: "Presentes" },
  { id: "event", label: "Localização" },
] as const;

function getHeaderHeight(): number {
  if (typeof window === "undefined") {
    return 112;
  }

  const header = document.getElementById("header");
  return Math.round(header?.getBoundingClientRect().height ?? 112);
}

function removeHashFromUrl() {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  const offset = getHeaderHeight() + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  removeHashFromUrl();
}

function computeActiveId(ids: string[]): string {
  const header = getHeaderHeight();
  const viewportTop = header + 12;
  const viewportBottom = window.innerHeight;

  let bestId = ids[0] ?? "home";
  let bestVisible = 0;
  let bestTop = Number.POSITIVE_INFINITY;

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;

    const r = el.getBoundingClientRect();
    const top = Math.max(r.top, viewportTop);
    const bottom = Math.min(r.bottom, viewportBottom);
    const visible = Math.max(0, bottom - top);
    const effectiveTop = r.top;

    if (visible > bestVisible || (visible === bestVisible && effectiveTop < bestTop)) {
      bestVisible = visible;
      bestTop = effectiveTop;
      bestId = id;
    }
  }

  const nearBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (nearBottom) return ids[ids.length - 1] ?? bestId;

  return bestId;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const ids = useMemo(() => NAV_ITEMS.map((item) => item.id), []);
  const routeActiveId = useMemo(() => {
    if (isHome) {
      return ids[0] ?? "home";
    }

    return pathname.startsWith("/gifts") || pathname.startsWith("/checkout") ? "gifts" : "";
  }, [ids, isHome, pathname]);
  const [activeId, setActiveId] = useState(
    routeActiveId,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lockRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);

  const updateActive = useCallback(() => {
    setActiveId(computeActiveId(ids));
  }, [ids]);

  useEffect(() => {
    if (!isHome) {
      return;
    }

    const scheduleActiveUpdate = () => {
      if (lockRef.current) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActive);
    };

    scheduleActiveUpdate();

    const onScroll = () => {
      scheduleActiveUpdate();
    };

    const onResize = () => {
      scheduleActiveUpdate();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    };
  }, [isHome, updateActive]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setMobileOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mobileOpen, pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const lockDuringSmoothScroll = useCallback(() => {
    lockRef.current = true;
    if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      updateActive();
    }, 900);
  }, [updateActive]);

  const onSectionClick = useCallback(
    (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setMobileOpen(false);

      if (!isHome) {
        router.push(id === "home" ? "/" : `/#${id}`);
        return;
      }

      setActiveId(id);
      lockDuringSmoothScroll();
      scrollToSection(id);
    },
    [isHome, lockDuringSmoothScroll, router],
  );

  return (
    <header id="header" className="site-header">
      <div className="site-header-shell">
        <Link href="/" className="site-header-brand" aria-label="Voltar para a home">
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
        </Link>

        <button
          type="button"
          className="site-header-toggle"
          aria-expanded={mobileOpen}
          aria-controls="site-header-nav"
          onClick={() => setMobileOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="site-header-nav"
          className={`site-header-nav ${mobileOpen ? "is-open" : ""}`}
          aria-label="Navegação principal"
        >
          <div className="site-header-nav-inner">
            <div className="site-header-nav-list">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={isHome ? `#${item.id}` : item.id === "home" ? "/" : `/#${item.id}`}
                  scroll={false}
                  onClick={onSectionClick(item.id)}
                  className={`site-header-link ${(isHome ? activeId : routeActiveId) === item.id ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="site-header-actions">
              <HeaderCart />
              <Link href="/gifts" className="site-header-cta">
                Lista de presentes
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {mobileOpen ? <button type="button" className="site-header-backdrop" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" /> : null}
    </header>
  );
}
