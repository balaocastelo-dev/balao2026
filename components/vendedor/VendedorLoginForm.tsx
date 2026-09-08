"use client";

import { FormEvent, useState } from "react";

type VendedorLoginFormProps = {
  slug: string;
  nome: string;
  cargo?: string;
  /** Número da loja, já formatado para leitura. Ex.: "(19) 98751-0267" */
  numeroLoja?: string;
  /** Para onde ir depois de entrar. Ex.: "/brendon/atender". */
  redirectTo?: string;
  /** Falso quando a variável de ambiente da senha ainda não foi definida. */
  senhaConfigurada?: boolean;
  /** Nome dessa variável, para o aviso dizer exatamente o que falta. */
  nomeVariavelSenha?: string;
  /**
   * Rota que confere a senha. A equipe fixa valida contra variável de
   * ambiente; quem foi cadastrado no dashboard valida contra o servidor de
   * atendimento — telas iguais, portas diferentes.
   */
  endpoint?: string;
};

export default function VendedorLoginForm({
  slug,
  nome,
  cargo,
  numeroLoja,
  redirectTo,
  senhaConfigurada = true,
  nomeVariavelSenha,
  endpoint = "/api/vendedor/login",
}: VendedorLoginFormProps) {
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, senha }),
      });

      const dados = (await resposta.json()) as { success?: boolean; error?: string };

      if (!resposta.ok || !dados.success) {
        setErro(dados.error || "Senha incorreta.");
        setSenha("");
        return;
      }

      // Recarrega para o servidor montar a página já autenticada.
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
              Digite sua senha para abrir o atendimento.
            </p>
          </div>

          {!senhaConfigurada && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-bold text-amber-900">
                ⚠️ Acesso ainda não liberado
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                A senha deste vendedor não foi definida na hospedagem, então
                nenhuma senha vai funcionar por enquanto.
                {nomeVariavelSenha && (
                  <>
                    {" "}
                    Quem administra o site precisa criar a variável{" "}
                    <code className="rounded bg-amber-100 px-1 font-mono">
                      {nomeVariavelSenha}
                    </code>
                    .
                  </>
                )}
              </p>
            </div>
          )}

          <form onSubmit={enviar} className="mt-6 space-y-3">
            <div>
              <label
                htmlFor="senha-vendedor"
                className="mb-1.5 block text-xs font-semibold text-[#5f6368]"
              >
                Sua senha
              </label>
              <input
                id="senha-vendedor"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
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
              disabled={carregando || senha.length === 0}
              className="w-full cursor-pointer rounded-lg bg-[#0f9d58] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0a6e3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? "Entrando…" : "Entrar no atendimento"}
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-center">
          <p className="text-[11px] leading-relaxed text-[#5f6368]">
            🎈 <b className="text-[#202124]">Balão da Informática Castelo</b>
            {numeroLoja && (
              <>
                <br />
                Atendimento pelo número da loja <b>{numeroLoja}</b>
              </>
            )}
            <br />
            Cada vendedor entra com a própria senha, no próprio computador.
          </p>
        </div>
      </div>
    </main>
  );
}
