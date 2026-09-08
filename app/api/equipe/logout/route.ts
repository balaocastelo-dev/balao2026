import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EQUIPE_COOKIE_NAME, opcoesDoCookieDaEquipe } from "@/lib/equipe";

export async function POST() {
  const armazenamento = await cookies();
  armazenamento.set(EQUIPE_COOKIE_NAME, "", { ...opcoesDoCookieDaEquipe(), maxAge: 0 });

  return NextResponse.json({ success: true });
}
