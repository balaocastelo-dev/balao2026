import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import ListaDeArtigos from "@/components/blog/ListaDeArtigos";
import { CabecalhoDaLoja, FaixaDaLoja } from "@/components/blog/Moldura";
import { CATEGORIAS, categoriaPorSlug } from "@/lib/blog/categorias";
import { contarPorCategoria, listarResumos } from "@/lib/blog/repositorio";
import { jsonLdDaCategoria } from "@/lib/blog/seo";

export const revalidate = 1800;
export const dynamicParams = false;

type Props = { params: Promise<{ categoria: string }> };

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = categoriaPorSlug(slug);
  if (!categoria) return { title: "Categoria não encontrada", robots: { index: false, follow: true } };

  const total = (await listarResumos()).filter((r) => r.categoria === categoria.slug).length;
  const titulo = `${categoria.nome}: artigos do blog`;
  return {
    title: titulo,
    description: categoria.descricao,
    alternates: { canonical: `/blog/categoria/${categoria.slug}` },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: `/blog/categoria/${categoria.slug}`,
      title: titulo,
      description: categoria.descricao,
      images: [
        {
          url: `/blog/api/og?${new URLSearchParams({ title: `${categoria.nome} no blog da Balão`, category: categoria.nome, seed: categoria.slug })}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: titulo, description: categoria.descricao },
    // Categoria ainda sem artigo existe, mas não vai para o índice do Google.
    robots: { index: total > 0, follow: true },
  };
}

export default async function PaginaDaCategoria({ params }: Props) {
  const { categoria: slug } = await params;
  const categoria = categoriaPorSlug(slug);
  if (!categoria) notFound();

  const todos = await listarResumos();
  const artigos = todos.filter((r) => r.categoria === categoria.slug);
  const totais = { ...contarPorCategoria(todos), todas: todos.length };

  return (
    <>
      <JsonLd data={[generateOrganizationSchema(), ...jsonLdDaCategoria(categoria, artigos)]} />
      <CabecalhoDaLoja />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="py-9 sm:py-12">
          <p className="text-[0.875rem] text-[var(--b-tinta-3)]">
            <Link href="/blog" className="hover:text-white hover:underline">
              Blog
            </Link>
            <span aria-hidden> / </span>
            Categoria
          </p>
          <h1 className="b-titulo mt-3 text-[2.5rem] text-white sm:text-[3.5rem]">{categoria.nome}</h1>
          <p className="b-serifa mt-4 max-w-[40rem] text-[1.0625rem] leading-[1.6] text-[var(--b-tinta-2)] sm:text-[1.1875rem]">
            {categoria.descricao}
          </p>
        </header>

        {artigos.length > 0 ? (
          <ListaDeArtigos artigos={artigos} categoriaFixa={categoria.slug} totais={totais} />
        ) : (
          <div className="rounded-[18px] border border-[var(--b-linha)] bg-[var(--b-painel)] px-6 py-12 text-center">
            <p className="b-titulo text-[1.375rem] text-white">Ainda não há artigos nesta categoria</p>
            <Link href="/blog" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-[0.9375rem] font-bold text-[#090d16]">
              Ver todos os artigos
            </Link>
          </div>
        )}

        <FaixaDaLoja origem={`categoria-${categoria.slug}`} />
      </div>
    </>
  );
}
