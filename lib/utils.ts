export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  image_urls?: string[];
  product_url?: string;
  kabum_url?: string;
  kabum_last_price?: number | null;
  kabum_last_stock?: string | null;
  kabum_last_checked_at?: string | null;
  kabum_sync_enabled?: boolean | null;
  kabum_sync_status?: string | null;
  kabum_sync_error?: string | null;
  category: string;
  slug: string;
  cost?: number;
  supplier?: string;
  video_url?: string;
  description?: string;
  specs?: Record<string, any>;
  ai_status?: "thinking" | "done" | "error";
  created_at?: string;
  originalPrice?: string;
  newPrice?: string;
  priceChange?: number;
}

export type BlogPostStatus = "draft" | "published";
export type BlogPostSourceType = "manual" | "rss" | "product";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content_html: string;
  cover_image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  status: BlogPostStatus;
  published_at: string;
  created_at: string;
  updated_at: string;
  source_type: BlogPostSourceType;
  source_url?: string | null;
  source_title?: string | null;
  product_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  json_ld?: Record<string, any> | null;
  reading_time_minutes?: number | null;
  internal_links?: any;
}

export function parsePriceToNumber(price: unknown): number {
  if (typeof price === "number") {
    return Number.isFinite(price) ? price : Number.POSITIVE_INFINITY;
  }

  if (typeof price !== "string") return Number.POSITIVE_INFINITY;

  const cleaned = price
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$\s*/i, "")
    .replace(/[^\d.,-]/g, "");

  if (!cleaned) return Number.POSITIVE_INFINITY;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    normalized = cleaned.replace(",", ".");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY;
  return value;
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
    enhancedUrl = enhancedUrl.replace(/_(m|p|peq|g)\./g, '_original.');

    try {
      const u = new URL(enhancedUrl);
      if (/\/produtos\/fotos\/sync_mirakl\//i.test(u.pathname) && !/\/xlarge\//i.test(u.pathname)) {
        u.pathname = u.pathname.replace(/\/(small|medium|large|mini|thumb|thumbnail)\//i, '/xlarge/');
        enhancedUrl = u.toString();
      }
    } catch {
      if (/\/produtos\/fotos\/sync_mirakl\//i.test(enhancedUrl) && !/\/xlarge\//i.test(enhancedUrl)) {
        enhancedUrl = enhancedUrl.replace(/\/(small|medium|large|mini|thumb|thumbnail)\//i, '/xlarge/');
      }
    }
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
  const map: Record<string, Category> = {};
  const roots: Category[] = [];
  
  // Clone to avoid mutating original objects if needed, 
  // and initialize children array
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });

  categories.forEach(cat => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children?.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });

  // Recursive sort by display_order
  const sortRecursive = (nodes: Category[]) => {
    nodes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
          sortRecursive(node.children);
      }
    });
  };

  sortRecursive(roots);
  return roots;
}

export function parseProducts(text: string): Product[] {
  const products: Product[] = [];
  const lines = text.split('\n');

  const unwrap = (input: string) => {
    let s = String(input || "").trim();
    if (!s) return "";
    if (s.startsWith("`") && s.endsWith("`") && s.length >= 2) s = s.slice(1, -1).trim();
    if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) s = s.slice(1, -1).trim();
    if (s.startsWith("'") && s.endsWith("'") && s.length >= 2) s = s.slice(1, -1).trim();
    return s;
  };

  const isHttpUrl = (s: string) => /^https?:\/\//i.test(s);
  const isImageUrl = (s: string) =>
    isHttpUrl(s) &&
    (/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(s) ||
      /mlstatic\.com/i.test(s) ||
      /images\.kabum\.com\.br/i.test(s));

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Try Tab separated first (common in copy-paste from spreadsheets/sites)
    let parts = line.split('\t');
    
    // If only one part, try whitespace but be careful with product names
    if (parts.length < 3) {
        // Fallback to regex for space-separated format
        // This handles: ImageURL Name Price
        const regex = /(https?:\/\/[^\s]+)\s+(.+?)\s+(R\$\s*[\d\.,]+|[\d\.,]+)/;
        const match = line.match(regex);
        if (match) {
            parts = [match[1], match[2], match[3]];
        }
    }

    if (parts.length >= 3) {
      let productUrl = "";
      let imageUrl = "";
      let name = "";
      let price = "";

      if (parts.length >= 4) {
        const p0 = unwrap(parts[0]);
        const p1 = unwrap(parts[1]);
        const p2 = unwrap(parts[2]);
        const p3 = unwrap(parts[3]);

        const looksLikeImageFirst = isImageUrl(p0) && !isImageUrl(p2) && isHttpUrl(p2);
        const looksLikeProductFirst = isHttpUrl(p0) && isImageUrl(p1);

        if (looksLikeImageFirst) {
          imageUrl = p0;
          name = p1;
          productUrl = p2;
          price = p3;
        } else if (looksLikeProductFirst) {
          productUrl = p0;
          imageUrl = p1;
          name = p2;
          price = p3;
        } else {
          const maybePrice = p3;
          const urlCandidates = [p0, p1, p2].filter(isHttpUrl);
          const img = urlCandidates.find(isImageUrl) || "";
          const prod = urlCandidates.find((u) => u !== img) || "";
          imageUrl = img || p1;
          productUrl = prod || p0;
          name = [p0, p1, p2].find((x) => !isHttpUrl(x)) || p2;
          price = maybePrice;
        }
      } else {
        // Format: ImageURL Name Price
        imageUrl = unwrap(parts[0]);
        name = unwrap(parts[1]);
        price = unwrap(parts[2]);
      }

      productUrl = unwrap(productUrl);
      imageUrl = unwrap(imageUrl);
      name = unwrap(name);
      price = unwrap(price);

      if (imageUrl.startsWith('http') && name && price) {
        const enhancedImage = enhanceImageUrl(imageUrl);
        
        // List of brands to replace with "Balão.info"
        const brands = [
            /kabum/gi,
            /tob pc´s/gi,
            /tob/gi,
            /alligator shop/gi,
            /mrp informática/gi
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
          price: price.startsWith('R$') ? price : `R$ ${price}`,
          image: enhancedImage,
          product_url: productUrl,
          category: "Hardware",
          slug,
        });
      }
    }
  }
  
  return products;
}
