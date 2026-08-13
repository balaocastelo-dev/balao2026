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

export function slugify(s: string | null | undefined): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "sem-nome";
}

export function normalizeForMatch(s: unknown): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface MatchCategoryResult {
  category: Category | null;
  matchedBy:
    | "slug_exact"
    | "slug_chain_leaf"
    | "slug_chain_any"
    | "name_exact"
    | "name_chain_leaf"
    | "name_chain_contains"
    | "norm_contains_name"
    | "norm_contains_chain"
    | "fallback_outros"
    | "fallback_any_leaf";
  confidence: number;
  originalRaw: string;
}

export interface MatchCategoryOptions {
  fallbackCategory?: "null" | "first" | Category;
}

export function matchExistingCategory(
  raw: string | null | undefined | string[],
  existingCategories: Category[],
  opts: MatchCategoryOptions = {}
): MatchCategoryResult {
  const all = Array.isArray(existingCategories) ? existingCategories.filter(Boolean) : [];
  const empty: MatchCategoryResult = {
    category: null,
    matchedBy: "fallback_outros",
    confidence: 0,
    originalRaw: String(raw ?? ""),
  };
  if (all.length === 0) {
    empty.category = null;
    return empty;
  }

  let chain: string[];
  if (Array.isArray(raw)) {
    chain = raw.map((p) => String(p || "").trim()).filter(Boolean);
  } else {
    const parts = String(raw || "")
      .split(/\s*[>➤»|\\/]\s*/g)
      .map((p) => p.trim())
      .filter(Boolean);
    chain = parts;
  }
  const originalRaw = Array.isArray(raw) ? raw.join(" > ") : String(raw ?? "");
  const leaf = chain.length ? chain[chain.length - 1] : "";
  const leafSlug = slugify(leaf);
  const leafNorm = normalizeForMatch(leaf);
  const chainSlugs = chain.map((p) => slugify(p));
  const chainNorms = chain.map((p) => normalizeForMatch(p));
  const joinedChainSlug = slugify(chain.join(" "));
  const fullNorm = normalizeForMatch(originalRaw);

  const bySlug = new Map<string, Category>();
  const byNormName = new Map<string, Category>();
  for (const c of all) {
    if (c?.slug) bySlug.set(String(c.slug).toLowerCase().trim(), c);
    byNormName.set(normalizeForMatch(c.name), c);
  }

  // 1. Slug exato (folha ou raw puro)
  if (leafSlug && bySlug.has(leafSlug)) {
    return {
      category: bySlug.get(leafSlug)!,
      matchedBy: "slug_chain_leaf",
      confidence: 1,
      originalRaw,
    };
  }
  const rawSlug = slugify(originalRaw);
  if (rawSlug && bySlug.has(rawSlug)) {
    return {
      category: bySlug.get(rawSlug)!,
      matchedBy: "slug_exact",
      confidence: 1,
      originalRaw,
    };
  }
  if (joinedChainSlug && bySlug.has(joinedChainSlug)) {
    return {
      category: bySlug.get(joinedChainSlug)!,
      matchedBy: "slug_chain_any",
      confidence: 0.98,
      originalRaw,
    };
  }

  // 2. Nome exato (normalizado sem acento)
  if (leafNorm) {
    const exactLeaf = byNormName.get(leafNorm);
    if (exactLeaf) {
      return {
        category: exactLeaf,
        matchedBy: "name_chain_leaf",
        confidence: 0.97,
        originalRaw,
      };
    }
  }
  const rawNorm = normalizeForMatch(originalRaw);
  if (rawNorm) {
    const exactRaw = byNormName.get(rawNorm);
    if (exactRaw) {
      return {
        category: exactRaw,
        matchedBy: "name_exact",
        confidence: 0.96,
        originalRaw,
      };
    }
  }

  // 3. Nome/chain substring (contains) em qualquer nivel
  for (let i = chainNorms.length - 1; i >= 0; i--) {
    const n = chainNorms[i];
    if (!n) continue;
    for (const [normKey, cat] of byNormName.entries()) {
      if (normKey && (normKey === n || normKey.includes(n) || n.includes(normKey))) {
        return {
          category: cat,
          matchedBy: "name_chain_contains",
          confidence: 0.78 + Math.min(0.12, n.length / 100),
          originalRaw,
        };
      }
    }
  }
  if (fullNorm) {
    for (const [normKey, cat] of byNormName.entries()) {
      if (normKey && (fullNorm.includes(normKey) || normKey.includes(fullNorm))) {
        return {
          category: cat,
          matchedBy: "norm_contains_name",
          confidence: 0.65,
          originalRaw,
        };
      }
    }
  }
  // 3b. Match por slug contains (em qualquer item da chain)
  for (let i = chainSlugs.length - 1; i >= 0; i--) {
    const s = chainSlugs[i];
    if (!s || s.length < 3) continue;
    for (const [slugKey, cat] of bySlug.entries()) {
      if (!slugKey) continue;
      if (slugKey === s || slugKey.includes(s) || s.includes(slugKey)) {
        return {
          category: cat,
          matchedBy: "norm_contains_chain",
          confidence: 0.62,
          originalRaw,
        };
      }
    }
  }

  // 4. Fallback: tenta "Outros" / "Sem categoria" no DB, senão usa primeira categoria (nunca cria nova!)
  const tryNames = ["Outros", "Sem Categoria", "Sem categoria", "Outros/Sem categoria", "Diversos", "Geral"];
  for (const nm of tryNames) {
    const hit = byNormName.get(normalizeForMatch(nm));
    if (hit) {
      return {
        category: hit,
        matchedBy: "fallback_outros",
        confidence: 0.3,
        originalRaw,
      };
    }
    const slug = slugify(nm);
    if (bySlug.has(slug)) {
      return {
        category: bySlug.get(slug)!,
        matchedBy: "fallback_outros",
        confidence: 0.3,
        originalRaw,
      };
    }
  }

  const fallbackMode = opts.fallbackCategory ?? "first";
  if (fallbackMode === "null") {
    return {
      category: null,
      matchedBy: "fallback_outros",
      confidence: 0,
      originalRaw,
    };
  }
  if (fallbackMode !== "first" && typeof fallbackMode === "object") {
    return {
      category: fallbackMode,
      matchedBy: "fallback_outros",
      confidence: 0.2,
      originalRaw,
    };
  }
  // Default: primeira categoria ativa da lista (nunca retorna null/nunca cria!)
  const firstActive = all.find((c) => c.active) || all[0];
  return {
    category: firstActive,
    matchedBy: "fallback_any_leaf",
    confidence: 0.05,
    originalRaw,
  };
}

export function extractLeafAndChainFromCategory(
  rawCat: string
): { chain: string[]; leaf: string; leafSlug: string } {
  const chain = String(rawCat || "")
    .split(/\s*[>➤»]\s*/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const leaf = chain.length ? chain[chain.length - 1] : "";
  return { chain, leaf, leafSlug: slugify(chain.join(" ")) };
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

  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  let normalized = cleaned;
  if (commas === 1 && dots === 0) normalized = cleaned.replace(",", ".");
  else if (commas === 1 && dots >= 1) normalized = cleaned.replace(/\./g, "").replace(",", ".");
  else if (commas === 0 && dots >= 2) normalized = cleaned.replace(/\./g, "");
  const result = Number(normalized);
  return Number.isFinite(result) ? Math.max(0, result) : 0;
}

export function parseProducts(text: string): Product[] {
  const products: Product[] = [];
  const lines = text.split(/\r?\n/);
  let startIdx = 0;

  if (lines.length > 0) {
    const first = lines[0] || "";
    const temHeaderSuspeito =
      /flex|href|relative|src|text-sm|text-base|categoria/i.test(first) ||
      !/kabum\.com\.br\/produto\//i.test(first);
    if (temHeaderSuspeito) startIdx = 1;
  }

  for (let idx = startIdx; idx < lines.length; idx++) {
    let line = (lines[idx] || "").trim();
    if (!line) continue;

    let parts = line.split("\t");

    if (parts.length < 3) {
      const regex = /(https?:\/\/[^\s]+)\s+(.+?)\s+(R\$\s*[\d\.,]+|[\d\.,]+)(?:\s+(.+))?/;
      const match = line.match(regex);
      if (match) {
        parts = [match[1], match[2], match[3]];
        if (match[4]) parts.push(match[4]);
      }
    }

    if (parts.length >= 3) {
      let productUrl = "";
      let imageUrl = "";
      let name = "";
      let price = "";
      let categoryRaw = "";

      if (parts.length >= 5) {
        productUrl = parts[0].trim();
        imageUrl = parts[1].trim();
        name = parts[2].trim();
        price = parts[3].trim();
        categoryRaw = parts[4].trim();
      } else if (parts.length === 4) {
        const firstIsHttp = parts[0].trim().startsWith("http");
        const lastCell = parts[parts.length - 1].trim();
        const lastIsPrice =
          /(?:R\$\s*)?\d[\d\.,]*/.test(lastCell) &&
          !/^[A-Za-zçÇáàâãéêíóôõúüÁÀÂÃÉÊÍÓÔÕÚÜ]/.test(lastCell);
        if (firstIsHttp && lastIsPrice) {
          productUrl = parts[0].trim();
          imageUrl = parts[1].trim();
          name = parts[2].trim();
          price = parts[3].trim();
        } else if (firstIsHttp) {
          productUrl = parts[0].trim();
          imageUrl = parts[1].trim();
          name = parts[2].trim();
          categoryRaw = parts[3].trim();
        } else {
          imageUrl = parts[0].trim();
          name = parts[1].trim();
          price = parts[2].trim();
          categoryRaw = parts[3].trim();
        }
      } else {
        if (parts[0].trim().startsWith("http") && /(jpg|jpeg|png|webp|gif|avif)/i.test(parts[0].trim())) {
          imageUrl = parts[0].trim();
          name = parts[1].trim();
          price = parts[2].trim();
        } else if (parts[0].trim().startsWith("http") && /\/produto\//i.test(parts[0].trim())) {
          productUrl = parts[0].trim();
          name = parts[1].trim();
          price = parts[2].trim();
        } else {
          imageUrl = parts[0].trim();
          name = parts[1].trim();
          price = parts[2].trim();
        }
      }

      const image = imageUrl && imageUrl.startsWith("http") ? imageUrl : "";
      if (name && price && (image || productUrl)) {
        const enhancedImage = enhanceImageUrl(image || "");
        const { chain, leafSlug } = extractLeafAndChainFromCategory(categoryRaw);

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
          /mrp inform[aá]tica/gi,
        ];

        let finalName = name;
        brands.forEach((re) => {
          finalName = finalName.replace(re, "Balão.info");
        });

        const id =
          typeof crypto !== "undefined" && (crypto as any)?.randomUUID
            ? (crypto as any).randomUUID()
            : Math.random().toString(36).slice(2, 15) + "-" + idx;
        const slugBase = slugify(finalName);
        const slug = slugBase + "-" + Math.random().toString(36).slice(2, 7);

        const p: any = {
          id,
          name: finalName,
          price: price.startsWith("R$") ? price : `R$ ${price}`,
          image: enhancedImage,
          image_urls: enhancedImage ? [enhancedImage] : [],
          product_url: productUrl || undefined,
          category: leafSlug || "outros",
          slug,
          _categoryChain: chain,
          _categoryRaw: categoryRaw || undefined,
        };
        products.push(p as Product);
      }
    }
  }

  return products;
}

