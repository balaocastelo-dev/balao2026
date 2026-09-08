import { NextResponse } from 'next/server';
import { getProductsLite, saveProducts, createProduct } from '@/lib/db';
import {
  getCachedProducts,
  getCachedProductsPaginated,
  invalidarCacheProdutos,
} from '@/lib/cache';

export const dynamic = 'force-dynamic';

// Sem parâmetros: comportamento original (array completo) — mantido para não
// quebrar quem já consome assim (CRM, importação, gerador). Com `page`/
// `limit`/`search`/`category`, pagina no banco. Com `lite=1`, devolve só
// id/name/image de TODOS os produtos (usado pelas rotinas de manutenção do
// admin, que precisam varrer o catálogo inteiro sem puxar specs/descrição).
//
// As leituras passam pelo cache do Next. Não é otimização à toa: o banco da
// Hostinger aceita 500 conexões por HORA, e a Vercel abre uma por requisição.
// Sem cache, um dia movimentado queimava a cota e o catálogo sumia do site e
// do CRM até a hora virar.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const lite = searchParams.get('lite');

  if (lite) {
    const products = await getProductsLite();
    return NextResponse.json(products);
  }

  if (page || limit || search || category || sort) {
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;
    const { products, total } = await getCachedProductsPaginated({
      page: pageNum,
      limit: limitNum,
      search: search || undefined,
      category: category || undefined,
      sort: sort === 'price_asc' ? 'price_asc' : undefined,
    });
    return NextResponse.json({
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    });
  }

  const products = await getCachedProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if bulk import
    if (body.products && Array.isArray(body.products)) {
        await saveProducts(body.products);
        // Derruba o cache para o site e o CRM verem a mudança na hora, em vez
        // de continuarem mostrando o catálogo antigo.
        invalidarCacheProdutos();
        return NextResponse.json({ success: true, count: body.products.length });
    }

    // Single product creation
    const newProduct = await createProduct(body);
    invalidarCacheProdutos();
    return NextResponse.json(newProduct);

  } catch (e) {
    console.error("API Error:", e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
