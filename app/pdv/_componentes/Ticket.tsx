"use client";

// A fita: o carrinho desenhado como o cupom que vai sair da impressora.

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { centavos, reais, totaisDa } from "@/lib/pdv/calculos";
import type { Desconto, Tabela } from "@/lib/pdv/tipos";
import type { Acao, EstadoDoCaixa } from "./estado";

interface Props {
  estado: EstadoDoCaixa;
  despachar: React.Dispatch<Acao>;
  aoCobrar: () => void;
  podeCobrar: boolean;
  avisoCobrar: string | null;
}

const lerValor = (s: string) => Number(s.replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", "."));

export default function Ticket({ estado, despachar, aoCobrar, podeCobrar, avisoCobrar }: Props) {
  const t = totaisDa(estado);
  const [editando, setEditando] = useState<{ id: string; texto: string } | null>(null);
  const [descontoAberto, setDescontoAberto] = useState(false);
  const [descontoTexto, setDescontoTexto] = useState("");
  const [descontoTipo, setDescontoTipo] = useState<Desconto["tipo"]>("valor");
  const qtdItens = estado.itens.reduce((s, i) => s + i.quantidade, 0);

  function aplicarDesconto(e: React.FormEvent) {
    e.preventDefault();
    const v = lerValor(descontoTexto);
    despachar({ tipo: "desconto", desconto: v > 0 ? { tipo: descontoTipo, valor: v } : null });
    setDescontoAberto(false);
  }

  function trocarTabela(tabela: Tabela) {
    despachar({ tipo: "tabela", tabela });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <h2 className="text-lg font-black tracking-tight">
          Venda <span className="pdv-numeros font-semibold text-[var(--texto-suave)]">{qtdItens ? `${qtdItens} ${qtdItens === 1 ? "item" : "itens"}` : ""}</span>
        </h2>
        <div role="radiogroup" aria-label="Tabela de preço" className="flex rounded-full border border-[var(--linha)] p-0.5 text-sm">
          {(["vista", "cartao"] as Tabela[]).map((x) => (
            <button
              key={x}
              role="radio"
              aria-checked={estado.tabela === x}
              onClick={() => trocarTabela(x)}
              className={`rounded-full px-3 py-1 font-semibold transition ${estado.tabela === x ? "bg-white text-slate-900" : "text-[var(--texto-suave)] hover:text-white"}`}
            >
              {x === "vista" ? "À vista" : "Cartão"}
            </button>
          ))}
        </div>
      </div>

      <div className="pdv-rolagem min-h-0 flex-1 overflow-y-auto px-1 pt-3">
        <div className="fita mx-auto rounded-sm px-4 pb-5 pt-4 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
          <div className="text-center text-[13px] font-bold">BALÃO DA INFORMÁTICA</div>
          <div className="text-center text-[11px] opacity-70">Av. Anchieta, 789 - Cambuí</div>
          <div className="fita-tracejado my-3" />

          {estado.itens.length === 0 ? (
            <p className="py-10 text-center text-[13px] opacity-60">A fita está vazia. Escolha um produto ao lado.</p>
          ) : (
            <ul className="space-y-3">
              {estado.itens.map((i) => (
                <li key={i.produtoId} className={estado.ultimo === i.produtoId ? "pdv-entra" : undefined}>
                  <div className="flex items-start gap-2">
                    {i.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.foto} alt="" className="h-10 w-10 shrink-0 rounded bg-white object-contain" />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded border border-dashed border-slate-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[12.5px] font-semibold leading-snug">{i.nome}</div>
                      <div className="mt-1.5 flex items-center justify-between gap-2 text-[12.5px]">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              i.quantidade > 1 ? despachar({ tipo: "quantidade", id: i.produtoId, quantidade: i.quantidade - 1 }) : despachar({ tipo: "remover", id: i.produtoId })
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 hover:bg-slate-200"
                            aria-label={i.quantidade > 1 ? `Tirar um ${i.nome}` : `Remover ${i.nome}`}
                          >
                            {i.quantidade > 1 ? <Minus className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                          <span className="pdv-numeros w-7 text-center font-bold">{i.quantidade}</span>
                          <button
                            onClick={() => despachar({ tipo: "quantidade", id: i.produtoId, quantidade: i.quantidade + 1 })}
                            className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 hover:bg-slate-200"
                            aria-label={`Mais um ${i.nome}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <span className="mx-1 opacity-50">x</span>
                          {editando?.id === i.produtoId ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const v = lerValor(editando.texto);
                                if (v > 0) despachar({ tipo: "valor", id: i.produtoId, valor: v });
                                setEditando(null);
                              }}
                            >
                              <input
                                autoFocus
                                inputMode="decimal"
                                value={editando.texto}
                                onChange={(e) => setEditando({ ...editando, texto: e.target.value })}
                                onBlur={() => setEditando(null)}
                                aria-label="Valor unitário"
                                className="w-24 rounded border border-slate-400 bg-white px-1.5 py-0.5 text-right"
                              />
                            </form>
                          ) : (
                            <button
                              onClick={() => setEditando({ id: i.produtoId, texto: i.valor.toFixed(2).replace(".", ",") })}
                              className={`pdv-numeros rounded px-1 underline decoration-dotted underline-offset-2 hover:bg-slate-200 ${i.editado ? "font-bold" : ""}`}
                              title="Mudar o valor unitário"
                            >
                              {reais(i.valor)}
                            </button>
                          )}
                        </div>
                        <span className="pdv-numeros font-bold">{reais(centavos(i.valor * i.quantidade))}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {estado.itens.length > 0 && (
            <>
              <div className="fita-tracejado my-3" />
              <div className="pdv-numeros flex justify-between text-[12.5px]">
                <span>Subtotal</span>
                <span>{reais(t.subtotal)}</span>
              </div>
              {descontoAberto ? (
                <form onSubmit={aplicarDesconto} className="mt-2 flex items-center gap-1.5 text-[12.5px]">
                  <select
                    value={descontoTipo}
                    onChange={(e) => setDescontoTipo(e.target.value as Desconto["tipo"])}
                    aria-label="Tipo de desconto"
                    className="rounded border border-slate-400 bg-white px-1 py-1"
                  >
                    <option value="valor">R$</option>
                    <option value="percentual">%</option>
                  </select>
                  <input
                    autoFocus
                    inputMode="decimal"
                    value={descontoTexto}
                    onChange={(e) => setDescontoTexto(e.target.value)}
                    aria-label="Valor do desconto"
                    className="w-20 rounded border border-slate-400 bg-white px-1.5 py-1 text-right"
                  />
                  <button type="submit" className="rounded bg-slate-900 px-2.5 py-1 font-bold text-white">
                    Aplicar
                  </button>
                </form>
              ) : (
                <div className="pdv-numeros mt-1 flex justify-between text-[12.5px]">
                  <button
                    onClick={() => {
                      setDescontoTipo(estado.desconto?.tipo ?? "valor");
                      setDescontoTexto(estado.desconto ? String(estado.desconto.valor).replace(".", ",") : "");
                      setDescontoAberto(true);
                    }}
                    className="underline decoration-dotted underline-offset-2"
                  >
                    {t.desconto > 0 ? `Desconto${estado.desconto?.tipo === "percentual" ? ` ${estado.desconto.valor}%` : ""}` : "Dar desconto"}
                  </button>
                  {t.desconto > 0 && <span>- {reais(t.desconto)}</span>}
                </div>
              )}
              <div className="pdv-numeros mt-3 flex items-baseline justify-between">
                <span className="text-[13px] font-bold">TOTAL</span>
                <span className="text-[26px] font-black tracking-tight">{reais(t.total)}</span>
              </div>
              <div className="text-right text-[11px] opacity-60">{estado.tabela === "cartao" ? "preços do cartão" : "preços à vista"}</div>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-2 px-1">
        {avisoCobrar && estado.itens.length > 0 && <p className="text-center text-sm text-[var(--texto-suave)]">{avisoCobrar}</p>}
        <button
          onClick={aoCobrar}
          disabled={!podeCobrar}
          className="pdv-numeros w-full rounded-2xl bg-[var(--vermelho)] py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {estado.itens.length ? `Cobrar ${reais(t.total)}` : "Cobrar"}
        </button>
        {estado.itens.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Limpar a venda inteira?")) despachar({ tipo: "limpar" });
            }}
            className="w-full py-1.5 text-sm text-[var(--texto-suave)] hover:text-white"
          >
            Limpar a venda
          </button>
        )}
      </div>
    </div>
  );
}
