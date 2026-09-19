import { NextResponse } from 'next/server';
import { isTursoActive, turso, bancoEmPausa } from '@/lib/turso';
import { lerCatalogoDoEspelho } from '@/lib/catalogo-espelho';

export const dynamic = 'force-dynamic';

/**
 * Sinal de vida do site, com o estado do banco e espelho de contingência.
 */
export async function GET() {
  const configurado = isTursoActive();

  let conecta = false;
  let produtos: number | null = null;
  let erro: string | null = null;
  let emPausa = bancoEmPausa();
  let espelhoCount = 0;

  if (configurado && !emPausa) {
    try {
      const res = await turso.execute('SELECT COUNT(*) AS total FROM products');
      conecta = true;
      produtos = Number((res.rows?.[0] as Record<string, unknown>)?.total ?? 0);
    } catch (e) {
      erro = e instanceof Error ? e.message.slice(0, 200) : 'falha desconhecida';
    }
  } else if (emPausa) {
    erro = "Banco em pausa temporária de proteção de cota (500 conexões/h)";
  }

  if (!conecta) {
    try {
      const espelho = await lerCatalogoDoEspelho();
      espelhoCount = espelho.length;
      if (espelhoCount > 0 && produtos === null) {
        produtos = espelhoCount;
      }
    } catch {}
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    banco: {
      configurado,
      conecta,
      emPausa,
      produtos,
      espelhoProdutos: espelhoCount,
      erro,
      diagnostico: !configurado
        ? 'Variáveis MYSQL_HOST / MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD não estão definidas nesta hospedagem — por isso o catálogo aparece vazio.'
        : conecta && produtos === 0
        ? 'Banco conectado, porém sem nenhum produto cadastrado.'
        : conecta
        ? 'Banco conectado e com produtos.'
        : espelhoCount > 0
        ? `Banco temporariamente em limitação de cota na Hostinger (500 conexões/h). Catálogo operando pelo espelho com ${espelhoCount} produtos.`
        : 'Credenciais definidas, mas a conexão falhou e o espelho está indisponível.',
    },
  });
}
