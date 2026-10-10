import { NextRequest, NextResponse } from "next/server";

import {
  CONTROLE_ADMIN_COOKIE,
  isControleAdminSessionValid,
} from "@/lib/controle/auth";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";

// Quem pode usar as telas da assistência (fechamento e estoque de peças):
//  - quem entrou com a senha do dia, pelo balcão;
//  - quem entrou no painel. A senha do painel é a mais forte das duas e já
//    abre tudo o mais; pedir a do dia por cima seria só atrito.
export async function GET(request: NextRequest) {
  const sessionValue = request.cookies.get(CONTROLE_ADMIN_COOKIE)?.value;
  const peloBalcao = isControleAdminSessionValid(sessionValue);
  const peloPainel = peloBalcao ? false : await isPainelAuthenticated();

  return NextResponse.json({
    authenticated: peloBalcao || peloPainel,
    via: peloBalcao ? "balcao" : peloPainel ? "painel" : null,
  });
}
