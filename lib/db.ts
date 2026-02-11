import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { Product, CarouselImage, Category, HomeBlock } from './utils';

// Fallback to empty array if connection fails or env vars missing
export async function getProducts(): Promise<Product[]> {
  try {
    const pageSize = 1000;
    let all: Product[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (error) {
        const retry = await supabase
          .from('products')
          .select('*')
          .range(from, from + pageSize - 1);
        if (retry.error) {
          console.error("Supabase error:", retry.error);
          break;
        }
        const chunk = (retry.data as Product[]) || [];
        all = all.concat(chunk);
        if (chunk.length < pageSize) break;
        from += pageSize;
        continue;
      }
      const chunk = (data as Product[]) || [];
      all = all.concat(chunk);
      if (chunk.length < pageSize) break;
      from += pageSize;
    }
    return all;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function saveProducts(products: Product[]) {
  try {
     if (!products || products.length === 0) return;

     // Sanitize products to match DB schema
     const dbProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: String(p.price),
        image: p.image,
        category: p.category,
        slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)
     }));

     console.log(`[saveProducts] Saving ${dbProducts.length} products via supabaseAdmin...`);
     if (dbProducts.length > 0) {
        console.log(`[saveProducts] First item sample: ID=${dbProducts[0].id}, Slug=${dbProducts[0].slug}`);
     }

     // Prefer admin client when available; otherwise, fallback to anon client
     let error: any = null;
     try {
       const { error: adminError } = await supabaseAdmin
         .from('products')
         .upsert(dbProducts, { onConflict: 'id' });
       error = adminError || null;
     } catch (e) {
       error = e;
     }
 
     // Fallback: try anon client if admin failed or not configured
     if (error) {
       console.warn("[saveProducts] Admin upsert failed or not configured, attempting anon fallback...");
       const { error: anonError } = await supabase
         .from('products')
         .upsert(dbProducts, { onConflict: 'id' });
       if (anonError) {
         console.error("Supabase save error details (anon):", JSON.stringify(anonError, null, 2));
         throw new Error(`Database error: ${anonError.message} (${anonError.code})`);
       }
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
        // Sanitize product to only include DB columns
        const dbProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            slug: product.slug
            // cost, supplier, etc. are NOT in DB yet, so we exclude them to prevent errors
        };

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert(dbProduct)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    try {
        // Sanitize updates
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export async function deleteProduct(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

export async function getCarouselImages(activeOnly = true): Promise<CarouselImage[]> {
  try {
    let query = supabase
      .from('carousel_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error (carousel):", error);
      return [];
    }

    return data as CarouselImage[];
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return [];
  }
}

export async function addCarouselImage(imageUrl: string, title?: string, metadata?: any) {
    try {
        // Get max order to append to end
        const { data: maxOrderData } = await supabase
            .from('carousel_images')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
        
        const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

        const { data, error } = await supabase
            .from('carousel_images')
            .insert({
                image_url: imageUrl,
                title,
                display_order: nextOrder,
                active: true,
                metadata: metadata || {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
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
        const { error } = await supabase
            .from('import_history')
            .insert({
                product_count: history.product_count,
                price_percentage: history.price_percentage,
                applied_category: history.applied_category,
                applied_scope: history.applied_scope,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    } catch (error) {
        console.error("Error saving import history:", error);
        // Don't throw, just log, so it doesn't break the import flow
    }
}

export async function deleteCarouselImage(id: string) {
    try {
        const { error } = await supabase
            .from('carousel_images')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        console.error("Error deleting carousel image:", error);
        throw error;
    }
}

export async function updateCarouselImage(id: string, updates: Partial<CarouselImage>) {
    try {
        const { error } = await supabase
            .from('carousel_images')
            .update(updates)
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        console.error("Error updating carousel image:", error);
        throw error;
    }
}

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Supabase error (categories):", error);
            return [];
        }

        return data as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(category: Partial<Category>) {
    try {
        // Get max order
        const { data: maxOrderData } = await supabaseAdmin
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
        
        const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

        // Sanitize input
        const dbCategory = {
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id || null, // Ensure empty string becomes null
            display_order: category.display_order ?? nextOrder,
            icon: category.icon || null,
            active: category.active ?? true
        };

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert(dbCategory)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    try {
        console.log(`[DB] Updating category ${id} via supabaseAdmin`, updates);
        
        // Sanitize updates
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.parent_id !== undefined) dbUpdates.parent_id = updates.parent_id || null;
        if (updates.display_order !== undefined) dbUpdates.display_order = updates.display_order;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon || null;
        if (updates.active !== undefined) dbUpdates.active = updates.active;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error (update category):", error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

export async function deleteCategory(id: string) {
    try {
        console.log(`[DB] Deleting category ${id} via supabaseAdmin`);
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase error (delete category):", error);
            throw error;
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
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
    address: any;
    created_at: string;
    items?: OrderItem[];
    coupon_code?: string;
    discount_value?: number;
}

export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const itemsWithOrderId = items.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(itemsWithOrderId);

        if (itemsError) throw itemsError;

        return order;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

export async function getOrder(id: string): Promise<Order | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Supabase error (order):", error);
            return null;
        }

        return data as Order;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

export async function getOrders(): Promise<Order[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error (orders):", error);
            return [];
        }

        return data as Order[];
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function getUserOrders(
    userId: string, 
    email: string,
    filters: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
    } = {}
): Promise<{ data: Order[], count: number }> {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            search,
            startDate,
            endDate
        } = filters;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `, { count: 'exact' })
            .or(`user_id.eq.${userId},customer_email.eq.${email}`)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.eq('id', search);
        }

        if (startDate) {
            query = query.gte('created_at', startDate);
        }

        if (endDate) {
            // Adjust end date to cover the full day
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query = query.lte('created_at', end.toISOString());
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Supabase error (user orders):", error);
            return { data: [], count: 0 };
        }

        return { data: data as Order[], count: count || 0 };
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return { data: [], count: 0 };
    }
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

export async function deleteOrder(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
}

// --- Home Blocks ---

export async function getHomeBlocks(activeOnly = true): Promise<HomeBlock[]> {
  try {
    let query = supabase
      .from('home_blocks')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty array gracefully
      if (error.code === '42P01') return [];
      console.error("Supabase error (home_blocks):", error);
      return [];
    }

    return data as HomeBlock[];
  } catch (error) {
    console.error("Error fetching home blocks:", error);
    return [];
  }
}

export async function createHomeBlock(block: Partial<HomeBlock>) {
  try {
     // Get max order
    const { data: maxOrderData } = await supabaseAdmin
        .from('home_blocks')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
    
    const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabaseAdmin
      .from('home_blocks')
      .insert({
        ...block,
        display_order: nextOrder
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating home block:", error);
    throw error;
  }
}

export async function updateHomeBlock(id: string, updates: Partial<HomeBlock>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('home_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating home block:", error);
    throw error;
  }
}

export async function deleteHomeBlock(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('home_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting home block:", error);
    throw error;
  }
}
