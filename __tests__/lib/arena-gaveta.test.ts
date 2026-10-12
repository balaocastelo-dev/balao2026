// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// A Arena fora do MySQL (12/10/2026): gaveta em memória, sem banco nenhum.
// Confere a gravação do vigia, a hora do turbo, os ajustes à mão, a corrida
// pronta para o telão e os avisos do WhatsApp.

const enviados: { destino: string; texto: string }[] = [];
vi.mock("@/lib/arena/whatsapp", () => ({
  enviarAviso: vi.fn(async (destino: string, texto: string) => {
    enviados.push({ destino, texto });
  }),
  listarGrupos: vi.fn(async () => []),
}));
// Se algo tentar o banco, o teste quebra: a Arena não pode depender dele.
vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async () => {
      throw new Error("a Arena não pode tocar o MySQL");
    }),
  },
  isTursoActive: () => false,
}));

import { _gavetaDeTeste, atualizar, ConflitoDeVersao, gravar, ler } from "@/lib/arena/gaveta";
import {
  ajustarLancamento,
  gravarDocumentos,
  gravarTurbo,
  gravarWhatsApp,
  lancamentosEntre,
  lancarManual,
  lerConfig,
  salvarPiloto,
  destinoValido,
  slugDe,
} from "@/lib/arena/dados";
import { estadoDoTelao, reconstruirTelao } from "@/lib/arena/estado";
import { avisosEntre } from "@/lib/arena/avisos";
import { multiplicadorNaChegada, turboAgora, proximoTurbo, normalizarTurbo } from "@/lib/arena/turbo";
import { hojeNaLoja } from "@/lib/arena/periodos";
import type { DocumentoDoBling } from "@/lib/arena/pontos";
import { WHATSAPP_PADRAO } from "@/lib/arena/tipos";

const HOJE = hojeNaLoja();

function doc(p: Partial<DocumentoDoBling>): DocumentoDoBling {
  return {
    tipo: "venda",
    blingId: "1",
    numero: "1",
    data: HOJE,
    vendedorBlingId: "111",
    contatoId: "900",
    contatoNome: "Cliente",
    total: 300,
    situacaoId: 6,
    situacao: null,
    itens: [],
    ...p,
  };
}

beforeEach(() => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.ARENA_GAVETA_DIR;
  delete process.env.MYSQL_HOST;
  _gavetaDeTeste();
  enviados.length = 0;
});

describe("gaveta", () => {
  it("gravação condicional: quem gravou com versão velha perde e relê", async () => {
    await gravar("x", { n: 1 }, null);
    const a = await ler<{ n: number }>("x");
    await gravar("x", { n: 2 }, a.versao);
    await expect(gravar("x", { n: 3 }, a.versao)).rejects.toBeInstanceOf(ConflitoDeVersao);
    await expect(gravar("x", { n: 9 }, null)).rejects.toBeInstanceOf(ConflitoDeVersao);
    const r = await atualizar<{ n: number }>("x", () => ({ n: 0 }), (d) => ({ n: d.n + 1 }));
    expect(r.n).toBe(3);
  });

  it("recusa chave com caminho estranho", async () => {
    await expect(ler("../segredo")).rejects.toThrow();
  });
});

describe("pilotos e configuração", () => {
  it("cria a configuração vazia sem banco e pede a varredura de 3 meses", async () => {
    const c = await lerConfig();
    expect(c.pilotos).toEqual([]);
    expect(c.varrerDesde).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it("endereço do piloto: sem acento e sem repetir", async () => {
    await salvarPiloto(null, { nome: "Júlia Souza", apelido: "Júlia" });
    await salvarPiloto(null, { nome: "Julia Santos", apelido: "Julia" });
    const c = await lerConfig();
    expect(c.pilotos.map((p) => p.slug)).toEqual(["julia", "julia-2"]);
    expect(slugDe("Brendon O.")).toBe("brendon-o");
  });

  it("dois pilotos não ficam com o mesmo vendedor do Bling", async () => {
    await salvarPiloto(null, { nome: "A", blingVendedorId: "111" });
    await expect(salvarPiloto(null, { nome: "B", blingVendedorId: "111" })).rejects.toThrow(/já está ligado/);
  });

  it("foto vira arquivo na gaveta", async () => {
    const png = "data:image/png;base64," + Buffer.from("foto").toString("base64");
    const id = await salvarPiloto(null, { nome: "Com Foto", foto: png });
    const p = (await lerConfig()).pilotos.find((x) => x.id === id)!;
    expect(p.foto).toMatch(/^gaveta:fotos\//);
  });

  it("destino do aviso: grupo ou número brasileiro, nada mais", () => {
    expect(destinoValido("120363025246125486@g.us")).toBe("120363025246125486@g.us");
    expect(destinoValido("(19) 98451-5960")).toBe("");
    expect(destinoValido("5519984515960")).toBe("5519984515960");
    expect(destinoValido("https://x")).toBe("");
  });
});

describe("vendas do Bling na gaveta", () => {
  it("grava, pula o repetido e refaz quando o Bling muda", async () => {
    expect(await gravarDocumentos([doc({ blingId: "10" })])).toEqual({ gravados: 1, novos: 1 });
    expect(await gravarDocumentos([doc({ blingId: "10" })])).toEqual({ gravados: 0, novos: 0 });
    expect(await gravarDocumentos([doc({ blingId: "10", situacaoId: 12 })])).toEqual({ gravados: 1, novos: 0 });
    const [l] = await lancamentosEntre(HOJE, HOJE);
    expect(l.status).toBe("cancelado");
    expect(l.pontos).toBe(0);
  });

  it("orçamento antes da venda dá o bônus de conversão, mesmo chegando em lotes separados", async () => {
    await gravarDocumentos([doc({ tipo: "orcamento", blingId: "20", total: 900 })]);
    await gravarDocumentos([doc({ blingId: "21", total: 900 })]);
    const venda = (await lancamentosEntre(HOJE, HOJE)).find((l) => l.id === "venda:21")!;
    expect(venda.detalhe?.conversao).toBe(5);
  });

  it("hora do turbo: documento novo ganha o multiplicador; histórico não", async () => {
    await gravarTurbo({ manualAte: new Date(Date.now() + 3600_000).toISOString(), manualMultiplicador: 2 });
    await gravarDocumentos([doc({ blingId: "30", total: 0 }), doc({ blingId: "31", total: 0, data: "2025-01-10" })]);
    const hoje = (await lancamentosEntre(HOJE, HOJE)).find((l) => l.id === "venda:30")!;
    expect(hoje.turbo).toBe(2);
    expect(hoje.pontos).toBe(20);
    const velho = (await lancamentosEntre("2025-01-10", "2025-01-10"))[0];
    expect(velho.historico).toBe(true);
    expect(velho.turbo).toBe(1);
    expect(velho.pontos).toBe(10);
  });

  it("o turbo fica congelado: desligar depois não tira os pontos", async () => {
    await gravarTurbo({ manualAte: new Date(Date.now() + 3600_000).toISOString(), manualMultiplicador: 3 });
    await gravarDocumentos([doc({ blingId: "40", total: 0 })]);
    await gravarTurbo({ manualAte: null });
    await gravarDocumentos([doc({ blingId: "40", total: 0, numero: "40-b" })]); // o Bling mexeu no pedido
    const l = (await lancamentosEntre(HOJE, HOJE)).find((x) => x.id === "venda:40")!;
    expect(l.pontos).toBe(30);
  });

  it("anular no painel vale mesmo que o Bling mande de novo", async () => {
    await gravarDocumentos([doc({ blingId: "50" })]);
    await ajustarLancamento("venda:50", { anular: true, data: HOJE });
    await gravarDocumentos([doc({ blingId: "50", total: 999 })]);
    const l = (await lancamentosEntre(HOJE, HOJE)).find((x) => x.id === "venda:50")!;
    expect(l.status).toBe("anulado");
    expect(l.pontos).toBe(0);
  });
});

describe("telão e avisos", () => {
  it("corrida pronta na gaveta; sem cliente nem reais no que o telão recebe", async () => {
    const id = await salvarPiloto(null, { nome: "Brendon Oliveira", apelido: "Brendon", blingVendedorId: "111", metaSemana: 15 });
    await gravarDocumentos([doc({ blingId: "60", total: 1200, contatoNome: "Fulano de Tal" })]);
    await reconstruirTelao();
    const e = (await estadoDoTelao())!;
    expect(e.semana.linhas[0].piloto.id).toBe(id);
    expect(e.semana.linhas[0].pontos).toBe(12);
    expect(e.jogadasPorPiloto[id]).toHaveLength(1);
    const texto = JSON.stringify(e);
    expect(texto).not.toContain("Fulano");
    expect(texto).not.toContain("1200");
  });

  it("avisa no WhatsApp quem cruzou a linha (uma vez só)", async () => {
    await salvarPiloto(null, { nome: "Marcos", blingVendedorId: "111", metaSemana: 15 });
    await gravarWhatsApp({ ...WHATSAPP_PADRAO, ativo: true, destino: "120363025246125486@g.us" });
    await reconstruirTelao(); // corrida antes
    await gravarDocumentos([doc({ blingId: "70", total: 3000 })]); // 10 + 6 de ticket = 16 ≥ 15
    await reconstruirTelao();
    await reconstruirTelao();
    const metas = enviados.filter((m) => m.texto.includes("cruzou a linha"));
    expect(metas).toHaveLength(1);
    expect(metas[0].destino).toBe("120363025246125486@g.us");
    expect(metas[0].texto).toContain("*Marcos*");
  });

  it("sem destino ou desligado, não avisa nada", () => {
    expect(avisosEntre(null, {} as never, { ...WHATSAPP_PADRAO, ativo: true, destino: "x" })).toEqual([]);
  });

  it("pontos à mão entram na corrida", async () => {
    const id = await salvarPiloto(null, { nome: "Wendell" });
    await lancarManual(id, 7, "avaliação 5 estrelas");
    const e = await reconstruirTelao();
    expect(e.semana.linhas.find((l) => l.piloto.id === id)!.pontos).toBe(7);
  });
});

describe("relógio do turbo", () => {
  // Segunda, 12/10/2026, 14:30 em Campinas = 17:30 UTC
  const seg1430 = new Date("2026-10-12T17:30:00Z");
  const t = normalizarTurbo({ janelas: [{ dias: [1, 2, 3, 4, 5], das: "14:00", ate: "16:00" }], multiplicador: 2 });

  it("liga na janela e diz até quando", () => {
    const a = turboAgora(t, seg1430);
    expect(a.ativo).toBe(true);
    expect(a.ate).toBe("2026-10-12T19:00:00.000Z");
  });

  it("tolerância de 5 minutos depois do fim (o vigia passa de 2 em 2)", () => {
    expect(multiplicadorNaChegada(t, new Date("2026-10-12T19:03:00Z"))).toBe(2);
    expect(multiplicadorNaChegada(t, new Date("2026-10-12T19:06:00Z"))).toBe(1);
  });

  it("domingo não tem turbo e o próximo é segunda às 14h", () => {
    const dom = new Date("2026-10-18T15:00:00Z");
    expect(turboAgora(t, dom).ativo).toBe(false);
    expect(proximoTurbo(t, dom)?.inicio).toBe("2026-10-19T17:00:00.000Z");
  });

  it("janela inválida é descartada", () => {
    expect(normalizarTurbo({ janelas: [{ dias: [1], das: "16:00", ate: "14:00" }] }).janelas).toEqual([]);
  });
});
