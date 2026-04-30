import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('kabum.com.br')) {
      return NextResponse.json({ error: 'URL inválida ou não suportada. Apenas Kabum é suportado no momento.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar a página: ${response.statusText}`);
    }

    const html = await response.text();
    
    // 1. Extract Images
    const productIdMatch = url.match(/\/produto\/(\d+)\//);
    let uniqueImages: string[] = [];
    if (productIdMatch) {
        const productId = productIdMatch[1];
        const imageRegex = new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+_g\\.jpg`, 'g');
        const matches = html.match(imageRegex) || [];
        uniqueImages = Array.from(new Set(matches)).map(img => img.trim());
    }

    // 2. Extract Description via JSON-LD
    let description = "";
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
            const json = JSON.parse(match[1]);
            if (json['@type'] === 'Product' && json.description) {
                description = json.description;
                break;
            }
        } catch (e) {}
    }

    // 3. Extract Technical Specs
    // Kabum often uses a specific structure for specs. We'll try to find the section and extract key-values.
    let specs: Record<string, string> = {};
    
    // Try to find the technical info section
    const specsSectionMatch = html.match(/Informações Técnicas([\s\S]*?)(?:<section|<\/main|$)/i);
    if (specsSectionMatch) {
        const specsContent = specsSectionMatch[1];
        // Look for common patterns like - Key: Value or <b>Key:</b> Value
        const pairRegex = /(?:- |<b>|<strong>)([^<:]+):?\s*(?:<\/b>|<\/strong>)?\s*([^<\n\r]+)/gi;
        let pMatch;
        while ((match = pairRegex.exec(specsContent)) !== null) {
            const key = match[1].trim().replace(/^- /, '').replace(/:$/, '');
            const value = match[2].trim();
            if (key && value && key.length < 50 && value.length < 500) {
                specs[key] = value;
            }
        }
    }

    // If specs are empty, try another common pattern
    if (Object.keys(specs).length === 0) {
        const tableRegex = /<tr[^>]*>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<\/tr>/gi;
        while ((match = tableRegex.exec(html)) !== null) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (key && value) specs[key] = value;
        }
    }

    return NextResponse.json({ 
      success: true, 
      images: uniqueImages,
      description: description,
      specs: specs,
      count: uniqueImages.length
    });

  } catch (e: any) {
    console.error("Scrape Error:", e);
    return NextResponse.json({ success: false, error: e.message || 'Erro ao extrair dados' }, { status: 500 });
  }
}
