import { NextResponse } from "next/server";
import { deleteVitrinePage, getVitrinePageById, updateVitrinePage } from "@/lib/vitrine/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const page = await getVitrinePageById(id);
    if (!page) return NextResponse.json({ success: false, error: "Não encontrado" }, { status: 404 });
    return NextResponse.json({ success: true, page });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao carregar página" }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await request.json().catch(() => ({}));

    const wantsPublished = String(body?.status || "") === "publicada";
    const requireImages = body?.requireImages === false ? false : true;
    if (wantsPublished && requireImages) {
      const existing = await getVitrinePageById(id);
      const nextImages = { ...(existing?.images || {}), ...(body?.images || {}) } as Record<string, any>;
      const hero = String(nextImages?.hero || "").trim();
      if (!hero) {
        return NextResponse.json(
          { success: false, error: "Imagens ainda não foram geradas (imagem principal)." },
          { status: 409 },
        );
      }
    }

    const page = await updateVitrinePage(id, body);
    return NextResponse.json({ success: true, page });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao atualizar página" }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await deleteVitrinePage(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao excluir página" }, { status: 500 });
  }
}
