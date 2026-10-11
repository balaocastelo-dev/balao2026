import { describe, it, expect } from "vitest";
import { aplicarFaixa, ehFonteDeNotebook, faixaDoProduto, vendaDoProduto } from "@/lib/precos/faixas";
import { calcularVenda } from "@/lib/precos/calculo";

describe("faixa de preço: fonte de notebook entre R$ 119 e R$ 199", () => {
  it("reconhece fonte e carregador de notebook, e só eles", () => {
    expect(ehFonteDeNotebook("Fonte Notebook Dell 19,5V 3.34A 65W")).toBe(true);
    expect(ehFonteDeNotebook("Carregador Universal Notebook 120W Knup KP-525")).toBe(true);
    expect(ehFonteDeNotebook("Fonte Macbook Tipo C 87W")).toBe(true);
    expect(ehFonteDeNotebook("Carregador Para Notebook Lenovo 65W", "Computadores/Acessórios")).toBe(true);
    expect(ehFonteDeNotebook("Qualquer nome", "Energia/Fontes para Notebook")).toBe(true);
    expect(ehFonteDeNotebook("Suporte para Notebook com Cooler Knup", "Energia/Fontes para Notebook")).toBe(false);
    expect(ehFonteDeNotebook("Suporte para Notebook com Cooler Knup KP 9013")).toBe(false);
    expect(ehFonteDeNotebook("Notebook Lenovo IdeaPad 3")).toBe(false);
    expect(ehFonteDeNotebook("Fonte 600W Redragon 80 Plus ATX para PC")).toBe(false);
    expect(ehFonteDeNotebook("Carregador Apple USB-C 20W")).toBe(false);
  });

  it("sobe o barato, desce o caro e não vende abaixo do custo", () => {
    const f = faixaDoProduto("Fonte Notebook Dell", "")!;
    expect(aplicarFaixa(calcularVenda({ pix: 30, cartao: 30, parcelas: 0 }, 138.6), f, 30).pix).toBe(119);
    expect(aplicarFaixa(calcularVenda({ pix: 150, cartao: 150, parcelas: 0 }, 93.5), f, 150).pix).toBe(199);
    expect(aplicarFaixa(calcularVenda({ pix: 70, cartao: 70, parcelas: 0 }, 100), f, 70).pix).toBe(140);
    // custo acima do teto: fica o preço da margem
    expect(aplicarFaixa(calcularVenda({ pix: 250, cartao: 250, parcelas: 0 }, 33), f, 250).pix).toBe(332.5);
  });

  it("cartão acompanha na mesma proporção e o texto é refeito", () => {
    const v = vendaDoProduto({ pix: 100, cartao: 117.65, parcelas: 10 }, 100, { nome: "Fonte Notebook HP 65W", categoria: "" });
    expect(v.pix).toBe(199);
    expect(v.price).toBe("199,00");
    expect(v.cartao).toBeCloseTo(234.13, 1);
    expect(v.installment).toMatch(/^10x de R\$ 23,41$/);
    const outro = vendaDoProduto({ pix: 10, cartao: 10, parcelas: 0 }, 150, { nome: "Cabo HDMI", categoria: "" });
    expect(outro.pix).toBe(25);
  });
});
