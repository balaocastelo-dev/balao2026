import { beforeEach, describe, expect, it } from "vitest";
import { _gavetaDeTeste } from "@/lib/arena/gaveta";
import {
  apagarSeminovo,
  guardarLead,
  lerEstoque,
  lerLeads,
  marcarLead,
  mudarSituacao,
  paraVitrine,
  salvarSeminovo,
  validarLead,
  validarSeminovo,
} from "@/lib/seminovos/dados";
import { perfilRecomendado } from "@/lib/seminovos/perfil";
import { nomeDoAparelho } from "@/lib/seminovos/tipos";
import { mensagemDoPedido } from "@/lib/seminovos/whatsapp";

const BASE = {
  marca: "Lenovo",
  modelo: "ThinkPad T14 Gen 2",
  processador: "Core i5-1145G7",
  memoria: "16 GB",
  armazenamento: "SSD 512 GB",
  tela: '14" Full HD',
  precoVista: "2.499,90" as unknown as number,
};

beforeEach(() => {
  _gavetaDeTeste();
});

describe("seminovos: cadastro", () => {
  it("lê preço em qualquer formato brasileiro", () => {
    for (const [entrada, esperado] of [
      ["2.499,90", 2499.9],
      ["2499,90", 2499.9],
      ["2499.90", 2499.9],
      ["2.499", 2499],
      [2499.9, 2499.9],
    ] as const) {
      const v = validarSeminovo({ ...BASE, precoVista: entrada as unknown as number });
      expect(v.ok && v.dados.precoVista).toBe(esperado);
    }
  });

  it("recusa sem preço, sem modelo, e cartão mais barato que à vista", () => {
    expect(validarSeminovo({ ...BASE, precoVista: 0 }).ok).toBe(false);
    expect(validarSeminovo({ ...BASE, modelo: " " }).ok).toBe(false);
    expect(validarSeminovo({ ...BASE, precoCartao: 2000 }).ok).toBe(false);
  });

  it("só aceita foto que veio da gaveta de seminovos", () => {
    const v = validarSeminovo({ ...BASE, fotos: ["fotos/seminovo-abc123.jpg", "../segredo", "fotos/piloto-1.jpg", "https://kabum.com/x.jpg"] });
    expect(v.ok && v.dados.fotos).toEqual(["fotos/seminovo-abc123.jpg"]);
  });

  it("cadastra, edita, reserva, vende e apaga", async () => {
    const s = await salvarSeminovo(BASE);
    expect(s.garantiaMeses).toBe(6);
    expect(s.grau).toBe("A");
    await salvarSeminovo({ ...BASE, id: s.id, memoria: "32 GB" });
    expect((await lerEstoque()).map((x) => x.memoria)).toEqual(["32 GB"]);
    await mudarSituacao(s.id, "vendido");
    expect(paraVitrine(await lerEstoque())).toEqual([]);
    await apagarSeminovo(s.id);
    expect(await lerEstoque()).toEqual([]);
  });

  it("vitrine: disponíveis e destaques primeiro, reservado depois, vendido fora", async () => {
    const a = await salvarSeminovo({ ...BASE, modelo: "A" });
    const b = await salvarSeminovo({ ...BASE, modelo: "B", destaque: true });
    const c = await salvarSeminovo({ ...BASE, modelo: "C", situacao: "reservado" });
    await salvarSeminovo({ ...BASE, modelo: "D", situacao: "vendido" });
    expect(paraVitrine(await lerEstoque()).map((s) => s.id)).toEqual([b.id, a.id, c.id]);
  });

  it("não repete a marca no nome", () => {
    expect(nomeDoAparelho({ marca: "Apple", modelo: "MacBook Air M1" })).toBe("Apple MacBook Air M1");
    expect(nomeDoAparelho({ marca: "Dell", modelo: "Dell Latitude 5420" })).toBe("Dell Latitude 5420");
  });
});

describe("seminovos: leads", () => {
  it("valida nome e WhatsApp com DDD, tira o 55", () => {
    expect(validarLead({ nome: "A", whatsapp: "19987654321" }).ok).toBe(false);
    expect(validarLead({ nome: "Ana", whatsapp: "98765-4321" }).ok).toBe(false);
    const v = validarLead({ nome: "Ana", whatsapp: "+55 (19) 98765-4321", interesse: "xx" as never });
    expect(v.ok && v.lead.whatsapp).toBe("19987654321");
    expect(v.ok && v.lead.interesse).toBe("comprar");
  });

  it("guarda, ignora clique duplo e marca andamento", async () => {
    const v = validarLead({ nome: "Ana", whatsapp: "19987654321", origem: { pagina: "/seminovos", utm: { utm_source: "google", "x": "y" } } });
    if (!v.ok) throw new Error(v.erro);
    const l = await guardarLead(v.lead);
    await guardarLead(v.lead);
    const lista = await lerLeads();
    expect(lista).toHaveLength(1);
    expect(lista[0].origem.utm).toEqual({ utm_source: "google" });
    await marcarLead(l.id, l.criadoEm, "atendido", "mandei 3 opções");
    expect((await lerLeads())[0]).toMatchObject({ status: "atendido", nota: "mandei 3 opções" });
  });

  it("mensagem do WhatsApp leva o pedido escrito", () => {
    const m = mensagemDoPedido({ nome: "Ana Souza", interesse: "reservar", aparelhoNome: "Dell Latitude 5420", uso: "escritorio", orcamento: "1500-2500" });
    expect(m).toContain("Sou Ana.");
    expect(m).toContain("Dell Latitude 5420");
    expect(m).toContain("Escritório e home office");
    expect(m).toContain("R$ 1.500 a R$ 2.500");
  });
});

describe("seminovos: qual é para mim", () => {
  it("ajusta o perfil pela prioridade", () => {
    expect(perfilRecomendado("estudo", "desempenho").configuracao).toContain("16 GB de memória");
    expect(perfilRecomendado("escritorio", "tela").configuracao.join(" ")).toContain("15,6");
    expect(perfilRecomendado("programacao", "leveza").configuracao.at(-1)).toMatch(/1,5 kg/);
  });
});
