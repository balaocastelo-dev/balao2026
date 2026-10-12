import { NextResponse } from "next/server";
import { desbloquear, listarBloqueados } from "@/lib/precos/bloqueio";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";

// Protegida pelo proxy (/api/precos exige a sessão do painel).

/** Produtos excluídos no painel que estão bloqueados na entrada. */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, bloqueados: await listarBloqueados() });
  } catch (erro) {
    return falha(erro);
  }
}

/** Desbloqueia: { id } — o produto volta na próxima leitura da fonte. */
export async function DELETE(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const id = String(corpo?.id || new URL(request.url).searchParams.get("id") || "").trim();
    if (!id) return falha("Informe o produto.", 400);
    const desbloqueado = await desbloquear(id);
    return NextResponse.json({ ok: true, desbloqueado });
  } catch (erro) {
    return falha(erro);
  }
}
