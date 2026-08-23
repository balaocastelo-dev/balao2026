import { randomUUID } from "crypto";
import { turso } from "@/lib/turso";
import { VitrinePageRecord, VitrineStatus } from "./types";

type DbRow = any;

function parseJson(value: unknown): any {
  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value ?? null;
}

function normalizeRow(row: DbRow): VitrinePageRecord {
  const aplicacoesRaw = parseJson(row?.aplicacoes);
  const aplicacoes =
    Array.isArray(aplicacoesRaw) ? aplicacoesRaw.map((v) => String(v)) : Array.isArray(aplicacoesRaw?.items) ? aplicacoesRaw.items : [];

  const extras = row?.extras ? (typeof row.extras === "object" && !Array.isArray(row.extras) ? row.extras : {}) : {};
  const images = row?.images ? (typeof row.images === "object" ? row.images : {}) : {};
  const image_prompts = row?.image_prompts ? (typeof row.image_prompts === "object" ? row.image_prompts : {}) : {};

  return {
    id: String(row.id),
    nome_pc: String(row.nome_pc || ""),
    slug: String(row.slug || ""),
    categoria: row.categoria,
    descricao_original: String(row.descricao_original || ""),
    source_url: row.source_url ? String(row.source_url) : undefined,
    processador: String(row.processador || ""),
    placa_video: String(row.placa_video || ""),
    memoria_ram: String(row.memoria_ram || ""),
    armazenamento: String(row.armazenamento || ""),
    sistema_operacional: String(row.sistema_operacional || ""),
    resfriamento: String(row.resfriamento || ""),
    aplicacoes,
    extras,
    images,
    image_prompts,
    status: row.status,
    data_criacao: String(row.data_criacao || row.created_at || ""),
    data_publicacao: row.data_publicacao ? String(row.data_publicacao) : null,
  };
}

const TEXT_FIELDS = [
  "nome_pc", "slug", "categoria", "descricao_original", "source_url",
  "processador", "placa_video", "memoria_ram", "armazenamento",
  "sistema_operacional", "resfriamento", "status",
] as const;

const JSON_FIELDS = ["aplicacoes", "extras", "images", "image_prompts"] as const;

export async function listVitrinePagesAdmin(): Promise<VitrinePageRecord[]> {
  const res = await turso.execute("SELECT * FROM vitrine_pages ORDER BY data_criacao DESC");
  return res.rows.map((r: any) => normalizeRow(r));
}

export async function listVitrinePagesPublic(): Promise<VitrinePageRecord[]> {
  const res = await turso.execute({
    sql: "SELECT * FROM vitrine_pages WHERE status = 'publicada' ORDER BY data_publicacao DESC",
    args: [],
  });
  return res.rows.map((r: any) => normalizeRow(r));
}

export async function getVitrinePageById(id: string): Promise<VitrinePageRecord | null> {
  const res = await turso.execute({ sql: "SELECT * FROM vitrine_pages WHERE id = ? LIMIT 1", args: [id] });
  const row = res.rows[0];
  return row ? normalizeRow(row) : null;
}

export async function getVitrinePageBySlug(slug: string, includeDraft = false): Promise<VitrinePageRecord | null> {
  const sql = includeDraft
    ? "SELECT * FROM vitrine_pages WHERE slug = ? LIMIT 1"
    : "SELECT * FROM vitrine_pages WHERE slug = ? AND status = 'publicada' LIMIT 1";
  const res = await turso.execute({ sql, args: [slug] });
  const row = res.rows[0];
  return row ? normalizeRow(row) : null;
}

export async function createVitrinePage(payload: Partial<VitrinePageRecord>): Promise<VitrinePageRecord> {
  const id = payload.id ?? randomUUID();
  const cols: string[] = ["id"];
  const args: unknown[] = [id];

  for (const f of TEXT_FIELDS) {
    if ((payload as any)[f] !== undefined) {
      cols.push(f);
      args.push((payload as any)[f] ?? null);
    }
  }
  cols.push("descricao_original");
  args.push(payload.descricao_original || "");
  for (const f of JSON_FIELDS) {
    cols.push(f);
    const v = (payload as any)[f];
    args.push(v === undefined ? (f === "aplicacoes" ? "[]" : "{}") : JSON.stringify(v));
  }
  cols.push(
    "processador", "placa_video", "memoria_ram", "armazenamento",
    "sistema_operacional", "resfriamento"
  );
  args.push(
    payload.processador || "", payload.placa_video || "", payload.memoria_ram || "",
    payload.armazenamento || "", payload.sistema_operacional || "", payload.resfriamento || ""
  );
  cols.push("status");
  args.push(payload.status || ("rascunho" as VitrineStatus));
  cols.push("data_publicacao");
  args.push(payload.status === "publicada" ? new Date().toISOString() : null);

  await turso.execute({
    sql: `INSERT INTO vitrine_pages (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
    args: args as any[],
  });

  const created = await getVitrinePageById(id);
  if (!created) throw new Error("Falha ao criar página de vitrine");
  return created;
}

export async function updateVitrinePage(id: string, payload: Partial<VitrinePageRecord>): Promise<VitrinePageRecord> {
  const sets: string[] = [];
  const args: unknown[] = [];

  for (const f of TEXT_FIELDS) {
    if ((payload as any)[f] !== undefined) {
      sets.push(`"${f}" = ?`);
      args.push((payload as any)[f] ?? null);
    }
  }
  for (const f of JSON_FIELDS) {
    if ((payload as any)[f] !== undefined) {
      sets.push(`"${f}" = ?`);
      args.push(JSON.stringify((payload as any)[f]));
    }
  }

  if (payload.status === "publicada") {
    sets.push('"data_publicacao" = COALESCE("data_publicacao", ?)');
    args.push(new Date().toISOString());
  }
  if (payload.status && payload.status !== "publicada") {
    sets.push('"data_publicacao" = NULL');
  }

  if (sets.length > 0) {
    args.push(id);
    await turso.execute({
      sql: `UPDATE vitrine_pages SET ${sets.join(", ")} WHERE id = ?`,
      args: args as any[],
    });
  }

  const updated = await getVitrinePageById(id);
  if (!updated) throw new Error("Página de vitrine não encontrada");
  return updated;
}

export async function deleteVitrinePage(id: string) {
  await turso.execute({ sql: "DELETE FROM vitrine_pages WHERE id = ?", args: [id] });
}
