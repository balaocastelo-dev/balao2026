// Foto de seminovo guardada na gaveta (Blob privado). O nome muda a cada
// envio, então a resposta pode ficar guardada para sempre na CDN.

import { NextResponse } from "next/server";
import { lerFoto } from "@/lib/seminovos/dados";

export async function GET(_req: Request, ctx: { params: Promise<{ nome: string }> }) {
  const { nome } = await ctx.params;
  const arq = await lerFoto(String(nome)).catch(() => null);
  if (!arq) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(arq.corpo), {
    headers: {
      "Content-Type": arq.tipo || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
