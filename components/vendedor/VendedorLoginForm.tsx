"use client";

import { FormEvent, useState } from "react";

type VendedorLoginFormProps = {
  slug: string;
  nome: string;
  cargo?: string;
  /** Número da loja, já formatado para leitura. Ex.: "(19) 98751-0267" */
  numeroLoja?: string;
  /** Para onde ir depois de entrar. Ex.: "/gabriel". */
  redirectTo?: string;
};

export default function VendedorLoginForm({
  slug,
  nome,
  cargo,
  numeroLoja,
  redirectTo,
}: VendedorLoginFormProps) {
  const [pin, setPin] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/vendedor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin }),
      });

      const dados = (await resposta.json()) as { success?: boolean; error?: string };

      if (!resposta.ok || !dados.success) {
        setErro(dados.error || "PIN incorreto.");
        setPin("");
        return;
      }

      // Recarrega para o servidor montar o CRM já no nome deste vendedor.
      window.location.href = redirectTo || `/${slug}`;
    } catch {
      setErro("Sem conexão com o servidor. Confira a internet e tente de novo.");
    } finally {
      setCarregando(false);
    }
  };

  const iniciais = nome.trim().charAt(0).toUpperCase();

  return (
    <main className="min-h-screen w-full bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-7 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0f9d58] text-2xl font-bold text-white shadow-sm">
              {iniciais}
            </div>
            <h1 className="mt-4 text-xl font-bold text-[#202124]">Olá, {nome}</h1>
            {cargo && <p className="mt-0.5 text-xs text-[#5f6368]">{cargo}</p>}
            <p className="mt-3 text-sm text-[#5f6368]">
              Digite seu PIN para abrir o atendimento.
            </p>
          </div>

          <form onSubmit={enviar} className="mt-6 space-y-3">
            <div>
              <label
                htmlFor="pin-vendedor"
                className="mb-1.5 block text-xs font-semibold text-[#5f6368]"
              >
                PIN
              </label>
              <input
                id="pin-vendedor"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••"
                className="w-full rounded-lg border border-[#e3e3e3] px-3 py-2.5 text-center text-lg tracking-widest outline-none transition-colors focus:border-[#0f9d58]"
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando || pin.length < 4}
              className="w-full cursor-pointer rounded-lg bg-[#0f9d58] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0a6e3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? "Entrando…" : "Entrar no atendimento"}
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-center">
          <p className="text-[11px] leading-relaxed text-[#5f6368]">
            🎈 <b className="text-[#202124]">Balão da Informática Anchieta</b>
            {numeroLoja && (
              <>
                <br />
                Atendimento pelo número da loja <b>{numeroLoja}</b>
              </>
            )}
            <br />
            Cada vendedor entra com o próprio PIN, no próprio computador.
          </p>
        </div>
      </div>
    </main>
  );
}
