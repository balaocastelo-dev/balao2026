import { unstable_cache, revalidateTag } from "next/cache";
import {
  getCategories,
  getCarouselImages,
  getHomeBlocks,
  getProducts,
  getProductsPaginated,
  getProductByIdentifier,
  getProductsByExactCategories,
  getProductsByCategoryFullPath,
  searchProductsByKeywords,
  buscarProdutosPorTermos,
  getComputadoresDaVitrine,
} from "./db";
import { listVitrinePagesPublic } from "./vitrine/db";
import {
  comEspelho,
  espelhoPaginado,
  espelhoTodos,
  espelhoPorIdentificador,
  espelhoPorCategoriasExatas,
  espelhoPorCaminhoDeCategoria,
  espelhoPorPalavrasChave,
  espelhoPorTodosOsTermos,
  lerCategoriasDoEspelho,
  lerBannersDoEspelho,
} from "./catalogo-espelho";
import { casaComTermos } from "./catalogo/filtros";
import { montarVitrine, RAIZ_DESKTOPS, RAIZ_NOTEBOOKS, type VitrinePremium } from "./catalogo/vitrine-premium";
import type { Product } from "./utils";

const listaVazia = (itens: unknown[]) => !Array.isArray(itens) || itens.length === 0;

/**
 * Etiqueta única do catálogo. Toda leitura de produto é marcada com ela, e
 * qualquer alteração no admin a invalida — é assim que o CRM enxerga na hora
 * o que foi mudado no site.
 */
export const TAG_PRODUTOS = "products";

/**
 * Catálogo com cache e espelho de contingência.
 */
export const getCachedProducts = unstable_cache(
  async () => comEspelho(() => getProducts(), espelhoTodos, listaVazia),
  ["products-all"],
  { revalidate: 120, tags: [TAG_PRODUTOS] }
);

export function getCachedProductsPaginated(opts: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "price_asc" | "recent";
}) {
  const chave = [
    "products-paginated",
    String(opts.page ?? 1),
    String(opts.limit ?? 50),
    opts.search ?? "",
    opts.category ?? "",
    opts.sort ?? "",
  ];

  return unstable_cache(
    async () =>
      comEspelho(
        () => getProductsPaginated(opts),
        (produtos) => espelhoPaginado(produtos, opts),
        (resultado) => !resultado || !Array.isArray(resultado.products) || resultado.total === 0
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Derruba o cache do catálogo e avisa a VPS para sincronizar.
 */
export function invalidarCacheProdutos() {
  const servidor = (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    "https://srv1963897.hstgr.cloud"
  ).replace(/\/$/, "");

  if (servidor) {
    fetch(`${servidor}/api/crm/catalogo/atualizar`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  try {
    revalidateTag(TAG_PRODUTOS, { expire: 0 });
  } catch (error) {
    console.warn("[cache] Não consegui invalidar o catálogo:", error);
  }
}

/**
 * As consultas de catálogo que faltavam ter contingência.
 *
 * Por que isto existe: quando o banco da Hostinger estoura a cota de 500
 * conexões por hora, `lib/db.ts` engole o erro e devolve lista vazia em
 * silêncio. O resultado é a LOJA INTEIRA aparecendo sem produto para o
 * cliente — home, categoria e página de produto — mesmo com a cópia da VPS
 * cheia, com os 4.100 produtos. Cada função abaixo tenta o banco e, se vier
 * vazio ou falhar, responde pela cópia.
 */

/** Página de produto. Devolve null de verdade quando o produto não existe. */
export function getCachedProductByIdentifier(identificador: string) {
  const chave = ["product-by-id", String(identificador || "")];
  return unstable_cache(
    async () =>
      comEspelho<Product | null>(
        () => getProductByIdentifier(identificador),
        (produtos) => espelhoPorIdentificador(produtos, identificador),
        (achado) => !achado
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/** Blocos da home montados por categoria exata. */
export function getCachedProductsByExactCategories(nomes: string[]) {
  const chave = ["products-exact-categories", nomes.join("|")];
  return unstable_cache(
    async () =>
      comEspelho<Product[]>(
        () => getProductsByExactCategories(nomes),
        (produtos) => espelhoPorCategoriasExatas(produtos, nomes),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/** Página /categoria/<caminho>, incluindo as subcategorias. */
export function getCachedProductsByCategoryFullPath(caminho: string) {
  const chave = ["products-category-path", String(caminho || "")];
  return unstable_cache(
    async () =>
      comEspelho<Product[]>(
        () => getProductsByCategoryFullPath(caminho),
        (produtos) => espelhoPorCaminhoDeCategoria(produtos, caminho),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/** As páginas de serviço (PC gamer, notebooks, assistência…). */
export function getCachedProductsByKeywords(palavras: string[], limite = 24) {
  const chave = ["products-keywords", palavras.join("|"), String(limite)];
  return unstable_cache(
    async () =>
      comEspelho<Product[]>(
        () => searchProductsByKeywords(palavras, limite),
        (produtos) => espelhoPorPalavrasChave(produtos, palavras, limite),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/** Caixa de busca do site: todos os termos precisam bater. */
export function getCachedSearchByTerms(termos: string[], limite = 10) {
  const chave = ["products-search-terms", termos.join("|"), String(limite)];
  return unstable_cache(
    async () =>
      comEspelho<Product[]>(
        async () => searchProductsByKeywords(termos, limite),
        (produtos) => produtos.filter((p) => casaComTermos(p, termos)).slice(0, limite),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Página de resultados da busca: todos os termos, sem o teto de 10 da caixa de
 * pesquisa. O resultado inteiro alimenta o painel de filtros.
 */
export function getCachedBuscaCompleta(termos: string[], limite = 1500) {
  const chave = ["products-busca-completa", termos.join("|"), String(limite)];
  return unstable_cache(
    async () =>
      comEspelho<Product[]>(
        () => buscarProdutosPorTermos(termos, limite),
        (produtos) => produtos.filter((p) => casaComTermos(p, termos)).slice(0, limite),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Seleção das páginas /premium e /ia-local: os computadores mais caros da loja
 * e as máquinas que atendem ao critério de IA local.
 *
 * As duas páginas dividem esta mesma leitura — uma consulta ao banco a cada
 * cinco minutos, no máximo, por causa do teto de 500 conexões por hora. O que
 * fica guardado é a seleção pronta (uns duzentos itens enxutos), não os quase
 * três mil computadores do catálogo: o cache do Next recusa entrada com mais
 * de 2 MB.
 */
export const getCachedVitrinePremium = unstable_cache(
  async (): Promise<VitrinePremium> => {
    const computadores = await comEspelho<Product[]>(
      () => getComputadoresDaVitrine(),
      (produtos) => [
        ...espelhoPorCaminhoDeCategoria(produtos, RAIZ_DESKTOPS),
        ...espelhoPorCaminhoDeCategoria(produtos, RAIZ_NOTEBOOKS),
      ],
      listaVazia
    );
    return montarVitrine(computadores);
  },
  ["vitrine-premium-v1"],
  { revalidate: 300, tags: [TAG_PRODUTOS] }
);

export const TAG_CATEGORIAS = "categories";

export const getCachedCategories = unstable_cache(
  async () => {
    try {
      const doBanco = await getCategories();
      if (Array.isArray(doBanco) && doBanco.length > 0) return doBanco;
    } catch {}
    return lerCategoriasDoEspelho();
  },
  ["categories"],
  { revalidate: 300, tags: [TAG_CATEGORIAS] }
);

export function invalidarCacheCategorias() {
  try {
    revalidateTag(TAG_CATEGORIAS, { expire: 0 });
  } catch (error) {
    console.warn("[cache] Não consegui invalidar as categorias:", error);
  }
}

export const getCachedCarouselImages = unstable_cache(
  async () => {
    try {
      const doBanco = await getCarouselImages(true);
      if (Array.isArray(doBanco) && doBanco.length > 0) return doBanco;
    } catch {}
    const daCopia = await lerBannersDoEspelho();
    return daCopia.filter((b) => b.active !== false);
  },
  ["carousel-images"],
  { revalidate: 300, tags: ["carousel"] }
);

export const getCachedHomeBlocks = unstable_cache(
  async () => getHomeBlocks(true),
  ["home-blocks"],
  { revalidate: 300, tags: ["home-blocks"] }
);

export const getCachedVitrinePages = unstable_cache(
  async () => listVitrinePagesPublic(),
  ["vitrine-pages-public"],
  { revalidate: 300, tags: ["vitrine"] }
);
