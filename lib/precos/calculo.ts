// ============================================================
// Preço de venda a partir do preço da fonte.
//
// A regra do Thiago: o site cobra o preço da fonte + uma margem em %, e a
// margem vale duas vezes — sobre o à vista (Pix) e sobre o cartão. Os dois
// preços aparecem no site e no CRM.
//
// O preço da fonte fica guardado no produto (origem_pix / origem_cartao). O
// preço de venda é sempre DERIVADO dele: mudar a margem no painel recalcula
// tudo sem precisar ler a fonte de novo.
//
// Tudo aqui é função pura, sem banco e sem rede, para poder ser testado.
// ============================================================

export interface PrecoDeOrigem {
  /** À vista na fonte. */
  pix: number;
  /** No cartão na fonte. */
  cartao: number;
  /** Em quantas vezes a fonte parcela (0 = desconhecido). */
  parcelas: number;
}

export interface PrecoDeVenda {
  pix: number;
  cartao: number;
  /** "1.234,56" — o formato que a coluna `price` do site já usa. */
  price: string;
  /** "R$ 1.234,56" */
  price_card: string;
  /** "10x de R$ 123,45" */
  installment: string;
  /** "15%" — quanto o à vista sai mais barato que o cartão. */
  discount_pix: string;
}

const PARCELAS_PADRAO = 10;

export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/** 1234.5 -> "1.234,50" */
export function formatarNumero(valor: number): string {
  const seguro = Number.isFinite(valor) ? valor : 0;
  return seguro.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function normalizarMargem(margem: unknown): number {
  const n = Number(margem);
  if (!Number.isFinite(n)) return 0;
  // Margem negativa venderia abaixo da fonte; acima de 500% é erro de digitação.
  return Math.min(500, Math.max(0, n));
}

export function aplicarMargem(valor: number, margem: number): number {
  if (!Number.isFinite(valor) || valor <= 0) return 0;
  return arredondar(valor * (1 + normalizarMargem(margem) / 100));
}

/** "10x de R$ 247,05" -> 10 */
export function lerParcelas(texto: unknown): number {
  const m = String(texto ?? "").match(/(\d{1,2})\s*x/i);
  const n = m ? Number(m[1]) : 0;
  return n >= 1 && n <= 24 ? n : 0;
}

export function calcularVenda(origem: PrecoDeOrigem, margem: number): PrecoDeVenda {
  const pix = aplicarMargem(origem.pix, margem);
  // Fonte sem preço de cartão: o cartão acompanha o à vista, nunca fica abaixo.
  const cartao = Math.max(pix, aplicarMargem(origem.cartao > 0 ? origem.cartao : origem.pix, margem));
  const parcelas = origem.parcelas > 0 ? origem.parcelas : PARCELAS_PADRAO;
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

// ---------- trava de queda brusca ----------

/**
 * Queda maior que isto entre uma leitura e a próxima fica retida.
 *
 * Só a QUEDA é retida. Se a fonte sobe, aplicar na hora é o lado seguro: quem
 * perde dinheiro é quem vende pelo preço antigo. Já uma queda de mais da metade
 * costuma ser erro de preço na fonte ou oferta-relâmpago que acaba em horas —
 * e a loja compra DEPOIS de vender.
 */
export const QUEDA_RETIDA = 0.5;

/** Depois deste tempo vendo o mesmo preço baixo, ele é aceito sozinho. */
export const HORAS_PARA_ACEITAR_QUEDA = 24;

export function quedaSuspeita(anterior: number, novo: number): boolean {
  if (!(anterior > 0) || !(novo > 0)) return false;
  return novo < anterior * (1 - QUEDA_RETIDA);
}

export type DecisaoDePreco =
  | { acao: "aplicar" }
  | { acao: "reter"; desde: string };

/**
 * Decide o que fazer com um preço novo vindo da fonte.
 *
 * @param anterior      preço à vista de origem já gravado (0 = produto novo)
 * @param novo          preço à vista lido agora
 * @param retidoDesde   desde quando já existe uma queda retida para o produto
 * @param agora         ISO do momento da leitura
 */
export function decidirPreco(
  anterior: number,
  novo: number,
  retidoDesde: string | null,
  agora: string
): DecisaoDePreco {
  if (!quedaSuspeita(anterior, novo)) return { acao: "aplicar" };

  if (retidoDesde) {
    const horas = (Date.parse(agora) - Date.parse(retidoDesde)) / 3_600_000;
    if (Number.isFinite(horas) && horas >= HORAS_PARA_ACEITAR_QUEDA) return { acao: "aplicar" };
    return { acao: "reter", desde: retidoDesde };
  }

  return { acao: "reter", desde: agora };
}
