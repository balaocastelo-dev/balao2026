export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  slug: string;
  cost?: number;
  supplier?: string;
  video_url?: string;
  description?: string;
  specs?: Record<string, any>;
  created_at?: string;
  product_url?: string;
  image_urls?: string[];
  imageValid?: boolean;
  ai_status?: "thinking" | "done" | "error";
}

export function getProductHref(product: Pick<Product, "id" | "slug" | "product_url">): string {
  const productUrl = typeof product.product_url === "string" ? product.product_url.trim() : "";
  if (productUrl.startsWith("/")) return productUrl;

  const slug = typeof product.slug === "string" ? product.slug.trim() : "";
  const id = typeof product.id === "string" ? product.id.trim() : "";
  return `/product/${slug || id}`;
}

export interface UsedNotebook {
  id: string;
  name: string;
  model: string;
  processor: string;
  ram: string;
  storage: string;
  gpu?: string;
  battery: string;
  price: number;
  cart_url: string;
  image_urls: string[];
  video_url?: string;
  created_at?: string;
  highlight?: boolean;
}

export interface CarouselImage {
  id: string;
  image_url: string;
  title?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    device_origin?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  icon?: string;
  active: boolean;
  children?: Category[]; // For frontend tree structure
}

export interface HomeBlock {
  id: string;
  category_id: string;
  title?: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiration_date?: string;
  max_uses?: number;
  current_uses: number;
  status: 'active' | 'inactive';
  min_purchase_value: number;
  applicable_products?: string[]; // IDs
  applicable_categories?: string[]; // Slugs or Names
  created_at?: string;
  updated_at?: string;
}

export type BlogPostStatus = "draft" | "published" | "archived";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  content_html: string;
  cover_image?: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category?: string | null;
  canonical_url?: string | null;
  source_url: string | null;
  source_site: string | null;
  source_title: string | null;
  source_published_at: string | null;
  language: string;
  tags: string[];
  keywords: string[];
  json_ld?: any;
  reading_time_minutes?: number | null;
  status: BlogPostStatus | string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES = [
  "Todos os Produtos",
  "Computadores & Informática",
  "Monitores & Displays",
  "Apple",
  "Games & Consoles",
  "Smartphones & Tablets",
  "Áudio",
  "TV & Vídeo",
  "Rede & Conectividade",
  "Impressão & Digitalização",
  "Casa Inteligente",
  "Acessórios",
  "Armazenamento",
  "Escritório & Ergonomia",
  "Segurança & Energia"
];

export function enhanceImageUrl(url: string): string {
  let enhancedUrl = url;

  try {
    // 0. Remove common query parameters that limit size
    const urlObj = new URL(enhancedUrl);
    const paramsToDelete = ['w', 'width', 'h', 'height', 'quality', 'q', 'resize', 'size'];
    paramsToDelete.forEach(param => urlObj.searchParams.delete(param));
    enhancedUrl = urlObj.toString();
  } catch (e) {
    // Continue if URL parsing fails
  }

  // 1. Kabum: _m, _p, _peq -> _g
  if (enhancedUrl.includes('kabum.com.br')) {
    enhancedUrl = enhancedUrl.replace(/_(m|p|peq)\./g, '_g.');
  }

  // 2. Terabyte: _t or _small -> _g
  if (enhancedUrl.includes('terabyteshop.com.br')) {
    enhancedUrl = enhancedUrl.replace(/(_t|_small)\./g, '_g.');
  }

  // 3. Amazon: remove ._SX..._ and ._AC_ and ._SS..._
  if (enhancedUrl.includes('amazon.com') || enhancedUrl.includes('media-amazon.com')) {
    enhancedUrl = enhancedUrl.replace(/\._[S|A][X|C|S]\d+_|\._[S|A][X|C|S]_/g, '');
  }

  // 4. Mercado Livre: -O / -I -> -F / -V (High res)
  if (enhancedUrl.includes('mercadolivre.com') || enhancedUrl.includes('mlstatic.com')) {
    // Try to force high resolution suffix if present, or remove low res indicators
    enhancedUrl = enhancedUrl.replace(/-(O|I|T)\./g, '-F.');
    enhancedUrl = enhancedUrl.replace(/-thumb\./g, '-F.');
  }

  // 5. Generic: Remove common thumbnail suffixes before extension
  // Matches: -thumb.jpg, _small.png, .100x100.jpg
  enhancedUrl = enhancedUrl.replace(/[-_](thumb|small|mini|tiny|icon)\./gi, '.');
  enhancedUrl = enhancedUrl.replace(/[-_]\d+x\d+\./g, '.');

  return enhancedUrl;
}

export function isLowResolution(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Check for common thumbnail keywords
  const lowResKeywords = ['thumb', 'thumbnail', 'small', 'mini', 'tiny', 'icon', '50x50', '100x100', '150x150', 'w=100', 'h=100'];
  if (lowResKeywords.some(keyword => lowerUrl.includes(keyword))) {
    return true;
  }

  // Amazon specific check: _SX or _SS < 500
  // Pattern: ._SX300_.jpg or ._SS400_.jpg
  const amazonMatch = url.match(/\._(SX|SS)(\d+)_/);
  if (amazonMatch) {
    const size = parseInt(amazonMatch[2], 10);
    if (size < 600) return true; // Increased threshold
  }
  
  // Generic size check in filename (e.g., image-200x200.jpg)
  const sizeMatch = url.match(/[-_](\d+)x(\d+)\./);
  if (sizeMatch) {
    const width = parseInt(sizeMatch[1], 10);
    const height = parseInt(sizeMatch[2], 10);
    if (width < 400 || height < 400) return true;
  }

  return false;
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const allCategories: Category[] = [];
  const seen = new Set<string>();

  const visit = (cat: Category) => {
    if (!cat?.id || seen.has(cat.id)) return;
    seen.add(cat.id);
    allCategories.push(cat);
    (cat.children || []).forEach(visit);
  };

  categories.forEach(visit);

  const map: Record<string, Category> = {};
  const roots: Category[] = [];
  
  // Clone to avoid mutating original objects if needed, 
  // and initialize children array
  allCategories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  allCategories.forEach(cat => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children?.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  const normalize = (s: unknown) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .trim();

  // Recursive sort alphabetically (pt-BR friendly)
  const sortRecursive = (nodes: Category[]) => {
    nodes.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name), "pt-BR"));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
          sortRecursive(node.children);
      }
    });
  };

  sortRecursive(roots);
  return roots;
}

export function parsePriceToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value).trim();
  if (!raw) return 0;

  const cleaned = raw
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.\-]/g, "");

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(",", ".");
  }

  const num = Number.parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

export type ColumnRole =
  | "product_url"
  | "image"
  | "name"
  | "price"
  | "category"
  | "ignore";

export type ColumnMapping = Record<number, ColumnRole>;

export interface ExtractedRaw {
  columns: string[][];
  headers: string[] | null;
  detectedColumnCount: number;
}

export function extractRawColumns(text: string): ExtractedRaw {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const allColumns: string[][] = [];
  let maxCols = 0;

  for (const line of lines) {
    const cols = line.split("\t").map(c => c.trim());
    if (cols.length > 0) {
      allColumns.push(cols);
      if (cols.length > maxCols) maxCols = cols.length;
    }
  }

  if (maxCols === 0) return { columns: [], headers: null, detectedColumnCount: 0 };

  const looksLikeHeaderLine = (columns: string[]): boolean => {
    if (!columns || columns.length === 0) return true;
    const hasAnyHttp = columns.some(c => /^https?:\/\//i.test(String(c || "").trim()));
    if (hasAnyHttp) return false;
    const hasAlphabetic = columns.some(c => /[a-zA-ZçÇáàâãéêíóôõúü]/.test(String(c || "").trim()));
    const hasNoNumericPrice = !columns.some(c => /(?:R\$\s*)?\d{1,3}(?:[.,]\d+)+/.test(String(c || "").trim()));
    return hasAlphabetic && hasNoNumericPrice;
  };

  let headers: string[] | null = null;
  let startIdx = 0;
  if (allColumns.length > 0 && looksLikeHeaderLine(allColumns[0])) {
    headers = allColumns[0].slice();
    while (headers.length < maxCols) headers.push("");
    startIdx = 1;
  }

  const dataColumns = allColumns.slice(startIdx).map(row => {
    const copy = row.slice();
    while (copy.length < maxCols) copy.push("");
    return copy;
  }).filter(row => row.some(cell => cell !== ""));

  return {
    columns: dataColumns,
    headers,
    detectedColumnCount: maxCols,
  };
}

const __isLikelyPrice = (value: unknown): boolean => {
  const raw = String(value || "").trim();
  if (!raw) return false;
  if (/^R\$\s*\d/i.test(raw)) return true;
  if (/^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^\d+(?:,\d{1,2})?$/.test(raw) && /\d/.test(raw)) return true;
  if (/^\d+\.\d{2}$/.test(raw)) return true;
  return false;
};

const __isLikelyImageUrl = (value: unknown): boolean => {
  const raw = String(value || "").trim();
  if (!/^https?:\/\//i.test(raw)) return false;
  if (/\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)(?:[?#]|$)/i.test(raw)) return true;
  return /image|img|foto|produto|photo|picture|medium|large|original|media|images\./i.test(raw);
};

const __isLikelyProductUrl = (value: unknown): boolean => {
  const raw = String(value || "").trim();
  if (!/^https?:\/\//i.test(raw)) return false;
  if (__isLikelyImageUrl(raw)) return false;
  return /\/produto\//i.test(raw)
    || /\/product\//i.test(raw)
    || /\/p\//i.test(raw)
    || /\/dp\//i.test(raw)
    || /\/categoria\//i.test(raw) === false;
};

export function autoGuessMapping(raw: ExtractedRaw): ColumnMapping {
  const { columns, headers, detectedColumnCount } = raw;
  const mapping: ColumnMapping = {};
  for (let i = 0; i < detectedColumnCount; i++) mapping[i] = "ignore";
  if (detectedColumnCount === 0 || columns.length === 0) return mapping;

  const sampleSize = Math.min(25, columns.length);
  const sample = columns.slice(0, sampleSize);

  const score = (idx: number) => {
    let s = { product_url: 0, image: 0, name: 0, price: 0, category: 0 };
    if (headers && headers[idx]) {
      const h = String(headers[idx]).toLowerCase();
      if (/prod(uto)?.*(url|link)|href|link|product/i.test(h)) s.product_url += 25;
      if (/img|image|foto|picture|src|photo|thumb|imagem/i.test(h)) s.image += 25;
      if (/nome|t[ií]tulo|prod(uto)?\s*$|name|title|descri[cç][aã]o\s*curta/i.test(h)) s.name += 25;
      if (/pre[cç]o|price|valor|custo|r\$/i.test(h)) s.price += 25;
      if (/categ(oria)?|cat\b|grupo|departamento|classif/i.test(h)) s.category += 25;
    }
    for (const row of sample) {
      const v = row[idx] || "";
      if (!v) continue;
      if (__isLikelyImageUrl(v)) s.image += 6;
      if (__isLikelyProductUrl(v)) s.product_url += 6;
      if (__isLikelyPrice(v)) s.price += 6;
      if (v.length > 15 && !/^http/i.test(v) && !__isLikelyPrice(v)) s.name += 2;
      if (/[->]|\b(?:hardware|software|acessorio|acessórios|periferico|notebook|monitor|fonte|memória|memoria|processador|gabinete|placa|ssd|hd|armazenamento)\b/i.test(v)) s.category += 3;
      if (v.length <= 80 && v.length > 2 && /[a-zA-Záàâãéêíóôõúü]/.test(v) && !/^http/i.test(v) && !__isLikelyPrice(v) && !v.includes(",")) s.category += 1;
    }
    return s;
  };

  const scores = Array.from({ length: detectedColumnCount }, (_, i) => ({ i, s: score(i) }));

  const pickBest = (role: ColumnRole, usedIdx: Set<number>): number => {
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (const { i, s } of scores) {
      if (usedIdx.has(i)) continue;
      const val = (s as any)[role] as number;
      if (val > bestScore) { bestScore = val; bestIdx = i; }
    }
    if (bestScore > 0) return bestIdx;
    return -1;
  };

  const used = new Set<number>();
  const tryAssign = (role: ColumnRole) => {
    const idx = pickBest(role, used);
    if (idx !== -1) { mapping[idx] = role; used.add(idx); }
  };

  tryAssign("price");
  tryAssign("image");
  tryAssign("product_url");
  tryAssign("name");
  tryAssign("category");

  const assignDefaultsByPosition = () => {
    const available: number[] = [];
    for (let i = 0; i < detectedColumnCount; i++) if (!used.has(i)) available.push(i);
    if (available.length === 0) return;

    const need: ColumnRole[] = [];
    (["product_url","image","name","price","category"] as ColumnRole[]).forEach(r => {
      if (!Object.values(mapping).includes(r)) need.push(r);
    });
    if (need.length === 0) return;

    if (available.length >= 5) {
      for (let k = 0; k < need.length && k < available.length; k++) mapping[available[k]] = need[k];
    } else if (available.length >= 4) {
      const simple: ColumnRole[] = ["image","name","price","category"];
      for (let k = 0; k < Math.min(4, available.length); k++) mapping[available[k]] = simple[k];
    } else if (available.length >= 3) {
      const simple: ColumnRole[] = ["image","name","price"];
      for (let k = 0; k < Math.min(3, available.length); k++) mapping[available[k]] = simple[k];
    }
  };

  if (!Object.values(mapping).includes("name") || !Object.values(mapping).includes("price") || !Object.values(mapping).includes("image")) {
    assignDefaultsByPosition();
  }

  return mapping;
}

const sanitizeProductName = (raw: unknown): string => {
  let s = String(raw || '').trim();
  s = s.replace(/[`´‘’"]/g, '');
  s = s.replace(/\s+/g, ' ');
  return s.trim();
};

const extractCategoryLeaf = (raw: unknown): string => {
  const full = String(raw || '').trim();
  if (!full) return '';
  if (!full.includes('>')) return full;
  const parts = full.split('>').map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || full;
};

export function buildProductsByMapping(
  raw: ExtractedRaw,
  mapping: ColumnMapping,
  defaultCategory: string = "Hardware"
): Product[] {
  const { columns } = raw;
  if (columns.length === 0) return [];

  let priceIdx = -1;
  let nameIdx = -1;
  let productUrlIdx = -1;
  let categoryIdx = -1;
  const imageIndices: number[] = [];
  for (const [kStr, role] of Object.entries(mapping)) {
    const k = Number(kStr);
    if (!Number.isFinite(k)) continue;
    if (role === "price") priceIdx = k;
    else if (role === "name") nameIdx = k;
    else if (role === "product_url") productUrlIdx = k;
    else if (role === "category") categoryIdx = k;
    else if (role === "image") imageIndices.push(k);
  }

  const products: Product[] = [];
  for (let rowId = 0; rowId < columns.length; rowId++) {
    const row = columns[rowId];
    const priceRaw = priceIdx >= 0 ? String(row[priceIdx] || "").trim() : "";
    const nameRaw = nameIdx >= 0 ? String(row[nameIdx] || "").trim() : "";
    const imageCandidates: string[] = [];
    for (const i of imageIndices) {
      const v = String(row[i] || "").trim();
      if (v) imageCandidates.push(v);
    }
    if (imageIndices.length === 0) {
      for (let i = 0; i < row.length; i++) {
        const v = String(row[i] || "").trim();
        if (/^https?:\/\/.*\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)(?:[?#]|$)/i.test(v)) imageCandidates.push(v);
      }
    }

    const imageUrl = imageCandidates[0] || "";
    if (!imageUrl.startsWith('http') || !nameRaw || !priceRaw) continue;

    let productUrl = productUrlIdx >= 0 ? String(row[productUrlIdx] || "").trim() : "";
    if (productUrl && !/^https?:\/\//i.test(productUrl)) productUrl = "";

    const categoryRaw = categoryIdx >= 0 ? String(row[categoryIdx] || "").trim() : "";

    const finalName = sanitizeProductName(nameRaw);
    const slug = finalName.length > 0
      ? finalName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
      : `prod-${Date.now()}-${rowId}`;

    const priceFormatted = /^R\$\s*/i.test(priceRaw) ? priceRaw : `R$ ${priceRaw}`;

    const imageUrlsDeduped: string[] = [];
    const seen = new Set<string>();
    for (const u of imageCandidates) {
      const s = u.trim();
      if (!s || !/^https?:\/\//i.test(s) || seen.has(s)) continue;
      seen.add(s);
      imageUrlsDeduped.push(s);
    }

    products.push({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `row-${Date.now()}-${rowId}-${Math.random().toString(36).slice(2, 10)}`,
      name: finalName,
      price: priceFormatted,
      image: imageUrl,
      image_urls: imageUrlsDeduped.length > 0 ? imageUrlsDeduped : [imageUrl],
      product_url: productUrl,
      category: extractCategoryLeaf(categoryRaw) || "",
      slug,
    } as any);
  }
  return products;
}

export function parseProducts(text: string): Product[] {
    const products: Product[] = [];
    const lines = text.split('\n');

    const looksLikeHeaderLine = (columns: string[]): boolean => {
      if (!columns || columns.length === 0) return true;
      const hasAnyHttp = columns.some(c => /^https?:\/\//i.test(String(c || '').trim()));
      if (hasAnyHttp) return false;
      const hasAlphabetic = columns.some(c => /[a-zA-ZçÇáàâãéêíóôõúü]/.test(String(c || '').trim()));
      const hasNoNumericPrice = !columns.some(c => /(?:R\$\s*)?\d{1,3}(?:[.,]\d+)+/.test(String(c || '').trim()));
      return hasAlphabetic && hasNoNumericPrice;
    };

    const isLikelyPrice = (value: unknown): boolean => {
      const raw = String(value || '').trim();
      if (!raw) return false;
      if (/^R\$\s*\d/i.test(raw)) return true;
      return /^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^\d+(?:,\d{1,2})?$/.test(raw) && /\d/.test(raw);
    };

    const sanitizeProductName = (raw: unknown): string => {
      let s = String(raw || '').trim();
      s = s.replace(/[`´‘’"]/g, '');
      s = s.replace(/\s+/g, ' ');
      return s.trim();
    };

    const extractCategoryLeaf = (raw: unknown): string => {
      const full = String(raw || '').trim();
      if (!full) return '';
      if (!full.includes('>')) return full;
      const parts = full.split('>').map(p => p.trim()).filter(Boolean);
      return parts[parts.length - 1] || full;
    };

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      let parts = line.split('\t').map(p => p.trim()).filter(p => p.length > 0);

      if (parts.length < 3) {
          const regex = /(https?:\/\/[^\s]+)\s+(.+?)\s+(R\$\s*[\d\.,]+|\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)(?:\s+(.+))?/;
          const match = line.match(regex);
          if (match) {
              parts = [match[1], match[2], match[3]];
              if (match[4]) parts.push(match[4]);
          }
      }

      if (looksLikeHeaderLine(parts)) {
        continue;
      }

      if (parts.length >= 3) {
        let productUrl = "";
        let imageUrl = "";
        let name = "";
        let price = "";
        let category = "";

        if (parts.length >= 5) {
          const first = parts[0];
          const second = parts[1];
          const fourth = parts[3];
          const fifth = parts[4];

          const firstIsHttp = /^https?:\/\//i.test(first);
          const secondIsHttp = /^https?:\/\//i.test(second);
          const fourthIsPrice = isLikelyPrice(fourth);
          const fifthIsPrice = isLikelyPrice(fifth);

          if (firstIsHttp && secondIsHttp && fourthIsPrice) {
            productUrl = first;
            imageUrl = second;
            name = sanitizeProductName(parts[2]);
            price = fourth;
            category = extractCategoryLeaf(fifth);
          } else {
            let imageIdx = parts.findIndex(p => /^https?:\/\/.*\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)(?:[?#]|$)/i.test(p));
            if (imageIdx === -1) imageIdx = parts.findIndex(p => /^https?:\/\//i.test(p) && /image|img|foto|produto|photo|picture|medium|large|original/i.test(p));
            if (imageIdx === -1) imageIdx = parts.findIndex(p => /^https?:\/\//i.test(p));
            const prodIdx = imageIdx > 0 ? parts.findIndex((p, i) => i < imageIdx && /^https?:\/\//i.test(p)) : -1;
            const priceIdx = parts.findIndex((p, i) => i !== imageIdx && i !== prodIdx && isLikelyPrice(p));

            if (prodIdx !== -1) productUrl = parts[prodIdx];
            if (imageIdx !== -1) imageUrl = parts[imageIdx];
            if (priceIdx !== -1) price = parts[priceIdx];

            const takenIdx = new Set<number>();
            [prodIdx, imageIdx, priceIdx].forEach(i => { if (i !== -1) takenIdx.add(i); });
            const remaining = parts.map((p, i) => ({ p, i })).filter(x => !takenIdx.has(x.i)).map(x => x.p);
            if (remaining.length >= 2) {
              name = sanitizeProductName(remaining[0]);
              category = extractCategoryLeaf(remaining[1]);
            } else if (remaining.length === 1) {
              if (!imageUrl || !productUrl) {
                if (!imageUrl) imageUrl = remaining[0];
                else name = sanitizeProductName(remaining[0]);
              } else {
                name = sanitizeProductName(remaining[0]);
              }
            }
          }
        } else if (parts.length === 4) {
          const firstIsHttp = /^https?:\/\//i.test(parts[0]);
          const lastIsPrice = isLikelyPrice(parts[parts.length - 1]);
          if (firstIsHttp && lastIsPrice) {
            productUrl = parts[0];
            imageUrl = parts[1];
            name = sanitizeProductName(parts[2]);
            price = parts[3];
          } else if (firstIsHttp) {
            imageUrl = parts[0];
            name = sanitizeProductName(parts[1]);
            price = parts[2];
            category = extractCategoryLeaf(parts[3]);
          } else {
            imageUrl = parts[0];
            name = sanitizeProductName(parts[1]);
            price = parts[2];
            category = extractCategoryLeaf(parts[3]);
          }
        } else {
          imageUrl = parts[0];
          name = sanitizeProductName(parts[1]);
          price = parts[2];
        }

        if (imageUrl.startsWith('http') && name && price) {
          const enhancedImage = enhanceImageUrl(imageUrl);

          const allImageUrls: string[] = [];
          const seenImgs = new Set<string>();
          const pushImg = (u: string) => {
            const s = String(u || "").trim();
            if (!s || !/^https?:\/\//i.test(s) || seenImgs.has(s)) return;
            seenImgs.add(s);
            allImageUrls.push(enhanceImageUrl(s));
          };
          if (enhancedImage) pushImg(enhancedImage);
          for (const p of parts) {
            const v = String(p || "").trim();
            if (!v) continue;
            if (!/^https?:\/\//i.test(v)) continue;
            if (!/^(?!.*\b(?:product|produto|page|pdp)\b).*$/i.test(v) && /\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)(?:[?#]|$)/i.test(v)) pushImg(v);
            else if (/image|img|foto|photo|picture|medium|large|original|cdn|\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)/i.test(v)) pushImg(v);
          }

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

          let finalName = name;
          brands.forEach(regex => {
              finalName = finalName.replace(regex, "Balão.info");
          });

          const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
          const slug = finalName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

          products.push({
            id,
            name: finalName,
            price: /^R\$\s*/i.test(price) ? price : `R$ ${price}`,
            image: enhancedImage,
            image_urls: allImageUrls.length > 0 ? allImageUrls : [enhancedImage],
            product_url: productUrl,
            category: category || "",
            slug,
          });
        }
      }
    }

    return products;
  }
