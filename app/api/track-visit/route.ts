import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { turso, isTursoActive } from "@/lib/turso";

export async function POST(req: Request) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { success: false, error: "Banco de dados não configurado" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { page, visitorId } = body;

    if (!visitorId) return NextResponse.json({ success: false }, { status: 400 });

    try {
      await turso.execute({
        sql: 'INSERT INTO site_visits (id, page, visitor_id) VALUES (?, ?, ?)',
        args: [randomUUID(), typeof page === "string" ? page : null, String(visitorId)],
      });
    } catch (e) {
      console.error("Erro ao registrar visita:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
