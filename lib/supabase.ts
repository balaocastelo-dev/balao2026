import { createClient } from "@supabase/supabase-js";

// Cliente Supabase para o site Balão
// Usa anon key para leitura pública (products tem policy SELECT true)
// Para escrita no admin, o service_role é usado via API route com verificaçaão
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cXF2ZXphd29iZ25oZWVzZ3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE0ODMsImV4cCI6MjA4NDc1NzQ4M30.EPAYYj2Ky6wggkAr-Xz8029AO0CcN74Jo0s91tu39vY";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client público (anon) - para leitura do catálogo curado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Client admin (service_role) - para escrita quando disponível, senão usa anon com RLS anon_insert
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : supabase;

export function isSupabaseActive(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const CURATED_ONLY = true; // quando true, site mostra só os 260 curados
