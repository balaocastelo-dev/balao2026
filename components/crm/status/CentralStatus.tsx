"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import EditorStatus from "./EditorStatus";
import EditorRecorrencia from "./EditorRecorrencia";
import VisualizadorStatus from "./VisualizadorStatus";
import CalendarioStatus from "./CalendarioStatus";
import type {
  EntradaHistorico,
  PonteStatus,
  RegraRecorrencia,
  StatusAgendamento,
  StatusConteudo,
  StatusExecucao,
  StatusRecebido,
  StatusResumo,
} from "./tipos";
import {
  ROTULO_ACAO,
  SITUACAO_EXECUCAO,
  copiarRegra,
  formatarDataCurta,
  formatarQuando,
  usuarioLegivel,
} from "./util";

type Aba = "ver" | "central" | "calendario" | "biblioteca" | "historico" | "config";
type SubAba = "programados" | "publicados" | "recorrentes" | "pausados" | "falharam" | "finalizados";

interface EstadoEditor {
  inicial?: StatusConteudo | null;
  quando: "agora" | "agendar" | "rascunho";
  regra?: RegraRecorrencia;
  somenteBiblioteca?: boolean;
}

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "ver", rotulo: "Status dos contatos" },
  { id: "central", rotulo: "Central" },
  { id: "calendario", rotulo: "Calendário" },
  { id: "biblioteca", rotulo: "Biblioteca" },
  { id: "historico", rotulo: "Histórico" },
  { id: "config", rotulo: "Configurações" },
];

function Miniatura({ c, ponte }: { c: StatusConteudo | undefined; ponte: PonteStatus }) {
  if (!c) return <span className="w-12 h-16 rounded-md bg-[#f0f2f5] shrink-0" />;
  if (c.tipo === "texto") {
    return (
      <span
        className="w-12 h-16 rounded-md shrink-0 text-white text-[7px] leading-tight p-1 overflow-hidden flex items-center justify-center text-center"
        style={{ backgroundColor: c.corFundo }}
      >
        {c.texto.slice(0, 60)}
      </span>
    );
  }
  return c.tipo === "video" ? (
    <video src={ponte.urlMidia(c.midia)} className="w-12 h-16 rounded-md object-cover bg-black shrink-0" muted preload="metadata" />
  ) : (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={ponte.urlMidia(c.midia)} alt="" className="w-12 h-16 rounded-md object-cover bg-black shrink-0" loading="lazy" />
  );
}

function Chip({ children, cor }: { children: React.ReactNode; cor: string }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cor}`}>{children}</span>;
}

export default function CentralStatus({ ponte, aoFechar }: { ponte: PonteStatus; aoFechar: () => void }) {
  const [aba, setAba] = useState<Aba>("central");
  const [sub, setSub] = useState<SubAba>("programados");
  const [resumo, setResumo] = useState<StatusResumo | null>(null);
  const [recebidos, setRecebidos] = useState<StatusRecebido[]>([]);
  const [historico, setHistorico] = useState<EntradaHistorico[]>([]);
  const [filtroHistorico, setFiltroHistorico] = useState<string | null>(null);
  const [editor, setEditor] = useState<EstadoEditor | null>(null);
  const [reagendando, setReagendando] = useState<{ ag: StatusAgendamento; regra: RegraRecorrencia } | null>(null);
  const [categoriaBib, setCategoriaBib] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  const carregarResumo = useCallback(async () => {
    try {
      setResumo(await ponte.chamar<StatusResumo>("/api/status/resumo"));
      setErro(null);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, [ponte]);

  const carregarRecebidos = useCallback(async () => {
    try {
      const r = await ponte.chamar<{ itens: StatusRecebido[] }>("/api/status/recebidos");
      setRecebidos(r.itens);
    } catch {
      /* a aba mostra vazio */
    }
  }, [ponte]);

  const carregarHistorico = useCallback(async () => {
    const q = filtroHistorico ? `?conteudo=${filtroHistorico}&limite=300` : "?limite=300";
    const r = await ponte.chamar<{ itens: EntradaHistorico[] }>(`/api/status/historico${q}`).catch(() => ({ itens: [] }));
    setHistorico(r.itens);
  }, [ponte, filtroHistorico]);

  useEffect(() => {
    carregarResumo();
    carregarRecebidos();
  }, [carregarResumo, carregarRecebidos]);

  useEffect(() => {
    if (aba === "historico") carregarHistorico();
  }, [aba, carregarHistorico]);

  // Atualiza sozinho quando o servidor avisa (outro atendente, agendador…).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const agendar = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => {
        carregarResumo();
        if (aba === "historico") carregarHistorico();
      }, 400);
    };
    const desligar1 = ponte.ouvir("status:mudou", agendar);
    const desligar2 = ponte.ouvir("status:recebido", () => carregarRecebidos());
    return () => {
      desligar1();
      desligar2();
      if (t) clearTimeout(t);
    };
  }, [ponte, aba, carregarResumo, carregarRecebidos, carregarHistorico]);

  const conteudoPorId = useMemo(() => new Map((resumo?.conteudos || []).map((c) => [c.id, c])), [resumo]);

  const listas = useMemo(() => {
    const ags = resumo?.agendamentos || [];
    const ex = resumo?.execucoes || [];
    return {
      programados: ags.filter((a) => a.situacao === "ativo" && !a.recorrente),
      recorrentes: ags.filter((a) => a.situacao === "ativo" && a.recorrente),
      pausados: ags.filter((a) => a.situacao === "pausado"),
      finalizados: ags.filter((a) => a.situacao === "finalizado" || a.situacao === "cancelado"),
      publicados: ex.filter((e) => e.situacao === "publicado"),
      falharam: ex.filter((e) => ["falhou", "incerto", "perdido"].includes(e.situacao)),
    };
  }, [resumo]);

  const executar = async (rotulo: string, fn: () => Promise<unknown>, sucesso?: string) => {
    setOcupado(rotulo);
    try {
      await fn();
      if (sucesso) ponte.avisar(sucesso);
      await carregarResumo();
    } catch (e) {
      ponte.avisar(`⚠️ ${(e as Error).message}`);
    } finally {
      setOcupado(null);
    }
  };

  const alterarAg = (ag: StatusAgendamento, corpo: Record<string, unknown>, msg: string) =>
    executar(`ag-${ag.id}`, () => ponte.chamar(`/api/status/agendamentos/${ag.id}`, { method: "PATCH", body: JSON.stringify(corpo) }), msg);

  const publicarJa = (c: StatusConteudo) =>
    executar(
      `pub-${c.id}`,
      async () => {
        const { resultado } = await ponte.chamar<{ resultado: { situacao: string; erro: string | null } }>(
          `/api/status/conteudos/${c.id}/publicar`,
          { method: "POST", body: "{}" }
        );
        if (resultado.situacao !== "publicado") throw new Error(resultado.erro || "Não publicado.");
      },
      "✅ Status publicado."
    );

  const duplicar = (c: StatusConteudo, comoModelo = false) =>
    executar(
      `dup-${c.id}`,
      () => ponte.chamar(`/api/status/conteudos/${c.id}/duplicar`, { method: "POST", body: JSON.stringify({ comoModelo }) }),
      comoModelo ? "📚 Salvo na biblioteca." : "Status duplicado."
    );

  const excluir = (c: StatusConteudo) => {
    if (!confirm(`Excluir "${c.titulo}"? Os agendamentos dele serão cancelados.`)) return;
    executar(`del-${c.id}`, () => ponte.chamar(`/api/status/conteudos/${c.id}`, { method: "DELETE" }), "Status excluído.");
  };

  const tentarDeNovo = (e: StatusExecucao) => {
    if (e.situacao === "incerto" && !confirm("O resultado anterior é incerto: o status pode já ter saído. Conferiu no celular e quer publicar de novo?")) return;
    executar(
      `ret-${e.id}`,
      async () => {
        const { resultado } = await ponte.chamar<{ resultado: { situacao: string; erro: string | null } }>(
          `/api/status/execucoes/${e.id}/tentar-novamente`,
          { method: "POST", body: "{}" }
        );
        if (resultado.situacao !== "publicado") throw new Error(resultado.erro || "Falhou de novo.");
      },
      "✅ Publicado na nova tentativa."
    );
  };

  const abrirHistoricoDe = (conteudoId: string) => {
    setFiltroHistorico(conteudoId);
    setAba("historico");
  };

  const alertas = resumo?.alertas;
  const contagem: Record<SubAba, number> = {
    programados: listas.programados.length,
    recorrentes: listas.recorrentes.length,
    pausados: listas.pausados.length,
    publicados: listas.publicados.length,
    falharam: listas.falharam.length,
    finalizados: listas.finalizados.length,
  };
  const naoVistos = recebidos.filter((r) => !r.vistoEm).length;

  // ------------------------------------------------------------- linhas
  const linhaAgendamento = (ag: StatusAgendamento) => {
    const c = conteudoPorId.get(ag.conteudoId);
    const ocupadoAqui = ocupado === `ag-${ag.id}`;
    return (
      <li key={ag.id} className="flex gap-3 py-3 border-b border-[#eef0ee]">
        <Miniatura c={c} ponte={ponte} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-[#202124] truncate">{c?.titulo || "Status excluído"}</span>
            {ag.recorrente && <Chip cor="bg-violet-100 text-violet-800">↻ recorrente</Chip>}
            {c?.campanha && <Chip cor="bg-rose-100 text-rose-800">{c.campanha}</Chip>}
            {c?.categoria && <Chip cor="bg-[#f0f2f5] text-[#3c4043]">{c.categoria}</Chip>}
          </div>
          <p className="text-xs text-[#5f6368] truncate">{c?.texto || (c?.tipo === "texto" ? "" : "Foto/vídeo")}</p>
          <p className="text-xs text-[#3c4043] mt-0.5">
            {ag.descricao}
            {ag.situacao === "ativo" && ag.proximaEm && (
              <>
                {" · "}
                <b>próxima: {formatarQuando(ag.proximaEm)}</b>
              </>
            )}
            {ag.situacao === "pausado" && " · pausado"}
            {ag.situacao === "finalizado" && " · finalizado"}
            {ag.situacao === "cancelado" && " · cancelado"}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs font-semibold">
            {c && (
              <button onClick={() => setEditor({ inicial: c, quando: "rascunho" })} className="text-[#0a6e3d] hover:underline cursor-pointer">
                Editar
              </button>
            )}
            {c && (
              <button onClick={() => duplicar(c)} className="text-[#0a6e3d] hover:underline cursor-pointer">
                Duplicar
              </button>
            )}
            {ag.situacao === "ativo" && (
              <button disabled={ocupadoAqui} onClick={() => alterarAg(ag, { situacao: "pausado" }, "Pausado.")} className="text-amber-700 hover:underline cursor-pointer">
                Pausar
              </button>
            )}
            {(ag.situacao === "pausado" || ag.situacao === "finalizado" || ag.situacao === "cancelado") && ag.recorrente && (
              <button disabled={ocupadoAqui} onClick={() => alterarAg(ag, { situacao: "ativo" }, "Reativado.")} className="text-[#0a6e3d] hover:underline cursor-pointer">
                Reativar
              </button>
            )}
            <button onClick={() => setReagendando({ ag, regra: copiarRegra(ag.regra) })} className="text-[#0a6e3d] hover:underline cursor-pointer">
              Reagendar
            </button>
            {c && (
              <button disabled={ocupado === `pub-${c.id}`} onClick={() => publicarJa(c)} className="text-[#0a6e3d] hover:underline cursor-pointer">
                {ocupado === `pub-${c.id}` ? "Publicando…" : "Publicar agora"}
              </button>
            )}
            {c && (
              <button onClick={() => duplicar(c, true)} className="text-[#0a6e3d] hover:underline cursor-pointer">
                Salvar como modelo
              </button>
            )}
            {c && (
              <button onClick={() => abrirHistoricoDe(c.id)} className="text-[#5f6368] hover:underline cursor-pointer">
                Histórico
              </button>
            )}
            {(ag.situacao === "ativo" || ag.situacao === "pausado") && (
              <button
                disabled={ocupadoAqui}
                onClick={() => confirm("Cancelar este agendamento?") && alterarAg(ag, { situacao: "cancelado" }, "Agendamento cancelado.")}
                className="text-[#b3261e] hover:underline cursor-pointer"
              >
                Cancelar
              </button>
            )}
            {c && (
              <button onClick={() => excluir(c)} className="text-[#b3261e] hover:underline cursor-pointer">
                Excluir
              </button>
            )}
          </div>
        </div>
      </li>
    );
  };

  const linhaExecucao = (e: StatusExecucao) => {
    const c = conteudoPorId.get(e.conteudoId);
    const s = SITUACAO_EXECUCAO[e.situacao] || { rotulo: e.situacao, cor: "bg-gray-100" };
    return (
      <li key={e.id} className="flex gap-3 py-3 border-b border-[#eef0ee]">
        <Miniatura c={c} ponte={ponte} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sm text-[#202124] truncate">{c?.titulo || "Status excluído"}</span>
            <Chip cor={s.cor}>{s.rotulo}</Chip>
            {e.tentativa > 1 && <Chip cor="bg-[#f0f2f5] text-[#3c4043]">tentativa {e.tentativa}</Chip>}
          </div>
          <p className="text-xs text-[#3c4043] mt-0.5">
            {e.origem === "agendada" ? "Agendado para" : "Disparado em"} {formatarQuando(e.previstoPara)} · por {usuarioLegivel(e.disparadoPor)}
            {e.concluidoEm && ` · concluído ${formatarQuando(e.concluidoEm)}`}
          </p>
          {e.erro && <p className="text-xs text-[#b3261e] mt-0.5">{e.erro}</p>}
          <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs font-semibold">
            {["falhou", "incerto", "perdido"].includes(e.situacao) && (
              <button disabled={ocupado === `ret-${e.id}`} onClick={() => tentarDeNovo(e)} className="text-[#0a6e3d] hover:underline cursor-pointer">
                {ocupado === `ret-${e.id}` ? "Tentando…" : "Tentar novamente"}
              </button>
            )}
            {c && (
              <button onClick={() => setEditor({ inicial: c, quando: "agendar" })} className="text-[#0a6e3d] hover:underline cursor-pointer">
                Reagendar
              </button>
            )}
            {c && (
              <button onClick={() => abrirHistoricoDe(c.id)} className="text-[#5f6368] hover:underline cursor-pointer">
                Histórico
              </button>
            )}
          </div>
        </div>
      </li>
    );
  };

  // ------------------------------------------------------------- render
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-stretch justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Central de Status">
      <div className="bg-white w-full max-w-6xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="border-b border-[#e3e3e3] px-4 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-[#202124] mr-auto">Central de Status</h2>
            <button onClick={() => setEditor({ quando: "agendar" })} className="rounded-lg bg-[#0f9d58] hover:bg-[#0a6e3d] text-white text-xs font-bold px-3 py-2 cursor-pointer">
              + Novo Status
            </button>
            <button onClick={() => setEditor({ quando: "agora" })} className="rounded-lg border border-[#0f9d58] text-[#0a6e3d] text-xs font-bold px-3 py-2 hover:bg-[#e7f6ec] cursor-pointer">
              Publicar agora
            </button>
            <button onClick={() => setEditor({ quando: "agendar" })} className="rounded-lg border border-[#0f9d58] text-[#0a6e3d] text-xs font-bold px-3 py-2 hover:bg-[#e7f6ec] cursor-pointer">
              Agendar
            </button>
            <button onClick={aoFechar} aria-label="Fechar" className="rounded-full w-9 h-9 hover:bg-[#f0f2f5] text-lg cursor-pointer">
              ✕
            </button>
          </div>
          <nav className="flex gap-1 mt-2 overflow-x-auto" aria-label="Seções">
            {ABAS.filter((a) => a.id !== "config" || ponte.ehAdmin).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setAba(a.id);
                  setEditor(null);
                  if (a.id === "historico") setFiltroHistorico(null);
                }}
                className={`whitespace-nowrap px-3 py-2 text-sm font-semibold border-b-2 cursor-pointer ${
                  aba === a.id && !editor ? "border-[#0f9d58] text-[#0a6e3d]" : "border-transparent text-[#5f6368] hover:text-[#202124]"
                }`}
              >
                {a.rotulo}
                {a.id === "ver" && naoVistos > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#0f9d58] text-white text-[10px] px-1.5">{naoVistos}</span>
                )}
                {a.id === "central" && (alertas?.falhasRecentes || 0) > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#d93025] text-white text-[10px] px-1.5">{alertas?.falhasRecentes}</span>
                )}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {erro && !resumo && (
            <p role="alert" className="text-sm text-[#b3261e] bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
              Não consegui carregar os status: {erro}
            </p>
          )}

          {editor && resumo ? (
            <EditorStatus
              key={editor.inicial?.id || editor.quando}
              ponte={ponte}
              resumo={resumo}
              inicial={editor.inicial}
              quandoInicial={editor.quando}
              regraInicial={editor.regra}
              somenteBiblioteca={editor.somenteBiblioteca}
              aoCancelar={() => setEditor(null)}
              aoConcluir={() => {
                setEditor(null);
                carregarResumo();
              }}
            />
          ) : aba === "ver" ? (
            <VisualizadorStatus ponte={ponte} itens={recebidos} recarregar={carregarRecebidos} />
          ) : !resumo ? (
            <p className="text-sm text-[#5f6368] py-10 text-center">Carregando…</p>
          ) : aba === "central" ? (
            <>
              {alertas && alertas.diasSemStatus.length > 0 && (
                <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-amber-900">Não existem Status programados para este período.</p>
                  <p className="text-amber-900/90 mt-0.5">
                    Sem nada nos próximos {alertas.janelaDias} dias em: {alertas.diasSemStatus.map(formatarDataCurta).join(", ")}.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => setAba("biblioteca")} className="rounded-md bg-white border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-900 cursor-pointer">
                      Usar um modelo da biblioteca
                    </button>
                    <button onClick={() => setAba("calendario")} className="rounded-md bg-white border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-900 cursor-pointer">
                      Ver no calendário
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-1 overflow-x-auto mb-2" role="tablist">
                {(
                  [
                    ["programados", "Programados"],
                    ["publicados", "Publicados"],
                    ["recorrentes", "Recorrentes"],
                    ["pausados", "Pausados"],
                    ["falharam", "Falharam"],
                    ["finalizados", "Finalizados"],
                  ] as [SubAba, string][]
                ).map(([id, r]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={sub === id}
                    onClick={() => setSub(id)}
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${
                      sub === id ? "bg-[#202124] text-white" : "bg-[#f0f2f5] text-[#3c4043] hover:bg-[#e3e3e3]"
                    } ${id === "falharam" && contagem.falharam > 0 && sub !== id ? "text-[#b3261e]" : ""}`}
                  >
                    {r} <span className="opacity-70">{contagem[id]}</span>
                  </button>
                ))}
              </div>
              {sub === "publicados" || sub === "falharam" ? (
                listas[sub].length ? (
                  <ul>{listas[sub].map((e) => linhaExecucao(e))}</ul>
                ) : (
                  <p className="text-sm text-[#5f6368] py-10 text-center">Nada aqui.</p>
                )
              ) : listas[sub].length ? (
                <ul>{listas[sub].map((a) => linhaAgendamento(a))}</ul>
              ) : (
                <p className="text-sm text-[#5f6368] py-10 text-center">
                  Nada aqui.{" "}
                  {sub === "programados" && (
                    <button onClick={() => setEditor({ quando: "agendar" })} className="text-[#0a6e3d] font-semibold underline cursor-pointer">
                      Agendar um status
                    </button>
                  )}
                </p>
              )}
            </>
          ) : aba === "calendario" ? (
            <CalendarioStatus
              ponte={ponte}
              aoAbrirConteudo={(id) => {
                const c = conteudoPorId.get(id);
                if (c) setEditor({ inicial: c, quando: "rascunho" });
              }}
              aoAgendarNoDia={(data) => setEditor({ quando: "agendar", regra: { tipo: "unica", data, hora: "09:00" } })}
            />
          ) : aba === "biblioteca" ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <button
                  onClick={() => setCategoriaBib("")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${!categoriaBib ? "bg-[#202124] text-white" : "bg-[#f0f2f5]"}`}
                >
                  Todas
                </button>
                {resumo.categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaBib(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer ${categoriaBib === cat ? "bg-[#202124] text-white" : "bg-[#f0f2f5]"}`}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  onClick={() => setEditor({ quando: "rascunho", somenteBiblioteca: true })}
                  className="ml-auto rounded-lg bg-[#0f9d58] text-white text-xs font-bold px-3 py-1.5 cursor-pointer"
                >
                  + Novo modelo
                </button>
              </div>
              {(() => {
                const modelos = resumo.conteudos.filter((c) => c.modelo && (!categoriaBib || c.categoria === categoriaBib));
                if (!modelos.length)
                  return (
                    <p className="text-sm text-[#5f6368] py-10 text-center">
                      Nenhum modelo {categoriaBib ? `em ${categoriaBib}` : "ainda"}. Crie um ou use “Salvar como modelo” na Central.
                    </p>
                  );
                return (
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modelos.map((c) => (
                      <li key={c.id} className="border border-[#e3e3e3] rounded-xl p-3 flex gap-3">
                        <Miniatura c={c} ponte={ponte} />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm truncate">{c.titulo}</div>
                          {c.categoria && <Chip cor="bg-[#f0f2f5] text-[#3c4043]">{c.categoria}</Chip>}
                          <p className="text-xs text-[#5f6368] line-clamp-2 mt-1">{c.texto}</p>
                          <div className="flex flex-wrap gap-x-3 mt-2 text-xs font-semibold">
                            <button onClick={() => setEditor({ inicial: c, quando: "agendar" })} className="text-[#0a6e3d] hover:underline cursor-pointer">
                              Usar
                            </button>
                            <button onClick={() => setEditor({ inicial: c, quando: "rascunho", somenteBiblioteca: true })} className="text-[#0a6e3d] hover:underline cursor-pointer">
                              Editar
                            </button>
                            <button onClick={() => excluir(c)} className="text-[#b3261e] hover:underline cursor-pointer">
                              Excluir
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </>
          ) : aba === "historico" ? (
            <>
              {filtroHistorico && (
                <div className="mb-3 text-xs">
                  Mostrando só: <b>{conteudoPorId.get(filtroHistorico)?.titulo || "status"}</b>{" "}
                  <button onClick={() => setFiltroHistorico(null)} className="text-[#0a6e3d] underline cursor-pointer">
                    ver tudo
                  </button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[#5f6368] border-b border-[#e3e3e3]">
                      <th className="py-2 pr-3 font-semibold">Quando</th>
                      <th className="py-2 pr-3 font-semibold">Quem</th>
                      <th className="py-2 pr-3 font-semibold">O quê</th>
                      <th className="py-2 pr-3 font-semibold">Conteúdo</th>
                      <th className="py-2 font-semibold">Detalhe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h) => (
                      <tr key={h.id} className="border-b border-[#f0f2f0] align-top">
                        <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{formatarQuando(h.em, true)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{usuarioLegivel(h.usuario)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap font-semibold">{ROTULO_ACAO[h.acao] || h.acao}</td>
                        <td className="py-2 pr-3">{h.titulo || "—"}</td>
                        <td className="py-2 text-xs text-[#5f6368]">
                          {typeof h.detalhes?.erro === "string" && <span className="text-[#b3261e]">{h.detalhes.erro}</span>}
                          {typeof h.detalhes?.descricao === "string" && h.detalhes.descricao}
                          {typeof h.detalhes?.tentativa === "number" && h.detalhes.tentativa > 1 && ` (tentativa ${h.detalhes.tentativa})`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!historico.length && <p className="text-sm text-[#5f6368] py-10 text-center">Sem registros.</p>}
              </div>
            </>
          ) : aba === "config" ? (
            <ConfigStatus ponte={ponte} resumo={resumo} aoSalvar={carregarResumo} />
          ) : null}
        </main>
      </div>

      {reagendando && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Reagendar">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5">
            <h3 className="font-bold text-base mb-3">Reagendar “{conteudoPorId.get(reagendando.ag.conteudoId)?.titulo}”</h3>
            <EditorRecorrencia valor={reagendando.regra} onChange={(regra) => setReagendando({ ...reagendando, regra })} idBase="reagendar" />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setReagendando(null)} className="px-4 py-2 text-sm rounded-lg hover:bg-[#f0f2f5] cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const { ag, regra } = reagendando;
                  setReagendando(null);
                  await alterarAg(ag, { regra, situacao: "ativo" }, "🗓️ Reagendado.");
                }}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-[#0f9d58] text-white cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigStatus({ ponte, resumo, aoSalvar }: { ponte: PonteStatus; resumo: StatusResumo; aoSalvar: () => void }) {
  const [ativa, setAtiva] = useState(resumo.config.assinatura.ativa);
  const [texto, setTexto] = useState(resumo.config.assinatura.texto);
  const [tolerancia, setTolerancia] = useState(resumo.config.toleranciaAtrasoMin);
  const [dias, setDias] = useState(resumo.config.diasDeAlerta);
  const [minimo, setMinimo] = useState(resumo.config.minimoPorDia);
  const [salvando, setSalvando] = useState(false);
  return (
    <div className="max-w-xl space-y-5">
      <section>
        <h3 className="font-bold text-sm mb-2">Assinatura da loja</h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input id="cfg-assinatura-ativa" type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} />
          Adicionar assinatura da loja automaticamente aos Status
        </label>
        <textarea
          id="cfg-assinatura-texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, 300))}
          rows={4}
          className="w-full mt-2 border border-[#e3e3e3] rounded-md px-3 py-2 text-sm"
        />
        <p className="text-[11px] text-[#5f6368]">Vai no fim do texto (status de texto) ou da legenda (foto e vídeo).</p>
      </section>
      <section className="grid sm:grid-cols-3 gap-3">
        <label className="text-xs">
          Atraso máximo aceito (min)
          <input id="cfg-tolerancia" type="number" min={5} max={240} value={tolerancia} onChange={(e) => setTolerancia(Number(e.target.value))} className="block w-full mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm" />
          <span className="text-[10px] text-[#5f6368]">Passou disso (servidor fora do ar), o status não sai atrasado.</span>
        </label>
        <label className="text-xs">
          Alerta olha os próximos (dias)
          <input id="cfg-dias" type="number" min={1} max={31} value={dias} onChange={(e) => setDias(Number(e.target.value))} className="block w-full mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm" />
        </label>
        <label className="text-xs">
          Mínimo de status por dia
          <input id="cfg-minimo" type="number" min={1} max={10} value={minimo} onChange={(e) => setMinimo(Number(e.target.value))} className="block w-full mt-1 border border-[#e3e3e3] rounded-md px-2 py-1.5 text-sm" />
        </label>
      </section>
      <button
        disabled={salvando}
        onClick={async () => {
          setSalvando(true);
          try {
            await ponte.chamar("/api/status/config", {
              method: "PUT",
              body: JSON.stringify({ assinatura: { ativa, texto }, toleranciaAtrasoMin: tolerancia, diasDeAlerta: dias, minimoPorDia: minimo }),
            });
            ponte.avisar("Configurações salvas.");
            aoSalvar();
          } catch (e) {
            ponte.avisar(`⚠️ ${(e as Error).message}`);
          } finally {
            setSalvando(false);
          }
        }}
        className="rounded-lg bg-[#0f9d58] text-white text-sm font-bold px-5 py-2 disabled:opacity-60 cursor-pointer"
      >
        {salvando ? "Salvando…" : "Salvar configurações"}
      </button>
    </div>
  );
}
