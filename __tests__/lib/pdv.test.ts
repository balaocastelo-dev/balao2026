// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- o sistema de mentira guarda JSON solto */
import { describe, it, expect, beforeEach, vi } from "vitest";

// PDV: contas da venda, acesso ao Bling vindo do vigia (ainda usado pela Arena)
// e, desde 22/10/2026, a ida da venda ao /sistema (MEU BLING) — venda, nota e a
// lista do dia que junta o caixa com o que foi lançado direto no /sistema.
// Sem MySQL e sem /sistema de verdade.

vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async () => {
      throw new Error("o PDV não pode tocar o MySQL");
    }),
  },
  isTursoActive: () => false,
}));

process.env.PAINEL_PASSWORD = "senha-de-teste";
const CHAVE = "chave-do-sistema-de-teste-com-48-caracteres-aaaa";
process.env.MEU_BLING_CHAVE = CHAVE;

import { _gavetaDeTeste, ler } from "@/lib/arena/gaveta";
import { _limparCacheDoAcesso, guardarAcesso, marcarRecusado, precisaDeAcesso, tokenAtual } from "@/lib/pdv/acesso";
import { _trocarRede, assinaturaConfere } from "@/lib/pdv/sistema";
import { conferirVenda, documentoValido, lerPreco, novoIdDeVenda, tabelaPelosPagamentos, totaisDa, valorDoDesconto } from "@/lib/pdv/calculos";
import { CLIENTE_VAZIO } from "@/lib/pdv/tipos";
import {
  diaDoId,
  lerEntrada,
  lerVenda,
  normalizarVenda,
  pedirNotaDepois,
  registrarVenda,
  seguirPendentes,
  sincronizarVenda,
  tentarDeNovo,
  VendaInvalida,
  vendasDoDia,
} from "@/lib/pdv/vendas";

const TOKEN = "t".repeat(40);

/** Um /sistema de mentira (a porta /api/v1/integracoes/site do MEU BLING), com o mínimo de estado. */
function sistemaFalso() {
  const chamadas: { metodo: string; url: string; corpo: any; auth: string | null }[] = [];
  const estado = { vendas: [] as any[], fora: false, pendenciaNaNota: null as string | null, notas: new Map<number, any>() };
  const resp = (status: number, j: unknown) => new Response(JSON.stringify(j), { status, headers: { "content-type": "application/json" } });
  const vendaCompleta = (v: any) => ({
    id: v.id,
    numero: v.numero,
    data: v.criadaEm,
    criadaEm: v.criadaEm,
    origem: "BALCAO",
    pdvId: v.pdvId,
    situacao: { id: 3, nome: "Fechada", final: true, cancelamento: false },
    cancelada: false,
    vendedor: v.vendedorId ? { id: v.vendedorId, nome: "JULIA SOUZA" } : null,
    cliente: { ...v.cliente, sistemaId: 77 },
    itens: [],
    totalProdutos: v.total,
    desconto: 0,
    total: v.total,
    pagamentos: [],
    observacoes: null,
    nota: v.notaId ? estado.notas.get(v.notaId) : null,
  });
  const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const metodo = init?.method || "GET";
    const corpo = init?.body ? JSON.parse(String(init.body)) : null;
    const auth = (init?.headers as Record<string, string>)?.Authorization ?? null;
    chamadas.push({ metodo, url, corpo, auth });
    if (estado.fora) throw new TypeError("fetch failed");
    if (auth !== `Bearer ${CHAVE}`) return resp(401, { erro: "Chave do site inválida" });
    const u = new URL(url);
    const r = u.pathname.replace(/^\/sistema\/api\/v1\/integracoes\/site/, "");
    if (r === "/vendas" && metodo === "POST") {
      const ja = estado.vendas.find((v) => v.pdvId === corpo.pdvId);
      if (ja) return resp(200, { venda: vendaCompleta(ja), criada: false });
      const total = corpo.itens.reduce((s: number, i: any) => s + i.quantidade * i.valor, 0) - corpo.descontoEmReais;
      const v = { ...corpo, id: 501 + estado.vendas.length, numero: 24838 + estado.vendas.length, criadaEm: "2026-10-22T18:00:00.000Z", total };
      estado.vendas.push(v);
      return resp(201, { venda: vendaCompleta(v), criada: true });
    }
    if (r === "/vendas" && metodo === "GET") {
      return resp(200, {
        vendas: estado.vendas.map((v) => ({
          id: v.id,
          numero: v.numero,
          criadaEm: v.criadaEm,
          origem: "BALCAO",
          pdvId: v.pdvId ?? null,
          cliente: v.cliente?.nome || "Consumidor Final",
          vendedor: v.vendedorId ? { id: v.vendedorId, nome: "JULIA SOUZA" } : null,
          total: v.total,
          situacao: { id: 3, nome: "Fechada", final: true, cancelamento: false },
          cancelada: false,
          nota: v.notaId ? estado.notas.get(v.notaId) : null,
        })),
      });
    }
    const nfe = /^\/vendas\/(\d+)\/nfe$/.exec(r);
    if (nfe && metodo === "POST") {
      if (estado.pendenciaNaNota) return resp(422, { erro: estado.pendenciaNaNota, code: "NFE_PENDENCIAS" });
      const v = estado.vendas.find((x) => String(x.id) === nfe[1]);
      const nota = { id: 9001, numero: 2206, serie: 4, modelo: 55, situacao: "AUTORIZADA", chave: "3526" + "1".repeat(40), motivo: "Autorizado o uso da NF-e", cStat: "100", autorizadaEm: "2026-10-22T18:00:05.000Z" };
      estado.notas.set(nota.id, nota);
      v.notaId = nota.id;
      return resp(200, { nota });
    }
    const consulta = /^\/notas\/(\d+)\/consultar$/.exec(r);
    if (consulta) return resp(200, { nota: estado.notas.get(Number(consulta[1])) ?? null });
    return resp(404, { erro: `rota de teste desconhecida: ${metodo} ${r}` });
  });
  return { f, chamadas, estado };
}

const ENTRADA = {
  itens: [
    { produtoId: "abc123", nome: "SSD Kingston 1TB", foto: null, quantidade: 2, valor: 399.9, valorDoSite: 399.9 },
    { produtoId: "avulso-1", nome: "Instalação", foto: null, quantidade: 1, valor: 50, valorDoSite: null },
  ],
  cliente: { ...CLIENTE_VAZIO },
  vendedor: { id: "3", nome: "JULIA SOUZA" },
  desconto: { tipo: "valor" as const, valor: 49.8 },
  pagamentos: [{ forma: "pix" as const, valor: 800 }],
  observacao: "",
  pedirNota: false,
};

beforeEach(() => {
  _gavetaDeTeste();
  _limparCacheDoAcesso();
  process.env.MEU_BLING_CHAVE = CHAVE;
});

describe("contas da venda", () => {
  it("soma, desconto, troco e o que falta", () => {
    const t = totaisDa({
      itens: [{ quantidade: 2, valor: 10.005 }, { quantidade: 1, valor: 5 }],
      desconto: { tipo: "percentual", valor: 10 },
      pagamentos: [{ forma: "dinheiro", valor: 22.5, recebido: 50 }],
    });
    expect(t.subtotal).toBe(25.02);
    expect(t.desconto).toBe(2.5);
    expect(t.total).toBe(22.52);
    expect(t.falta).toBe(0.02);
    expect(t.troco).toBe(27.5);
  });

  it("desconto nunca passa do subtotal", () => {
    expect(valorDoDesconto(100, { tipo: "valor", valor: 500 })).toBe(100);
    expect(valorDoDesconto(100, { tipo: "percentual", valor: 150 })).toBe(100);
    expect(valorDoDesconto(100, { tipo: "valor", valor: -3 })).toBe(0);
  });

  it("crédito leva a venda para a tabela do cartão", () => {
    expect(tabelaPelosPagamentos([{ forma: "pix" }])).toBe("vista");
    expect(tabelaPelosPagamentos([{ forma: "pix" }, { forma: "credito" }])).toBe("cartao");
  });

  it("lê o preço como o site guarda", () => {
    expect(lerPreco("R$ 1.234,56")).toBe(1234.56);
    expect(lerPreco("R$ 99,90")).toBe(99.9);
    expect(lerPreco(12)).toBe(12);
    expect(lerPreco("")).toBe(0);
  });

  it("CPF e CNPJ de verdade", () => {
    expect(documentoValido("529.982.247-25")).toBe(true);
    expect(documentoValido("111.111.111-11")).toBe(false);
    expect(documentoValido("34.397.947/0001-08")).toBe(true);
    expect(documentoValido("34.397.947/0001-09")).toBe(false);
  });

  it("nota pede documento e endereço; item a zero é recusado", () => {
    const base = { ...ENTRADA, pagamentos: [{ forma: "pix" as const, valor: 800 }] };
    expect(conferirVenda(base)).toEqual([]);
    const comNota = conferirVenda({ ...base, pedirNota: true }).map((p) => p.mensagem).join(" ");
    expect(comNota).toMatch(/CPF ou CNPJ/);
    expect(comNota).toMatch(/endereço/);
    const zerado = conferirVenda({ ...base, itens: [{ ...base.itens[0], valor: 0 }], pagamentos: [] });
    expect(zerado.map((p) => p.mensagem).join(" ")).toMatch(/R\$ 0,00/);
  });

  it("pagamento a menos ou a mais não fecha", () => {
    expect(conferirVenda({ ...ENTRADA, pagamentos: [{ forma: "pix", valor: 700 }] })[0].mensagem).toMatch(/Faltam/);
    expect(conferirVenda({ ...ENTRADA, pagamentos: [{ forma: "pix", valor: 900 }] })[0].mensagem).toMatch(/passam/);
  });

  it("id do PDV carrega o dia", () => {
    const id = novoIdDeVenda("2026-10-12", () => 0);
    expect(id).toBe("PDV-261012-AAAA");
    expect(diaDoId(id)).toBe("2026-10-12");
    expect(diaDoId("sistema-123")).toBeNull();
  });
});

describe("acesso ao Bling (vigia — ainda usado pela Arena)", () => {
  it("guarda cifrado, devolve o token e para de usar depois do 401", async () => {
    expect(await precisaDeAcesso()).toBe(true);
    const expira = new Date(Date.now() + 5 * 3600_000).toISOString();
    expect(await guardarAcesso({ token: TOKEN, expiraEm: expira, maquina: "PC" })).toBe(true);
    expect(await guardarAcesso({ token: TOKEN, expiraEm: expira, maquina: "PC" })).toBe(false);
    const guardado = await ler<Record<string, string>>("pdv/acesso");
    expect(JSON.stringify(guardado.dados)).not.toContain(TOKEN);
    _limparCacheDoAcesso();
    expect((await tokenAtual()).token).toBe(TOKEN);
    await marcarRecusado(TOKEN);
    expect((await tokenAtual()).token).toBeNull();
    expect(await precisaDeAcesso()).toBe(true);
  });

  it("token perto de vencer não é usado", async () => {
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 60_000).toISOString(), maquina: null });
    expect((await tokenAtual()).motivo).toMatch(/venceu/);
  });

  it("recusa coisa que não parece token", async () => {
    await expect(guardarAcesso({ token: "x y", expiraEm: new Date().toISOString(), maquina: null })).rejects.toThrow();
  });
});

describe("venda do balcão até o /sistema", () => {
  it("sem a chave do sistema, grava e fica aguardando; com a chave, segue sozinha", async () => {
    const s = sistemaFalso();
    _trocarRede(s.f as unknown as typeof fetch);
    delete process.env.MEU_BLING_CHAVE;
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão", new Date("2026-10-22T15:00:00-03:00"));
    expect(venda.total).toBe(800);
    const sem = await sincronizarVenda(venda.id);
    expect(sem?.sistema.estado).toBe("pendente");
    expect(sem?.sistema.mensagem).toMatch(/MEU_BLING_CHAVE/);
    expect(s.chamadas).toHaveLength(0);

    process.env.MEU_BLING_CHAVE = CHAVE;
    expect(await seguirPendentes()).toBe(1);
    const depois = await lerVenda(venda.id);
    expect(depois?.sistema.estado).toBe("no-sistema");
    expect(depois?.sistema.vendaId).toBe(501);
    expect(depois?.sistema.numero).toBe("24838");
    const enviada = s.estado.vendas[0];
    expect(s.chamadas[0].auth).toBe(`Bearer ${CHAVE}`);
    expect(enviada.pdvId).toBe(venda.id);
    expect(enviada.vendedorId).toBe(3);
    expect(enviada.itens).toEqual([
      { siteId: "abc123", nome: "SSD Kingston 1TB", foto: null, quantidade: 2, valor: 399.9 },
      { siteId: null, nome: "Instalação", foto: null, quantidade: 1, valor: 50 },
    ]);
    expect(enviada.descontoEmReais).toBe(49.8);
    expect(enviada.pagamentos).toEqual([{ forma: "pix", valor: 800, parcelas: null }]);
    expect(enviada.observacoesInternas).toContain(venda.id);
    expect(await ler("pdv/pendentes")).toMatchObject({ dados: { ids: [] } });
  });

  it("o sistema fora do ar não perde a venda; quando volta, não duplica", async () => {
    const s = sistemaFalso();
    s.estado.fora = true;
    _trocarRede(s.f as unknown as typeof fetch);
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão");
    const r = await sincronizarVenda(venda.id);
    expect(r?.sistema.estado).toBe("pendente");
    s.estado.fora = false;
    await sincronizarVenda(venda.id);
    await tentarDeNovo(venda.id); // repetir não cria outra venda
    expect(s.estado.vendas).toHaveLength(1);
    expect((await lerVenda(venda.id))?.sistema.estado).toBe("no-sistema");
  });

  it("com nota: emite pelo sistema e o QR leva ao DANFE assinado", async () => {
    const s = sistemaFalso();
    _trocarRede(s.f as unknown as typeof fetch);
    const cliente = {
      ...CLIENTE_VAZIO,
      nome: "Maria Teste",
      documento: "52998224725",
      email: "maria@exemplo.com",
      cep: "13025000",
      endereco: "Av. Anchieta",
      numero: "789",
      bairro: "Cambuí",
      cidade: "Campinas",
      uf: "SP",
    };
    const venda = await registrarVenda(lerEntrada({ ...ENTRADA, cliente, pedirNota: true }), "Painel");
    const r = await sincronizarVenda(venda.id);
    expect(r?.nota.estado).toBe("autorizada");
    expect(r?.nota.numero).toBe("2206");
    expect(r?.nota.serie).toBe("4");
    expect(r?.cliente.sistemaId).toBe(77);
    const link = r!.nota.linkDanfe!;
    expect(link).toMatch(/^https:\/\/www\.balao\.info\/api\/pdv\/danfe\/9001\?t=[0-9a-f]{32}$/);
    const t = new URL(link).searchParams.get("t");
    expect(assinaturaConfere(9001, t)).toBe(true);
    expect(assinaturaConfere(9002, t)).toBe(false);
    expect(await ler("pdv/pendentes")).toMatchObject({ dados: { ids: [] } });
  });

  it("nota com pendência: a venda fica feita e o balcão lê o que falta", async () => {
    const s = sistemaFalso();
    s.estado.pendenciaNaNota = "Não dá para emitir a nota ainda — 1 pendência: produto sem NCM.";
    _trocarRede(s.f as unknown as typeof fetch);
    const cliente = { ...CLIENTE_VAZIO, nome: "Maria", documento: "52998224725", cep: "13025000", endereco: "Rua", numero: "1", bairro: "B", cidade: "Campinas", uf: "SP" };
    const venda = await registrarVenda(lerEntrada({ ...ENTRADA, cliente, pedirNota: true }), "Balcão");
    const r = await sincronizarVenda(venda.id);
    expect(r?.sistema.estado).toBe("no-sistema");
    expect(r?.nota.estado).toBe("erro");
    expect(r?.nota.mensagem).toMatch(/NCM/);
    // corrigido no sistema: "tentar de novo" emite
    s.estado.pendenciaNaNota = null;
    const de = await tentarDeNovo(venda.id);
    expect(de?.nota.estado).toBe("autorizada");
  });

  it("nota pedida depois leva o cliente novo junto", async () => {
    const s = sistemaFalso();
    _trocarRede(s.f as unknown as typeof fetch);
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão");
    await sincronizarVenda(venda.id);
    const cliente = { ...CLIENTE_VAZIO, nome: "João", documento: "52998224725", cep: "13025000", endereco: "Rua", numero: "1", bairro: "B", cidade: "Campinas", uf: "SP" };
    const r = await pedirNotaDepois(venda.id, cliente);
    expect(r?.nota.estado).toBe("autorizada");
    const pedido = s.chamadas.find((c) => c.metodo === "POST" && c.url.endsWith("/vendas/501/nfe"))!;
    expect(pedido.corpo.cliente.documento).toBe("52998224725");
  });

  it("venda inválida nem é gravada", async () => {
    await expect(registrarVenda(lerEntrada({ ...ENTRADA, pagamentos: [] }), "Balcão")).rejects.toBeInstanceOf(VendaInvalida);
  });

  it("lista do dia junta o caixa com o que foi lançado direto no sistema", async () => {
    const s = sistemaFalso();
    _trocarRede(s.f as unknown as typeof fetch);
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão", new Date("2026-10-22T15:00:00-03:00"));
    await sincronizarVenda(venda.id);
    // uma venda feita na tela do /sistema, no mesmo dia
    s.estado.vendas.push({ id: 502, numero: 24839, criadaEm: "2026-10-22T19:30:00.000Z", pdvId: null, cliente: { nome: "Cliente da loja" }, total: 150, nota: null });
    const resumo = await vendasDoDia(venda.dia);
    expect(resumo.sistema.lido).toBe(true);
    expect(resumo.linhas.map((l) => [l.origem, l.numero])).toEqual([
      ["sistema", "24839"],
      ["pdv", "24838"],
    ]);
    expect(resumo.linhas[1].vendedor).toBe("JULIA SOUZA");
    expect(resumo.totais).toMatchObject({ vendas: 2, valor: 950, aguardando: 0 });
  });

  it("venda gravada no tempo do Bling não vai para o sistema", async () => {
    const s = sistemaFalso();
    _trocarRede(s.f as unknown as typeof fetch);
    const antiga = normalizarVenda({
      id: "PDV-261020-ABCD",
      bling: { estado: "no-bling", pedidoId: "555", numero: "24800" },
      nota: { estado: "nao-pedida" },
      cliente: { nome: "X", blingId: "9" },
    } as any);
    expect(antiga.legadoBling).toEqual({ pedidoId: "555", numero: "24800" });
    expect(antiga.sistema.estado).toBe("no-sistema");
    const nuncaFoi = normalizarVenda({ id: "PDV-261020-ABCE", bling: { estado: "pendente", pedidoId: null }, nota: { estado: "nao-pedida" }, cliente: {} } as any);
    expect(nuncaFoi.legadoBling).toBeNull();
    expect(nuncaFoi.sistema.estado).toBe("pendente");
    expect(s.chamadas).toHaveLength(0);
  });
});
