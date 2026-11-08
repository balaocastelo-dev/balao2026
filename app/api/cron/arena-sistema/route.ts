import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "@/lib/painel-auth";
import { sincronizarArena } from "@/lib/arena/sistema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Agendador da Arena (vercel.json, a cada 5 minutos): lê as vendas no MEU BLING
 * (/sistema) e atualiza a corrida. Ver lib/arena/sistema.ts e docs/arena.md.
 *
 * Mesma porta do agendador dos preços (/api/cron/precos): o agendador da
 * Vercel se apresenta pelo user-agent "vercel-cron/1.0" (e manda o
 * Authorization só quando existe CRON_SECRET). Quem chamar por fora só
 * adianta uma leitura que ia acontecer de qualquer jeito.
 */
async function autorizado(req: Request) {
  if (req.headers.get("x-vercel-cron")) return true;
  if ((req.headers.get("user-agent") || "").toLowerCase().startsWith("vercel-cron/")) return true;
  const segredo = process.env.CRON_SECRET;
  if (segredo && req.headers.get("authorization") === `Bearer ${segredo}`) return true;
  return isPainelAuthenticated();
}

export async function GET(req: Request) {
  if (!(await autorizado(req))) {
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  }
  const r = await sincronizarArena({ limiteMs: 40_000 });
  // Uma linha por rodada, para conferir nos logs que o agendador está vivo.
  console.log(
    "[cron/arena-sistema]",
    r.ok
      ? `${r.de}..${r.ate} (${r.modo}): ${r.vendasLidas} lidas, ${r.gravadas} gravadas, ${r.detalhes} detalhes${r.ligados ? `, ${r.ligados} ligados pelo nome` : ""}`
      : `erro: ${r.erro}`
  );
  return NextResponse.json(r, { status: r.ok ? 200 : 503 });
}
