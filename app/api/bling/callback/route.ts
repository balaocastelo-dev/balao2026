import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { trocarCodePorToken } from "@/lib/bling";
import { COOKIE_ESTADO } from "../conectar/route";

export const dynamic = "force-dynamic";

/**
 * Volta do Bling com o `code` e troca pelo par de tokens.
 *
 * Esta rota NÃO exige a senha do painel — o Bling redireciona o navegador
 * para cá e não manda cookie de sessão nenhum. Quem faz o papel da senha aqui
 * é o `state`: só é aceito o code que vier acompanhado do mesmo valor
 * sorteado em /api/bling/conectar, que só existe no cookie httpOnly de quem
 * passou pelo painel.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const estadoRecebido = url.searchParams.get("state") || "";

  const store = await cookies();
  const estadoEsperado = store.get(COOKIE_ESTADO)?.value || "";
  store.delete(COOKIE_ESTADO); // vale uma vez só

  if (!estadoEsperado) {
    return NextResponse.json(
      { ok: false, erro: "Sem pedido de conexão em andamento. Comece pelo painel." },
      { status: 400 }
    );
  }

  const a = Buffer.from(estadoRecebido);
  const b = Buffer.from(estadoEsperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, erro: "state não confere" }, { status: 400 });
  }

  if (!code) {
    const erro = url.searchParams.get("error_description") || url.searchParams.get("error");
    return NextResponse.json(
      { ok: false, erro: erro || "Bling não devolveu o code" },
      { status: 400 }
    );
  }

  try {
    await trocarCodePorToken(code);
  } catch (erro) {
    return NextResponse.json({ ok: false, erro: (erro as Error).message }, { status: 502 });
  }

  return NextResponse.redirect(new URL("/crm?bling=conectado", url.origin));
}
