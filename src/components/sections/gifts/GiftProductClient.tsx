"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import { GiftCard } from "@/src/components/sections/gifts/GiftCard";
import { useGiftCart } from "@/src/components/sections/gifts/cart-store";
import type { Gift } from "@/src/components/sections/gifts/shop-types";
import { availableQty } from "@/src/components/sections/gifts/shop-types";
import { centsToBRL } from "@/src/lib/money";

type Props = {
  gift: Gift;
  gifts: Gift[];
};

export function GiftProductClient({ gift, gifts }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addToCart, isInCart, totals } = useGiftCart(gifts);

  const available = availableQty(gift);
  const sold = gift.purchasedQuantity + gift.reservedQuantity;
  const progress = gift.totalQuantity
    ? Math.min(100, Math.round((sold / gift.totalQuantity) * 100))
    : 0;

  const relatedGifts = useMemo(
    () => gifts.filter((item) => item.id !== gift.id).slice(0, 4),
    [gift.id, gifts],
  );

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, available)));
  }, [available]);

  return (
    <div className="gift-detail-shell">
      <GiftCheckoutSteps current="catalog" />

      <nav className="gift-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/gifts">Presentes</Link>
        <span>/</span>
        <strong>{gift.name}</strong>
      </nav>

      {feedback ? <p className="gift-form-success">{feedback}</p> : null}

      <section className="gift-product-layout">
        <div className="gift-product-media-panel">
          <div className="gift-product-main-media">
            {gift.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gift.imageUrl} alt={gift.name} />
            ) : (
              <div className="gift-card-media-fallback">Lista de presentes</div>
            )}
          </div>

          <div className="gift-product-support">
            <article>
              <strong>Compra simbólica e segura</strong>
              <p>Você contribui direto pelo site e o casal recebe a identificação do pedido.</p>
            </article>
            <article>
              <strong>Mensagem para os noivos</strong>
              <p>No próximo passo você pode escrever um recado para acompanhar o presente.</p>
            </article>
          </div>
        </div>

        <div className="gift-product-summary">
          <span className="gift-eyebrow">Página do presente</span>
          <h1>{gift.name}</h1>
          <p className="gift-product-description">
            {gift.description ?? "Um presente pensado com carinho para celebrar esse momento especial."}
          </p>

          <div className="gift-product-price-row">
            <strong>{centsToBRL(gift.priceCents)}</strong>
            <span>por cota</span>
          </div>

          <div className="gift-chip-row">
            <span className="gift-chip">{available} cotas disponíveis</span>
            <span className="gift-chip">{gift.totalQuantity} cotas no total</span>
            <span className="gift-chip">{gift.purchasedQuantity} compradas</span>
          </div>

          <div className="gift-progress">
            <div className="gift-progress-labels">
              <span>{sold} cotas movimentadas</span>
              <span>{progress}% do presente reservado</span>
            </div>
            <div className="gift-progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="gift-product-purchase">
            <div className="gift-product-qty">
              <label htmlFor={`gift-detail-qty-${gift.id}`}>Quantidade</label>
              <input
                id={`gift-detail-qty-${gift.id}`}
                className="gift-input"
                type="number"
                min={1}
                max={Math.max(1, available)}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      Math.max(1, Number(event.target.value) || 1),
                      Math.max(1, available),
                    ),
                  )
                }
              />
            </div>

            <div className="gift-product-actions">
              <button
                type="button"
                className="gift-button"
                disabled={available <= 0}
                onClick={() => {
                  addToCart(gift.id, quantity);
                  setFeedback(`"${gift.name}" foi adicionado ao carrinho.`);
                  window.setTimeout(() => setFeedback(null), 2400);
                }}
              >
                {available <= 0 ? "Presente esgotado" : "Adicionar ao carrinho"}
              </button>

              <Link href="/gifts/cart" className="gift-button-secondary" style={{ textDecoration: "none" }}>
                Ir para o carrinho
              </Link>
            </div>
          </div>

          <div className="gift-product-meta">
            <div>
              <span>Subtotal desta selecao</span>
              <strong>{centsToBRL(quantity * gift.priceCents)}</strong>
            </div>
            <div>
              <span>Carrinho atual</span>
              <strong>
                {totals.quantity} item(ns) · {centsToBRL(totals.subtotalCents)}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{isInCart(gift.id) ? "Já está no carrinho" : "Pronto para adicionar"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="gift-product-info-grid">
        <article className="gift-info-card">
          <span className="gift-eyebrow">Como funciona</span>
          <h2>Fluxo igual a uma compra online.</h2>
          <p>
            Você escolhe o presente, define a quantidade de cotas, adiciona ao carrinho,
            informa seus dados e finaliza o Pix em uma página separada de checkout.
          </p>
        </article>

        <article className="gift-info-card">
          <span className="gift-eyebrow">Detalhes</span>
          <h2>Compra em cotas.</h2>
          <p>
            Cada unidade representa uma cota desse presente. Assim, mais de um convidado
            pode contribuir no mesmo item sem perder a visibilidade da lista.
          </p>
        </article>

        <article className="gift-info-card">
          <span className="gift-eyebrow">Observação</span>
          <h2>Presente com mensagem.</h2>
          <p>
            Depois do carrinho, você ainda pode deixar uma mensagem carinhosa para os
            noivos antes de abrir o checkout Pix.
          </p>
        </article>
      </section>

      {relatedGifts.length ? (
        <section className="gift-related-section">
          <div className="gift-section-heading">
            <div>
              <span className="gift-eyebrow">Mais presentes</span>
              <h2>Continue navegando pela lista</h2>
            </div>
            <Link href="/gifts" className="gift-button-secondary" style={{ textDecoration: "none" }}>
              Ver toda a vitrine
            </Link>
          </div>

          <div className="gift-cards">
            {relatedGifts.map((item) => (
              <GiftCard
                key={item.id}
                gift={item}
                inCart={isInCart(item.id)}
                onAddToCart={(row, nextQuantity) => {
                  addToCart(row.id, nextQuantity);
                  setFeedback(`"${row.name}" foi adicionado ao carrinho.`);
                  window.setTimeout(() => setFeedback(null), 2400);
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
