// ============================================================
// Faixa de preço de venda por tipo de produto, para o site inteiro.
//
// Vale para qualquer fonte (KaBuM!, TechSupri...), depois da margem:
//   o preço à vista fica dentro da faixa; o cartão acompanha na mesma
//   proporção e nunca fica abaixo do à vista.
//
// Pedido do Thiago em 10/10: toda fonte/carregador de notebook ou laptop
// custa entre R$ 119,00 e R$ 199,00.
//
// Trava: se o custo na fonte já passa do teto, o teto NÃO é aplicado (seria
// vender abaixo do custo); o produto fica com o preço da margem.
// ============================================================

import { arredondar, calcularVenda, formatarNumero, type PrecoDeOrigem, type PrecoDeVenda } from "./calculo";

export interface FaixaDeVenda {
  nome: string;
  min: number;
  max: number;
  casa: (nome: string, categoria: string) => boolean;
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

const DISPOSITIVO = /\b(notebook|notebooks|laptop|laptops|macbook|ultrabook|chromebook)\b/;
const ACESSORIO_QUE_NAO_E_FONTE = /\b(suporte|cooler|base|bateria|mochila|capa|case|bolsa|teclado|mouse|pelicula|memoria|ssd|hd|tela|dobradica|carcaca|limpeza)\b/;

export function ehFonteDeNotebook(nome: string, categoria = ""): boolean {
  const n = ` ${semAcento(nome).replace(/[^a-z0-9]+/g, " ")} `;
  const ultima = semAcento(String(categoria || "").split("/").pop() || "");
  const tipo = n.trim().split(" ")[0] || "";
  if (/^(fonte|carregador|adaptador)$/.test(tipo) && DISPOSITIVO.test(n)) return true;
  if (/\bfontes? (para |de )?notebook|carregador(es)? (para |de )?notebook/.test(ultima)) {
    return !ACESSORIO_QUE_NAO_E_FONTE.test(n);
  }
  return false;
}

export const FAIXAS: FaixaDeVenda[] = [
  { nome: "Fonte de notebook", min: 119, max: 199, casa: ehFonteDeNotebook },
];

export function faixaDoProduto(nome: string, categoria: string): FaixaDeVenda | null {
  return FAIXAS.find((f) => f.casa(nome, categoria)) || null;
}

/** Põe o preço já com margem dentro da faixa. Separado para teste. */
export function aplicarFaixa(venda: PrecoDeVenda, faixa: FaixaDeVenda | null, custoPix: number): PrecoDeVenda {
  if (!faixa || !(venda.pix > 0)) return venda;
  let pix = venda.pix;
  if (pix < faixa.min) pix = faixa.min;
  if (pix > faixa.max && custoPix < faixa.max) pix = faixa.max;
  if (pix === venda.pix) return venda;

  const proporcao = venda.pix > 0 ? venda.cartao / venda.pix : 1;
  const cartao = Math.max(pix, arredondar(pix * proporcao));
  const parcelas = Number(venda.installment.match(/^(\d+)x/)?.[1]) || 10;
  const desconto = cartao > 0 ? Math.round((1 - pix / cartao) * 100) : 0;
  return {
    pix,
    cartao,
    price: formatarNumero(pix),
    price_card: `R$ ${formatarNumero(cartao)}`,
    installment: `${parcelas}x de R$ ${formatarNumero(arredondar(cartao / parcelas))}`,
    discount_pix: `${Math.max(0, desconto)}%`,
  };
}

/** Preço de venda completo: margem e, se o tipo tiver, faixa. */
export function vendaDoProduto(
  origem: PrecoDeOrigem,
  margem: number,
  produto: { nome: string; categoria: string }
): PrecoDeVenda {
  return aplicarFaixa(calcularVenda(origem, margem), faixaDoProduto(produto.nome, produto.categoria), origem.pix);
}
