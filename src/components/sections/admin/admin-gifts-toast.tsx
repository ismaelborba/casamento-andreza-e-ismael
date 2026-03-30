"use client";

import { GripVertical, X } from "lucide-react";
import { toast } from "sonner";

type ShowAdminGiftReorderedToastArgs = {
  giftName: string;
  position: number;
};

export function showAdminGiftReorderedToast({
  giftName,
  position,
}: ShowAdminGiftReorderedToastArgs) {
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
            <GripVertical size={14} strokeWidth={2.2} />
          </span>

          <div className="site-toast-card-copy">
            <span className="site-toast-card-eyebrow">Painel admin</span>
            <strong title={giftName}>{giftName}</strong>
            <p>Ordem da lista atualizada com sucesso.</p>
            <p>Nova posição: #{position}</p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 4000,
    },
  );
}

export function showAdminGiftReorderErrorToast(message: string) {
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
            <GripVertical size={14} strokeWidth={2.2} />
          </span>

          <div className="site-toast-card-copy">
            <span className="site-toast-card-eyebrow">Painel admin</span>
            <strong>Reordenacao nao aplicada</strong>
            <p>{message}</p>
          </div>
        </div>
      </div>
    ),
    {
      duration: 5000,
    },
  );
}
