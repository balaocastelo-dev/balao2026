import { NextResponse } from 'next/server';
import { isTursoActive, turso } from '@/lib/turso';

export const dynamic = 'force-dynamic';

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
export async function GET() {
  const configurado = isTursoActive();

  let conecta = false;
  let produtos: number | null = null;
  let erro: string | null = null;

  if (configurado) {
    try {
      const res = await turso.execute('SELECT COUNT(*) AS total FROM products');
      conecta = true;
      produtos = Number((res.rows?.[0] as Record<string, unknown>)?.total ?? 0);
    } catch (e) {
      erro = e instanceof Error ? e.message.slice(0, 200) : 'falha desconhecida';
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
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
