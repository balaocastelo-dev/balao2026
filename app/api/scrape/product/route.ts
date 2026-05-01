import { NextResponse } from "next/server";
import { formatImportedProductDescription } from "@/lib/ai-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string" || !url.includes("kabum.com.br")) {
      return NextResponse.json(
        { error: "URL inválida ou não suportada. Apenas Kabum é suportado no momento." },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar a página: ${response.statusText}`);
    }

    const html = await response.text();

    const replaceBrand = (text: string) => {
      if (!text) return text;
      const brands = [/kabum/gi, /tob pc´s/gi, /tob/gi, /alligator shop/gi, /mrp informática/gi];

      let cleanedText = text;
      brands.forEach((regex) => {
        cleanedText = cleanedText.replace(regex, "Balão.info");
      });

      return cleanedText;
    };

    const normalizeKabumImage = (imgUrl: string) => {
      const withoutQuery = imgUrl.split("?")[0].trim();
      return withoutQuery.replace(/_(m|p|peq)\.(jpg|jpeg|png|webp)$/i, "_g.$2");
    };

    const productIdMatch = url.match(/\/produto\/(\d+)\//);
    let uniqueImages: string[] = [];
    if (productIdMatch) {
      const productId = productIdMatch[1];
      const imageRegex = new RegExp(
        `https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+\\.(?:jpg|jpeg|png|webp)`,
        "gi"
      );
      const matches = html.match(imageRegex) || [];
      const normalized = matches.flatMap((m) => {
        const original = m.trim();
        const upgraded = normalizeKabumImage(original);
        return upgraded !== original ? [upgraded, original] : [original];
      });
      uniqueImages = Array.from(new Set(normalized)).map((img) => img.trim());
    }

    let description = "";
    let productName = "";
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        if (json["@type"] === "Product") {
          if (typeof json.name === "string") productName = json.name;
          if (typeof json.description === "string") description = json.description;
          if (description) break;
        }
      } catch {}
    }

    let specs: Record<string, string> = {};
    const specsSectionMatch = html.match(/Informações Técnicas([\s\S]*?)(?:<section|<\/main|$)/i);
    if (specsSectionMatch) {
      const specsContent = specsSectionMatch[1];
      const pairRegex = /(?:- |<b>|<strong>)([^<:]+):?\s*(?:<\/b>|<\/strong>)?\s*([^<\n\r]+)/gi;
      while ((match = pairRegex.exec(specsContent)) !== null) {
        const key = match[1].trim().replace(/^- /, "").replace(/:$/, "");
        const value = match[2].trim();
        if (key && value && key.length < 50 && value.length < 500) {
          specs[key] = value;
        }
      }
    }

    if (Object.keys(specs).length === 0) {
      const tableRegex = /<tr[^>]*>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<\/tr>/gi;
      while ((match = tableRegex.exec(html)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (key && value) specs[key] = value;
      }
    }

    const finalDescription = replaceBrand(description);
    const finalSpecs: Record<string, string> = {};
    Object.entries(specs).forEach(([key, value]) => {
      finalSpecs[replaceBrand(key)] = replaceBrand(value);
    });

    const { description: formattedDescription } = await formatImportedProductDescription({
      productName: replaceBrand(productName),
      description: finalDescription,
    });

    return NextResponse.json({
      success: true,
      images: uniqueImages,
      description: formattedDescription || finalDescription,
      specs: finalSpecs,
      count: uniqueImages.length,
    });
  } catch (e: any) {
    console.error("Scrape Error:", e);
    return NextResponse.json(
      { success: false, error: e?.message || "Erro ao extrair dados" },
      { status: 500 }
    );
  }
}
