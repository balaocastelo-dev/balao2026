// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- o sistema de mentira guarda JSON solto */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Arena ← MEU BLING (25/10/2026): o site lê as vendas no /sistema (sem o vigia
// do PC e sem o Bling). Confere a leitura (com a forma nova ?de=&ate= e o
// recuo dia a dia), o que cada venda vale, os cancelamentos, a ligação
// automática pelo nome, o histórico do Bling e as rotas do PC da loja.
// Sem MySQL, sem /sistema de verdade e sem o site no ar.

vi.mock("@/lib/arena/whatsapp", () => ({ enviarAviso: vi.fn(async () => undefined), listarGrupos: vi.fn(async () => []) }));
vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async () => {
      throw new Error("a Arena não pode tocar o MySQL");
    }),
  },
  isTursoActive: () => false,
}));
vi.mock("@/lib/painel-auth", () => ({ isPainelAuthenticated: vi.fn(async () => false) }));

const CHAVE_DO_SISTEMA = "chave-do-sistema-de-teste-com-48-caracteres-aaaa";
process.env.MEU_BLING_CHAVE = CHAVE_DO_SISTEMA;

import { _gavetaDeTeste } from "@/lib/arena/gaveta";
import {
  gerarChaveDoVigia,
  gravarDocumentos,
  lancamentosEntre,
  lerConfig,
  lerSincronia,
  ligacoesPeloNome,
  nomeNormalizado,
  pedirVarredura,
  salvarPiloto,
  ajustarLancamento,
} from "@/lib/arena/dados";
import {
  _esquecerFormaDoPeriodo,
  documentoDaVenda,
  lerVendasDoSistema,
  pedacosDoPeriodo,
  sincronizarArena,
  totaisDasVendas,
  type VendaDaLista,
} from "@/lib/arena/sistema";
import { calcularEstado } from "@/lib/arena/estado";
import { montarPlacar, pilotoDoLancamento } from "@/lib/arena/placar";
import { janela } from "@/lib/arena/periodos";
import { _trocarRede } from "@/lib/pdv/sistema";
import type { Piloto } from "@/lib/arena/tipos";

const AGORA = new Date("2026-10-25T15:00:00-03:00");

function venda(p: Partial<VendaDaLista> & { id: number }): VendaDaLista {
  return {
    numero: 30000 + p.id,
    data: "2026-10-25",
    criadaEm: "2026-10-25T13:00:00.000Z",
    origem: "BALCAO",
    pdvId: null,
    cliente: "Cliente",
    vendedor: { id: 7, nome: "JULIA SOUZA" },
    total: 1000,
    situacao: { id: 3, nome: "Fechada", final: true, cancelamento: false },
    cancelada: false,
    nota: null,
    ...p,
  };
}

/** Um /sistema de mentira: a porta /api/v1/integracoes/site do MEU BLING. */
function sistemaFalso(op: { periodo?: boolean; fora?: boolean } = {}) {
  const estado = {
    vendas: [] as VendaDaLista[],
    itens: new Map<number, { nome: string; quantidade: number; valor: number }[]>(),
    vendedores: [{ id: 7, nome: "JULIA SOUZA" }, { id: 8, nome: "Brendon Oliveira" }] as { id: number; nome: string }[],
    periodo: op.periodo ?? true,
    fora: op.fora ?? false,
    documento: null as any,
  };
  const chamadas: { metodo: string; rota: string; corpo: any; auth: string | null }[] = [];
  const resp = (status: number, j: unknown) => new Response(JSON.stringify(j), { status, headers: { "content-type": "application/json" } });
  const f = vi.fn(async (url: string, init: RequestInit) => {
    const u = new URL(url);
    const rota = u.pathname.replace(/^.*\/integracoes\/site/, "");
    const corpo = init.body ? JSON.parse(String(init.body)) : null;
    chamadas.push({ metodo: String(init.method), rota: rota + u.search, corpo, auth: (init.headers as Record<string, string>).Authorization ?? null });
    if (estado.fora) throw new TypeError("fetch failed");
    if (rota === "/status") return resp(200, { ok: true });
    if (rota === "/vendedores") return resp(200, { vendedores: estado.vendedores });
    if (rota === "/vendas" && init.method === "GET") {
      const dia = u.searchParams.get("dia");
      const de = u.searchParams.get("de");
      const ate = u.searchParams.get("ate");
      if (de || ate) {
        if (!estado.periodo) return resp(400, { erro: "Dados inválidos: dia: Required" });
        return resp(200, { vendas: estado.vendas.filter((v) => v.data! >= de! && v.data! <= ate!) });
      }
      // forma antiga: sem o campo data
      return resp(200, { dia, vendas: estado.vendas.filter((v) => v.data === dia).map(({ data: _d, ...resto }) => resto) });
    }
    const m = rota.match(/^\/vendas\/(\d+)$/);
    if (m) return resp(200, { venda: { id: Number(m[1]), itens: estado.itens.get(Number(m[1])) ?? [] } });
    if (rota === "/agente/documentos") {
      if (!corpo?.idExterno) return resp(422, { erro: "idExterno obrigatório." });
      if (estado.documento && estado.documento.idExterno === corpo.idExterno) return resp(200, { documento: estado.documento.doc, criada: false });
      const doc = { id: 900, numero: 40001, tipo: corpo.tipo, total: 1234.5, situacao: { id: 1, nome: "Em aberto" }, itens: [], cliente: {} };
      estado.documento = { idExterno: corpo.idExterno, doc };
      return resp(201, { documento: doc, criada: true });
    }
    return resp(404, { erro: "rota não existe" });
  });
  _trocarRede(f as unknown as typeof fetch);
  return { estado, chamadas, f };
}

const nada = async () => undefined;

beforeEach(async () => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.ARENA_GAVETA_DIR;
  delete process.env.MYSQL_HOST;
  process.env.MEU_BLING_CHAVE = CHAVE_DO_SISTEMA;
  _gavetaDeTeste();
  _esquecerFormaDoPeriodo();
  // Configuração nova já nasce pedindo 3 meses de varredura (ver lerConfig): aqui cada teste pede a sua.
  await lerConfig();
  await pedirVarredura(null);
});

describe("venda do sistema → lançamento da Arena", () => {
  it("total, vendedor, dia e cancelamento", () => {
    const d = documentoDaVenda(venda({ id: 5, total: 2599.9 }))!;
    expect(d).toMatchObject({ sistemaId: "5", numero: "30005", data: "2026-10-25", vendedorId: "7", total: 2599.9, cancelada: false });
    const c = documentoDaVenda(venda({ id: 6, situacao: { id: 9, nome: "Cancelada", final: true, cancelamento: true }, cancelada: true }))!;
    expect(c.cancelada).toBe(true);
    // sem o campo data (forma antiga): o dia da criação no relógio de Campinas
    const { data: _d, ...semData } = venda({ id: 7, criadaEm: "2026-10-25T02:30:00.000Z" });
    expect(documentoDaVenda(semData as VendaDaLista)!.data).toBe("2026-10-24");
    expect(documentoDaVenda(venda({ id: 0 }))).toBeNull();
    expect(documentoDaVenda(venda({ id: 8, vendedor: null }))!.vendedorId).toBeNull();
  });

  it("período cortado em pedaços de até 92 dias", () => {
    expect(pedacosDoPeriodo("2026-10-01", "2026-10-25")).toEqual([{ de: "2026-10-01", ate: "2026-10-25" }]);
    const p = pedacosDoPeriodo("2026-01-01", "2026-10-25");
    expect(p[0]).toEqual({ de: "2026-07-26", ate: "2026-10-25" });
    expect(p[p.length - 1].de).toBe("2026-01-01");
  });

  it("grava id venda:mb<id>, origem sistema, cancelada vale R$ 0 com o motivo", async () => {
    const s = sistemaFalso();
    s.estado.vendas = [
      venda({ id: 11, total: 1500 }),
      venda({ id: 12, total: 800, situacao: { id: 9, nome: "Cancelada", final: true, cancelamento: true }, cancelada: true }),
      venda({ id: 13, total: 300, data: "2026-10-03", vendedor: null }),
    ];
    s.estado.itens.set(11, [{ nome: "Windows 11 Pro", quantidade: 1, valor: 299 }, { nome: "Notebook Dell", quantidade: 1, valor: 1201 }]);
    const reconstruir = vi.fn(nada);
    const r = await sincronizarArena({ agora: AGORA, reconstruir });
    expect(r.ok).toBe(true);
    expect(r.modo).toBe("periodo");
    expect(r.de).toBe("2026-10-01"); // primeira leitura do dia: desde o começo do mês
    expect(r.vendasLidas).toBe(3);
    expect(reconstruir).toHaveBeenCalledTimes(1);

    const lancs = await lancamentosEntre("2026-10-01", "2026-10-31");
    const l11 = lancs.find((l) => l.id === "venda:mb11")!;
    expect(l11).toMatchObject({ origem: "sistema", tipo: "venda", total: 1500, valor: 1500, status: "valido", sistemaVendedorId: "7", licencas: 1, valorLicencas: 299 });
    const l12 = lancs.find((l) => l.id === "venda:mb12")!;
    expect(l12).toMatchObject({ status: "cancelado", valor: 0, motivo: "Cancelado no sistema" });
    expect(lancs.find((l) => l.id === "venda:mb13")!.sistemaVendedorId).toBeNull();
    // a venda cancelada não pede o detalhe
    expect(s.chamadas.some((c) => c.rota === "/vendas/12")).toBe(false);
    // ninguém viu a chave do sistema além do Authorization
    expect(s.chamadas.every((c) => c.auth === `Bearer ${CHAVE_DO_SISTEMA}`)).toBe(true);
  });

  it("segunda volta: só hoje e ontem, sem gravar nem pedir detalhe do que não mudou; cancelou depois → R$ 0", async () => {
    const s = sistemaFalso();
    s.estado.vendas = [venda({ id: 21, total: 900 })];
    await sincronizarArena({ agora: AGORA, reconstruir: nada });
    const antes = s.chamadas.length;
    const r2 = await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    expect(r2.de).toBe("2026-10-24");
    expect(r2.gravadas).toBe(0);
    expect(s.chamadas.slice(antes).some((c) => c.rota.startsWith("/vendas/"))).toBe(false);

    s.estado.vendas[0] = venda({ id: 21, total: 900, situacao: { id: 9, nome: "Cancelada", final: true, cancelamento: true }, cancelada: true });
    const r3 = await sincronizarArena({ agora: new Date(AGORA.getTime() + 10 * 60_000), reconstruir: nada });
    expect(r3.gravadas).toBe(1);
    const l = (await lancamentosEntre("2026-10-25", "2026-10-25")).find((x) => x.id === "venda:mb21")!;
    expect(l).toMatchObject({ status: "cancelado", valor: 0 });
  });

  it("detalhe (itens) com limite por volta: o resto fica para as próximas", async () => {
    const s = sistemaFalso();
    s.estado.vendas = Array.from({ length: 20 }, (_, i) => venda({ id: 100 + i, total: 100 }));
    const r1 = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r1.detalhes).toBe(15);
    expect(r1.semItens).toBe(5);
    const r2 = await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    expect(r2.detalhes).toBe(5);
    expect(r2.gravadas).toBe(5);
    const r3 = await sincronizarArena({ agora: new Date(AGORA.getTime() + 10 * 60_000), reconstruir: nada });
    expect(r3.detalhes).toBe(0);
    expect(r3.semItens).toBe(0);
  });

  it("ajuste à mão no painel não é desfeito pela leitura do sistema", async () => {
    const s = sistemaFalso();
    s.estado.vendas = [venda({ id: 31, total: 2000 })];
    await sincronizarArena({ agora: AGORA, reconstruir: nada });
    await ajustarLancamento("venda:mb31", { valorManual: 1500, data: "2026-10-25" });
    s.estado.vendas[0] = venda({ id: 31, total: 2100 });
    await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    const l = (await lancamentosEntre("2026-10-25", "2026-10-25")).find((x) => x.id === "venda:mb31")!;
    expect(l.total).toBe(2100);
    expect(l.valor).toBe(1500);
  });
});

describe("forma nova ?de=&ate= ainda não publicada no MEU BLING", () => {
  it("400 no período → lê dia a dia (?dia=) e marca o modo", async () => {
    const s = sistemaFalso({ periodo: false });
    s.estado.vendas = [venda({ id: 41, data: "2026-10-24" }), venda({ id: 42, data: "2026-10-25" })];
    const r = await lerVendasDoSistema("2026-10-23", "2026-10-25");
    expect(r.modo).toBe("por-dia");
    expect(r.completo).toBe(true);
    expect(r.vendas.map((v) => [v.id, v.data]).sort()).toEqual([[41, "2026-10-24"], [42, "2026-10-25"]]);
    expect(s.chamadas.filter((c) => c.rota.includes("?dia=")).map((c) => c.rota)).toEqual([
      "/vendas?dia=2026-10-25",
      "/vendas?dia=2026-10-24",
      "/vendas?dia=2026-10-23",
    ]);
    // a próxima leitura nem tenta o período de novo (por uma hora)
    const antes = s.chamadas.length;
    await lerVendasDoSistema("2026-10-25", "2026-10-25");
    expect(s.chamadas.slice(antes).map((c) => c.rota)).toEqual(["/vendas?dia=2026-10-25"]);
  });

  it("a sincronia inteira funciona no modo dia a dia", async () => {
    const s = sistemaFalso({ periodo: false });
    s.estado.vendas = [venda({ id: 43, total: 700 })];
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.ok).toBe(true);
    expect(r.modo).toBe("por-dia");
    expect((await lerSincronia()).modo).toBe("por-dia");
    expect((await lancamentosEntre("2026-10-25", "2026-10-25")).find((l) => l.id === "venda:mb43")!.valor).toBe(700);
  });

  it("dia a dia sem tempo para o mês inteiro: lê hoje e ontem e a próxima volta continua de onde parou", async () => {
    const s = sistemaFalso({ periodo: false });
    s.estado.vendas = [venda({ id: 44, data: "2026-10-02" }), venda({ id: 45, data: "2026-10-25" })];
    const r1 = await sincronizarArena({ agora: AGORA, reconstruir: nada, limiteMs: -1 });
    expect(r1.ok).toBe(true);
    expect((await lerSincronia()).continuarDe).toBe("2026-10-01");
    expect((await lancamentosEntre("2026-10-01", "2026-10-31")).map((l) => l.id)).toEqual(["venda:mb45"]);
    const r2 = await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    expect(r2.de).toBe("2026-10-01");
    const sinc = await lerSincronia();
    expect(sinc.continuarDe).toBeNull();
    expect(sinc.varreduraDoMesEm).toBe("2026-10-25");
    expect((await lancamentosEntre("2026-10-01", "2026-10-31")).some((l) => l.id === "venda:mb44")).toBe(true);
  });

  it("outro erro (sistema fora) não vira dia a dia: a volta falha e anota o erro", async () => {
    sistemaFalso({ fora: true });
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/não respondeu/);
    const sinc = await lerSincronia();
    expect(sinc.ultimoErro).toMatch(/não respondeu/);
    expect(sinc.ultimoOk).toBeNull();
  });

  it("sem a chave do sistema na Vercel, avisa o que falta", async () => {
    sistemaFalso();
    delete process.env.MEU_BLING_CHAVE;
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/MEU_BLING_CHAVE/);
  });
});

describe("varredura pedida no painel (config.varrerDesde)", () => {
  it("lê desde a data pedida e limpa o pedido quando termina", async () => {
    const s = sistemaFalso();
    s.estado.vendas = [venda({ id: 51, data: "2026-09-10" })];
    await pedirVarredura("2026-09-01");
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.de).toBe("2026-09-01");
    expect(r.varreduraFeita).toBe(true);
    expect((await lerConfig()).varrerDesde).toBeNull();
    expect((await lancamentosEntre("2026-09-01", "2026-09-30")).some((l) => l.id === "venda:mb51")).toBe(true);
  });
});

describe("ligação automática dos vendedores do sistema", () => {
  const p = (id: string, nome: string, x: Partial<Piloto> = {}): Piloto => ({
    id, slug: id, nome, apelido: null, foto: null, cor: "#E60012", kart: "classico", numero: 1, blingVendedorId: null, sistemaVendedorId: null, funcao: "vendedor", metaSemana: null, metaMes: null, ativo: true, ...x,
  });

  it("nome completo sem acento e sem caixa; senão o primeiro nome único", () => {
    expect(nomeNormalizado("  JÚLIA   Souza ")).toBe("julia souza");
    const pilotos = [p("a", "Júlia Souza"), p("b", "Brendon"), p("c", "Marcos Lima"), p("d", "Marcos Paulo")];
    const vend = [{ id: "7", nome: "JULIA SOUZA" }, { id: "8", nome: "Brendon Oliveira" }, { id: "9", nome: "MARCOS ANTONIO" }];
    expect(ligacoesPeloNome(pilotos, vend)).toEqual([
      { pilotoId: "a", vendedorId: "7" },
      { pilotoId: "b", vendedorId: "8" },
    ]); // "Marcos" tem dois pilotos: não liga ninguém
  });

  it("nunca troca ligação manual (nem a desfeita à mão) e não liga vendedor já ocupado", () => {
    const pilotos = [p("a", "Julia Souza", { sistemaVendedorId: "99", sistemaLigadoPor: "manual" }), p("b", "Brendon", { sistemaLigadoPor: "manual" }), p("c", "Caio", { sistemaVendedorId: "10" })];
    expect(ligacoesPeloNome(pilotos, [{ id: "7", nome: "Julia Souza" }, { id: "8", nome: "Brendon" }, { id: "10", nome: "Caio" }])).toEqual([]);
  });

  it("na leitura: liga pelo nome, grava, e a venda conta para o piloto", async () => {
    const s = sistemaFalso();
    const julia = await salvarPiloto(null, { nome: "Júlia Souza", apelido: "Julia", blingVendedorId: "111" });
    const brendon = await salvarPiloto(null, { nome: "Brendon", sistemaVendedorId: "55" }); // manual: não muda
    s.estado.vendas = [venda({ id: 61, total: 3000 }), venda({ id: 62, total: 500, vendedor: { id: 8, nome: "Brendon Oliveira" } })];
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.ligados).toBe(1);
    const c = await lerConfig();
    expect(c.pilotos.find((x) => x.id === julia)).toMatchObject({ sistemaVendedorId: "7", sistemaLigadoPor: "auto", blingVendedorId: "111" });
    expect(c.pilotos.find((x) => x.id === brendon)).toMatchObject({ sistemaVendedorId: "55", sistemaLigadoPor: "manual" });
    expect(c.vendedoresSistema.map((v) => v.id)).toEqual(["7", "8"]);

    const lancs = await lancamentosEntre("2026-10-01", "2026-10-31");
    const placar = montarPlacar(c.pilotos, lancs, janela("mes", AGORA), c.corrida);
    expect(placar.linhas.find((l) => l.piloto.id === julia)!.valor).toBe(3000);
    expect(placar.linhas.find((l) => l.piloto.id === brendon)!.valor).toBe(0);

    // o painel salva o piloto sem mexer no vendedor do sistema: a ligação automática fica
    await salvarPiloto(julia, { nome: "Júlia Souza", apelido: "Ju" });
    expect((await lerConfig()).pilotos.find((x) => x.id === julia)).toMatchObject({ sistemaVendedorId: "7", sistemaLigadoPor: "auto" });
    // tirar à mão: vira manual e a leitura não liga de novo
    await salvarPiloto(julia, { nome: "Júlia Souza", sistemaVendedorId: null });
    await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    expect((await lerConfig()).pilotos.find((x) => x.id === julia)).toMatchObject({ sistemaVendedorId: null, sistemaLigadoPor: "manual" });
  });
});

describe("histórico do Bling continua", () => {
  it("piloto: pilotoId → vendedor do sistema → vendedor do Bling", () => {
    const pil = { id: "p1", sistemaVendedorId: "7", blingVendedorId: "111" } as Piloto;
    const porId = new Map([["p1", pil]]);
    const porSistema = new Map([["7", pil]]);
    const porBling = new Map([["111", pil]]);
    expect(pilotoDoLancamento({ pilotoId: null, sistemaVendedorId: "7", blingVendedorId: null }, porBling, porId, porSistema)).toBe(pil);
    expect(pilotoDoLancamento({ pilotoId: null, blingVendedorId: "111" }, porBling, porId, porSistema)).toBe(pil);
    expect(pilotoDoLancamento({ pilotoId: null, sistemaVendedorId: "8", blingVendedorId: "111" }, porBling, porId, porSistema)).toBeNull();
  });

  it("venda antiga do Bling conta; o mesmo pedido migrado para o sistema não conta duas vezes", async () => {
    const s = sistemaFalso();
    const id = await salvarPiloto(null, { nome: "Julia Souza", blingVendedorId: "111" });
    await gravarDocumentos(
      [{ tipo: "venda", blingId: "900", numero: "24500", data: "2026-10-20", vendedorBlingId: "111", contatoId: null, contatoNome: null, total: 5000, situacaoId: 9, situacao: null, itens: [] }],
      AGORA
    );
    s.estado.vendas = [venda({ id: 71, numero: 24500, data: "2026-10-20", total: 5000 }), venda({ id: 72, numero: 30072, total: 1000 })];
    const r = await sincronizarArena({ agora: AGORA, reconstruir: nada });
    expect(r.duplicadas).toBe(1);
    const c = await lerConfig();
    const lancs = await lancamentosEntre("2026-10-01", "2026-10-31");
    expect(lancs.find((l) => l.id === "venda:mb71")).toMatchObject({ status: "ignorado", valor: 0, duplicadoDoBling: true });
    expect(s.chamadas.some((x) => x.rota === "/vendas/71")).toBe(false);
    const placar = montarPlacar(c.pilotos, lancs, janela("mes", AGORA), c.corrida);
    expect(placar.linhas.find((l) => l.piloto.id === id)!.valor).toBe(6000);
  });

  it("primeira leitura de todas entra como histórico (o telão não comemora o mês inteiro)", async () => {
    const s = sistemaFalso();
    await salvarPiloto(null, { nome: "Julia Souza" });
    s.estado.vendas = [venda({ id: 81 })];
    await sincronizarArena({ agora: AGORA, reconstruir: nada });
    s.estado.vendas.push(venda({ id: 82 }));
    await sincronizarArena({ agora: new Date(AGORA.getTime() + 5 * 60_000), reconstruir: nada });
    const lancs = await lancamentosEntre("2026-10-25", "2026-10-25");
    expect(lancs.find((l) => l.id === "venda:mb81")!.historico).toBe(true);
    expect(lancs.find((l) => l.id === "venda:mb82")!.historico).toBe(false);
    const estado = calcularEstado(await lerConfig(), lancs, await lerSincronia(), new Date(AGORA.getTime() + 5 * 60_000));
    expect(estado.recentes.map((j) => j.id)).toEqual(["venda:mb82"]);
    expect(estado.sistemaUltimaVez).toBeTruthy();
  });
});

describe("totais para o PC da loja", () => {
  it("sem as canceladas, 'Sem vendedor', do maior valor para o menor", () => {
    const t = totaisDasVendas([
      venda({ id: 1, total: 100.1, vendedor: { id: 7, nome: "JULIA SOUZA" } }),
      venda({ id: 2, total: 200.2, vendedor: { id: 7, nome: "JULIA SOUZA" } }),
      venda({ id: 3, total: 500, vendedor: null }),
      venda({ id: 4, total: 250, vendedor: { id: 8, nome: "Brendon" } }),
      venda({ id: 5, total: 9999, situacao: { id: 9, nome: "Cancelada", final: true, cancelamento: true }, cancelada: true }),
    ]);
    expect(t).toEqual({
      quantidade: 4,
      valor: 1050.3,
      canceladas: 1,
      porVendedor: [
        { nome: "Sem vendedor", quantidade: 1, valor: 500 },
        { nome: "JULIA SOUZA", quantidade: 2, valor: 300.3 },
        { nome: "Brendon", quantidade: 1, valor: 250 },
      ],
    });
  });
});

describe("rotas", () => {
  const pedido = (url: string, chave?: string, init: RequestInit = {}) =>
    new Request(`https://www.balao.info${url}`, { ...init, headers: { ...(chave ? { Authorization: `Bearer ${chave}` } : {}), ...(init.headers ?? {}) } });

  it("/api/pc/sistema/*: sem a chave do PC, 401; com a chave, passa", async () => {
    sistemaFalso();
    const chave = await gerarChaveDoVigia();
    const status = (await import("@/app/api/pc/sistema/status/route")).GET;
    const vendas = (await import("@/app/api/pc/sistema/vendas/route")).GET;
    const documentos = (await import("@/app/api/pc/sistema/documentos/route")).POST;

    expect((await status(pedido("/api/pc/sistema/status"))).status).toBe(401);
    expect((await status(pedido("/api/pc/sistema/status", "arena_errada_com_mais_de_vinte_letras"))).status).toBe(401);
    expect((await vendas(pedido("/api/pc/sistema/vendas?de=2026-10-01&ate=2026-10-25", CHAVE_DO_SISTEMA))).status).toBe(401);
    expect((await documentos(pedido("/api/pc/sistema/documentos", undefined, { method: "POST", body: "{}" }))).status).toBe(401);

    const r = await status(pedido("/api/pc/sistema/status", chave));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, sistema: { ligado: true, motivo: null } });
  });

  it("/api/pc/sistema/vendas: período, 92 dias no máximo, totais", async () => {
    const s = sistemaFalso();
    const chave = await gerarChaveDoVigia();
    s.estado.vendas = [venda({ id: 1, total: 100 }), venda({ id: 2, total: 50, cancelada: true, situacao: { id: 9, nome: "Cancelada", final: true, cancelamento: true } })];
    const vendas = (await import("@/app/api/pc/sistema/vendas/route")).GET;
    expect((await vendas(pedido("/api/pc/sistema/vendas?de=2026-10-25", chave))).status).toBe(400);
    expect((await vendas(pedido("/api/pc/sistema/vendas?de=2026-10-26&ate=2026-10-25", chave))).status).toBe(400);
    expect((await vendas(pedido("/api/pc/sistema/vendas?de=2026-07-01&ate=2026-10-25", chave))).status).toBe(400);
    expect((await vendas(pedido("/api/pc/sistema/vendas?de=2026-07-26&ate=2026-10-25", chave))).status).toBe(200); // 92 dias
    const r = await vendas(pedido("/api/pc/sistema/vendas?de=2026-10-25&ate=2026-10-25", chave));
    const j = await r.json();
    expect(j.de).toBe("2026-10-25");
    expect(j.vendas).toHaveLength(2);
    expect(j.totais).toEqual({ quantidade: 1, valor: 100, canceladas: 1, porVendedor: [{ nome: "JULIA SOUZA", quantidade: 1, valor: 100 }] });
  });

  it("/api/pc/sistema/documentos: repassa, 201 criado / 200 repetido, erro do sistema volta com o status, fora do ar 503", async () => {
    const s = sistemaFalso();
    const chave = await gerarChaveDoVigia();
    const documentos = (await import("@/app/api/pc/sistema/documentos/route")).POST;
    const corpo = { idExterno: "julia-abc123", tipo: "PEDIDO", agente: "JUL.IA", cliente: { nome: "Fulano" }, itens: [{ siteId: "1", nome: "Mouse", quantidade: 1, valor: 1234.5 }] };
    const enviar = (b: unknown) => documentos(pedido("/api/pc/sistema/documentos", chave, { method: "POST", body: JSON.stringify(b), headers: { "Content-Type": "application/json" } }));

    const r1 = await enviar(corpo);
    expect(r1.status).toBe(201);
    expect(await r1.json()).toEqual({ documento: { id: 900, numero: 40001, tipo: "PEDIDO", total: 1234.5, situacao: { id: 1, nome: "Em aberto" } }, criada: true });
    expect(s.chamadas.find((c) => c.rota === "/agente/documentos")!.corpo).toEqual(corpo);
    const r2 = await enviar(corpo);
    expect(r2.status).toBe(200);
    expect((await r2.json()).criada).toBe(false);

    const r3 = await enviar({ tipo: "PEDIDO" });
    expect(r3.status).toBe(422);
    expect(await r3.json()).toEqual({ erro: "idExterno obrigatório." });

    s.estado.fora = true;
    const r4 = await enviar(corpo);
    expect(r4.status).toBe(503);
    expect((await r4.json()).erro).toBeTruthy();
  });

  it("/api/arena/bling responde 410 (o vigia não é mais usado)", async () => {
    const { GET, POST } = await import("@/app/api/arena/bling/route");
    const g = await GET();
    expect(g.status).toBe(410);
    expect((await g.json()).erro).toMatch(/MEU BLING desde 25\/10\/2026/);
    expect((await POST()).status).toBe(410);
  });

  it("/api/cron/arena-sistema: só o agendador da Vercel (ou o painel) roda", async () => {
    const s = sistemaFalso();
    s.estado.vendas = [venda({ id: 91 })];
    const { GET } = await import("@/app/api/cron/arena-sistema/route");
    expect((await GET(pedido("/api/cron/arena-sistema"))).status).toBe(401);
    const r = await GET(new Request("https://www.balao.info/api/cron/arena-sistema", { headers: { "user-agent": "vercel-cron/1.0" } }));
    expect(r.status).toBe(200);
    expect((await r.json()).ok).toBe(true);
  });
});
