// ============================================================
// PDV: uma venda — para o comprovante (A4 ou 80 mm) e as ações do balcão:
// tentar de novo no Bling, emitir a nota depois, conferir a nota na Sefaz.
// `id` é o do PDV (PDV-AAMMDD-XXXX) ou "bling-<id do pedido>".
// ============================================================

import { NextResponse } from "next/server";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { SemAcessoAoBling } from "@/lib/pdv/bling";
import {
  atualizarNota,
  comprovanteDaVenda,
  comprovanteDoBling,
  diaDoId,
  lerEntrada,
  lerVenda,
  pedirNotaDepois,
  tentarDeNovo,
  VendaInvalida,
} from "@/lib/pdv/vendas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!(await operadorDoPdv())) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const { id } = await ctx.params;
  try {
    if (id.startsWith("bling-")) {
      const pedido = id.slice(6).replace(/\D/g, "");
      if (!pedido) return NextResponse.json({ erro: "Pedido inválido" }, { status: 400 });
      return NextResponse.json({ comprovante: await comprovanteDoBling(pedido) });
    }
    if (!diaDoId(id)) return NextResponse.json({ erro: "Venda inválida" }, { status: 400 });
    let venda = await lerVenda(id);
    if (!venda) return NextResponse.json({ erro: "Venda não encontrada" }, { status: 404 });
    // Nota a caminho da Sefaz: confere antes de mostrar.
    if (venda.nota.estado === "enviada") venda = (await atualizarNota(id).catch(() => venda)) ?? venda;
    return NextResponse.json({ comprovante: comprovanteDaVenda(venda) });
  } catch (e) {
    const status = e instanceof SemAcessoAoBling ? 503 : 502;
    return NextResponse.json({ erro: (e as Error).message }, { status });
  }
}

export async function POST(req: Request, ctx: Ctx) {
  if (!(await operadorDoPdv())) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const { id } = await ctx.params;
  if (!diaDoId(id)) return NextResponse.json({ erro: "Só vendas feitas no PDV têm ações aqui; as do Bling se resolvem no Bling." }, { status: 400 });
  let corpo: Record<string, unknown> = {};
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    /* sem corpo */
  }
  try {
    let venda;
    if (corpo.acao === "tentar-de-novo") venda = await tentarDeNovo(id);
    else if (corpo.acao === "emitir-nota") venda = await pedirNotaDepois(id, corpo.cliente ? lerEntrada({ cliente: corpo.cliente }).cliente : null);
    else if (corpo.acao === "atualizar-nota") venda = await atualizarNota(id);
    else return NextResponse.json({ erro: "Ação desconhecida" }, { status: 400 });
    if (!venda) return NextResponse.json({ erro: "Venda não encontrada" }, { status: 404 });
    return NextResponse.json({ venda, comprovante: comprovanteDaVenda(venda) });
  } catch (e) {
    if (e instanceof VendaInvalida) return NextResponse.json({ erro: e.message, problemas: e.problemas }, { status: 422 });
    const status = e instanceof SemAcessoAoBling ? 503 : 502;
    return NextResponse.json({ erro: (e as Error).message }, { status });
  }
}
