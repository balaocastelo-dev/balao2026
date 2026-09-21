import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { ticketDeServico, urlDoServidorWhatsApp } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";

// Desconecta o WhatsApp da loja e gera QR novo. Só a administração.
export async function POST() {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ ok: false, mensagem: "Só a administração pode reiniciar." }, { status: 401 });
  }
  const ticket = ticketDeServico();
  if (!ticket) return NextResponse.json({ ok: false, mensagem: "PAINEL_PASSWORD não configurada." }, { status: 500 });

  try {
    const res = await fetch(`${urlDoServidorWhatsApp()}/api/crm/reset-session`, {
      method: "POST",
      headers: { authorization: `Bearer ${ticket}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { ok: res.ok && data.ok !== false, mensagem: data.mensagem || data.erro || "Pedido enviado." },
      { status: res.ok ? 200 : 502 }
    );
  } catch (erro) {
    return NextResponse.json(
      { ok: false, mensagem: `Não consegui falar com o servidor do WhatsApp: ${(erro as Error).message}` },
      { status: 502 }
    );
  }
}
