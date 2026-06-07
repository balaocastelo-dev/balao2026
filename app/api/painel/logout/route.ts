import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PAINEL_COOKIE_NAME } from "@/lib/painel-auth";

export async function POST() {
  const store = await cookies();
  store.set(PAINEL_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
