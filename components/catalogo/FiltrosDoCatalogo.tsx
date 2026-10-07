"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft, Loader2, SlidersHorizontal, X } from "lucide-react";
import type { Facetas, Filtros } from "@/lib/catalogo/filtros";

// ============================================================
// Painel de filtros das páginas de navegação do catálogo.
//
// O estado mora na URL (?cat=&marca=&min=&max=&tags=&ordem=): cada clique
// troca o endereço e o servidor devolve a lista já filtrada. Assim o filtro
// vale para o resultado inteiro, não só para a página que está na tela, e o
// link pode ser copiado e mandado para um cliente.
// ============================================================

interface Props {
  facetas: Facetas;
  filtros: Filtros;
  /** Quantos filtros estão ligados, para o selo do botão no celular. */
  ligados: number;
  /** Quantos produtos sobraram com os filtros atuais. */
  total: number;
  /** Ordem que vale quando a URL não diz nenhuma. */
  ordemPadrao: "relevancia" | "menor";
}

const MARCAS_VISIVEIS = 8;

function useNavegacaoDeFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendente, iniciar] = useTransition();

  /** Troca parâmetros da URL (null apaga) e volta para a primeira página. */
  const mudar = (mudancas: Record<string, string | null>) => {
    const q = new URLSearchParams(searchParams.toString());
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === null || valor === "") q.delete(chave);
      else q.set(chave, valor);
    }
    q.delete("page");
    const texto = q.toString();
    iniciar(() => router.push(texto ? `${pathname}?${texto}` : pathname, { scroll: false }));
  };

  return { mudar, pendente };
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--site-border)] px-4 py-4 first:border-t-0">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--site-muted)]">{titulo}</h3>
      {children}
    </section>
  );
}

function Caixa({ marcada }: { marcada: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
        marcada ? "border-[#E60012] bg-[#E60012]" : "border-[var(--site-border)] bg-[var(--site-panel-muted)]"
      }`}
    >
      {marcada && <Check size={11} className="text-white" strokeWidth={3} />}
    </span>
  );
}

function FaixaDePreco({
  idBase,
  faixa,
  min: minInicial,
  max: maxInicial,
  aoAplicar,
}: {
  idBase: string;
  faixa: { min: number; max: number };
  min: number | null;
  max: number | null;
  aoAplicar: (min: string | null, max: string | null) => void;
}) {
  const [min, setMin] = useState(minInicial != null ? String(minInicial) : "");
  const [max, setMax] = useState(maxInicial != null ? String(maxInicial) : "");
  const limpar = (v: string) => v.replace(/[^\d,.]/g, "").trim();
  const campo =
    "mt-1 block w-full rounded-md border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-2 py-1.5 text-sm text-[var(--site-text)] outline-none focus:border-[#E60012]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        aoAplicar(limpar(min) || null, limpar(max) || null);
      }}
      className="flex items-end gap-2"
    >
      <label className="min-w-0 flex-1 text-xs text-[var(--site-muted)]">
        De
        <input id={`${idBase}-min`} inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} placeholder={String(faixa.min)} className={campo} />
      </label>
      <label className="min-w-0 flex-1 text-xs text-[var(--site-muted)]">
        Até
        <input id={`${idBase}-max`} inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(faixa.max)} className={campo} />
      </label>
      <button type="submit" className="shrink-0 cursor-pointer rounded-md bg-[#E60012] px-3 py-1.5 text-sm font-bold text-white hover:bg-red-700">
        OK
      </button>
    </form>
  );
}

function Painel({ facetas, filtros, ligados, ordemPadrao, idBase }: Props & { idBase: string }) {
  const { mudar, pendente } = useNavegacaoDeFiltros();
  const [todasAsMarcas, setTodasAsMarcas] = useState(false);

  const alternar = (chave: "marca" | "tags", atuais: string[], valor: string) => {
    const novos = atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor];
    mudar({ [chave]: novos.length ? novos.join(",") : null });
  };

  const marcadas = new Set(filtros.marcas.map((m) => m.toLowerCase()));
  const marcas = todasAsMarcas ? facetas.marcas : facetas.marcas.slice(0, MARCAS_VISIVEIS);
  const acima = facetas.trilha.length > 1 ? facetas.trilha[facetas.trilha.length - 2] : null;
  const raiz = facetas.trilha[0];
  const ordem = filtros.ordem || ordemPadrao;


  return (
    <div className={pendente ? "opacity-60 transition-opacity" : "transition-opacity"} aria-busy={pendente}>
      <div className="flex items-center justify-between gap-2 border-b border-[var(--site-border)] bg-[var(--site-panel-muted)] px-4 py-3">
        <div className="flex items-center gap-2 font-bold text-[var(--site-text)]">
          <SlidersHorizontal size={18} className="text-[#E60012]" />
          <span>Filtrar</span>
          {pendente && <Loader2 size={14} className="animate-spin text-[var(--site-muted)]" />}
        </div>
        {ligados > 0 && (
          <button
            type="button"
            onClick={() => mudar({ cat: null, marca: null, min: null, max: null, tags: null })}
            className="cursor-pointer text-xs font-semibold text-[#E60012] hover:underline"
          >
            Limpar ({ligados})
          </button>
        )}
      </div>

      <Bloco titulo="Ordenar por">
        <select
          id={`${idBase}-ordem`}
          aria-label="Ordenar por"
          value={ordem}
          onChange={(e) => mudar({ ordem: e.target.value === ordemPadrao ? null : e.target.value })}
          className="block w-full cursor-pointer rounded-md border border-[var(--site-border)] bg-[var(--site-panel-soft)] p-2 text-sm text-[var(--site-text)] outline-none focus:border-[#E60012]"
        >
          {ordemPadrao === "relevancia" && <option value="relevancia">Mais relevantes</option>}
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </Bloco>

      {(facetas.categorias.length > 0 || acima) && (
        <Bloco titulo="Categoria">
          {acima && (
            <button
              type="button"
              onClick={() => mudar({ cat: acima.caminho === raiz.caminho ? null : acima.caminho })}
              className="mb-2 flex w-full cursor-pointer items-center gap-1 text-left text-sm font-semibold text-[var(--site-text)] hover:text-[#E60012]"
            >
              <ChevronLeft size={16} className="shrink-0" />
              <span className="truncate">{acima.nome}</span>
            </button>
          )}
          {facetas.trilha.length > 1 && (
            <p className="mb-2 rounded-md bg-[var(--site-accent-soft)] px-2 py-1.5 text-sm font-bold text-[var(--site-text)]">
              {facetas.trilha[facetas.trilha.length - 1].nome}
            </p>
          )}
          <ul className="space-y-0.5">
            {facetas.categorias.map((c) => (
              <li key={c.caminho}>
                <button
                  type="button"
                  onClick={() => mudar({ cat: c.caminho })}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-[var(--site-soft)] hover:bg-[var(--site-panel-muted)] hover:text-[var(--site-text)]"
                >
                  <span className="truncate">{c.nome}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--site-muted)]">{c.total}</span>
                </button>
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {facetas.marcas.length > 0 && (
        <Bloco titulo="Marca">
          <ul className="space-y-0.5">
            {marcas.map((m) => {
              const marcada = marcadas.has(m.nome.toLowerCase());
              return (
                <li key={m.nome}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={marcada}
                    onClick={() => alternar("marca", filtros.marcas, marcada ? filtros.marcas.find((x) => x.toLowerCase() === m.nome.toLowerCase()) || m.nome : m.nome)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--site-panel-muted)]"
                  >
                    <Caixa marcada={marcada} />
                    <span className={`flex-1 truncate ${marcada ? "font-semibold text-[var(--site-text)]" : "text-[var(--site-soft)]"}`}>{m.nome}</span>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--site-muted)]">{m.total}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {facetas.marcas.length > MARCAS_VISIVEIS && (
            <button
              type="button"
              onClick={() => setTodasAsMarcas((v) => !v)}
              className="mt-2 cursor-pointer px-2 text-xs font-semibold text-[#E60012] hover:underline"
            >
              {todasAsMarcas ? "Ver menos" : `Ver todas as ${facetas.marcas.length} marcas`}
            </button>
          )}
        </Bloco>
      )}

      {facetas.faixa && (
        <Bloco titulo="Preço à vista">
          {/* A chave refaz os campos quando o preço muda por outro caminho
              (Limpar, voltar do navegador): a URL é quem manda. */}
          <FaixaDePreco
            key={`${filtros.min ?? ""}-${filtros.max ?? ""}`}
            idBase={idBase}
            faixa={facetas.faixa}
            min={filtros.min}
            max={filtros.max}
            aoAplicar={(min, max) => mudar({ min, max })}
          />
        </Bloco>
      )}

      {facetas.tags.length > 0 && (
        <Bloco titulo="Características">
          <div className="flex flex-wrap gap-1.5">
            {facetas.tags.map((t) => {
              const marcada = filtros.tags.includes(t.name);
              return (
                <button
                  key={t.name}
                  type="button"
                  aria-pressed={marcada}
                  onClick={() => alternar("tags", filtros.tags, t.name)}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                    marcada
                      ? "border-[#E60012] bg-[#E60012] text-white"
                      : "border-[var(--site-border)] bg-[var(--site-panel-muted)] text-[var(--site-soft)] hover:border-[#E60012] hover:text-[var(--site-text)]"
                  }`}
                >
                  {t.name}
                  {t.count > 0 && <span className={marcada ? "ml-1 opacity-80" : "ml-1 text-[var(--site-muted)]"}>{t.count}</span>}
                </button>
              );
            })}
          </div>
        </Bloco>
      )}
    </div>
  );
}

/** Coluna fixa ao lado da lista, do tablet deitado para cima. */
export function FiltrosLaterais(props: Props) {
  return (
    <aside aria-label="Filtros" className="site-surface hidden h-fit w-64 shrink-0 overflow-hidden rounded-[1.6rem] shadow-lg lg:block">
      <Painel {...props} idBase="filtro-lateral" />
    </aside>
  );
}

/** No celular o painel vira uma gaveta, aberta por este botão. */
export function BotaoDeFiltros(props: Props) {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    if (!aberta) return;
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    document.addEventListener("keydown", fechar);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fechar);
      document.body.style.overflow = anterior;
    };
  }, [aberta]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setAberta(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-panel-soft)] px-4 py-2 text-sm font-bold text-[var(--site-text)]"
      >
        <SlidersHorizontal size={16} className="text-[#E60012]" />
        Filtrar
        {props.ligados > 0 && (
          <span className="rounded-full bg-[#E60012] px-1.5 text-xs font-bold text-white">{props.ligados}</span>
        )}
      </button>

      {/* Portal: o bloco de resultados usa backdrop-blur, e isso prende
          qualquer `position: fixed` de dentro dele. No <body> a gaveta ocupa a
          tela inteira e fica por cima do botão do WhatsApp. */}
      {aberta && createPortal(
        <div className="fixed inset-0 z-[2147483000]" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAberta(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-[340px] flex-col bg-[var(--site-panel)] shadow-2xl backdrop-blur-2xl">
            <div className="flex-1 overflow-y-auto pb-4">
              <Painel {...props} idBase="filtro-gaveta" />
            </div>
            <div className="flex items-center gap-3 border-t border-[var(--site-border)] p-3">
              <button
                type="button"
                onClick={() => setAberta(false)}
                className="flex-1 cursor-pointer rounded-xl bg-[#E60012] px-4 py-3 text-sm font-bold text-white"
              >
                Ver {props.total.toLocaleString("pt-BR")} {props.total === 1 ? "produto" : "produtos"}
              </button>
              <button
                type="button"
                onClick={() => setAberta(false)}
                aria-label="Fechar filtros"
                className="cursor-pointer rounded-xl border border-[var(--site-border)] p-3 text-[var(--site-muted)]"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
