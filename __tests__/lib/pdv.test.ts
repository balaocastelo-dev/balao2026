// @vitest-environment node
/* eslint-disable @typescript-eslint/no-explicit-any -- o Bling de mentira guarda JSON solto */
import { describe, it, expect, beforeEach, vi } from "vitest";

// PDV novo (12/10/2026): contas da venda, acesso ao Bling vindo do vigia,
// ida da venda ao Bling (contato → pedido → nota) e a lista do dia que junta
// o PDV com os pedidos lançados direto no Bling. Sem MySQL e sem Bling de verdade.

vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async () => {
      throw new Error("o PDV não pode tocar o MySQL");
    }),
  },
  isTursoActive: () => false,
}));

process.env.PAINEL_PASSWORD = "senha-de-teste";

import { _gavetaDeTeste, ler } from "@/lib/arena/gaveta";
import { _limparCacheDoAcesso, guardarAcesso, marcarRecusado, precisaDeAcesso, tokenAtual } from "@/lib/pdv/acesso";
import { _trocarRede, corpoDoPedido, escolherForma, montarConsulta, type FormaDoBling } from "@/lib/pdv/bling";
import { conferirVenda, documentoValido, lerPreco, novoIdDeVenda, tabelaPelosPagamentos, totaisDa, valorDoDesconto } from "@/lib/pdv/calculos";
import { CLIENTE_VAZIO } from "@/lib/pdv/tipos";
import { diaDoId, lerEntrada, lerVenda, registrarVenda, seguirPendentes, sincronizarVenda, VendaInvalida, vendasDoDia } from "@/lib/pdv/vendas";

const TOKEN = "t".repeat(40);
const FORMAS = [
  { id: 1562401, descricao: "PIX", tipoPagamento: 17, situacao: 1, padrao: 0 },
  { id: 2, descricao: "Dinheiro", tipoPagamento: 1, situacao: 1, padrao: 1 },
  { id: 3, descricao: "Cartão de Crédito", tipoPagamento: 3, situacao: 1, padrao: 0 },
  { id: 4, descricao: "Cartão de Débito", tipoPagamento: 4, situacao: 1, padrao: 0 },
];

/** Um Bling de mentira, com o mínimo de estado para seguir uma venda. */
function blingFalso() {
  const chamadas: { metodo: string; url: string; corpo: any }[] = [];
  const estado = { pedidos: [] as any[], nota: 0, notaEnviada: false, recusar401: false, contatos: [] as any[] };
  const resp = (status: number, j: unknown) => new Response(JSON.stringify(j), { status, headers: { "content-type": "application/json" } });
  const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const metodo = init?.method || "GET";
    const corpo = init?.body ? JSON.parse(String(init.body)) : null;
    chamadas.push({ metodo, url, corpo });
    if (estado.recusar401) return resp(401, { error: { type: "invalid_token" } });
    const u = new URL(url);
    const c = u.pathname.replace("/Api/v3/", "");
    if (c === "contatos" && metodo === "GET") {
      // Como o Bling: critério padrão (3) só ativos; 1 = todos menos excluídos; 2 = só excluídos.
      const doc = u.searchParams.get("numeroDocumento");
      const criterio = u.searchParams.get("criterio") ?? "3";
      const visiveis = estado.contatos.filter((x) =>
        criterio === "2" ? x.situacao === "E" : criterio === "1" ? x.situacao !== "E" : (x.situacao ?? "A") === "A"
      );
      return resp(200, { data: visiveis.filter((x) => doc && x.numeroDocumento === doc) });
    }
    const situacao = /^contatos\/(\d+)\/situacoes$/.exec(c);
    if (situacao && metodo === "PATCH") {
      const x = estado.contatos.find((k) => String(k.id) === situacao[1]);
      if (x) x.situacao = corpo.situacao;
      return new Response(null, { status: 204 });
    }
    if (c === "contatos" && metodo === "POST") {
      const dono = estado.contatos.find((x) => corpo.numeroDocumento && x.numeroDocumento === corpo.numeroDocumento);
      if (dono) {
        return resp(400, {
          error: { description: "O contato não pode ser salvo, pois ocorreram problemas em sua validação.", fields: [{ msg: `O CPF já está cadastrado no contato ${dono.nome}` }] },
        });
      }
      const novo = { id: 900 + estado.contatos.length, ...corpo };
      estado.contatos.push(novo);
      return resp(201, { data: { id: novo.id } });
    }
    if (c === "formas-pagamentos") return resp(200, { data: FORMAS });
    if (c === "pedidos/vendas" && metodo === "POST") {
      const p = { id: 555 + estado.pedidos.length, numero: 24800 + estado.pedidos.length, ...corpo };
      estado.pedidos.push(p);
      return resp(201, { data: { id: p.id } });
    }
    if (c === "pedidos/vendas" && metodo === "GET") {
      const idContato = u.searchParams.get("idContato");
      const lista = estado.pedidos
        .filter((p) => !idContato || String(p.contato.id) === idContato)
        .map((p) => ({ id: p.id, numero: p.numero, data: p.data, total: p.totalCalculado ?? 0, contato: { id: p.contato.id, nome: "Cliente" }, situacao: { id: 6, valor: 0 } }));
      return resp(200, { data: lista });
    }
    const pedido = /^pedidos\/vendas\/(\d+)$/.exec(c);
    if (pedido) {
      const p = estado.pedidos.find((x) => String(x.id) === pedido[1]);
      return resp(200, { data: { ...p, notaFiscal: { id: estado.nota } } });
    }
    if (/^pedidos\/vendas\/\d+\/gerar-nfe$/.test(c)) {
      estado.nota = 777;
      return resp(201, { idNotaFiscal: 777 });
    }
    if (c === "nfe/777/enviar") {
      estado.notaEnviada = true;
      return resp(200, { data: { xml: "<x/>" } });
    }
    if (c === "nfe/777") {
      return resp(200, {
        data: {
          id: 777,
          numero: "002198",
          serie: 4,
          situacao: estado.notaEnviada ? 6 : 1,
          chaveAcesso: estado.notaEnviada ? "3526" + "1".repeat(40) : "",
          linkDanfe: estado.notaEnviada ? "https://www.bling.com.br/doc.view.php?id=x" : "",
          valorNota: 100,
        },
      });
    }
    return resp(404, { error: { description: `rota de teste desconhecida: ${metodo} ${c}` } });
  });
  return { f, chamadas, estado };
}

const ENTRADA = {
  itens: [
    { produtoId: "abc123", nome: "SSD Kingston 1TB", foto: null, quantidade: 2, valor: 399.9, valorDoSite: 399.9 },
    { produtoId: "avulso-1", nome: "Instalação", foto: null, quantidade: 1, valor: 50, valorDoSite: null },
  ],
  cliente: { ...CLIENTE_VAZIO },
  vendedor: { id: "15596536241", nome: "JULIA SOUZA" },
  desconto: { tipo: "valor" as const, valor: 49.8 },
  pagamentos: [{ forma: "pix" as const, valor: 800 }],
  observacao: "",
  pedirNota: false,
};

beforeEach(() => {
  _gavetaDeTeste();
  _limparCacheDoAcesso();
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
    expect(diaDoId("bling-123")).toBeNull();
  });
});

describe("acesso ao Bling", () => {
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

describe("pedido no Bling", () => {
  const formas: FormaDoBling[] = FORMAS.map((f) => ({ id: f.id, descricao: f.descricao, tipo: f.tipoPagamento, padrao: f.padrao }));

  it("lista com colchetes (armadilha 4)", () => {
    expect(montarConsulta({ "idsSituacoes": [6, 9], limite: 1 })).toBe("?idsSituacoes%5B%5D=6&idsSituacoes%5B%5D=9&limite=1");
  });

  it("forma de pagamento pelo tipo do Bling", () => {
    expect(escolherForma(formas, "pix")?.id).toBe(1562401);
    expect(escolherForma(formas, "credito")?.id).toBe(3);
    expect(escolherForma(formas, "boleto")?.id).toBe(2); // sem boleto: a padrão
  });

  it("monta o corpo com desconto, parcelas e vendedor; recusa item zerado", () => {
    const corpo = corpoDoPedido(
      {
        data: "2026-10-12",
        contatoId: "900",
        vendedorId: "15596536241",
        itens: [{ codigo: "SITE-abc", descricao: "SSD", quantidade: 1, valor: 100 }],
        descontoEmReais: 10,
        parcelas: [{ forma: "pix", valor: 90 }],
        observacoes: "",
        observacoesInternas: "PDV",
      },
      formas
    );
    expect(corpo).toMatchObject({
      contato: { id: 900 },
      vendedor: { id: 15596536241 },
      desconto: { valor: 10, unidade: "REAL" },
      parcelas: [{ valor: 90, formaPagamento: { id: 1562401 }, dataVencimento: "2026-10-12" }],
    });
    expect(() =>
      corpoDoPedido({ data: "2026-10-12", contatoId: "1", vendedorId: null, itens: [{ codigo: "", descricao: "x", quantidade: 1, valor: 0 }], descontoEmReais: 0, parcelas: [], observacoes: "", observacoesInternas: "" }, formas)
    ).toThrow(/zerado/);
  });
});

describe("venda do balcão até o Bling", () => {
  it("sem acesso, grava e fica aguardando; com acesso, segue sozinha", async () => {
    const b = blingFalso();
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão", new Date("2026-10-12T15:00:00-03:00"));
    expect(venda.total).toBe(800);
    const sem = await sincronizarVenda(venda.id);
    expect(sem?.bling.estado).toBe("pendente");
    expect(sem?.bling.mensagem).toMatch(/vigia/);
    expect(b.chamadas).toHaveLength(0);

    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
    expect(await seguirPendentes()).toBe(1);
    const depois = await lerVenda(venda.id);
    expect(depois?.bling.estado).toBe("no-bling");
    expect(depois?.bling.pedidoId).toBe("555");
    expect(depois?.bling.numero).toBe("24800");
    const pedido = b.estado.pedidos[0];
    expect(pedido.itens).toEqual([
      { codigo: "SITE-abc123", descricao: "SSD Kingston 1TB", unidade: "UN", quantidade: 2, valor: 399.9 },
      { codigo: "", descricao: "Instalação", unidade: "UN", quantidade: 1, valor: 50 },
    ]);
    expect(pedido.desconto).toEqual({ valor: 49.8, unidade: "REAL" });
    expect(pedido.vendedor).toEqual({ id: 15596536241 });
    expect(pedido.observacoesInternas).toContain(venda.id);
    // Consumidor final: um contato só, reaproveitado.
    expect(b.estado.contatos).toHaveLength(1);
    expect(b.estado.contatos[0].nome).toBe("Consumidor final");
  });

  it("com nota: gera, manda à Sefaz e guarda o DANFE", async () => {
    const b = blingFalso();
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
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
    expect(r?.nota.numero).toBe("002198");
    expect(r?.nota.linkDanfe).toContain("bling.com.br");
    expect(b.estado.notaEnviada).toBe(true);
    const envio = b.chamadas.find((c) => c.url.includes("nfe/777/enviar"))!;
    expect(envio.url).toContain("enviarEmail=true");
    expect(b.estado.contatos[0]).toMatchObject({ numeroDocumento: "52998224725", tipo: "F" });
    expect(await ler("pdv/pendentes")).toMatchObject({ dados: { ids: [] } });
  });

  it("401 do Bling: a venda espera e o acesso vira 'precisa de novo'", async () => {
    const b = blingFalso();
    b.estado.recusar401 = true;
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão");
    const r = await sincronizarVenda(venda.id);
    expect(r?.bling.estado).toBe("pendente");
    expect(await precisaDeAcesso()).toBe(true);
  });

  it("CPF de contato excluído no Bling: acha, reativa e usa (não tenta cadastrar de novo)", async () => {
    const b = blingFalso();
    b.estado.contatos.push({ id: 7830745032, nome: "Thiago Herrera", numeroDocumento: "52998224725", situacao: "E" });
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
    const venda = await registrarVenda(lerEntrada({ ...ENTRADA, cliente: { ...CLIENTE_VAZIO, nome: "Thiago", documento: "52998224725" } }), "Balcão");
    const r = await sincronizarVenda(venda.id);
    expect(r?.bling.estado).toBe("no-bling");
    expect(r?.bling.contatoId).toBe("7830745032");
    expect(b.estado.pedidos[0].contato).toEqual({ id: 7830745032 });
    expect(b.estado.contatos[0].situacao).toBe("A");
    expect(b.chamadas.some((x) => x.metodo === "POST" && x.url.endsWith("/contatos"))).toBe(false);
  });

  it("se o Bling disser que o CPF já existe, usa o contato dono dele", async () => {
    const b = blingFalso();
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
    // Some da busca na primeira olhada (cadastrado por outro caixa no mesmo instante), aparece depois do erro.
    let escondido = true;
    const original = b.f.getMockImplementation()!;
    b.f.mockImplementation(async (input, init) => {
      const url = String(input);
      if (escondido && url.includes("/contatos?") && (init?.method ?? "GET") === "GET" && url.includes("criterio=2")) {
        escondido = false;
        b.estado.contatos.push({ id: 4242, nome: "Maria", numeroDocumento: "52998224725", situacao: "A" });
      }
      return original(input, init);
    });
    const venda = await registrarVenda(lerEntrada({ ...ENTRADA, cliente: { ...CLIENTE_VAZIO, nome: "Maria", documento: "52998224725" } }), "Balcão");
    const r = await sincronizarVenda(venda.id);
    expect(r?.bling.estado).toBe("no-bling");
    expect(r?.bling.contatoId).toBe("4242");
  });

  it("venda inválida nem é gravada", async () => {
    await expect(registrarVenda(lerEntrada({ ...ENTRADA, pagamentos: [] }), "Balcão")).rejects.toBeInstanceOf(VendaInvalida);
  });

  it("lista do dia junta o PDV com o que foi lançado direto no Bling", async () => {
    const b = blingFalso();
    _trocarRede(b.f as unknown as typeof fetch, async () => undefined);
    await guardarAcesso({ token: TOKEN, expiraEm: new Date(Date.now() + 5 * 3600_000).toISOString(), maquina: "PC" });
    const venda = await registrarVenda(lerEntrada(ENTRADA), "Balcão");
    await sincronizarVenda(venda.id);
    // Um pedido feito no próprio Bling, no mesmo dia.
    b.estado.pedidos.push({ id: 999, numero: 24850, data: venda.dia, totalCalculado: 150, contato: { id: 1 } });
    b.estado.pedidos[0].totalCalculado = 800;
    const resumo = await vendasDoDia(venda.dia);
    expect(resumo.bling.lido).toBe(true);
    expect(resumo.linhas.map((l) => [l.origem, l.numero])).toEqual([
      ["bling", "24850"],
      ["pdv", "24800"],
    ]);
    expect(resumo.linhas[1].vendedor).toBe("JULIA SOUZA");
    expect(resumo.totais).toMatchObject({ vendas: 2, valor: 950 });
  });
});
