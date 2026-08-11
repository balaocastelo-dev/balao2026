import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';
import { turso, isTursoActive } from '@/lib/turso';

const hasTurso = isTursoActive();

type ProductPriceRow = { id: number; price: string | number };

export async function POST(request: Request) {
  try {
    const { ids, action, value } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    if (!hasAdmin) {
      return NextResponse.json({ error: 'Configuração ausente: banco de dados não inicializado' }, { status: 500 });
    }

    if (action === 'update_category') {
      if (hasTurso && turso) {
        try {
          const placeholders = ids.map(() => '?').join(', ');
          const params = [value, ...ids];
          await turso.execute(
            { sql: `UPDATE products SET category = ? WHERE id IN (${placeholders})`, args: params }
          );
          return NextResponse.json({ success: true, count: ids.length });
        } catch (tursoErr: any) {
          console.warn('[bulk] Turso update_category falhou, tentando Supabase:', tursoErr.message);
        }
      }

      const { error } = await supabaseAdmin
        .from('products')
        .update({ category: value })
        .in('id', ids);

      if (error) throw error;

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'update_price') {
      let products: ProductPriceRow[] = [];
      const percentage = parseFloat(value);

      if (hasTurso && turso) {
        try {
          const placeholders = ids.map(() => '?').join(', ');
          const rs = await turso.execute(
            { sql: `SELECT id, price FROM products WHERE id IN (${placeholders})`, args: [...ids] }
          );
          products = rs.rows.map(r => ({ id: Number(r.id), price: r.price as string | number }));
        } catch (tursoErr: any) {
          console.warn('[bulk] Turso fetch prices falhou, tentando Supabase:', tursoErr.message);
        }
      }

      if (products.length === 0) {
        const { data: sbProducts, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('id, price')
          .in('id', ids);

        if (fetchError) throw fetchError;
        products = (sbProducts || []) as ProductPriceRow[];
      }

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

      if (hasTurso && turso) {
        try {
          const tx = turso.transaction ? await turso.transaction('write') : null;
          for (const u of updates) {
            if (tx) {
              await tx.execute({ sql: `UPDATE products SET price = ? WHERE id = ?`, args: [u.price, u.id] });
            } else {
              await turso.execute({ sql: `UPDATE products SET price = ? WHERE id = ?`, args: [u.price, u.id] });
            }
          }
          if (tx) await tx.commit();
          return NextResponse.json({ success: true, count: ids.length });
        } catch (tursoErr: any) {
          console.warn('[bulk] Turso update_price falhou, tentando Supabase:', tursoErr.message);
        }
      }

      const updatePromises = updates.map(u =>
        supabaseAdmin.from('products').update({ price: u.price }).eq('id', u.id)
      );
      await Promise.all(updatePromises);

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update products' }, { status: 500 });
  }
}
