import { NextRequest, NextResponse } from "next/server";
import { PRODUTOS_CATALOGO_BASE } from "@/lib/crm-defaults";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  if (!url) {
    return NextResponse.json({ ok: false, preview: null });
  }

  // Try to find matching product in default catalog or store
  const lowerUrl = url.toLowerCase();
  let matched = PRODUTOS_CATALOGO_BASE.find((p) =>
    lowerUrl.includes(p.id.toLowerCase()) ||
    (p.slug && lowerUrl.includes(p.slug.toLowerCase()))
  );

  if (!matched) {
    // Check by name keywords
    matched = PRODUTOS_CATALOGO_BASE.find((p) => {
      const words = p.nome.toLowerCase().split(" ").filter((w) => w.length > 3);
      return words.some((w) => lowerUrl.includes(w));
    });
  }

  if (matched) {
    return NextResponse.json({
      ok: true,
      preview: {
        id: matched.id,
        nome: matched.nome,
        preco: matched.preco,
        imgPath: matched.imagem,
        link: url,
      },
    });
  }

  // Generic link preview
  return NextResponse.json({
    ok: true,
    preview: {
      id: "link",
      nome: url.replace(/^https?:\/\//, "").slice(0, 45),
      preco: 0,
      imgPath: null,
      link: url,
    },
  });
}
