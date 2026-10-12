"use client";

import { useCallback, useEffect, useState } from "react";
import type { PonteComando, EstadoDoAgente, RespostaDoAgente } from "./tipos";
import { Indicador, Secao, Vazio } from "./graficos";

// JUL.IA no Centro de Comando: a chave liga/desliga, quem ela atende e o que
// ela está fazendo. Quem pensa é o PC do Thiago (scripts/agente-local); a VPS
// só decide quando ela pode falar. Por isso o primeiro cartão é "o PC está de pé?".

const MODOS: { chave: EstadoDoAgente["config"]["modo"]; rotulo: string; ajuda: string }[] = [
  { chave: "desligado", rotulo: "Desligada", ajuda: "Não responde nem sugere nada." },
  { chave: "copiloto", rotulo: "Copiloto", ajuda: "Escreve a resposta e o vendedor aprova com um clique." },
  { chave: "automatico", rotulo: "Automático", ajuda: "Responde sozinha as conversas sem vendedor." },
];

const SITUACAO: Record<string, { rotulo: string; cor: string }> = {
  ativo: { rotulo: "JUL.IA atendendo", cor: "bg-[#e7f6ec] text-[#0a6e3d]" },
  humano: { rotulo: "com vendedor", cor: "bg-[#eef2fb] text-[#3b6fd4]" },
  transferida: { rotulo: "pediu vendedor", cor: "bg-[#fdf1e8] text-[#a8471a]" },
};

const ICONE_DA_ATIVIDADE: Record<string, string> = {
  resposta: "💬",
  sugestao: "📝",
  orcamento: "🧾",
  venda: "🛒",
  transferencia: "🙋",
  erro: "⚠️",
  pausa: "⏸️",
  retomada: "▶️",
  config: "⚙️",
};

function haQuanto(ms: number | null | undefined) {
  if (!ms) return "nunca";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `há ${s} s`;
  if (s < 3600) return `há ${Math.round(s / 60)} min`;
  return `há ${Math.round(s / 3600)} h`;
}

function resumoDaResposta(r: RespostaDoAgente) {
  return r.tipo === "texto" ? r.texto : `🏷️ ${r.nome || `produto ${r.produtoId}`} (foto, preço e link)`;
}

export default function Agente({ ponte }: { ponte: PonteComando }) {
  const [estado, setEstado] = useState<EstadoDoAgente | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const r = await ponte.chamar<{ agente: EstadoDoAgente }>("/api/comando/agente");
      setEstado(r.agente);
      setErro("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui falar com o servidor da loja.");
    }
  }, [ponte]);

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 5000);
    return () => clearInterval(t);
  }, [carregar]);

  const mudar = async (patch: Partial<EstadoDoAgente["config"]>) => {
    if (patch.publico === "clientes" && !confirm("A JUL.IA vai responder CLIENTES de verdade (só conversas sem vendedor). Conferiu como ela conversa com o seu número?")) return;
    setSalvando(true);
    try {
      await ponte.chamar("/api/comando/agente", { method: "PUT", body: JSON.stringify(patch) });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui mudar.");
    } finally {
      setSalvando(false);
    }
  };

  const acao = async (caminho: string) => {
    try {
      await ponte.chamar(caminho, { method: "POST", body: "{}" });
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu certo.");
    }
  };

  if (!estado) {
    return (
      <div className="space-y-4">
        {erro ? (
          <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">{erro}</div>
        ) : (
          <Vazio texto="Carregando a JUL.IA…" />
        )}
      </div>
    );
  }

  const { config, trabalhador: pc, hoje } = estado;
  const info = pc.info || {};

  return (
    <div className="space-y-4">
      {erro && <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">{erro}</div>}

      <Secao
        titulo="🤖 JUL.IA — vendedora digital"
        ajuda="Entende texto, áudio, foto e vídeo do cliente, sugere só produtos do site, emite orçamento e pedido no Bling. Roda no computador da loja, sem serviço pago."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <div
            data-testid="estado-do-pc"
            className={`rounded-xl border p-3 ${pc.online ? "border-[#0f9d58]/40 bg-[#e7f6ec]" : "border-[#c2571a]/40 bg-[#fdf1e8]"}`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">Computador da loja</div>
            <div className={`mt-1 text-lg font-bold ${pc.online ? "text-[#0a6e3d]" : "text-[#a8471a]"}`}>
              {pc.online ? "No ar" : "Fora do ar"}
            </div>
            <div className="mt-1 space-y-0.5 text-[11px] text-[#5f6368]">
              {pc.online ? (
                <>
                  <div>
                    Modelo {info.modelo || "?"}
                    {info.modeloNaPlaca ? " (carregado na placa)" : ""} · último sinal {haQuanto(pc.ultimaBatida)}
                  </div>
                  {info.catalogo && <div>Catálogo: {Number(info.catalogo.produtos || 0).toLocaleString("pt-BR")} produtos do site</div>}
                  {info.esperando && <div className="font-semibold text-[#a8471a]">Esperando a placa de vídeo: {info.esperando}</div>}
                </>
              ) : (
                <div>
                  Último sinal {haQuanto(pc.ultimaBatida)}. Com o PC desligado ninguém é respondido pela JUL.IA: as conversas
                  ficam para os vendedores, como sempre.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#e3e3e3] bg-white p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#5f6368]">Modo</div>
            <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Modo da JUL.IA">
              {MODOS.map((m) => (
                <button
                  key={m.chave}
                  type="button"
                  role="radio"
                  aria-checked={config.modo === m.chave}
                  disabled={salvando}
                  onClick={() => config.modo !== m.chave && mudar({ modo: m.chave })}
                  title={m.ajuda}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
                    config.modo === m.chave
                      ? m.chave === "desligado"
                        ? "bg-[#5f6368] text-white"
                        : "bg-[#0f9d58] text-white"
                      : "border border-[#e3e3e3] text-[#5f6368] hover:bg-[#f0f2f5]"
                  }`}
                >
                  {m.rotulo}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-[#5f6368]">{MODOS.find((m) => m.chave === config.modo)?.ajuda}</p>

            <div className="mt-3 space-y-2 text-xs">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={config.publico === "teste"}
                  disabled={salvando}
                  onChange={(e) => mudar({ publico: e.target.checked ? "teste" : "clientes" })}
                />
                <span>
                  <b>Só os números de teste</b> ({estado.numerosDeTeste.join(" e ")})
                  <span className="block text-[11px] text-[#5f6368]">
                    {config.publico === "teste"
                      ? "Clientes não recebem nada. No teste o Bling é simulado (nada entra no relatório)."
                      : "Atende clientes de verdade nas conversas sem vendedor."}
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={config.vendaAutomatica}
                  disabled={salvando}
                  onChange={(e) => mudar({ vendaAutomatica: e.target.checked })}
                />
                <span>
                  <b>Fechar venda sozinha</b>
                  <span className="block text-[11px] text-[#5f6368]">
                    {config.vendaAutomatica
                      ? "Com o \"sim\" do cliente e os dados completos, o pedido entra no Bling em aberto e você é avisado."
                      : "Quando o cliente quiser fechar, ela chama um vendedor."}
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </Secao>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Indicador titulo="Respostas hoje" valor={String(hoje?.resposta ?? 0)} />
        <Indicador titulo="Orçamentos" valor={String(hoje?.orcamento ?? 0)} />
        <Indicador titulo="Vendas" valor={String(hoje?.venda ?? 0)} destaque={Boolean(hoje?.venda)} />
        <Indicador titulo="Chamou vendedor" valor={String(hoje?.transferencia ?? 0)} />
        <Indicador titulo="Agora" valor={String(estado.pensando.length)} detalhe={estado.pensando.length ? "pensando" : `${estado.fila} na fila`} />
      </div>

      {estado.sugestoes.length > 0 && (
        <Secao titulo="📝 Sugestões esperando um vendedor" ajuda="Modo copiloto: a JUL.IA escreveu, alguém aprova.">
          <ul className="space-y-2">
            {estado.sugestoes.map((s) => (
              <li key={s.id} className="rounded-lg border border-[#e3e3e3] p-2 text-xs">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <button type="button" className="cursor-pointer font-bold text-[#3b6fd4] hover:underline" onClick={() => ponte.abrirConversa?.(s.chatId)}>
                    {s.nome || s.chatId.split("@")[0]}
                  </button>
                  <span className="text-[11px] text-[#5f6368]">{haQuanto(s.criadaEm)}</span>
                </div>
                {s.respostas.map((r, i) => (
                  <p key={i} className="whitespace-pre-wrap text-[#202124]">
                    {resumoDaResposta(r)}
                  </p>
                ))}
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => acao(`/api/comando/agente/sugestoes/${encodeURIComponent(s.id)}/enviar`)} className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1 text-xs font-bold text-white">
                    Enviar
                  </button>
                  <button type="button" onClick={() => acao(`/api/comando/agente/sugestoes/${encodeURIComponent(s.id)}/descartar`)} className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1 text-xs font-bold text-[#5f6368]">
                    Descartar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Secao>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Secao titulo="Conversas" ajuda="As que a JUL.IA tocou. Vendedor que responde ou pega a conversa tira a JUL.IA na hora.">
          {estado.conversas.length === 0 ? (
            <Vazio texto="Nenhuma conversa ainda." />
          ) : (
            <ul className="divide-y divide-[#f0f2f5]">
              {estado.conversas.map((c) => {
                const sit = SITUACAO[c.situacao] || SITUACAO.ativo;
                return (
                  <li key={c.chatId} className="flex items-center justify-between gap-2 py-2 text-xs">
                    <div className="min-w-0">
                      <button type="button" className="cursor-pointer truncate font-bold text-[#202124] hover:underline" onClick={() => ponte.abrirConversa?.(c.chatId)}>
                        {c.nome || c.numero || c.chatId.split("@")[0]}
                      </button>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sit.cor}`}>{sit.rotulo}</span>
                        {c.motivo && <span className="truncate text-[11px] text-[#5f6368]">{c.motivo}</span>}
                      </div>
                    </div>
                    {c.situacao === "ativo" ? (
                      <button type="button" onClick={() => acao(`/api/comando/agente/conversas/${encodeURIComponent(c.chatId)}/pausar`)} className="shrink-0 cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 text-[11px] font-bold text-[#5f6368]">
                        Pausar
                      </button>
                    ) : (
                      <button type="button" onClick={() => acao(`/api/comando/agente/conversas/${encodeURIComponent(c.chatId)}/retomar`)} className="shrink-0 cursor-pointer rounded-lg border border-[#0f9d58]/40 px-2 py-1 text-[11px] font-bold text-[#0a6e3d]">
                        Devolver à JUL.IA
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

        <Secao titulo="O que ela fez" ajuda="Últimas ações (desde que o servidor ligou).">
          {estado.recentes.length === 0 ? (
            <Vazio texto="Nada ainda." />
          ) : (
            <ul className="space-y-1.5">
              {estado.recentes.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span>{ICONE_DA_ATIVIDADE[r.tipo] || "•"}</span>
                  <span className="min-w-0 flex-1">
                    {r.nome && <b className="mr-1">{r.nome}</b>}
                    <span className="text-[#5f6368]">{r.texto}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-[#9aa0a6]">{haQuanto(r.em)}</span>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>

      <Secao
        titulo="Como o computador entra no ar"
        ajuda="No PowerShell, de qualquer pasta. Para atualizar, repita os passos 1 e 3."
      >
        <ol className="list-decimal space-y-1 pl-5 text-xs text-[#202124]">
          <li>
            Trazer o projeto para o PC: <code>{"git -C $HOME\\balao2026 pull"}</code> (na primeira vez:{" "}
            <code>{"git clone --depth 1 https://github.com/balaocastelo-dev/balao2026.git $HOME\\balao2026"}</code>).
          </li>
          <li>
            Só na primeira vez: <code>{"& $HOME\\balao2026\\whatsapp-server\\deploy-evo.ps1 -Agente"}</code> (traz o
            segredo da VPS para o PC; pede a senha de root).
          </li>
          <li>
            <code>{"& $HOME\\balao2026\\scripts\\agente-local\\instalar.ps1"}</code> (instala ou atualiza e liga a tarefa
            &quot;JUL.IA&quot;, que volta sozinha com o Windows).
          </li>
          <li>
            Teste no terminal, sem WhatsApp:{" "}
            <code>{"& $HOME\\balao-agente\\.venv\\Scripts\\python.exe $HOME\\balao-agente\\julia.py --conversar"}</code>.
          </li>
          <li>Aqui: modo Automático com &quot;Só os números de teste&quot;, e mande mensagem do seu celular pessoal para a loja.</li>
        </ol>
      </Secao>
    </div>
  );
}
