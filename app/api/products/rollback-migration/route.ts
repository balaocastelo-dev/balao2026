import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    const results: any[] = [];

    for (const id of ids) {
      try {
        const { data: product, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('id, image, original_image, migration_status')
          .eq('id', id)
          .single();

        if (fetchError || !product) {
          results.push({ id, status: 'error', error: 'Product not found' });
          continue;
        }

        if (!product.original_image) {
          results.push({ id, status: 'skipped', message: 'No original image backup found' });
          continue;
        }

        // Restore original image
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({
            image: product.original_image,
            migration_status: 'pending', // Reset status so it can be migrated again if needed
            migration_error: null,
            migrated_at: null
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // Optional: Delete the file from Supabase Storage to save space
        // We can try to parse the path from the current Supabase URL
        if (product.image && product.image.includes('supabase.co')) {
            try {
                // Extract path after /storage/v1/object/public/products/
                // URL format: .../storage/v1/object/public/products/produtos/ID/imagem.webp
                const urlParts = product.image.split('/products/');
                if (urlParts.length > 1) {
                    const filePath = urlParts[1];
                    await supabaseAdmin.storage
                        .from('products')
                        .remove([filePath]);
                }
            } catch (cleanupError) {
                console.warn(`Failed to cleanup storage for product ${id}:`, cleanupError);
                // Non-blocking error
            }
        }

        results.push({ id, status: 'success', restoredUrl: product.original_image });

      } catch (error: any) {
        console.error(`Rollback error for product ${id}:`, error);
        results.push({ id, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Rollback API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
