import { NextResponse, type NextRequest } from "next/server";
import { buscarFonte, categoriasDaFonte } from "@/lib/precos/banco";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";

/** As categorias do site em que caem os produtos da fonte, com a margem de cada uma. */
export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const fonte = await buscarFonte(id);
    if (!fonte) return falha("Fonte não encontrada.", 404);
    const categorias = await categoriasDaFonte(fonte);
    return NextResponse.json({ ok: true, categorias });
  } catch (erro) {
    return falha(erro);
  }
}
