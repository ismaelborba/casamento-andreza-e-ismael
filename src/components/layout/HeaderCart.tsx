"use client";

import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGiftCart } from "@/src/components/sections/gifts/cart-store";
import { usePublicGiftsCatalog } from "@/src/components/sections/gifts/public-gifts-store";
import { centsToBRL } from "@/src/lib/money";

export function HeaderCart() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const { gifts, loading } = usePublicGiftsCatalog();
  const { cartItems, hydrated, items, totals, removeFromCart } = useGiftCart(gifts);

  const rawQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const visibleQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const badgeQuantity = visibleQuantity || rawQuantity;
  const waitingForCatalog = hydrated && items.length > 0 && cartItems.length === 0 && loading;
  const previewItems = cartItems.slice(0, 4);
  const hiddenItemsCount = Math.max(0, cartItems.length - previewItems.length);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <div ref={shellRef} className={`site-header-cart ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="site-header-cart-toggle"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Abrir carrinho"
        onClick={() => setOpen((current) => !current)}
      >
        <ShoppingCart size={18} />
        {/* <span>Carrinho</span> */}
        <strong>{badgeQuantity}</strong>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="site-header-cart-backdrop"
            aria-label="Fechar carrinho"
            onClick={() => setOpen(false)}
          />

          <div className="site-header-cart-panel" role="dialog" aria-label="Itens do carrinho" aria-modal="true">
            <div className="site-header-cart-head">
              <div>
                <strong>Seu carrinho</strong>
                <span>{badgeQuantity} item(ns) selecionado(s)</span>
              </div>

              <button
                type="button"
                className="site-header-cart-close"
                aria-label="Fechar carrinho"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {!hydrated || waitingForCatalog ? (
              <div className="site-header-cart-empty">Carregando seus presentes...</div>
            ) : cartItems.length === 0 ? (
              <div className="site-header-cart-empty">
                Seu carrinho esta vazio. Escolha um presente para continuar.
              </div>
            ) : (
              <>
                <div className="site-header-cart-list">
                  {previewItems.map((item) => (
                    <article key={item.gift.id} className="site-header-cart-item">
                      <div className="site-header-cart-item-media">
                        {item.gift.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.gift.imageUrl} alt={item.gift.name} />
                        ) : (
                          <div className="site-header-cart-item-fallback">Presente</div>
                        )}
                      </div>

                      <div className="site-header-cart-item-copy">
                        <strong>{item.gift.name}</strong>
                        <span>
                          {item.quantity} x {centsToBRL(item.gift.priceCents)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="site-header-cart-remove"
                        aria-label={`Remover ${item.gift.name} do carrinho`}
                        onClick={() => removeFromCart(item.gift.id)}
                      >
                        Remover
                      </button>
                    </article>
                  ))}
                </div>

                {hiddenItemsCount ? (
                  <p className="site-header-cart-more">
                    +{hiddenItemsCount} item(ns) a mais no carrinho.
                  </p>
                ) : null}

                <div className="site-header-cart-summary">
                  <span>Subtotal</span>
                  <strong>{centsToBRL(totals.subtotalCents)}</strong>
                </div>
              </>
            )}

            <div className="site-header-cart-actions">
              <Link href="/gifts" className="site-header-cart-primary" onClick={() => setOpen(false)}>
                Escolher presentes
              </Link>
              <Link href="/gifts/cart" className="site-header-cart-secondary" onClick={() => setOpen(false)}>
                Ver carrinho
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
