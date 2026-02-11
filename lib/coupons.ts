import { supabaseAdmin } from './supabase-admin';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  discount?: number;
  coupon?: any;
}

export async function validateCoupon(code: string, cartTotal: number, items: any[]): Promise<ValidationResult> {
  if (!code) return { valid: false, message: "Código inválido." };

  // Case insensitive search
  const { data: coupons, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .limit(1);

  if (error || !coupons || coupons.length === 0) {
      return { valid: false, message: "Cupom não encontrado." };
  }

  const coupon = coupons[0];

  // 1. Check status
  if (coupon.status !== 'active') {
      return { valid: false, message: "Este cupom não está mais ativo." };
  }

  // 2. Check expiration
  if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
      return { valid: false, message: "Este cupom expirou." };
  }

  // 3. Check usage limits
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { valid: false, message: "Este cupom atingiu o limite de uso global." };
  }

  // 4. Check minimum purchase
  if (coupon.min_purchase_value && cartTotal < coupon.min_purchase_value) {
      return { valid: false, message: `Valor mínimo para este cupom é R$ ${coupon.min_purchase_value.toFixed(2)}` };
  }

  // 5. Check Product/Category Eligibility
  let eligibleItems = items || [];
  const hasProductRestrictions = coupon.applicable_products && Array.isArray(coupon.applicable_products) && coupon.applicable_products.length > 0;
  const hasCategoryRestrictions = coupon.applicable_categories && Array.isArray(coupon.applicable_categories) && coupon.applicable_categories.length > 0;

  if (hasProductRestrictions || hasCategoryRestrictions) {
       const productIds = new Set(coupon.applicable_products || []);
       const categoryNames = new Set(coupon.applicable_categories || []);
       
       eligibleItems = (items || []).filter((item: any) => {
           const matchProduct = productIds.has(item.id);
           // item.category might be undefined, handle gracefully
           const matchCategory = item.category ? categoryNames.has(item.category) : false;
           return matchProduct || matchCategory;
       });

       if (eligibleItems.length === 0) {
           return { valid: false, message: "Este cupom não se aplica aos produtos no carrinho." };
       }
  }

  // 6. Calculate discount
  let discountAmount = 0;
  
  // Helper to get price
  const getPrice = (p: any) => {
       if (typeof p.price === 'number') return p.price;
       if (typeof p.price === 'string') {
           return parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
       }
       return 0;
  };

  const eligibleTotal = eligibleItems.reduce((acc: number, item: any) => acc + (getPrice(item) * (item.quantity || 1)), 0);
  const total = cartTotal; 
  
  if (coupon.discount_type === 'percentage') {
      discountAmount = (eligibleTotal * coupon.discount_value) / 100;
  } else {
      // Fixed value applies to the eligible total, capped at eligible total
      discountAmount = parseFloat(coupon.discount_value);
      if (discountAmount > eligibleTotal) discountAmount = eligibleTotal;
  }

  // Cap discount at total cart value (redundant but safe)
  if (discountAmount > total) discountAmount = total;

  return { 
      valid: true, 
      discount: discountAmount,
      coupon: {
          code: coupon.code, // Return the correct casing
          type: coupon.discount_type,
          value: coupon.discount_value,
          id: coupon.id
      }
  };
}

export async function getCouponByCode(code: string) {
    const { data: coupons, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .ilike('code', code)
        .limit(1);

    if (error || !coupons || coupons.length === 0) {
        return null;
    }
    return coupons[0];
}

export async function getUserCoupons(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('user_coupons')
        .select(`
            id,
            status,
            created_at,
            coupon:coupons (
                id,
                code,
                discount_type,
                discount_value,
                min_purchase_value,
                expiration_date,
                description,
                status
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function assignCouponToUser(userId: string, couponId: string) {
    // Check if already exists
    const { data: existing } = await supabaseAdmin
        .from('user_coupons')
        .select('id')
        .eq('user_id', userId)
        .eq('coupon_id', couponId)
        .single();

    if (existing) {
        throw new Error("Você já possui este cupom em sua carteira.");
    }

    const { data, error } = await supabaseAdmin
        .from('user_coupons')
        .insert({
            user_id: userId,
            coupon_id: couponId,
            status: 'available'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
