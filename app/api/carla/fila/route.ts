import { NextResponse } from "next/server";
import { pegarFila } from "@/lib/carla";

export const dynamic = "force-dynamic";

/**
 * Fila da CLAUD.IA — a VPS chama isto para saber quem cobrar e quem reativar.
 * Protegida pelo mesmo token de máquina da VITOR.IA (BETO_TOKEN): é a mesma VPS.
 */
function tokenConfere(req: Request) {
  const esperado = (process.env.BETO_TOKEN || "").trim();
  if (!esperado) return false;
  const veio = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!veio || veio.length !== esperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= esperado.charCodeAt(i) ^ veio.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function GET(req: Request) {
  if (!tokenConfere(req)) {
    return NextResponse.json({ ok: false, erro: "não autorizado" }, { status: 401 });
  }

  const fila = await pegarFila();
  return NextResponse.json({
    ok: true,
    fila: {
      cobranca: fila.cobranca.map((p) => ({
        whatsapp: p.whatsapp,
        nome: p.nome,
        total: p.total,
        pedidoId: p.id,
      })),
      reativacao: fila.reativacao.map((r) => ({
        whatsapp: r.whatsapp,
        nome: r.nome,
      })),
    },
  });
}
