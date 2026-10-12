import { describe, it, expect, vi } from "vitest";

// Banco de mentira: responde à criação da estrutura, aos bloqueados e ao
// produto atual; guarda o INSERT para conferir o que foi gravado.
const estado = vi.hoisted(() => ({ atual: null as Record<string, unknown> | null, insert: null as { sql: string; args: unknown[] } | null }));

const execute = vi.hoisted(() =>
  vi.fn(async (q: string | { sql: string; args: unknown[] }) => {
    const sql = (typeof q === "string" ? q : q.sql).trim();
    const args = typeof q === "string" ? [] : q.args;
    if (/information_schema\.COLUMNS/i.test(sql) && /'fontes_preco'/.test(sql)) {
      return { rows: ["regra_margem", "pronta_entrega", "fornecedor", "margens_categoria", "marca_dagua"].map((nome) => ({ nome })), rowsAffected: 0 };
    }
    if (/information_schema\.COLUMNS/i.test(sql)) {
      const colunas = ["id", "fonte_id", "origem_codigo", "origem_pix", "origem_cartao", "origem_parcelas", "origem_visto_em", "retido_pix", "retido_cartao", "retido_desde", "preco_anterior", "queda_em"];
      return { rows: colunas.map((nome) => ({ nome })), rowsAffected: 0 };
    }
    if (/information_schema\.STATISTICS/i.test(sql)) return { rows: [{ n: 1 }], rowsAffected: 0 };
    if (/^CREATE TABLE/i.test(sql)) return { rows: [], rowsAffected: 0 };
    if (/FROM produtos_bloqueados/i.test(sql)) return { rows: [], rowsAffected: 0 };
    if (/^SELECT id, fonte_id, price/i.test(sql)) return { rows: estado.atual ? [estado.atual] : [], rowsAffected: 0 };
    if (/^INSERT INTO products/i.test(sql)) {
      estado.insert = { sql, args };
      return { rows: [], rowsAffected: 1 };
    }
    throw new Error("consulta inesperada: " + sql.slice(0, 80));
  })
);

vi.mock("@/lib/turso", () => ({ turso: { execute }, isTursoActive: () => true }));

import { gravarPagina, type Fonte } from "@/lib/precos/banco";
import type { ItemDeOrigem } from "@/lib/precos/kabum";

const FONTE = {
  id: "f1", nome: "SSD", site: "kabum", url: "", caminho: "", so_loja: true, margem: 20, preco_min: null, preco_max: null,
  trilha: null, categoria_destino: null, marca_dagua: null, ativa: true, intervalo_min: 120, ordem: 0,
} as unknown as Fonte;

const item = (pix: number): ItemDeOrigem => ({
  codigo: "kb-1", nome: "SSD Kingston NV3 1TB", marca: "Kingston", categoria: "Hardware/SSD", vendedor: "KaBuM!", marketplace: false,
  openbox: false, preVenda: false, disponivel: true, pix, cartao: pix * 1.1, parcelas: 10, oferta: null, url: "https://www.kabum.com.br/produto/1",
  foto: "", fotos: [], garantia: null,
});

function gravado(campo: string): unknown {
  const colunas = estado.insert!.sql.match(/INSERT INTO products \(([^)]+)\)/)![1].split(",").map((c) => c.trim());
  return estado.insert!.args[colunas.indexOf(campo)];
}

describe("queda de preço na gravação da fonte", () => {
  it("a fonte baixou o preço: grava o preço que estava no site e quando", async () => {
    // No site: R$ 600,00 (origem R$ 500 + 20%). A KaBuM! baixou para R$ 400.
    estado.atual = { id: "kb-1", fonte_id: "f1", price: "600,00", origem_pix: 500, origem_cartao: 550, origem_parcelas: 10, retido_desde: null, preco_anterior: null, queda_em: null };
    await gravarPagina(FONTE, [item(400)], "2026-10-12T09:00:00.000Z");
    expect(gravado("price")).toBe("480,00");
    expect(gravado("preco_anterior")).toBe(600);
    expect(gravado("queda_em")).toBe("2026-10-12T09:00:00.000Z");
    expect(estado.insert!.sql).toContain("preco_anterior = VALUES(preco_anterior)");
  });

  it("queda grande demais fica retida: não vira queda de preço", async () => {
    estado.atual = { id: "kb-1", fonte_id: "f1", price: "600,00", origem_pix: 500, origem_cartao: 550, origem_parcelas: 10, retido_desde: null, preco_anterior: null, queda_em: null };
    await gravarPagina(FONTE, [item(100)], "2026-10-12T09:00:00.000Z");
    expect(gravado("price")).toBe("600,00");
    expect(gravado("preco_anterior")).toBeNull();
  });

  it("produto novo: sem queda", async () => {
    estado.atual = null;
    await gravarPagina(FONTE, [item(400)], "2026-10-12T09:00:00.000Z");
    expect(gravado("preco_anterior")).toBeNull();
    expect(gravado("queda_em")).toBeNull();
  });
});
