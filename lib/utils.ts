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
            product_url: productUrl,
            category: category || "",
            slug,
          });
        }
      }
    }

    return products;
  }
