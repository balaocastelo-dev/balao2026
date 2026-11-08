// ============================================================
// Antiga entrada do vigia da Arena (scripts/arena-vigia, no PC da loja).
//
// Até 24/10/2026 o vigia buscava as vendas no Bling e entregava aqui. Desde
// 25/10/2026 a Arena lê as vendas direto do MEU BLING (lib/arena/sistema.ts,
// agendador /api/cron/arena-sistema); o vigia foi desligado e não volta.
// A porta responde 410 (Gone) para quem ainda chamar. A chave do vigia continua
// valendo, agora como "chave do PC da loja" (/api/pc/sistema/*).
// ============================================================

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MENSAGEM = "A Arena lê as vendas direto do MEU BLING desde 25/10/2026; o vigia do PC não é mais usado.";

function encerrada() {
  return NextResponse.json({ erro: MENSAGEM }, { status: 410, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return encerrada();
}

export async function POST() {
  return encerrada();
}
