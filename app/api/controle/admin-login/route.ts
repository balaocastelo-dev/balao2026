import { NextRequest, NextResponse } from "next/server";

import {
  CONTROLE_ADMIN_COOKIE,
  getSecondsUntilBrazilMidnight,
  isDailyPasswordValid,
} from "@/lib/controle/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body?.password ?? "").trim();

    if (!isDailyPasswordValid(password)) {
      return NextResponse.json(
        { error: "Senha administrativa invalida." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: CONTROLE_ADMIN_COOKIE,
      value: password,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getSecondsUntilBrazilMidnight(),
    });

    return response;
  } catch (error) {
    console.error("Erro no login do controle:", error);
    return NextResponse.json(
      { error: "Nao foi possivel validar a senha." },
      { status: 500 },
    );
  }
}
