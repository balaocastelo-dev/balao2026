import { describe, it, expect } from "vitest";
import { baixou, decidirQueda, produtosEmQueda, quedaDoProduto } from "@/lib/precos/queda";
import type { Product } from "@/lib/utils";

const AGORA = "2026-10-12T09:00:00.000Z";
const diasAtras = (d: number) => new Date(Date.parse(AGORA) - d * 86_400_000).toISOString();

const produto = (id: string, price: string, preco_anterior?: number, queda_em?: string): Product => ({
  id, name: `Produto ${id}`, price, image: "/x.jpg", category: "Hardware", slug: id, preco_anterior, queda_em,
});

describe("o que conta como queda", () => {
  it("pelo menos 2% e R$ 1", () => {
    expect(baixou(100, 98)).toBe(true);
    expect(baixou(100, 98.5)).toBe(false); // 1,5%
    expect(baixou(30, 29.2)).toBe(false); // 2,7%, mas só R$ 0,80
    expect(baixou(0, 10)).toBe(false);
    expect(baixou(100, 0)).toBe(false);
  });
});

describe("decidirQueda (na gravação da fonte)", () => {
  it("produto novo ou sem preço: nada", () => {
    expect(decidirQueda(null, 100, AGORA)).toEqual({ preco_anterior: null, queda_em: null });
    expect(decidirQueda({ preco: 0, preco_anterior: null, queda_em: null }, 100, AGORA)).toEqual({ preco_anterior: null, queda_em: null });
  });

  it("baixou: grava o preço de antes e quando", () => {
    expect(decidirQueda({ preco: 1000, preco_anterior: null, queda_em: null }, 899.9, AGORA)).toEqual({ preco_anterior: 1000, queda_em: AGORA });
  });

  it("subiu ou oscilou centavos: nada", () => {
    expect(decidirQueda({ preco: 1000, preco_anterior: null, queda_em: null }, 1050, AGORA).preco_anterior).toBeNull();
    expect(decidirQueda({ preco: 1000, preco_anterior: null, queda_em: null }, 995, AGORA).preco_anterior).toBeNull();
  });

  it("preço parado depois da queda: a queda continua, com a data dela", () => {
    const atual = { preco: 900, preco_anterior: 1000, queda_em: diasAtras(2) };
    expect(decidirQueda(atual, 900, AGORA)).toEqual({ preco_anterior: 1000, queda_em: diasAtras(2) });
  });

  it("segunda queda na semana: o 'de' fica o mais alto", () => {
    const atual = { preco: 900, preco_anterior: 1000, queda_em: diasAtras(3) };
    expect(decidirQueda(atual, 800, AGORA)).toEqual({ preco_anterior: 1000, queda_em: AGORA });
  });

  it("voltou a subir até o 'de': sai da queda", () => {
    expect(decidirQueda({ preco: 900, preco_anterior: 1000, queda_em: diasAtras(1) }, 1000, AGORA).preco_anterior).toBeNull();
    expect(decidirQueda({ preco: 900, preco_anterior: 1000, queda_em: diasAtras(1) }, 1100, AGORA).preco_anterior).toBeNull();
  });

  it("subiu um pouco mas ainda abaixo do 'de': continua em queda", () => {
    expect(decidirQueda({ preco: 900, preco_anterior: 1000, queda_em: diasAtras(1) }, 950, AGORA)).toEqual({ preco_anterior: 1000, queda_em: diasAtras(1) });
  });

  it("queda antiga (mais de 7 dias) expira; uma queda nova recomeça do preço atual", () => {
    expect(decidirQueda({ preco: 900, preco_anterior: 1000, queda_em: diasAtras(8) }, 900, AGORA).preco_anterior).toBeNull();
    expect(decidirQueda({ preco: 900, preco_anterior: 1000, queda_em: diasAtras(8) }, 850, AGORA)).toEqual({ preco_anterior: 900, queda_em: AGORA });
  });
});

describe("vitrine de queda de preço", () => {
  it("mostra só quedas válidas, da maior para a menor", () => {
    const lista = produtosEmQueda(
      [
        produto("a", "900,00", 1000, diasAtras(1)), // 10%
        produto("b", "1.500,00", 2000, diasAtras(2)), // 25%
        produto("c", "R$ 99,90", 100, diasAtras(1)), // 0,1%: não conta
        produto("d", "500,00", 600, diasAtras(9)), // expirou
        produto("e", "700,00", 600, diasAtras(1)), // subiu acima do "de"
        produto("f", "300,00"), // sem queda
        produto("a", "900,00", 1000, diasAtras(1)), // repetido
      ],
      AGORA
    );
    expect(lista.map((q) => q.produto.id)).toEqual(["b", "a"]);
    expect(lista[0]).toMatchObject({ de: 2000, por: 1500, porcentagem: 25, economia: 500 });
  });

  it("porcentagem nunca arredonda para cima", () => {
    expect(quedaDoProduto(produto("x", "979,90", 1000, diasAtras(0)), AGORA)!.porcentagem).toBe(2);
  });
});
