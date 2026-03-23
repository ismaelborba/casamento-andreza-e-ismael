"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);

    try {
      await fetch("/api/admin/session", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      className="admin-button-secondary"
      type="button"
      onClick={handleLogout}
      disabled={submitting}
    >
      {submitting ? "Saindo..." : "Sair"}
    </button>
  );
}
