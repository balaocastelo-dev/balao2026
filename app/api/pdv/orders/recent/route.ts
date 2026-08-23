import { NextResponse } from 'next/server';
import { turso, isTursoActive } from '@/lib/turso';

export async function GET(request: Request) {
  try {
    if (!isTursoActive()) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: string[] = [];
    const args: string[] = [];
    if (startDate) {
      where.push('created_at >= ?');
      args.push(startDate);
    }
    if (endDate) {
      // Se for só a data (YYYY-MM-DD), incluir o dia inteiro
      const end = /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? `${endDate}T23:59:59.999Z` : endDate;
      where.push('created_at <= ?');
      args.push(end);
    }

    const sql = `SELECT id, customer_name, total, created_at, payment_method, origin
                 FROM orders
                 ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY created_at DESC
                 LIMIT 50`;

    const res = await turso.execute({ sql, args });

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
