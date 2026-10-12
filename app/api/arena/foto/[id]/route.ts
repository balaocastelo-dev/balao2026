// Foto do piloto guardada no banco (o painel reduz e grava como imagem).
import { NextResponse } from "next/server";
import { bancoAtivo, fotoDoPiloto } from "@/lib/arena/banco";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!bancoAtivo()) return new NextResponse(null, { status: 404 });
  const { id } = await ctx.params;
  const foto = await fotoDoPiloto(String(id).slice(0, 64)).catch(() => null);
  const m = foto?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new NextResponse(null, { status: 404 });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      // O endereço muda (?v=) quando a foto muda: pode guardar por um dia.
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
