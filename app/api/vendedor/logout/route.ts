import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { VENDEDOR_COOKIE_NAME, getCookieOptions } from "@/lib/vendedor-auth";

export async function POST() {
  const store = await cookies();
  store.set(VENDEDOR_COOKIE_NAME, "", { ...getCookieOptions(), maxAge: 0 });

  return NextResponse.json({ success: true });
}
