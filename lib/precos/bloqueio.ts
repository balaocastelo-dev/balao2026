// ============================================================
// Produtos bloqueados: excluir no painel = bloquear na entrada.
//
// Pedido do Thiago em 11/10: produto que veio de uma fonte (KaBuM!, TechSupri,
// Robson…) e foi excluído no painel voltava na atualização seguinte, porque a
// fonte continuava trazendo. Agora a exclusão grava o código do produto aqui,
// e a gravação das fontes (banco.ts → gravarPagina) pula os bloqueados.
//
// Não é permanente: "Desbloquear" (Preços por fonte > Produtos bloqueados)
// tira o código daqui, e o produto volta na próxima leitura da fonte.
// Produto cadastrado à mão (sem fonte) é só apagado, como sempre.
// ============================================================

import { turso, isTursoActive } from "@/lib/turso";

type Linha = Record<string, unknown>;

export interface ProdutoBloqueado {
  id: string;
  fonte_id: string | null;
  nome: string;
  preco: string | null;
  imagem: string | null;
  fornecedor: string | null;
  motivo: string | null;
  bloqueado_em: string;
}

let tabelaPronta: Promise<void> | null = null;

export function garantirTabelaDeBloqueio(): Promise<void> {
  if (!isTursoActive()) return Promise.reject(new Error("Banco de dados não configurado"));
  if (!tabelaPronta) {
    tabelaPronta = turso
      .execute(
        `CREATE TABLE IF NOT EXISTS produtos_bloqueados (
          id VARCHAR(64) PRIMARY KEY,
          fonte_id VARCHAR(64) NULL,
          nome VARCHAR(300) NOT NULL DEFAULT '',
          preco VARCHAR(40) NULL,
          imagem TEXT NULL,
          fornecedor VARCHAR(120) NULL,
          motivo VARCHAR(300) NULL,
          bloqueado_em VARCHAR(40) NOT NULL
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      )
      .then(() => undefined)
      .catch((erro) => {
        tabelaPronta = null;
        throw erro;
      });
  }
  return tabelaPronta;
}

/**
 * Antes de apagar um produto: se ele veio de uma fonte, grava o bloqueio
 * (com nome, preço e foto, para o painel mostrar). Devolve true se bloqueou.
 * Se o bloqueio falhar, lança erro — melhor não apagar do que apagar e o
 * produto voltar sozinho.
 */
export async function bloquearAntesDeApagar(id: string, motivo = "Excluído no painel"): Promise<boolean> {
  const res = await turso.execute({
    sql: "SELECT id, name, price, image, supplier, fonte_id, origem_codigo FROM products WHERE id = ? LIMIT 1",
    args: [id],
  });
  const p = res.rows[0] as Linha | undefined;
  if (!p || (!p.fonte_id && !p.origem_codigo)) return false;
  await garantirTabelaDeBloqueio();
  await turso.execute({
    sql: `INSERT INTO produtos_bloqueados (id, fonte_id, nome, preco, imagem, fornecedor, motivo, bloqueado_em)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), bloqueado_em = VALUES(bloqueado_em)`,
    args: [
      String(p.id),
      p.fonte_id ? String(p.fonte_id) : null,
      String(p.name ?? "").slice(0, 300),
      p.price == null ? null : String(p.price).slice(0, 40),
      p.image == null ? null : String(p.image),
      p.supplier == null ? null : String(p.supplier).slice(0, 120),
      String(motivo || "").slice(0, 300) || null,
      new Date().toISOString(),
    ],
  });
  return true;
}

/** Quais destes códigos estão bloqueados. */
export async function codigosBloqueados(codigos: string[]): Promise<Set<string>> {
  if (codigos.length === 0) return new Set();
  await garantirTabelaDeBloqueio();
  const saida = new Set<string>();
  for (let i = 0; i < codigos.length; i += 500) {
    const lote = codigos.slice(i, i + 500);
    const res = await turso.execute({
      sql: `SELECT id FROM produtos_bloqueados WHERE id IN (${lote.map(() => "?").join(", ")})`,
      args: lote,
    });
    for (const r of res.rows) saida.add(String((r as Linha).id));
  }
  return saida;
}

export async function listarBloqueados(): Promise<ProdutoBloqueado[]> {
  await garantirTabelaDeBloqueio();
  const res = await turso.execute("SELECT * FROM produtos_bloqueados ORDER BY bloqueado_em DESC LIMIT 2000");
  return res.rows.map((r) => {
    const l = r as Linha;
    const txt = (v: unknown) => (v === null || v === undefined || v === "" ? null : String(v));
    return {
      id: String(l.id),
      fonte_id: txt(l.fonte_id),
      nome: String(l.nome ?? ""),
      preco: txt(l.preco),
      imagem: txt(l.imagem),
      fornecedor: txt(l.fornecedor),
      motivo: txt(l.motivo),
      bloqueado_em: String(l.bloqueado_em ?? ""),
    };
  });
}

/** Tira o bloqueio: o produto volta na próxima leitura da fonte. */
export async function desbloquear(id: string): Promise<boolean> {
  await garantirTabelaDeBloqueio();
  const res = await turso.execute({ sql: "DELETE FROM produtos_bloqueados WHERE id = ?", args: [id] });
  return res.rowsAffected > 0;
}
