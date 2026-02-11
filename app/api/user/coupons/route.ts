import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserCoupons, getCouponByCode, assignCouponToUser } from '@/lib/coupons';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await getUserCoupons(user.id);
    return NextResponse.json({ coupons });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
        return NextResponse.json({ error: "Código do cupom é obrigatório" }, { status: 400 });
    }

    // 1. Find coupon
    const coupon = await getCouponByCode(code);
    if (!coupon) {
        return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    // 2. Validate basic eligibility (status, expiration, global limits)
    // Note: We are NOT checking cart limits here, just if the coupon is generally valid to be held.
    if (coupon.status !== 'active') {
        return NextResponse.json({ error: "Este cupom não está mais ativo" }, { status: 400 });
    }
    
    if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
        return NextResponse.json({ error: "Este cupom expirou" }, { status: 400 });
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return NextResponse.json({ error: "Este cupom atingiu o limite de uso global" }, { status: 400 });
    }

    // 3. Assign to user
    try {
        await assignCouponToUser(user.id, coupon.id);
        return NextResponse.json({ success: true, message: "Cupom adicionado com sucesso!" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
