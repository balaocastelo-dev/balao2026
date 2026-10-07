import { NextResponse, type NextRequest } from "next/server";
import { lerFonteAte } from "@/lib/precos/coleta";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * "Ler agora" do painel. Lê as páginas que couberem em ~40 s e devolve onde
 * parou; a tela chama de novo enquanto o estado for "em_andamento".
 */
export async function POST(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const passo = await lerFonteAte(id, Date.now() + 40_000);
    return NextResponse.json({ ok: true, passo });
  } catch (erro) {
    return falha(erro);
  }
}
