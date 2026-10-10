// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Duas portas que estavam abertas na internet e agora pedem a sessão do
// painel DENTRO do próprio código, e não só na tela:
//  - as ações da Arena (lançar venda, apagar vendedor, zerar a temporada);
//  - a lista de pedidos, com os dados pessoais dos clientes.
// Trancar a tela não basta: as duas podem ser chamadas direto.

const estado = { logado: false };
const execute = vi.fn(async () => ({ rows: [], columns: [], rowsAffected: 0, lastInsertRowid: undefined }));
const getOrders = vi.fn(async () => [{ id: "p1", customer_name: "Cliente", customer_email: "c@x.com" }]);
const updateOrderStatus = vi.fn(async () => {});
const deleteOrder = vi.fn(async () => {});

vi.mock("@/lib/painel-auth", () => ({
  isPainelAuthenticated: vi.fn(async () => estado.logado),
}));
vi.mock("@/lib/turso", () => ({
  turso: { execute },
  isTursoActive: () => true,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getOrder: vi.fn(async () => null),
}));
vi.mock("@/lib/mail", () => ({ sendEmail: vi.fn(async () => {}) }));
vi.mock("@/lib/mail-templates", () => ({ getOrderStatusUpdateTemplate: () => "" }));

function formulario(campos: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(campos)) f.set(k, v);
  return f;
}

beforeEach(() => {
  estado.logado = false;
  execute.mockClear();
  getOrders.mockClear();
  updateOrderStatus.mockClear();
  deleteOrder.mockClear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("ações da Arena", () => {
  it("sem sessão do painel, nenhuma ação que altera chega ao banco", async () => {
    const arena = await import("@/app/arena/actions");

    await arena.criarVendedor(formulario({ nome: "Intruso", meta_valor: "10" }));
    await arena.atualizarVendedor("v1", formulario({ nome: "Intruso" }));
    await arena.removerVendedor("v1");
    await arena.adicionarVenda("v1", 9999);
    await arena.removerVenda("venda1");
    await arena.resetarVendas();
    await arena.atualizarConfig(formulario({ titulo: "x", ativo: "true" }));
    await arena.criarEventoMidia(formulario({ evento_tipo: "venda" }));
    await arena.atualizarEventoMidia("e1", formulario({ evento_tipo: "venda" }));
    await arena.removerEventoMidia("e1");

    expect(execute).not.toHaveBeenCalled();
  });

  it("com a sessão do painel, as ações funcionam", async () => {
    estado.logado = true;
    const arena = await import("@/app/arena/actions");

    await arena.criarVendedor(formulario({ nome: "Thiago", meta_valor: "1000" }));
    expect(execute).toHaveBeenCalledTimes(1);

    await arena.resetarVendas();
    expect(execute).toHaveBeenCalledTimes(3);
  });

  it("o telão continua lendo sem login", async () => {
    const arena = await import("@/app/arena/actions");
    await arena.getVendedores();
    await arena.getConfig();
    await arena.getEventosMidia();
    await arena.getVendasRecentes(10);
    expect(execute).toHaveBeenCalledTimes(4);
  });
});

describe("pedidos", () => {
  it("sem sessão, a lista não sai — nem chega a ser lida do banco", async () => {
    const { GET } = await import("@/app/api/orders/route");
    const r = await GET();
    expect(r.status).toBe(401);
    expect(getOrders).not.toHaveBeenCalled();
    expect(JSON.stringify(await r.json())).not.toContain("c@x.com");
  });

  it("com sessão, a lista sai", async () => {
    estado.logado = true;
    const { GET } = await import("@/app/api/orders/route");
    const r = await GET();
    expect(r.status).toBe(200);
    expect(await r.json()).toHaveLength(1);
  });

  it("sem sessão, ninguém muda nem apaga pedido", async () => {
    const { PATCH, DELETE } = await import("@/app/api/orders/[id]/route");
    const { NextRequest } = await import("next/server");
    const props = { params: Promise.resolve({ id: "p1" }) };

    const mudar = await PATCH(
      new NextRequest("https://www.balao.info/api/orders/p1", {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      }),
      props
    );
    const apagar = await DELETE(
      new NextRequest("https://www.balao.info/api/orders/p1", { method: "DELETE" }),
      props
    );

    expect(mudar.status).toBe(401);
    expect(apagar.status).toBe(401);
    expect(updateOrderStatus).not.toHaveBeenCalled();
    expect(deleteOrder).not.toHaveBeenCalled();
  });
});
