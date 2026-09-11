import { NextResponse } from 'next/server';
import { isTursoActive } from '@/lib/turso';
import { getCachedBusca } from '@/lib/cache';

// Busca da caixa de pesquisa do cabeçalho.
//
// A consulta mora em `lib/db.ts` e passa pelo cache de `lib/cache.ts`. Antes o
// SQL estava aqui dentro, lendo o banco a cada pesquisa de cada visitante — com
// a cota de 500 conexões por HORA da Hostinger, a própria busca do site
// derrubava o catálogo do site inteiro.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  if (!isTursoActive()) {
    return NextResponse.json([], { status: 500 });
  }

  // Teto de termos: sem isso, uma frase enorme viraria uma chave de cache
  // única e inútil, e ainda montaria um SQL com dezenas de condições.
  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return NextResponse.json([]);

  try {
    return NextResponse.json(await getCachedBusca(terms, 10));
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
