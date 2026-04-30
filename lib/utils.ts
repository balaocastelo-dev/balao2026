export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  image_urls?: string[];
  product_url?: string;
  category: string;
  slug: string;
  cost?: number;
  supplier?: string;
  video_url?: string;
  description?: string;
  specs?: Record<string, any>;
  created_at?: string;
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
        // Format: ProductURL ImageURL Name Price
        productUrl = parts[0].trim();
        imageUrl = parts[1].trim();
        name = parts[2].trim();
        price = parts[3].trim();
      } else {
        // Format: ImageURL Name Price
        imageUrl = parts[0].trim();
        name = parts[1].trim();
        price = parts[2].trim();
      }

      if (imageUrl.startsWith('http') && name && price) {
        const enhancedImage = enhanceImageUrl(imageUrl);
        const finalName = name.replace(/kabum/gi, "Balão Info");
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
