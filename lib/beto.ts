import { supabaseAdmin } from "./supabase";

// ============================================================
// Beto — o prospector digital da Balão.
//
// Estas funções rodam SOMENTE no servidor (rotas de API), sempre com o
// cliente service_role. A tabela public.prospects não tem policy para o
// papel público de propósito: telefone de cliente nunca passa pela chave
// anon, que fica exposta no JavaScript do site.
// ============================================================

export type ProspectStatus =
  | "novo"
  | "fila"
  | "contatado"
  | "respondeu"
  | "convertido"
  | "descartado"
  | "optout";

export interface Prospect {
  id: string;
  whatsapp: string;
  nome: string | null;
  email: string | null;
  empresa: string | null;
  origem: string;
  segmento: "b2b" | "b2c" | null;
  status: ProspectStatus;
  tentativas: number;
  ultimo_contato_em: string | null;
  optout_em: string | null;
  observacoes: string | null;
}

const MAX_TENTATIVAS = 3;

/**
 * Pega os próximos da fila e os marca como "fila" (reservados para envio).
 * Quem pediu opt-out nunca entra, e ninguém entra duas vezes ao mesmo tempo:
 * o update com filtro de status garante que dois chamadores não recebem a
 * mesma linha.
 */
export async function pegarFila(limite = 1): Promise<Prospect[]> {
  const { data, error } = await supabaseAdmin
    .from("prospects")
    .select("*")
    .eq("status", "novo")
    .is("optout_em", null)
    .order("criado_em", { ascending: true })
    .limit(limite);

  if (error || !data?.length) return [];

  const ids = data.map((p) => p.id);
  const { error: errUpdate } = await supabaseAdmin
    .from("prospects")
    .update({ status: "fila" })
    .in("id", ids)
    .eq("status", "novo");

  if (errUpdate) return [];

  // Só devolve os que realmente ficaram reservados.
  const { data: reservados } = await supabaseAdmin
    .from("prospects")
    .select("*")
    .in("id", ids)
    .eq("status", "fila");

  return (reservados || []) as Prospect[];
}

/**
 * Envio falhou: volta para a fila e conta a tentativa. Na terceira falha o
 * lead é descartado — número morto ocupando a fila só atrasa os vivos.
 */
export async function devolverParaFila(whatsapp: string, motivo: string) {
  const { data } = await supabaseAdmin
    .from("prospects")
    .select("tentativas")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  const tentativas = (data?.tentativas || 0) + 1;

  if (tentativas >= MAX_TENTATIVAS) {
    return marcar(whatsapp, "descartado", `falhas repetidas (${motivo})`);
  }

  return supabaseAdmin
    .from("prospects")
    .update({
      status: "novo",
      tentativas,
      observacoes: motivo,
    })
    .eq("whatsapp", whatsapp);
}

/** Marca o estado de um prospect e registra quando foi tocado. */
export async function marcar(
  whatsapp: string,
  status: ProspectStatus,
  observacao?: string
) {
  const update: Record<string, unknown> = { status };
  if (status === "contatado" || status === "respondeu" || status === "convertido") {
    update.ultimo_contato_em = new Date().toISOString();
  }
  if (status === "optout") {
    update.optout_em = new Date().toISOString();
    update.optout_motivo = observacao || "pediu para não ser contatado";
  }
  if (observacao) update.observacoes = observacao;

  return supabaseAdmin.from("prospects").update(update).eq("whatsapp", whatsapp);
}

export interface BetoStats {
  total: number;
  novo: number;
  fila: number;
  contatado: number;
  respondeu: number;
  convertido: number;
  descartado: number;
  optout: number;
  hoje: number;
  semNome: number;
}

export async function estatisticas(): Promise<BetoStats> {
  const { data, error } = await supabaseAdmin
    .from("prospects")
    .select("status, ultimo_contato_em, nome");

  if (error || !data) {
    return {
      total: 0, novo: 0, fila: 0, contatado: 0, respondeu: 0,
      convertido: 0, descartado: 0, optout: 0, hoje: 0, semNome: 0,
    };
  }

  const contagem: Record<string, number> = {};
  let hoje = 0;
  let semNome = 0;
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  for (const p of data) {
    contagem[p.status] = (contagem[p.status] || 0) + 1;
    if (!p.nome) semNome += 1;
    if (p.ultimo_contato_em && new Date(p.ultimo_contato_em) >= inicioDoDia) hoje += 1;
  }

  return {
    total: data.length,
    novo: contagem.novo || 0,
    fila: contagem.fila || 0,
    contatado: contagem.contatado || 0,
    respondeu: contagem.respondeu || 0,
    convertido: contagem.convertido || 0,
    descartado: contagem.descartado || 0,
    optout: contagem.optout || 0,
    hoje,
    semNome,
  };
}

/**
 * Monta a mensagem de primeiro contato com o nome da pessoa.
 * Sem nome não há personalização — e sem personalização a mensagem vira
 * disparo de massa, que é o que o WhatsApp bane.
 */
export function montarMensagem(template: string, nome: string | null): string {
  const base = String(template || "").trim();
  if (!base) return "";
  if (nome && nome.trim()) {
    return base.replace(/\{nome\}/gi, nome.trim().split(" ")[0]);
  }
  return base.replace(/\{nome\}/gi, "").replace(/\s{2,}/g, " ").trim();
}

export const MENSAGEM_PADRAO = [
  "Oi {nome}! Tudo bem? 👋",
  "",
  "Aqui é da *Balão da Informática Castelo*, lá do Cambuí — você já falou com a gente uma vez.",
  "",
  "Passando rapidinho pra perguntar: precisa de algo pra sua máquina? 💻",
  "PC gamer, notebook, upgrade, manutenção… qualquer coisa, é só responder aqui que um vendedor te atende na hora.",
  "",
  "Se não quiser mais receber mensagens, é só responder *sair*.",
].join("\n");

/** Detecta pedido de opt-out numa resposta de cliente. */
export function ehPedidoDeOptout(texto: string): boolean {
  const t = String(texto || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return false;
  const pedidos = [
    "sair", "pare", "para", "não quero", "nao quero", "não me mande", "nao me mande",
    "pare de mandar", "para de mandar", "não me envie", "nao me envie", "tira meu numero",
    "tira meu número", "remove", "nunca mais", "opt-out", "optout", "descadastr",
  ];
  return pedidos.some((p) => t === p || t.includes(p));
}
