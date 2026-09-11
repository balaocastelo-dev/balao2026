import { NextResponse } from "next/server";
import { gerarBackup } from "@/lib/backup";
import { isPainelAuthenticated } from "@/lib/painel-auth";

export const dynamic = "force-dynamic";
// Ler vinte tabelas leva tempo; o padrão da Vercel cortaria no meio.
export const maxDuration = 60;

/**
 * Entrega o conteúdo do banco em JSON, para guardar.
 *
 * Duas portas, porque são dois usos diferentes:
 *
 * - **Você, pelo navegador**: já logado no painel, baixa uma cópia para o seu
 *   computador quando quiser.
 * - **A VPS, todo dia**: manda `Authorization: Bearer <BACKUP_TOKEN>` e guarda
 *   a cópia no disco dela.
 *
 * Sem `BACKUP_TOKEN` definido, a porta da máquina fica FECHADA — só a do
 * navegador funciona. Um backup traz faturamento, despesas, salários e contato
 * de cliente; deixar isso aberto por descuido de configuração seria pior do que
 * não ter backup.
 */
function tokenConfere(req: Request) {
  const esperado = (process.env.BACKUP_TOKEN || "").trim();
  if (!esperado) return false;

  const veio = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!veio || veio.length !== esperado.length) return false;

  // Comparação de tempo constante: sem isso, dá para descobrir o token
  // caractere por caractere medindo quanto demora cada resposta.
  let diferenca = 0;
  for (let i = 0; i < esperado.length; i++) {
    diferenca |= esperado.charCodeAt(i) ^ veio.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function GET(req: Request) {
  const pelaMaquina = tokenConfere(req);
  const peloNavegador = pelaMaquina ? false : await isPainelAuthenticated();

  if (!pelaMaquina && !peloNavegador) {
    return NextResponse.json(
      { error: "Acesso restrito. Entre com a senha do painel em /crm." },
      { status: 401 }
    );
  }

  const backup = await gerarBackup();

  const resposta = NextResponse.json(backup);
  // Nome com a data para o navegador salvar direto, sem o usuário renomear.
  if (peloNavegador) {
    const dia = backup.geradoEm.slice(0, 10);
    resposta.headers.set("Content-Disposition", `attachment; filename="balao-backup-${dia}.json"`);
  }
  return resposta;
}
