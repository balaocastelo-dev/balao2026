import { supabaseAdmin } from "./supabase";
import { chamarBling, estadoBling, listarContasAReceber, SITUACAO_CONTA } from "./bling";

// ============================================================
// CLAUD.IA — cobradora & reativação da Balão.
//
// Duas fontes:
//  1. COBRANÇA: pedidos do site com payment_status pendente e WhatsApp.
//  2. REATIVAÇÃO: prospects que o VITOR.IA contatou há 3+ dias e não
//     responderam — a CLAUD.IA faz o segundo contato com uma oferta real.
//
// Tudo roda no servidor com service_role; a tabela carla_contatos não
// tem policy para o papel público (telefone de cliente não vaza).
// ============================================================

export interface PedidoPendente {
  id: string;
  whatsapp: string;
  nome: string | null;
  total: number;
  criado_em: string | null;
}

export interface ProspectParaReativar {
  whatsapp: string;
  nome: string | null;
  ultimo_contato_em: string | null;
}

const DIAS_REATIVACAO = Number(process.env.CARLA_DIAS_REATIVACAO) || 3;

/** Pedidos com pagamento pendente, com WhatsApp, que a CLAUD.IA ainda não cobrou. */
export async function pegarPendencias(limite = 5): Promise<PedidoPendente[]> {
  const { data: cobrados } = await supabaseAdmin
    .from("carla_contatos")
    .select("whatsapp")
    .eq("tipo", "cobranca");

  const jaCobrados = new Set((cobrados || []).map((c) => c.whatsapp));

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_whatsapp, total, created_at")
    .eq("payment_status", "pending")
    .not("customer_whatsapp", "is", null)
    .order("created_at", { ascending: true })
    .limit(limite * 3);

  if (error || !data) return [];

  return data
    .map((o) => ({
      id: String(o.id),
      whatsapp: String(o.customer_whatsapp || "").replace(/\D/g, ""),
      nome: o.customer_name ? String(o.customer_name) : null,
      total: Number(o.total) || 0,
      criado_em: o.created_at ? String(o.created_at) : null,
    }))
    .filter((o) => o.whatsapp && !jaCobrados.has(o.whatsapp))
    .slice(0, limite);
}

/** Prospects da VITOR.IA sem resposta há 3+ dias — segundo contato da CLAUD.IA. */
export async function pegarReativacao(limite = 5): Promise<ProspectParaReativar[]> {
  const { data: jaFeitos } = await supabaseAdmin
    .from("carla_contatos")
    .select("whatsapp")
    .eq("tipo", "reativacao");
  const feitos = new Set((jaFeitos || []).map((c) => c.whatsapp));

  const corte = new Date(Date.now() - DIAS_REATIVACAO * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("prospects")
    .select("whatsapp, nome, ultimo_contato_em")
    .eq("status", "contatado")
    .lt("ultimo_contato_em", corte)
    .is("optout_em", null)
    .not("nome", "is", null)
    .order("ultimo_contato_em", { ascending: true })
    .limit(limite * 3);

  if (error || !data) return [];

  return data
    .map((p) => ({
      whatsapp: String(p.whatsapp || "").replace(/\D/g, ""),
      nome: p.nome ? String(p.nome) : null,
      ultimo_contato_em: p.ultimo_contato_em ? String(p.ultimo_contato_em) : null,
    }))
    .filter((p) => p.whatsapp && !feitos.has(p.whatsapp))
    .slice(0, limite);
}

/* ---------------------------------------------------------------- *
 * Cobrança pelo Bling
 *
 * A tabela `orders` do site tem 9 linhas, a mais recente de julho. A venda da
 * loja acontece no balcão e é lançada no Bling — é lá que está o dinheiro a
 * receber. Enquanto o Bling não estiver conectado, a CLAUD.IA segue com os
 * pedidos do site; quando estiver, o Bling passa a ser a fonte principal e o
 * site vira o complemento.
 * ---------------------------------------------------------------- */

/** Telefone de um contato do Bling. Uma chamada por cobrança — a fila da
 *  CLAUD.IA é de 5 por vez, então cabe folgado no limite de 3 req/s. */
async function telefoneDoContato(contatoId: string): Promise<string> {
  const r = await chamarBling<Record<string, unknown>>(`/contatos/${contatoId}`);
  if (!r.ok || !r.dados) return "";
  const c = r.dados as Record<string, unknown>;
  const celular = String(c.celular ?? "").replace(/\D/g, "");
  const telefone = String(c.telefone ?? "").replace(/\D/g, "");
  // Celular primeiro: fixo não recebe WhatsApp, e insistir em fixo é a CLAUD.IA
  // gastando o dia com número que nunca vai responder.
  const escolhido = celular.length >= 10 ? celular : telefone;
  return escolhido.length >= 10 ? escolhido : "";
}

/**
 * Contas a receber vencidas, com telefone, que a CLAUD.IA ainda não cobrou.
 *
 * Só o que JÁ venceu: cobrar antes do vencimento não é cobrança, é chateação
 * — e é o tipo de mensagem que faz um cliente bom bloquear o número da loja.
 */
export async function pegarCobrancasDoBling(limite = 5): Promise<PedidoPendente[]> {
  const estado = await estadoBling();
  if (!estado.conectado) return [];

  const hoje = new Date().toISOString().slice(0, 10);
  const noventaDias = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);

  // `situacoes: [emAberto]` é o que impede a CLAUD.IA de cobrar quem já pagou.
  // Antes daqui o filtro não existia e o "saldo" era o próprio valor da conta,
  // então conta recebida entrava na fila igual a conta vencida.
  const { contas, erro } = await listarContasAReceber({
    dataInicial: noventaDias,
    dataFinal: hoje,
    situacoes: [SITUACAO_CONTA.emAberto],
    maxPaginas: 5,
  });
  if (erro || !contas.length) return [];

  const { data: cobrados } = await supabaseAdmin
    .from("carla_contatos")
    .select("whatsapp")
    .eq("tipo", "cobranca");
  const jaCobrados = new Set((cobrados || []).map((c) => c.whatsapp));

  // `saldo` só existe no detalhe da conta; na listagem vem nulo. O valor
  // cobrado é o da conta em aberto — e conta em aberto no Bling é conta com
  // saldo cheio (conferido: situação 1 => saldo = valor, situação 2 => 0).
  const emAberto = contas
    .filter((c) => c.emAberto && c.valor > 0 && c.clienteId)
    .sort((a, b) => (a.vencimento || "").localeCompare(b.vencimento || ""));

  const fila: PedidoPendente[] = [];
  for (const conta of emAberto) {
    if (fila.length >= limite) break;
    const whatsapp = await telefoneDoContato(conta.clienteId as string);
    if (!whatsapp || jaCobrados.has(whatsapp)) continue;
    fila.push({
      id: `bling:${conta.id}`,
      whatsapp,
      nome: conta.clienteNome,
      total: conta.valor,
      criado_em: conta.vencimento,
    });
  }
  return fila;
}

/** Fila da CLAUD.IA: cobrança primeiro (dinheiro parado), reativação depois. */
export async function pegarFila(limiteCobranca = 5, limiteReativacao = 5) {
  // Bling primeiro: é onde está a venda de verdade. O site entra só para
  // completar a fila — e sozinho, enquanto o ERP não estiver conectado.
  const [doBling, reativacao] = await Promise.all([
    pegarCobrancasDoBling(limiteCobranca),
    pegarReativacao(limiteReativacao),
  ]);

  let cobranca = doBling;
  if (cobranca.length < limiteCobranca) {
    const doSite = await pegarPendencias(limiteCobranca - cobranca.length);
    const jaNaFila = new Set(cobranca.map((c) => c.whatsapp));
    cobranca = [...cobranca, ...doSite.filter((c) => !jaNaFila.has(c.whatsapp))];
  }

  return {
    cobranca,
    reativacao,
    fonte: doBling.length ? "bling" : "site",
  };
}

export async function registrar(
  whatsapp: string,
  tipo: "cobranca" | "reativacao",
  status: "enviado" | "respondeu" | "optout" | "descartado",
  mensagem?: string
) {
  return supabaseAdmin.from("carla_contatos").upsert(
    { whatsapp, tipo, status, mensagem: mensagem || null },
    { onConflict: "whatsapp" }
  );
}

export async function estatisticas() {
  const { data, error } = await supabaseAdmin
    .from("carla_contatos")
    .select("tipo, status");

  const contagem: Record<string, number> = {};
  if (data) {
    for (const c of data) {
      contagem[`${c.tipo}:${c.status}`] = (contagem[`${c.tipo}:${c.status}`] || 0) + 1;
    }
  }
  const { data: pendencias } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("payment_status", "pending")
    .not("customer_whatsapp", "is", null);

  return {
    contatos: data?.length || 0,
    enviadasCobranca: contagem["cobranca:enviado"] || 0,
    enviadasReativacao: contagem["reativacao:enviado"] || 0,
    responderam: (contagem["cobranca:respondeu"] || 0) + (contagem["reativacao:respondeu"] || 0),
    optouts: (contagem["cobranca:optout"] || 0) + (contagem["reativacao:optout"] || 0),
    pendenciasRestantes: pendencias?.length || 0,
    erro: Boolean(error),
  };
}

export const MENSAGEM_COBRANCA = [
  "Oi {nome}! Tudo bem?",
  "",
  "Aqui é a *CLAUD.IA*, assistente digital da *Balão da Informática Castelo* 🙂",
  "Passando só pra lembrar: seu pedido ({valor}) está com o pagamento pendente.",
  "Se tiver qualquer dúvida ou dificuldade, me conta aqui que a gente resolve com você. 🙏",
  "",
  "Não quer mais receber mensagens? É só responder *sair*.",
].join("\n");

export const MENSAGEM_REATIVACAO = [
  "Oi {nome}! 👋",
  "",
  "Aqui é a *CLAUD.IA*, assistente digital da *Balão da Informática Castelo*.",
  "Faz um tempinho que a gente não se fala — passa aqui no Cambuí ou me chama se precisar de algo pra sua máquina!",
  "Esta semana temos ofertas novas em *PC gamer, notebooks e upgrades*. 💻",
  "",
  "Não quer mais receber mensagens? É só responder *sair*.",
].join("\n");

export function montarMensagem(template: string, nome: string | null, extra?: Record<string, string>) {
  let base = String(template || "").trim();
  if (nome && nome.trim()) {
    base = base.replace(/\{nome\}/gi, nome.trim().split(" ")[0]);
  } else {
    base = base.replace(/\{nome\}/gi, "").replace(/\s{2,}/g, " ").trim();
  }
  if (extra) {
    for (const [chave, valor] of Object.entries(extra)) {
      base = base.replace(new RegExp(`\\{${chave}\\}`, "gi"), valor);
    }
  }
  return base;
}

export function ehPedidoDeOptout(texto: string): boolean {
  const t = String(texto || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!t) return false;
  const pedidos = [
    "sair", "pare", "para", "não quero", "nao quero", "não me mande", "nao me mande",
    "pare de mandar", "para de mandar", "não me envie", "nao me envie", "tira meu numero",
    "tira meu número", "remove", "nunca mais", "opt-out", "optout", "descadastr",
  ];
  return pedidos.some((p) => t === p || t.includes(p));
}
