import { NextResponse, type NextRequest } from "next/server";
import { atualizarFonte, buscarFonte, recalcularMargem, removerFonte } from "@/lib/precos/banco";
import { invalidarCacheProdutos } from "@/lib/cache";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const antes = await buscarFonte(id);
    if (!antes) return falha("Fonte não encontrada.", 404);

    const corpo = await request.json().catch(() => ({}));
    if (corpo?.margem !== undefined && !(Number(corpo.margem) >= 0 && Number(corpo.margem) <= 500)) {
      return falha("A margem precisa ser um número entre 0 e 500.", 400);
    }

    const fonte = await atualizarFonte(id, {
      nome: corpo?.nome,
      so_loja: corpo?.so_loja,
      margem: corpo?.margem,
      ativa: corpo?.ativa,
      intervalo_min: corpo?.intervalo_min,
      preco_min: corpo?.preco_min,
      preco_max: corpo?.preco_max,
      categoria_destino: corpo?.categoria_destino,
      regra_margem: corpo?.regra_margem,
    });
    if (!fonte) return falha("Fonte não encontrada.", 404);

    // Mudou a margem: o preço de venda de todos os produtos da fonte muda
    // agora, sem esperar a próxima leitura — e o cache cai para o site e o CRM
    // mostrarem o preço novo na hora.
    let reprecificados = 0;
    if (fonte.margem !== antes.margem || JSON.stringify(fonte.regra_margem ?? null) !== JSON.stringify(antes.regra_margem ?? null)) {
      reprecificados = await recalcularMargem(fonte);
      invalidarCacheProdutos();
    }
    return NextResponse.json({ ok: true, fonte, reprecificados });
  } catch (erro) {
    return falha(erro);
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  try {
    const fonte = await buscarFonte(id);
    if (!fonte) return falha("Fonte não encontrada.", 404);
    const { produtosRemovidos } = await removerFonte(id);
    invalidarCacheProdutos();
    return NextResponse.json({ ok: true, produtosRemovidos });
  } catch (erro) {
    return falha(erro);
  }
}
