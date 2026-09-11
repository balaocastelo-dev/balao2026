import { NextResponse } from "next/server";
import { getCarouselImages, getCategories, getProducts } from "@/lib/db";
import { listBlogPostsForPage } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

/**
 * Tudo que a VPS precisa para manter o site de pé sem o banco.
 *
 * Um endereço só, de propósito: a cópia tem que ser de um retrato coerente do
 * mesmo instante. Buscando peça por peça em rotas diferentes, uma parte podia
 * vir do banco e a outra já da cota estourada — e o espelho guardaria metade
 * novo, metade velho, sem ninguém perceber.
 *
 * Lê o banco DIRETO: sem cache e sem a cópia. Pela rota normal, um dia de cota
 * estourada faria o site responder com a própria cópia, e a VPS gravaria isso
 * de volta como se fosse dado novo — carimbando data recente num catálogo
 * velho.
 *
 * Cada parte falha sozinha. Se o blog não vier, o resto ainda é espelhado; e a
 * resposta diz o que faltou, para não parecer que o dado simplesmente sumiu.
 */
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
