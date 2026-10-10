"use client";

import { FormEvent, useState } from "react";
import { destinoDentroDoPainel } from "@/lib/painel/voltar";

type PainelLoginFormProps = {
  /**
   * Para onde ir depois de entrar. "atual" devolve a pessoa ao endereço que
   * ela tentou abrir: o do parâmetro `voltar` (posto pela tranca quando o
   * endereço era uma área de dentro do painel) ou, sem ele, a própria página.
   */
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
  const [lembrar, setLembrar] = useState(false);
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
        body: JSON.stringify({ password, lembrar }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error || "Senha incorreta");
        return;
      }

      if (redirectTo === "atual") {
        const voltar = new URLSearchParams(window.location.search).get("voltar");
        window.location.href =
          destinoDentroDoPainel(voltar, window.location.origin) || window.location.pathname;
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setError("Não foi possível entrar no painel agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      <div className="mb-6">
        {badgeLabel ? (
          <p className="mb-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#b8000e]">
            {badgeLabel}
          </p>
        ) : null}
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
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-[#E60012] focus:ring-2 focus:ring-red-100"
            placeholder="Digite a senha"
            required
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            id="painel-lembrar"
            type="checkbox"
            checked={lembrar}
            onChange={(event) => setLembrar(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Manter conectado neste computador por 30 dias
            <span className="block text-xs text-gray-500">
              Necessário para a atualização automática da TechSupri, que roda às 6h pelo seu navegador. Não marque em
              computador de uso público.
            </span>
          </span>
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#E60012] px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Entrando..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
