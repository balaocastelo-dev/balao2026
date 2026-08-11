import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_invalid_key";

let client;
try {
  client = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error("Supabase initialization error:", error);
  client = {
    from: () => ({
      select: async () => ({ data: [], error: { message: "Client init failed" } }),
      upsert: async () => ({ error: { message: "Client init failed" } })
    })
  } as any;
}

export const supabase = client;
