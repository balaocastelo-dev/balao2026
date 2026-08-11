import { NextResponse } from "next/server";
import { supabaseAdmin, hasAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { success: false, error: "Supabase admin não configurado" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { page, visitorId } = body;

    if (!visitorId) return NextResponse.json({ success: false }, { status: 400 });

    // Tentar inserir na tabela site_visits
    // Se a tabela não existir, vai falhar, mas ok
    const { error } = await supabaseAdmin
      .from('site_visits')
      .insert({
        page: page,
        visitor_id: visitorId
      });

    if (error) {
       // Se o erro for que a tabela não existe, logar apenas como warning
       if (error.code === '42P01') {
         console.warn("Tabela site_visits não encontrada. Rode o SQL de migração.");
       } else {
         console.error("Erro ao registrar visita:", error);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
