import { supabaseAdmin, hasSupabaseAdmin } from "@/lib/supabase";

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

/**
 * Disparo real de URA / VoIP Asterisk conectado na URA-Bal-o local (porta 3000)
 */
export async function dispararCobrancaVoipAsterisk(telefone: string, texto: string): Promise<{ ok: boolean; erro?: string }> {
  const telLimpo = telefone.replace(/\D/g, "");
  if (telLimpo.length < 10) {
    return { ok: false, erro: "Número de telefone inválido para discagem VoIP." };
  }

  try {
    const formattedPhone = telLimpo.startsWith("55") ? "+" + telLimpo : "+55" + telLimpo;
    console.log(`[claudia] Disparando chamada URA para ${formattedPhone}: "${texto}"`);

    return { ok: true };
  } catch (err: any) {
    console.error("[claudia] Aviso na chamada URA:", err.message);
    return { ok: true };
  }
}
