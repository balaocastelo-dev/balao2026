import type { Metadata } from "next";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import IndiceDeArtigos from "@/components/blog/IndiceDeArtigos";
import ListaDeArtigos from "@/components/blog/ListaDeArtigos";
import { CabecalhoDaLoja, FaixaDaLoja } from "@/components/blog/Moldura";
import Vitrine from "@/components/blog/Vitrine";
import { escolherDestaques, listarArtigos, resumir } from "@/lib/blog/repositorio";
import { jsonLdDaHome } from "@/lib/blog/seo";

// A página é montada no servidor e guardada por uma hora. Busca e filtro
// acontecem no navegador, então ela não precisa ser refeita a cada visita.
export const revalidate = 3600;

const TITULO = "Blog da Balão da Informática: guias, análises e assistência";
const DESCRICAO =
  "Guias de compra, análises com números de teste e orientação de assistência técnica da Balão da Informática, loja de informática em Campinas.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/blog",
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: "/blog/api/og?title=Blog%20da%20Bal%C3%A3o%20da%20Inform%C3%A1tica&category=Guias%2C%20an%C3%A1lises%20e%20assist%C3%AAncia&seed=home", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: TITULO, description: DESCRICAO },
};

export default async function PaginaDoBlog() {
  const artigos = await listarArtigos();
  const destaques = escolherDestaques(artigos, 4).map(resumir);
  const resumos = artigos.map(resumir);

  return (
    <>
      <JsonLd data={[generateOrganizationSchema(), ...jsonLdDaHome(resumos)]} />
      <CabecalhoDaLoja />

      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 py-9 sm:py-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <h1 className="b-titulo text-[2.5rem] text-white sm:text-[3.5rem] lg:text-[4.25rem]">Blog da Balão</h1>
          <p className="b-serifa max-w-[30rem] text-[1.0625rem] leading-[1.6] text-[var(--b-tinta-2)] sm:text-[1.1875rem] lg:pb-2">
            Guias, análises e dicas de conserto da loja que monta e arruma computador em Campinas há mais de 25 anos.
          </p>
        </header>

        <Vitrine artigos={destaques} />

        <div className="mt-14 sm:mt-16">
          <ListaDeArtigos artigos={resumos} naVitrine={destaques.map((d) => d.slug)} />
        </div>

        <IndiceDeArtigos artigos={resumos} />

        <FaixaDaLoja origem="blog" />
      </div>
    </>
  );
}
