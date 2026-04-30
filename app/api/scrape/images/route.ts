import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('kabum.com.br')) {
      return NextResponse.json({ error: 'URL inválida ou não suportada. Apenas Kabum é suportado no momento.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao acessar a página: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract product ID from URL
    const productIdMatch = url.match(/\/produto\/(\d+)\//);
    if (!productIdMatch) {
      return NextResponse.json({ error: 'ID do produto não encontrado na URL.' }, { status: 400 });
    }
    const productId = productIdMatch[1];
    
    // Use regex to find all images from Kabum for this product
    // Pattern: https://images.kabum.com.br/produtos/fotos/PRODUCT_ID/FILENAME_g.jpg
    const regex = new RegExp(`https://images\\.kabum\\.com\\.br/produtos/fotos/${productId}/[^"\\s]+_g\\.jpg`, 'g');
    const matches = html.match(regex) || [];
    
    // Clean and unique images
    const uniqueImages = Array.from(new Set(matches)).map(img => img.trim());

    return NextResponse.json({ 
      success: true, 
      images: uniqueImages,
      count: uniqueImages.length
    });

  } catch (e: any) {
    console.error("Scrape Error:", e);
    return NextResponse.json({ success: false, error: e.message || 'Erro ao extrair imagens' }, { status: 500 });
  }
}
