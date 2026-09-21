import { NextResponse, NextRequest } from 'next/server';
import { updateProduct, deleteProduct, getProductById } from '@/lib/db';
import { invalidarCacheProdutos } from '@/lib/cache';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const updates = await request.json();
    const product = await updateProduct(params.id, updates);
    // Sem isto, o site e o CRM seguiriam mostrando o preco antigo ate o
    // cache expirar.
    invalidarCacheProdutos();
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await deleteProduct(params.id);
    invalidarCacheProdutos();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

// Leitura pública de um produto (os mesmos dados da vitrine). O servidor do
// WhatsApp usa isto para montar a oferta com nome, foto e link do site, em
// vez de confiar no que o navegador mandou.
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const p = await getProductById(id);
    if (!p) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    return NextResponse.json({
      product: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        slug: p.slug,
        category: p.category,
        status: (p as { status?: string }).status ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to read product:', error);
    return NextResponse.json({ error: 'Falha ao ler o produto' }, { status: 500 });
  }
}
