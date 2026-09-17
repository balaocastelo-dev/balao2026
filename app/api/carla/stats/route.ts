import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { estatisticas } from "@/lib/carla";

export const dynamic = "force-dynamic";

/**
 * Números da CLAUD.IA para o painel do /crm — porta fechada pela senha do painel.
 */
export async function GET() {
  const autenticado = await isPainelAuthenticated();
  if (!autenticado) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }
  const stats = await estatisticas();
  return NextResponse.json({ ok: true, stats });
}
