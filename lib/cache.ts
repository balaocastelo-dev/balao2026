import { unstable_cache, revalidateTag } from "next/cache";
import {
  getCategories,
  getCarouselImages,
  getHomeBlocks,
  getProducts,
  getProductsPaginated,
  searchProductsByKeywords,
} from "./db";
import { listVitrinePagesPublic } from "./vitrine/db";

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
  async () => getProducts(),
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

  return unstable_cache(async () => searchProductsByKeywords(keywords, limit), chave, {
    revalidate: 300,
    tags: [TAG_PRODUTOS],
  })();
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

  return unstable_cache(async () => getProductsPaginated(opts), chave, {
    revalidate: 120,
    tags: [TAG_PRODUTOS],
  })();
}

/**
 * Derruba o cache do catálogo. Chamar sempre que produto for criado,
 * alterado ou removido — sem isso o site e o CRM continuariam mostrando o
 * preço antigo por até dois minutos.
 */
export function invalidarCacheProdutos() {
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

export const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["categories"],
  { revalidate: 300, tags: ["categories"] }
);

export const getCachedCarouselImages = unstable_cache(
  async () => getCarouselImages(true),
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
