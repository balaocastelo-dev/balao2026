import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { exigirPainel } from "@/lib/api-guard";
import { URL_AUTORIZACAO, blingPendencias } from "@/lib/bling";

export const dynamic = "force-dynamic";

export const COOKIE_ESTADO = "bling_oauth_state";

/**
 * Começa a conexão com o Bling: manda o Thiago para a tela de autorização.
 *
 * Trancada atrás da senha do painel. Quem abre este endereço está prestes a
 * ligar o ERP da loja a este site — não é rota pública.
 *
 * O `state` é sorteado e guardado num cookie httpOnly para o callback
 * conferir. Sem isso, alguém poderia entregar ao Thiago um link de callback
 * com um `code` de OUTRA conta Bling e a loja passaria a ler o ERP de um
 * terceiro sem ninguém notar (CSRF de OAuth).
 */
export async function GET() {
  const barrado = await exigirPainel();
  if (barrado) return barrado;

  const faltas = blingPendencias();
  if (faltas.length) {
    return NextResponse.json(
      { ok: false, erro: "Bling não configurado", pendencias: faltas },
      { status: 400 }
    );
  }

  const estado = randomBytes(24).toString("hex");
  const store = await cookies();
  store.set(COOKIE_ESTADO, estado, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // o code do Bling expira em 1 minuto; 10 é folga de sobra
    path: "/",
  });

  const destino = new URL(URL_AUTORIZACAO);
  destino.searchParams.set("response_type", "code");
  destino.searchParams.set("client_id", process.env.BLING_CLIENT_ID || "");
  destino.searchParams.set("state", estado);

  return NextResponse.redirect(destino.toString());
}
