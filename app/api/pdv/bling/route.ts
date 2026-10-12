// PDV: a ligação com o Bling — se há acesso agora, e os vendedores.
import { NextResponse } from "next/server";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { situacaoDoAcesso } from "@/lib/pdv/acesso";
import { vendedores } from "@/lib/pdv/bling";

export const dynamic = "force-dynamic";

export async function GET() {
  const operador = await operadorDoPdv();
  if (!operador) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const acesso = await situacaoDoAcesso().catch((e) => ({
    ligado: false,
    motivo: `Não li a gaveta do PDV: ${(e as Error).message}`,
    recebidoEm: null,
    expiraEm: null,
    maquina: null,
  }));
  let lista: { id: string; nome: string }[] = [];
  let vendedoresDoBling = false;
  let erroVendedores: string | null = null;
  try {
    const v = await vendedores();
    lista = v.lista;
    vendedoresDoBling = v.doBling;
  } catch (e) {
    erroVendedores = (e as Error).message;
  }
  return NextResponse.json({ operador, acesso, vendedores: lista, vendedoresDoBling, erroVendedores });
}
