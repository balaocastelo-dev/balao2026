import { describe, it, expect, vi } from "vitest";
import { devoAvisar, mensagemDoAviso, normalizarWhatsApp, venceu } from "@/lib/avisos-de-preco/regras";
import { dispararAvisos, WhatsAppDesconectado, type Dependencias } from "@/lib/avisos-de-preco/disparo";
import type { AvisoEsperando, ProdutoAgora } from "@/lib/avisos-de-preco/banco";

describe("WhatsApp do cliente", () => {
  it("aceita os jeitos comuns de escrever", () => {
    expect(normalizarWhatsApp("(19) 98751-0267")).toBe("5519987510267");
    expect(normalizarWhatsApp("19987510267")).toBe("5519987510267");
    expect(normalizarWhatsApp("+55 19 98751-0267")).toBe("5519987510267");
    expect(normalizarWhatsApp("(19) 3255-1661")).toBe("551932551661");
  });
  it("recusa o que não é número brasileiro", () => {
    expect(normalizarWhatsApp("98751-0267")).toBeNull(); // sem DDD
    expect(normalizarWhatsApp("(19) 88751-0267")).toBeNull(); // celular sem o 9
    expect(normalizarWhatsApp("+1 415 555 0100")).toBeNull();
    expect(normalizarWhatsApp("abc")).toBeNull();
  });
});

describe("quando avisar", () => {
  it("mesma régua da Queda de preço: 2% e R$ 1", () => {
    expect(devoAvisar(1000, 970)).toBe(true);
    expect(devoAvisar(1000, 990)).toBe(false); // só 1%
    expect(devoAvisar(30, 29.4)).toBe(false); // menos de R$ 1
    expect(devoAvisar(1000, 1000)).toBe(false);
    expect(devoAvisar(1000, 1100)).toBe(false);
  });
  it("pedido vence em 90 dias", () => {
    const agora = new Date("2026-10-25T12:00:00Z");
    expect(venceu("2026-07-01T12:00:00Z", agora)).toBe(true);
    expect(venceu("2026-10-01T12:00:00Z", agora)).toBe(false);
  });
  it("mensagem traz o de, o por, a porcentagem e o link", () => {
    const m = mensagemDoAviso({ nome: "maria silva", produto: "RTX 3060", precoQuandoPediu: 2000, precoAgora: 1800, link: "https://x/p" });
    expect(m).toContain("Olá, Maria!");
    expect(m).toContain("R$ 2.000,00");
    expect(m).toContain("*R$ 1.800,00*");
    expect(m).toContain("-10%");
    expect(m).toContain("https://x/p");
    expect(m).toContain("aviso único");
  });
});

const aviso = (id: string, extra: Partial<AvisoEsperando> = {}): AvisoEsperando => ({
  id,
  productId: "p1",
  produtoNome: "PC",
  telefone: "5519987510267",
  nome: null,
  precoQuandoPediu: 1000,
  criadoEm: "2026-10-20T12:00:00Z",
  tentativas: 0,
  ...extra,
});

function deps(avisos: AvisoEsperando[], preco: number, enviar = vi.fn().mockResolvedValue(undefined)): Dependencias & { enviar: ReturnType<typeof vi.fn> } {
  const produtos = new Map<string, ProdutoAgora>([["p1", { id: "p1", name: "PC Gamer", preco, image: "https://f/p.jpg", slug: "pc-gamer" }]]);
  return {
    conferir: async () => ({ avisos, produtos }),
    enviar,
    marcarAvisado: vi.fn().mockResolvedValue(undefined),
    marcarFalha: vi.fn().mockResolvedValue(undefined),
    marcarVencidos: vi.fn().mockResolvedValue(undefined),
  };
}

describe("rodada de avisos", () => {
  const agora = new Date("2026-10-25T12:00:00Z");

  it("avisa quem está esperando quando o preço baixou, e marca como avisado", async () => {
    const d = deps([aviso("a1")], 900);
    const r = await dispararAvisos(d, agora);
    expect(r.enviados).toBe(1);
    expect(d.enviar).toHaveBeenCalledWith("5519987510267", expect.stringContaining("*R$ 900,00*"), "https://f/p.jpg");
    expect(d.marcarAvisado).toHaveBeenCalledWith("a1", 900);
  });

  it("não manda nada se o preço não baixou", async () => {
    const d = deps([aviso("a1")], 995);
    const r = await dispararAvisos(d, agora);
    expect(r.enviados).toBe(0);
    expect(d.enviar).not.toHaveBeenCalled();
  });

  it("linha fora do ar: para a rodada sem gastar tentativa", async () => {
    const d = deps([aviso("a1"), aviso("a2")], 900, vi.fn().mockRejectedValue(new WhatsAppDesconectado("O WhatsApp da loja não está conectado.")));
    const r = await dispararAvisos(d, agora);
    expect(r.enviados).toBe(0);
    expect(d.enviar).toHaveBeenCalledTimes(1);
    expect(d.marcarFalha).not.toHaveBeenCalled();
  });

  it("erro em um número conta tentativa e segue para o próximo", async () => {
    const enviar = vi.fn().mockRejectedValueOnce(new Error("número sem WhatsApp")).mockResolvedValue(undefined);
    const d = deps([aviso("a1"), aviso("a2", { telefone: "5519999990000" })], 900, enviar);
    const r = await dispararAvisos(d, agora);
    expect(r.falhas).toBe(1);
    expect(r.enviados).toBe(1);
    expect(d.marcarFalha).toHaveBeenCalledWith("a1", "número sem WhatsApp", 0);
  });

  it("vence pedido antigo sem mandar mensagem", async () => {
    const d = deps([aviso("velho", { criadoEm: "2026-06-01T12:00:00Z" })], 900);
    const r = await dispararAvisos(d, agora);
    expect(r.vencidos).toBe(1);
    expect(d.enviar).not.toHaveBeenCalled();
    expect(d.marcarVencidos).toHaveBeenCalledWith(["velho"]);
  });

  it("no máximo 20 envios por rodada", async () => {
    const muitos = Array.from({ length: 30 }, (_, i) => aviso(`a${i}`, { telefone: `55199999${String(i).padStart(5, "0")}` }));
    const d = deps(muitos, 900);
    const r = await dispararAvisos(d, agora);
    expect(r.enviados).toBe(20);
  });
});
