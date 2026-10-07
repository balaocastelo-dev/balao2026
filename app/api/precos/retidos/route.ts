import { NextResponse } from "next/server";
import { aceitarRetidos, buscarFonte, listarRetidos } from "@/lib/precos/banco";
import { invalidarCacheProdutos } from "@/lib/cache";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";

/** Quedas de preço grandes demais, seguradas à espera de confirmação. */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, retidos: await listarRetidos() });
  } catch (erro) {
    return falha(erro);
  }
}

/** Aceita o preço novo: de uma fonte inteira, ou só dos produtos indicados. */
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const fonte = await buscarFonte(String(corpo?.fonte_id || ""));
    if (!fonte) return falha("Fonte não encontrada.", 404);

    const ids = Array.isArray(corpo?.ids) ? corpo.ids.map(String).slice(0, 500) : undefined;
    const aceitos = await aceitarRetidos(fonte, ids);
    if (aceitos > 0) invalidarCacheProdutos();
    return NextResponse.json({ ok: true, aceitos });
  } catch (erro) {
    return falha(erro);
  }
}
