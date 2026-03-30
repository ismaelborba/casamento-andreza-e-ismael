"use client";

export function AdminGiftCreateButton() {
  return (
    <button
      type="button"
      className="admin-button"
      onClick={() => window.dispatchEvent(new Event("admin:gifts-create-open"))}
    >
      Cadastrar novo presente
    </button>
  );
}
