import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Product } from '@/lib/utils';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

// Helper to download and process image
async function processImage(url: string): Promise<{ buffer: Buffer; contentType: string; extension: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // Validate with Sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.format) {
        throw new Error('Invalid image format');
    }

    // Compress and Resize
    // Resize to max width 1200px, convert to WebP for better compression
    const processedBuffer = await image
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    return { 
        buffer: processedBuffer, 
        contentType: 'image/webp',
        extension: 'webp'
    };
  } catch (error) {
    console.error(`Error processing image ${url}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    const results: any[] = [];

    // Process each product
    for (const id of ids) {
      try {
        // 1. Get product
        const { data: product, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !product) {
          results.push({ id, status: 'error', error: 'Product not found' });
          continue;
        }

        // Skip if already migrated or internal supabase url
        if (product.image && product.image.includes('supabase.co')) {
          results.push({ id, status: 'skipped', message: 'Already Supabase URL' });
          continue;
        }

        if (!product.image) {
           results.push({ id, status: 'skipped', message: 'No image' });
           continue;
        }

        // 2. Download and Process image
        const processResult = await processImage(product.image);
        if (!processResult) {
          // Log error in DB
           await supabaseAdmin.from('products').update({
              migration_status: 'error',
              migration_error: 'Download/Process failed'
           }).eq('id', id);

           results.push({ id, status: 'error', error: 'Download/Process failed' });
           continue;
        }

        const { buffer, contentType, extension } = processResult;

        // Size Validation (5MB limit still applies, though compression should help)
        if (buffer.length > 5 * 1024 * 1024) {
            await supabaseAdmin.from('products').update({
                migration_status: 'error',
                migration_error: 'Image too large (>5MB after compression)'
            }).eq('id', id);
            results.push({ id, status: 'error', error: 'Image too large (>5MB after compression)' });
            continue;
        }
        
        const fileName = `produtos/${id}/imagem.${extension}`;

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('products')
          .upload(fileName, buffer, {
            contentType,
            upsert: true
          });

        if (uploadError) {
           throw uploadError;
        }

        // 4. Get Public URL
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from('products')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // 5. Update Product
        // Backup original image if not already backed up
        const originalImage = product.original_image || product.image;

        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({
            image: publicUrl,
            original_image: originalImage,
            migration_status: 'migrated',
            migrated_at: new Date().toISOString(),
            migration_error: null
          })
          .eq('id', id);

        if (updateError) throw updateError;

        results.push({ id, status: 'success', newUrl: publicUrl });

      } catch (error: any) {
        console.error(`Migration error for product ${id}:`, error);
        
        // Try to log error to DB
        await supabaseAdmin.from('products').update({
            migration_status: 'error',
            migration_error: error.message || 'Unknown error'
        }).eq('id', id);

        results.push({ id, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Migration API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
