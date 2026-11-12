import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { VENDEDOR_COOKIE_NAME, getCookieOptions } from "@/lib/vendedor-auth";
import { resolverVendedor } from "@/lib/vendedor-pagina";
import { conferirPinDoVendedor } from "@/lib/vendedor-remoto";
import { criarSessaoVendedor } from "@/lib/vendedor-sessao";

export const dynamic = "force-dynamic";

const JANELA_MS = 5 * 60_000;
const LIMITE = 8;
const tentativas = new Map<string, { n: number; ate: number }>();

function chaveDaTentativa(request: Request, slug: string) {
  const xff = request.headers.get("x-forwarded-for") || "";
  const ip = xff.split(",")[0].trim() || "local";
  return `${ip}:${slug}`;
}

function estourou(chave: string) {
  if (tentativas.size > 5000) tentativas.clear();
  const agora = Date.now();
  const atual = tentativas.get(chave);
  if (!atual || atual.ate < agora) {
    tentativas.set(chave, { n: 1, ate: agora + JANELA_MS });
    return false;
  }
  atual.n += 1;
  return atual.n > LIMITE;
}

function recusar(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Entrada da página pessoal. O PIN é conferido no servidor do CRM e não
 * volta nesta resposta, nem vai parar no cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const slug = String(body?.slug || "").trim().toLowerCase();
    const pin = String(body?.pin || "").trim();

    if (!/^[a-z0-9]{1,80}$/.test(slug)) {
      return recusar("PIN incorreto.", 401);
    }
    if (estourou(chaveDaTentativa(request, slug))) {
      return recusar("Muitas tentativas. Espere alguns minutos e tente de novo.", 429);
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return recusar("PIN incorreto.", 401);
    }

    const vendedor = await resolverVendedor(slug);
    if (!vendedor || vendedor.slug !== slug) {
      return recusar("PIN incorreto.", 401);
    }

    const resultado = await conferirPinDoVendedor(pin, vendedor.id);
    if (resultado === "indisponivel") {
      return recusar("Não consegui confirmar o PIN agora. Tente de novo em instantes.", 503);
    }
    if (resultado !== "ok") {
      return recusar("PIN incorreto.", 401);
    }

    const sessao = criarSessaoVendedor(vendedor.id, vendedor.slug);
    if (!sessao) {
      return recusar("Não foi possível entrar agora.", 500);
    }

    const store = await cookies();
    store.set(VENDEDOR_COOKIE_NAME, sessao, getCookieOptions());

    return NextResponse.json({
      success: true,
      vendedor: {
        id: vendedor.id,
        slug: vendedor.slug,
        nome: vendedor.nome,
        cargo: vendedor.cargo,
        assinatura: vendedor.assinatura,
      },
    });
  } catch {
    return recusar("Não foi possível entrar agora.", 500);
  }
}
