import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
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

    // 1. Fetch Order Details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      console.error('Erro ao buscar pedido:', orderError);
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // 2. Fetch Order Items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      console.error('Erro ao buscar itens do pedido:', itemsError);
      // Return order without items if items fetch fails, but log error
    }

    // 3. Combine Data
    const orderDetails = {
      ...order,
      items: items || []
    };

    return NextResponse.json(orderDetails);
  } catch (error: any) {
    console.error('Erro inesperado ao buscar detalhes do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
