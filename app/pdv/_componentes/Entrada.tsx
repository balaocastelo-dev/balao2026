"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function Entrada() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch("/api/controle/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      });
      if (!r.ok) {
        setErro("Senha do dia errada. Confira com o gerente.");
        return;
      }
      router.refresh();
    } catch {
      setErro("Sem conexão com o site. Confira a internet do balcão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pdv flex h-full min-h-screen items-center justify-center p-6">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-3xl border border-[var(--linha)] bg-[var(--painel)] p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Balão da Informática" className="h-8 w-auto" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Caixa do balcão</h1>
            <p className="text-sm text-[var(--texto-suave)]">Vendas ligadas ao Bling</p>
          </div>
        </div>
        <label htmlFor="senha" className="mb-2 block text-sm font-semibold">
          Senha do dia
        </label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--texto-suave)]" aria-hidden />
          <input
            id="senha"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-2xl border border-[var(--linha)] bg-[var(--carvao)] py-3.5 pl-11 pr-4 text-lg tracking-widest outline-none focus:border-[var(--vermelho)]"
          />
        </div>
        {erro && (
          <p role="alert" className="mt-3 text-sm font-semibold text-red-300">
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={!senha || enviando}
          className="mt-5 w-full rounded-2xl bg-[var(--vermelho)] py-3.5 font-black text-white shadow-lg shadow-red-950/50 transition active:scale-[0.98] disabled:opacity-50"
        >
          {enviando ? "Conferindo…" : "Abrir o caixa"}
        </button>
        <p className="mt-5 text-xs leading-relaxed text-[var(--texto-suave)]">
          É a mesma senha do controle e do fechamento. Quem já entrou no painel neste computador abre o caixa direto.
        </p>
      </form>
    </div>
  );
}
