import { randomUUID } from 'crypto';
import { turso, isTursoActive } from './turso';
import { BlogPost, Product, CarouselImage, Category, HomeBlock, UsedNotebook, parsePriceToNumber } from './utils';

// Linha crua retornada pelo driver LibSQL (valores vêm como unknown).
type Row = Record<string, unknown>;


// Mapeia uma linha do SQLite/LibSQL para o tipo Product da aplicação.
// SQLite não tem JSONB nem arrays: `specs` e `image_urls` chegam como TEXT.
function mapTursoProduct(r: Record<string, unknown>): Product {
  const parseJson = <T,>(value: unknown, fallback: T): T => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return value as T;
    try {
      const parsed = JSON.parse(String(value));
      return (parsed ?? fallback) as T;
    } catch {
      return fallback;
    }
  };

  return {
    id: String(r.id),
    name: String(r.name),
    price: String(r.price),
    image: String(r.image ?? ''),
    category: String(r.category ?? ''),
    slug: String(r.slug ?? ''),
    description: String(r.description ?? ''),
    specs: parseJson<Record<string, unknown>>(r.specs, {}),
    image_urls: parseJson<string[]>(r.image_urls, []),
    created_at: r.created_at ? String(r.created_at) : undefined,
  } as Product;
}

const toJsonText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const sortByPrice = (items: Product[]) =>
  items.sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));

export async function getProducts(): Promise<Product[]> {
  if (!isTursoActive()) return [];
  try {
    const res = await turso.execute('SELECT * FROM products ORDER BY created_at DESC');
    return sortByPrice(res.rows.map(r => mapTursoProduct(r as Row)));
  } catch (error) {
    console.error("Turso error (getProducts):", error);
    return [];
  }
}

export async function getProductsForSitemap(limit = 1000): Promise<Pick<Product, "id" | "slug" | "created_at">[]> {
  const take = Math.max(1, Math.min(5000, limit));
  if (!isTursoActive()) return [];

  try {
    const res = await turso.execute({
      sql: 'SELECT id, slug, created_at FROM products ORDER BY created_at DESC LIMIT ?',
      args: [take],
    });
    return res.rows
      .map((r: Row) => ({
        id: String(r.id),
        slug: String(r.slug ?? ''),
        created_at: r.created_at ? String(r.created_at) : undefined,
      }))
      .filter((p) => p.id && p.slug);
  } catch (error) {
    console.error("Turso error (getProductsForSitemap):", error);
    return [];
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (!isTursoActive()) return [];

  try {
    // SQLite: LIKE é case-insensitive para ASCII por padrão.
    const res = await turso.execute({
      sql: 'SELECT * FROM products WHERE category LIKE ? ORDER BY created_at DESC',
      args: [`%${categorySlug}%`],
    });
    return sortByPrice(res.rows.map(r => mapTursoProduct(r as Row)));
  } catch (error) {
    console.error(`Turso error (getProductsByCategory ${categorySlug}):`, error);
    return [];
  }
}

export async function getProductsByExactCategories(categoryNames: string[]): Promise<Product[]> {
  try {
    const normalizedNames = [...new Set(categoryNames.map((name) => String(name || "").trim()).filter(Boolean))];
    if (normalizedNames.length === 0) return [];
    if (!isTursoActive()) return [];

    const placeholders = normalizedNames.map(() => '?').join(',');
    const res = await turso.execute({
      sql: `SELECT * FROM products WHERE category IN (${placeholders}) ORDER BY created_at DESC`,
      args: normalizedNames
    });
    return sortByPrice(res.rows.map(r => mapTursoProduct(r as Row)));
  } catch (error) {
    console.error("Error fetching products by exact categories:", error);
    return [];
  }
}

export async function searchProductsByKeywords(keywords: string[], limit = 24): Promise<Product[]> {
  try {
    const normalizedKeywords = [...new Set(
      keywords
        .map((keyword) => String(keyword || "").trim().toLowerCase())
        .filter(Boolean)
    )];

    if (normalizedKeywords.length === 0) return [];
    if (!isTursoActive()) return [];

    const clauses = normalizedKeywords
      .map(() => '(LOWER(name) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)')
      .join(' OR ');
    const args = normalizedKeywords.flatMap((k) => [`%${k}%`, `%${k}%`, `%${k}%`]);
    const take = Math.max(limit, normalizedKeywords.length * 12);
    const res = await turso.execute({
      sql: `SELECT * FROM products WHERE ${clauses} LIMIT ?`,
      args: [...args, take],
    });
    return sortByPrice(res.rows.map(r => mapTursoProduct(r as Row))).slice(0, limit);
  } catch (error) {
    console.error("Error searching products by keywords:", error);
    return [];
  }
}

export async function getProductByIdentifier(identifier: string): Promise<Product | null> {
  if (!isTursoActive()) return null;

  try {
    const res = await turso.execute({
      sql: 'SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1',
      args: [identifier, identifier],
    });
    if (res.rows.length === 0) return null;
    return mapTursoProduct(res.rows[0] as Row);
  } catch (error) {
    console.error("Turso error (getProductByIdentifier):", error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  return getProductByIdentifier(id);
}

export async function saveProducts(products: Product[]) {
  try {
    if (!products || products.length === 0) return;
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    // Sanitize products to match DB schema
    const dbProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: String(p.price),
      image: p.image,
      image_urls: p.image_urls || [p.image],
      product_url: p.product_url || null,
      description: p.description || null,
      specs: p.specs || null,
      category: p.category,
      slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
    }));

    console.log(`[saveProducts] Saving ${dbProducts.length} products via Turso...`);

    for (const p of dbProducts) {
      await turso.execute({
        sql: `INSERT INTO products (id, name, price, image, image_urls, product_url, description, specs, category, slug)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                price = excluded.price,
                image = excluded.image,
                image_urls = excluded.image_urls,
                product_url = excluded.product_url,
                description = excluded.description,
                specs = excluded.specs,
                category = excluded.category,
                slug = excluded.slug`,
        args: [
          p.id, p.name, p.price, p.image,
          Array.isArray(p.image_urls) ? JSON.stringify(p.image_urls) : p.image_urls,
          p.product_url,
          p.description,
          p.specs && typeof p.specs === 'object' ? JSON.stringify(p.specs) : p.specs,
          p.category, p.slug,
        ],
      });
    }

    console.log(`[saveProducts] Success.`);
  } catch (error) {
    console.error("Error saving products:", error);
    throw error;
  }
}

// --- Products CRUD ---

export async function createProduct(product: Partial<Product>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const id = product.id || randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO products (id, name, price, image, image_urls, product_url, description, specs, category, slug, video_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        product.name ?? '',
        product.price != null ? String(product.price) : '',
        product.image ?? '',
        toJsonText(product.image_urls),
        product.product_url ?? null,
        product.description ?? null,
        toJsonText(product.specs),
        product.category ?? '',
        product.slug ?? (product.name || 'produto').toLowerCase().replace(/\s+/g, '-'),
        product.video_url ?? null,
        now,
      ],
    });

    return getProductById(id);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const dbUpdates: Record<string, string | number | null> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.price !== undefined) dbUpdates.price = String(updates.price);
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.image_urls !== undefined) dbUpdates.image_urls = Array.isArray(updates.image_urls) ? JSON.stringify(updates.image_urls) : updates.image_urls;
    if (updates.product_url !== undefined) dbUpdates.product_url = updates.product_url;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.specs !== undefined) dbUpdates.specs = typeof updates.specs === 'object' && updates.specs !== null ? JSON.stringify(updates.specs) : updates.specs;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.video_url !== undefined) dbUpdates.video_url = updates.video_url;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return getProductById(id);

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await turso.execute({
      sql: `UPDATE products SET ${setClause} WHERE id = ?`,
      args: [...keys.map(k => dbUpdates[k]), id],
    });

    return getProductById(id);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function getCarouselImages(activeOnly = true): Promise<CarouselImage[]> {
  if (!isTursoActive()) return [];

  try {
    const res = await turso.execute(
      activeOnly
        ? 'SELECT * FROM carousel_images WHERE active = 1 ORDER BY display_order ASC'
        : 'SELECT * FROM carousel_images ORDER BY display_order ASC'
    );
    return res.rows.map((r: Row) => ({
      id: String(r.id),
      image_url: String(r.image_url ?? ''),
      title: r.title ? String(r.title) : undefined,
      description: r.description ? String(r.description) : undefined,
      link: r.link ? String(r.link) : undefined,
      display_order: Number(r.display_order ?? 0),
      active: Boolean(Number(r.active ?? 0)),
      created_at: r.created_at ? String(r.created_at) : undefined,
    })) as CarouselImage[];
  } catch (error) {
    console.error("Turso error (getCarouselImages):", error);
    return [];
  }
}

// --- Used Notebooks (Seminovos) ---

export async function getUsedNotebooks(): Promise<UsedNotebook[]> {
  if (!isTursoActive()) return [];

  try {
    const res = await turso.execute(
      'SELECT * FROM used_notebooks ORDER BY created_at DESC'
    );
    return res.rows.map((r: Row) => {
      let imageUrls: string[] = [];
      try {
        const parsed = r.image_urls ? JSON.parse(String(r.image_urls)) : [];
        if (Array.isArray(parsed)) imageUrls = parsed;
      } catch {}
      return {
        ...r,
        id: String(r.id),
        price: Number(r.price ?? 0),
        highlight: Boolean(Number(r.highlight ?? 0)),
        image_urls: imageUrls,
      };
    }) as unknown as UsedNotebook[];
  } catch (error) {
    console.error("Error fetching used notebooks:", error);
    return [];
  }
}

export async function createUsedNotebook(payload: Partial<UsedNotebook>): Promise<UsedNotebook> {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const id = randomUUID();
    const now = new Date().toISOString();

    await turso.execute({
      sql: `INSERT INTO used_notebooks
            (id, name, model, processor, ram, storage, gpu, battery, price, cart_url, image_urls, video_url, highlight, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        payload.name || "",
        payload.model || "",
        payload.processor || "",
        payload.ram || "",
        payload.storage || "",
        payload.gpu || "",
        payload.battery || "",
        Number(payload.price ?? 0),
        payload.cart_url || "",
        JSON.stringify(payload.image_urls || []),
        payload.video_url || "",
        payload.highlight ? 1 : 0,
        now,
      ],
    });

    const res = await turso.execute({ sql: 'SELECT * FROM used_notebooks WHERE id = ?', args: [id] });
    return res.rows[0] as unknown as UsedNotebook;
  } catch (error) {
    console.error("Error creating used notebook:", error);
    throw error;
  }
}

export async function updateUsedNotebook(id: string, updates: Partial<UsedNotebook>): Promise<UsedNotebook> {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const notebookUpdates: Record<string, string | number | null> = {};
    if (updates.name !== undefined) notebookUpdates.name = updates.name;
    if (updates.model !== undefined) notebookUpdates.model = updates.model;
    if (updates.processor !== undefined) notebookUpdates.processor = updates.processor;
    if (updates.ram !== undefined) notebookUpdates.ram = updates.ram;
    if (updates.storage !== undefined) notebookUpdates.storage = updates.storage;
    if (updates.gpu !== undefined) notebookUpdates.gpu = updates.gpu;
    if (updates.battery !== undefined) notebookUpdates.battery = updates.battery;
    if (updates.price !== undefined) notebookUpdates.price = Number(updates.price);
    if (updates.cart_url !== undefined) notebookUpdates.cart_url = updates.cart_url;
    if (updates.image_urls !== undefined) notebookUpdates.image_urls = JSON.stringify(updates.image_urls || []);
    if (updates.video_url !== undefined) notebookUpdates.video_url = updates.video_url;
    if (updates.highlight !== undefined) notebookUpdates.highlight = updates.highlight ? 1 : 0;

    const keys = Object.keys(notebookUpdates);
    if (keys.length > 0) {
      const setClause = keys.map(k => `${k} = ?`).join(', ');
      await turso.execute({
        sql: `UPDATE used_notebooks SET ${setClause} WHERE id = ?`,
        args: [...keys.map(k => notebookUpdates[k]), id],
      });
    }

    const res = await turso.execute({ sql: 'SELECT * FROM used_notebooks WHERE id = ?', args: [id] });
    return res.rows[0] as unknown as UsedNotebook;
  } catch (error) {
    console.error("Error updating used notebook:", error);
    throw error;
  }
}

export async function deleteUsedNotebook(id: string): Promise<void> {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({ sql: 'DELETE FROM used_notebooks WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting used notebook:", error);
    throw error;
  }
}

export async function addCarouselImage(imageUrl: string, title?: string, metadata?: Record<string, unknown> | null) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const maxOrderRes = await turso.execute(
      'SELECT MAX(display_order) AS max_order FROM carousel_images'
    );
    const nextOrder = Number((maxOrderRes.rows[0] as Row)?.max_order ?? -1) + 1;

    const id = randomUUID();
    await turso.execute({
      sql: `INSERT INTO carousel_images (id, image_url, title, display_order, active, metadata, created_at)
            VALUES (?, ?, ?, ?, 1, ?, ?)`,
      args: [
        id,
        imageUrl,
        title ?? null,
        nextOrder,
        metadata ? JSON.stringify(metadata) : null,
        new Date().toISOString(),
      ],
    });

    return { id, image_url: imageUrl, title, display_order: nextOrder, active: true };
  } catch (error) {
    console.error("Error adding carousel image:", error);
    throw error;
  }
}

export async function saveImportHistory(history: {
  product_count: number;
  price_percentage: number;
  applied_category: string;
  applied_scope: string;
}) {
  try {
    if (!isTursoActive()) return;
    await turso.execute({
      sql: `INSERT INTO import_history (product_count, price_percentage, applied_category, applied_scope, created_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        history.product_count,
        history.price_percentage,
        history.applied_category,
        history.applied_scope,
        new Date().toISOString(),
      ],
    });
  } catch (error) {
    console.error("Error saving import history:", error);
    // Don't throw, just log, so it doesn't break the import flow
  }
}

export async function deleteCarouselImage(id: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({ sql: 'DELETE FROM carousel_images WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting carousel image:", error);
    throw error;
  }
}

export async function updateCarouselImage(id: string, updates: Partial<CarouselImage>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const dbUpdates: Record<string, string | number | null> = {};
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.link !== undefined) dbUpdates.link = updates.link;
    if (updates.display_order !== undefined) dbUpdates.display_order = Number(updates.display_order);
    if (updates.active !== undefined) dbUpdates.active = updates.active ? 1 : 0;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await turso.execute({
      sql: `UPDATE carousel_images SET ${setClause} WHERE id = ?`,
      args: [...keys.map(k => dbUpdates[k]), id],
    });
  } catch (error) {
    console.error("Error updating carousel image:", error);
    throw error;
  }
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
  try {
    if (!isTursoActive()) return [];

    const res = await turso.execute('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      parent_id: r.parent_id ? String(r.parent_id) : null,
      display_order: Number(r.display_order || 0),
      icon: r.icon ? String(r.icon) : null,
      active: Boolean(r.active)
    })) as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getCategoryById(id: string): Promise<Category | null> {
  const res = await turso.execute({ sql: 'SELECT * FROM categories WHERE id = ? LIMIT 1', args: [id] });
  if (res.rows.length === 0) return null;
  const r = res.rows[0] as Row;
  return {
    id: String(r.id),
    name: String(r.name),
    slug: String(r.slug),
    parent_id: r.parent_id ? String(r.parent_id) : null,
    display_order: Number(r.display_order || 0),
    icon: r.icon ? String(r.icon) : undefined,
    active: Boolean(r.active),
  };
}

export async function createCategory(category: Partial<Category>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const maxOrderRes = await turso.execute(
      'SELECT MAX(display_order) AS max_order FROM categories'
    );
    const nextOrder = Number((maxOrderRes.rows[0] as Row)?.max_order ?? -1) + 1;

    const id = category.id || randomUUID();
    await turso.execute({
      sql: `INSERT INTO categories (id, name, slug, parent_id, display_order, icon, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        category.name ?? '',
        category.slug ?? '',
        category.parent_id || null,
        category.display_order ?? nextOrder,
        category.icon || null,
        category.active === false ? 0 : 1,
      ],
    });

    return getCategoryById(id);
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const dbUpdates: Record<string, string | number | null> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.parent_id !== undefined) dbUpdates.parent_id = updates.parent_id || null;
    if (updates.display_order !== undefined) dbUpdates.display_order = Number(updates.display_order);
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon || null;
    if (updates.active !== undefined) dbUpdates.active = updates.active ? 1 : 0;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return getCategoryById(id);

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    await turso.execute({
      sql: `UPDATE categories SET ${setClause} WHERE id = ?`,
      args: [...keys.map(k => dbUpdates[k]), id],
    });

    return getCategoryById(id);
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// --- Blog ---

export async function getBlogPosts(input?: {
  limit?: number;
  category?: string;
  query?: string;
}): Promise<BlogPost[]> {
  try {
    if (!isTursoActive()) return [];

    const limit = Math.max(1, Math.min(100, input?.limit ?? 24));

    const selectList =
      "id,slug,title,excerpt,cover_image,category,published_at,created_at,updated_at,source_url,canonical_url,seo_title,seo_description,reading_time_minutes";

    const where: string[] = ["status = 'published'"];
    const args: string[] = [];
    if (input?.category) {
      where.push("category = ?");
      args.push(input.category);
    }
    if (input?.query) {
      where.push("LOWER(title) LIKE ?");
      args.push(`%${String(input.query).toLowerCase()}%`);
    }
    const res = await turso.execute({
      sql: `SELECT ${selectList} FROM blog_posts WHERE ${where.join(" AND ")} ORDER BY published_at DESC LIMIT ?`,
      args: [...args, limit],
    });
    return res.rows.map((r: Row) => ({ ...r })) as unknown as BlogPost[];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    if (!isTursoActive()) return null;

    const res = await turso.execute({
      sql: "SELECT * FROM blog_posts WHERE status = 'published' AND slug = ? LIMIT 1",
      args: [slug],
    });
    if (res.rows.length === 0) return null;
    return { ...(res.rows[0] as Row) } as unknown as BlogPost;
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }
}

export async function getBlogCategories(limit = 40): Promise<string[]> {
  try {
    if (!isTursoActive()) return [];

    const res = await turso.execute({
      sql: "SELECT category FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?",
      args: [Math.max(1, Math.min(200, limit))],
    });
    const cats = res.rows
      .map((r: Row) => (typeof r.category === "string" ? r.category.trim() : ""))
      .filter((v): v is string => v.length > 0);
    return Array.from(new Set<string>(cats)).slice(0, limit);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }
}

export type NewBlogPost = {
  slug: string;
  title: string;
  excerpt?: string | null;
  content_html: string;
  cover_image?: string | null;
  category?: string | null;
  tags?: string[] | null;
  status: "draft" | "published";
  published_at: string;
  source_type: "manual" | "rss" | "product";
  source_url?: string | null;
  source_title?: string | null;
  product_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  json_ld?: unknown;
  reading_time_minutes?: number | null;
  internal_links?: unknown;
};

export async function insertBlogPost(post: NewBlogPost): Promise<BlogPost> {
  if (!isTursoActive()) throw new Error('Banco de dados não configurado');

  const id = randomUUID();
  const now = new Date().toISOString();

  const res = await turso.execute({
    sql: `INSERT INTO blog_posts
          (id, slug, title, excerpt, content_html, cover_image, category, tags, status, published_at,
           created_at, updated_at, source_type, source_url, source_title, product_id,
           seo_title, seo_description, canonical_url, json_ld, reading_time_minutes, internal_links)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *`,
    args: [
      id,
      post.slug,
      post.title,
      post.excerpt ?? null,
      post.content_html,
      post.cover_image ?? null,
      post.category ?? null,
      toJsonText(post.tags),
      post.status,
      post.published_at,
      now,
      now,
      post.source_type,
      post.source_url ?? null,
      post.source_title ?? null,
      post.product_id ?? null,
      post.seo_title ?? null,
      post.seo_description ?? null,
      post.canonical_url ?? null,
      toJsonText(post.json_ld),
      post.reading_time_minutes ?? null,
      toJsonText(post.internal_links),
    ],
  });

  return { ...(res.rows[0] as Row) } as unknown as BlogPost;
}

export async function hasBlogSourceItem(input: { source_type: "rss" | "product"; source_hash: string }): Promise<boolean> {
  try {
    if (!isTursoActive()) return false;

    const res = await turso.execute({
      sql: "SELECT id FROM blog_source_items WHERE source_type = ? AND source_hash = ? LIMIT 1",
      args: [input.source_type, input.source_hash],
    });
    return res.rows.length > 0;
  } catch {
    return false;
  }
}

export async function insertBlogSourceItem(input: {
  source_type: "rss" | "product";
  source_url: string;
  source_hash: string;
  source_title?: string;
  source_published_at?: string;
}) {
  if (!isTursoActive()) throw new Error('Banco de dados não configurado');

  await turso.execute({
    sql: `INSERT INTO blog_source_items (source_type, source_url, source_hash, source_title, source_published_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [
      input.source_type,
      input.source_url,
      input.source_hash,
      input.source_title || null,
      input.source_published_at || null,
    ],
  });
}

// --- Orders ---

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    user_id?: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    customer_name: string;
    customer_email: string;
    customer_whatsapp: string;
    address: {
      street?: string;
      number?: string;
      complement?: string;
      cep?: string;
      city?: string;
      state?: string;
    };
    created_at: string;
    items?: OrderItem[];
    coupon_code?: string;
    discount_value?: number;
}

async function attachItemsToOrders<T extends { id: string }>(orders: Row[]): Promise<T[]> {
  if (orders.length === 0) return [] as T[];
  const ids = orders.map(o => String(o.id));
  const placeholders = ids.map(() => '?').join(',');
  const itemsRes = await turso.execute({
    sql: `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
    args: ids,
  });
  const itemsByOrder: Record<string, Row[]> = {};
  for (const item of itemsRes.rows as Row[]) {
    const oid = String(item.order_id);
    if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
    itemsByOrder[oid].push(item);
  }
  return orders.map(o => ({ ...o, items: itemsByOrder[String(o.id)] || [] })) as unknown as T[];
}

export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    console.log(`[DB] Tentando criar pedido para: ${orderData.customer_email}`);

    const orderId = randomUUID();
    const now = new Date().toISOString();

    // 1. Create Order
    await turso.execute({
      sql: `INSERT INTO orders (id, status, total, customer_name, customer_email, customer_whatsapp, address, coupon_code, discount_value, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        orderId,
        orderData.status || 'pending',
        Number(orderData.total || 0),
        orderData.customer_name ?? '',
        orderData.customer_email ?? '',
        orderData.customer_whatsapp ?? '',
        orderData.address ? JSON.stringify(orderData.address) : null,
        orderData.coupon_code ?? null,
        orderData.discount_value != null ? Number(orderData.discount_value) : null,
        now,
        now,
      ],
    });

    console.log(`[DB] Pedido criado com ID: ${orderId}. Inserindo ${items.length} itens...`);

    // 2. Create Order Items
    for (const item of items) {
      await turso.execute({
        sql: `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, quantity, price)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          orderId,
          item.product_id ?? '',
          item.product_name ?? '',
          item.product_image ?? '',
          Number(item.quantity || 1),
          Number(item.price || 0),
        ],
      });
    }

    console.log(`[DB] Itens inseridos com sucesso.`);

    const order = await getOrder(orderId);
    return order;
  } catch (error) {
    console.error("[DB] Erro fatal em createOrder:", error);
    throw error;
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  try {
    if (!isTursoActive()) return null;

    const res = await turso.execute({ sql: 'SELECT * FROM orders WHERE id = ? LIMIT 1', args: [id] });
    if (res.rows.length === 0) return null;

    const withItems = await attachItemsToOrders<Order>(res.rows as Row[]);
    return withItems[0];
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    if (!isTursoActive()) return [];

    const res = await turso.execute('SELECT * FROM orders ORDER BY created_at DESC');
    return attachItemsToOrders<Order>(res.rows as Row[]);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({
      sql: 'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      args: [status, new Date().toISOString(), id],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    await turso.execute({ sql: 'DELETE FROM order_items WHERE order_id = ?', args: [id] });
    await turso.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
}

// --- Home Blocks ---

export async function getHomeBlocks(activeOnly = true): Promise<HomeBlock[]> {
  try {
    if (!isTursoActive()) return [];

    const sql = activeOnly
      ? 'SELECT * FROM home_blocks WHERE active = 1 ORDER BY display_order ASC'
      : 'SELECT * FROM home_blocks ORDER BY display_order ASC';
    const res = await turso.execute(sql);
    return res.rows.map(r => ({
      id: String(r.id),
      title: String(r.title),
      category_id: String(r.category_id),
      display_order: Number(r.display_order || 0),
      active: Boolean(r.active)
    })) as HomeBlock[];
  } catch (error) {
    console.error("Error fetching home blocks:", error);
    return [];
  }
}

export async function createHomeBlock(block: Partial<HomeBlock>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const maxOrderRes = await turso.execute(
      'SELECT MAX(display_order) AS max_order FROM home_blocks'
    );
    const nextOrder = Number((maxOrderRes.rows[0] as Row)?.max_order ?? -1) + 1;

    const id = block.id || randomUUID();
    await turso.execute({
      sql: `INSERT INTO home_blocks (id, title, category_id, display_order, active)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        id,
        block.title ?? '',
        block.category_id ?? '',
        block.display_order ?? nextOrder,
        block.active === false ? 0 : 1,
      ],
    });

    return { id, title: block.title, category_id: block.category_id, display_order: block.display_order ?? nextOrder, active: true };
  } catch (error) {
    console.error("Error creating home block:", error);
    throw error;
  }
}

export async function updateHomeBlock(id: string, updates: Partial<HomeBlock>) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');

    const dbUpdates: Record<string, string | number | null> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
    if (updates.display_order !== undefined) dbUpdates.display_order = Number(updates.display_order);
    if (updates.active !== undefined) dbUpdates.active = updates.active ? 1 : 0;

    const keys = Object.keys(dbUpdates);
    if (keys.length === 0) return null;

    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const res = await turso.execute({
      sql: `UPDATE home_blocks SET ${setClause} WHERE id = ? RETURNING *`,
      args: [...keys.map(k => dbUpdates[k]), id],
    });

    return res.rows[0] ?? null;
  } catch (error) {
    console.error("Error updating home block:", error);
    throw error;
  }
}

export async function deleteHomeBlock(id: string) {
  try {
    if (!isTursoActive()) throw new Error('Banco de dados não configurado');
    await turso.execute({ sql: 'DELETE FROM home_blocks WHERE id = ?', args: [id] });
  } catch (error) {
    console.error("Error deleting home block:", error);
    throw error;
  }
}
