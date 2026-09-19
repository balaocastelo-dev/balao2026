import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  VENDEDOR_COOKIE_NAME,
  buildCookieValue,
  getCookieOptions,
  isSenhaVendedorValida,
} from "@/lib/vendedor-auth";
import { getVendedorPorSlug, vendedorPublico } from "@/lib/vendedores";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = String(body?.slug || "").trim().toLowerCase();
    const senha = String(body?.senha || "");

    const vendedor = getVendedorPorSlug(slug);

    // Mesma resposta para vendedor inexistente e senha errada, para a tela
    // de login não virar uma lista de quem trabalha aqui.
    if (!vendedor || !isSenhaVendedorValida(vendedor, senha)) {
      return NextResponse.json(
        { success: false, error: "Senha incorreta." },
        { status: 401 }
      );
    }

    const store = await cookies();
    store.set(VENDEDOR_COOKIE_NAME, buildCookieValue(vendedor), getCookieOptions());

    return NextResponse.json({ success: true, vendedor: vendedorPublico(vendedor) });
  } catch {
    return NextResponse.json(
      { success: false, error: "Não foi possível entrar agora." },
      { status: 500 }
    );
  }
}
