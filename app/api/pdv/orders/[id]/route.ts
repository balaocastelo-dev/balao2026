import { NextResponse } from 'next/server';
import { turso, isTursoActive } from '@/lib/turso';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 500 }
      );
    }

    const params = await props.params;
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Busca o pedido
    const orderRes = await turso.execute({
      sql: 'SELECT * FROM orders WHERE id = ? LIMIT 1',
      args: [id],
    });
    const order = orderRes.rows[0];

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // 2. Busca os itens
    let items: any[] = [];
    try {
      const itemsRes = await turso.execute({
        sql: 'SELECT * FROM order_items WHERE order_id = ?',
        args: [id],
      });
      items = itemsRes.rows as any[];
    } catch (itemsError) {
      console.error('Erro ao buscar itens do pedido:', itemsError);
    }

    // 3. Combina os dados
    return NextResponse.json({ ...order, items });
  } catch (error: any) {
    console.error('Erro inesperado ao buscar detalhes do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
