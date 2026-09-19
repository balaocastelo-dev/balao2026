import { NextResponse } from "next/server";
import { getCarouselImages, getCategories, getProducts } from "@/lib/db";
import { listBlogPostsForPage } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

async function parte<T>(nome: string, buscar: () => Promise<T>, reserva: T) {
  try {
    return { nome, dados: await buscar(), erro: null as string | null };
  } catch (erro) {
    return { nome, dados: reserva, erro: (erro as Error).message };
  }
}

export async function GET() {
  const [produtos, categorias, banners, blog] = await Promise.all([
    parte("produtos", () => getProducts(), []),
    parte("categorias", () => getCategories(), []),
    parte("banners", () => getCarouselImages(false), []),
    parte("blog", () => listBlogPostsForPage({ take: 40, skipDynamicFallback: true }), []),
  ]);

  const falhas = [produtos, categorias, banners, blog]
    .filter((p) => p.erro)
    .map((p) => `${p.nome}: ${p.erro}`);

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    produtos: produtos.dados,
    categorias: categorias.dados,
    banners: banners.dados,
    blog: blog.dados,
    falhas,
  });
}
