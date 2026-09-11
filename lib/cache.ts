import { unstable_cache, revalidateTag } from "next/cache";
import {
  getCategories,
  getCarouselImages,
  getHomeBlocks,
  getProductById,
  getProducts,
  getProductsByCategoryFullPath,
  getProductsByExactCategories,
  getProductsPaginated,
  searchProductsAllTerms,
  searchProductsByKeywords,
} from "./db";
import { listVitrinePagesPublic } from "./vitrine/db";
import {
  comEspelho,
  espelhoPaginado,
  espelhoPorCaminhoDeCategoria,
  espelhoPorCategoriasExatas,
  espelhoPorIdentificador,
  espelhoPorPalavrasChave,
  espelhoPorTodosOsTermos,
  espelhoTodos,
  lerBannersDoEspelho,
  lerBlogDoEspelho,
  lerCategoriasDoEspelho,
} from "./catalogo-espelho";
import { listBlogPostsForPage } from "./blog-store";

// Toda leitura de produto passa por `comEspelho`: consulta o banco e, se ele
// devolver vazio (é o que acontece quando a cota de 500 conexões/hora da
// Hostinger estoura), serve a cópia guardada na VPS. Catálogo de meia hora
// atrás é melhor que catálogo nenhum no meio de um atendimento.
const listaVazia = (itens: unknown[]) => itens.length === 0;

/**
 * Etiqueta única do catálogo. Toda leitura de produto é marcada com ela, e
 * qualquer alteração no admin a invalida — é assim que o CRM enxerga na hora
 * o que foi mudado no site.
 */
export const TAG_PRODUTOS = "products";

/**
 * Catálogo com cache.
 *
 * O motivo é a cota do banco: a Hostinger permite 500 conexões por HORA, e a
 * Vercel abre conexão a cada requisição. Sem cache, uma visita movimentada
 * queima a cota e o catálogo aparece vazio no site e no CRM até a hora virar.
 *
 * Dois minutos é o equilíbrio: preço alterado no admin aparece rápido (e a
 * invalidação por etiqueta traz na hora), e o banco é consultado poucas vezes.
 */
export const getCachedProducts = unstable_cache(
  async () => comEspelho(() => getProducts(), espelhoTodos, listaVazia),
  ["products-all"],
  { revalidate: 120, tags: [TAG_PRODUTOS] }
);

/**
 * Busca por palavras-chave, com cache.
 *
 * As landing pages (PC Gamer, Notebooks, Manutenção…) chamam isto a cada
 * visita. Sem cache, cada visitante abre conexão com o banco — e a cota é de
 * 500 por hora.
 */
export function getCachedProductsByKeywords(keywords: string[], limit = 24) {
  const chave = ["products-keywords", keywords.slice().sort().join("|"), String(limit)];

  return unstable_cache(
    async () =>
      comEspelho(
        () => searchProductsByKeywords(keywords, limit),
        (produtos) => espelhoPorPalavrasChave(produtos, keywords, limit),
        listaVazia
      ),
    chave,
    { revalidate: 300, tags: [TAG_PRODUTOS] }
  )();
}

export function getCachedProductsPaginated(opts: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: "price_asc" | "recent";
}) {
  // Cada combinação de filtro tem a própria entrada — daí a chave carregar os
  // parâmetros.
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
        (resultado) => resultado.total === 0
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Busca da caixa de pesquisa do site, com cache.
 *
 * Era o último caminho público lendo o banco a cada requisição: cada visitante
 * que digitava na busca gastava uma conexão das 500 por hora. Meia hora de
 * cache é de sobra — catálogo não muda de minuto em minuto, e alteração de
 * produto invalida a etiqueta na hora.
 */
export function getCachedBusca(termos: string[], limit = 10) {
  const chave = ["busca-termos", termos.slice().sort().join("|"), String(limit)];

  return unstable_cache(
    async () =>
      comEspelho(
        () => searchProductsAllTerms(termos, limit),
        (produtos) => espelhoPorTodosOsTermos(produtos, termos, limit),
        listaVazia
      ),
    chave,
    { revalidate: 1800, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Blocos de produtos da página inicial, com cache.
 *
 * A home é a página mais visitada do site e estava lendo o banco a CADA
 * visita. Com a cota de 500 conexões por hora da Hostinger, bastava um pico
 * de acesso (ou um robô de busca passando pelas páginas) para o catálogo
 * inteiro sumir do site e do CRM até a hora virar.
 */
export function getCachedProductsByExactCategories(categoryNames: string[]) {
  // Cada conjunto de categorias tem a própria entrada; ordenar deixa a chave
  // estável quando a mesma lista vem em ordem diferente.
  const chave = ["products-exact-categories", categoryNames.slice().sort().join("|")];

  return unstable_cache(
    async () =>
      comEspelho(
        () => getProductsByExactCategories(categoryNames),
        (produtos) => espelhoPorCategoriasExatas(produtos, categoryNames),
        listaVazia
      ),
    chave,
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Um produto pelo id/slug, com cache.
 *
 * Mesma razão da home: a página de produto é a segunda mais visitada, e cada
 * visita abria conexão. Robô de busca varrendo os 4.155 produtos queimava a
 * cota inteira sozinho.
 */
export function getCachedProductById(id: string) {
  return unstable_cache(
    async () =>
      comEspelho(
        () => getProductById(id),
        (produtos) => espelhoPorIdentificador(produtos, id),
        (produto) => produto === null
      ),
    ["product-by-id", String(id)],
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/** Produtos de uma categoria (caminho completo), com cache. */
export function getCachedProductsByCategoryFullPath(fullPath: string) {
  return unstable_cache(
    async () =>
      comEspelho(
        () => getProductsByCategoryFullPath(fullPath),
        (produtos) => espelhoPorCaminhoDeCategoria(produtos, fullPath),
        listaVazia
      ),
    ["products-category-path", String(fullPath)],
    { revalidate: 120, tags: [TAG_PRODUTOS] }
  )();
}

/**
 * Derruba o cache do catálogo. Chamar sempre que produto for criado,
 * alterado ou removido — sem isso o site e o CRM continuariam mostrando o
 * preço antigo por até dois minutos.
 */
export function invalidarCacheProdutos() {
  // Avisa a VPS para rebuscar o catálogo agora. Sem isto, a cópia dela
  // levaria até meia hora para saber do preço novo — e num dia de cota
  // estourada é ela quem o site mostra.
  //
  // Sem `await` de propósito: quem salvou o produto não deve esperar a VPS
  // responder, e se ela estiver fora do ar a cópia velha continua servindo.
  const servidor = (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    ""
  ).replace(/\/$/, "");

  if (servidor) {
    fetch(`${servidor}/api/crm/catalogo/atualizar`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // A VPS se atualiza sozinha na próxima rodada; não é motivo para
      // derrubar o salvamento do produto.
    });
  }

  try {
    // No Next 16 o segundo argumento é obrigatório: diz por quanto tempo a
    // entrada ainda pode ser servida enquanto a nova é buscada. Zero =
    // expira imediatamente, que é o que se espera de "o preço mudou".
    revalidateTag(TAG_PRODUTOS, { expire: 0 });
  } catch (error) {
    // Fora de um contexto de request o Next recusa a chamada; não é motivo
    // para derrubar a operação que acabou de salvar o produto.
    console.warn("[cache] Não consegui invalidar o catálogo:", error);
  }
}

/** Etiqueta das categorias, para invalidar quando o admin mexe na árvore. */
export const TAG_CATEGORIAS = "categories";

export const getCachedCategories = unstable_cache(
  async () => {
    const doBanco = await getCategories();
    if (doBanco.length > 0) return doBanco;

    // Sem categorias, a home e as páginas `/categoria/*` nem chegam a
    // perguntar por produto: elas descobrem qual categoria está aberta
    // olhando esta árvore. Era por isso que o catálogo continuava sumindo
    // dessas telas mesmo com a cópia dos produtos a salvo.
    return lerCategoriasDoEspelho();
  },
  ["categories"],
  { revalidate: 300, tags: [TAG_CATEGORIAS] }
);

/**
 * Derruba o cache das categorias. Chamar depois de criar, alterar ou remover
 * categoria — sem isso o menu e o CRM ficariam até cinco minutos com a árvore
 * antiga.
 */
export function invalidarCacheCategorias() {
  try {
    revalidateTag(TAG_CATEGORIAS, { expire: 0 });
  } catch (error) {
    console.warn("[cache] Não consegui invalidar as categorias:", error);
  }
}

export const getCachedCarouselImages = unstable_cache(
  async () => {
    const doBanco = await getCarouselImages(true);
    if (doBanco.length > 0) return doBanco;

    // Sem banner a home perde o topo — foi o que aconteceu na última queda do
    // banco. A cópia da VPS guarda todos; aqui ficam só os ativos, como no
    // banco.
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

/**
 * Posts do blog para a home, com a cópia da VPS por trás.
 *
 * A seção de blog da home sumia junto com o banco. A cópia guarda os posts já
 * filtrados pelo site quando ele estava saudável — então o que volta é o mesmo
 * que apareceria normalmente.
 */
export function getCachedBlogDaHome<T>(quantidade = 6) {
  return unstable_cache(
    async () => {
      const doBanco = (await listBlogPostsForPage({
        take: quantidade,
        skipDynamicFallback: true,
      })) as T[];
      if (doBanco.length > 0) return doBanco;

      return (await lerBlogDoEspelho<T>()).slice(0, quantidade);
    },
    ["blog-home", String(quantidade)],
    { revalidate: 300, tags: ["blog"] }
  )();
}

export const getCachedVitrinePages = unstable_cache(
  async () => listVitrinePagesPublic(),
  ["vitrine-pages-public"],
  { revalidate: 300, tags: ["vitrine"] }
);
