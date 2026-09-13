import { createClient } from "@supabase/supabase-js";

// Cliente Supabase do site Balão.
// Sem fallback hardcoded: chave em código vira chave pública no primeiro push.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes — o site cai no Turso."
  );
}

// Sem configuração o cliente não pode ser construído (o SDK lança na carga do
// módulo). Usamos um destino inerte: isSupabaseActive() devolve false e o
// lib/db.ts roteia tudo para o Turso, então este cliente nunca é chamado.
const INERTE_URL = "https://indisponivel.supabase.co";
const INERTE_KEY = "sem-configuracao";

// Client público (anon/publishable) — leitura do catálogo, sujeito a RLS.
export const supabase = createClient(
  supabaseUrl || INERTE_URL,
  supabaseAnonKey || INERTE_KEY,
  { auth: { persistSession: false } }
);

// Client de servidor (service_role/secret) — ignora RLS.
// NUNCA importar em componente marcado "use client".
export const supabaseAdmin =
  supabaseServiceKey && supabaseUrl
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    : supabase;

export function hasSupabaseAdmin(): boolean {
  return Boolean(supabaseServiceKey);
}

export function isSupabaseActive(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const CURATED_ONLY = true; // site mostra só os produtos com is_curated
