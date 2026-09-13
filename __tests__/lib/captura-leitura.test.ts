import { describe, it, expect, vi, beforeEach } from "vitest";

const execute = vi.fn();
let bancoLigado = true;

vi.mock("../../lib/turso", () => ({
  turso: { execute: (...a: unknown[]) => execute(...a) },
  isTursoActive: () => bancoLigado,
}));

import { listarContatos, resumirContatos } from "../../lib/captura";

describe("leitura dos contatos capturados", () => {
  beforeEach(() => {
    execute.mockReset();
    bancoLigado = true;
  });

  it("limita a consulta mesmo quando pedem um número absurdo", async () => {
    execute.mockResolvedValue({ rows: [] });
    await listarContatos({ limite: 999999 });
    // Sem teto, um GET arrastaria a tabela inteira numa resposta só.
    expect(String(execute.mock.calls[0][0].sql)).toContain("LIMIT 2000");
  });

  it("aceita o limite pedido quando ele é razoável", async () => {
    execute.mockResolvedValue({ rows: [] });
    await listarContatos({ limite: 50 });
    expect(String(execute.mock.calls[0][0].sql)).toContain("LIMIT 50");
  });

  it("filtra por origem e data usando argumentos, não concatenação", async () => {
    execute.mockResolvedValue({ rows: [] });
    await listarContatos({ origem: "livros", desde: "2026-01-01" });
    const chamada = execute.mock.calls[0][0];
    expect(chamada.sql).toContain("origem = ?");
    expect(chamada.sql).toContain("criado_em >= ?");
    // Valor vindo da URL não pode entrar no SQL montado à mão.
    expect(chamada.args).toEqual(["2026-01-01", "livros"]);
    expect(chamada.sql).not.toContain("livros");
  });

  it("sem banco configurado devolve vazio e não consulta nada", async () => {
    // Ambiente sem MYSQL_* (preview, dev de quem clonou agora). A tela dos
    // leads tem que abrir vazia em vez de quebrar.
    bancoLigado = false;
    expect(await listarContatos()).toEqual([]);
    expect(await resumirContatos()).toMatchObject({ total: 0, pessoas: 0 });
    expect(execute).not.toHaveBeenCalled();
  });

  it("resumo separa linhas de pessoas", async () => {
    execute
      .mockResolvedValueOnce({ rows: [{ total: 12, pessoas: 9, primeiro: "2026-01-01", ultimo: "2026-09-13" }] })
      .mockResolvedValueOnce({ rows: [{ origem: "livros", quantidade: 8 }] })
      .mockResolvedValueOnce({ rows: [{ material: "agente-01", quantidade: 5 }] })
      .mockResolvedValueOnce({ rows: [{ mes: "2026-09", quantidade: 4 }] });
    const r = await resumirContatos();
    // A mesma pessoa entra uma vez por material baixado; quem importa para
    // saber com quanta gente dá para falar é o WhatsApp distinto.
    expect(r.total).toBe(12);
    expect(r.pessoas).toBe(9);
    expect(r.porOrigem[0]).toEqual({ origem: "livros", quantidade: 8 });
  });
});
