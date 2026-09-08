import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  EQUIPE_COOKIE_NAME,
  montarCookieDaEquipe,
  montarTokenDaEquipe,
  opcoesDoCookieDaEquipe,
  tokenDaEquipeEhValido,
} from "@/lib/equipe";

/**
 * Login dos vendedores criados pelo dashboard (/crm).
 *
 * A senha chega aqui, vira token e some — o que segue para o servidor de
 * atendimento (e o que fica no cookie) é só o token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = String(body?.slug || "").trim().toLowerCase();
    const senha = String(body?.senha || "");

    if (!slug || !senha) {
      return NextResponse.json({ success: false, error: "Senha incorreta." }, { status: 401 });
    }

    const token = montarTokenDaEquipe(slug, senha);

    // Mesma resposta para vendedor inexistente e senha errada, para a tela de
    // login não virar uma lista de quem trabalha aqui.
    if (!(await tokenDaEquipeEhValido(slug, token))) {
      return NextResponse.json({ success: false, error: "Senha incorreta." }, { status: 401 });
    }

    const armazenamento = await cookies();
    armazenamento.set(
      EQUIPE_COOKIE_NAME,
      montarCookieDaEquipe(slug, token),
      opcoesDoCookieDaEquipe()
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Não foi possível entrar agora." },
      { status: 500 }
    );
  }
}
