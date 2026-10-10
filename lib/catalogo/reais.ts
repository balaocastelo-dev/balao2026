const REAIS = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 39.898,67" (com espaço que não quebra a linha). */
export function emReais(valor: number): string {
  return REAIS.format(valor);
}
