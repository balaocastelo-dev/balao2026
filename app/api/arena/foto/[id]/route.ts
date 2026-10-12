// Foto do piloto guardada na gaveta (o painel reduz e grava como imagem).
import { NextResponse } from "next/server";
import { lerConfig } from "@/lib/arena/dados";
import { lerArquivo } from "@/lib/arena/gaveta";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const piloto = await lerConfig()
    .then((c) => c.pilotos.find((p) => p.id === String(id).slice(0, 64)))
    .catch(() => null);
  const foto = piloto?.foto ?? "";
  // O endereço muda (?v=) quando a foto muda: pode guardar por um dia.
  const cache = { "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable" };

  if (foto.startsWith("gaveta:")) {
    const arq = await lerArquivo(foto.slice(7)).catch(() => null);
    if (!arq) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(arq.corpo), { headers: { "Content-Type": arq.tipo || "image/jpeg", ...cache } });
  }
  const m = foto.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(Buffer.from(m[2], "base64")), { headers: { "Content-Type": m[1], ...cache } });
}
