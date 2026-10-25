import { describe, it, expect } from "vitest";
import { aplicarPrecos, reprecificar, quantidadeValida, type PrecoAtual } from "@/lib/carrinho/precos";
import type { Product } from "@/lib/utils";

const produto = (id: string, price: string, extra: Partial<Product> = {}): Product => ({
  id,
  name: `Produto ${id}`,
  price,
  image: "",
  category: "",
  slug: id,
  ...extra,
});

describe("aplicarPrecos (carrinho guardado no navegador)", () => {
  it("troca o preço antigo pelo preço em queda e guarda o 'de'", () => {
    const guardado = [{ ...produto("a", "R$ 1.200,00"), quantity: 1 }];
    const atuais: Record<string, PrecoAtual> = {
      a: { id: "a", name: "Produto a", price: "R$ 999,90", preco_anterior: 1200, queda_em: "2026-10-24T10:00:00Z" },
    };
    const { itens, mudaram } = aplicarPrecos(guardado, atuais);
    expect(itens[0].price).toBe("R$ 999,90");
    expect(itens[0].preco_anterior).toBe(1200);
    expect(itens[0].quantity).toBe(1);
    expect(mudaram).toEqual(["Produto a"]);
  });

  it("não acusa mudança quando o preço é o mesmo", () => {
    const guardado = [{ ...produto("a", "R$ 100,00"), quantity: 2 }];
    const { mudaram } = aplicarPrecos(guardado, { a: { id: "a", name: "x", price: "R$ 100,00" } });
    expect(mudaram).toEqual([]);
  });

  it("deixa como está o item que o site não devolveu", () => {
    const guardado = [{ ...produto("a", "R$ 100,00"), quantity: 1 }];
    const { itens, mudaram } = aplicarPrecos(guardado, {});
    expect(itens[0]).toBe(guardado[0]);
    expect(mudaram).toEqual([]);
  });
});

describe("reprecificar (checkout usa o preço do banco)", () => {
  const banco: Record<string, Product> = {
    a: produto("a", "R$ 999,90"),
    b: produto("b", "R$ 50,00"),
  };
  const buscar = async (id: string) => banco[id] ?? null;

  it("usa o preço do banco e marca o item com preço velho", async () => {
    const r = await reprecificar(
      [{ product_id: "a", name: "a", image: "", quantity: 1, price_enviado: 1200 }],
      buscar
    );
    expect(r.itens[0].price).toBe(999.9);
    expect(r.algumMudou).toBe(true);
    expect(r.subtotal).toBe(999.9);
  });

  it("não aceita preço adulterado no navegador", async () => {
    const r = await reprecificar(
      [{ product_id: "b", name: "b", image: "", quantity: 3, price_enviado: 1 }],
      buscar
    );
    expect(r.algumMudou).toBe(true);
    expect(r.subtotal).toBe(150);
  });

  it("passa quando o navegador já tem o preço de agora", async () => {
    const r = await reprecificar(
      [
        { product_id: "a", name: "a", image: "", quantity: 1, price_enviado: 999.9 },
        { product_id: "b", name: "b", image: "", quantity: 2, price_enviado: 50 },
      ],
      buscar
    );
    expect(r.algumMudou).toBe(false);
    expect(r.faltando).toEqual([]);
    expect(r.subtotal).toBe(1099.9);
  });

  it("aponta o produto que não existe mais", async () => {
    const r = await reprecificar(
      [{ product_id: "sumiu", name: "x", image: "", quantity: 1, price_enviado: 10 }],
      buscar
    );
    expect(r.faltando).toEqual(["sumiu"]);
  });

  it("limita a quantidade", () => {
    expect(quantidadeValida(0)).toBe(1);
    expect(quantidadeValida("3")).toBe(3);
    expect(quantidadeValida(5000)).toBe(99);
  });
});
