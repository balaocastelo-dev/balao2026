// ============================================================
// Preço do carrinho = preço do site AGORA.
//
// Problema achado em 25/10 pelo Thiago: produto em "Queda de preço" chegava no
// carrinho e no fechamento com o preço antigo, sem o desconto. Causa:
//   1. o carrinho guarda no navegador (localStorage "balao_cart") uma cópia do
//      produto do momento em que foi adicionado, e nunca reconsultava o preço;
//   2. o /api/checkout gravava o pedido com o preço que o navegador mandava,
//      sem olhar o banco — quem adicionou antes da queda pagava o preço velho,
//      e qualquer pessoa podia editar o carrinho e mandar R$ 1.
//
// Agora:
//   - o carrinho reconsulta os preços em /api/carrinho/precos ao abrir
//     (aplicarPrecos, abaixo) e mostra o "de / por" dos itens em queda;
//   - o checkout reprecifica tudo pelo banco (reprecificar, abaixo). Se algum
//     preço mudou, o pedido NÃO é criado: o cliente recebe os preços novos,
//     o carrinho atualiza e ele confirma de novo vendo o total certo.
// Regras puras, testadas em __tests__/lib/carrinho-precos.test.ts.
// ============================================================

import type { Product } from "@/lib/utils";
import { parsePriceToNumber } from "@/lib/utils";

/** Diferença mínima (em reais, por unidade) para considerar que o preço mudou. */
export const TOLERANCIA_DE_PRECO = 0.009;
/** Quantidade máxima de um mesmo item num pedido do site. */
export const QUANTIDADE_MAXIMA = 99;
/** Quantos itens diferentes o carrinho pode reconsultar de uma vez. */
export const MAXIMO_DE_ITENS = 40;

/** Os campos do produto que o carrinho atualiza quando o preço do site muda. */
export interface PrecoAtual {
  id: string;
  name: string;
  price: string;
  price_card?: string;
  preco_anterior?: number;
  queda_em?: string;
  availability?: string;
}

export function precoAtualDe(p: Product): PrecoAtual {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    price_card: p.price_card,
    preco_anterior: p.preco_anterior,
    queda_em: p.queda_em,
    availability: p.availability,
  };
}

export function quantidadeValida(valor: unknown): number {
  const n = Math.floor(Number(valor));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, QUANTIDADE_MAXIMA);
}

export function mesmoPreco(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCIA_DE_PRECO;
}

// ---------- no navegador: atualizar o carrinho guardado ----------

/**
 * Troca o preço dos itens guardados pelo preço atual do site.
 * Item que o site não devolveu fica como está (o checkout decide).
 * `mudaram` lista os nomes dos itens cujo preço Pix mudou.
 */
export function aplicarPrecos<T extends Product>(
  itens: T[],
  atuais: Record<string, PrecoAtual>
): { itens: T[]; mudaram: string[] } {
  const mudaram: string[] = [];
  const novos = itens.map((item) => {
    const atual = atuais[item.id];
    if (!atual || !atual.price) return item;
    const antes = parsePriceToNumber(item.price);
    const agora = parsePriceToNumber(atual.price);
    if (!(agora > 0)) return item;
    if (!mesmoPreco(antes, agora)) mudaram.push(item.name);
    return {
      ...item,
      price: atual.price,
      price_card: atual.price_card ?? item.price_card,
      preco_anterior: atual.preco_anterior,
      queda_em: atual.queda_em,
      availability: atual.availability ?? item.availability,
    };
  });
  return { itens: novos, mudaram };
}

// ---------- no servidor: reprecificar o pedido pelo banco ----------

export interface ItemEnviado {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  /** Preço unitário (Pix) que o navegador mandou. Só serve para comparar. */
  price_enviado: number;
}

export interface ItemReprecificado {
  product_id: string;
  name: string;
  image: string;
  quantity: number;
  /** Preço unitário (Pix) do banco agora. É este que vai para o pedido. */
  price: number;
  price_enviado: number;
  mudou: boolean;
  atual: PrecoAtual;
}

export interface Reprecificacao {
  itens: ItemReprecificado[];
  /** product_id dos itens que não existem mais (ou sem preço) no site. */
  faltando: string[];
  /** Algum preço do navegador era diferente do preço do banco? */
  algumMudou: boolean;
  subtotal: number;
}

export async function reprecificar(
  enviados: ItemEnviado[],
  buscar: (id: string) => Promise<Product | null>
): Promise<Reprecificacao> {
  const itens: ItemReprecificado[] = [];
  const faltando: string[] = [];

  for (const enviado of enviados) {
    const produto = enviado.product_id ? await buscar(enviado.product_id) : null;
    const preco = produto ? parsePriceToNumber(produto.price) : 0;
    if (!produto || !(preco > 0)) {
      faltando.push(enviado.product_id || enviado.name || "?");
      continue;
    }
    itens.push({
      product_id: produto.id || enviado.product_id,
      name: produto.name || enviado.name,
      image: produto.image || enviado.image,
      quantity: quantidadeValida(enviado.quantity),
      price: preco,
      price_enviado: enviado.price_enviado,
      mudou: !mesmoPreco(preco, enviado.price_enviado),
      atual: precoAtualDe(produto),
    });
  }

  const subtotal = Math.round(itens.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  return { itens, faltando, algumMudou: itens.some((i) => i.mudou), subtotal };
}
