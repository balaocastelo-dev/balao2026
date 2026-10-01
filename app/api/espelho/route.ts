import { NextResponse } from "next/server";
import { getCarouselImages, getCategories, getProducts } from "@/lib/db";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { bancoEmPausa } from "@/lib/turso";

export const dynamic = "force-dynamic";

/**
 * É daqui que a VPS baixa a cópia do catálogo a cada 30 minutos.
 *
 * Cuidado que esta rota exige: `lib/db` ENGOLE o erro do banco e devolve lista
 * vazia. Sem a checagem abaixo, a rota respondia 200 com tudo vazio e
 * `falhas: []` — ou seja, dizia "está tudo bem, o catálogo é vazio mesmo".
 * A VPS tem uma guarda que mantém a cópia antiga, mas ficava sem saber o
 * motivo. Agora a rota avisa quando o banco está recusando conexão.
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

  // Lista vazia com banco em pausa não é catálogo vazio: é banco fora.
  const semProduto = !Array.isArray(produtos.dados) || (produtos.dados as unknown[]).length === 0;
  if (semProduto && !produtos.erro) {
    falhas.push(
      bancoEmPausa()
        ? "produtos: banco em pausa por cota — a VPS deve manter a cópia anterior"
        : "produtos: o banco devolveu lista vazia — a VPS deve manter a cópia anterior"
    );
  }

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    produtos: produtos.dados,
    categorias: categorias.dados,
    banners: banners.dados,
    blog: blog.dados,
    falhas,
  });
}
