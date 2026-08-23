import { NextResponse } from 'next/server';
import { turso, isTursoActive } from '@/lib/turso';

export async function GET() {
  const PROFILE_URL = "https://www.instagram.com/balaodainformatica_castelo/";

  // Busca produtos reais com imagem para simular o feed de posts recentes.
  try {
    if (!isTursoActive()) {
      return NextResponse.json([]);
    }

    const res = await turso.execute(
      `SELECT id, name, image, created_at
       FROM products
       WHERE image IS NOT NULL AND image != ''
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const products = res.rows as any[];

    if (!products || products.length === 0) {
      // Fallback se nenhum produto for encontrado
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

    // Mapeia produtos para o formato de post do Instagram
    const posts = products.map(product => ({
      id: product.id,
      permalink: PROFILE_URL, // Todos apontam para o perfil (não temos URLs reais de post)
      media_url: product.image,
      caption: product.name, // Nome do produto como legenda
      like_count: Math.floor(Math.random() * 50) + 10, // Engajamento simulado
      comments_count: Math.floor(Math.random() * 5),
      timestamp: product.created_at
    }));

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error generating instagram mock feed:", error);
    // Falha silenciosa
    return NextResponse.json([]);
  }
}
