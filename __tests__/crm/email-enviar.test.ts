import { beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.fn();
const produto = vi.fn();
const enviar = vi.fn();

vi.mock("@/lib/whatsapp-ticket", () => ({
  ticketDaSessao: () => sessao(),
  urlDoServidorWhatsApp: () => "http://vps.teste",
}));
vi.mock("@/lib/db", () => ({ getProductByIdentifier: (id: string) => produto(id) }));
vi.mock("@/lib/catalogo-espelho", () => ({ lerCatalogoDoEspelho: async () => [], espelhoPorIdentificador: () => null }));
vi.mock("@/lib/mail", () => ({ sendEmail: (p: unknown) => enviar(p) }));
vi.mock("@/lib/vendedor-auth", () => ({ getVendedorLogado: async () => ({ slug: "brendon", nome: "Brendon" }) }));

import { POST } from "@/app/api/crm/email/enviar/route";

const pedir = (corpo: unknown) =>
  POST(new Request("http://site/api/crm/email/enviar", { method: "POST", body: JSON.stringify(corpo) }));

const fonte = {
  id: "P1",
  name: "Fonte 650W",
  price: "R$ 399,90",
  price_card: "R$ 459,88",
  image: "https://www.balao.info/f.jpg",
  category: "Fontes",
  slug: "fonte-650w",
  cost: 300,
};

describe("POST /api/crm/email/enviar", () => {
  const chamadasVps: Array<{ url: string; corpo: Record<string, unknown> }> = [];

  beforeEach(() => {
    sessao.mockReset().mockResolvedValue({ ticket: "TICKET", exp: 0, papel: "admin" });
    produto.mockReset().mockImplementation(async (id: string) => (id === "P1" ? fonte : null));
    enviar.mockReset().mockResolvedValue({ success: true, provider: "resend", messageId: "re_1" });
    chamadasVps.length = 0;
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      chamadasVps.push({ url, corpo: JSON.parse(String(init.body)) });
      return new Response("{}", { status: 200 });
    });
  });

  it("sem sessão do painel: 401", async () => {
    sessao.mockResolvedValue(null);
    expect((await pedir({ para: "a@b.com", itens: [{ id: "P1" }] })).status).toBe(401);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("e-mail inválido ou produto inexistente: recusa sem enviar", async () => {
    expect((await pedir({ para: "nada", itens: [{ id: "P1" }] })).status).toBe(400);
    expect((await pedir({ para: "a@b.com", itens: [{ id: "XX" }] })).status).toBe(404);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("preço abaixo do custo: recusa", async () => {
    const r = await pedir({ para: "a@b.com", itens: [{ id: "P1", preco: 250 }] });
    expect(r.status).toBe(400);
    expect((await r.json()).erro).toMatch(/abaixo do custo/);
    expect(enviar).not.toHaveBeenCalled();
  });

  it("prévia monta o e-mail e não envia", async () => {
    const r = await pedir({ previa: true, itens: [{ id: "P1" }], nomeCliente: "Ana" });
    const j = await r.json();
    expect(j.ok).toBe(true);
    expect(j.html).toContain("Olá, Ana!");
    expect(enviar).not.toHaveBeenCalled();
  });

  it("envia de vendas@, responde para a loja, cópia oculta e registra no CRM", async () => {
    const r = await pedir({
      para: "Cliente@Exemplo.com",
      chatId: "5519999990000@c.us",
      nomeCliente: "Ana",
      vendedorNome: "Thiago",
      itens: [{ id: "P1", quantidade: 2 }],
      links: [{ titulo: "PC gamer", url: "https://www.balao.info/pcgamer" }, { titulo: "fora", url: "https://golpe.com" }],
    });
    const j = await r.json();
    expect(j).toMatchObject({ ok: true, provedor: "resend", registrado: true });

    const p = enviar.mock.calls[0][0];
    expect(p.to).toBe("cliente@exemplo.com");
    expect(p.fromName).toBe("Thiago · Balão da Informática");
    expect(p.replyTo).toBe("balaocastelo@gmail.com");
    expect(p.bcc).toBe("balaocastelo@gmail.com");
    expect(p.subject).toContain("Fonte 650W");
    expect(p.html).toContain("2 × ");
    expect(p.html).not.toContain("golpe.com");

    expect(chamadasVps[0].url).toBe("http://vps.teste/api/comando/contatos/5519999990000%40c.us/email-enviado");
    expect(chamadasVps[0].corpo).toMatchObject({ para: "cliente@exemplo.com", envioId: j.envioId, vendedor: "Thiago" });
  });

  it("vendedor logado assina com o próprio nome", async () => {
    sessao.mockResolvedValue({ ticket: "T", exp: 0, papel: "vendedor" });
    await pedir({ para: "a@b.com", itens: [{ id: "P1" }], vendedorNome: "Outro" });
    expect(enviar.mock.calls[0][0].fromName).toBe("Brendon · Balão da Informática");
  });

  it("falha no envio volta o motivo (não diz que foi)", async () => {
    enviar.mockResolvedValue({ success: false, error: "Resend: domínio não verificado" });
    const r = await pedir({ para: "a@b.com", itens: [{ id: "P1" }] });
    expect(r.status).toBe(502);
    expect((await r.json()).erro).toContain("domínio não verificado");
  });
});
