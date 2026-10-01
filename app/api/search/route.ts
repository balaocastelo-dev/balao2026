import { NextResponse } from 'next/server';
import { getCachedSearchByTerms } from '@/lib/cache';

/**
 * Caixa de busca do site.
 *
 * Antes consultava o banco direto e, quando a Hostinger recusava conexão por
 * cota, devolvia `[]` com status 500 — ou seja, a busca do cliente morria
 * calada e o navegador não tinha como distinguir "não achei" de "banco fora".
 * Agora passa pela cópia do catálogo (espelho da VPS), que continua
 * respondendo mesmo com o banco indisponível.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query) return NextResponse.json([]);

  const termos = query.trim().split(/\s+/).filter((t) => t.length > 0);
  if (termos.length === 0) return NextResponse.json([]);

  try {
    const achados = await getCachedSearchByTerms(termos, 10);
    return NextResponse.json(achados);
  } catch (err) {
    console.error('Search API Error:', err);
    // Status honesto: o cliente da busca precisa saber que foi falha, não
    // ausência de resultado.
    return NextResponse.json({ error: 'Busca indisponível no momento.' }, { status: 503 });
  }
}
