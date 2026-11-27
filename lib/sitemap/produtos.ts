import { getProductsForSitemap } from "@/lib/db";
import { lerCatalogoDoEspelho } from "@/lib/catalogo-espelho";
import type { Product } from "@/lib/utils";

export type ProdutoDoSitemap = Pick<Product, "id" | "slug" | "created_at">;

/**
 * O Google aceita 50 mil endereços por arquivo. O catálogo passou de 5.000
 * e o teto antigo cortava o resto. Cada arquivo do índice leva um pedaço.
 */
export const PRODUTOS_POR_ARQUIVO = 10000;
export const LIMITE_DE_PRODUTOS = 50000;

/**
 * Produtos que entram no sitemap.
 *
 * Por que existe: o banco da Hostinger recusa conexões quando a cota de 500
 * por hora estoura, e `getProductsForSitemap` engole o erro e devolve lista
 * vazia. A Vercel guardava esse sitemap magro (129 endereços, nenhum produto)
 * e o Google deixava de ver as páginas de produto. Agora, se o banco não
 * responder, os produtos saem da cópia do catálogo (VPS ou backup embutido) —
 * a mesma que as páginas de produto já usam, então todo endereço abre.
 */
export async function lerProdutosDoSitemap(
  doBanco: () => Promise<ProdutoDoSitemap[]> = () => getProductsForSitemap(LIMITE_DE_PRODUTOS),
  daCopia: () => Promise<Product[]> = lerCatalogoDoEspelho
): Promise<ProdutoDoSitemap[]> {
  const banco = await doBanco().catch(() => [] as ProdutoDoSitemap[]);
  const lista = banco.length > 0 ? banco : await daCopia().catch(() => [] as Product[]);

  const vistos = new Set<string>();
  const saida: ProdutoDoSitemap[] = [];
  for (const p of lista) {
    const slug = String(p?.slug || "").trim();
    if (!p?.id || !slug || vistos.has(slug)) continue;
    vistos.add(slug);
    saida.push({ id: String(p.id), slug, created_at: p.created_at || undefined });
    if (saida.length >= LIMITE_DE_PRODUTOS) break;
  }
  return saida;
}

/** Pedaços para o índice do sitemap. Lista vazia vira um arquivo vazio só. */
export function fatiarProdutos<T>(lista: T[], tamanho = PRODUTOS_POR_ARQUIVO): T[][] {
  const n = Math.max(1, Math.trunc(tamanho) || PRODUTOS_POR_ARQUIVO);
  if (lista.length === 0) return [[]];
  const fatias: T[][] = [];
  for (let i = 0; i < lista.length; i += n) fatias.push(lista.slice(i, i + n));
  return fatias;
}

/** Data só quando o produto tem uma de verdade; sem ela o Google ignora o campo. */
export function dataDoProduto(criadoEm?: string): Date | undefined {
  if (!criadoEm) return undefined;
  const data = new Date(criadoEm.includes("T") ? criadoEm : criadoEm.replace(" ", "T") + "Z");
  return Number.isNaN(data.getTime()) ? undefined : data;
}
