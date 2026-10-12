// ============================================================
// Arena: avisos no WhatsApp (grupo da equipe), pela linha da loja.
//
// Quem manda é o servidor do WhatsApp na VPS (rotas /api/arena/grupos e
// /api/arena/aviso, em whatsapp-server/servidor.js). O site se apresenta com
// o ingresso de serviço de sempre (lib/whatsapp-ticket.ts). Os avisos não
// entram no CRM e só vão para o destino escolhido no painel.
// ============================================================

import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

export interface GrupoDoWhatsApp {
  id: string;
  nome: string;
  participantes: number | null;
}

async function chamarVps(caminho: string, init: RequestInit = {}, timeoutMs = 6000) {
  const ticket = ticketDeServico();
  if (!ticket) throw new Error("Sem PAINEL_PASSWORD na Vercel: o site não consegue falar com a VPS.");
  const r = await fetch(`${urlDoServidorWhatsApp()}${caminho}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ticket}`, ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  }).catch((e) => {
    throw new Error(`Servidor do WhatsApp fora do ar (${(e as Error).message})`);
  });
  if (r.status === 404) {
    throw new Error("O servidor do WhatsApp ainda não tem os avisos da Arena: falta o deploy da VPS (deploy-evo.ps1).");
  }
  const j = (await r.json().catch(() => ({}))) as { ok?: boolean; erro?: string } & Record<string, unknown>;
  if (!r.ok || j.ok === false) throw new Error(j.erro || `Servidor do WhatsApp respondeu ${r.status}`);
  return j;
}

export async function listarGrupos(): Promise<GrupoDoWhatsApp[]> {
  const j = await chamarVps("/api/arena/grupos", { method: "GET" }, 15000);
  return Array.isArray(j.grupos) ? (j.grupos as GrupoDoWhatsApp[]) : [];
}

export async function enviarAviso(destino: string, texto: string): Promise<void> {
  await chamarVps("/api/arena/aviso", { method: "POST", body: JSON.stringify({ destino, texto: texto.slice(0, 1500) }) });
}
