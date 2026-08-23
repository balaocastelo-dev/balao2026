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
  brand?: string;
  rating?: string;
  installment?: string;
  discount_pix?: string;
  price_card?: string;
  availability?: string;
  source_url?: string;
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
  description?: string;
  link?: string;
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

  // 1. Kabum: _m, _p, _peq, _g -> _gg (Ultra High Resolution 1500px)
  if (enhancedUrl.includes('kabum.com.br')) {
    enhancedUrl = enhancedUrl.replace(/_(m|p|peq|g)\./g, '_gg.');
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

    const competitorPatterns = [
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
        /\bkabum\b/gi,
        /\btob\s*pc[’'´`]?s\b/gi,
        /\btob\b/gi,
        /\balligator shop\b/gi,
        /\bmrp inform[aá]tica\b/gi
    ];

    const sanitizeText = (val: string) => {
      let res = val;
      competitorPatterns.forEach(pattern => {
        res = res.replace(pattern, "Balão.info");
      });
      return res;
    };

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Check if header line
      const upperLine = line.toUpperCase();
      if (
        (upperLine.startsWith("ID\t") || upperLine.startsWith("ID ")) && 
        (upperLine.includes("TÍTULO") || upperLine.includes("TITULO") || upperLine.includes("PREÇO") || upperLine.includes("PRECO"))
      ) {
        continue; // Skip header row
      }

      // Try Tab separated
      let parts = line.split('\t');

      // 1. Full 14-column format:
      // ID | TÍTULO | PREÇO À VISTA NO PIX (R$) | PREÇO PARCELADO (R$) | DESCONTO PIX | PARCELAMENTO | CATEGORIA | MARCA | DISPONIBILIDADE | AVALIAÇÃO | LINK PRODUTO BALÃO.INFO | LINK PRODUTO ORIGEM | LINK FOTO ULTRA HD | DESCRIÇÃO
      if (parts.length >= 10) {
        const id = parts[0]?.trim() || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
        const rawName = parts[1]?.trim() || "";
        const pricePixRaw = parts[2]?.trim() || "";
        const priceCardRaw = parts[3]?.trim() || "";
        const discountPix = parts[4]?.trim() || "";
        const installment = parts[5]?.trim() || "";
        const categoryRaw = parts[6]?.trim() || "Hardware";
        const brand = parts[7]?.trim() || "";
        const availability = parts[8]?.trim() || "Disponível";
        const rating = parts[9]?.trim() || "5.0 ⭐";
        const balaoUrl = parts[10]?.trim() || "";
        const sourceUrl = parts[11]?.trim() || "";
        const imageUrlRaw = parts[12]?.trim() || "";
        const descriptionRaw = parts[13]?.trim() || "";

        if (rawName && pricePixRaw) {
          const finalName = sanitizeText(rawName);
          const finalDescription = sanitizeText(descriptionRaw);
          const enhancedImage = imageUrlRaw ? enhanceImageUrl(imageUrlRaw) : "/logo.png";
          
          let formattedPrice = pricePixRaw.replace(/R\$/gi, "").trim();
          if (!formattedPrice.startsWith("R$")) {
            formattedPrice = `R$ ${formattedPrice}`;
          }

          let formattedPriceCard = priceCardRaw ? priceCardRaw.replace(/R\$/gi, "").trim() : "";
          if (formattedPriceCard && !formattedPriceCard.startsWith("R$")) {
            formattedPriceCard = `R$ ${formattedPriceCard}`;
          }

          const slug = finalName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

          products.push({
            id: String(id),
            name: finalName,
            price: formattedPrice,
            price_card: formattedPriceCard || undefined,
            discount_pix: discountPix || undefined,
            installment: installment || undefined,
            category: categoryRaw || "Hardware",
            brand: brand || undefined,
            availability: availability || "Disponível",
            rating: rating || "5.0 ⭐",
            product_url: balaoUrl || `/product/${id}`,
            source_url: sourceUrl || undefined,
            image: enhancedImage,
            image_urls: enhancedImage ? [enhancedImage] : [],
            description: finalDescription,
            slug: slug || String(id),
          });
          continue;
        }
      }

      // 2. Fallback to 3 or 4 column formats:
      if (parts.length < 3) {
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
          productUrl = parts[0].trim();
          imageUrl = parts[1].trim();
          name = parts[2].trim();
          price = parts[3].trim();
        } else {
          imageUrl = parts[0].trim();
          name = parts[1].trim();
          price = parts[2].trim();
        }

        if (imageUrl.startsWith('http') && name && price) {
          const enhancedImage = enhanceImageUrl(imageUrl);
          const finalName = sanitizeText(name);

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
            image_urls: [enhancedImage],
            product_url: productUrl,
            category: "Hardware",
            slug,
          });
        }
      }
    }

    return products;
}
