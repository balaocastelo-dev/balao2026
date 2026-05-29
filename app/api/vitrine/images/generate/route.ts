import { NextResponse } from "next/server";
import { generateAndUploadVitrineImages } from "@/lib/vitrine/images";
import { getVitrinePageById, updateVitrinePage } from "@/lib/vitrine/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = String(body?.id || "").trim();
    const keys = Array.isArray(body?.keys) ? body.keys.map((k: any) => String(k)) : undefined;

    if (!id) return NextResponse.json({ success: false, error: "id é obrigatório" }, { status: 400 });

    const page = await getVitrinePageById(id);
    if (!page) return NextResponse.json({ success: false, error: "Não encontrado" }, { status: 404 });

    const result = await generateAndUploadVitrineImages({ page, keys });

    const mergedImages = { ...(page.images || {}), ...(result.images || {}) };
    const mergedPrompts = { ...(page.image_prompts || {}), ...(result.image_prompts || {}) };

    const updated = await updateVitrinePage(page.id, {
      images: mergedImages,
      image_prompts: mergedPrompts,
    } as any);

    return NextResponse.json({ success: true, page: updated, generated: result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao gerar imagens" }, { status: 500 });
  }
}

