// ============================================================
// PDV: os produtos vêm só do site (pedido do Thiago, 12/10/2026) — os mesmos
// preços da vitrine, à vista e no cartão. A busca passa pela mesma leitura em
// cache da busca do site (2 min), que cai na cópia do catálogo quando o MySQL
// está sem cota: o caixa continua achando produto.
// ============================================================

import { getCachedBuscaCompleta } from "@/lib/cache";
import { ehProntaEntrega, ordenar } from "@/lib/catalogo/filtros";
import type { Product } from "@/lib/utils";
import { lerPreco } from "./calculos";
import type { ProdutoDoPdv } from "./tipos";

export function produtoParaPdv(p: Product): ProdutoDoPdv {
  const foto = String(p.image || p.image_urls?.[0] || "").trim();
  const cartao = lerPreco(p.price_card);
  return {
    id: String(p.id),
    nome: String(p.name || ""),
    foto: foto || null,
    categoria: String(p.category || ""),
    marca: p.brand ? String(p.brand) : null,
    precoVista: lerPreco(p.price),
    precoCartao: cartao > 0 ? cartao : null,
    slug: p.slug || null,
    prontaEntrega: ehProntaEntrega(p),
  };
}

export function termosDaBusca(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 6);
}

export async function buscarProdutos(q: string, limite = 48): Promise<ProdutoDoPdv[]> {
  const termos = termosDaBusca(q);
  if (!termos.length || termos.join("").length < 2) return [];
  const achados = await getCachedBuscaCompleta(termos, 600);
  return ordenar(achados, "relevancia", termos)
    .map(produtoParaPdv)
    .filter((p) => p.precoVista > 0)
    .slice(0, limite);
}
