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

/**
 * Compresses an image file using the Canvas API.
 * Resizes large images to max 1920x1080 and converts to WebP with 0.8 quality.
 */
export async function compressImage(file: File): Promise<File> {
  // Only compress images
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Max dimensions
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP
      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(newFile);
        } else {
          resolve(file); // Fallback
        }
      }, 'image/webp', 0.8);
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      console.error("Image compression error:", error);
      resolve(file); // Fallback
    };
    
    img.src = url;
  });
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
  // Regex explanation:
  // (https?:\/\/[^\s]+\.(?:jpg|png|jpeg|webp|gif)) -> Capture Group 1: Image URL
  // \s+ -> Whitespace
  // (.+?) -> Capture Group 2: Product Name (non-greedy)
  // \s+ -> Whitespace
  // (R\$\s*[\d\.,]+) -> Capture Group 3: Price
  const regex = /(https?:\/\/[^\s]+)\s+(.+?)\s+(R\$\s*[\d\.,]+)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    let image = match[1];
    const name = match[2].trim();
    const price = match[3];

    // Enhance Image URL
    image = enhanceImageUrl(image);

    // Filter Low Resolution (Disabled to prevent missing products)
    // if (isLowResolution(image)) {
    //    continue; // Skip this product
    // }

    // Clean up the image URL if it has extra garbage (though regex [^\s]+ should handle it)
    // Clean up name if it captured too much (unlikely with non-greedy + following price)
    
    // Generate a simple ID and slug
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    products.push({
      id,
      name,
      price,
      image,
      category: "Hardware", // Default category as we don't have it in the input
      slug,
    });
  }
  
  return products;
}
