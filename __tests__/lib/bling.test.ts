import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// O que importa testar aqui é o que só quebra em produção: token vencendo no
// meio do expediente, dois processos renovando ao mesmo tempo, e o limite de
// 3 req/s do Bling devolvendo 429.

let linhaToken: Record<string, unknown> | null = null;
const upserts: Record<string, unknown>[] = [];

vi.mock("../../lib/supabase", () => ({
  hasSupabaseAdmin: () => true,
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: linhaToken, error: null }) }),
      }),
      upsert: async (v: Record<string, unknown>) => {
        upserts.push(v);
        return { error: null };
      },
    }),
  },
}));

const ONTEM = new Date(Date.now() - 86_400_000).toISOString();
const DAQUI_A_UMA_HORA = new Date(Date.now() + 3_600_000).toISOString();

describe("Bling — token e ritmo", () => {
  beforeEach(() => {
    vi.resetModules();
    upserts.length = 0;
    process.env.BLING_CLIENT_ID = "id-de-teste";
    process.env.BLING_CLIENT_SECRET = "segredo-de-teste";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("não fala com o Bling sem credencial configurada", async () => {
    process.env.BLING_CLIENT_ID = "";
    const { blingConfigurado, blingPendencias } = await import("../../lib/bling");
    expect(blingConfigurado()).toBe(false);
    expect(blingPendencias().join(" ")).toContain("BLING_CLIENT_ID");
  });

  it("reaproveita o token que ainda vale, sem pedir outro", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);

    const { tokenValido } = await import("../../lib/bling");
    expect(await tokenValido()).toBe("vigente");
    // Pedir token novo a cada chamada gastaria o limite diário à toa.
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("renova quando o token venceu e guarda o refresh_token NOVO", async () => {
    linhaToken = {
      access_token: "velho", refresh_token: "r-antigo",
      expira_em: ONTEM, conectado_em: null, ultimo_erro: null,
    };
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        access_token: "novo", refresh_token: "r-novo", expires_in: 21600,
      }),
    })));

    const { tokenValido } = await import("../../lib/bling");
    expect(await tokenValido()).toBe("novo");

    // Cada refresh do Bling mata o refresh_token anterior. Se o novo não for
    // gravado, a conexão cai sozinha em algumas horas.
    expect(upserts.at(-1)?.refresh_token).toBe("r-novo");
  });

  it("renova uma vez só quando duas chamadas vencem juntas", async () => {
    linhaToken = {
      access_token: "velho", refresh_token: "r-antigo",
      expira_em: ONTEM, conectado_em: null, ultimo_erro: null,
    };
    const fetchFalso = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        access_token: "novo", refresh_token: "r-novo", expires_in: 21600,
      }),
    }));
    vi.stubGlobal("fetch", fetchFalso);

    const { tokenValido } = await import("../../lib/bling");
    const [a, b] = await Promise.all([tokenValido(), tokenValido()]);

    expect(a).toBe("novo");
    expect(b).toBe("novo");
    // Dois refresh simultâneos invalidariam um o token do outro.
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("falha de refresh não lança — devolve null e anota o erro", async () => {
    linhaToken = {
      access_token: null, refresh_token: "r-morto",
      expira_em: ONTEM, conectado_em: null, ultimo_erro: null,
    };
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false, status: 401, text: async () => "invalid_grant",
    })));

    const { tokenValido } = await import("../../lib/bling");
    // Quem chama precisa poder seguir sem ERP; exceção aqui derrubaria o
    // fechamento do dia inteiro por causa de um token vencido.
    expect(await tokenValido()).toBeNull();
    expect(String(upserts.at(-1)?.ultimo_erro)).toContain("401");
  });

  it("chamada sem conexão devolve erro em vez de explodir", async () => {
    linhaToken = null;
    vi.stubGlobal("fetch", vi.fn());
    const { chamarBling } = await import("../../lib/bling");
    const r = await chamarBling("/pedidos/vendas");
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("não conectado");
  });

  it("tenta de novo uma vez no 429 e desiste depois", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    const fetchFalso = vi.fn(async () => ({
      ok: false, status: 429, text: async () => "rate limit",
    }));
    vi.stubGlobal("fetch", fetchFalso);

    const { chamarBling } = await import("../../lib/bling");
    const r = await chamarBling("/pedidos/vendas");

    expect(r.ok).toBe(false);
    expect(r.status).toBe(429);
    // Uma repetição, não um laço: insistir em cima do limite estourado é o
    // que transforma lentidão em bloqueio da conta.
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  }, 15000);

  it("resumo do dia devolve erro em vez de número inventado", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false, status: 500, text: async () => "boom",
    })));

    const { resumoDoDia } = await import("../../lib/bling");
    const r = await resumoDoDia("2026-09-14");
    expect(r.faturamento).toBe(0);
    expect(r.erro).toBeTruthy();
  }, 15000);

  it("soma faturamento, conta clientes e separa por vendedor pelo nome", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    // O vendedor NÃO vem na listagem de pedidos — a quebra sai de uma consulta
    // por vendedor, com `idVendedor`. Por isso a resposta depende da URL.
    const pedidos = [
      { id: 1, total: 100, situacao: { id: 9, valor: 1 }, contato: { id: "c1", nome: "Ana" } },
      { id: 2, total: 300, situacao: { id: 6, valor: 0 }, contato: { id: "c2", nome: "Bruno" } },
      { id: 3, total: 200, situacao: { id: 9, valor: 1 }, contato: { id: "c1", nome: "Ana" } },
      { id: 4, total: 900, situacao: { id: 12, valor: 0 }, contato: { id: "c9", nome: "Zé" } },
    ];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const responder = (dados: unknown) => ({
        ok: true, status: 200, text: async () => JSON.stringify({ data: dados }),
      });
      if (url.includes("/situacoes/modulos/98310")) {
        return responder([{ id: 6, nome: "Em aberto" }, { id: 9, nome: "Atendido" }, { id: 12, nome: "Cancelado" }]);
      }
      if (url.includes("/vendedores")) {
        return responder([
          { id: 10, contato: { id: 1, nome: "BRENDON OLIVEIRA", situacao: "A" } },
          { id: 20, contato: { id: 2, nome: "JULIA SOUZA", situacao: "A" } },
        ]);
      }
      if (url.includes("idVendedor=10")) return responder([pedidos[0], pedidos[1]]);
      if (url.includes("idVendedor=20")) return responder([]);
      return responder(pedidos);
    }));

    const { resumoDoDia } = await import("../../lib/bling");
    const r = await resumoDoDia("2026-09-14");

    // O cancelado de R$ 900 fica de fora: contar pedido cancelado como venda
    // era o erro que inflava o fechamento.
    expect(r.pedidos).toBe(3);
    expect(r.faturamento).toBe(600);
    expect(r.cancelados).toBe(1);
    expect(r.emAberto).toBe(1);
    expect(r.clientes).toBe(2); // Ana comprou duas vezes, é um cliente só
    expect(r.porVendedor[0]).toEqual({
      vendedorId: "10", nome: "BRENDON OLIVEIRA", pedidos: 2, total: 400,
    });
    // O pedido 3 não apareceu em nenhum vendedor — aparece como tal, em vez
    // de sumir da soma.
    expect(r.porVendedor.find((v) => v.vendedorId === null)).toEqual({
      vendedorId: null, nome: "sem vendedor marcado", pedidos: 1, total: 200,
    });
    expect(r.maiores[0]).toEqual({ cliente: "Bruno", total: 300, situacao: "Em aberto" });
  }, 15000);

  it("lê a situação do pedido pelo id, não pelo campo `valor`", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    // Na conta real `situacao` é `{ id: 9, valor: 1 }`: o `valor` é um 0/1
    // legado. Ler o `valor` fazia todo pedido virar "1" ou "0".
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true, status: 200,
      text: async () => JSON.stringify({
        data: url.includes("/situacoes/")
          ? [{ id: 9, nome: "Atendido" }]
          : [{ id: 1, total: 10, situacao: { id: 9, valor: 1 }, contato: {} }],
      }),
    })));

    const { listarPedidos } = await import("../../lib/bling");
    const { pedidos } = await listarPedidos({ dataInicial: "2026-09-14", dataFinal: "2026-09-14" });
    expect(pedidos[0].situacaoId).toBe(9);
    expect(pedidos[0].situacao).toBe("Atendido");
  }, 15000);

  it("manda filtro de lista como `chave[]`, que é a forma que o Bling respeita", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    const urls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      urls.push(url);
      return { ok: true, status: 200, text: async () => JSON.stringify({ data: [] }) };
    }));

    const { listarContasAReceber } = await import("../../lib/bling");
    await listarContasAReceber({
      dataInicial: "2026-09-01", dataFinal: "2026-09-14", situacoes: [1],
    });

    const consulta = urls.find((u) => u.includes("/contas/receber")) || "";
    // `situacoes=1` devolve 200 com o filtro ignorado. Só a forma com
    // colchetes filtra de verdade.
    expect(consulta).toContain("situacoes%5B%5D=1");
    // Sem `tipoFiltroData` as datas são ignoradas e volta a base inteira.
    expect(consulta).toContain("tipoFiltroData=V");
    expect(consulta).toContain("dataInicial=2026-09-01");
  }, 15000);

  it("peneira de novo em memória o que a API deveria ter filtrado", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    // Se o filtro voltar a ser ignorado, o número continua certo em vez de
    // ficar errado calado — que é o modo de falha caro aqui.
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, status: 200,
      text: async () => JSON.stringify({
        data: [
          { id: 1, vencimento: "2026-09-05", valor: 100, situacao: 1, contato: {} },
          { id: 2, vencimento: "2026-09-06", valor: 500, situacao: 2, contato: {} },
          { id: 3, vencimento: "2024-01-01", valor: 900, situacao: 1, contato: {} },
        ],
      }),
    })));

    const { listarContasAReceber } = await import("../../lib/bling");
    const { contas } = await listarContasAReceber({
      dataInicial: "2026-09-01", dataFinal: "2026-09-14", situacoes: [1], maxPaginas: 1,
    });

    expect(contas.map((c) => c.id)).toEqual(["1"]);
    expect(contas[0].emAberto).toBe(true);
    // `saldo` não existe na listagem: null é "não sei", não é zero.
    expect(contas[0].saldo).toBeNull();
  }, 15000);

  it("recusa janela maior que 366 dias em vez de levar 400 do Bling", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);

    const { listarContasAReceber } = await import("../../lib/bling");
    const r = await listarContasAReceber({ dataInicial: "2024-01-01", dataFinal: "2026-09-14" });

    expect(r.erro).toContain("366");
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});

describe("Bling — escrita", () => {
  beforeEach(() => {
    vi.resetModules();
    upserts.length = 0;
    process.env.BLING_CLIENT_ID = "id-de-teste";
    process.env.BLING_CLIENT_SECRET = "segredo-de-teste";
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: new Date(Date.now() + 3_600_000).toISOString(),
      conectado_em: null, ultimo_erro: null,
    };
  });

  afterEach(() => vi.unstubAllGlobals());

  it("recusa pedido sem itens antes de chamar o Bling", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);
    const { criarPedido } = await import("../../lib/bling");
    const r = await criarPedido({ contatoId: "1", itens: [] });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("sem itens");
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("recusa item com valor zero", async () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);
    const { criarPedido } = await import("../../lib/bling");
    // Item a R$ 0,00 entra no ERP como pedido valido e so aparece no
    // fechamento do mes. Mais barato recusar aqui.
    const r = await criarPedido({
      contatoId: "1",
      itens: [{ descricao: "Mouse", quantidade: 1, valor: 0 }],
    });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("valor zero");
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("recusa item sem quantidade", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { criarPedido } = await import("../../lib/bling");
    const r = await criarPedido({
      contatoId: "1",
      itens: [{ descricao: "Teclado", quantidade: 0, valor: 100 }],
    });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("sem quantidade");
  });

  it("recusa contato sem nome", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { criarContato } = await import("../../lib/bling");
    const r = await criarContato({ nome: "   " });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("nome");
  });

  it("pedido válido vai como POST para /pedidos/vendas", async () => {
    // Guarda o que foi enviado em vez de ler mock.calls: a assinatura inferida
    // do mock é uma tupla vazia, e o tsc recusa indexar nela.
    let urlChamada = "";
    let opcoesChamadas: RequestInit = {};
    const fetchFalso = vi.fn(async (url: unknown, opcoes: unknown) => {
      urlChamada = String(url);
      opcoesChamadas = (opcoes || {}) as RequestInit;
      return { ok: true, status: 201, text: async () => JSON.stringify({ data: { id: 99 } }) };
    });
    vi.stubGlobal("fetch", fetchFalso);
    const { criarPedido } = await import("../../lib/bling");
    const r = await criarPedido({
      contatoId: "7",
      itens: [{ descricao: "SSD 1TB", quantidade: 2, valor: 350 }],
    });
    expect(r.ok).toBe(true);
    expect(urlChamada).toContain("/pedidos/vendas");
    expect(opcoesChamadas.method).toBe("POST");
    expect(JSON.parse(String(opcoesChamadas.body)).contato.id).toBe(7);
  }, 15000);
});

describe("Bling — hosts", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.BLING_CLIENT_ID = "id-de-teste";
    process.env.BLING_CLIENT_SECRET = "segredo-de-teste";
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: new Date(Date.now() + 3_600_000).toISOString(),
      conectado_em: null, ultimo_erro: null,
    };
  });
  afterEach(() => vi.unstubAllGlobals());

  it("dados vão para api.bling.com.br, não para o www", async () => {
    // O www devolve 403 dizendo, com todas as letras, para usar o api. Foi o
    // primeiro erro ao conectar a conta real em 14/09.
    let urlChamada = "";
    vi.stubGlobal("fetch", vi.fn(async (url: unknown) => {
      urlChamada = String(url);
      return { ok: true, status: 200, text: async () => JSON.stringify({ data: [] }) };
    }));
    const { chamarBling } = await import("../../lib/bling");
    await chamarBling("/pedidos/vendas");
    expect(urlChamada).toContain("https://api.bling.com.br/Api/v3/pedidos/vendas");
    expect(urlChamada).not.toContain("www.bling.com.br");
  }, 15000);

  it("o OAuth continua no www, que é onde a tela de autorização vive", async () => {
    const m = await import("../../lib/bling");
    expect(m.URL_AUTORIZACAO).toContain("www.bling.com.br");
    expect(m.URL_TOKEN).toContain("www.bling.com.br");
  });
});
