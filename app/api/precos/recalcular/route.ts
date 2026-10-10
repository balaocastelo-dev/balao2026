import { NextResponse } from "next/server";
import { listarFontes, recalcularMargem } from "@/lib/precos/banco";
import { invalidarCacheProdutos } from "@/lib/cache";
import { falha } from "@/lib/precos/resposta";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Protegida pelo proxy (/api/precos exige a sessão do painel ou o token de admin).

/**
 * Recalcula o preço de venda de todos os produtos de todas as fontes com a
 * margem e as faixas de preço atuais (lib/precos/faixas.ts). Não lê fonte
 * nenhuma: usa o preço de origem já gravado.
 */
export async function POST() {
  try {
    const fontes = await listarFontes();
    const porFonte: { fonte: string; reprecificados: number }[] = [];
    for (const fonte of fontes) {
      porFonte.push({ fonte: fonte.nome, reprecificados: await recalcularMargem(fonte) });
    }
    invalidarCacheProdutos();
    return NextResponse.json({ ok: true, total: porFonte.reduce((s, f) => s + f.reprecificados, 0), porFonte });
  } catch (erro) {
    return falha(erro);
  }
}
