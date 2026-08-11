import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { parsePriceToNumber } from '@/lib/utils';

type ProductRow = { price?: unknown };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  try {
    // Call the Supabase RPC function for full-text search
    const { data: products, error } = await supabase.rpc('search_products_fts', {
      query_text: query,
      limit_count: 10
    });

    if (error) {
      console.error('Search RPC Error:', error);
      // Fallback to basic search if RPC fails (e.g. migration not applied yet)
      // Uses strict AND logic for each term
      let queryBuilder = supabase.from('products').select('*');
      
      const terms = query.trim().split(/\s+/);
      terms.forEach(term => {
          if (term.length > 0) {
              queryBuilder = queryBuilder.ilike('name', `%${term}%`);
          }
      });

      const { data: fallbackData } = await queryBuilder.limit(10);

      const fallback = (fallbackData || []) as ProductRow[];
      const sorted = fallback
        .slice()
        .sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));

      return NextResponse.json(sorted);
    }

    return NextResponse.json(
      ((products || []) as ProductRow[])
        .slice()
        .sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price))
    );
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
