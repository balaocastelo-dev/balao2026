import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";

export async function POST(request: Request) {
  try {
    const { code, cartTotal, items } = await request.json();
    const result = await validateCoupon(code, parseFloat(cartTotal), items);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ valid: false, message: "Erro interno ao validar cupom." }, { status: 500 });
  }
}
