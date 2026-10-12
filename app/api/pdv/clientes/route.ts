// PDV: cliente pelo CPF/CNPJ — se já existe no Bling, o balcão preenche sozinho.
import { NextResponse } from "next/server";
import { operadorDoPdv, RESPOSTA_SEM_SESSAO } from "@/lib/pdv/sessao";
import { buscarClientePorDocumento, SemAcessoAoBling } from "@/lib/pdv/bling";
import { documentoValido, soDigitos } from "@/lib/pdv/calculos";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await operadorDoPdv())) return NextResponse.json(RESPOSTA_SEM_SESSAO, { status: 401 });
  const doc = soDigitos(new URL(req.url).searchParams.get("documento"));
  if (!documentoValido(doc)) return NextResponse.json({ erro: "CPF/CNPJ inválido." }, { status: 400 });
  try {
    return NextResponse.json({ cliente: await buscarClientePorDocumento(doc) });
  } catch (e) {
    const status = e instanceof SemAcessoAoBling ? 503 : 502;
    return NextResponse.json({ cliente: null, erro: (e as Error).message }, { status });
  }
}
