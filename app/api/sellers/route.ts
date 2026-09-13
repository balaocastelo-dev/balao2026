import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Lista vendedores ativos (para o CRM e para a página de login)
export async function GET() {
  const { data, error } = await supabaseAdmin.from("sellers").select("id, name, slug, cargo, ativo, created_at").eq("ativo", true).order("name", { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Cria vendedor com senha simples (ilimitado)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || body?.nome || "").trim();
    let slug = String(body?.slug || "").trim().toLowerCase();
    const senha = String(body?.senha || body?.password || "").trim();
    const cargo = String(body?.cargo || "Vendas").trim();

    if (!name || !senha) return NextResponse.json({ success: false, error: "nome e senha obrigatórios" }, { status: 400 });

    // Gera slug a partir do nome se não veio
    if (!slug) {
      slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    } else {
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (!slug) return NextResponse.json({ success: false, error: "slug inválido" }, { status: 400 });

    // Verifica se slug já existe
    const { data: existente } = await supabaseAdmin.from("sellers").select("id").eq("slug", slug).limit(1).maybeSingle();
    if (existente) return NextResponse.json({ success: false, error: `slug "${slug}" já existe` }, { status: 409 });

    const { data, error } = await supabaseAdmin.from("sellers").insert({ name, slug, senha, cargo, ativo: true, hired_at: new Date().toISOString().slice(0,10) }).select("id, name, slug, cargo, ativo").single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, seller: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "erro" }, { status: 500 });
  }
}
