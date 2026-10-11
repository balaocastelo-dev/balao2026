import { createHash } from "crypto";
import { describe, expect, it } from "vitest";
import {
  ErroDoEmail,
  assinarClique,
  destinoDoClique,
  emailsNoTexto,
  lerClique,
  montarEmailDeProdutos,
  montarItem,
  validarEmail,
  validarLinkDoSite,
} from "@/lib/crm/email-produtos";
import type { Product } from "@/lib/utils";

const produto = (extra: Partial<Product> = {}): Product => ({
  id: "P1",
  name: "Fonte Corsair 650W 80 Plus Bronze",
  price: "R$ 399,90",
  price_card: "R$ 459,88",
  installment: "10x de R$ 45,99",
  image: "https://www.balao.info/img/fonte.jpg",
  category: "Fontes",
  slug: "fonte-corsair-650w",
  cost: 300,
  ...extra,
});

describe("validação", () => {
  it("aceita e-mail comum e normaliza; recusa o resto", () => {
    expect(validarEmail(" Cliente@Exemplo.COM.br ")).toBe("cliente@exemplo.com.br");
    expect(validarEmail("sem-arroba.com")).toBeNull();
    expect(validarEmail("a@b")).toBeNull();
    expect(validarEmail("com espaco@x.com")).toBeNull();
  });

  it("acha os e-mails que o cliente digitou na conversa", () => {
    expect(emailsNoTexto(["meu email é Joao.Silva@empresa.com.br, obrigado", null, "manda pra compras@x.com e joao.silva@empresa.com.br"])).toEqual([
      "joao.silva@empresa.com.br",
      "compras@x.com",
    ]);
  });

  it("link extra só do próprio site", () => {
    expect(validarLinkDoSite("https://www.balao.info/pcgamer?x=1")).toBe("/pcgamer?x=1");
    expect(validarLinkDoSite("/premium")).toBe("/premium");
    expect(validarLinkDoSite("https://outro-site.com/promo")).toBeNull();
    expect(validarLinkDoSite("javascript:alert(1)")).toBeNull();
  });
});

describe("preço", () => {
  it("usa o preço do site e o cartão/parcelado como estão no site", () => {
    const i = montarItem(produto(), { id: "P1" });
    expect(i.precoVista).toBe(399.9);
    expect(i.precoCartao).toBe(459.88);
    expect(i.parcelamento).toBe("10x de R$ 45,99");
    expect(i.caminho).toBe("/product/fonte-corsair-650w");
    expect(i.quantidade).toBe(1);
  });

  it("aceita preço especial acima do custo e recusa abaixo", () => {
    expect(montarItem(produto(), { id: "P1", preco: 350, quantidade: 3 })).toMatchObject({ precoVista: 350, quantidade: 3 });
    expect(() => montarItem(produto(), { id: "P1", preco: 299.99 })).toThrow(ErroDoEmail);
  });

  it("sem custo conhecido não trava; sem preço no site, recusa", () => {
    expect(montarItem(produto({ cost: undefined }), { id: "P1", preco: 10 }).precoVista).toBe(10);
    expect(() => montarItem(produto({ price: "" }), { id: "P1" })).toThrow(/sem preço/);
  });
});

describe("link rastreado", () => {
  const chave = createHash("sha256").update("teste").digest();

  it("ida e volta, e qualquer alteração invalida", () => {
    const t = assinarClique({ e: "ENV1", c: "5519@c.us", p: "P1", u: "/product/x" }, chave)!;
    expect(lerClique(t, chave)).toEqual({ e: "ENV1", c: "5519@c.us", p: "P1", u: "/product/x" });
    const [corpo, assinatura] = t.split(".");
    const outro = Buffer.from(JSON.stringify({ e: "ENV1", u: "/admin" })).toString("base64url");
    expect(lerClique(`${outro}.${assinatura}`, chave)).toBeNull();
    expect(lerClique(`${corpo}.x${assinatura.slice(1)}`, chave)).toBeNull();
    expect(lerClique(t, createHash("sha256").update("outra").digest())).toBeNull();
  });

  it("não leva para fora do site", () => {
    const fora = assinarClique({ e: "ENV1", u: "https://golpe.com" }, chave)!;
    expect(lerClique(fora, chave)).toBeNull();
    expect(destinoDoClique({ e: "ENV1", u: "/product/x" })).toBe(
      "https://www.balao.info/product/x?utm_source=crm&utm_medium=email&utm_campaign=orcamento"
    );
    expect(destinoDoClique({ e: "abcdef123", u: "wa" })).toMatch(/^https:\/\/wa\.me\/5519987510267\?text=.*ABCDEF/);
  });
});

describe("o e-mail", () => {
  const itens = [montarItem(produto(), { id: "P1", quantidade: 2 }), montarItem(produto({ id: "P2", name: "SSD <b>1 TB</b>", slug: "ssd", price: "R$ 349,90", price_card: "" }), { id: "P2" })];
  const email = montarEmailDeProdutos({
    envioId: "ENV1",
    chatId: "5519@c.us",
    nomeCliente: "Marina Souza",
    vendedor: "Thiago",
    mensagem: "Segue o que conversamos.\nQualquer dúvida, me chama.",
    itens,
    links: [{ titulo: "PCs montados", url: "/pcgamer" }],
    em: new Date("2026-10-11T15:00:00Z"),
  });

  it("assunto, saudação, mensagem, produtos, total e assinatura", () => {
    expect(email.assunto).toBe("Orçamento com 2 produtos — Balão da Informática");
    expect(email.html).toContain("Olá, Marina!");
    expect(email.html).toContain("Segue o que conversamos.<br>Qualquer dúvida, me chama.");
    expect(email.html).toContain("Fonte Corsair 650W 80 Plus Bronze");
    expect(email.html).toContain("R$ 399,90");
    expect(email.html).toContain("ou R$ 459,88 no cartão · 10x de R$ 45,99");
    expect(email.html).toContain("Total à vista no PIX: <strong");
    expect(email.html).toContain("R$ 1.149,70"); // 2 × 399,90 + 349,90
    expect(email.html).toContain("<strong>Thiago</strong>");
    expect(email.html).toContain("Preços conferidos em 11/10/2026");
    expect(email.texto).toContain("2 × R$ 399,90 à vista no PIX");
  });

  it("escapa o que veio de fora e não mostra custo", () => {
    expect(email.html).toContain("SSD &lt;b&gt;1 TB&lt;/b&gt;");
    expect(email.html).not.toContain("<b>1 TB</b>");
    expect(email.html).not.toMatch(/custo|fornecedor|margem/i);
  });

  it("botões passam pelo link rastreado (ou vão direto sem a chave)", () => {
    expect(email.html).toMatch(/href="https:\/\/www\.balao\.info\/(api\/crm\/email\/clique\?t=|product\/fonte-corsair-650w)/);
    expect(email.html).toContain("Falar no WhatsApp");
  });
});
