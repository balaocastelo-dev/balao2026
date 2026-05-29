import { NextResponse } from "next/server";
import { buildRecommendedSlug, extractParts, makeCommercialCopy, normalizeInputText } from "@/lib/vitrine/core";
import { getVitrinePageBySlug } from "@/lib/vitrine/db";
import { VitrineCategory } from "@/lib/vitrine/types";

async function tryScrapeKabum(request: Request, input: string) {
  const url = String(input || "").trim();
  if (!/^https?:\/\//i.test(url)) return { images: [] as string[], description: "", specs: {} as Record<string, string> };
  if (!/kabum\.com\.br/i.test(url)) return { images: [] as string[], description: "", specs: {} as Record<string, string> };

  const endpoint = new URL("/api/scrape/product", request.url);
  const res = await fetch(endpoint.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => null);

  if (!res || !res.ok) return { images: [] as string[], description: "", specs: {} as Record<string, string> };
  const data = await res.json().catch(() => null);
  if (!data?.success) return { images: [] as string[], description: "", specs: {} as Record<string, string> };
  return {
    images: Array.isArray(data.images) ? data.images.map((v: any) => String(v)) : [],
    description: String(data.description || ""),
    specs: (data.specs && typeof data.specs === "object" ? data.specs : {}) as Record<string, string>,
  };
}

async function ensureUniqueSlug(baseSlug: string) {
  const base = baseSlug || "pc";
  let slug = base;
  let i = 2;
  while (true) {
    const existing = await getVitrinePageBySlug(slug, true);
    if (!existing) return { slug, isUnique: true };
    slug = `${base}-${i}`;
    i += 1;
    if (i > 50) return { slug: `${base}-${Date.now()}`, isUnique: false };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const nomePc = String(body?.nomePc || body?.nome_pc || "").trim();
    const input = normalizeInputText(String(body?.input || body?.descricao || "").trim());
    const categoria = (body?.categoria ? String(body.categoria) : "") as VitrineCategory | "";

    const scraped = await tryScrapeKabum(request, input);
    const specsText = Object.entries(scraped.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(" ");

    const combined = [nomePc, input, scraped.description, specsText].filter(Boolean).join(" ");
    const parts = extractParts(combined, categoria || undefined);
    const baseSlug = buildRecommendedSlug(parts, nomePc || combined);
    const { slug, isUnique } = await ensureUniqueSlug(baseSlug);
    const copy = makeCommercialCopy(nomePc || "PC Exclusivo", parts);

    return NextResponse.json({
      success: true,
      slug,
      slugAvailable: isUnique,
      parts,
      copy,
      scraped: {
        images: scraped.images,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao identificar peças" }, { status: 500 });
  }
}
