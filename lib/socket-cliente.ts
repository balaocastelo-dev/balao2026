"use client";

import { io, type Socket } from "socket.io-client";

// ============================================================
// Abertura do socket do WhatsApp pelo navegador, num lugar só.
//
// Três telas conectam no mesmo servidor (o CRM, o painel de números e a
// página do vendedor). Antes cada uma chamava `io(url)` por conta própria —
// e foi por isso que a autenticação nunca entrou em nenhuma: não havia um
// lugar onde colocá-la.
// ============================================================

let bilheteEmCache: { token: string; expira: number } | null = null;

/**
 * Pega o bilhete no site. O cookie de sessão (painel ou vendedor) vai junto
 * porque a chamada é mesma-origem.
 *
 * Guarda em memória enquanto valer: o socket reconecta sozinho várias vezes
 * numa jornada, e buscar bilhete a cada reconexão seria pedir para falhar
 * justamente quando a rede está ruim.
 */
export async function pegarBilhete(): Promise<string | null> {
  if (bilheteEmCache && bilheteEmCache.expira - 60_000 > Date.now()) {
    return bilheteEmCache.token;
  }
  try {
    const r = await fetch("/api/painel/socket-token", { cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d?.token) return null;
    bilheteEmCache = { token: d.token, expira: Number(d.expira) || 0 };
    return d.token;
  } catch {
    return null;
  }
}

export interface ConexaoSocket {
  socket: Socket;
  /** null quando o site não entregou bilhete — a VPS vai recusar, e a tela
   *  precisa poder dizer por quê em vez de ficar girando para sempre. */
  autorizado: boolean;
}

export async function conectarPainel(
  url: string,
  opcoes: Partial<Parameters<typeof io>[1]> = {}
): Promise<ConexaoSocket> {
  const token = await pegarBilhete();
  const socket = io(url, {
    transports: ["websocket", "polling"],
    ...opcoes,
    auth: { token: token || "" },
  });
  return { socket, autorizado: Boolean(token) };
}
