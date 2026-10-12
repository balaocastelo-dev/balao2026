// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

// Fechamento da assistência → Arena (12/10/2026): cada OS salva conta para o
// técnico escolhido; apagar a OS tira da corrida. O MySQL aqui é de mentira e
// a gaveta da Arena fica em memória.

const tabela = new Map<string, Record<string, unknown>>();
const comandos: string[] = [];
vi.mock("@/lib/turso", () => ({
  turso: {
    execute: vi.fn(async (q: string | { sql: string; args: unknown[] }) => {
      const sql = typeof q === "string" ? q : q.sql;
      const args = typeof q === "string" ? [] : q.args;
      comandos.push(sql.trim().split(/\s+/).slice(0, 3).join(" "));
      if (sql.includes("information_schema")) return { rows: [] };
      if (sql.startsWith("ALTER")) return { rows: [] };
      if (sql.trim().startsWith("INSERT INTO weekly_orders")) {
        const [id, os_number, status, date, labor_income, parts_income, labor_expense, parts_expense, payment_method, tecnico_id] = args;
        tabela.set(String(id), { id, os_number, status, date, labor_income, parts_income, labor_expense, parts_expense, payment_method, tecnico_id });
        return { rows: [] };
      }
      if (sql.startsWith("SELECT * FROM weekly_orders WHERE id")) return { rows: [tabela.get(String(args[0]))].filter(Boolean) };
      if (sql.startsWith("DELETE FROM weekly_orders")) {
        tabela.delete(String(args[0]));
        return { rows: [] };
      }
      throw new Error(`SQL inesperado: ${sql}`);
    }),
  },
  isTursoActive: () => false,
}));
vi.mock("@/lib/arena/whatsapp", () => ({ enviarAviso: vi.fn(), listarGrupos: vi.fn() }));

import { _gavetaDeTeste } from "@/lib/arena/gaveta";
import { lancamentosEntre, salvarPiloto } from "@/lib/arena/dados";
import { estadoDoTelao } from "@/lib/arena/estado";
import { hojeNaLoja } from "@/lib/arena/periodos";
import { POST, DELETE } from "@/app/api/weekly/orders/route";
import { GET as tecnicos } from "@/app/api/weekly/tecnicos/route";

const HOJE = hojeNaLoja();

beforeEach(() => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.ARENA_GAVETA_DIR;
  delete process.env.MYSQL_HOST;
  _gavetaDeTeste();
  tabela.clear();
  comandos.length = 0;
});

describe("Fechamento da assistência na Arena", () => {
  it("lista os técnicos, cria a coluna do técnico, conta a OS para ele e tira quando é apagada", async () => {
    const tec = await salvarPiloto(null, { nome: "Caio Técnico", apelido: "Caio", funcao: "tecnico" });
    await salvarPiloto(null, { nome: "Ana", blingVendedorId: "111" });
    expect(await (await tecnicos()).json()).toEqual([{ id: tec, nome: "Caio" }]);

    const corpo = { id: "os-1", osNumber: "4521", status: "Concluída", date: HOJE, laborIncome: 250, partsIncome: 130, laborExpense: 0, partsExpense: 60, paymentMethod: "PIX", tecnicoId: tec };
    const r = await POST(new Request("http://x/api/weekly/orders", { method: "POST", body: JSON.stringify(corpo) }));
    expect(r.status).toBe(200);
    expect((await r.json()).tecnicoId).toBe(tec);
    expect(comandos).toContain("ALTER TABLE weekly_orders");

    const [l] = await lancamentosEntre(HOJE, HOJE);
    expect(l).toMatchObject({ id: "os:os-1", tipo: "os", pilotoId: tec, valor: 380, numero: "4521" });
    const e = (await estadoDoTelao())!;
    expect(e.semana.linhas.find((x) => x.piloto.id === tec)).toMatchObject({ valor: 380, os: 1 });

    await DELETE(new Request("http://x/api/weekly/orders?id=os-1", { method: "DELETE" }));
    expect(await lancamentosEntre(HOJE, HOJE)).toHaveLength(0);
  });
});
