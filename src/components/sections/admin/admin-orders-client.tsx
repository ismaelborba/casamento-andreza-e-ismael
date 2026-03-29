"use client";

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { centsToBRL } from "@/src/lib/money";
import { formatStatusLabel, statusClassName } from "@/src/components/sections/admin/admin-ui";

type AdminOrderItem = {
  giftId: string;
  giftName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

type AdminOrderRow = {
  orderId: string;
  status: string;
  totalCents: number;
  chargedTotalCents: number | null;
  feeAmountCents: number | null;
  createdAt: string | Date;
  buyerName: string;
  buyerEmail: string;
  buyerMessage: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  installmentCount: number | null;
  invoiceUrl: string | null;
  asaasPaymentId: string | null;
  items: AdminOrderItem[];
};

function formatPaymentMethod(
  method: string | null | undefined,
  installmentCount: number | null | undefined,
) {
  switch (method) {
    case "credit_card":
      return installmentCount && installmentCount > 1 ? `Cartao ${installmentCount}x` : "Cartao";
    case "pix":
      return "Pix";
    case "boleto":
      return "Boleto";
    default:
      return "Ainda nao escolhido";
  }
}

function formatOrderDate(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR");
}

function formatOrderDateParts(value: string | Date) {
  const date = new Date(value);

  return {
    day: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function getOrderTotal(row: AdminOrderRow) {
  return centsToBRL(Number(row.chargedTotalCents ?? row.totalCents));
}

function getOrderItemsCount(items: AdminOrderItem[]) {
  return items.reduce((total, item) => total + Number(item.quantity ?? 0), 0);
}

function OrderDetailsButton({
  row,
  onOpen,
  compact = false,
}: {
  row: AdminOrderRow;
  onOpen: (row: AdminOrderRow) => void;
  compact?: boolean;
}) {
  const itemsCount = getOrderItemsCount(row.items);
  const label =
    itemsCount > 0 ? `${itemsCount} ${itemsCount === 1 ? "presente" : "presentes"}` : "Sem itens";

  return (
    <button
      type="button"
      className={`admin-order-modal-trigger${compact ? " is-compact" : ""}`}
      onClick={() => onOpen(row)}
      aria-label={`Ver detalhes do pedido de ${row.buyerName}`}
      title={`Ver detalhes do pedido de ${row.buyerName}`}
    >
      <Eye size={compact ? 16 : 18} strokeWidth={2} />
      {compact ? null : <span>Ver detalhes</span>}
      <small>{label}</small>
    </button>
  );
}

function MobileOrderCard({
  row,
  onOpen,
}: {
  row: AdminOrderRow;
  onOpen: (row: AdminOrderRow) => void;
}) {
  return (
    <article className="admin-order-card">
      <div className="admin-order-card-head">
        <div>
          <span className="admin-order-card-kicker">Pedido</span>
          <h3>{row.buyerName}</h3>
          <p>{formatOrderDate(row.createdAt)}</p>
        </div>

        <div className="admin-order-card-total">
          <span>Total</span>
          <strong>{getOrderTotal(row)}</strong>
        </div>
      </div>

      <div className="admin-order-card-statuses">
        <div className="admin-order-card-status-group">
          <span className="admin-order-card-label">Pedido</span>
          <span className={statusClassName(row.status)}>{formatStatusLabel(row.status)}</span>
        </div>

        <div className="admin-order-card-status-group">
          <span className="admin-order-card-label">Pagamento</span>
          <span className={statusClassName(row.paymentStatus)}>
            {formatStatusLabel(row.paymentStatus)}
          </span>
        </div>
      </div>

      <div className="admin-order-card-grid">
        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Contato</span>
          <strong>{row.buyerEmail}</strong>
        </div>

        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Metodo</span>
          <strong>{formatPaymentMethod(row.paymentMethod, row.installmentCount)}</strong>
        </div>

        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Asaas</span>
          {row.invoiceUrl ? (
            <a className="admin-link" href={row.invoiceUrl} target="_blank" rel="noreferrer">
              Abrir cobrança
            </a>
          ) : (
            <span className="admin-table-copy">Sem link disponivel</span>
          )}
        </div>

        <div className="admin-order-card-field">
          <span className="admin-order-card-label">Taxa</span>
          <strong>
            {row.feeAmountCents ? centsToBRL(Number(row.feeAmountCents)) : "Sem taxa"}
          </strong>
        </div>
      </div>

      <div className="admin-order-card-actions">
        <OrderDetailsButton row={row} onOpen={onOpen} />
      </div>
    </article>
  );
}

function OrderDetailsModal({
  row,
  onClose,
}: {
  row: AdminOrderRow | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!row) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div
      className="admin-order-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-order-modal-header">
          <div>
            <span className="admin-order-modal-kicker">Detalhes do pedido</span>
            <h3 id="admin-order-modal-title">{row.buyerName}</h3>
            <p>{formatOrderDate(row.createdAt)}</p>
          </div>

          <button
            type="button"
            className="admin-order-modal-close"
            onClick={onClose}
            aria-label="Fechar detalhes do pedido"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="admin-order-modal-grid">
          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Status do pedido</span>
            <span className={statusClassName(row.status)}>{formatStatusLabel(row.status)}</span>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Status do pagamento</span>
            <span className={statusClassName(row.paymentStatus)}>
              {formatStatusLabel(row.paymentStatus)}
            </span>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Metodo</span>
            <strong>{formatPaymentMethod(row.paymentMethod, row.installmentCount)}</strong>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Total</span>
            <strong>{getOrderTotal(row)}</strong>
          </div>
        </div>

        <div className="admin-order-modal-section">
          <span className="admin-order-details-label">Presentes comprados</span>

          {row.items.length > 0 ? (
            <ul className="admin-order-item-list">
              {row.items.map((item) => (
                <li key={`${row.orderId}-${item.giftId}`}>
                  <div>
                    <strong>
                      {item.quantity}x {item.giftName}
                    </strong>
                  </div>
                  <span className="admin-order-item-total">
                    {centsToBRL(Number(item.lineTotalCents))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-order-details-empty">Nenhum presente foi vinculado a este pedido.</p>
          )}
        </div>

        <div className="admin-order-modal-grid">
          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Codigo do pedido</span>
            <strong className="admin-order-id">{row.orderId}</strong>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Contato</span>
            <strong>{row.buyerEmail}</strong>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Mensagem</span>
            <p className="admin-order-details-message">
              {row.buyerMessage ? row.buyerMessage : "Sem mensagem para o casal."}
            </p>
          </div>

          <div className="admin-order-modal-card">
            <span className="admin-order-details-label">Asaas</span>
            {row.invoiceUrl ? (
              <a className="admin-link" href={row.invoiceUrl} target="_blank" rel="noreferrer">
                Abrir cobrança
              </a>
            ) : (
              <span className="admin-table-copy">Sem link disponivel</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersClient({ rows }: { rows: AdminOrderRow[] }) {
  const [selectedRow, setSelectedRow] = useState<AdminOrderRow | null>(null);

  return (
    <>
      <div className="admin-orders-mobile-list">
        {rows.map((row) => (
          <MobileOrderCard key={row.orderId} row={row} onOpen={setSelectedRow} />
        ))}
      </div>

      <div className="admin-table-shell admin-orders-desktop">
        <table className="admin-table">
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Data</th>
              <th>Comprador</th>
              <th>Status do pedido</th>
              <th>Status do pagamento</th>
              <th className="admin-align-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const createdAt = formatOrderDateParts(row.createdAt);
              const itemsCount = getOrderItemsCount(row.items);

              return (
                <tr key={row.orderId} className="admin-orders-row">
                  <td>
                    <div className="admin-order-date-block">
                      <span className="admin-order-date">{createdAt.day}</span>
                      <span className="admin-order-time">
                        {createdAt.time}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-order-customer-block">
                      <span className="admin-table-title">{row.buyerName}</span>
                      <span className="admin-order-customer-meta">{row.buyerEmail}</span>
                      <span className="admin-order-customer-summary">
                        {itemsCount} {itemsCount === 1 ? "presente" : "presentes"}
                        {row.buyerMessage ? " • com mensagem" : ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-order-status-cell">
                      <span className={statusClassName(row.status)}>
                        {formatStatusLabel(row.status)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-order-status-cell">
                      <span className={statusClassName(row.paymentStatus)}>
                        {formatStatusLabel(row.paymentStatus)}
                      </span>
                    </div>
                  </td>
                  <td className="admin-align-right">
                    <div className="admin-order-total-cell">
                      <span className="admin-order-total-value">{getOrderTotal(row)}</span>
                      <OrderDetailsButton row={row} onOpen={setSelectedRow} compact />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </>
  );
}
