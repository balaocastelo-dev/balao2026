// ============================================================
// Queda de preço: o preço de venda baixou de verdade?
//
// Pedido do Thiago em 12/10: todo produto cujo preço cair entra num container
// de "Queda de preço" na página inicial (logo depois do vídeo do banner) e na
// página /queda-de-preco, com o "de / por" em destaque.
//
// Até 12/10 o banco não guardava o preço anterior: a releitura da fonte
// sobrescrevia `price`. Agora a gravação das fontes (banco.ts → gravarPagina)
// compara o preço de venda novo com o atual e grava em `preco_anterior` o
// preço de antes, e em `queda_em` quando baixou.
//
// Regras (puras, testadas em __tests__/lib/queda-de-preco.test.ts):
// - conta como queda o que baixar pelo menos 2% e pelo menos R$ 1, para não
//   mostrar centavos de oscilação da KaBuM! como promoção;
// - duas quedas na mesma semana: o "de" continua sendo o preço mais alto;
// - o produto fica na vitrine por 7 dias depois da última queda;
// - se o preço voltar a subir até o "de", sai da vitrine na hora.
// A queda grande demais (mais da metade) continua sendo segurada antes, pela
// regra de retenção (calculo.ts → decidirPreco): ela só vira queda aqui depois
// de aceita.
// ============================================================

import type { Product } from "@/lib/utils";
import { parsePriceToNumber } from "@/lib/utils";

export const QUEDA_MINIMA = 0.02;
export const QUEDA_MINIMA_EM_REAIS = 1;
export const DIAS_NA_VITRINE = 7;

const MS_DO_DIA = 24 * 60 * 60 * 1000;

export interface EstadoDaQueda {
  preco_anterior: number | null;
  queda_em: string | null;
}

function dentroDaJanela(quedaEm: string | null, agora: string): boolean {
  if (!quedaEm) return false;
  const quando = Date.parse(quedaEm);
  const hoje = Date.parse(agora);
  if (!Number.isFinite(quando) || !Number.isFinite(hoje)) return false;
  return hoje - quando <= DIAS_NA_VITRINE * MS_DO_DIA;
}

/** `novo` é pelo menos 2% e R$ 1 mais barato que `antes`? */
export function baixou(antes: number, novo: number): boolean {
  if (!(antes > 0) || !(novo > 0)) return false;
  return novo <= antes * (1 - QUEDA_MINIMA) && antes - novo >= QUEDA_MINIMA_EM_REAIS;
}

/**
 * Decide o que gravar em preco_anterior / queda_em quando o preço de venda
 * (Pix) passa de `atual` para `novo`.
 */
export function decidirQueda(
  atual: { preco: number; preco_anterior: number | null; queda_em: string | null } | null,
  novo: number,
  agora: string
): EstadoDaQueda {
  const nada: EstadoDaQueda = { preco_anterior: null, queda_em: null };
  if (!atual || !(atual.preco > 0) || !(novo > 0)) return nada;

  const ativa = atual.preco_anterior != null && atual.preco_anterior > 0 && dentroDaJanela(atual.queda_em, agora);

  if (baixou(atual.preco, novo)) {
    // Queda nova. Se já havia uma na semana, o "de" fica o mais alto dos dois.
    const de = ativa && atual.preco_anterior! > atual.preco ? atual.preco_anterior! : atual.preco;
    return { preco_anterior: de, queda_em: agora };
  }
  // Sem queda nova: a anterior continua enquanto o preço seguir abaixo do "de".
  if (ativa && baixou(atual.preco_anterior!, novo)) {
    return { preco_anterior: atual.preco_anterior, queda_em: atual.queda_em };
  }
  return nada;
}

// ---------- vitrine ----------

export interface ProdutoEmQueda {
  produto: Product;
  de: number;
  por: number;
  /** Porcentagem da queda, inteira (ex.: 12 para 12%). */
  porcentagem: number;
  economia: number;
  queda_em: string;
}

/** O produto está em queda agora (dentro da janela e ainda abaixo do "de")? */
export function quedaDoProduto(p: Product, agora = new Date().toISOString()): ProdutoEmQueda | null {
  const de = Number(p.preco_anterior);
  const por = parsePriceToNumber(p.price);
  if (!p.queda_em || !dentroDaJanela(p.queda_em, agora) || !baixou(de, por)) return null;
  return {
    produto: p,
    de,
    por,
    porcentagem: Math.max(1, Math.floor(((de - por) / de) * 100 + 1e-6)),
    economia: Math.round((de - por) * 100) / 100,
    queda_em: p.queda_em,
  };
}

/** Produtos em queda, da maior queda (em %) para a menor; empate: a mais recente. */
export function produtosEmQueda(produtos: Product[], agora = new Date().toISOString()): ProdutoEmQueda[] {
  const vistos = new Set<string>();
  const saida: ProdutoEmQueda[] = [];
  for (const p of produtos) {
    if (vistos.has(p.id)) continue;
    vistos.add(p.id);
    const q = quedaDoProduto(p, agora);
    if (q) saida.push(q);
  }
  return saida.sort((a, b) => b.porcentagem - a.porcentagem || b.queda_em.localeCompare(a.queda_em));
}
