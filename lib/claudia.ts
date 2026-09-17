import { supabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase";
import { pegarFila } from "@/lib/carla";

export interface ClaudiaConfig {
  ativo: boolean;
  tetoDia: number;
  canais: {
    whatsapp: boolean;
    email: boolean;
    ura: boolean;
  };
}

const CONFIG_PADRAO: ClaudiaConfig = {
  ativo: false,
  tetoDia: 10,
  canais: {
    whatsapp: true,
    email: true,
    ura: true,
  },
};

export async function lerConfigClaudia(): Promise<ClaudiaConfig> {
  if (!hasSupabaseAdmin()) return CONFIG_PADRAO;
  const { data } = await supabaseAdmin
    .from("config_agentes")
    .select("valor")
    .eq("chave", "claudia_config")
    .maybeSingle();
  if (!data?.valor) return CONFIG_PADRAO;
  try {
    return { ...CONFIG_PADRAO, ...(typeof data.valor === "string" ? JSON.parse(data.valor) : data.valor) };
  } catch {
    return CONFIG_PADRAO;
  }
}

export async function salvarConfigClaudia(config: ClaudiaConfig) {
  if (!hasSupabaseAdmin()) return;
  await supabaseAdmin.from("config_agentes").upsert({
    chave: "claudia_config",
    valor: config,
    atualizado_em: new Date().toISOString(),
  });
}
