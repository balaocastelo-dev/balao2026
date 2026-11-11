import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import type { PaginaDeCaptacao } from "./tipos";

const BASE = "https://www.balao.info";

/** Título, descrição, canônico e cartões de compartilhamento a partir do conteúdo da página. */
export function metadadosDaPagina(pagina: PaginaDeCaptacao): Metadata {
  const url = `${BASE}/${pagina.slug}`;
  const imagem = pagina.seo.imagem ?? pagina.hero.imagem.src;
  return {
    // `absolute` porque o layout acrescenta " | Balão da Informática" ao título
    // de toda página. Os títulos destas páginas já traziam a marca escrita,
    // então saíam duplicados e com 85 a 105 caracteres — o Google corta por
    // volta de 60 e o resultado aparecia truncado no meio da frase, justamente
    // nas páginas feitas para trazer cliente. Aqui o título vai inteiro, como
    // escrito em lib/landing/paginas, e a régua do teste garante o tamanho.
    title: { absolute: pagina.seo.titulo },
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
