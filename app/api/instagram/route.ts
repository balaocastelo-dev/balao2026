import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const PROFILE_URL = "https://www.instagram.com/balaodainformatica_castelo/";
  
  // NOTE: To get real Instagram data, we would need an Access Token.
  // Instead, we will fetch real products from our database to simulate "Recent Posts".
  // This ensures the feed looks populated with relevant content (product images)
  // rather than just empty placeholders, solving the "only logo visible" issue.
  
  try {
    const supabase = await createClient();
    
    // Fetch 5 random/latest products that have images
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image, created_at')
      .not('image', 'is', null)
      .neq('image', '')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!products || products.length === 0) {
       // Fallback if no products found
       return NextResponse.json(Array.from({ length: 5 }).map((_, i) => ({
        id: `mock-${i}`,
        permalink: PROFILE_URL,
        media_url: "/logo.png",
        caption: "Siga o Balão da Informática no Instagram!",
        like_count: 0,
        comments_count: 0,
        timestamp: new Date().toISOString()
      })));
    }

    // Map products to Instagram Post format
    const posts = products.map(product => ({
      id: product.id,
      permalink: PROFILE_URL, // All click through to profile since we don't have real post URLs
      media_url: product.image,
      caption: product.name, // Use product name as caption
      like_count: Math.floor(Math.random() * 50) + 10, // Simulated engagement
      comments_count: Math.floor(Math.random() * 5),
      timestamp: product.created_at
    }));

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error generating instagram mock feed:", error);
    // Silent fail fallback
    return NextResponse.json([]);
  }
}
