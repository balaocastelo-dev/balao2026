import { createClient } from '@supabase/supabase-js';
import { isTursoActive } from './turso';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

const supabaseServiceKey = rawServiceKey || "placeholder_key";

const hasRealSupabaseAdmin = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && rawServiceKey);

export const hasAdmin = Boolean(isTursoActive() || hasRealSupabaseAdmin);

if (!hasAdmin) {
  console.warn("Nenhum admin configurado: Turso inativo e Supabase admin sem service role key.");
}

let supabaseAdminInstance: any;
try {
  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} catch (error) {
  console.error("Supabase admin init failed (using Turso fallback admin):", error);
}

function makeFallbackAdmin() {
  const emptyResult = { data: [], error: { message: "Supabase bloqueado — usando Turso" }, count: 0 };
  const emptySingle = { data: null, error: { message: "Supabase bloqueado — usando Turso" } };
  return {
    from: (tableName: string) => ({
      select: () => ({ ...emptyResult, eq: () => emptyResult, gte: () => emptyResult, lte: () => emptyResult, order: () => emptyResult, range: () => emptyResult, limit: () => emptyResult, ilike: () => emptyResult, or: () => emptyResult, neq: () => emptyResult, in: () => emptyResult, single: () => emptySingle }),
      eq: () => emptyResult,
      gte: () => emptyResult,
      lte: () => emptyResult,
      order: () => emptyResult,
      range: () => emptyResult,
      limit: () => emptyResult,
      ilike: () => emptyResult,
      or: () => emptyResult,
      neq: () => emptyResult,
      in: () => emptyResult,
      insert: () => emptyResult,
      update: () => emptyResult,
      delete: () => emptyResult,
      upsert: () => emptyResult,
    }),
    auth: { admin: { listUsers: async () => ({ users: [] }) } }
  } as any;
}

export const supabaseAdmin = supabaseAdminInstance || makeFallbackAdmin();
