"use client";

import { useEffect, useRef, useState } from "react";
import { PackagePlus, Search, X } from "lucide-react";
import { reais } from "@/lib/pdv/calculos";
import type { ProdutoDoPdv, Tabela } from "@/lib/pdv/tipos";

interface Props {
  tabela: Tabela;
  noTicket: Record<string, number>;
  aoEscolher: (p: ProdutoDoPdv) => void;
  aoAvulso: (nome: string, valor: number) => void;
}

export default function Catalogo({ tabela, noTicket, aoEscolher, aoAvulso }: Props) {
  const [q, setQ] = useState("");
  const [produtos, setProdutos] = useState<ProdutoDoPdv[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [avulso, setAvulso] = useState<{ nome: string; valor: string } | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  // "/" leva à busca de qualquer lugar do caixa.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName)) {
        e.preventDefault();
        campo.current?.focus();
        campo.current?.select();
      }
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  useEffect(() => {
    const termo = q.trim();
    if (termo.length < 2) {
      setProdutos([]);
      setErro(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setCarregando(true);
      try {
        const r = await fetch(`/api/pdv/produtos?q=${encodeURIComponent(termo)}`, { signal: ctrl.signal });
        const j = await r.json();
        setProdutos(j.produtos ?? []);
        setErro(j.erro ?? null);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setErro("A busca não respondeu. Tente de novo.");
      } finally {
        if (!ctrl.signal.aborted) setCarregando(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  function confirmarAvulso(e: React.FormEvent) {
    e.preventDefault();
    if (!avulso) return;
    const valor = Number(avulso.valor.replace(/\./g, "").replace(",", "."));
    if (!avulso.nome.trim() || !(valor > 0)) return;
    aoAvulso(avulso.nome.trim(), valor);
    setAvulso(null);
    campo.current?.focus();
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Produtos do site">
      <div className="flex gap-3 p-4 pb-3 lg:p-6 lg:pb-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--texto-suave)]" aria-hidden />
          <input
            ref={campo}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && produtos[0]) {
                aoEscolher(produtos[0]);
                setQ("");
              }
              if (e.key === "Escape") setQ("");
            }}
            autoFocus
            placeholder="Buscar no catálogo do site: ssd 1tb, rtx 4060, notebook…"
            aria-label="Buscar produto"
            className="w-full rounded-2xl border border-[var(--linha)] bg-[var(--painel)] py-4 pl-12 pr-12 text-lg outline-none transition focus:border-[var(--vermelho)]"
          />
          {q && (
            <button
              onClick={() => {
                setQ("");
                campo.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--texto-suave)] hover:bg-white/10"
              aria-label="Limpar busca"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setAvulso({ nome: "", valor: "" })}
          className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--linha)] bg-[var(--painel)] px-4 font-semibold hover:border-slate-500"
        >
          <PackagePlus className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Item avulso</span>
        </button>
      </div>

      {avulso && (
        <form onSubmit={confirmarAvulso} className="mx-4 mb-3 flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--linha)] bg-[var(--superficie)] p-4 lg:mx-6">
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Descrição (serviço, peça sem cadastro)</span>
            <input
              autoFocus
              value={avulso.nome}
              onChange={(e) => setAvulso({ ...avulso, nome: e.target.value })}
              placeholder="Formatação com backup"
              className="w-full rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2.5 outline-none focus:border-[var(--vermelho)]"
            />
          </label>
          <label className="w-36 text-sm">
            <span className="mb-1 block text-[var(--texto-suave)]">Valor</span>
            <input
              inputMode="decimal"
              value={avulso.valor}
              onChange={(e) => setAvulso({ ...avulso, valor: e.target.value })}
              placeholder="150,00"
              className="w-full rounded-xl border border-[var(--linha)] bg-[var(--carvao)] px-3 py-2.5 text-right outline-none focus:border-[var(--vermelho)]"
            />
          </label>
          <button type="submit" className="rounded-xl bg-[var(--vermelho)] px-5 py-2.5 font-bold">
            Pôr na venda
          </button>
          <button type="button" onClick={() => setAvulso(null)} className="rounded-xl px-3 py-2.5 text-[var(--texto-suave)] hover:text-white">
            Cancelar
          </button>
        </form>
      )}

      <div className="pdv-rolagem min-h-0 flex-1 overflow-y-auto px-4 pb-28 lg:px-6 lg:pb-6">
        {erro && <p className="mb-3 rounded-xl bg-red-950/40 px-4 py-3 text-sm text-red-200">{erro}</p>}
        {q.trim().length < 2 ? (
          <div className="flex h-full min-h-[40vh] flex-col items-center justify-center text-center text-[var(--texto-suave)]">
            <p className="text-lg text-slate-200">Digite o produto para começar a venda.</p>
            <p className="mt-2 max-w-md text-sm">
              Os preços são os do site. Enter põe o primeiro resultado na fita; a tecla / volta para a busca de qualquer lugar.
            </p>
          </div>
        ) : carregando && produtos.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-[var(--painel)]" />
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center text-[var(--texto-suave)]">
            <p className="text-slate-200">Nada no catálogo com “{q.trim()}”.</p>
            <p className="mt-1 text-sm">Tente outra palavra, ou lance como item avulso.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {produtos.map((p) => {
              const qtd = noTicket[p.id] ?? 0;
              const preco = tabela === "cartao" && p.precoCartao ? p.precoCartao : p.precoVista;
              return (
                <li key={p.id}>
                  <button
                    onClick={() => aoEscolher(p)}
                    className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-[var(--superficie)] text-left transition hover:border-[var(--vermelho)] ${
                      qtd ? "border-[var(--vermelho)]" : "border-[var(--linha)]"
                    }`}
                  >
                    <div className="relative m-2 mb-0 flex aspect-square items-center justify-center rounded-xl bg-white p-3">
                      {p.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.foto} alt="" loading="lazy" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">sem foto</span>
                      )}
                      {qtd > 0 && (
                        <span className="pdv-numeros absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--vermelho)] px-2 text-sm font-black text-white">
                          {qtd}
                        </span>
                      )}
                      {p.prontaEntrega && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-semibold text-white">Pronta entrega</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <span className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-snug text-slate-100">{p.nome}</span>
                      <span className="pdv-numeros mt-2 text-xl font-black tracking-tight">{reais(preco)}</span>
                      {tabela === "vista" && p.precoCartao ? (
                        <span className="pdv-numeros text-xs text-[var(--texto-suave)]">{reais(p.precoCartao)} no cartão</span>
                      ) : tabela === "cartao" ? (
                        <span className="pdv-numeros text-xs text-[var(--texto-suave)]">{reais(p.precoVista)} à vista</span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
