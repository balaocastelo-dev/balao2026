import { NextResponse, NextRequest } from 'next/server';
import { updateProduct, deleteProduct } from '@/lib/db';
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
