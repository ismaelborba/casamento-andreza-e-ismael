"use client";

import { ShoppingBag } from "lucide-react";
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

  toast(
    <div className="site-toast-copy">
      <span className="site-toast-eyebrow">Lista de presentes</span>
      <strong>{giftName}</strong>
    </div>,
    {
      description: `${quantityLabel} ${actionLabel} ao carrinho. Subtotal desta selecao: ${centsToBRL(subtotalCents)}.`,
      icon: <ShoppingBag size={16} strokeWidth={2.2} />,
      duration: 5000,
      action: {
        label: "Ver carrinho",
        onClick: onViewCart,
      },
    },
  );
}
