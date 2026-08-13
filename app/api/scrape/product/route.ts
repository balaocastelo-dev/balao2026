import { NextResponse } from 'next/server';
import sharp from 'sharp';

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
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    const probeImage = async (imgUrl: string) => {
      try {
        const res = await fetch(imgUrl, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            Range: 'bytes=0-131071'
          }
        });
        if (!res.ok) return { ok: false as const };

        const contentType = res.headers.get('content-type') || '';
        if (contentType && !contentType.toLowerCase().startsWith('image/')) return { ok: false as const };

        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 1500) return { ok: false as const };

        const meta = await sharp(buf).metadata().catch(() => null);
        if (meta?.width && meta?.height) {
          if (Math.min(meta.width, meta.height) < 80) return { ok: false as const };
        }

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
      const orderedDigits = Array.from(new Set([...preferred, '7', '4', '8', '9', '5']));

      const tasks = orderedDigits.map(async (d) => {
        try {
          const candidate = new URL(base.toString());
          candidate.hostname = `images${d}.kabum.com.br`;
          const probed = await probeImage(candidate.toString());
          return probed.ok ? probed.url : null;
        } catch { return null; }
      });
      const results = await Promise.all(tasks);
      for (const ok of results) if (ok) return ok;
      return null;
    };

    const productIdMatch = url.match(/\/produto\/(\d+)\//);
    const productId = productIdMatch?.[1] || null;

    const classicMatches = productId
      ? (html.match(new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+?\\.(?:jpg|jpeg|png|webp)`, 'gi')) || [])
      : [];

    const miraklMatches = html.match(/https:\/\/images\d+\.kabum\.com\.br\/produtos\/fotos\/sync_mirakl\/\d+\/[^"'\s]+/gi) || [];

    const uniqueImages: string[] = [];
    const seen = new Set<string>();
    const pushUnique = (u: string) => {
      if (!u) return;
      const k = u.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      uniqueImages.push(u);
    };
    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
      Promise.race([p, new Promise<null>(r => setTimeout(() => r(null), ms))]);

    const originalCandidates = Array.from(new Set(classicMatches.map(toKabumOriginalUrl))).filter(u => !seen.has(u.toLowerCase()));
    {
      const tasks = originalCandidates.slice(0, 40).map(img => withTimeout(probeImage(img), 3500));
      const results = await Promise.all(tasks);
      for (const r of results) {
        if (r && (r as any).ok) pushUnique((r as any).url);
        if (uniqueImages.length >= 20) break;
      }
    }

    if (uniqueImages.length === 0 && miraklMatches.length > 0) {
      const uniqueMirakl = Array.from(new Set(miraklMatches.map(normalizeMiraklToXlarge))).filter(u => !seen.has(u.toLowerCase()));
      const tasks = uniqueMirakl.slice(0, 40).map(img => withTimeout(tryMiraklWithHostFallback(img), 7000));
      const results = await Promise.all(tasks);
      for (const r of results) {
        if (r) pushUnique(r);
        if (uniqueImages.length >= 20) break;
      }
    }

    if (uniqueImages.length === 0 && classicMatches.length > 0) {
      const gCandidates = Array.from(new Set(classicMatches.map(toKabumGUrl))).filter(u => !seen.has(u.toLowerCase()));
      const tasks = gCandidates.slice(0, 40).map(img => withTimeout(probeImage(img), 3500));
      const results = await Promise.all(tasks);
      for (const r of results) {
        if (r && (r as any).ok) pushUnique((r as any).url);
        if (uniqueImages.length >= 20) break;
      }
    }

    // 1b. Enriquecedor incremental: gera N fotos a partir de "foto_1234567890.jpg" -> 1234567891..99
    if (uniqueImages.length < 10) {
      const seedUrls: string[] = Array.from(new Set([...classicMatches, ...miraklMatches]));
      if (seedUrls.length === 0 && uniqueImages.length > 0) seedUrls.push(uniqueImages[0]);
      for (const seed of seedUrls) {
        if (uniqueImages.length >= 10) break;
        try {
          const u = new URL(seed);
          const filename = u.pathname.split('/').pop() || '';
          const m = filename.match(/(_)(\d{8,})(\.(?:jpg|jpeg|png|webp|gif))/i);
          if (!m) continue;
          const sep = m[1];
          const baseNum = Number(m[2]);
          const ext = m[3];
          if (!Number.isFinite(baseNum)) continue;

          const baseWithout = filename.slice(0, m.index) + sep;
          const parentPath = u.pathname.slice(0, u.pathname.length - filename.length);

          const variants: number[] = [];
          for (let i = 1; i <= 6; i++) variants.push(baseNum + i);
          for (let i = 1; i <= 2; i++) variants.push(baseNum - i);

          const candidateUrls: string[] = [];
          for (const vNum of variants) {
            if (uniqueImages.length + candidateUrls.length >= 10) break;
            const newFilename = baseWithout + String(vNum).padStart(m[2].length, '0') + ext;
            const candidate = new URL(u.toString());
            candidate.pathname = parentPath + newFilename;
            candidate.search = '';
            const urlStr = candidate.toString();
            if (seen.has(urlStr.toLowerCase())) continue;
            candidateUrls.push(urlStr);
          }

          const probeTasks = candidateUrls.map(async (cand) => {
            try {
              if (normalizeMiraklToXlarge(seed) !== seed) {
                const miraklNorm = normalizeMiraklToXlarge(cand);
                return withTimeout(tryMiraklWithHostFallback(miraklNorm), 7000);
              } else {
                const p = await withTimeout(probeImage(toKabumOriginalUrl(cand)), 3500);
                return p && (p as any).ok ? (p as any).url : null;
              }
            } catch { return null; }
          });

          const results = await Promise.all(probeTasks);
          for (const ok of results) {
            if (!ok) continue;
            if (uniqueImages.length >= 10) break;
            pushUnique(ok as string);
          }
        } catch {}
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
        const brands = [
            /\bconnect\s*barra\s*inform[aá]tica\b/gi,
            /\bkalango[-\s]*games\b/gi,
            /\b3green[-\s]*force\b/gi,
            /\b3green\b/gi,
            /\bklv[-\s]*notebook\b/gi,
            /\bskill\b/gi,
            /\bnext[-\s]*pc\b/gi,
            /\bnextpc\b/gi,
            /\bmax[-\s]*elite\b/gi,
            /\bdream[-\s]*computers?\b/gi,
            /\bdreamcomputers\b/gi,
            /\binfotech\b/gi,
            /\bprime[-\s]*shock!?\b/gi,
            /\bmulti[-\s]*pc\b/gi,
            /\bmultipc\b/gi,
            /\bneologic\b/gi,
            /\bi[-\s]*buy[-\s]*power\b/gi,
            /\bibuypower\b/gi,
            /\balpha[-\s]*pcs?\b/gi,
            /\balphapcs\b/gi,
            /\bstudio[-\s]*pc\b/gi,
            /\bstudiopc\b/gi,
            /\btop[-\s]*pc\b/gi,
            /\btoppc\b/gi,
            /kabum/gi,
            /\btob\s*pc[’'´`]?s\b/gi,
            /tob/gi,
            /alligator shop/gi,
            /mrp inform[aá]tica/gi
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
