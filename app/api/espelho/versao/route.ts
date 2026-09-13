import { NextResponse } from "next/server";
import { supabase, isSupabaseActive } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Assinatura barata do catálogo, para a VPS decidir se vale baixar os 11 MB
 * de /api/espelho.
 *
 * O espelho baixava o catálogo inteiro de meia em meia hora mesmo quando nada
 * mudava: 48 downloads por dia, ~15 GB/mês num projeto Supabase de 5 GB. Aqui
 * a resposta tem duas dezenas de bytes — conta de linhas e data da alteração
 * mais recente. Igual à última vez, a VPS não baixa nada.
 */
export async function GET() {
  if (!isSupabaseActive()) {
    return NextResponse.json({ ok: false, motivo: "supabase não configurado" }, { status: 503 });
  }

  try {
    const { count, error: erroContagem } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_curated", true);
    if (erroContagem) throw erroContagem;

    const { data, error } = await supabase
      .from("products")
      .select("updated_at")
      .eq("is_curated", true)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (error) throw error;

    return NextResponse.json({
      ok: true,
      total: count ?? 0,
      maisRecente: data?.[0]?.updated_at ?? null,
    });
  } catch (erro) {
    // Falhou? Devolve erro em vez de uma assinatura inventada: uma assinatura
    // errada faria a VPS pular a atualização e manter catálogo velho achando
    // que está em dia.
    return NextResponse.json(
      { ok: false, motivo: (erro as Error).message },
      { status: 502 }
    );
  }
}
