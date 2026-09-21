import { NextResponse } from "next/server";
import { ticketDaSessao } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";

// O painel chama isto antes de abrir o socket do WhatsApp.
export async function GET() {
  const t = await ticketDaSessao();
  if (!t) {
    return NextResponse.json({ ok: false, erro: "Entre no painel primeiro." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...t }, { headers: { "Cache-Control": "no-store" } });
}
