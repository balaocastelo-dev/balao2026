import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    const inputUrl = String(url || '').trim();
    if (!inputUrl || !/^https?:\/\//i.test(inputUrl)) {
      return NextResponse.json({ error: 'URL inválida.' }, { status: 400 });
    }

    const response = await fetch(inputUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        pragma: 'no-cache',
        'cache-control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar a página: ${response.statusText}`);
    }

    const html = await response.text();
    const isKabum = /kabum\.com\.br/i.test(inputUrl);
    
    // 1. Extract Images
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    const probeImage = async (imgUrl: string) => {
      try {
        const res = await fetch(imgUrl, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Range: 'bytes=0-262143'
          }
        });
        if (!res.ok) return { ok: false as const };

        const contentType = res.headers.get('content-type') || '';
        if (contentType && !contentType.toLowerCase().startsWith('image/')) return { ok: false as const };

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 15000) return { ok: false as const };

        const meta = await sharp(buf).metadata().catch(() => null);
        if (!meta?.width || !meta?.height) return { ok: false as const };
        if (Math.min(meta.width, meta.height) < 600) return { ok: false as const };

        return { ok: true as const, url: imgUrl };
      } catch {
        return { ok: false as const };
      }
    };

    const toKabumOriginalUrl = (rawUrl: string) => {
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

    const toKabumGUrl = (rawUrl: string) => {
      const trimmed = rawUrl.trim();
      try {
        const u = new URL(trimmed);
        u.pathname = u.pathname.replace(/_(m|p|peq|original)\.jpg$/i, '_g.jpg');
        u.search = '';
        return u.toString();
      } catch {
        return trimmed.replace(/_(m|p|peq|original)\.jpg$/i, '_g.jpg');
      }
    };

    const normalizeMiraklToXlarge = (rawUrl: string) => {
      const trimmed = rawUrl.trim();
      try {
        const u = new URL(trimmed);
        const parts = u.pathname.split('/').filter(Boolean);
        const sizeIndex = parts.findIndex(p => p.toLowerCase() === 'small' || p.toLowerCase() === 'medium' || p.toLowerCase() === 'large' || p.toLowerCase() === 'xlarge' || p.toLowerCase() === 'mini' || p.toLowerCase() === 'thumb' || p.toLowerCase() === 'thumbnail');
        if (sizeIndex >= 0) parts[sizeIndex] = 'xlarge';
        u.pathname = `/${parts.join('/')}`;
        u.search = '';
        return u.toString();
      } catch {
        return trimmed.replace(/\/(small|medium|large|mini|thumb|thumbnail)\//i, '/xlarge/');
      }
    };

    const tryMiraklWithHostFallback = async (miraklUrl: string) => {
      const normalized = normalizeMiraklToXlarge(miraklUrl);
      let base: URL;
      try {
        base = new URL(normalized);
      } catch {
        return null;
      }

      const hostMatch = base.hostname.match(/^images(\d)\.kabum\.com\.br$/i);
      const preferred = hostMatch?.[1] ? [hostMatch[1]] : [];
      const digits = Array.from({ length: 10 }, (_, i) => String(i));
      const orderedDigits = Array.from(new Set([...preferred, '7', ...digits]));

      for (const d of orderedDigits) {
        const candidate = new URL(base.toString());
        candidate.hostname = `images${d}.kabum.com.br`;
        const probed = await probeImage(candidate.toString());
        if (probed.ok) return probed.url;
      }

      return null;
    };

    const uniqueImages: string[] = [];
    if (isKabum) {
      const productIdMatch = inputUrl.match(/\/produto\/(\d+)\//);
      const productId = productIdMatch?.[1] || null;

      const classicMatches = productId
        ? (html.match(new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+?\\.(?:jpg|jpeg|png|webp)`, 'gi')) || [])
        : [];

      const miraklMatches = html.match(/https:\/\/images\d+\.kabum\.com\.br\/produtos\/fotos\/sync_mirakl\/\d+\/[^"'\s]+/gi) || [];

      const originalCandidates = Array.from(new Set(classicMatches.map(toKabumOriginalUrl)));
      for (const img of originalCandidates) {
        if (uniqueImages.length >= 20) break;
        const probed = await probeImage(img);
        if (probed.ok) uniqueImages.push(probed.url);
      }

      if (uniqueImages.length === 0 && miraklMatches.length > 0) {
        const uniqueMirakl = Array.from(new Set(miraklMatches.map(normalizeMiraklToXlarge)));
        for (const img of uniqueMirakl) {
          if (uniqueImages.length >= 20) break;
          const resolved = await tryMiraklWithHostFallback(img);
          if (resolved) uniqueImages.push(resolved);
        }
      }

      if (uniqueImages.length === 0 && classicMatches.length > 0) {
        const gCandidates = Array.from(new Set(classicMatches.map(toKabumGUrl)));
        for (const img of gCandidates) {
          if (uniqueImages.length >= 20) break;
          const probed = await probeImage(img);
          if (probed.ok) uniqueImages.push(probed.url);
        }
      }
    }

    const extractJsonLdBlocks = (raw: string) => {
      const blocks: unknown[] = [];
      const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let m: RegExpExecArray | null = null;
      while ((m = jsonLdRegex.exec(raw)) !== null) {
        const t = String(m[1] || '').trim();
        if (!t) continue;
        try {
          blocks.push(JSON.parse(t));
        } catch {}
      }
      return blocks;
    };

    const findProductJsonLd = (blocks: unknown[]): any | null => {
      const visit = (node: any): any | null => {
        if (!node) return null;
        if (Array.isArray(node)) {
          for (const it of node) {
            const found = visit(it);
            if (found) return found;
          }
          return null;
        }
        if (typeof node !== 'object') return null;
        const t = node['@type'];
        if (typeof t === 'string' && t.toLowerCase() === 'product') return node;
        if (Array.isArray(t) && t.some((x: any) => String(x).toLowerCase() === 'product')) return node;
        if (node['@graph']) return visit(node['@graph']);
        return null;
      };
      for (const b of blocks) {
        const found = visit(b as any);
        if (found) return found;
      }
      return null;
    };

    const jsonLdBlocks = extractJsonLdBlocks(html);
    const productJson = findProductJsonLd(jsonLdBlocks);

    const pickOffer = (offers: any) => {
      if (!offers) return null;
      if (Array.isArray(offers)) return offers[0] || null;
      return offers;
    };

    // 2. Extract Description / Title / Price via JSON-LD (fallbacks)
    let title = "";
    let description = "";
    let price: number | null = null;
    let currency: string | null = null;
    if (productJson) {
      if (typeof productJson.name === 'string') title = String(productJson.name || '').trim();
      const offers = pickOffer(productJson.offers);
      if (offers) {
        const rawPrice = offers.price ?? offers.lowPrice ?? offers.highPrice;
        const parsed = typeof rawPrice === 'string' ? Number(String(rawPrice).replace(/\./g, '').replace(',', '.')) : Number(rawPrice);
        if (Number.isFinite(parsed)) price = parsed;
        if (typeof offers.priceCurrency === 'string') currency = offers.priceCurrency;
      }
      if (typeof productJson.description === 'string') description = String(productJson.description || '').trim();

      const img = productJson.image;
      const imgs = Array.isArray(img) ? img : img ? [img] : [];
      for (const i of imgs) {
        const u = String(i || '').trim();
        if (!u) continue;
        if (!uniqueImages.includes(u)) uniqueImages.push(u);
      }
    }
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (ogImageMatch?.[1] && !uniqueImages.includes(ogImageMatch[1])) uniqueImages.push(ogImageMatch[1]);

    const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (twitterImageMatch?.[1] && !uniqueImages.includes(twitterImageMatch[1])) uniqueImages.push(twitterImageMatch[1]);

    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (!title && ogTitleMatch?.[1]) title = ogTitleMatch[1].trim();

    const titleTagMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!title && titleTagMatch?.[1]) title = titleTagMatch[1].replace(/\s+/g, ' ').trim();

    if (!description) {
      const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
      if (metaDescMatch?.[1]) description = metaDescMatch[1].trim();
    }

    if (!Number.isFinite(price as any)) {
      const brlRegex = /R\$\s*([\d\.\,]+)/i;
      const m = html.match(brlRegex);
      if (m?.[1]) {
        const normalized = m[1].replace(/\./g, '').replace(',', '.');
        const parsed = Number(normalized);
        if (Number.isFinite(parsed)) price = parsed;
      }
    }
    // 3. Extract Technical Specs
    // Kabum often uses a specific structure for specs. We'll try to find the section and extract key-values.
    
    // Try to find the technical info section
    if (isKabum) {
      const specsSectionMatch = html.match(/Informações Técnicas([\s\S]*?)(?:<section|<\/main|$)/i);
      if (specsSectionMatch) {
          const specsContent = specsSectionMatch[1];
          const pairRegex = /(?:- |<b>|<strong>)([^<:]+):?\s*(?:<\/b>|<\/strong>)?\s*([^<\n\r]+)/gi;
          let match: RegExpExecArray | null = null;
          while ((match = pairRegex.exec(specsContent)) !== null) {
              const key = match[1].trim().replace(/^- /, '').replace(/:$/, '');
              const value = match[2].trim();
              if (key && value && key.length < 50 && value.length < 500) {
                  specs[key] = value;
              }
          }
      }
    }
    // If specs are empty, try another common pattern
    if (Object.keys(specs).length === 0) {
        const tableRegex = /<tr[^>]*>\s*(?:<t[hd][^>]*>\s*([^<]+?)\s*<\/t[hd]>\s*){1,2}<t[hd][^>]*>\s*([^<]+?)\s*<\/t[hd]>\s*<\/tr>/gi;
        let match: RegExpExecArray | null = null;
        while ((match = tableRegex.exec(html)) !== null) {
            const key = String(match[1] || '').trim();
            const value = String(match[2] || '').trim();
            if (key && value && key.length < 80 && value.length < 800) specs[key] = value;
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

    const finalTitle = replaceBrand(title);
    const finalDescription = replaceBrand(description);
    const finalSpecs: Record<string, string> = {};
    Object.entries(specs).forEach(([key, value]) => {
        finalSpecs[replaceBrand(key)] = replaceBrand(value);
    });

    return NextResponse.json({ 
      success: true, 
      images: uniqueImages,
      title: finalTitle,
      price: typeof price === 'number' && Number.isFinite(price) ? price : null,
      currency: currency || (price != null ? 'BRL' : null),
      description: finalDescription,
      specs: finalSpecs,
      count: uniqueImages.length
    });

  } catch (e: any) {
    console.error("Scrape Error:", e);
    return NextResponse.json({ success: false, error: e.message || 'Erro ao extrair dados' }, { status: 500 });
  }
}
