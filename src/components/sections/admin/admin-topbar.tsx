export function AdminTopbar({ title }: { title?: string }) {
  return (
    <div className="admin-breadcrumbs">
      <span>Admin</span>
      <span>/</span>
      <strong>{title ?? "Painel"}</strong>
    </div>
  );
}
