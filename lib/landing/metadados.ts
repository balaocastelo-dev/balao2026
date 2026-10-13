import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import type { PaginaDeCaptacao } from "./tipos";

const BASE = "https://www.balao.info";

/** Título, descrição, canônico e cartões de compartilhamento a partir do conteúdo da página. */
export function metadadosDaPagina(pagina: PaginaDeCaptacao): Metadata {
  const url = `${BASE}/${pagina.slug}`;
  const imagem = pagina.seo.imagem ?? pagina.hero.imagem.src;
  return {
    title: pagina.seo.titulo,
    description: pagina.seo.descricao,
    keywords: pagina.seo.palavras,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url,
      siteName: SITE_CONFIG.name,
      title: pagina.seo.titulo,
      description: pagina.seo.descricao,
      images: [{ url: imagem, alt: pagina.hero.imagem.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: pagina.seo.titulo,
      description: pagina.seo.descricao,
      images: [imagem],
    },
  };
}
