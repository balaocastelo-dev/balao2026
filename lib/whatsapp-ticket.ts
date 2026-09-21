import { createHash, createHmac, timingSafeEqual } from "crypto";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { getVendedorLogado } from "@/lib/vendedor-auth";

// ============================================================
// Ingresso do servidor de WhatsApp.
//
// O servidor da VPS não aceita mais conexão anônima: o painel pede aqui um
// ingresso (só sai para quem já entrou no /crm ou na página do vendedor) e o
// apresenta ao abrir o socket. A VPS confere o ingresso perguntando para a
// rota /api/painel/socket-ticket/verificar — por isso a assinatura só existe
// deste lado, e não há segredo novo para guardar na VPS.
//
// A chave de assinatura deriva da senha do painel (PAINEL_PASSWORD), que já
// está na Vercel. Trocar a senha invalida todos os ingressos, como deve ser.
// ============================================================

export type PapelTicket = "admin" | "vendedor" | "servico";

export interface DadosTicket {
  papel: PapelTicket;
  vendedor?: string | null;
  exp: number; // segundos (epoch)
}

const VALIDADE_PADRAO_S = 12 * 60 * 60;

function chave(): Buffer | null {
  const base = process.env.WHATSAPP_TICKET_SECRET || process.env.PAINEL_PASSWORD || "";
  if (!base) return null;
  return createHash("sha256").update(`balao-ws-ticket:${base}`).digest();
}

function assinar(corpo: string, k: Buffer) {
  return createHmac("sha256", k).update(corpo).digest("base64url");
}

export function emitirTicket(
  dados: Omit<DadosTicket, "exp">,
  validadeS = VALIDADE_PADRAO_S
): { ticket: string; exp: number } | null {
  const k = chave();
  if (!k) return null;
  const exp = Math.floor(Date.now() / 1000) + validadeS;
  const corpo = Buffer.from(JSON.stringify({ ...dados, exp })).toString("base64url");
  return { ticket: `v1.${corpo}.${assinar(corpo, k)}`, exp };
}

export function verificarTicket(ticket: string): DadosTicket | null {
  const k = chave();
  if (!k || typeof ticket !== "string" || ticket.length > 2000) return null;
  const partes = ticket.split(".");
  if (partes.length !== 3 || partes[0] !== "v1") return null;
  const [, corpo, assinatura] = partes;

  const esperado = Buffer.from(assinar(corpo, k));
  const recebido = Buffer.from(assinatura);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null;

  try {
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as DadosTicket;
    if (!dados?.papel || !dados.exp || dados.exp * 1000 < Date.now()) return null;
    return dados;
  } catch {
    return null;
  }
}

/** Ingresso para quem está logado neste navegador (admin ou vendedor). */
export async function ticketDaSessao(): Promise<{ ticket: string; exp: number; papel: PapelTicket } | null> {
  if (await isPainelAuthenticated()) {
    const t = emitirTicket({ papel: "admin" });
    return t ? { ...t, papel: "admin" } : null;
  }
  const vendedor = await getVendedorLogado();
  if (vendedor) {
    const t = emitirTicket({ papel: "vendedor", vendedor: vendedor.slug });
    return t ? { ...t, papel: "vendedor" } : null;
  }
  return null;
}

/** Ingresso curto para o próprio site falar com a VPS (rotas do servidor). */
export function ticketDeServico(): string | null {
  return emitirTicket({ papel: "admin", vendedor: "site" }, 5 * 60)?.ticket ?? null;
}

export function urlDoServidorWhatsApp(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL || "http://localhost:4100").replace(/\/$/, "");
}
