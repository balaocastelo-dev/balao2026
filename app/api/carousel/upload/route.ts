import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { turso } from "@/lib/turso";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 1. Salva a imagem localmente em public/uploads/carousel/
    const dir = path.join(process.cwd(), 'public', 'uploads', 'carousel');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);
    const publicUrl = `/uploads/carousel/${fileName}`;

    // 2. Insere no banco (Turso)
    try {
      const maxOrderRes = await turso.execute(
        'SELECT MAX(display_order) AS max_order FROM carousel_images'
      );
      const nextOrder = Number((maxOrderRes.rows[0] as any)?.max_order ?? -1) + 1;

      const id = randomUUID();
      await turso.execute({
        sql: `INSERT INTO carousel_images (id, image_url, title, display_order, active, metadata, created_at)
              VALUES (?, ?, ?, ?, 1, ?, ?)`,
        args: [
          id,
          publicUrl,
          title || file.name,
          nextOrder,
          JSON.stringify({ size: file.size, type: file.type, origin: 'upload' }),
          new Date().toISOString(),
        ],
      });

      return NextResponse.json({ success: true, data: { id, image_url: publicUrl, title: title || file.name, display_order: nextOrder } });
    } catch (dbError: any) {
      // Remove a imagem enviada se falhar no banco
      await unlink(path.join(dir, fileName)).catch(() => null);
      console.error("Erro na inserção (DB):", dbError);
      return NextResponse.json({ error: "Falha ao salvar registro no banco de dados: " + dbError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Erro geral na rota de upload:", error);
    return NextResponse.json({ error: error.message || "Erro desconhecido no servidor" }, { status: 500 });
  }
}
