import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('arena_vendedores')
      .select('id, nome, avatar_url, veiculo_emoji')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar vendedores:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar vendedores' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
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

    const { data, error } = await supabaseAdmin
      .from('arena_vendedores')
      .insert({
        nome,
        avatar_url,
        veiculo_emoji,
        meta_valor: 0,
        vendas_atual: 0,
      })
      .select('id, nome, avatar_url, veiculo_emoji')
      .single();

    if (error) {
      console.error('Erro ao criar vendedor:', error);
      return NextResponse.json(
        { error: 'Erro ao criar vendedor' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro inesperado ao criar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
