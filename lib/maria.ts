import { supabaseAdmin, hasSupabaseAdmin } from "./supabase";
import { listarPedidos, chamarBling, estadoBling } from "./bling";

// ============================================================
// Maria (MAR.IA) — Analista de hora em hora
// Relatórios de pedidos de venda, compras/suprimentos, orçamentos
// e perguntas em linguagem natural enviadas ao Telegram do Thiago.
// ============================================================

export interface RelatorioHoraConfig {
  vendas: boolean;
  compras: boolean;
  orcamentos: boolean;
  movimentoSite: boolean;
}

const CONFIG_PADRAO: RelatorioHoraConfig = {
  vendas: true,
  compras: true,
  orcamentos: true,
  movimentoSite: true,
};

/** Lê a configuração de quais relatórios a Maria deve enviar */
export async function lerConfigMaria(): Promise<RelatorioHoraConfig> {
  if (!hasSupabaseAdmin()) return CONFIG_PADRAO;
  const { data } = await supabaseAdmin
    .from("config_agentes")
    .select("valor")
    .eq("chave", "maria_config")
    .maybeSingle();
  if (!data?.valor) return CONFIG_PADRAO;
  try {
    return { ...CONFIG_PADRAO, ...(typeof data.valor === "string" ? JSON.parse(data.valor) : data.valor) };
  } catch {
    return CONFIG_PAD_RAO_EX();
  }
}

function CONFIG_PAD_RAO_EX() {
  return CONFIG_PADRAO;
}

export async function salvarConfigMaria(config: RelatorioHoraConfig) {
  if (!hasSupabaseAdmin()) return;
  await supabaseAdmin.from("config_agentes").upsert({
    chave: "maria_config",
    valor: config,
    atualizado_em: new Date().toISOString(),
  });
}

function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Coleta os dados da última hora (pedidos de venda, orçamentos, compras)
 */
export async function gerarRelatorioUltimaHora(): Promise<{ resumo: string; dados: any }> {
  const agora = new Date();
  const umaHoraAtras = new Date(agora.getTime() - 3600_000).toISOString();
  const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).toISOString();

  let vendasTotal = 0;
  let qtdVendas = 0;
  let qtdOrcamentos = 0;
  let comprasTotal = 0;
  let qtdCompras = 0;
  let errosBling: string[] = [];

  const estado = await estadoBling();
  if (estado.conectado) {
    // 1. Pedidos de Venda
    const resVendas = await listarPedidos({ dataInicial: hojeInicio.slice(0, 10), dataFinal: agora.toISOString().slice(0, 10) });
    if (!resVendas.erro && resVendas.pedidos) {
      qtdVendas = resVendas.pedidos.length;
      vendasTotal = resVendas.pedidos.reduce((acc: number, p: any) => acc + (Number(p.total) || 0), 0);
    } else if (resVendas.erro) {
      errosBling.push("Vendas: " + resVendas.erro);
    }

    // 2. Notas Fiscais de Entrada (Compras) via chamarBling direto
    try {
      const resCompras = await chamarBling(`/notas-fiscais?tipo=0&dataEmissao=${hojeInicio.slice(0, 10)}`);
      if (resCompras.ok && resCompras.dados && (resCompras.dados as any).data) {
        const notas = (resCompras.dados as any).data;
        qtdCompras = notas.length;
        comprasTotal = notas.reduce((acc: number, n: any) => acc + (Number(n.valorNota || n.total) || 0), 0);
      }
    } catch (e: any) {
      errosBling.push("Compras: " + e.message);
    }
  }

  // 3. Orçamentos salvos no banco local da assistência / loja na última hora
  if (hasSupabaseAdmin()) {
    const { count, data: orcs } = await supabaseAdmin
      .from("site_conversion_events")
      .select("*", { count: "exact" })
      .gte("created_at", umaHoraAtras);
    
    if (count !== null) {
      qtdOrcamentos = count;
    } else if (orcs) {
      qtdOrcamentos = orcs.length;
    }
  }

  const horaStr = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const linhas = [
    `📊 *MAR.IA · Relatório da Última Hora (${horaStr})*`,
    ``,
    `🛍️ *Pedidos de Venda*: ${qtdVendas} pedido(s) · ${reais(vendasTotal)}`,
    `📦 *Pedidos de Compra / Entrada*: ${qtdCompras} nota(s) · ${reais(comprasTotal)}`,
    `📋 *Orçamentos / Leads gerados*: ${qtdOrcamentos} na última hora`,
    ``,
    errosBling.length ? `⚠️ _Avisos Bling: ${errosBling.join("; ")}_` : `_Painel atualizado em tempo real._`,
  ];

  return {
    resumo: linhas.join("\n"),
    dados: { hora: horaStr, vendasTotal, qtdVendas, comprasTotal, qtdCompras, qtdOrcamentos }
  };
}

/**
 * Envia mensagem para o Telegram do Thiago (chat 1763993628)
 */
export async function enviarTelegramMaria(texto: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN || "7547051515:AAH43o4a2a1jK8gX2Y";
  const chatId = process.env.TELEGRAM_CHAT_ID || "1763993628";

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: "Markdown"
      }),
      signal: AbortSignal.timeout(10000)
    });
    return res.ok;
  } catch (err) {
    console.error("[maria] erro ao enviar telegram:", err);
    return false;
  }
}

/**
 * Responde a uma pergunta em linguagem natural feita pelo patrão
 */
export async function responderPerguntaMaria(pergunta: string): Promise<string> {
  const p = pergunta.toLowerCase();
  const agora = new Date();
  const horaStr = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const rel = await gerarRelatorioUltimaHora();
  const d = rel.dados;

  if (p.includes("quanto vendeu") || p.includes("vendeu até agora") || p.includes("vendas") || p.includes("faturamento")) {
    return `Patrão, vendemos até agora às ${horaStr} o valor de *${reais(d.vendasTotal)}* (${d.qtdVendas} pedidos registrados). Tudo certinho por aqui! 🎈`;
  }

  if (p.includes("compra") || p.includes("fornecedor") || p.includes("mercadoria")) {
    return `Patrão, até às ${horaStr} registramos *${d.qtdCompras}* nota(s) de compra/entrada totalizando *${reais(d.comprasTotal)}*.`;
  }

  if (p.includes("orçamento") || p.includes("orcamento") || p.includes("lead")) {
    return `Patrão, tivemos *${d.qtdOrcamentos}* novos orçamentos/interesses gerados na última hora.`;
  }

  if (p.includes("resumo") || p.includes("status")) {
    return rel.resumo;
  }

  return `Patrão, às ${horaStr}: temos *${d.qtdVendas}* vendas (*${reais(d.vendasTotal)}*), *${d.qtdCompras}* compras e *${d.qtdOrcamentos}* orçamentos recentes. Quer que eu detalhe algo específico?`;
}
