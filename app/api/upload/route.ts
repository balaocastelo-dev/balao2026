import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_MIME = new Set([
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `Tipo de arquivo não permitido: ${file.type}` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Salva localmente em public/uploads/<bucket>/
    const dir = path.join(process.cwd(), 'public', 'uploads', bucket);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), buffer);

    // URL pública servida pelo próprio site
    const publicUrl = `/uploads/${bucket}/${fileName}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Erro desconhecido" }, { status: 500 });
  }
}
