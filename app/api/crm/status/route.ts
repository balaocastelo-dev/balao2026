import { NextResponse } from "next/server";
import { ticketDaSessao, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";

// Estado do WhatsApp para o painel. Só responde para quem está logado — o QR
// Code sai daqui, e quem lê o QR passa a controlar a conta da loja.
export async function GET() {
  const sessao = await ticketDaSessao();
  if (!sessao) return NextResponse.json({ ok: false, erro: "Entre no painel primeiro." }, { status: 401 });

  try {
    const res = await fetch(`${urlDoServidorWhatsApp()}/api/crm/status`, {
      headers: { authorization: `Bearer ${sessao.ticket}` },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.erro || `servidor respondeu ${res.status}`);

    const conectado = Boolean(data.connected);
    const podeVerQr = sessao.papel === "admin" && !conectado;
    return NextResponse.json({
      ok: true,
      motor: data.motor || null,
      estado: conectado ? "ready" : data.status || "qr",
      status: conectado ? "ready" : data.status || "qr",
      qr: podeVerQr ? data.qrCode || null : null,
      qrCode: podeVerQr ? data.qrCode || null : null,
      rawQr: podeVerQr ? data.rawQr || null : null,
      connected: conectado,
      session: conectado,
      phoneNumber: data.phoneNumber || null,
      ultimoErro: data.ultimoErro || null,
      conversas: data.conversas || null,
    });
  } catch (erro) {
    return NextResponse.json({
      ok: false,
      estado: "disconnected",
      status: "disconnected",
      connected: false,
      session: false,
      qr: null,
      qrCode: null,
      mensagem: `Servidor do WhatsApp indisponível: ${(erro as Error).message}`,
    });
  }
}
