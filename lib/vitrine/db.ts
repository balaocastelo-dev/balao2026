import { supabase } from "@/lib/supabase";
import { hasAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import { VitrinePageRecord, VitrineStatus } from "./types";

type DbRow = any;

function normalizeRow(row: DbRow): VitrinePageRecord {
  const aplicacoesRaw = row?.aplicacoes;
  const aplicacoes =
    Array.isArray(aplicacoesRaw) ? aplicacoesRaw.map((v) => String(v)) : Array.isArray(aplicacoesRaw?.items) ? aplicacoesRaw.items : [];

  const extras = row?.extras && typeof row.extras === "object" ? row.extras : {};
  const images = row?.images && typeof row.images === "object" ? row.images : {};
  const image_prompts = row?.image_prompts && typeof row.image_prompts === "object" ? row.image_prompts : {};

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

function db() {
  return hasAdmin ? supabaseAdmin : supabase;
}

export async function listVitrinePagesAdmin(): Promise<VitrinePageRecord[]> {
  const client = db();
  const { data, error } = await client
    .from("vitrine_pages")
    .select("*")
    .order("data_criacao", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeRow);
}

export async function listVitrinePagesPublic(): Promise<VitrinePageRecord[]> {
  const client = db();
  const { data, error } = await client
    .from("vitrine_pages")
    .select("*")
    .eq("status", "publicada")
    .order("data_publicacao", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeRow);
}

export async function getVitrinePageById(id: string): Promise<VitrinePageRecord | null> {
  const client = db();
  const { data, error } = await client.from("vitrine_pages").select("*").eq("id", id).single();
  if (error) return null;
  return data ? normalizeRow(data) : null;
}

export async function getVitrinePageBySlug(slug: string, includeDraft = false): Promise<VitrinePageRecord | null> {
  const client = db();
  let q = client.from("vitrine_pages").select("*").eq("slug", slug);
  if (!includeDraft) q = q.eq("status", "publicada");
  const { data, error } = await q.single();
  if (error) return null;
  return data ? normalizeRow(data) : null;
}

export async function createVitrinePage(payload: Partial<VitrinePageRecord>): Promise<VitrinePageRecord> {
  const client = db();
  const row = {
    nome_pc: payload.nome_pc,
    slug: payload.slug,
    categoria: payload.categoria,
    descricao_original: payload.descricao_original || "",
    source_url: payload.source_url || null,
    processador: payload.processador || "",
    placa_video: payload.placa_video || "",
    memoria_ram: payload.memoria_ram || "",
    armazenamento: payload.armazenamento || "",
    sistema_operacional: payload.sistema_operacional || "",
    resfriamento: payload.resfriamento || "",
    aplicacoes: payload.aplicacoes || [],
    extras: payload.extras || {},
    images: payload.images || {},
    image_prompts: payload.image_prompts || {},
    status: payload.status || ("rascunho" as VitrineStatus),
    data_publicacao: payload.status === "publicada" ? new Date().toISOString() : null,
  };

  const { data, error } = await client.from("vitrine_pages").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return normalizeRow(data);
}

export async function updateVitrinePage(id: string, payload: Partial<VitrinePageRecord>): Promise<VitrinePageRecord> {
  const client = db();
  const patch: any = {};

  const fields: Array<keyof VitrinePageRecord> = [
    "nome_pc",
    "slug",
    "categoria",
    "descricao_original",
    "source_url",
    "processador",
    "placa_video",
    "memoria_ram",
    "armazenamento",
    "sistema_operacional",
    "resfriamento",
    "aplicacoes",
    "extras",
    "images",
    "image_prompts",
    "status",
  ];

  for (const f of fields) {
    if (payload[f] !== undefined) patch[f] = payload[f];
  }

  if (payload.status === "publicada") {
    patch.data_publicacao = patch.data_publicacao || new Date().toISOString();
  }
  if (payload.status && payload.status !== "publicada") {
    patch.data_publicacao = null;
  }

  const { data, error } = await client.from("vitrine_pages").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return normalizeRow(data);
}

export async function deleteVitrinePage(id: string) {
  const client = db();
  const { error } = await client.from("vitrine_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
