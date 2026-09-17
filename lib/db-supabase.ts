import { supabase, CURATED_ONLY } from "./supabase";
import { Product, parsePriceToNumber } from "./utils";

type Row = Record<string, unknown>;

function mapSupabaseProduct(r: Row): Product {
  const parseJson = <T,>(value: unknown, fallback: T): T => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "object") return value as T;
    try { return (JSON.parse(String(value)) ?? fallback) as T; } catch { return fallback; }
  };
  // Supabase products has image_urls as ARRAY text[] or json, specs as jsonb
  let image_urls: string[] = [];
  if (Array.isArray(r.image_urls)) image_urls = r.image_urls as string[];
  else if (typeof r.image_urls === "string") {
    try { const p = JSON.parse(r.image_urls); if (Array.isArray(p)) image_urls = p; } catch { image_urls = []; }
  }
  // specs jsonb já vem como objeto
  let specs: Record<string, unknown> = {};
  if (typeof r.specs === "object" && r.specs !== null) specs = r.specs as Record<string, unknown>;
  else if (typeof r.specs === "string") {
    try { specs = JSON.parse(r.specs); } catch { specs = {}; }
  }
  return {
    id: String(r.id),
    name: String(r.name),
    price: String(r.price),
    image: String(r.image ?? ""),
    category: String(r.category ?? ""),
    slug: String(r.slug ?? ""),
    description: String(r.description ?? ""),
    specs,
    image_urls,
    brand: r.brand ? String(r.brand) : undefined,
    rating: r.rating ? String(r.rating) : undefined,
    installment: r.installment ? String(r.installment) : undefined,
    discount_pix: r.discount_pix ? String(r.discount_pix) : undefined,
    price_card: r.price_card ? String(r.price_card) : undefined,
    // No Supabase estas duas se chamam `status` e `product_url`. Os nomes
    // antigos continuam sendo lidos porque a cópia da VPS e o Turso ainda
    // usam a grafia antiga.
    availability: r.status ?? r.availability ? String(r.status ?? r.availability) : undefined,
    source_url: r.product_url ?? r.source_url ? String(r.product_url ?? r.source_url) : undefined,
    created_at: r.created_at ? String(r.created_at) : undefined,
    cost: r.cost != null && Number(r.cost) > 0 ? Number(r.cost) : undefined,
    supplier: r.supplier ? String(r.supplier) : undefined,
  } as Product;
}

const sortByPrice = (items: Product[]) => items.sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));

// Colunas leves para listas (home, categoria, busca, grupos).
//
// `select *` trazia description, specs e image_urls — campos pesados que
// faziam a consulta estourar o statement_timeout do banco (erro 57014) em
// 1000 linhas, e a página caía no espelho da VPS, devagar. O filtro por
// description continua funcionando (o WHERE roda no banco mesmo sem a coluna
// no select); só a página de produto precisa da linha completa.
// CONFERIDO contra o schema real em 15/09/2026. Não acrescente coluna aqui
// sem olhar a tabela: o PostgREST recusa a consulta INTEIRA com 400
// (42703, "column does not exist") quando uma só não existe, e o código
// devolve lista vazia. Foi exatamente isso que deixou a home e todas as
// páginas de categoria sem um único produto — `installment`, `discount_pix`,
// `price_card`, `availability`, `source_url`, `brand` e `rating` estavam
// nesta lista e nenhuma delas existe na tabela.
const COLUNAS_LISTA =
  "id,name,price,image,category,slug,product_url,created_at,cost,supplier,status,stock";

// O PostgREST devolve no maximo 1000 linhas por consulta, em silencio: sem
// erro e sem aviso. Um `select` direto entregava 1000 de 1288 curados, e o
// espelho da VPS é — que existe para segurar o site quando o banco cai — ficava
// com 288 produtos a menos sem ninguem perceber. Por isso paginamos.
const PAGINA_SUPABASE = 1000;

export async function getProductsCurated(): Promise<Product[]> {
  const linhas: Row[] = [];

  for (let inicio = 0; ; inicio += PAGINA_SUPABASE) {
    let query = supabase
      .from("products")
      .select(COLUNAS_LISTA)
      .order("created_at", { ascending: false })
      .range(inicio, inicio + PAGINA_SUPABASE - 1);
    if (CURATED_ONLY) query = query.eq("is_curated", true);

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getProductsCurated error", error);
      // Devolve o que ja veio: meio catalogo e melhor que catalogo nenhum.
      break;
    }

    const pagina = (data as Row[]) || [];
    linhas.push(...pagina);
    if (pagina.length < PAGINA_SUPABASE) break;
  }

  return sortByPrice(linhas.map(mapSupabaseProduct));
}

export async function getProductsPaginatedCurated(opts: { page?: number; limit?: number; search?: string; category?: string; sort?: "price_asc" | "recent"; }): Promise<{ products: Product[]; total: number }> {
  const page = Math.max(1, opts.page || 1);
  const limit = Math.min(200, Math.max(1, opts.limit || 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("products").select(COLUNAS_LISTA, { count: "exact" });
  if (CURATED_ONLY) query = query.eq("is_curated", true);

  if (opts.search?.trim()) {
    const s = `%${opts.search.trim().toLowerCase()}%`;
    // ilike em name, id, supplier, category
    query = query.or(`name.ilike.${s},id.ilike.${s},supplier.ilike.${s},category.ilike.${s}`);
  }
  if (opts.category?.trim()) {
    const cat = opts.category.trim();
    // categoria exata ou subcategoria
    query = query.or(`category.eq.${cat},category.ilike.${cat}/%`);
  }

  if (opts.sort === "price_asc") {
    // price é texto "R$ 1.234,56" - ordenar por sale_price se existir senão por created_at
    query = query.order("sale_price", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) { console.error("Supabase paginated error", error); return { products: [], total: 0 }; }
  const products = (data as Row[]).map(mapSupabaseProduct);
  // sortByPrice só se price_asc e sale_price não confiável - manter ordenação por preço texto
  const sorted = opts.sort === "price_asc" ? sortByPrice(products) : products;
  return { products: sorted, total: count ?? 0 };
}

export async function getProductByIdentifierCurated(identifier: string): Promise<Product | null> {
  let query = supabase.from("products").select("*").or(`slug.eq.${identifier},id.eq.${identifier}`).limit(1);
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  const { data, error } = await query;
  if (error) { console.error("Supabase getProductByIdentifier error", error); return null; }
  if (!data || data.length === 0) return null;
  return mapSupabaseProduct(data[0] as Row);
}

export async function searchProductsByKeywordsCurated(keywords: string[], limit = 24): Promise<Product[]> {
  const normalized = [...new Set(keywords.map(k => String(k||"").trim().toLowerCase()).filter(Boolean))];
  if (normalized.length === 0) return [];
  let query = supabase.from("products").select(COLUNAS_LISTA).limit(Math.max(limit, normalized.length * 12));
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  // Para cada keyword, precisa bater em name OR category OR description - Supabase OR não faz AND entre keywords, então filtramos em memória se preciso
  // Primeiro pega candidatos com OR de todas keywords
  const orClause = normalized.map(k => `name.ilike.%${k}%,category.ilike.%${k}%,description.ilike.%${k}%`).join(",");
  query = query.or(orClause);
  const { data, error } = await query;
  if (error) { console.error("Supabase searchKeywords error", error); return []; }
  const filtered = (data as Row[]).map(mapSupabaseProduct);
  return sortByPrice(filtered).slice(0, limit);
}

export async function searchProductsAllTermsCurated(terms: string[], limit = 10): Promise<Product[]> {
  const limpos = terms.map(t => String(t||"").trim()).filter(Boolean);
  if (limpos.length === 0) return [];
  // description entra no SELECT de propósito: este caminho filtra em memória
  // (AND entre termos) e o limite é pequeno, então não estoura o timeout.
  let query = supabase.from("products").select(`${COLUNAS_LISTA},description`).limit(limit);
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  // AND entre termos: cada termo precisa aparecer em name OR description
  // Supabase não tem AND direto no or, fazemos filtro em memória após buscar com OR
  const orClause = limpos.map(t => `name.ilike.%${t}%,description.ilike.%${t}%`).join(",");
  query = query.or(orClause);
  const { data, error } = await query;
  if (error) { console.error("Supabase searchAllTerms error", error); return []; }
  let products = (data as Row[]).map(mapSupabaseProduct);
  // Filtra para garantir que TODOS os termos batem
  products = products.filter(p => {
    const hay = `${p.name} ${p.description || ""}`.toLowerCase();
    return limpos.every(t => hay.includes(t.toLowerCase()));
  });
  return sortByPrice(products).slice(0, limit);
}

export async function getProductsByCategoryFullPathCurated(fullPath: string): Promise<Product[]> {
  if (!fullPath) return [];
  let query = supabase.from("products").select(COLUNAS_LISTA).or(`category.eq.${fullPath},category.ilike.${fullPath}/%`).order("created_at", { ascending: false });
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  const { data, error } = await query;
  if (error) { console.error("Supabase getByCategoryFullPath error", error); return []; }
  return sortByPrice((data as Row[]).map(mapSupabaseProduct));
}

export async function getProductsByExactCategoriesCurated(categoryNames: string[]): Promise<Product[]> {
  const normalized = [...new Set(categoryNames.map(n => String(n||"").trim()).filter(Boolean))];
  if (normalized.length === 0) return [];
  let query = supabase.from("products").select(COLUNAS_LISTA).in("category", normalized).order("created_at", { ascending: false });
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  const { data, error } = await query;
  if (error) { console.error("Supabase getByExactCategories error", error); return []; }
  return sortByPrice((data as Row[]).map(mapSupabaseProduct));
}

// Para sitemap: só curados
export async function getProductsForSitemapCurated(limit = 1000): Promise<Pick<Product,"id"|"slug"|"created_at">[]> {
  const take = Math.max(1, Math.min(5000, limit));
  let query = supabase.from("products").select("id, slug, created_at").order("created_at", { ascending: false }).limit(take);
  if (CURATED_ONLY) query = query.eq("is_curated", true);
  const { data, error } = await query;
  if (error) { console.error("Supabase sitemap error", error); return []; }
  return (data as any[]).filter(p => p.id && p.slug).map(p => ({ id: String(p.id), slug: String(p.slug), created_at: p.created_at ? String(p.created_at) : undefined }));
}

// Grupos curados para home blocks
export async function getCuratedGroups(): Promise<Record<string, Product[]>> {
  const groups = ["pc_gamer","notebook","monitor","impressora","setup_gamer"];
  const result: Record<string, Product[]> = {};
  for (const g of groups) {
    const { data, error } = await supabase.from("products").select(COLUNAS_LISTA).eq("is_curated", true).eq("curated_group", g).order("curated_rank", { ascending: true });
    if (!error && data) result[g] = (data as Row[]).map(mapSupabaseProduct);
    else result[g] = [];
  }
  return result;
}
