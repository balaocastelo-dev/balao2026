"use client";

// As vendas do dia: as do caixa e as lançadas direto no /sistema, na mesma lista.

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, FileText, RefreshCw, X } from "lucide-react";
import { reais } from "@/lib/pdv/calculos";
import { CLIENTE_VAZIO, type ClienteDaVenda, type LinhaDoDia } from "@/lib/pdv/tipos";
import type { DadosDoComprovante, ResumoDoDia } from "@/lib/pdv/vendas";
import type { Formato } from "./Comprovante";
import { Cliente } from "./Fechamento";
import Resultado from "./Resultado";

interface Props {
  resumo: ResumoDoDia | null;
  carregando: boolean;
  sistemaLigado: boolean;
  aoAtualizar: () => void;
  aoFechar: () => void;
  aoImprimir: (c: DadosDoComprovante, f: Formato) => void;
}

function Etiqueta({ l }: { l: LinhaDoDia }) {
  if (l.cancelada) return <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300 line-through">{l.situacao}</span>;
  if (l.estadoNoSistema === "erro") return <span className="rounded-md bg-[var(--vermelho)] px-2 py-0.5 text-xs font-bold text-white">Erro no sistema</span>;
  if (l.estadoNoSistema === "pendente" || l.estadoNoSistema === "enviando")
    return <span className="rounded-md border border-[var(--ceu)] px-2 py-0.5 text-xs text-[var(--ceu)]">Aguardando o sistema</span>;
  return <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-200">{l.situacao}</span>;
}

function EtiquetaNota({ l }: { l: LinhaDoDia }) {
  if (!l.nota) return null;
  const n = l.nota;
  const texto =
    n.estado === "autorizada" ? `NF-e ${n.numero}` : n.estado === "rejeitada" ? "NF rejeitada" : n.estado === "erro" ? "NF com erro" : "NF a caminho";
  const forte = n.estado === "rejeitada" || n.estado === "erro";
  return (
    <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs ${forte ? "bg-[var(--vermelho)] font-bold text-white" : "bg-white text-slate-900"}`}>
      <FileText className="h-3 w-3" aria-hidden /> {texto}
    </span>
  );
}

export default function VendasDoDia({ resumo, carregando, sistemaLigado, aoAtualizar, aoFechar, aoImprimir }: Props) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<DadosDoComprovante | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [paraNota, setParaNota] = useState<ClienteDaVenda | null>(null);

  const abrir = useCallback(async (chave: string) => {
    setAberta(chave);
    setDetalhe(null);
    setErro(null);
    setParaNota(null);
    try {
      const r = await fetch(`/api/pdv/vendas/${encodeURIComponent(chave)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || "Não abri a venda.");
      setDetalhe(j.comprovante);
    } catch (e) {
      setErro((e as Error).message);
    }
  }, []);

  const acao = useCallback(
    async (nome: "tentar-de-novo" | "atualizar-nota" | "emitir-nota", cliente?: ClienteDaVenda) => {
      if (!detalhe?.pdvId) return;
      setOcupado(true);
      setErro(null);
      try {
        const r = await fetch(`/api/pdv/vendas/${detalhe.pdvId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acao: nome, cliente }),
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.erro || "O sistema não respondeu.");
        setDetalhe(j.comprovante);
        setParaNota(null);
        aoAtualizar();
      } catch (e) {
        setErro((e as Error).message);
      } finally {
        setOcupado(false);
      }
    },
    [detalhe?.pdvId, aoAtualizar]
  );

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (aberta ? setAberta(null) : aoFechar());
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [aberta, aoFechar]);

  const semNota = detalhe && detalhe.pdvId && !detalhe.cancelada && (!detalhe.pedirNota || detalhe.nota?.estado === "erro" || detalhe.nota?.estado === "rejeitada");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--linha)] px-5 py-4">
        {aberta ? (
          <button onClick={() => setAberta(null)} className="flex items-center gap-2 font-semibold text-[var(--texto-suave)] hover:text-white">
            <ArrowLeft className="h-5 w-5" aria-hidden /> Vendas de hoje
          </button>
        ) : (
          <div>
            <h2 className="text-xl font-black tracking-tight">Vendas de hoje</h2>
            {resumo && (
              <p className="pdv-numeros text-sm text-[var(--texto-suave)]">
                {resumo.totais.vendas} vendas, {reais(resumo.totais.valor)}
                {resumo.totais.notas ? `, ${resumo.totais.notas} notas` : ""}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          {!aberta && (
            <button onClick={aoAtualizar} className="rounded-xl p-2 text-[var(--texto-suave)] hover:bg-white/5 hover:text-white" aria-label="Atualizar">
              <RefreshCw className={`h-5 w-5 ${carregando ? "animate-spin motion-reduce:animate-none" : ""}`} />
            </button>
          )}
          <button onClick={aoFechar} className="rounded-xl p-2 text-[var(--texto-suave)] hover:bg-white/5 hover:text-white" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="pdv-rolagem min-h-0 flex-1 overflow-y-auto">
        {aberta ? (
          erro && !detalhe ? (
            <p className="m-5 rounded-xl bg-red-950/40 p-4 text-red-200">{erro}</p>
          ) : !detalhe ? (
            <p className="p-5 text-[var(--texto-suave)]">Abrindo a venda…</p>
          ) : (
            <div>
              <div className="space-y-1 border-b border-[var(--linha)] px-5 py-4 lg:px-8">
                {detalhe.itens.map((i, n) => (
                  <div key={n} className="pdv-numeros flex justify-between gap-4 text-sm">
                    <span className="text-slate-200">
                      {i.quantidade} x {i.nome}
                    </span>
                    <span>{reais(i.valor * i.quantidade)}</span>
                  </div>
                ))}
                {detalhe.origem === "sistema" && <p className="pt-2 text-xs text-[var(--texto-suave)]">Lançada direto no sistema (www.balao.info/sistema). Mudanças nela se fazem lá.</p>}
              </div>
              {erro && <p className="mx-5 mt-4 rounded-xl bg-red-950/40 p-3 text-sm text-red-200 lg:mx-8">{erro}</p>}
              {semNota && !paraNota && (
                <div className="px-5 pt-5 lg:px-8">
                  <button
                    onClick={() => setParaNota({ ...CLIENTE_VAZIO, ...detalhe.cliente })}
                    disabled={!sistemaLigado}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--linha)] bg-[var(--superficie)] p-4 font-bold hover:border-slate-500 disabled:opacity-50"
                  >
                    <FileText className="h-5 w-5" aria-hidden /> {detalhe.pedirNota ? "Emitir a nota de novo" : "Emitir nota fiscal desta venda"}
                  </button>
                </div>
              )}
              {paraNota && (
                <div className="space-y-3 px-5 pt-5 lg:px-8">
                  <p className="text-sm text-[var(--texto-suave)]">Confira os dados do cliente para a nota.</p>
                  <Cliente cliente={paraNota} pedirNota sistemaLigado={sistemaLigado} mudar={(c) => setParaNota({ ...paraNota, ...c })} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => acao("emitir-nota", paraNota)}
                      disabled={ocupado}
                      className="flex-1 rounded-2xl bg-[var(--vermelho)] py-3 font-black text-white disabled:opacity-50"
                    >
                      {ocupado ? "Emitindo…" : "Emitir NF-e"}
                    </button>
                    <button onClick={() => setParaNota(null)} className="rounded-2xl px-4 text-[var(--texto-suave)] hover:text-white">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              <Resultado c={detalhe} ocupado={ocupado} aoImprimir={(f) => aoImprimir(detalhe, f)} aoAcao={(a) => acao(a)} />
            </div>
          )
        ) : !resumo ? (
          <p className="p-5 text-[var(--texto-suave)]">{carregando ? "Lendo as vendas…" : "Sem dados ainda."}</p>
        ) : (
          <>
            {!resumo.sistema.lido && (
              <p className="m-4 rounded-xl border border-[var(--linha)] p-3 text-sm text-[var(--texto-suave)]">
                Sem a lista do sistema agora{resumo.sistema.mensagem ? `: ${resumo.sistema.mensagem}` : "."} Mostrando as vendas do caixa.
              </p>
            )}
            {resumo.linhas.length === 0 ? (
              <p className="p-5 text-[var(--texto-suave)]">Nenhuma venda hoje ainda.</p>
            ) : (
              <ul>
                {resumo.linhas.map((l) => (
                  <li key={l.chave}>
                    <button onClick={() => abrir(l.chave)} className="flex w-full items-center gap-4 border-b border-[var(--linha)] px-5 py-3.5 text-left hover:bg-white/[0.03]">
                      <div className="pdv-numeros w-16 shrink-0 text-sm">
                        <div className="font-bold">{l.numero ?? "—"}</div>
                        <div className="text-xs text-[var(--texto-suave)]">{l.hora ?? ""}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate font-semibold ${l.cancelada ? "text-slate-500 line-through" : ""}`}>{l.cliente}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Etiqueta l={l} />
                          <EtiquetaNota l={l} />
                          {l.vendedor && <span className="text-xs text-[var(--texto-suave)]">{l.vendedor}</span>}
                          {l.origem === "pdv" && <span className="text-xs text-[var(--texto-suave)]">pelo caixa</span>}
                        </div>
                      </div>
                      <div className="pdv-numeros shrink-0 text-right font-black">{reais(l.total)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
