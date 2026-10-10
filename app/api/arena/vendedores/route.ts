import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { turso, isTursoActive } from '@/lib/turso';
import { isPainelAuthenticated } from '@/lib/painel-auth';

export async function GET() {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 500 }
      );
    }

    const res = await turso.execute(
      'SELECT id, nome, avatar_url, veiculo_emoji FROM arena_vendedores ORDER BY nome ASC'
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Criar competidor é administração da Arena: só com a sessão do painel, igual
// às ações de app/arena/actions.ts. Ninguém no site chama este POST (o caixa
// só usa a leitura acima); ele ficava aberto para quem tivesse o endereço.
export async function POST(request: Request) {
  if (!(await isPainelAuthenticated())) {
    return NextResponse.json({ error: 'Acesso negado. Entre no painel do Balão.' }, { status: 401 });
  }

  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const nome = String(body?.nome || '').trim();
    const avatar_url = body?.avatar_url ? String(body.avatar_url).trim() : null;
    const veiculo_emoji = String(body?.veiculo_emoji || '🧑‍💼').trim() || '🧑‍💼';

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome do vendedor é obrigatório' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    await turso.execute({
      sql: `INSERT INTO arena_vendedores (id, nome, avatar_url, veiculo_emoji, meta_valor, vendas_atual)
            VALUES (?, ?, ?, ?, 0, 0)`,
      args: [id, nome, avatar_url, veiculo_emoji],
    });

    const res = await turso.execute({
      sql: 'SELECT id, nome, avatar_url, veiculo_emoji FROM arena_vendedores WHERE id = ?',
      args: [id],
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro inesperado ao criar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
