import { NextResponse } from 'next/server';
import { turso, isTursoActive } from '@/lib/turso';

// `id` é TEXT no schema (pode ser UUID ou código numérico do fornecedor) —
// nunca coagir pra Number: `Number("uuid...")` vira NaN e o UPDATE por id
// simplesmente não bate com nenhuma linha (falha silenciosa).
type ProductPriceRow = { id: string; price: string | number };

export async function POST(request: Request) {
  try {
    const { ids, action, value } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    if (!isTursoActive()) {
      return NextResponse.json({ error: 'Configuração ausente: banco de dados não inicializado' }, { status: 500 });
    }

    if (action === 'update_category') {
      const placeholders = ids.map(() => '?').join(', ');
      await turso.execute(
        { sql: `UPDATE products SET category = ? WHERE id IN (${placeholders})`, args: [value, ...ids] }
      );
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'update_price') {
      const percentage = parseFloat(value);

      const placeholders = ids.map(() => '?').join(', ');
      const rs = await turso.execute(
        { sql: `SELECT id, price FROM products WHERE id IN (${placeholders})`, args: [...ids] }
      );
      const products: ProductPriceRow[] = rs.rows.map(r => ({ id: String(r.id), price: r.price as string | number }));

      const updates = products.map((p: ProductPriceRow) => {
        let priceNum = 0;
        if (typeof p.price === 'string') {
          priceNum = parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        } else if (typeof p.price === 'number') {
          priceNum = p.price;
        }
        if (isNaN(priceNum)) priceNum = 0;

        const newPriceNum = priceNum * (1 + percentage / 100);
        const newPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceNum);
        return { id: p.id, price: newPriceFormatted };
      });

      for (const u of updates) {
        await turso.execute({ sql: `UPDATE products SET price = ? WHERE id = ?`, args: [u.price, u.id] });
      }

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update products' }, { status: 500 });
  }
}
