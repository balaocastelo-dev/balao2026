import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  VENDEDOR_COOKIE_NAME,
  buildCookieValue,
  getCookieOptions,
  isSenhaVendedorValida,
  getVendedorSessionToken,
} from "@/lib/vendedor-auth";
import { getVendedorPorSlug, vendedorPublico } from "@/lib/vendedores";
import { supabaseAdmin } from "@/lib/supabase";
import { createHash } from "crypto";

function buildToken(slug: string, senha: string) {
  return createHash("sha256").update(`${slug}:${senha}:balao-vendedor`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = String(body?.slug || "").trim().toLowerCase();
    const senha = String(body?.senha || "");

    // 1) Tenta equipe fixa (env var)
    const vendedorFixo = getVendedorPorSlug(slug);
    if (vendedorFixo && isSenhaVendedorValida(vendedorFixo, senha)) {
      const store = await cookies();
      store.set(VENDEDOR_COOKIE_NAME, buildCookieValue(vendedorFixo), getCookieOptions());
      return NextResponse.json({ success: true, vendedor: vendedorPublico(vendedorFixo) });
    }

    // 2) Tenta Supabase sellers (senha simples, ilimitado)
    const { data: seller } = await supabaseAdmin.from("sellers").select("id, name, slug, cargo, senha").eq("slug", slug).eq("ativo", true).limit(1).maybeSingle();
    if (seller && (seller as any).senha) {
      const esperado = buildToken(slug, String((seller as any).senha));
      const recebido = buildToken(slug, senha);
      if (esperado === recebido) {
        // Monta vendedor a partir do Supabase
        const vendedorDB = {
          slug: String((seller as any).slug),
          id: String((seller as any).id),
          nome: String((seller as any).name),
          cargo: String((seller as any).cargo || "Vendas"),
          assinatura: `Atenciosamente,\n*${(seller as any).name}* — Balão da Informática Castelo`,
          envSenha: `VENDEDOR_${slug.toUpperCase()}_SENHA`,
        };
        // Para o cookie, precisamos que getVendedorSessionToken use a senha do DB.
        // Como ele lê da env, vamos criar o cookie manualmente com o token do DB
        const token = buildToken(slug, String((seller as any).senha));
        const store = await cookies();
        store.set(VENDEDOR_COOKIE_NAME, `${slug}.${token}`, getCookieOptions());
        return NextResponse.json({ success: true, vendedor: { id: vendedorDB.id, slug: vendedorDB.slug, nome: vendedorDB.nome, cargo: vendedorDB.cargo, assinatura: vendedorDB.assinatura } });
      }
    }

    // Mesma resposta para vendedor inexistente e senha errada
    return NextResponse.json(
      { success: false, error: "Senha incorreta." },
      { status: 401 }
    );
  } catch (e) {
    console.error("vendedor login error", e);
    return NextResponse.json(
      { success: false, error: "Não foi possível entrar agora." },
      { status: 500 }
    );
  }
}
