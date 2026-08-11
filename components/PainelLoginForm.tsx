"use client";

import { FormEvent, useState } from "react";

type PainelLoginFormProps = {
  redirectTo?: string;
  badgeLabel?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

export default function PainelLoginForm({
  redirectTo = "/painel",
  badgeLabel = "Painel Protegido",
  title = "Acesso ao painel",
  description = "Entre com a senha para abrir o painel interno em /painel.",
  submitLabel = "Entrar no painel",
}: PainelLoginFormProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/painel/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error || "Senha incorreta");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("Nao foi possivel entrar no painel agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      <div className="mb-6">
        <p className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {badgeLabel}
        </p>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="painel-password" className="mb-2 block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="painel-password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Digite a senha"
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Entrando..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
