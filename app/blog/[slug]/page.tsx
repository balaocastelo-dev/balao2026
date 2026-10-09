import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import BlocosDoArtigo from "@/components/blog/BlocosDoArtigo";
import CapaArtigo from "@/components/blog/CapaArtigo";
import CartaoArtigo from "@/components/blog/CartaoArtigo";
import { FontesEMetodo, PerguntasFrequentes, Veredito } from "@/components/blog/FechoDoArtigo";
import { CabecalhoDaLoja, FaixaDaLoja } from "@/components/blog/Moldura";
import { ProgressoDeLeitura, SumarioLateral, SumarioRecolhivel } from "@/components/blog/Sumario";
import { nomeDaCategoria } from "@/lib/blog/categorias";
import { linkDoWhatsApp } from "@/lib/blog/chamadas";
import { escolherRelacionados, listarArtigos, obterArtigo, resumir } from "@/lib/blog/repositorio";
import { jsonLdDoArtigo, metadataDoArtigo } from "@/lib/blog/seo";
import { dataPorExtenso, minutosDeLeitura, montarSumario, semQuebraRuim } from "@/lib/blog/texto";
import type { ItemDoSumario } from "@/lib/blog/tipos";

export const revalidate = 3600;
// Artigo novo do Soro ganha página sozinho, sem precisar publicar o site de novo.
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listarArtigos()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await obterArtigo(slug);
  if (!artigo) return { title: "Artigo não encontrado", robots: { index: false, follow: true } };
  return metadataDoArtigo(artigo);
}

export default async function PaginaDoArtigo({ params }: Props) {
  const { slug } = await params;
  const artigo = await obterArtigo(slug);
  if (!artigo) notFound();

  const relacionados = escolherRelacionados(artigo, await listarArtigos(), 3).map(resumir);
  const minutos = minutosDeLeitura(artigo);
  const categoria = nomeDaCategoria(artigo.categoria);
  const perguntas = artigo.perguntas ?? [];
  const temFontes = (artigo.fontes?.length ?? 0) > 0 || Boolean(artigo.metodologia);

  // O sumário são os títulos do texto mais as seções de fecho.
  const sumario: ItemDoSumario[] = [
    ...montarSumario(artigo.blocos).sumario,
    ...(artigo.analise ? [{ id: "veredito", texto: "Veredito", nivel: 2 as const }] : []),
    ...(perguntas.length > 0 ? [{ id: "perguntas-frequentes", texto: "Perguntas frequentes", nivel: 2 as const }] : []),
    ...(temFontes ? [{ id: "fontes", texto: artigo.metodologia ? "Fontes e método" : "Fontes", nivel: 2 as const }] : []),
  ];

  return (
    <>
      <JsonLd data={[generateOrganizationSchema(), ...jsonLdDoArtigo(artigo)]} />
      <ProgressoDeLeitura alvo="artigo" />
      <CabecalhoDaLoja />

      <div className="mx-auto w-full max-w-[76rem] px-4 pb-20 sm:px-6 lg:px-8">
        <article id="artigo">
          <header className="pt-7 sm:pt-10">
            <nav aria-label="Você está em" className="text-[0.8125rem] text-[var(--b-tinta-3)]">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link href="/blog" className="hover:text-white hover:underline">
                    Blog
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/blog/categoria/${artigo.categoria}`} className="hover:text-white hover:underline">
                    {categoria}
                  </Link>
                </li>
              </ol>
            </nav>

            <h1 className="b-titulo mt-5 max-w-[56rem] text-[2.125rem] text-white sm:text-[3rem] lg:text-[3.75rem]">
              {semQuebraRuim(artigo.titulo)}
            </h1>
            <p className="b-serifa mt-5 max-w-[46rem] text-[1.1875rem] leading-[1.5] text-[var(--b-tinta-2)] sm:text-[1.375rem]">
              {artigo.resumo}
            </p>

            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.875rem] text-[var(--b-tinta-3)]">
              <span className="font-bold text-white">{artigo.autor.nome}</span>
              <span aria-hidden className="h-3 w-px bg-[var(--b-linha-forte)]" />
              <time dateTime={artigo.publicadoEm}>{dataPorExtenso(artigo.publicadoEm)}</time>
              {artigo.atualizadoEm ? (
                <>
                  <span aria-hidden className="h-3 w-px bg-[var(--b-linha-forte)]" />
                  <span>
                    atualizado em <time dateTime={artigo.atualizadoEm}>{dataPorExtenso(artigo.atualizadoEm)}</time>
                  </span>
                </>
              ) : null}
              <span aria-hidden className="h-3 w-px bg-[var(--b-linha-forte)]" />
              <span>{minutos} min de leitura</span>
            </p>
          </header>

          {artigo.capa ? (
            <CapaArtigo
              artigo={artigo}
              sizes="(min-width: 1280px) 1152px, 100vw"
              prioridade
              className="relative mt-8 aspect-[16/10] rounded-[18px] ring-1 ring-inset ring-white/10 sm:mt-10 sm:aspect-[21/9]"
            />
          ) : (
            <hr className="mt-8 border-[var(--b-linha)] sm:mt-10" />
          )}

          <div className="mt-8 lg:hidden">
            <SumarioRecolhivel itens={sumario} />
          </div>

          <div className="mt-9 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] lg:gap-16">
            <div className="min-w-0">
              <BlocosDoArtigo artigo={artigo} />
              {artigo.analise ? <Veredito analise={artigo.analise} /> : null}
              <PerguntasFrequentes perguntas={perguntas} />
              <FontesEMetodo artigo={artigo} />
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto pb-4 pr-1">
                <SumarioLateral itens={sumario} />
                <div className="mt-8 border-t border-[var(--b-linha)] pt-6">
                  <p className="text-[0.9375rem] font-bold text-white">Dúvida sobre este assunto?</p>
                  <p className="mt-1.5 text-[0.875rem] leading-snug text-[var(--b-tinta-3)]">
                    A equipe da loja responde no WhatsApp.
                  </p>
                  <a
                    href={linkDoWhatsApp(`Olá! Li “${artigo.titulo}” no blog da Balão e fiquei com uma dúvida.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-conversion-source="blog"
                    data-conversion-label={`${artigo.slug}: lateral`}
                    className="b-link mt-3 inline-block text-[0.9375rem] font-bold"
                  >
                    Perguntar agora
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {relacionados.length > 0 ? (
          <section aria-labelledby="leia-tambem" className="mt-20 border-t border-[var(--b-linha)] pt-10">
            <h2 id="leia-tambem" className="b-titulo text-[1.625rem] text-white sm:text-[2rem]">
              Leia também
            </h2>
            <div className="b-grade mt-8">
              {relacionados.map((r) => (
                <CartaoArtigo key={r.slug} artigo={r} nivel={3} />
              ))}
            </div>
          </section>
        ) : null}

        <FaixaDaLoja origem={artigo.slug} />
      </div>
    </>
  );
}
