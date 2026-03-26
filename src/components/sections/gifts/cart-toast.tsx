"use client";

import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { centsToBRL } from "@/src/lib/money";

type ShowGiftAddedToastArgs = {
  giftName: string;
  quantity: number;
  subtotalCents: number;
  onViewCart: () => void;
};

export function showGiftAddedToast({
  giftName,
  quantity,
  subtotalCents,
  onViewCart,
}: ShowGiftAddedToastArgs) {
  const quantityLabel = `${quantity} cota${quantity > 1 ? "s" : ""}`;
  const actionLabel = quantity > 1 ? "foram adicionadas" : "foi adicionada";

  toast.custom(
    (toastId) => (
      <div className="site-toast-card">
        <button
          type="button"
          className="site-toast-dismiss"
          aria-label="Fechar aviso"
          onClick={() => toast.dismiss(toastId)}
        >
          <X size={14} />
        </button>

        <div className="site-toast-card-main">
          <span className="site-toast-card-icon" aria-hidden="true">
            <ShoppingBag size={14} strokeWidth={2.2} />
          </span>

          <div className="site-toast-card-copy">
            <span className="site-toast-card-eyebrow">Lista de presentes</span>
            <strong title={giftName}>{giftName}</strong>
            <p>
              {quantityLabel} {actionLabel} ao carrinho.
            </p>
            <p>Subtotal: {centsToBRL(subtotalCents)}</p>
          </div>
        </div>

        <button
          type="button"
          className="site-toast-card-action"
          onClick={() => {
            toast.dismiss(toastId);
            onViewCart();
          }}
        >
          Ver carrinho
        </button>
      </div>
    ),
    {
      duration: 5000,
    },
  );
}
