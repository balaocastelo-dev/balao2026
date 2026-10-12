// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// A Arena fora do MySQL (12/10/2026): gaveta em memória, sem banco nenhum.
// Confere a gravação do vigia (em reais), as OS do Fechamento, os ajustes à
// mão, a passagem de pontos para reais, a corrida pronta para o telão e os
// avisos do WhatsApp.

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
  apagarOS,
  gravarDocumentos,
  gravarWhatsApp,
  lancamentosEntre,
  lancarManual,
  lerConfig,
  listarTecnicos,
  registrarOS,
  salvarPiloto,
  trocarTecnicoDaOS,
  destinoValido,
  slugDe,
} from "@/lib/arena/dados";
import { estadoDoTelao, reconstruirTelao } from "@/lib/arena/estado";
import { avisosEntre } from "@/lib/arena/avisos";
import { hojeNaLoja } from "@/lib/arena/periodos";
import type { DocumentoDoBling } from "@/lib/arena/valores";
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
  delete process.env.BLOB_STORE_ID;
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

describe("vendas do Bling na gaveta (em reais)", () => {
  it("grava o total, pula o repetido e refaz quando o Bling muda", async () => {
    expect(await gravarDocumentos([doc({ blingId: "10", total: 1890.5 })])).toEqual({ gravados: 1, novos: 1 });
    expect((await lancamentosEntre(HOJE, HOJE))[0].valor).toBe(1890.5);
    expect(await gravarDocumentos([doc({ blingId: "10", total: 1890.5 })])).toEqual({ gravados: 0, novos: 0 });
    expect(await gravarDocumentos([doc({ blingId: "10", total: 1890.5, situacaoId: 12 })])).toEqual({ gravados: 1, novos: 0 });
    const [l] = await lancamentosEntre(HOJE, HOJE);
    expect(l.status).toBe("cancelado");
    expect(l.valor).toBe(0);
  });

  it("documento antigo entra como histórico (conta, mas o telão não comemora)", async () => {
    await gravarDocumentos([doc({ blingId: "31", total: 500, data: "2025-01-10" })]);
    const velho = (await lancamentosEntre("2025-01-10", "2025-01-10"))[0];
    expect(velho.historico).toBe(true);
    expect(velho.valor).toBe(500);
  });

  it("anular no painel vale mesmo que o Bling mande de novo; trocar o valor à mão também", async () => {
    await gravarDocumentos([doc({ blingId: "50" }), doc({ blingId: "51", total: 800 })]);
    await ajustarLancamento("venda:50", { anular: true, data: HOJE });
    await ajustarLancamento("venda:51", { valorManual: 750, data: HOJE });
    await gravarDocumentos([doc({ blingId: "50", total: 999 }), doc({ blingId: "51", total: 810 })]);
    const lista = await lancamentosEntre(HOJE, HOJE);
    const a = lista.find((x) => x.id === "venda:50")!;
    expect(a.status).toBe("anulado");
    expect(a.valor).toBe(0);
    expect(lista.find((x) => x.id === "venda:51")!.valor).toBe(750);
  });
});

describe("ordens de serviço do Fechamento da assistência", () => {
  it("a OS vale mão de obra + peças, para o técnico; sem técnico fica guardada sem contar", async () => {
    const tec = await salvarPiloto(null, { nome: "Caio", funcao: "tecnico" });
    await salvarPiloto(null, { nome: "Ana", blingVendedorId: "111" });
    expect(await listarTecnicos()).toEqual([{ id: tec, nome: "Caio" }]);
    await registrarOS({ id: "abc", numero: "4521", data: HOJE, valor: 380, tecnicoId: tec, status: "Concluída" });
    await registrarOS({ id: "def", numero: "4522", data: HOJE, valor: 120, tecnicoId: null, status: "Entrada" });
    let e = await reconstruirTelao();
    expect(e.semana.linhas.find((l) => l.piloto.id === tec)).toMatchObject({ valor: 380, os: 1 });

    // Escolheu o técnico no painel da Arena; a OS chega de novo sem técnico e não perde.
    await trocarTecnicoDaOS("os:def", tec, HOJE);
    await registrarOS({ id: "def", numero: "4522", data: HOJE, valor: 150, tecnicoId: null, status: "Concluída" });
    e = await reconstruirTelao();
    expect(e.semana.linhas.find((l) => l.piloto.id === tec)).toMatchObject({ valor: 530, os: 2 });
  });

  it("OS que muda de data muda de mês; apagada sai da corrida", async () => {
    const tec = await salvarPiloto(null, { nome: "Caio", funcao: "tecnico" });
    await registrarOS({ id: "x1", numero: "1", data: "2026-09-30", valor: 100, tecnicoId: tec, status: null });
    await registrarOS({ id: "x1", numero: "1", data: "2026-10-01", valor: 100, tecnicoId: tec, status: null });
    expect(await lancamentosEntre("2026-09-01", "2026-09-30")).toHaveLength(0);
    expect(await lancamentosEntre("2026-10-01", "2026-10-31")).toHaveLength(1);
    await apagarOS("x1");
    expect(await lancamentosEntre("2026-09-01", "2026-10-31")).toHaveLength(0);
  });
});

describe("passagem de pontos para reais (configuração da versão 2)", () => {
  it("apaga as metas em pontos, põe R$ 63 mil / R$ 250 mil e refaz os lançamentos", async () => {
    await gravar("config", {
      versao: 2,
      pilotos: [{ id: "p1", slug: "ana", nome: "Ana", blingVendedorId: "111", metaSemana: 60, metaMes: 240, ativo: true }],
      regras: { venda: 10, orcamento: 2, licencaPalavras: ["windows"], licencaExcluir: [] },
      corrida: { titulo: "GP", metaGlobalSemana: 0, metaGlobalMes: 0, metaPadraoSemana: 60, metaPadraoMes: 240 },
      turbo: { janelas: [], multiplicador: 2 },
      whatsapp: { turbo: true },
      chaveHash: "abc",
    }, null);
    const mes = HOJE.slice(0, 7);
    await gravar(`lanc-${mes}`, {
      versao: 1,
      itens: {
        "venda:9": { id: "venda:9", tipo: "venda", origem: "bling", blingId: "9", numero: "9", blingVendedorId: "111", pilotoId: null, contatoId: null, contatoNome: null, data: HOJE, registradoEm: "", historico: false, total: 4200, situacaoId: 6, situacao: null, itens: [], licencas: 0, pontos: 18, detalhe: null, turbo: 1, status: "valido", motivo: null, anuladoManual: false, pontosManual: null, assinatura: "x" },
        "manual:1": { id: "manual:1", tipo: "manual", origem: "manual", pilotoId: "p1", data: HOJE, registradoEm: "", historico: false, total: 0, itens: [], licencas: 0, pontos: 240, status: "valido", motivo: "teste", anuladoManual: false, pontosManual: null },
      },
    }, null);

    const c = await lerConfig();
    expect(c.versao).toBe(3);
    expect(c.chaveHash).toBe("abc");
    expect(c.pilotos[0]).toMatchObject({ metaSemana: null, metaMes: null, funcao: "vendedor" });
    expect(c.corrida).toMatchObject({ metaGlobalSemana: 63000, metaGlobalMes: 250000 });
    expect("turbo" in c).toBe(false);

    const lista = await lancamentosEntre(HOJE, HOJE);
    expect(lista.find((l) => l.id === "venda:9")).toMatchObject({ valor: 4200, status: "valido" });
    expect(lista.find((l) => l.id === "manual:1")).toMatchObject({ valor: 0, status: "anulado" });
    const guardado = (await ler<{ itens: Record<string, Record<string, unknown>> }>(`lanc-${mes}`)).dados!.itens["venda:9"];
    expect(guardado.valor).toBe(4200);
    expect("pontos" in guardado).toBe(false);

    const e = await reconstruirTelao();
    expect(e.semana.linhas[0]).toMatchObject({ valor: 4200, meta: 63000 });
  });
});

describe("telão e avisos", () => {
  it("corrida pronta na gaveta, em reais e sem nome de cliente", async () => {
    const id = await salvarPiloto(null, { nome: "Brendon Oliveira", apelido: "Brendon", blingVendedorId: "111" });
    await gravarDocumentos([doc({ blingId: "60", total: 1200, contatoNome: "Fulano de Tal" })]);
    await reconstruirTelao();
    const e = (await estadoDoTelao())!;
    expect(e.semana.linhas[0].piloto.id).toBe(id);
    expect(e.semana.linhas[0].valor).toBe(1200);
    expect(e.semana.linhas[0].meta).toBe(63000); // um piloto só: a meta inteira da equipe
    expect(e.jogadasPorPiloto[id]).toHaveLength(1);
    expect(JSON.stringify(e)).not.toContain("Fulano");
  });

  it("avisa no WhatsApp quem cruzou a linha, em reais (uma vez só)", async () => {
    await salvarPiloto(null, { nome: "Marcos", blingVendedorId: "111", metaSemana: 2500 });
    await gravarWhatsApp({ ...WHATSAPP_PADRAO, ativo: true, destino: "120363025246125486@g.us" });
    await reconstruirTelao(); // corrida antes
    await gravarDocumentos([doc({ blingId: "70", total: 3000 })]);
    await reconstruirTelao();
    await reconstruirTelao();
    const metas = enviados.filter((m) => m.texto.includes("cruzou a linha"));
    expect(metas).toHaveLength(1);
    expect(metas[0].destino).toBe("120363025246125486@g.us");
    expect(metas[0].texto).toContain("*Marcos*");
    expect(metas[0].texto.replace(/\s/g, " ")).toContain("R$ 3.000 de R$ 2.500");
  });

  it("sem destino ou desligado, não avisa nada", () => {
    expect(avisosEntre(null, {} as never, { ...WHATSAPP_PADRAO, ativo: true, destino: "x" })).toEqual([]);
  });

  it("valor lançado à mão entra na corrida", async () => {
    const id = await salvarPiloto(null, { nome: "Wendell" });
    await lancarManual(id, 1500.4, "venda no balcão fora do Bling");
    const e = await reconstruirTelao();
    expect(e.semana.linhas.find((l) => l.piloto.id === id)!.valor).toBe(1500.4);
  });
});

describe("pareamento do vigia (sem arquivo de chave)", () => {
  it("pede, o painel aprova com o código, o vigia pega a chave uma vez só e ela vale", async () => {
    const { pedirPareamento, pedidoPendente, aprovarPareamento, buscarChavePareada } = await import("@/lib/arena/pareamento");
    const { chaveConfere } = await import("@/lib/arena/dados");
    const p = await pedirPareamento("DESKTOP-5KUJCVJ");
    expect(await buscarChavePareada(p.pedido, p.token)).toBeNull(); // ainda não aprovado
    const visto = (await pedidoPendente())!;
    expect(visto.maquina).toBe("DESKTOP-5KUJCVJ");
    expect(JSON.stringify(visto)).not.toContain(p.token);
    await expect(aprovarPareamento(visto.id, "0000")).rejects.toThrow(/código/);
    await aprovarPareamento(visto.id, visto.codigo);
    expect(await buscarChavePareada(p.pedido, "token-errado")).toEqual({ erro: "Token do pedido inválido." });
    const r = (await buscarChavePareada(p.pedido, p.token)) as { chave: string };
    expect(r.chave).toMatch(/^arena_/);
    expect(chaveConfere(r.chave, (await lerConfig()).chaveHash)).toBe(true);
    expect("erro" in ((await buscarChavePareada(p.pedido, p.token)) ?? {})).toBe(true); // só uma vez
    expect(await pedidoPendente()).toBeNull();
  });
});
