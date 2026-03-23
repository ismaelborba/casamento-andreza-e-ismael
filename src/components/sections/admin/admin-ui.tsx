import type { ReactNode } from "react";

type HeaderProps = {
  kicker: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  kicker,
  title,
  description,
  actions,
}: HeaderProps) {
  return (
    <header className="admin-page-header">
      <div>
        <span className="admin-kicker">{kicker}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {actions ? <div className="admin-actions-inline">{actions}</div> : null}
    </header>
  );
}

type MetricProps = {
  label: string;
  value: string;
  copy: string;
};

export function AdminMetricCard({ label, value, copy }: MetricProps) {
  return (
    <article className="admin-card">
      <span className="admin-metric-label">{label}</span>
      <strong className="admin-metric-value">{value}</strong>
      <p className="admin-metric-copy">{copy}</p>
    </article>
  );
}

export function statusClassName(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase();

  if (["paid", "active", "confirmed", "sim"].includes(normalized)) {
    return "admin-status is-paid";
  }

  if (["pending"].includes(normalized)) {
    return "admin-status is-pending";
  }

  if (["canceled", "cancelled", "failed", "expired", "inactive", "nao"].includes(normalized)) {
    return "admin-status is-canceled";
  }

  return "admin-status is-neutral";
}

export function formatStatusLabel(status: string | null | undefined) {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
      return "Pago";
    case "pending":
      return "Pendente";
    case "failed":
      return "Falhou";
    case "canceled":
      return "Cancelado";
    case "refunded":
      return "Estornado";
    case "expired":
      return "Expirado";
    case "active":
      return "Ativo";
    case "inactive":
      return "Inativo";
    default:
      return status ?? "-";
  }
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return <div className="admin-empty">{children}</div>;
}
