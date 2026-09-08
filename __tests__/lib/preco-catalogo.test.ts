import { describe, it, expect } from "vitest";
import { parsePriceToNumber } from "@/lib/utils";

/**
 * O CRM anunciava produto de R$ 14,70 como R$ 1.470,00 no WhatsApp, para o
 * cliente. A conversão que ele usava apagava tudo que não fosse dígito ou
 * ponto — a vírgula do formato brasileiro sumia e "14,70" virava 1470.
 *
 * Estes casos são os preços reais que apareceram no envio de teste.
 */
describe("preço do catálogo enviado no WhatsApp", () => {
  it("não multiplica por 100 o preço em formato brasileiro", () => {
    expect(parsePriceToNumber("14,70")).toBe(14.7);
    expect(parsePriceToNumber("15,00")).toBe(15);
  });

  it("entende o preço com R$ e com milhar", () => {
    expect(parsePriceToNumber("R$ 1.470,00")).toBe(1470);
    expect(parsePriceToNumber("R$ 3.999,90")).toBe(3999.9);
    expect(parsePriceToNumber("1.234.567,89")).toBe(1234567.89);
  });

  it("entende o formato com ponto decimal", () => {
    expect(parsePriceToNumber("14.70")).toBe(14.7);
    expect(parsePriceToNumber(14.7)).toBe(14.7);
  });

  it("valor sem centavos continua inteiro", () => {
    expect(parsePriceToNumber("3999")).toBe(3999);
    expect(parsePriceToNumber("R$ 70")).toBe(70);
  });

  it("vazio ou inválido vira zero, não NaN", () => {
    expect(parsePriceToNumber("")).toBe(0);
    expect(parsePriceToNumber(null)).toBe(0);
    expect(parsePriceToNumber(undefined)).toBe(0);
    expect(parsePriceToNumber("sob consulta")).toBe(0);
  });

  it("a conversão antiga de fato errava — este é o bug que saiu para o cliente", () => {
    // Reproduz o que estava no CRM, para deixar registrado o porquê da troca.
    const conversaoAntiga = (v: string) =>
      parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;

    expect(conversaoAntiga("14,70")).toBe(1470);
    expect(parsePriceToNumber("14,70")).toBe(14.7);
  });
});
