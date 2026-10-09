"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import CartaoArtigo from "@/components/blog/CartaoArtigo";
import { CATEGORIAS } from "@/lib/blog/categorias";
import { semAcento } from "@/lib/blog/texto";
import type { ArtigoResumido, CategoriaSlug } from "@/lib/blog/tipos";

/**
 * A lista de artigos com busca, filtro por categoria e carregamento ao rolar.
 *
 * A página chega pronta do servidor com todos os artigos em um índice enxuto
 * (título, resumo, categoria, capa). Buscar e filtrar acontece aqui, na hora,
 * sem ida ao servidor — por isso não há espera nem tela piscando.
 *
 * Carregamento: os dois primeiros lotes entram sozinhos quando o leitor chega
 * ao fim da lista; depois disso aparece um botão. Rolagem infinita sem freio
 * esconde o rodapé, que é onde ficam endereço e telefone da loja.
 */

const LOTE = 7; // fecha três linhas certinhas na grade de três colunas
const LOTES_AUTOMATICOS = 2;

type Props = {
  artigos: ArtigoResumido[];
  /** Artigos que já estão na vitrine: ficam fora da lista enquanto não há filtro. */
  naVitrine?: string[];
  /** Fixa a categoria (páginas /blog/categoria/...). */
  categoriaFixa?: CategoriaSlug;
  /** Quantos artigos há em cada categoria no blog inteiro (nas páginas de categoria). */
  totais?: Partial<Record<CategoriaSlug | "todas", number>>;
};

const semAssinatura = () => () => {};
const lerEndereco = () => window.location.search;
const enderecoNoServidor = () => "";

function pontuar(artigo: ArtigoResumido, termos: string[]): number {
  const titulo = semAcento(artigo.titulo);
  const etiquetas = semAcento(artigo.etiquetas.join(" "));
  const resumo = semAcento(artigo.resumo);
  let pontos = 0;
  for (const termo of termos) {
    if (titulo.includes(termo)) pontos += 5;
    else if (etiquetas.includes(termo)) pontos += 3;
    else if (resumo.includes(termo)) pontos += 1;
    else return 0; // todos os termos precisam aparecer em algum lugar
  }
  return pontos;
}

export default function ListaDeArtigos({ artigos, naVitrine = [], categoriaFixa, totais }: Props) {
  // O que o leitor digitou ou escolheu. Enquanto ele não mexe em nada (null),
  // vale o que veio no endereço: um link com ?q=ssd ou ?categoria=hardware
  // abre a lista já filtrada.
  const [buscaDigitada, setBuscaDigitada] = useState<string | null>(null);
  const [categoriaEscolhida, setCategoriaEscolhida] = useState<CategoriaSlug | "todas" | null>(null);
  const [visiveis, setVisiveis] = useState(LOTE);
  const [lotesAutomaticos, setLotesAutomaticos] = useState(0);
  const sentinela = useRef<HTMLDivElement>(null);

  // No servidor o endereço é vazio; no navegador, é o da barra. Lido assim, a
  // página pronta e a página viva nunca discordam na primeira pintura.
  const endereco = useSyncExternalStore(semAssinatura, lerEndereco, enderecoNoServidor);
  const doEndereco = useMemo(() => {
    const parametros = new URLSearchParams(endereco);
    const c = parametros.get("categoria");
    return {
      busca: (parametros.get("q") ?? "").slice(0, 80),
      categoria: c && CATEGORIAS.some((cat) => cat.slug === c) ? (c as CategoriaSlug) : null,
    };
  }, [endereco]);

  const busca = buscaDigitada ?? doEndereco.busca;
  const categoria: CategoriaSlug | "todas" = categoriaFixa ?? categoriaEscolhida ?? doEndereco.categoria ?? "todas";

  // Mudou o filtro: a lista recomeça do primeiro lote, e o endereço acompanha,
  // para o link poder ser copiado e enviado.
  const aplicar = useCallback(
    (novaBusca: string, novaCategoria: CategoriaSlug | "todas") => {
      setBuscaDigitada(novaBusca);
      setCategoriaEscolhida(novaCategoria);
      setVisiveis(LOTE);
      setLotesAutomaticos(0);

      const url = new URL(window.location.href);
      if (novaBusca.trim()) url.searchParams.set("q", novaBusca.trim());
      else url.searchParams.delete("q");
      if (!categoriaFixa && novaCategoria !== "todas") url.searchParams.set("categoria", novaCategoria);
      else url.searchParams.delete("categoria");
      window.history.replaceState(window.history.state, "", url);
    },
    [categoriaFixa],
  );

  const termos = useMemo(
    () => semAcento(busca).split(/\s+/).filter((t) => t.length > 1),
    [busca],
  );
  const filtrando = termos.length > 0 || (categoria !== "todas" && !categoriaFixa);

  const contagem = useMemo(() => {
    const c = new Map<string, number>();
    for (const a of artigos) c.set(a.categoria, (c.get(a.categoria) ?? 0) + 1);
    return c;
  }, [artigos]);

  const resultado = useMemo(() => {
    let lista = artigos;
    if (categoria !== "todas") lista = lista.filter((a) => a.categoria === categoria);
    if (termos.length > 0) {
      return lista
        .map((artigo) => ({ artigo, pontos: pontuar(artigo, termos) }))
        .filter((r) => r.pontos > 0)
        .sort((a, b) => b.pontos - a.pontos)
        .map((r) => r.artigo);
    }
    // Sem filtro nenhum, a lista não repete o que já está na vitrine acima.
    if (!filtrando && naVitrine.length > 0) lista = lista.filter((a) => !naVitrine.includes(a.slug));
    return lista;
  }, [artigos, categoria, termos, filtrando, naVitrine]);

  const haMais = visiveis < resultado.length;
  const carregarMais = useCallback(() => setVisiveis((v) => v + LOTE), []);

  useEffect(() => {
    const alvo = sentinela.current;
    if (!alvo || !haMais || lotesAutomaticos >= LOTES_AUTOMATICOS) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setLotesAutomaticos((n) => n + 1);
          carregarMais();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [haMais, lotesAutomaticos, carregarMais, visiveis]);

  const limpar = () => aplicar("", categoriaFixa ?? "todas");

  const total = (slug: CategoriaSlug) => totais?.[slug] ?? contagem.get(slug) ?? 0;
  // Categoria sem artigo não vira filtro: botão que leva a lista vazia só frustra.
  const filtros: { slug: CategoriaSlug | "todas"; nome: string; total: number }[] = [
    { slug: "todas", nome: "Tudo", total: totais?.todas ?? artigos.length },
    ...CATEGORIAS.filter((c) => total(c.slug) > 0).map((c) => ({ slug: c.slug, nome: c.nome, total: total(c.slug) })),
  ];

  return (
    <section aria-label="Todos os artigos" id="artigos" className="scroll-mt-6">
      {/* Preso ao topo só em tela grande: no celular ele tomaria um sexto da tela. */}
      <div className="top-0 z-30 -mx-4 border-y border-[var(--b-linha)] bg-[rgba(9,13,22,0.92)] px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:sticky lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Categorias do blog" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {filtros.map((f) => {
              const ativo = categoria === f.slug;
              return (
                <Link
                  key={f.slug}
                  href={f.slug === "todas" ? "/blog" : `/blog/categoria/${f.slug}`}
                  prefetch={false}
                  aria-current={ativo ? "true" : undefined}
                  // Na página principal o filtro troca na hora, sem navegar; o
                  // endereço de cada categoria continua existindo para o Google
                  // e para quem abrir em outra aba.
                  onClick={
                    categoriaFixa
                      ? undefined
                      : (e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                          e.preventDefault();
                          aplicar(busca, f.slug);
                        }
                  }
                  className={`flex-none rounded-full border px-4 py-2 text-[0.875rem] font-bold transition-colors ${
                    ativo
                      ? "border-white bg-white text-[#090d16]"
                      : "border-[var(--b-linha-forte)] text-[var(--b-tinta-2)] hover:border-white hover:text-white"
                  }`}
                >
                  {f.nome}
                  <span className={`ml-2 font-semibold tabular-nums ${ativo ? "text-[#475569]" : "text-[var(--b-tinta-3)]"}`}>
                    {f.total}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="relative w-full lg:w-[22rem]">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[1.125rem] -translate-y-1/2 text-[var(--b-tinta-3)]" />
            <input
              type="search"
              value={busca}
              onChange={(e) => aplicar(e.target.value.slice(0, 80), categoria)}
              placeholder="Buscar: SSD, notebook, fonte…"
              aria-label="Buscar nos artigos"
              enterKeyHint="search"
              className="w-full rounded-full border border-[var(--b-linha-forte)] bg-[var(--b-painel)] py-2.5 pl-11 pr-11 text-[0.9375rem] text-white placeholder:text-[var(--b-tinta-3)] focus:border-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {busca ? (
              <button
                type="button"
                onClick={() => aplicar("", categoria)}
                aria-label="Limpar a busca"
                className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[var(--b-tinta-3)] hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p aria-live="polite" className={termos.length > 0 ? "mt-7 text-[0.9375rem] text-[var(--b-tinta-3)]" : "sr-only"}>
        {termos.length > 0
          ? `${resultado.length} ${resultado.length === 1 ? "artigo encontrado" : "artigos encontrados"} para “${busca.trim()}”`
          : ""}
      </p>

      {resultado.length > 0 ? (
        <div className="b-grade mt-9">
          {resultado.slice(0, visiveis).map((artigo, i) => (
            <CartaoArtigo
              key={artigo.slug}
              artigo={artigo}
              // O ritmo da grade: um cartão largo abre a primeira linha e outro
              // fecha a terceira, e o desenho se repete a cada sete.
              largo={i % LOTE === 0 || i % LOTE === LOTE - 1}
              animar={i >= LOTE}
            />
          ))}
        </div>
      ) : (
        <div className="mt-9 rounded-[18px] border border-[var(--b-linha)] bg-[var(--b-painel)] px-6 py-12 text-center">
          <p className="b-titulo text-[1.375rem] text-white">Nenhum artigo com esses termos</p>
          <p className="b-serifa mx-auto mt-3 max-w-md text-[1.0625rem] text-[var(--b-tinta-2)]">
            Tente uma palavra só — “notebook”, “SSD”, “fonte” — ou veja a lista completa.
          </p>
          <button
            type="button"
            onClick={limpar}
            className="mt-6 rounded-full bg-white px-5 py-2.5 text-[0.9375rem] font-bold text-[#090d16] hover:bg-[var(--b-tinta-2)]"
          >
            Ver todos os artigos
          </button>
        </div>
      )}

      <div ref={sentinela} aria-hidden className="h-px" />

      {haMais && lotesAutomaticos >= LOTES_AUTOMATICOS ? (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={carregarMais}
            className="rounded-full border border-[var(--b-linha-forte)] px-6 py-3 text-[0.9375rem] font-bold text-white hover:border-white"
          >
            Carregar mais artigos
            <span className="ml-2 font-semibold tabular-nums text-[var(--b-tinta-3)]">
              {resultado.length - visiveis} restantes
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
