import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPainelSessionToken,
  isPainelPasswordValid,
  PAINEL_COOKIE_NAME,
} from "@/lib/painel-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body?.password || "");

    if (!isPainelPasswordValid(password)) {
      return NextResponse.json({ success: false, error: "Senha invalida" }, { status: 401 });
    }

    const store = await cookies();
    store.set(PAINEL_COOKIE_NAME, getPainelSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Falha ao autenticar" }, { status: 500 });
  }
}
