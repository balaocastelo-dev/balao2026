import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";
import { SITE_CONFIG } from "@/lib/config";

export async function GET() {
  try {
    if (isTursoActive()) {
      const res = await turso.execute(
        "SELECT text FROM topbar_messages WHERE active = 1 ORDER BY display_order ASC"
      );
      const messages = res.rows.map((r: any) => r.text).filter(Boolean);
      if (messages.length > 0) {
        return NextResponse.json({ messages });
      }
    }
  } catch {}
  return NextResponse.json({
    messages: [
      `Telefone: ${SITE_CONFIG.phone.display}`,
      `WhatsApp: ${SITE_CONFIG.whatsapp.display}`,
      `E-mail: ${SITE_CONFIG.email}`,
      "Horário de Atendimento: Seg a Sex das 07:00 às 18:00",
      `Endereço: ${SITE_CONFIG.address}`
    ]
  });
}

export async function POST(req: Request) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json({ error: "Banco de dados não configurado" }, { status: 501 });
    }
    const body = await req.json();
    const messages: string[] = Array.isArray(body?.messages) ? body.messages : [];
    const clean = messages.map(m => (typeof m === 'string' ? m.trim() : '')).filter(m => m.length > 0);

    // Abordagem simples: limpar e inserir ordenado
    await turso.execute("DELETE FROM topbar_messages");

    if (clean.length > 0) {
      const stmts = clean.map((text, idx) => ({
        sql: "INSERT INTO topbar_messages (id, text, active, display_order) VALUES (?, ?, 1, ?)",
        args: [randomUUID(), text, idx],
      }));
      await turso.batch(stmts, 'write');
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
