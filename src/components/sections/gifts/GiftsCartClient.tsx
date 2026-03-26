"use client";

import Link from "next/link";
import { centsToBRL } from "@/src/lib/money";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import { useGiftCart } from "@/src/components/sections/gifts/cart-store";
import { usePublicGiftsCatalog } from "@/src/components/sections/gifts/public-gifts-store";
import type { Gift } from "@/src/components/sections/gifts/shop-types";
import { availableQty } from "@/src/components/sections/gifts/shop-types";

export function GiftsCartClient({ gifts }: { gifts: Gift[] }) {
  const { gifts: catalog, loading: loadingCatalog } = usePublicGiftsCatalog(gifts);
  const { cartItems, hydrated, items, totals, updateQuantity, removeFromCart } = useGiftCart(catalog);
  const waitingForCatalog = items.length > 0 && cartItems.length === 0 && loadingCatalog;

  return (
    <div className="gifts-shell">
      <GiftCheckoutSteps current="cart" />

      <section className="gift-shop-header">
        <div>
          <span className="gift-eyebrow">Carrinho</span>
          <h1>Revise seus presentes antes de continuar.</h1>
          <p>
            Aqui você pode ajustar quantidades, remover itens e conferir o total
            antes de informar seus dados.
          </p>
        </div>
      </section>

      {!hydrated || waitingForCatalog ? (
        <div className="gift-loading">Carregando carrinho...</div>
      ) : cartItems.length === 0 ? (
        <div className="gift-empty-state">
          Seu carrinho está vazio. <Link href="/gifts">Voltar para a lista de presentes</Link>.
        </div>
      ) : (
        <section className="gift-layout-two gift-cart-layout">
          <div className="gift-cart-list">
            {cartItems.map((item) => (
              <article key={item.gift.id} className="gift-cart-row">
                <div className="gift-cart-row-media">
                  {item.gift.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.gift.imageUrl} alt={item.gift.name} />
                  ) : (
                    <div className="gift-card-media-fallback">Presente</div>
                  )}
                </div>

                <div className="gift-cart-row-main">
                  <div className="gift-cart-row-header">
                    <div>
                      <h3>{item.gift.name}</h3>
                      <p className="gift-cart-row-description">
                        {item.gift.description ?? "Presente selecionado na lista do casal."}
                      </p>
                    </div>
                    <strong className="gift-cart-row-price">
                      {centsToBRL(item.gift.priceCents)}
                    </strong>
                  </div>

                  <div className="gift-chip-row">
                    <span className="gift-chip">
                      {availableQty(item.gift)} cotas disponíveis
                    </span>
                    <span className="gift-chip">
                      {centsToBRL(item.gift.priceCents)} por cota
                    </span>
                  </div>
                </div>

                <aside className="gift-cart-row-aside">
                  <div className="gift-cart-row-side-card">
                    <span className="gift-cart-row-side-label">Quantidade</span>
                    <input
                      id={`cart-qty-${item.gift.id}`}
                      className="gift-input gift-cart-qty-input"
                      type="number"
                      min={1}
                      max={Math.max(1, availableQty(item.gift))}
                      value={item.quantity}
                      onChange={(event) =>
                        updateQuantity(item.gift.id, Number(event.target.value) || 1)
                      }
                    />
                    <span className="gift-inline-note">
                      Ajuste a quantidade antes de seguir.
                    </span>
                  </div>

                  <div className="gift-cart-row-side-card gift-cart-row-side-card-total">
                    <span className="gift-cart-row-side-label">Subtotal</span>
                    <strong>{centsToBRL(item.quantity * item.gift.priceCents)}</strong>
                    <span className="gift-inline-note">
                      {item.quantity} cota{item.quantity > 1 ? "s" : ""} neste pedido.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="gift-button-secondary gift-cart-remove-button"
                    onClick={() => removeFromCart(item.gift.id)}
                  >
                    Remover presente
                  </button>
                </aside>
              </article>
            ))}
          </div>

          <aside className="gift-summary gift-cart-summary">
            <h2>Resumo do pedido</h2>
            <div className="gift-summary-list">
              {cartItems.map((item) => (
                <div key={item.gift.id} className="gift-summary-item">
                  <div>
                    <strong>{item.gift.name}</strong>
                    <p>
                      {item.quantity} x {centsToBRL(item.gift.priceCents)}
                    </p>
                  </div>
                  <strong>{centsToBRL(item.quantity * item.gift.priceCents)}</strong>
                </div>
              ))}
            </div>

            <div className="gift-summary-total">
              <span>{totals.quantity} item(ns)</span>
              <strong>{centsToBRL(totals.subtotalCents)}</strong>
            </div>

            <div className="gift-actions-inline gift-summary-actions" style={{ marginTop: 18 }}>
              <Link
                href="/gifts/customer"
                className="gift-button"
                style={{ textDecoration: "none" }}
              >
                Continuar para seus dados
              </Link>
              <Link
                href="/gifts"
                className="gift-button-secondary gift-summary-secondary-action"
                style={{ textDecoration: "none" }}
              >
                Continuar comprando
              </Link>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
