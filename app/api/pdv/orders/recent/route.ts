import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabaseAdmin
      .from('orders')
      .select('id, customer_name, total, created_at, payment_method, origin')
      .order('created_at', { ascending: false })
      .limit(50); // Increased limit slightly

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      // Add one day to include the end date fully if it's just a date string
      // or assume it's a timestamp. If it's YYYY-MM-DD, we might want to set it to end of day.
      // For simplicity, let's assume the client sends ISO strings or we handle it here.
      // If client sends 2023-01-01, we probably want up to 2023-01-01 23:59:59.
      // But usually >= start and <= end is enough if timestamps are passed correctly.
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos' },
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
