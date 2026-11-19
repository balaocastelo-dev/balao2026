import type { Metadata } from "next";
import Link from "next/link";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import ListaDeArtigos from "@/components/blog/ListaDeArtigos";
import { CabecalhoDaLoja, FaixaDaLoja } from "@/components/blog/Moldura";
import { listarResumos } from "@/lib/blog/repositorio";

export const revalidate = 1800;

const TITULO = "GTA 6: notícias, PC e live";
const DESCRICAO =
  "Série do blog da Balão da Informática Anchieta sobre Grand Theft Auto VI: o que foi anunciado, como preparar o PC e o que uma live pede.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: "/blog/gta-6" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/blog/gta-6",
    title: TITULO,
    description: DESCRICAO,
  },
};

export default async function PaginaDaSerieGta6() {
  const artigos = (await listarResumos()).filter((r) => r.etiquetas.includes("GTA 6"));

  return (
    <>
      <JsonLd data={generateOrganizationSchema()} />
      <CabecalhoDaLoja />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="py-9 sm:py-12">
          <p className="text-[0.875rem] text-[var(--b-tinta-3)]">
            <Link href="/blog" className="hover:text-white hover:underline">
              Blog
            </Link>
            <span aria-hidden> / </span>
            Série
          </p>
          <h1 className="b-titulo mt-3 text-[2.5rem] text-white sm:text-[3.5rem]">{TITULO}</h1>
          <p className="b-serifa mt-4 max-w-[40rem] text-[1.0625rem] leading-[1.6] text-[var(--b-tinta-2)] sm:text-[1.1875rem]">
            O que a Rockstar e as lojas oficiais já confirmaram, o que ainda não existe (versão de PC e requisito) e como
            a Balão da Informática Anchieta monta o computador em Campinas sem chutar preço nem estoque.
          </p>
        </header>

        {artigos.length > 0 ? (
          <ListaDeArtigos artigos={artigos} />
        ) : (
          <div className="rounded-[18px] border border-[var(--b-linha)] bg-[var(--b-painel)] px-6 py-12 text-center">
            <p className="b-titulo text-[1.375rem] text-white">A série ainda não está no ar</p>
            <Link href="/blog" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-[0.9375rem] font-bold text-[#090d16]">
              Ver todos os artigos
            </Link>
          </div>
        )}

        <FaixaDaLoja origem="serie-gta-6" />
      </div>
    </>
  );
}
