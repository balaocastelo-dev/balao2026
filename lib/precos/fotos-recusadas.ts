// ============================================================
// Fotos recusadas: a foto conferida e reprovada não volta.
//
// Auditoria de 12/10/2026 (pedido do Thiago depois do air cooler com foto de
// water cooler 360mm): várias fotos erradas vinham da própria fonte — o
// anúncio do lojista da KaBuM! com a etiqueta de outra placa de vídeo, o
// catálogo do Robson com a foto de outra marca. Apagar a foto no site não
// adiantava: a leitura seguinte da fonte gravava a mesma foto de novo.
//
// Agora a foto reprovada fica registrada aqui (produto + endereço da foto), e
// a gravação das fontes (banco.ts → gravarPagina) e a busca de foto
// (importacao.ts → completarFotos) pulam essa foto. O produto fica com
// "sem foto" até alguém pôr a foto certa.
//
// Desfazer: DELETE /api/precos/fotos-recusadas { id, foto }.
// ============================================================

import { createHash } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";

type Linha = Record<string, unknown>;

export interface FotoRecusada {
  produto_id: string;
  foto: string;
  motivo: string | null;
  nome: string | null;
  recusada_em: string;
}

/** Endereço da foto sem o "#ilustrativa" e sem espaços: é o que se compara. */
export function normalizarFoto(url: unknown): string {
  return String(url ?? "").split("#")[0].trim();
}

const hash = (foto: string) => createHash("sha1").update(normalizarFoto(foto)).digest("hex");

let tabelaPronta: Promise<void> | null = null;

export function garantirTabelaDeFotosRecusadas(): Promise<void> {
  if (!isTursoActive()) return Promise.reject(new Error("Banco de dados não configurado"));
  if (!tabelaPronta) {
    tabelaPronta = turso
      .execute(
        `CREATE TABLE IF NOT EXISTS fotos_recusadas (
          produto_id VARCHAR(64) NOT NULL,
          foto_hash CHAR(40) NOT NULL,
          foto TEXT NOT NULL,
          nome VARCHAR(300) NULL,
          motivo VARCHAR(300) NULL,
          recusada_em VARCHAR(40) NOT NULL,
          PRIMARY KEY (produto_id, foto_hash)
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
 * Fotos recusadas destes produtos: Map<produto, Set<foto normalizada>>.
 * Se a tabela ainda não existe ou o banco falha, devolve vazio (não trava a
 * gravação das fontes por causa disto).
 */
export async function fotosRecusadasDe(ids: string[]): Promise<Map<string, Set<string>>> {
  const saida = new Map<string, Set<string>>();
  const unicos = [...new Set(ids.filter(Boolean))];
  if (unicos.length === 0 || !isTursoActive()) return saida;
  try {
    await garantirTabelaDeFotosRecusadas();
    for (let i = 0; i < unicos.length; i += 500) {
      const lote = unicos.slice(i, i + 500);
      const res = await turso.execute({
        sql: `SELECT produto_id, foto FROM fotos_recusadas WHERE produto_id IN (${lote.map(() => "?").join(", ")})`,
        args: lote,
      });
      for (const r of res.rows as Linha[]) {
        const id = String(r.produto_id);
        if (!saida.has(id)) saida.set(id, new Set());
        saida.get(id)!.add(normalizarFoto(r.foto));
      }
    }
  } catch (erro) {
    console.error("fotos_recusadas: leitura falhou", erro);
  }
  return saida;
}

/** A foto está recusada para este produto? */
export function estaRecusada(recusadas: Map<string, Set<string>>, id: string, foto: unknown): boolean {
  const n = normalizarFoto(foto);
  return !!n && !!recusadas.get(id)?.has(n);
}

/**
 * Tira de um item da fonte as fotos recusadas. Se a principal foi recusada, o
 * item fica sem foto (não promove a segunda foto da galeria sem conferência).
 */
export function semFotosRecusadas<T extends { codigo: string; foto: string; fotos: string[] }>(
  item: T,
  recusadas: Map<string, Set<string>>
): T {
  const lista = recusadas.get(item.codigo);
  if (!lista || lista.size === 0) return item;
  if (estaRecusada(recusadas, item.codigo, item.foto)) return { ...item, foto: "", fotos: [] };
  return { ...item, fotos: item.fotos.filter((f) => !estaRecusada(recusadas, item.codigo, f)) };
}

export interface PedidoDeRecusa {
  id: string;
  /** Foto a recusar; sem ela, recusa a foto que o produto tem agora. */
  foto?: string | null;
  motivo?: string | null;
  /** Foto certa para pôr no lugar (já conferida). Sem ela, o produto fica sem foto. */
  nova?: string | null;
}

export interface ResultadoDaRecusa {
  id: string;
  ok: boolean;
  foto?: string;
  ficou?: string;
  erro?: string;
}

const SEM_FOTO = "/produto-sem-foto.svg";

/**
 * Recusa as fotos e troca a do produto (pela nova, ou por "sem foto").
 * Lê os produtos de uma vez e grava as recusas de uma vez: o banco tem cota
 * de conexões por hora e a auditoria manda centenas de itens.
 */
export async function recusarFotos(pedidos: PedidoDeRecusa[]): Promise<ResultadoDaRecusa[]> {
  await garantirTabelaDeFotosRecusadas();
  const agora = new Date().toISOString();
  const validos = pedidos.map((p) => ({ ...p, id: String(p.id || "").trim() })).filter((p) => p.id);
  if (validos.length === 0) return [];

  const atuais = new Map<string, Linha>();
  const ids = [...new Set(validos.map((p) => p.id))];
  for (let i = 0; i < ids.length; i += 500) {
    const lote = ids.slice(i, i + 500);
    const res = await turso.execute({
      sql: `SELECT id, name, image FROM products WHERE id IN (${lote.map(() => "?").join(", ")})`,
      args: lote,
    });
    for (const r of res.rows as Linha[]) atuais.set(String(r.id), r);
  }

  const saida: ResultadoDaRecusa[] = [];
  const linhas: unknown[][] = [];
  const trocas: { id: string; ficou: string; galeria: string[] }[] = [];
  for (const p of validos) {
    const atual = atuais.get(p.id);
    if (!atual) {
      saida.push({ id: p.id, ok: false, erro: "produto não encontrado" });
      continue;
    }
    const foto = normalizarFoto(p.foto || atual.image);
    if (foto && !foto.includes("produto-sem-foto")) {
      linhas.push([p.id, hash(foto), foto, String(atual.name ?? "").slice(0, 300), p.motivo ? String(p.motivo).slice(0, 300) : null, agora]);
    }
    // Só troca a foto do produto se a recusada é a que está no ar (ou se veio uma nova).
    const noAr = normalizarFoto(atual.image);
    const nova = normalizarFoto(p.nova);
    let ficou = String(atual.image ?? "");
    if (nova) ficou = nova;
    else if (noAr && noAr === foto) ficou = SEM_FOTO;
    // Sem foto nova conferida, a galeria some junto: a segunda foto do mesmo
    // anúncio errado não é garantia de nada.
    if (ficou !== String(atual.image ?? "")) trocas.push({ id: p.id, ficou, galeria: nova ? [nova] : [] });
    saida.push({ id: p.id, ok: true, foto, ficou });
  }

  for (let i = 0; i < linhas.length; i += 200) {
    const lote = linhas.slice(i, i + 200);
    await turso.execute({
      sql: `INSERT INTO fotos_recusadas (produto_id, foto_hash, foto, nome, motivo, recusada_em) VALUES ${lote.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}
            ON DUPLICATE KEY UPDATE motivo = VALUES(motivo), recusada_em = VALUES(recusada_em)`,
      args: lote.flat(),
    });
  }
  for (const t of trocas) {
    await turso.execute({ sql: "UPDATE products SET image = ?, image_urls = ? WHERE id = ?", args: [t.ficou, JSON.stringify(t.galeria), t.id] });
  }
  return saida;
}

export async function listarFotosRecusadas(limite = 1000): Promise<FotoRecusada[]> {
  await garantirTabelaDeFotosRecusadas();
  const res = await turso.execute({
    sql: "SELECT produto_id, foto, motivo, nome, recusada_em FROM fotos_recusadas ORDER BY recusada_em DESC LIMIT ?",
    args: [Math.max(1, Math.min(5000, limite))],
  });
  return (res.rows as Linha[]).map((r) => ({
    produto_id: String(r.produto_id),
    foto: String(r.foto),
    motivo: r.motivo == null ? null : String(r.motivo),
    nome: r.nome == null ? null : String(r.nome),
    recusada_em: String(r.recusada_em),
  }));
}

/** Desfaz a recusa (a foto pode voltar na próxima leitura da fonte). */
export async function desfazerRecusa(id: string, foto: string): Promise<boolean> {
  await garantirTabelaDeFotosRecusadas();
  const res = await turso.execute({
    sql: "DELETE FROM fotos_recusadas WHERE produto_id = ? AND foto_hash = ?",
    args: [id, hash(foto)],
  });
  return res.rowsAffected > 0;
}
