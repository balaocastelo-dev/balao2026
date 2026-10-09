import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import { CATEGORIAS, nomeDaCategoria, type Categoria } from "./categorias";
import { cortar, minutosDeLeitura, palavrasDoArtigo } from "./texto";
import type { Artigo, ArtigoResumido } from "./tipos";

/**
 * Tudo que o Google, o WhatsApp e as redes leem de um artigo sai daqui,
 * calculado a partir do próprio artigo. Ninguém preenche dado estruturado à
 * mão: se o artigo tem veredito, sai `Review`; se tem perguntas, sai
 * `FAQPage`; se tem prós e contras, eles entram na análise.
 */

export const SITE = "https://www.balao.info";
const ID_DA_LOJA = `${SITE}/#organization`;
const NOME_DO_BLOG = "Blog da Balão da Informática";

export function urlAbsoluta(caminho: string): string {
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${SITE}${caminho.startsWith("/") ? "" : "/"}${caminho}`;
}

export function urlDoArtigo(slug: string): string {
  return `${SITE}/blog/${slug}`;
}

/**
 * Capa desenhada e sem texto: é a que os cartões e o topo do artigo mostram
 * quando não há foto, e a reserva quando uma capa hospedada fora falha.
 */
export function fundoGerado(artigo: { categoria: Artigo["categoria"]; slug: string }): string {
  const parametros = new URLSearchParams({ fundo: "1", category: artigo.categoria, seed: artigo.slug });
  return `/blog/api/og?${parametros.toString()}`;
}

/** Capa com o título escrito: a imagem de quando o link é compartilhado. */
export function capaGerada(artigo: { titulo: string; categoria: Artigo["categoria"]; slug: string }): string {
  const parametros = new URLSearchParams({
    title: cortar(artigo.titulo, 110),
    category: nomeDaCategoria(artigo.categoria),
    seed: artigo.slug,
  });
  return `/blog/api/og?${parametros.toString()}`;
}

export function imagemDoArtigo(artigo: Pick<Artigo, "capa" | "titulo" | "categoria" | "slug">): string {
  return urlAbsoluta(artigo.capa?.src ?? capaGerada(artigo));
}

export function metadataDoArtigo(artigo: Artigo): Metadata {
  const titulo = artigo.seo?.titulo ?? artigo.titulo;
  const descricao = artigo.seo?.descricao ?? artigo.resumo;
  const caminho = `/blog/${artigo.slug}`;
  const imagem = imagemDoArtigo(artigo);

  return {
    title: titulo,
    description: descricao,
    keywords: artigo.seo?.palavrasChave ?? artigo.etiquetas,
    alternates: { canonical: caminho },
    authors: [{ name: artigo.autor.nome }],
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url: caminho,
      siteName: SITE_CONFIG.name,
      title: titulo,
      description: descricao,
      publishedTime: artigo.publicadoEm,
      modifiedTime: artigo.atualizadoEm ?? artigo.publicadoEm,
      section: nomeDaCategoria(artigo.categoria),
      tags: artigo.etiquetas,
      images: [
        {
          url: imagem,
          width: artigo.capa?.largura ?? 1200,
          height: artigo.capa?.altura ?? 630,
          alt: artigo.capa?.alt ?? artigo.titulo,
        },
      ],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao, images: [imagem] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

function migalhas(itens: { nome: string; caminho: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.nome,
      item: urlAbsoluta(item.caminho),
    })),
  };
}

function editora() {
  return {
    "@type": "Organization",
    "@id": ID_DA_LOJA,
    name: SITE_CONFIG.name,
    url: SITE,
    logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
  };
}

/** O grafo completo de dados estruturados de um artigo. */
export function jsonLdDoArtigo(artigo: Artigo): Record<string, unknown>[] {
  const url = urlDoArtigo(artigo.slug);
  const imagem = imagemDoArtigo(artigo);
  const secao = nomeDaCategoria(artigo.categoria);
  const idDoArtigo = `${url}#artigo`;

  // Assinatura de pessoa só quando o artigo tem uma; "Equipe Balão" é a loja.
  const autor = artigo.autor.pessoa
    ? {
        "@type": "Person",
        name: artigo.autor.nome,
        ...(artigo.autor.cargo ? { jobTitle: artigo.autor.cargo } : {}),
        ...(artigo.autor.url ? { url: urlAbsoluta(artigo.autor.url) } : {}),
        worksFor: { "@id": ID_DA_LOJA },
      }
    : { "@type": "Organization", "@id": ID_DA_LOJA, name: SITE_CONFIG.name, url: SITE };

  const nos: Record<string, unknown>[] = [
    {
      "@type": artigo.categoria === "noticias" ? "NewsArticle" : "BlogPosting",
      "@id": idDoArtigo,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: cortar(artigo.titulo, 110),
      description: artigo.seo?.descricao ?? artigo.resumo,
      image: [imagem],
      datePublished: artigo.publicadoEm,
      dateModified: artigo.atualizadoEm ?? artigo.publicadoEm,
      inLanguage: "pt-BR",
      articleSection: secao,
      keywords: (artigo.seo?.palavrasChave ?? artigo.etiquetas).join(", ") || undefined,
      wordCount: palavrasDoArtigo(artigo),
      timeRequired: `PT${minutosDeLeitura(artigo)}M`,
      isAccessibleForFree: true,
      author: autor,
      publisher: editora(),
      isPartOf: { "@type": "Blog", "@id": `${SITE}/blog#blog`, name: NOME_DO_BLOG },
      ...(artigo.fontes?.length
        ? { citation: artigo.fontes.map((f) => ({ "@type": "CreativeWork", name: f.nome, url: f.url })) }
        : {}),
    },
    migalhas([
      { nome: "Início", caminho: "/" },
      { nome: "Blog", caminho: "/blog" },
      { nome: secao, caminho: `/blog/categoria/${artigo.categoria}` },
      { nome: artigo.titulo, caminho: `/blog/${artigo.slug}` },
    ]),
  ];

  if (artigo.analise) {
    const { item, nota, veredito } = artigo.analise;
    const prosContras = artigo.blocos.find((b) => b.tipo === "pros-contras");
    const lista = (itens: string[]) => ({
      "@type": "ItemList",
      itemListElement: itens.map((nome, i) => ({ "@type": "ListItem", position: i + 1, name: nome })),
    });

    nos.push({
      "@type": "Review",
      "@id": `${url}#analise`,
      name: cortar(artigo.titulo, 110),
      reviewBody: veredito,
      datePublished: artigo.publicadoEm,
      inLanguage: "pt-BR",
      url,
      author: autor,
      publisher: editora(),
      itemReviewed: {
        "@type": "Product",
        name: item.nome,
        ...(item.marca ? { brand: { "@type": "Brand", name: item.marca } } : {}),
        ...(item.categoria ? { category: item.categoria } : {}),
        image: item.imagem ? urlAbsoluta(item.imagem) : imagem,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: Number(nota.toFixed(1)),
        bestRating: 10,
        worstRating: 0,
      },
      ...(prosContras && prosContras.tipo === "pros-contras"
        ? { positiveNotes: lista(prosContras.pros), negativeNotes: lista(prosContras.contras) }
        : {}),
    });
  }

  if (artigo.perguntas?.length) {
    nos.push({
      "@type": "FAQPage",
      "@id": `${url}#perguntas`,
      mainEntity: artigo.perguntas.map((p) => ({
        "@type": "Question",
        name: p.pergunta,
        acceptedAnswer: { "@type": "Answer", text: p.resposta },
      })),
    });
  }

  return nos;
}

function listaDeArtigos(resumos: ArtigoResumido[]) {
  return {
    "@type": "ItemList",
    itemListElement: resumos.slice(0, 30).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: urlDoArtigo(r.slug),
      name: r.titulo,
    })),
  };
}

export function jsonLdDaHome(resumos: ArtigoResumido[]): Record<string, unknown>[] {
  return [
    {
      "@type": "Blog",
      "@id": `${SITE}/blog#blog`,
      url: `${SITE}/blog`,
      name: NOME_DO_BLOG,
      description:
        "Guias de compra, análises com números de teste e orientação de assistência técnica da Balão da Informática, loja de informática em Campinas.",
      inLanguage: "pt-BR",
      publisher: editora(),
      blogPost: resumos.slice(0, 10).map((r) => ({
        "@type": "BlogPosting",
        headline: cortar(r.titulo, 110),
        url: urlDoArtigo(r.slug),
        datePublished: r.publicadoEm,
        image: imagemDoArtigo(r),
      })),
    },
    listaDeArtigos(resumos),
    migalhas([
      { nome: "Início", caminho: "/" },
      { nome: "Blog", caminho: "/blog" },
    ]),
  ];
}

export function jsonLdDaCategoria(categoria: Categoria, resumos: ArtigoResumido[]): Record<string, unknown>[] {
  return [
    {
      "@type": "CollectionPage",
      "@id": `${SITE}/blog/categoria/${categoria.slug}#pagina`,
      url: `${SITE}/blog/categoria/${categoria.slug}`,
      name: `${categoria.nome} | ${NOME_DO_BLOG}`,
      description: categoria.descricao,
      inLanguage: "pt-BR",
      isPartOf: { "@type": "Blog", "@id": `${SITE}/blog#blog` },
    },
    listaDeArtigos(resumos),
    migalhas([
      { nome: "Início", caminho: "/" },
      { nome: "Blog", caminho: "/blog" },
      { nome: categoria.nome, caminho: `/blog/categoria/${categoria.slug}` },
    ]),
  ];
}

export const SLUGS_DE_CATEGORIA = CATEGORIAS.map((c) => c.slug);
