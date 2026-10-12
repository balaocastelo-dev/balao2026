import { describe, it, expect, vi, beforeEach } from "vitest";

// Banco de mentira: guarda products e produtos_bloqueados em memória e
// responde só às consultas que bloqueio.ts usa.
const banco = vi.hoisted(() => ({
  products: new Map<string, Record<string, unknown>>(),
  bloqueados: new Map<string, Record<string, unknown>>(),
}));

const execute = vi.hoisted(() =>
  vi.fn(async (q: string | { sql: string; args: unknown[] }) => {
    const sql = typeof q === "string" ? q : q.sql;
    const args = typeof q === "string" ? [] : q.args;
    if (/^CREATE TABLE/i.test(sql.trim())) return { rows: [], rowsAffected: 0 };
    if (/FROM products WHERE id = \?/i.test(sql) && /^SELECT/i.test(sql.trim())) {
      const p = banco.products.get(String(args[0]));
      return { rows: p ? [p] : [], rowsAffected: 0 };
    }
    if (/^INSERT INTO produtos_bloqueados/i.test(sql.trim())) {
      const [id, fonte_id, nome, preco, imagem, fornecedor, motivo, bloqueado_em] = args;
      banco.bloqueados.set(String(id), { id, fonte_id, nome, preco, imagem, fornecedor, motivo, bloqueado_em });
      return { rows: [], rowsAffected: 1 };
    }
    if (/^SELECT id FROM produtos_bloqueados WHERE id IN/i.test(sql.trim())) {
      return { rows: args.filter((a) => banco.bloqueados.has(String(a))).map((id) => ({ id })), rowsAffected: 0 };
    }
    if (/^SELECT \* FROM produtos_bloqueados/i.test(sql.trim())) {
      return { rows: [...banco.bloqueados.values()], rowsAffected: 0 };
    }
    if (/^DELETE FROM produtos_bloqueados/i.test(sql.trim())) {
      const tinha = banco.bloqueados.delete(String(args[0]));
      return { rows: [], rowsAffected: tinha ? 1 : 0 };
    }
    if (/^DELETE FROM products WHERE id = \?/i.test(sql.trim())) {
      const tinha = banco.products.delete(String(args[0]));
      return { rows: [], rowsAffected: tinha ? 1 : 0 };
    }
    throw new Error("consulta inesperada: " + sql);
  })
);

vi.mock("@/lib/turso", () => ({ turso: { execute }, isTursoActive: () => true }));

import { bloquearAntesDeApagar, codigosBloqueados, desbloquear, listarBloqueados } from "@/lib/precos/bloqueio";
import { marcaDeOutroProduto, semelhancaIlustrativa } from "@/lib/precos/fotos";

const BATERIA = {
  id: "ts-1724240931516-X5mQX", name: "Bateria Toply 27A 12V", price: "3,75", image: "https://x/weg.jpg",
  supplier: "TechSupri", fonte_id: "fonte-techsupri", origem_codigo: "1724240931516-X5mQX",
};

beforeEach(() => {
  banco.products.clear();
  banco.bloqueados.clear();
  execute.mockClear();
});

describe("excluir = bloquear na entrada", () => {
  it("produto que veio de fonte fica bloqueado ao ser excluído", async () => {
    banco.products.set(BATERIA.id, BATERIA);
    expect(await bloquearAntesDeApagar(BATERIA.id, "foto errada")).toBe(true);
    const lista = await listarBloqueados();
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ id: BATERIA.id, nome: "Bateria Toply 27A 12V", motivo: "foto errada", fonte_id: "fonte-techsupri" });
  });

  it("produto cadastrado à mão (sem fonte) é só apagado, sem bloqueio", async () => {
    banco.products.set("manual-1", { id: "manual-1", name: "Serviço de formatação", fonte_id: null, origem_codigo: null });
    expect(await bloquearAntesDeApagar("manual-1")).toBe(false);
    expect(banco.bloqueados.size).toBe(0);
  });

  it("a fonte não traz de volta o bloqueado; desbloquear libera", async () => {
    banco.products.set(BATERIA.id, BATERIA);
    await bloquearAntesDeApagar(BATERIA.id);
    const codigos = [BATERIA.id, "ts-outro"];
    expect([...(await codigosBloqueados(codigos))]).toEqual([BATERIA.id]);
    expect(await desbloquear(BATERIA.id)).toBe(true);
    expect((await codigosBloqueados(codigos)).size).toBe(0);
    expect(await desbloquear(BATERIA.id)).toBe(false);
  });

  it("lista vazia não consulta o banco", async () => {
    expect((await codigosBloqueados([])).size).toBe(0);
    expect(execute).not.toHaveBeenCalled();
  });

  it("deleteProduct bloqueia e depois apaga", async () => {
    banco.products.set(BATERIA.id, BATERIA);
    const { deleteProduct } = await import("@/lib/db");
    expect(await deleteProduct(BATERIA.id, "Excluído no painel")).toEqual({ bloqueado: true });
    expect(banco.products.has(BATERIA.id)).toBe(false);
    expect(banco.bloqueados.has(BATERIA.id)).toBe(true);
  });

  it("se o bloqueio falhar, o produto NÃO é apagado (para não voltar sozinho)", async () => {
    banco.products.set(BATERIA.id, BATERIA);
    execute.mockImplementationOnce(async () => ({ rows: [BATERIA], rowsAffected: 0 })); // SELECT do produto
    execute.mockImplementationOnce(async () => { throw new Error("cota do banco"); }); // INSERT do bloqueio
    const { deleteProduct } = await import("@/lib/db");
    await expect(deleteProduct(BATERIA.id)).rejects.toThrow();
    expect(banco.products.has(BATERIA.id)).toBe(true);
  });
});

describe("foto ilustrativa de outro produto", () => {
  it("marca de outro fabricante no anúncio da foto: recusa", () => {
    expect(marcaDeOutroProduto("Bateria Toply 27A 12V", "Bateria WEG Selada - VRLA 12V/7AH")).toBe(true);
    expect(marcaDeOutroProduto("Mouse Gamer Aula F806 2400 Dpi", "Mouse Logitech Mx Master 3s")).toBe(true);
    expect(marcaDeOutroProduto("Carregador 20W turbo Tomate", "Carregador USB-C Apple 20w")).toBe(true);
    expect(semelhancaIlustrativa("Bateria Toply 27A 12V", "Bateria WEG Selada - VRLA 12V/7AH")).toBe(0);
  });

  it("mesma marca, ou marca dita pela linha do produto: aceita", () => {
    expect(marcaDeOutroProduto("Pen Drive Kingston 64GB", "Pen Drive Kingston DataTraveler 64GB")).toBe(false);
    expect(marcaDeOutroProduto("Console PlayStation 5 Slim 825GB", "Console Sony PlayStation 5 Slim")).toBe(false);
    expect(marcaDeOutroProduto("Relógio Mi Band 9 Mystic Rose", "Smartwatch Xiaomi Smart Band 9")).toBe(false);
    expect(marcaDeOutroProduto("Cabo HDMI 2m", "Cabo HDMI 2.0 2 metros")).toBe(false);
  });
});
