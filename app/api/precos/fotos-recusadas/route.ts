import { NextResponse } from "next/server";
import { desfazerRecusa, listarFotosRecusadas, recusarFotos, type PedidoDeRecusa } from "@/lib/precos/fotos-recusadas";
import { invalidarCacheProdutos } from "@/lib/cache";
import { falha } from "@/lib/precos/resposta";
import auditoria12de10 from "@/data/auditoria-fotos-2026-10-12.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Listas de fotos reprovadas em auditorias, guardadas no repositório. */
const AUDITORIAS: Record<string, { itens: [string, string, string][] }> = {
  "2026-10-12": auditoria12de10 as unknown as { itens: [string, string, string][] },
};

// Protegida pelo proxy (/api/precos exige a sessão do painel).
// Auditoria de fotos de 12/10/2026: ver lib/precos/fotos-recusadas.ts.

/** Fotos reprovadas na conferência. */
export async function GET(request: Request) {
  try {
    const limite = Number(new URL(request.url).searchParams.get("limite") || 1000);
    return NextResponse.json({ ok: true, recusadas: await listarFotosRecusadas(limite) });
  } catch (erro) {
    return falha(erro);
  }
}

/**
 * Recusa fotos: { itens: [{ id, foto?, motivo?, nova? }] } (até 200 por vez).
 * A foto recusada sai do produto (fica a `nova`, se veio, ou "sem foto") e não
 * volta pela leitura da fonte.
 */
export async function POST(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    // { auditoria: "2026-10-12", inicio, quantidade }: aplica a lista guardada
    // no repositório (data/auditoria-fotos-<data>.json), em partes.
    if (corpo?.auditoria) {
      const lista = AUDITORIAS[String(corpo.auditoria)];
      if (!lista) return falha("Auditoria desconhecida.", 400);
      const inicio = Math.max(0, Number(corpo.inicio) || 0);
      const quantidade = Math.min(250, Math.max(1, Number(corpo.quantidade) || 200));
      const parte = lista.itens.slice(inicio, inicio + quantidade).map(([id, foto, motivo]) => ({ id, foto, motivo }));
      const resultado = await recusarFotos(parte);
      invalidarCacheProdutos();
      return NextResponse.json({
        ok: true,
        total: lista.itens.length,
        feitos: inicio + parte.length,
        falhas: resultado.filter((r) => !r.ok),
        trocadas: resultado.filter((r) => r.ok && r.ficou && r.ficou !== r.foto).length,
      });
    }
    const itens: PedidoDeRecusa[] = Array.isArray(corpo?.itens) ? corpo.itens.slice(0, 200) : [];
    if (itens.length === 0) return falha("Informe os itens.", 400);
    const resultado = await recusarFotos(itens);
    invalidarCacheProdutos();
    return NextResponse.json({ ok: true, resultado });
  } catch (erro) {
    return falha(erro);
  }
}

/** Desfaz uma recusa: { id, foto } — a foto pode voltar na próxima leitura da fonte. */
export async function DELETE(request: Request) {
  try {
    const corpo = await request.json().catch(() => ({}));
    const id = String(corpo?.id || "").trim();
    const foto = String(corpo?.foto || "").trim();
    if (!id || !foto) return falha("Informe o produto e a foto.", 400);
    return NextResponse.json({ ok: true, desfeita: await desfazerRecusa(id, foto) });
  } catch (erro) {
    return falha(erro);
  }
}
