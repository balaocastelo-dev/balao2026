import { NextResponse } from "next/server";
import { buildRecommendedSlug, extractExtrasFromText, extractParts, makeCommercialCopy, normalizeInputText } from "@/lib/vitrine/core";
import { createVitrinePage, getVitrinePageBySlug, updateVitrinePage } from "@/lib/vitrine/db";
import { VitrineCategory } from "@/lib/vitrine/types";
import { scrapeUrlForVitrine } from "@/lib/vitrine/scrape";
import { generateAndUploadVitrineImages, getVitrineImageGenerationDiagnostics } from "@/lib/vitrine/images";

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
    const generateImages = body?.generateImages === false ? false : true;
    const persistDraft = body?.persistDraft === false ? false : true;

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

    const scrapedImages = Array.from(
      new Set([...(kabumScraped.images || []), ...((urlScraped?.images || []) as string[])]),
    );

    let page = await getVitrinePageBySlug(slug, true);
    if (persistDraft) {
      if (!page) {
        page = await createVitrinePage({
          nome_pc: nomePc || (urlScraped?.title || "PC Exclusivo"),
          slug,
          categoria: (parts.categoria || categoria || "PC Gamer") as any,
          descricao_original: input,
          source_url: isUrl ? input : "",
          processador: parts.processador || "",
          placa_video: parts.placa_video || "",
          memoria_ram: parts.memoria_ram || "",
          armazenamento: parts.armazenamento || "",
          sistema_operacional: parts.sistema_operacional || "",
          resfriamento: parts.resfriamento || "",
          aplicacoes: parts.aplicacoes || [],
          extras,
          status: "rascunho",
        } as any);
      } else {
        page = await updateVitrinePage(page.id, {
          nome_pc: nomePc || page.nome_pc,
          categoria: (parts.categoria || page.categoria) as any,
          descricao_original: input || page.descricao_original,
          source_url: isUrl ? input : page.source_url,
          processador: parts.processador || page.processador,
          placa_video: parts.placa_video || page.placa_video,
          memoria_ram: parts.memoria_ram || page.memoria_ram,
          armazenamento: parts.armazenamento || page.armazenamento,
          sistema_operacional: parts.sistema_operacional || page.sistema_operacional,
          resfriamento: parts.resfriamento || page.resfriamento,
          aplicacoes: parts.aplicacoes || page.aplicacoes,
          extras,
        } as any);
      }
    }

    let generated: any = null;
    if (generateImages && page) {
      try {
        generated = await generateAndUploadVitrineImages({ page, keys: ["hero"] });
        const mergedImages = { ...(page.images || {}), ...(generated.images || {}) };
        const mergedPrompts = { ...(page.image_prompts || {}), ...(generated.image_prompts || {}) };
        page = await updateVitrinePage(page.id, { images: mergedImages, image_prompts: mergedPrompts } as any);
      } catch (e: any) {
        generated = { error: e?.message || "Falha ao gerar imagens" };
      }
    }

    return NextResponse.json({
      success: true,
      slug,
      slugAvailable: isUnique,
      parts,
      extras,
      source_url: isUrl ? input : "",
      page,
      copy,
      scraped: {
        images: scrapedImages,
      },
      generated,
      diagnostics: getVitrineImageGenerationDiagnostics(),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Falha ao identificar peças" }, { status: 500 });
  }
}
