"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PonteComando,
  ContatoResumo,
  ContatoCompleto,
  Segmento,
  Etiqueta,
  AchadoBusca,
} from "./tipos";
import { Secao, Vazio } from "./graficos";

const PARADOS = [
  { dias: 0, rotulo: "Qualquer data" },
  { dias: 30, rotulo: "Parados há 30 dias" },
  { dias: 90, rotulo: "Parados há 90 dias" },
  { dias: 180, rotulo: "Parados há 6 meses" },
  { dias: 365, rotulo: "Parados há 1 ano" },
];

export default function Clientes({
  ponte,
  segmentoInicial,
}: {
  ponte: PonteComando;
  segmentoInicial?: string;
}) {
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [itens, setItens] = useState<ContatoResumo[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [texto, setTexto] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [interesse, setInteresse] = useState(segmentoInicial || "");
  const [etiqueta, setEtiqueta] = useState("");
  const [parados, setParados] = useState(0);
  const [soOptIn, setSoOptIn] = useState(false);

  const [aberto, setAberto] = useState<ContatoCompleto | null>(null);
  const [achados, setAchados] = useState<AchadoBusca[] | null>(null);

  useEffect(() => {
    if (segmentoInicial) {
      setInteresse(segmentoInicial);
      setPagina(1);
    }
  }, [segmentoInicial]);

  const carregarApoio = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([
        ponte.chamar<{ itens: Segmento[] }>("/api/comando/segmentos"),
        ponte.chamar<{ itens: Etiqueta[] }>("/api/comando/etiquetas"),
      ]);
      setSegmentos(s.itens || []);
      setEtiquetas(e.itens || []);
    } catch {
      /* a lista principal já avisa do erro */
    }
  }, [ponte]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const p = new URLSearchParams({ pagina: String(pagina), limite: "60" });
      if (buscaAplicada) p.set("q", buscaAplicada);
      if (interesse) p.set("interesse", interesse);
      if (etiqueta) p.set("etiqueta", etiqueta);
      if (parados) p.set("parados", String(parados));
      if (soOptIn) p.set("optin", "1");
      const r = await ponte.chamar<{ itens: ContatoResumo[]; total: number }>(
        `/api/comando/contatos?${p.toString()}`
      );
      setItens(r.itens || []);
      setTotal(r.total || 0);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }, [ponte, pagina, buscaAplicada, interesse, etiqueta, parados, soOptIn]);

  useEffect(() => {
    carregarApoio();
  }, [carregarApoio]);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirFicha = async (chatId: string) => {
    try {
      const r = await ponte.chamar<{ contato: ContatoCompleto }>(
        `/api/comando/contatos/${encodeURIComponent(chatId)}`
      );
      setAberto(r.contato);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui abrir a ficha.");
    }
  };

  const buscarNasConversas = async () => {
    const q = texto.trim();
    if (q.length < 2) return;
    try {
      const r = await ponte.chamar<{ itens: AchadoBusca[] }>(
        `/api/comando/buscar?q=${encodeURIComponent(q)}&limite=40`
      );
      setAchados(r.itens || []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui buscar.");
    }
  };

  const filtrosAtivos = Boolean(buscaAplicada || interesse || etiqueta || parados || soOptIn);
  const limparFiltros = () => {
    setTexto("");
    setBuscaAplicada("");
    setInteresse("");
    setEtiqueta("");
    setParados(0);
    setSoOptIn(false);
    setPagina(1);
    setAchados(null);
  };

  const paginas = Math.max(1, Math.ceil(total / 60));

  return (
    <div className="space-y-4">
      {/* Segmentos: o atalho que a loja mais vai usar */}
      <Secao
        titulo="Segmentos automáticos"
        ajuda="Montados sozinhos a partir do que o cliente falou e dos produtos que a loja enviou. Clique para filtrar."
      >
        {segmentos.length === 0 ? (
          <Vazio texto="Os segmentos aparecem conforme as conversas são analisadas." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {segmentos.map((s) => (
              <button
                key={s.chave}
                type="button"
                onClick={() => {
                  setInteresse(interesse === s.chave ? "" : s.chave);
                  setPagina(1);
                }}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-left transition-colors ${
                  interesse === s.chave
                    ? "border-[#0f9d58] bg-[#e7f6ec]"
                    : "border-[#e3e3e3] bg-white hover:border-[#0f9d58]"
                }`}
              >
                <span className="block text-xs font-bold text-[#202124]">{s.nome}</span>
                <span className="block text-[11px] tabular-nums text-[#5f6368]">
                  {s.contatos.toLocaleString("pt-BR")} clientes
                  {s.recentes ? ` · ${s.recentes} nos últimos 90 dias` : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </Secao>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e3e3e3] bg-white p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setBuscaAplicada(texto.trim());
              setPagina(1);
              setAchados(null);
            }
          }}
          placeholder="Nome ou número…"
          className="min-w-[180px] flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
        />
        <button
          type="button"
          onClick={() => {
            setBuscaAplicada(texto.trim());
            setPagina(1);
            setAchados(null);
          }}
          className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d]"
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={buscarNasConversas}
          title="Procura a palavra dentro do texto das conversas"
          className="cursor-pointer rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs font-semibold text-[#5f6368] hover:bg-[#f0f2f5]"
        >
          🔍 Buscar nas conversas
        </button>

        <select
          value={etiqueta}
          onChange={(e) => {
            setEtiqueta(e.target.value);
            setPagina(1);
          }}
          className="rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-xs outline-none"
        >
          <option value="">Todas as etiquetas</option>
          {etiquetas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome} ({e.usos})
            </option>
          ))}
        </select>

        <select
          value={parados}
          onChange={(e) => {
            setParados(Number(e.target.value));
            setPagina(1);
          }}
          className="rounded-lg border border-[#e3e3e3] px-2 py-1.5 text-xs outline-none"
        >
          {PARADOS.map((p) => (
            <option key={p.dias} value={p.dias}>
              {p.rotulo}
            </option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#5f6368]">
          <input
            type="checkbox"
            checked={soOptIn}
            onChange={(e) => {
              setSoOptIn(e.target.checked);
              setPagina(1);
            }}
            className="cursor-pointer"
          />
          Só quem autorizou receber ofertas
        </label>

        {filtrosAtivos && (
          <button
            type="button"
            onClick={limparFiltros}
            className="cursor-pointer text-xs font-semibold text-[#c2571a] hover:underline"
          >
            Limpar
          </button>
        )}
      </div>

      {erro && (
        <div className="rounded-xl border border-[#c2571a]/40 bg-[#fdf1e8] p-3 text-xs text-[#a8471a]">
          <p className="font-semibold">{erro}</p>
          <button
            type="button"
            onClick={carregar}
            className="mt-2 cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#0a6e3d]"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {/* Resultado da busca dentro das conversas */}
      {achados && (
        <Secao
          titulo={`Encontrado nas conversas (${achados.length})`}
          acao={
            <button
              type="button"
              onClick={() => setAchados(null)}
              className="cursor-pointer text-xs font-semibold text-[#5f6368] hover:underline"
            >
              fechar
            </button>
          }
        >
          {achados.length === 0 ? (
            <Vazio texto="Nenhuma mensagem com essa palavra." />
          ) : (
            <ul className="divide-y divide-[#f0f2f5]">
              {achados.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => ponte.abrirConversa?.(a.chatId)}
                    className="w-full cursor-pointer py-2 text-left hover:bg-[#f0f2f5]"
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xs font-bold text-[#202124]">{a.nome}</span>
                      <span className="shrink-0 text-[10px] text-[#5f6368]">
                        {new Date(a.em).toLocaleDateString("pt-BR")}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#5f6368]">
                      {a.direcao === "out" ? "Loja: " : ""}
                      {a.corpo}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      )}

      {/* Lista de clientes */}
      <Secao
        titulo={`Clientes (${total.toLocaleString("pt-BR")})`}
        ajuda={filtrosAtivos ? "Resultado dos filtros escolhidos acima." : "Todos os contatos da loja, do mais recente para o mais antigo."}
      >
        {carregando && itens.length === 0 ? (
          <Vazio texto="Carregando…" />
        ) : itens.length === 0 ? (
          <Vazio texto="Nenhum cliente com esses filtros." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="border-b border-[#e3e3e3] text-left text-[10px] uppercase tracking-wide text-[#5f6368]">
                  <th className="pb-2 font-semibold">Cliente</th>
                  <th className="pb-2 font-semibold">Assuntos</th>
                  <th className="pb-2 font-semibold">Etapa</th>
                  <th className="pb-2 text-right font-semibold">Mensagens</th>
                  <th className="pb-2 text-right font-semibold">Última</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f5]">
                {itens.map((c) => (
                  <tr key={c.chatId} className="hover:bg-[#f0f2f5]">
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        onClick={() => abrirFicha(c.chatId)}
                        className="cursor-pointer text-left"
                      >
                        <span className="block font-bold text-[#202124] hover:text-[#0a6e3d]">
                          {c.nome || c.nomeWhatsapp || "Contato"}
                        </span>
                        <span className="block font-mono text-[10px] text-[#5f6368]">
                          {formatarNumero(c.numero) || c.chatId}
                        </span>
                      </button>
                      {c.optout && (
                        <span className="mt-0.5 inline-block rounded bg-[#fdf1e8] px-1.5 text-[10px] font-semibold text-[#a8471a]">
                          pediu para não receber
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      <span className="flex flex-wrap gap-1">
                        {c.interesses.slice(0, 3).map((i) => (
                          <span
                            key={i.chave}
                            className="rounded bg-[#e7f6ec] px-1.5 py-0.5 text-[10px] font-semibold text-[#0a6e3d]"
                          >
                            {i.nome}
                          </span>
                        ))}
                        {c.interesses.length === 0 && <span className="text-[10px] text-[#5f6368]">—</span>}
                      </span>
                    </td>
                    <td className="py-2 pr-2 text-[11px] text-[#5f6368]">{c.etapa}</td>
                    <td className="py-2 pr-2 text-right tabular-nums text-[#5f6368]">
                      {c.entradas}/{c.saidas}
                    </td>
                    <td className="py-2 pr-2 text-right text-[11px] tabular-nums text-[#5f6368]">
                      {c.ultimaEm ? new Date(c.ultimaEm).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => ponte.abrirConversa?.(c.chatId)}
                        className="cursor-pointer rounded-lg border border-[#0f9d58]/40 px-2 py-1 text-[10px] font-bold text-[#0a6e3d] hover:bg-[#e7f6ec]"
                      >
                        Abrir conversa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paginas > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹ Anterior
            </button>
            <span className="tabular-nums text-[#5f6368]">
              {pagina} de {paginas}
            </span>
            <button
              type="button"
              disabled={pagina >= paginas}
              onClick={() => setPagina((p) => p + 1)}
              className="cursor-pointer rounded-lg border border-[#e3e3e3] px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima ›
            </button>
          </div>
        )}
      </Secao>

      {aberto && (
        <FichaDoCliente
          ponte={ponte}
          contato={aberto}
          etiquetas={etiquetas}
          aoFechar={() => setAberto(null)}
          aoMudar={() => {
            abrirFicha(aberto.chatId);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function FichaDoCliente({
  ponte,
  contato,
  etiquetas,
  aoFechar,
  aoMudar,
}: {
  ponte: PonteComando;
  contato: ContatoCompleto;
  etiquetas: Etiqueta[];
  aoFechar: () => void;
  aoMudar: () => void;
}) {
  const [nota, setNota] = useState("");
  const [salvando, setSalvando] = useState(false);
  const marcadas = useMemo(() => new Set(contato.etiquetas), [contato.etiquetas]);

  const alternarEtiqueta = async (id: string) => {
    await ponte
      .chamar(`/api/comando/contatos/${encodeURIComponent(contato.chatId)}/etiquetas`, {
        method: "POST",
        body: JSON.stringify({ etiquetaId: id, ligada: !marcadas.has(id) }),
      })
      .catch(() => {});
    aoMudar();
  };

  const salvarNota = async () => {
    const texto = nota.trim();
    if (!texto) return;
    setSalvando(true);
    await ponte
      .chamar(`/api/comando/contatos/${encodeURIComponent(contato.chatId)}/notas`, {
        method: "POST",
        body: JSON.stringify({ texto }),
      })
      .catch(() => {});
    setNota("");
    setSalvando(false);
    aoMudar();
  };

  const registrarConsentimento = async (acao: "opt_in" | "opt_out") => {
    await ponte
      .chamar(`/api/comando/contatos/${encodeURIComponent(contato.chatId)}/consentimento`, {
        method: "POST",
        body: JSON.stringify({
          acao,
          canal: "painel",
          texto:
            acao === "opt_in"
              ? "Autorizou receber ofertas da loja (registrado pelo atendente)"
              : "Pediu para não receber ofertas",
          finalidade: "ofertas e novidades da loja",
        }),
      })
      .catch(() => {});
    aoMudar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={aoFechar}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#202124]">
              {contato.nome || contato.nomeWhatsapp || "Contato"}
            </h3>
            <p className="font-mono text-xs text-[#5f6368]">
              {formatarNumero(contato.numero) || contato.chatId}
            </p>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            className="cursor-pointer rounded-lg px-2 py-1 text-sm text-[#5f6368] hover:bg-[#f0f2f5]"
          >
            ✕
          </button>
        </header>

        <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <Campo rotulo="Recebidas" valor={String(contato.entradas)} />
          <Campo rotulo="Enviadas" valor={String(contato.saidas)} />
          <Campo
            rotulo="Primeiro contato"
            valor={contato.primeiraEm ? new Date(contato.primeiraEm).toLocaleDateString("pt-BR") : "—"}
          />
          <Campo
            rotulo="Última conversa"
            valor={contato.ultimaEm ? new Date(contato.ultimaEm).toLocaleDateString("pt-BR") : "—"}
          />
        </div>

        <Bloco titulo="Assuntos detectados">
          {contato.interesses.length === 0 ? (
            <p className="text-xs text-[#5f6368]">Ainda não deu para identificar o assunto.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {contato.interesses.map((i) => (
                <span
                  key={i.chave}
                  className="rounded-lg bg-[#e7f6ec] px-2 py-1 text-[11px] font-semibold text-[#0a6e3d]"
                  title={`${i.pontos} sinal(is) na conversa`}
                >
                  {i.nome}
                </span>
              ))}
            </div>
          )}
        </Bloco>

        <Bloco titulo="Etiquetas">
          {etiquetas.length === 0 ? (
            <p className="text-xs text-[#5f6368]">Crie etiquetas em Ajustes.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {etiquetas.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => alternarEtiqueta(e.id)}
                  className={`cursor-pointer rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                    marcadas.has(e.id) ? "text-white" : "bg-white text-[#5f6368] hover:bg-[#f0f2f5]"
                  }`}
                  style={
                    marcadas.has(e.id)
                      ? { background: e.cor, borderColor: e.cor }
                      : { borderColor: "#e3e3e3" }
                  }
                >
                  {e.nome}
                </button>
              ))}
            </div>
          )}
        </Bloco>

        <Bloco titulo="Autorização para receber ofertas (LGPD)">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                contato.optout
                  ? "bg-[#fdf1e8] text-[#a8471a]"
                  : contato.optin
                  ? "bg-[#e7f6ec] text-[#0a6e3d]"
                  : "bg-[#f0f2f5] text-[#5f6368]"
              }`}
            >
              {contato.optout ? "Pediu para não receber" : contato.optin ? "Autorizou" : "Sem registro"}
            </span>
            <button
              type="button"
              onClick={() => registrarConsentimento("opt_in")}
              className="cursor-pointer rounded-lg border border-[#0f9d58]/40 px-2 py-1 text-[11px] font-semibold text-[#0a6e3d] hover:bg-[#e7f6ec]"
            >
              Registrar autorização
            </button>
            <button
              type="button"
              onClick={() => registrarConsentimento("opt_out")}
              className="cursor-pointer rounded-lg border border-[#c2571a]/40 px-2 py-1 text-[11px] font-semibold text-[#a8471a] hover:bg-[#fdf1e8]"
            >
              Registrar recusa
            </button>
          </div>
          {contato.consentimento.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-[11px] text-[#5f6368]">
              {contato.consentimento.slice(0, 3).map((c, i) => (
                <li key={i}>
                  {c.acao === "opt_in" ? "Autorizou" : "Recusou"} em{" "}
                  {new Date(c.em).toLocaleString("pt-BR")} ({c.canal}
                  {c.por ? `, por ${c.por}` : ""})
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[10px] text-[#5f6368]">
            Só quem tem autorização registrada entra em campanha de oferta. Isso é o que a lei pede
            que a loja consiga provar.
          </p>
        </Bloco>

        <Bloco titulo="Notas internas">
          <div className="flex gap-2">
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvarNota()}
              placeholder="O que a equipe precisa saber deste cliente…"
              className="flex-1 rounded-lg border border-[#e3e3e3] px-3 py-1.5 text-xs outline-none focus:border-[#0f9d58]"
            />
            <button
              type="button"
              onClick={salvarNota}
              disabled={salvando || !nota.trim()}
              className="cursor-pointer rounded-lg bg-[#0f9d58] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6e3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
          {contato.notas.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {contato.notas.map((n) => (
                <li key={n.id} className="rounded-lg bg-[#f0f2f5] px-3 py-2 text-xs">
                  <p className="text-[#202124]">{n.texto}</p>
                  <p className="mt-0.5 text-[10px] text-[#5f6368]">
                    {n.autor || "equipe"} · {new Date(n.em).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              ponte.abrirConversa?.(contato.chatId);
              aoFechar();
            }}
            className="cursor-pointer rounded-lg bg-[#0f9d58] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a6e3d]"
          >
            Abrir conversa
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-[#f0f2f5] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[#5f6368]">{rotulo}</div>
      <div className="text-sm font-bold tabular-nums text-[#202124]">{valor}</div>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#5f6368]">{titulo}</h4>
      {children}
    </section>
  );
}

function formatarNumero(numero: string | null) {
  if (!numero) return "";
  const d = numero.replace(/\D/g, "");
  const m = d.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : d;
}
