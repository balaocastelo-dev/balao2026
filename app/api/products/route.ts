import { NextResponse } from 'next/server';
import { getProducts, getProductsPaginated, getProductsLite, saveProducts, createProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sem parâmetros: comportamento original (array completo) — mantido para não
// quebrar quem já consome assim (CRM, importação, gerador). Com `page`/
// `limit`/`search`/`category`, pagina no banco. Com `lite=1`, devolve só
// id/name/image de TODOS os produtos (usado pelas rotinas de manutenção do
// admin, que precisam varrer o catálogo inteiro sem puxar specs/descrição).
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
    const { products, total } = await getProductsPaginated({
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

  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if bulk import
    if (body.products && Array.isArray(body.products)) {
        await saveProducts(body.products);
        return NextResponse.json({ success: true, count: body.products.length });
    }

    // Single product creation
    const newProduct = await createProduct(body);
    return NextResponse.json(newProduct);

  } catch (e) {
    console.error("API Error:", e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
