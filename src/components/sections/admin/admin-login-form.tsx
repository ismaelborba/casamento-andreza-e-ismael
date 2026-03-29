"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const allowedEmail = "casamento.ismaeleandreza@gmail.com";

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: allowedEmail, password }),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.error ?? "Não foi possível entrar no admin.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Não foi possível entrar no admin.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="password">Senha de acesso</label>
        <input
          id="password"
          className="admin-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
        />
      </div>

      <p className="admin-inline-note">
        Acesso restrito aos responsáveis pelo painel do casamento.
      </p>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <button className="admin-button" type="submit" disabled={submitting}>
        {submitting ? "Entrando..." : "Acessar painel"}
      </button>
    </form>
  );
}
