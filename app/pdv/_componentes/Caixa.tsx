"use client";

// O caixa do balcão: catálogo do site à esquerda, a fita (o cupom) à direita.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronUp, ClipboardList, LogOut, UserRound } from "lucide-react";
import { precoNaTabela, reais, totaisDa } from "@/lib/pdv/calculos";
import type { ItemDaVenda } from "@/lib/pdv/tipos";
import type { DadosDoComprovante, ResumoDoDia } from "@/lib/pdv/vendas";
import Catalogo from "./Catalogo";
import Fechamento from "./Fechamento";
import Resultado from "./Resultado";
import Ticket from "./Ticket";
import VendasDoDia from "./VendasDoDia";
import { gravarLocal, lerLocal, useCaixa } from "./estado";
import { useImpressao } from "./impressao";

interface Conexao {
  operador: string;
  acesso: { ligado: boolean; motivo: string | null };
  vendedores: { id: string; nome: string }[];
  vendedoresDoSistema: boolean;
  erroVendedores: string | null;
}

type Tela = "venda" | "fechando" | "resultado";

export default function Caixa({ operador }: { operador: string }) {
  const [estado, despachar] = useCaixa();
  const [tela, setTela] = useState<Tela>("venda");
  const [conexao, setConexao] = useState<Conexao | null>(null);
  const [vendedorId, setVendedorId] = useState<string>("");
  const [resumo, setResumo] = useState<ResumoDoDia | null>(null);
  const [lendoResumo, setLendoResumo] = useState(false);
  const [painelVendas, setPainelVendas] = useState(false);
  const [fitaNoCelular, setFitaNoCelular] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [feita, setFeita] = useState<DadosDoComprovante | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const { imprimir, area } = useImpressao();

  // ---- /sistema: ligação e vendedores
  const lerConexao = useCallback(async () => {
    try {
      const r = await fetch("/api/pdv/sistema", { cache: "no-store" });
      if (r.status === 401) return window.location.reload();
      setConexao(await r.json());
    } catch {
      /* sem internet: mantém o que tinha */
    }
  }, []);
  useEffect(() => {
    setVendedorId(lerLocal("pdv-vendedor-sistema", ""));
    lerConexao();
    const t = setInterval(lerConexao, 60_000);
    return () => clearInterval(t);
  }, [lerConexao]);

  // ---- vendas do dia (/sistema + caixa)
  const lerResumo = useCallback(async () => {
    setLendoResumo(true);
    try {
      const r = await fetch("/api/pdv/vendas", { cache: "no-store" });
      if (r.ok) setResumo(await r.json());
    } catch {
      /* tenta na próxima */
    } finally {
      setLendoResumo(false);
    }
  }, []);
  useEffect(() => {
    lerResumo();
    const passo = painelVendas ? 15_000 : 30_000;
    const t = setInterval(() => document.visibilityState === "visible" && lerResumo(), passo);
    return () => clearInterval(t);
  }, [lerResumo, painelVendas]);

  const vendedor = useMemo(() => conexao?.vendedores.find((v) => v.id === vendedorId) ?? null, [conexao, vendedorId]);
  const noTicket = useMemo(() => Object.fromEntries(estado.itens.map((i) => [i.produtoId, i.quantidade])), [estado.itens]);
  const t = totaisDa(estado);
  const sistemaLigado = Boolean(conexao?.acesso.ligado);

  async function finalizar() {
    setEnviando(true);
    setErroEnvio(null);
    const itens: ItemDaVenda[] = estado.itens.map((i) => ({
      produtoId: i.produtoId,
      nome: i.nome,
      foto: i.foto,
      quantidade: i.quantidade,
      valor: i.valor,
      valorDoSite: i.produtoId.startsWith("avulso") ? null : precoNaTabela(i, estado.tabela),
    }));
    try {
      const r = await fetch("/api/pdv/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens,
          cliente: estado.cliente,
          vendedor,
          desconto: estado.desconto,
          pagamentos: estado.pagamentos,
          observacao: estado.observacao,
          pedirNota: estado.pedirNota,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.problemas?.join(" ") || j.erro || "A venda não foi gravada.");
      setFeita(j.comprovante);
      despachar({ tipo: "limpar" });
      setTela("resultado");
      lerResumo();
      lerConexao();
    } catch (e) {
      setErroEnvio((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  const acaoNaFeita = useCallback(
    async (acao: "tentar-de-novo" | "atualizar-nota") => {
      if (!feita?.pdvId) return;
      setOcupado(true);
      try {
        const r = await fetch(`/api/pdv/vendas/${feita.pdvId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acao }),
        });
        const j = await r.json();
        if (r.ok) setFeita(j.comprovante);
      } finally {
        setOcupado(false);
      }
    },
    [feita?.pdvId]
  );

  async function sair() {
    await fetch("/api/controle/admin-logout", { method: "POST" }).catch(() => undefined);
    window.location.reload();
  }

  const avisoCobrar = !vendedor
    ? conexao && !conexao.vendedores.length
      ? `Sem a lista de vendedores do sistema${conexao.erroVendedores ? `: ${conexao.erroVendedores}` : "."}`
      : "Escolha o vendedor no alto para cobrar."
    : null;

  return (
    <div className="pdv flex h-full min-h-0 flex-col print:hidden">
      {/* ---------------- barra de cima */}
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[var(--linha)] bg-[var(--painel)] px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Balão da Informática" className="h-7 w-auto" />
          </div>
          <span className="text-lg font-black tracking-tight">Caixa</span>
        </div>

        <div
          className="flex items-center gap-2 rounded-full border border-[var(--linha)] px-3 py-1 text-sm"
          title={conexao?.acesso.motivo ?? "Vendas vão para www.balao.info/sistema"}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${sistemaLigado ? "bg-[var(--ceu)]" : "bg-[var(--vermelho)]"}`} aria-hidden />
          {conexao ? (sistemaLigado ? "Sistema ligado" : "Sistema fora: vendas ficam guardadas") : "Conferindo o sistema…"}
        </div>

        <label className="ml-auto flex items-center gap-2 text-sm">
          <UserRound className="h-4 w-4 text-[var(--texto-suave)]" aria-hidden />
          <span className="sr-only">Vendedor</span>
          <select
            value={vendedorId}
            onChange={(e) => {
              setVendedorId(e.target.value);
              gravarLocal("pdv-vendedor-sistema", e.target.value);
            }}
            className={`max-w-[14rem] rounded-xl border bg-[var(--carvao)] px-3 py-2 font-semibold outline-none ${
              vendedor ? "border-[var(--linha)]" : "border-[var(--vermelho)]"
            }`}
          >
            <option value="">Quem está vendendo?</option>
            {conexao?.vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => setPainelVendas(true)}
          className="flex items-center gap-2 rounded-xl border border-[var(--linha)] px-3 py-2 text-sm font-semibold hover:border-slate-500"
        >
          <ClipboardList className="h-4 w-4" aria-hidden />
          <span className="pdv-numeros">
            Hoje{resumo ? `: ${resumo.totais.vendas}, ${reais(resumo.totais.valor)}` : ""}
          </span>
          {resumo && resumo.totais.aguardando > 0 && (
            <span className="pdv-numeros rounded-full bg-[var(--vermelho)] px-1.5 text-xs font-black text-white" title="Vendas esperando o sistema">
              {resumo.totais.aguardando}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-2 text-sm text-[var(--texto-suave)] md:flex">
          <span>{operador}</span>
          {operador === "Balcão" && (
            <button onClick={sair} className="rounded-lg p-1.5 hover:bg-white/5 hover:text-white" aria-label="Fechar o caixa (sair)">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* ---------------- corpo */}
      <div className="relative flex min-h-0 flex-1">
        {tela === "venda" && (
          <>
            <Catalogo tabela={estado.tabela} noTicket={noTicket} aoEscolher={(p) => despachar({ tipo: "adicionar", produto: p })} aoAvulso={(nome, valor) => despachar({ tipo: "avulso", nome, valor })} />
            <aside className="hidden w-[400px] shrink-0 border-l border-[var(--linha)] bg-[var(--painel)] p-5 lg:flex xl:w-[440px]" aria-label="Venda atual">
              <Ticket estado={estado} despachar={despachar} aoCobrar={() => setTela("fechando")} podeCobrar={estado.itens.length > 0 && Boolean(vendedor)} avisoCobrar={avisoCobrar} />
            </aside>

            {/* celular e tablet: a fita sobe de baixo */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--linha)] bg-[var(--painel)] p-3 lg:hidden">
              <button onClick={() => setFitaNoCelular(true)} className="flex w-full items-center justify-between rounded-2xl bg-[var(--vermelho)] px-5 py-3.5 font-black text-white">
                <span className="flex items-center gap-2">
                  <ChevronUp className="h-5 w-5" aria-hidden /> Ver a venda ({estado.itens.reduce((s, i) => s + i.quantidade, 0)})
                </span>
                <span className="pdv-numeros">{reais(t.total)}</span>
              </button>
            </div>
            {fitaNoCelular && (
              <div className="fixed inset-0 z-40 flex flex-col bg-[var(--painel)] p-4 lg:hidden">
                <button onClick={() => setFitaNoCelular(false)} className="mb-3 self-start rounded-xl px-2 py-1 text-[var(--texto-suave)]">
                  Voltar aos produtos
                </button>
                <div className="min-h-0 flex-1">
                  <Ticket
                    estado={estado}
                    despachar={despachar}
                    aoCobrar={() => {
                      setFitaNoCelular(false);
                      setTela("fechando");
                    }}
                    podeCobrar={estado.itens.length > 0 && Boolean(vendedor)}
                    avisoCobrar={avisoCobrar}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {tela === "fechando" && (
          <div className="flex min-h-0 flex-1 flex-col">
            <Fechamento
              estado={estado}
              despachar={despachar}
              vendedor={vendedor}
              sistemaLigado={sistemaLigado}
              enviando={enviando}
              erro={erroEnvio}
              aoVoltar={() => setTela("venda")}
              aoFinalizar={finalizar}
            />
          </div>
        )}

        {tela === "resultado" && feita && (
          <div className="pdv-rolagem min-h-0 flex-1 overflow-y-auto">
            <Resultado
              c={feita}
              ocupado={ocupado}
              aoImprimir={(f) => imprimir(feita, f)}
              aoAcao={acaoNaFeita}
              aoNovaVenda={() => {
                setFeita(null);
                setTela("venda");
              }}
            />
          </div>
        )}

        {painelVendas && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setPainelVendas(false)} aria-hidden />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-[var(--linha)] bg-[var(--painel)] shadow-2xl" role="dialog" aria-label="Vendas de hoje">
              <VendasDoDia
                resumo={resumo}
                carregando={lendoResumo}
                sistemaLigado={sistemaLigado}
                aoAtualizar={lerResumo}
                aoFechar={() => setPainelVendas(false)}
                aoImprimir={imprimir}
              />
            </div>
          </>
        )}
      </div>
      {area}
    </div>
  );
}
