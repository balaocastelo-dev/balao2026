import { supabase, supabaseAdmin } from "./supabase";

export interface SellerDB {
  id: string;
  name: string;
  slug: string | null;
  senha: string | null;
  ativo: boolean | null;
  cargo: string | null;
  photo?: string | null;
}

export async function getSellersAtivos(): Promise<SellerDB[]> {
  const { data, error } = await supabaseAdmin.from("sellers").select("id, name, slug, senha, ativo, cargo, photo").eq("ativo", true).order("name", { ascending: true });
  if (error) { console.error("getSellersAtivos error", error); return []; }
  return (data as SellerDB[]) || [];
}

export async function getSellerBySlug(slug: string): Promise<SellerDB | null> {
  const alvo = String(slug || "").trim().toLowerCase();
  if (!alvo) return null;
  const { data, error } = await supabaseAdmin.from("sellers").select("id, name, slug, senha, ativo, cargo, photo").eq("slug", alvo).eq("ativo", true).limit(1).maybeSingle();
  if (error) { console.error("getSellerBySlug error", error); return null; }
  return data as SellerDB | null;
}

export async function createSellerDB(input: { name: string; slug: string; senha: string; cargo?: string }): Promise<SellerDB | null> {
  const slug = String(input.slug || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug || !input.name || !input.senha) throw new Error("nome, slug e senha obrigatórios");
  const { data, error } = await supabaseAdmin.from("sellers").insert({ name: input.name.trim(), slug, senha: input.senha.trim(), cargo: input.cargo || "Vendas", ativo: true, hired_at: new Date().toISOString().slice(0,10) }).select("id, name, slug, senha, ativo, cargo").single();
  if (error) throw error;
  return data as SellerDB;
}

export async function updateSellerDB(id: string, updates: Partial<Pick<SellerDB,"name"|"slug"|"senha"|"cargo"|"ativo">>): Promise<SellerDB | null> {
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = String(updates.name).trim();
  if (updates.slug !== undefined) payload.slug = String(updates.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (updates.senha !== undefined) payload.senha = String(updates.senha).trim();
  if (updates.cargo !== undefined) payload.cargo = String(updates.cargo).trim();
  if (updates.ativo !== undefined) payload.ativo = Boolean(updates.ativo);
  if (Object.keys(payload).length === 0) return null;
  const { data, error } = await supabaseAdmin.from("sellers").update(payload).eq("id", id).select("id, name, slug, senha, ativo, cargo").single();
  if (error) throw error;
  return data as SellerDB;
}

export async function deleteSellerDB(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("sellers").delete().eq("id", id);
  if (error) throw error;
}
