import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { isTursoActive, turso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

/**
 * Conferência do banco, com cache de 60 segundos.
 *
 * Esta rota abria UMA CONEXÃO a cada chamada — e o banco só aceita 500 por
 * hora. Quem acompanha um deploy consultando de minuto em minuto queima 60
 * conexões por hora só olhando; de vinte em vinte segundos, 180. Foi
 * exatamente o que aconteceu aqui: o monitoramento impedia a cota de se
 * recuperar, e parecia que havia outro consumidor escondido.
 *
 * Um minuto de cache não atrapalha ninguém — o estado do banco não muda de
 * segundo em segundo — e o custo cai para no máximo 60 conexões por hora,
 * mesmo com dez pessoas olhando ao mesmo tempo. Para uma leitura de verdade,
 * `?fresco=1`.
 */
const conferirBanco = unstable_cache(
  async () => {
    try {
      const res = await turso.execute('SELECT COUNT(*) AS total FROM products');
      const total = Number((res.rows?.[0] as Record<string, unknown>)?.total ?? 0);
      return { conecta: true, produtos: total, erro: null as string | null };
    } catch (e) {
      return {
        conecta: false,
        produtos: null as number | null,
        erro: e instanceof Error ? e.message.slice(0, 200) : 'falha desconhecida',
      };
    }
  },
  ['health-banco'],
  { revalidate: 60 }
);

/**
 * Sinal de vida do site, com o estado do banco.
 *
 * O motivo de existir o pedaço do banco: quando o catálogo aparece vazio no
 * site e no CRM, de fora não dá para saber se o banco está sem produtos ou se
 * as credenciais simplesmente não foram configuradas na hospedagem — os dois
 * casos devolvem lista vazia, calados. Aqui a diferença fica explícita.
 *
 * Não expõe host, usuário nem senha: só se estão presentes e se a conexão
 * responde.
 */
export async function GET(request: Request) {
  const configurado = isTursoActive();
  const fresco = new URL(request.url).searchParams.get('fresco') === '1';

  let conecta = false;
  let produtos: number | null = null;
  let erro: string | null = null;

  if (configurado) {
    if (fresco) {
      try {
        const res = await turso.execute('SELECT COUNT(*) AS total FROM products');
        conecta = true;
        produtos = Number((res.rows?.[0] as Record<string, unknown>)?.total ?? 0);
      } catch (e) {
        erro = e instanceof Error ? e.message.slice(0, 200) : 'falha desconhecida';
      }
    } else {
      ({ conecta, produtos, erro } = await conferirBanco());
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    // Qual código está no ar. Sem isto, quando um comportamento não muda
    // depois de publicar, não dá para separar "o deploy não pegou" de "a
    // correção está errada" — e as duas hipóteses levam a caminhos opostos.
    versao: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || 'local',
      mensagem: process.env.VERCEL_GIT_COMMIT_MESSAGE?.slice(0, 120) || null,
      ambiente: process.env.VERCEL_ENV || 'desenvolvimento',
    },
    banco: {
      configurado,
      conecta,
      produtos,
      erro,
      diagnostico: !configurado
        ? 'Variáveis MYSQL_HOST / MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD não estão definidas nesta hospedagem — por isso o catálogo aparece vazio.'
        : !conecta
        ? 'Credenciais definidas, mas a conexão falhou. Confira host, porta e se o IP da hospedagem tem permissão de acesso.'
        : produtos === 0
        ? 'Banco conectado, porém sem nenhum produto cadastrado.'
        : 'Banco conectado e com produtos.',
    },
  });
}
