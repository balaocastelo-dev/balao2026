import { NextResponse } from "next/server";
import { buildRecommendedSlug, extractExtrasFromText, extractParts, makeCommercialCopy, normalizeInputText } from "@/lib/vitrine/core";
import { getVitrinePageBySlug } from "@/lib/vitrine/db";
import { VitrineCategory } from "@/lib/vitrine/types";
import { scrapeUrlForVitrine } from "@/lib/vitrine/scrape";

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

    const isUrl = /^https?:\/\//i.test(input);
    const urlScraped = isUrl ? await scrapeUrlForVitrine(input).catch(() => null) : null;
    const kabumScraped = await tryScrapeKabum(request, input);

    const urlSpecsText = urlScraped
      ? Object.entries(urlScraped.specs || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      : "";
    const kabumSpecsText = Object.entries(kabumScraped.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const combined = [
      nomePc,
      input,
      urlScraped?.title,
      urlScraped?.description,
      urlScraped?.text,
      urlSpecsText,
      kabumScraped.description,
      kabumSpecsText,
    ]
      .filter(Boolean)
      .join(" ");

    const parts = extractParts(combined, categoria || undefined);
    const extras = extractExtrasFromText([urlSpecsText, kabumSpecsText, urlScraped?.text || "", input].filter(Boolean).join("\n"));
    const baseSlug = buildRecommendedSlug(parts, nomePc || combined);
    const { slug, isUnique } = await ensureUniqueSlug(baseSlug);
    const copy = makeCommercialCopy(nomePc || "PC Exclusivo", parts);

    return NextResponse.json({
      success: true,
      slug,
      slugAvailable: isUnique,
      parts,
      extras,
      source_url: isUrl ? input : "",
      copy,
      scraped: {
        images: Array.from(
          new Set([...(kabumScraped.images || []), ...((urlScraped?.images || []) as string[])]),
        ),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao identificar peças" }, { status: 500 });
  }
}
