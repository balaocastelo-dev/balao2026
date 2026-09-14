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

  it("soma faturamento, conta clientes e agrupa por vendedor", async () => {
    linhaToken = {
      access_token: "vigente", refresh_token: "r1",
      expira_em: DAQUI_A_UMA_HORA, conectado_em: null, ultimo_erro: null,
    };
    const pedidos = [
      { id: 1, total: 100, contato: { id: "c1", nome: "Ana" }, vendedor: { id: "v1" } },
      { id: 2, total: 300, contato: { id: "c2", nome: "Bruno" }, vendedor: { id: "v1" } },
      { id: 3, total: 200, contato: { id: "c1", nome: "Ana" }, vendedor: { id: "v2" } },
    ];
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, status: 200, text: async () => JSON.stringify({ data: pedidos }),
    })));

    const { resumoDoDia } = await import("../../lib/bling");
    const r = await resumoDoDia("2026-09-14");

    expect(r.pedidos).toBe(3);
    expect(r.faturamento).toBe(600);
    expect(r.ticketMedio).toBe(200);
    expect(r.clientes).toBe(2); // Ana comprou duas vezes, é um cliente só
    expect(r.porVendedor[0]).toEqual({ vendedorId: "v1", pedidos: 2, total: 400 });
    expect(r.maiores[0]).toEqual({ cliente: "Bruno", total: 300 });
  }, 15000);
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
