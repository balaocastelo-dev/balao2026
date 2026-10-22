// PDV: a ligação com o /sistema (MEU BLING) — se está de pé agora, e os vendedores.
import { NextResponse } from "next/server";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { statusDoSistema, vendedores } from "@/lib/pdv/sistema";

export const dynamic = "force-dynamic";

export async function GET() {
  const operador = await operadorDoPdv();
  if (!operador) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const [acesso, v] = await Promise.all([
    statusDoSistema(),
    vendedores()
      .then((r) => ({ ...r, erro: null as string | null }))
      .catch((e) => ({ lista: [] as { id: string; nome: string }[], doSistema: false, erro: (e as Error).message })),
  ]);
  return NextResponse.json({ operador, acesso, vendedores: v.lista, vendedoresDoSistema: v.doSistema, erroVendedores: v.erro });
}
