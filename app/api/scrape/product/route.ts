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
        const imageRegex = new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+?\\.jpg`, 'gi');
        const matches = html.match(imageRegex) || [];

        const toOriginalKabumImageUrl = (rawUrl: string) => {
          const trimmed = rawUrl.trim();
          try {
            const u = new URL(trimmed);
            const p = u.pathname;
            let nextPath = p.replace(/_(m|p|peq|g)\.jpg$/i, '_original.jpg');
            if (nextPath === p && /\.jpg$/i.test(p) && !/_original\.jpg$/i.test(p)) {
              nextPath = p.replace(/\.jpg$/i, '_original.jpg');
            }
            u.pathname = nextPath;
            u.search = '';
            return u.toString();
          } catch {
            let next = trimmed.replace(/_(m|p|peq|g)\.jpg$/i, '_original.jpg');
            if (next === trimmed && /\.jpg$/i.test(trimmed) && !/_original\.jpg$/i.test(trimmed)) {
              next = trimmed.replace(/\.jpg$/i, '_original.jpg');
            }
            return next;
          }
        };

        const existsImage = async (imgUrl: string) => {
          try {
            const head = await fetch(imgUrl, {
              method: 'HEAD',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            if (head.ok) return true;

            const get = await fetch(imgUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                Range: 'bytes=0-0'
              }
            });
            return get.ok;
          } catch {
            return false;
          }
        };

        const originals = Array.from(new Set(matches)).map(toOriginalKabumImageUrl);
        const validatedOriginals: string[] = [];

        for (const img of originals) {
          if (validatedOriginals.length >= 20) break;
          if (await existsImage(img)) validatedOriginals.push(img);
        }

        if (validatedOriginals.length > 0) {
          uniqueImages = validatedOriginals;
        } else {
          uniqueImages = Array.from(new Set(matches))
            .map(img => img.trim().replace(/_(m|p|peq)\.jpg$/i, '_g.jpg'));
        }
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

    // 4. Clean and Replace Brands
    const replaceBrand = (text: string) => {
        if (!text) return text;
        // List of brands to replace with "Balão.info"
        const brands = [
            /kabum/gi,
            /tob pc´s/gi,
            /tob/gi,
            /alligator shop/gi,
            /mrp informática/gi
        ];
        
        let cleanedText = text;
        brands.forEach(regex => {
            cleanedText = cleanedText.replace(regex, "Balão.info");
        });
        
        return cleanedText;
    };

    const finalDescription = replaceBrand(description);
    const finalSpecs: Record<string, string> = {};
    Object.entries(specs).forEach(([key, value]) => {
        finalSpecs[replaceBrand(key)] = replaceBrand(value);
    });

    return NextResponse.json({ 
      success: true, 
      images: uniqueImages,
      description: finalDescription,
      specs: finalSpecs,
      count: uniqueImages.length
    });

  } catch (e: any) {
    console.error("Scrape Error:", e);
    return NextResponse.json({ success: false, error: e.message || 'Erro ao extrair dados' }, { status: 500 });
  }
}
