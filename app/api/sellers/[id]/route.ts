import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.nome !== undefined) updates.name = String(body.nome).trim();
    if (body.slug !== undefined) updates.slug = String(body.slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (body.senha !== undefined) updates.senha = String(body.senha).trim();
    if (body.password !== undefined) updates.senha = String(body.password).trim();
    if (body.cargo !== undefined) updates.cargo = String(body.cargo).trim();
    if (body.ativo !== undefined) updates.ativo = Boolean(body.ativo);

    if (Object.keys(updates).length === 0) return NextResponse.json({ success: false, error: "nada para atualizar" }, { status: 400 });

    const { data, error } = await supabase.from("sellers").update(updates).eq("id", id).select("id, name, slug, cargo, ativo").single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, seller: data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "erro" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Desativa ao invés de apagar para preservar histórico de vendas
    const { error } = await supabase.from("sellers").update({ ativo: false }).eq("id", id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "erro" }, { status: 500 });
  }
}
