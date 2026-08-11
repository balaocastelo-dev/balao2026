import { supabaseAdmin } from './supabase-admin';
import { turso, isTursoActive } from './turso';

const hasTurso = isTursoActive();

export interface ValidationResult {
  valid: boolean;
  message?: string;
  discount?: number;
  coupon?: any;
}

function parseJsonArray<T = any>(value: any, fallback: T[]): T[] {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return value as T[];
  try {
    const parsed = JSON.parse(String(value));
    if (Array.isArray(parsed)) return parsed as T[];
    return fallback;
  } catch {
    return fallback;
  }
}

function getPrice(p: any): number {
  if (typeof p.price === 'number') return p.price;
  if (typeof p.price === 'string') {
    return parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
  }
  return 0;
}

export async function validateCoupon(code: string, cartTotal: number, items: any[]): Promise<ValidationResult> {
  if (!code) return { valid: false, message: "Código inválido." };

  let coupon: any = null;

  if (hasTurso) {
    try {
      const res = await turso.execute({
        sql: 'SELECT * FROM coupons WHERE LOWER(code) = LOWER(?) LIMIT 1',
        args: [code],
      });
      if (res.rows.length > 0) {
        const raw = res.rows[0] as any;
        coupon = {
          id: raw.id,
          code: raw.code,
          discount_type: raw.discount_type,
          discount_value: Number(raw.discount_value || 0),
          expiration_date: raw.expiration_date,
          max_uses: raw.max_uses != null ? Number(raw.max_uses) : null,
          current_uses: Number(raw.current_uses || 0),
          status: raw.status,
          min_purchase_value: Number(raw.min_purchase_value || 0),
          applicable_products: parseJsonArray(raw.applicable_products, []),
          applicable_categories: parseJsonArray(raw.applicable_categories, []),
        };
      }
    } catch (e) {
      console.warn("[coupons] Turso validateCoupon failed, falling back Supabase:", (e as any).message);
    }
  }

  if (!coupon) {
    try {
      const { data: coupons, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .ilike('code', code)
        .limit(1);

      if (error || !coupons || coupons.length === 0) {
        return { valid: false, message: "Cupom não encontrado." };
      }
      coupon = coupons[0];
    } catch (e) {
      return { valid: false, message: "Cupom não encontrado." };
    }
  }

  if (!coupon) {
    return { valid: false, message: "Cupom não encontrado." };
  }

  if (coupon.status !== 'active') {
    return { valid: false, message: "Este cupom não está mais ativo." };
  }

  if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
    return { valid: false, message: "Este cupom expirou." };
  }

  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, message: "Este cupom atingiu o limite de uso global." };
  }

  if (coupon.min_purchase_value && cartTotal < coupon.min_purchase_value) {
    return { valid: false, message: `Valor mínimo para este cupom é R$ ${coupon.min_purchase_value.toFixed(2)}` };
  }

  let eligibleItems = items || [];
  const hasProductRestrictions = coupon.applicable_products && Array.isArray(coupon.applicable_products) && coupon.applicable_products.length > 0;
  const hasCategoryRestrictions = coupon.applicable_categories && Array.isArray(coupon.applicable_categories) && coupon.applicable_categories.length > 0;

  if (hasProductRestrictions || hasCategoryRestrictions) {
    const productIds = new Set(coupon.applicable_products || []);
    const categoryNames = new Set(coupon.applicable_categories || []);

    eligibleItems = (items || []).filter((item: any) => {
      const matchProduct = productIds.has(item.id);
      const matchCategory = item.category ? categoryNames.has(item.category) : false;
      return matchProduct || matchCategory;
    });

    if (eligibleItems.length === 0) {
      return { valid: false, message: "Este cupom não se aplica aos produtos no carrinho." };
    }
  }

  let discountAmount = 0;

  const eligibleTotal = eligibleItems.reduce((acc: number, item: any) => acc + (getPrice(item) * (item.quantity || 1)), 0);
  const total = cartTotal;

  if (coupon.discount_type === 'percentage') {
    discountAmount = (eligibleTotal * coupon.discount_value) / 100;
  } else {
    discountAmount = parseFloat(coupon.discount_value);
    if (discountAmount > eligibleTotal) discountAmount = eligibleTotal;
  }

  if (discountAmount > total) discountAmount = total;

  return {
    valid: true,
    discount: discountAmount,
    coupon: {
      code: coupon.code,
      type: coupon.discount_type,
      value: coupon.discount_value,
      id: coupon.id
    }
  };
}
