import { unstable_cache, revalidateTag } from "next/cache";
import {
  getCategories,
  getCarouselImages,
  getHomeBlocks,
  getProducts,
  getProductsPaginated,
} from "./db";
import { listVitrinePagesPublic } from "./vitrine/db";
import {
  comEspelho,
  espelhoPaginado,
  espelhoTodos,
  lerCategoriasDoEspelho,
  lerBannersDoEspelho,
} from "./catalogo-espelho";

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
