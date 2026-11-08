// ============================================================
// "Me avise se baixar" — gravação no banco (MySQL da Hostinger).
// Regras em ./regras.ts. A tabela nasce sozinha na primeira chamada.
//
// Cota de conexões do banco: o agendador só faz UMA consulta por rodada
// quando não há ninguém esperando; com pedidos, mais uma para ler os preços.
// ============================================================

import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";
import { parsePriceToNumber } from "@/lib/utils";
import { MAXIMO_POR_TELEFONE } from "./regras";

let tabelaPronta: Promise<void> | null = null;

function garantirTabela(): Promise<void> {
  if (!tabelaPronta) {
    tabelaPronta = turso
      .execute(`
        CREATE TABLE IF NOT EXISTS avisos_de_preco (
          id VARCHAR(36) PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          produto_nome VARCHAR(500) NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          nome VARCHAR(80) NULL,
          preco_quando_pediu DECIMAL(12,2) NOT NULL,
          origem VARCHAR(80) NULL,
          consentimento_em VARCHAR(40) NOT NULL,
          criado_em VARCHAR(40) NOT NULL,
          situacao VARCHAR(20) NOT NULL DEFAULT 'esperando',
          avisado_em VARCHAR(40) NULL,
          preco_avisado DECIMAL(12,2) NULL,
          erro VARCHAR(300) NULL,
          tentativas INT NOT NULL DEFAULT 0,
          UNIQUE KEY produto_telefone (product_id(191), telefone),
          KEY por_situacao (situacao)
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      .then(() => undefined)
      .catch((e) => {
        tabelaPronta = null;
        throw e;
      });
  }
  return tabelaPronta;
}

export class LimiteDeAvisos extends Error {}

export async function registrarAviso(dados: {
  produtoId: string;
  produtoNome: string;
  telefone: string;
  nome: string | null;
  preco: number;
  origem: string | null;
}): Promise<void> {
  await garantirTabela();
  const agora = new Date().toISOString();

  const contagem = await turso.execute({
    sql: `SELECT
            SUM(CASE WHEN situacao = 'esperando' THEN 1 ELSE 0 END) AS esperando,
            SUM(CASE WHEN product_id = ? THEN 1 ELSE 0 END) AS este
          FROM avisos_de_preco WHERE telefone = ?`,
    args: [dados.produtoId, dados.telefone],
  });
  const linha = (contagem.rows[0] || {}) as Record<string, unknown>;
  if (Number(linha.esperando || 0) >= MAXIMO_POR_TELEFONE && Number(linha.este || 0) === 0) {
    throw new LimiteDeAvisos(`Este WhatsApp já está esperando aviso de ${MAXIMO_POR_TELEFONE} produtos.`);
  }

  // Pedir de novo o mesmo produto só atualiza o preço visto e reabre o pedido.
  await turso.execute({
    sql: `INSERT INTO avisos_de_preco
            (id, product_id, produto_nome, telefone, nome, preco_quando_pediu, origem, consentimento_em, criado_em, situacao)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'esperando')
          ON DUPLICATE KEY UPDATE
            produto_nome = VALUES(produto_nome),
            nome = COALESCE(VALUES(nome), nome),
            preco_quando_pediu = VALUES(preco_quando_pediu),
            origem = VALUES(origem),
            consentimento_em = VALUES(consentimento_em),
            criado_em = VALUES(criado_em),
            situacao = 'esperando',
            avisado_em = NULL,
            preco_avisado = NULL,
            erro = NULL,
            tentativas = 0`,
    args: [
      randomUUID(),
      dados.produtoId.slice(0, 255),
      dados.produtoNome.slice(0, 500),
      dados.telefone,
      dados.nome ? dados.nome.slice(0, 80) : null,
      Math.round(dados.preco * 100) / 100,
      dados.origem ? dados.origem.slice(0, 80) : null,
      agora,
      agora,
    ],
  });
}

export interface AvisoEsperando {
  id: string;
  productId: string;
  produtoNome: string;
  telefone: string;
  nome: string | null;
  precoQuandoPediu: number;
  criadoEm: string;
  tentativas: number;
}

export interface ProdutoAgora {
  id: string;
  name: string;
  preco: number;
  image: string;
  slug: string;
}

/** Pedidos esperando e o preço de agora de cada produto (2 consultas no máximo). */
export async function avisosParaConferir(): Promise<{ avisos: AvisoEsperando[]; produtos: Map<string, ProdutoAgora> }> {
  await garantirTabela();
  const r = await turso.execute(
    `SELECT id, product_id, produto_nome, telefone, nome, preco_quando_pediu, criado_em, tentativas
       FROM avisos_de_preco WHERE situacao = 'esperando' ORDER BY criado_em LIMIT 500`
  );
  const avisos: AvisoEsperando[] = r.rows.map((row) => {
    const l = row as Record<string, unknown>;
    return {
      id: String(l.id),
      productId: String(l.product_id),
      produtoNome: String(l.produto_nome),
      telefone: String(l.telefone),
      nome: l.nome ? String(l.nome) : null,
      precoQuandoPediu: Number(l.preco_quando_pediu),
      criadoEm: String(l.criado_em),
      tentativas: Number(l.tentativas || 0),
    };
  });
  const produtos = new Map<string, ProdutoAgora>();
  if (avisos.length === 0) return { avisos, produtos };

  const ids = [...new Set(avisos.map((a) => a.productId))];
  const p = await turso.execute({
    sql: `SELECT id, name, price, image, slug FROM products WHERE id IN (${ids.map(() => "?").join(", ")})`,
    args: ids,
  });
  for (const row of p.rows) {
    const l = row as Record<string, unknown>;
    produtos.set(String(l.id), {
      id: String(l.id),
      name: String(l.name || ""),
      preco: parsePriceToNumber(l.price),
      image: String(l.image || ""),
      slug: String(l.slug || ""),
    });
  }
  return { avisos, produtos };
}

export async function marcarAvisado(id: string, preco: number): Promise<void> {
  await turso.execute({
    sql: `UPDATE avisos_de_preco SET situacao = 'avisado', avisado_em = ?, preco_avisado = ?, erro = NULL WHERE id = ?`,
    args: [new Date().toISOString(), Math.round(preco * 100) / 100, id],
  });
}

/** Falha no envio: tenta de novo nas próximas rodadas; na 5ª desiste. */
export async function marcarFalha(id: string, erro: string, tentativas: number): Promise<void> {
  await turso.execute({
    sql: `UPDATE avisos_de_preco SET tentativas = ?, erro = ?, situacao = ? WHERE id = ?`,
    args: [tentativas + 1, erro.slice(0, 300), tentativas + 1 >= 5 ? "falhou" : "esperando", id],
  });
}

export async function marcarVencidos(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await turso.execute({
    sql: `UPDATE avisos_de_preco SET situacao = 'vencido' WHERE id IN (${ids.map(() => "?").join(", ")})`,
    args: ids,
  });
}
