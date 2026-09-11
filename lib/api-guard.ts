import { NextResponse } from "next/server";
import { isPainelAuthenticated } from "./painel-auth";

/**
 * Tranca uma rota de API atrás da sessão do painel.
 *
 * Existe porque as rotas de `/api/weekly/*` — o fechamento de caixa da loja —
 * estavam ABERTAS: qualquer pessoa com o endereço lia o faturamento, as
 * despesas e os salários, e podia apagar tudo. O portão da tela `/fechamento`
 * é só do lado do navegador (`sessionStorage`), então não protegia nada: basta
 * chamar a API direto.
 *
 * Uso:
 *
 *   const barrado = await exigirPainel();
 *   if (barrado) return barrado;
 */
export async function exigirPainel() {
  if (await isPainelAuthenticated()) return null;

  return NextResponse.json(
    { error: "Acesso restrito. Entre com a senha do painel em /crm." },
    { status: 401 }
  );
}
