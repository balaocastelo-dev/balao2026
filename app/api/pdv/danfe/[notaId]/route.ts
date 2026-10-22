// ============================================================
// PDV: o DANFE (PDF) de uma nota emitida pelo /sistema, para o QR do cupom.
// Sem senha, mas só abre com a assinatura do link (?t=…), que o site gera para
// cada nota com a chave do /sistema: ninguém adivinha o link de outra nota.
// ============================================================

import { NextResponse } from "next/server";
import { assinaturaConfere, pdfDoDanfe } from "@/lib/pdv/sistema";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ notaId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const notaId = Number((await ctx.params).notaId);
  const t = new URL(req.url).searchParams.get("t");
  if (!Number.isInteger(notaId) || notaId <= 0 || !assinaturaConfere(notaId, t)) {
    return NextResponse.json({ erro: "Link da nota inválido." }, { status: 404 });
  }
  try {
    const r = await pdfDoDanfe(notaId);
    return new Response(r.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="DANFE-${notaId}.pdf"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json({ erro: `Não consegui abrir a nota agora: ${(e as Error).message}` }, { status: 503 });
  }
}
