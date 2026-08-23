import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("busca")?.trim() || "";
  if (!q) {
    return NextResponse.json({
      ok: true,
      fotos: [],
      filtro: "PNG médio com fundo transparente",
    });
  }

  try {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(
      q
    )}&cc=br&setlang=pt-br&qft=%2bfilterui%3aimagesize-medium%2bfilterui%3aphoto-transparent&form=HDRSC2`;

    const res = await fetch(bingUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();

    const fotos: Array<{ url: string; w: number; h: number; nome: string }> = [];
    const re = /m="\{&quot;cid&quot;:&quot;.*?&quot;murl&quot;:&quot;(https?:\/\/.*?)&quot;.*?&quot;t&quot;:&quot;(.*?)&quot;/g;
    let match;

    while ((match = re.exec(html)) !== null && fotos.length < 12) {
      const rawUrl = match[1].replace(/\\\//g, "/");
      const title = match[2]?.replace(/&amp;/g, "&") || q;
      if (rawUrl && (rawUrl.includes(".png") || rawUrl.includes("transparent") || rawUrl.includes("product"))) {
        fotos.push({
          url: rawUrl,
          w: 400,
          h: 400,
          nome: title.slice(0, 70),
        });
      }
    }

    // Fallback if regex was sparse
    if (fotos.length === 0) {
      const murls = [...html.matchAll(/&quot;murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)];
      for (const m of murls.slice(0, 10)) {
        const u = m[1].replace(/\\\//g, "/");
        if (u) {
          fotos.push({
            url: u,
            w: 400,
            h: 400,
            nome: q,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      fotos,
      filtro: "Busca de fotos web (PNG transparente / produtos)",
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: true,
      fotos: [
        {
          url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80",
          w: 500,
          h: 500,
          nome: `${q} - Foto de Produto`,
        },
      ],
      filtro: "Imagens do catálogo",
    });
  }
}
