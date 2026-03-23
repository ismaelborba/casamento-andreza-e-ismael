"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { centsToBRL } from "@/src/lib/money";
import type { Gift } from "@/src/components/sections/gifts/shop-types";
import { availableQty } from "@/src/components/sections/gifts/shop-types";

type Props = {
  gift: Gift;
  highlighted?: boolean;
  inCart?: boolean;
  onAddToCart: (gift: Gift, quantity: number) => void;
};

export function GiftCard({ gift, highlighted, inCart, onAddToCart }: Props) {
  const available = availableQty(gift);
  const sold = gift.purchasedQuantity + gift.reservedQuantity;
  const progress = gift.totalQuantity
    ? Math.min(100, Math.round((sold / gift.totalQuantity) * 100))
    : 0;

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, available)));
  }, [available]);

  function updateQuantity(next: number) {
    setQuantity(Math.min(Math.max(1, next), Math.max(1, available)));
  }

  return (
    <article className={`gift-card ${highlighted ? "is-highlighted" : ""}`}>
      <Link href={`/gifts/${gift.id}`} className="gift-card-media">
        {gift.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gift.imageUrl} alt={gift.name} />
        ) : (
          <div className="gift-card-media-fallback">Lista de presentes</div>
        )}
      </Link>

      <div className="gift-card-body">
        <div className="gift-card-header-row">
          {progress > 0 ? <span className="gift-card-badge">{progress}% reservado</span> : <span className="gift-card-badge is-muted">Disponivel</span>}
          <span className="gift-price">{centsToBRL(gift.priceCents)}</span>
        </div>

        <div className="gift-card-top">
          <div>
            <Link href={`/gifts/${gift.id}`} className="gift-card-title-link">
              <h3>{gift.name}</h3>
            </Link>
            <p className="gift-card-description">
              {gift.description ?? "Um presente pensado com carinho para celebrar com a gente."}
            </p>
          </div>
        </div>

        <div className="gift-chip-row">
          <span className="gift-chip">{available} cotas disponíveis</span>
          <span className="gift-chip">{gift.totalQuantity} no total</span>
        </div>

        <div className="gift-progress">
          <div className="gift-progress-labels">
            <span>Andamento do presente</span>
            <span>{progress}% movimentado</span>
          </div>
          <div className="gift-progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="gift-card-meta-grid">
          <div className="gift-card-meta-item">
            <strong>{gift.purchasedQuantity}</strong>
            <span>Compradas</span>
          </div>
          <div className="gift-card-meta-item">
            <strong>{gift.reservedQuantity}</strong>
            <span>Reservadas</span>
          </div>
          <div className="gift-card-meta-item">
            <strong>{available}</strong>
            <span>Disponiveis</span>
          </div>
        </div>

        <div className="gift-card-purchase">
          <label htmlFor={`gift-qty-${gift.id}`}>Quantidade</label>
          <div className="gift-qty-row">
            <div className="gift-qty-control">
              <button
                type="button"
                className="gift-qty-step"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Diminuir quantidade de ${gift.name}`}
              >
                -
              </button>
              <input
                id={`gift-qty-${gift.id}`}
                className="gift-input gift-qty-value"
                type="number"
                min={1}
                max={Math.max(1, available)}
                value={quantity}
                onChange={(event) => updateQuantity(Number(event.target.value) || 1)}
              />
              <button
                type="button"
                className="gift-qty-step"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= Math.max(1, available)}
                aria-label={`Aumentar quantidade de ${gift.name}`}
              >
                +
              </button>
            </div>

            <div className="gift-card-actions">
              <button
                className="gift-button gift-card-primary-button"
                type="button"
                onClick={() => onAddToCart(gift, quantity)}
                disabled={available <= 0}
              >
                {available <= 0 ? "Esgotado" : inCart ? "Adicionar mais" : "Adicionar ao carrinho"}
              </button>

              <Link
                href={`/gifts/${gift.id}`}
                className="gift-card-secondary-link"
                style={{ textDecoration: "none" }}
              >
                Ver detalhes
              </Link>
            </div>
          </div>

          <div className="gift-card-subtotal">
            <span>Subtotal desta selecao</span>
            <strong>{centsToBRL(quantity * gift.priceCents)}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
