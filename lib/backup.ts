import { turso, isTursoActive } from "./turso";

// ============================================================
// Cópia de segurança do banco.
//
// Por que existe: o `/fechamento` perdeu 276 ordens de serviço e 24 despesas
// na migração de banco, e só foi possível recuperar porque havia um backup
// antigo esquecido numa pasta do computador. Não havia — e não há — nenhuma
// rotina. Da próxima vez podia não ter.
//
// O que é copiado é o DADO, em JSON: nada de estrutura de tabela. É o que
// importa para recuperar, é legível daqui a anos e não depende da versão do
// MySQL nem de ferramenta nenhuma para ser lido.
// ============================================================

/**
 * As tabelas do sistema, em ordem de importância.
 *
 * A ordem importa quando o backup é parcial: se o banco começar a recusar no
 * meio, o que já veio é o que mais dói perder. Dinheiro e cliente primeiro;
 * o que pode ser gerado de novo (log, visita, rascunho de blog) por último.
 */
export const TABELAS_DO_BACKUP = [
  // Impossível de reconstruir: é dinheiro e é histórico de serviço.
  "weekly_orders",
  "weekly_expenses",
  "orders",
  "order_items",
  // O catálogo e quem o navega.
  "products",
  "categories",
  "used_notebooks",
  "coupons",
  // Contato de gente: some e não volta.
  "contatos_capturados",
  "unsubscribed_emails",
  "arena_vendedores",
  // Conteúdo editado à mão.
  "carousel_images",
  "home_blocks",
  "topbar_messages",
  "blog_posts",
  // Reconstruível ou descartável.
  "blog_source_items",
  "import_history",
  "audit_logs",
  "site_visits",
  "site_conversion_events",
] as const;

export interface ResultadoDoBackup {
  geradoEm: string;
  tabelas: Record<string, unknown[]>;
  contagem: Record<string, number>;
  falhas: Record<string, string>;
  totalDeLinhas: number;
}

/**
 * Lê todas as tabelas e devolve o conteúdo.
 *
 * Uma tabela que falha não derruba o backup: ela entra em `falhas` e as outras
 * seguem. Backup parcial com aviso vale muito mais que backup nenhum — e sem o
 * aviso, um arquivo faltando metade passaria por completo.
 */
export async function gerarBackup(limitePorTabela = 50_000): Promise<ResultadoDoBackup> {
  const tabelas: Record<string, unknown[]> = {};
  const contagem: Record<string, number> = {};
  const falhas: Record<string, string> = {};

  if (!isTursoActive()) {
    return {
      geradoEm: new Date().toISOString(),
      tabelas,
      contagem,
      falhas: { _banco: "credenciais do banco não configuradas" },
      totalDeLinhas: 0,
    };
  }

  for (const tabela of TABELAS_DO_BACKUP) {
    try {
      // O nome vem da lista fixa acima, nunca de fora — por isso pode ir
      // direto no SQL. O MySQL também não aceita `?` em LIMIT.
      const res = await turso.execute(
        `SELECT * FROM \`${tabela}\` LIMIT ${Math.trunc(limitePorTabela)}`
      );
      tabelas[tabela] = res.rows;
      contagem[tabela] = res.rows.length;
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      // Tabela que não existe neste banco não é falha: é só uma tabela que
      // este projeto não usa mais.
      if (/doesn'?t exist|Unknown table/i.test(mensagem)) continue;
      falhas[tabela] = mensagem.slice(0, 200);
    }
  }

  return {
    geradoEm: new Date().toISOString(),
    tabelas,
    contagem,
    falhas,
    totalDeLinhas: Object.values(contagem).reduce((s, n) => s + n, 0),
  };
}

/**
 * Um backup só vale como backup se tiver o que importa.
 *
 * Um arquivo com zero linha — gerado no minuto em que o banco recusou — não
 * pode substituir a cópia boa de ontem. É o mesmo cuidado do espelho do
 * catálogo, pela mesma razão: o pior momento para perder a cópia é justamente
 * quando o banco está fora.
 */
export function backupPareceUtil(resultado: {
  totalDeLinhas?: number;
  contagem?: Record<string, number>;
}) {
  return (resultado?.totalDeLinhas || 0) > 0;
}
