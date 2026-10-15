import type { FormaDePagamento } from "./oferta";

/**
 * A conta da calculadora da página do Overclock.
 *
 * É uma conta ilustrativa: supõe que o lojista deixe de pagar anúncio, como a
 * Balão da Informática fez, e desconta o custo de manter o sistema no ar. Não
 * promete venda nem faturamento.
 */

export type ResultadoForma = {
  id: FormaDePagamento["id"];
  nome: string;
  total: number;
  /** Em quantos meses o anúncio que deixou de pagar cobre o preço. null = não se paga só com isso. */
  mesesParaPagar: number | null;
  /** Anúncio que deixou de pagar menos manutenção e menos o preço pago, em 12 meses. */
  saldo12: number;
  saldo24: number;
};

export type ResultadoCalculo = {
  sobraPorMes: number;
  semAnuncio12: number;
  semAnuncio24: number;
  formas: ResultadoForma[];
};

function limpar(valor: number) {
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

/** Quanto já foi pago do Overclock até o mês `mes` (1, 2, 3…). */
export function pagoAteOMes(forma: Pick<FormaDePagamento, "total" | "parcelas">, mes: number) {
  if (mes <= 0) return 0;
  const parcelasPagas = Math.min(mes, forma.parcelas);
  return Math.round((forma.total / forma.parcelas) * parcelasPagas * 100) / 100;
}

export function calcular(
  gastoMensalComAnuncio: number,
  custoMensalParaManter: number,
  formas: FormaDePagamento[],
): ResultadoCalculo {
  const gasto = limpar(gastoMensalComAnuncio);
  const manter = limpar(custoMensalParaManter);
  const sobraPorMes = gasto - manter;

  return {
    sobraPorMes,
    semAnuncio12: gasto * 12,
    semAnuncio24: gasto * 24,
    formas: formas.map((forma) => ({
      id: forma.id,
      nome: forma.nome,
      total: forma.total,
      mesesParaPagar: sobraPorMes > 0 ? Math.ceil(forma.total / sobraPorMes) : null,
      saldo12: sobraPorMes * 12 - pagoAteOMes(forma, 12),
      saldo24: sobraPorMes * 24 - pagoAteOMes(forma, 24),
    })),
  };
}

/** "R$ 1.234" (sem centavos), do jeito que aparece na calculadora. */
export function reais(valor: number) {
  const sinal = valor < 0 ? "− " : "";
  return `${sinal}R$ ${Math.round(Math.abs(valor)).toLocaleString("pt-BR")}`;
}

/** Lê o que a pessoa digitou ("3.000", "3000,50", "R$ 3 mil" não) e devolve número. */
export function lerValorDigitado(texto: string): number {
  const so = texto.replace(/[^\d,]/g, "").replace(",", ".");
  const n = Number.parseFloat(so);
  return Number.isFinite(n) ? n : 0;
}
