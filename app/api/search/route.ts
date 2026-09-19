import { NextResponse } from 'next/server';
import { turso, isTursoActive } from '@/lib/turso';
import { parsePriceToNumber } from '@/lib/utils';

type ProductRow = { price?: unknown };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  if (!isTursoActive()) {
    return NextResponse.json([], { status: 500 });
  }

  try {
    // Busca com lógica AND: todos os termos precisam bater (nome ou descrição)
    const terms = query.trim().split(/\s+/).filter((t) => t.length > 0);
    if (terms.length === 0) return NextResponse.json([]);

    const conditions = terms
      .map(() => '(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)')
      .join(' AND ');
    const args: string[] = [];
    terms.forEach((term) => {
      const like = `%${term.toLowerCase()}%`;
      args.push(like, like);
    });

    const res = await turso.execute({
      sql: `SELECT * FROM products WHERE ${conditions} LIMIT 10`,
      args,
    });

    const sorted = (res.rows as ProductRow[])
      .slice()
      .sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));

    return NextResponse.json(sorted);
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
