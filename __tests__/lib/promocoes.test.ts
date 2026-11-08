import { describe, it, expect } from "vitest";
import {
  normalizarTelefone,
  montarMensagemPromo,
  janelaDeEnvioAberta,
} from "@/lib/promocoes/mensagem";
import type { Product } from "@/lib/utils";

const produto: Product = {
  id: "p1",
  name: "Notebook Gamer X",
  price: "R$ 4.999,00",
  price_card: "R$ 5.499,00",
  installment: "10x de R$ 549,90",
  image: "https://www.balao.info/img/p1.jpg",
  category: "Notebooks",
  slug: "notebook-gamer-x",
};

describe("normalizarTelefone", () => {
  it("celular com DDD vira 55+DDD+numero", () => {
    expect(normalizarTelefone("(19) 98751-0267")).toBe("5519987510267");
  });
  it("já com 55 é mantido", () => {
    expect(normalizarTelefone("+55 19 98751-0267")).toBe("5519987510267");
  });
  it("fixo com 10 dígitos recebe o 55", () => {
    expect(normalizarTelefone("1932551661")).toBe("551932551661");
  });
  it("tira zeros à frente", () => {
    expect(normalizarTelefone("019987510267")).toBe("5519987510267");
  });
  it("recusa número curto", () => {
    expect(normalizarTelefone("98751")).toBeNull();
  });
  it("recusa vazio", () => {
    expect(normalizarTelefone("")).toBeNull();
  });
});

describe("montarMensagemPromo", () => {
  it("monta nome, preço Pix, parcela, link e assinatura", () => {
    const msg = montarMensagemPromo(produto, { assinatura: "Atenciosamente, Marcos" });
    expect(msg).toContain("*Notebook Gamer X*");
    expect(msg).toContain("R$ 4.999,00 à vista no Pix");
    expect(msg).toContain("ou 10x de R$ 549,90 sem juros");
    expect(msg).toContain("https://www.balao.info/product/notebook-gamer-x");
    expect(msg).toContain("Atenciosamente, Marcos");
  });
  it("inclui a chamada quando dada", () => {
    const msg = montarMensagemPromo(produto, { assinatura: "x", chamada: "Oferta de hoje 🔥" });
    expect(msg.startsWith("Oferta de hoje 🔥")).toBe(true);
  });
  it("só põe o rodapé de opt-out quando pedido (lista)", () => {
    expect(montarMensagemPromo(produto, { assinatura: "x" })).not.toContain("SAIR");
    expect(montarMensagemPromo(produto, { assinatura: "x", incluirOptout: true })).toContain("responda SAIR");
  });
});

describe("janelaDeEnvioAberta", () => {
  it("09h–18h de SP em dia útil está aberta", () => {
    // 2026-10-12 é segunda. 15:00 UTC = 12:00 em SP.
    expect(janelaDeEnvioAberta(new Date("2026-10-12T15:00:00Z"))).toBe(true);
  });
  it("antes das 9h de SP está fechada", () => {
    // 11:00 UTC = 08:00 em SP.
    expect(janelaDeEnvioAberta(new Date("2026-10-12T11:00:00Z"))).toBe(false);
  });
  it("domingo está fechado", () => {
    // 2026-10-18 é domingo, 15:00 UTC = 12:00 SP.
    expect(janelaDeEnvioAberta(new Date("2026-10-18T15:00:00Z"))).toBe(false);
  });
});
