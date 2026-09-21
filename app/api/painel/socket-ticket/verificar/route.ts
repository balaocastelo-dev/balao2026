import { NextResponse } from "next/server";
import { verificarTicket } from "@/lib/whatsapp-ticket";

export const dynamic = "force-dynamic";

// Chamado pela VPS do WhatsApp para saber se um ingresso vale. Só confirma a
// assinatura e diz o papel — não abre nada por si só.
export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null);
  const dados = verificarTicket(String(corpo?.ticket || ""));
  if (!dados) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, papel: dados.papel, vendedor: dados.vendedor ?? null, exp: dados.exp });
}
