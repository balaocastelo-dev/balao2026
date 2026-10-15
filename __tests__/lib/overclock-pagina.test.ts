import { describe, expect, it } from "vitest";
import { calcular, lerValorDigitado, pagoAteOMes, reais } from "@/app/overclock/_dados/calculo";
import { FORMAS_DE_PAGAMENTO, LINK_DEMONSTRACAO, LINK_QUERO } from "@/app/overclock/_dados/oferta";
import { VIDEOS, idDoYoutube } from "@/app/overclock/_dados/videos";

describe("página do Overclock: preços", () => {
  it("mantém os preços combinados", () => {
    const porId = Object.fromEntries(FORMAS_DE_PAGAMENTO.map((f) => [f.id, f]));
    expect(porId.avista.total).toBe(49999.99);
    expect(porId.cartao.parcelas).toBe(12);
    expect(porId.cartao.valorParcela).toBe(4999.99);
    expect(porId.cartao.total).toBe(59999.88);
    expect(porId.boleto.valorParcela).toBe(9999.99);
    expect(porId.boleto.total).toBe(119999.88);
  });

  it("parcela × número de parcelas bate com o total", () => {
    for (const f of FORMAS_DE_PAGAMENTO) {
      expect(Math.round(f.valorParcela * f.parcelas * 100) / 100).toBe(f.total);
    }
  });

  it("os botões abrem o WhatsApp de vendas com a mensagem pronta", () => {
    expect(LINK_QUERO).toContain("https://wa.me/5519987510267?text=");
    expect(decodeURIComponent(LINK_QUERO.split("text=")[1])).toBe(
      "Olá! Vi o Overclock em balao.info/overclock e quero saber mais para a minha loja.",
    );
    expect(LINK_DEMONSTRACAO).not.toBe(LINK_QUERO);
  });
});

describe("página do Overclock: calculadora", () => {
  it("conta em quantos meses se paga, descontando o custo de manter", () => {
    const r = calcular(3000, 200, FORMAS_DE_PAGAMENTO);
    expect(r.sobraPorMes).toBe(2800);
    expect(r.semAnuncio12).toBe(36000);
    expect(r.semAnuncio24).toBe(72000);
    const avista = r.formas.find((f) => f.id === "avista")!;
    expect(avista.mesesParaPagar).toBe(Math.ceil(49999.99 / 2800)); // 18
    expect(avista.saldo24).toBeCloseTo(2800 * 24 - 49999.99, 2);
  });

  it("no parcelado, só desconta as parcelas já pagas", () => {
    const cartao = FORMAS_DE_PAGAMENTO.find((f) => f.id === "cartao")!;
    expect(pagoAteOMes(cartao, 6)).toBeCloseTo(4999.99 * 6, 2);
    expect(pagoAteOMes(cartao, 24)).toBeCloseTo(59999.88, 2);
    expect(pagoAteOMes(cartao, 0)).toBe(0);
  });

  it("não inventa prazo quando o anúncio não cobre o custo de manter", () => {
    const r = calcular(150, 200, FORMAS_DE_PAGAMENTO);
    expect(r.sobraPorMes).toBeLessThanOrEqual(0);
    expect(r.formas.every((f) => f.mesesParaPagar === null)).toBe(true);
  });

  it("aceita valor digitado com ponto de milhar e lixo", () => {
    expect(lerValorDigitado("3.000")).toBe(3000);
    expect(lerValorDigitado("R$ 5.231,50")).toBe(5231.5);
    expect(lerValorDigitado("")).toBe(0);
    expect(calcular(Number.NaN, -10, FORMAS_DE_PAGAMENTO).sobraPorMes).toBe(0);
  });

  it("formata em reais sem centavos", () => {
    expect(reais(36000).replace(/\s/g, " ")).toBe("R$ 36.000");
    expect(reais(-1200)).toContain("−");
  });
});

describe("página do Overclock: vídeos", () => {
  it("reconhece os formatos de endereço do YouTube", () => {
    expect(idDoYoutube("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(idDoYoutube("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toBe("dQw4w9WgXcQ");
    expect(idDoYoutube("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(idDoYoutube("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(idDoYoutube("https://exemplo.com/video.mp4")).toBeNull();
  });

  it("todo vídeo cadastrado tem endereço válido", () => {
    for (const v of VIDEOS) {
      expect(Boolean((v.youtube && idDoYoutube(v.youtube)) || v.arquivo)).toBe(true);
    }
  });
});
