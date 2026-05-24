import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";
import { buildExcerptFromHtml, estimateReadingTimeMinutesFromHtml } from "@/lib/blog-utils";
import type { Product } from "@/lib/utils";
import type { RssItem } from "@/lib/rss";

type GeneratedBlogPost = {
  title: string;
  seo_title: string;
  seo_description: string;
  category: string;
  tags: string[];
  content_html: string;
  excerpt: string;
  reading_time_minutes: number;
  json_ld: Record<string, any>;
};

const WHATSAPP_NUMBER_E164 = "5519987510267";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER_E164}`;
const SITE_URL = "https://www.balao.info";

function safeParseJson(text: string): any {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

function buildArticleJsonLd(input: {
  url: string;
  title: string;
  description: string;
  publishedAtIso: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAtIso,
    dateModified: input.publishedAtIso,
    author: {
      "@type": "Organization",
      name: "Balão da Informática",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Balão da Informática",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    image: input.image ? [input.image] : [`${SITE_URL}/logo.png`],
  };
}

async function generateFromGemini(prompt: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.BLOG_AI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return safeParseJson(text);
}

export async function generateBlogPostFromRss(item: RssItem, input: { slug: string; publishedAtIso: string; url: string }): Promise<GeneratedBlogPost> {
  const prompt = `
Você é redator(a) e editor(a) SEO do blog "Balão da Informática" (pt-BR).

Objetivo: criar um artigo ORIGINAL (não copiar o texto da fonte) a partir de uma notícia do mundo da tecnologia.

Regras obrigatórias:
- Escreva em pt-BR, tom claro e profissional, com foco em clientes que precisam comprar/atualizar PC, notebook, hardware e periféricos.
- Proibido copiar trechos do conteúdo original. Use apenas o assunto/ideia principal.
- Cite a fonte com link no final, em uma seção "Fonte".
- Use HTML seguro e simples: p, h2, h3, ul, ol, li, strong, em, a.
- Sempre que fizer sentido, inclua uma chamada para WhatsApp (${WHATSAPP_URL}) com o número 19 98751-0267.
- Inclua links internos para o site ${SITE_URL} quando fizer sentido (ex.: /notebooks, /pcgamer, /departamentos).
- Retorne SOMENTE um JSON válido no formato:
{
  "title": "...",
  "seo_title": "...",
  "seo_description": "...",
  "category": "...",
  "tags": ["...", "..."],
  "content_html": "..."
}

Conteúdo de entrada:
Título: ${JSON.stringify(item.title)}
URL: ${JSON.stringify(item.url)}
Resumo/descrição (pode estar vazio): ${JSON.stringify(item.summary || "")}

Estrutura sugerida:
- Introdução (1-2 parágrafos)
- O que aconteceu (h2)
- Impacto para quem compra tecnologia (h2)
- Dicas práticas / checklist (h2, lista)
- Perguntas frequentes (h2, 2-4 perguntas com respostas curtas)
- Call to action WhatsApp (h2)
- Fonte (h2) com link para a URL acima
`;

  const data = await generateFromGemini(prompt);

  const fallbackTitle = item.title.trim();
  const title = (typeof data?.title === "string" && data.title.trim()) || fallbackTitle;
  const seoTitle =
    (typeof data?.seo_title === "string" && data.seo_title.trim()) ||
    `Blog Balão da Informática: ${title}`.slice(0, 60);
  const seoDescription =
    (typeof data?.seo_description === "string" && data.seo_description.trim()) ||
    `Entenda ${title} e veja dicas práticas. Fale no WhatsApp 19 98751-0267.`;
  const category = (typeof data?.category === "string" && data.category.trim()) || "Notícias";
  const tags = Array.isArray(data?.tags) ? data.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 10) : [];

  const rawHtml =
    (typeof data?.content_html === "string" && data.content_html.trim()) ||
    `<p>${seoDescription}</p><h2>Fale com a Balão da Informática</h2><p><a href="${WHATSAPP_URL}">WhatsApp 19 98751-0267</a></p><h2>Fonte</h2><p><a href="${item.url}" rel="nofollow noopener" target="_blank">${item.url}</a></p>`;

  const contentHtml = sanitizeHtmlBasic(rawHtml);
  const excerpt = buildExcerptFromHtml(contentHtml, 180);
  const readingTimeMinutes = estimateReadingTimeMinutesFromHtml(contentHtml);

  return {
    title,
    seo_title: seoTitle,
    seo_description: seoDescription,
    category,
    tags,
    content_html: contentHtml,
    excerpt,
    reading_time_minutes: readingTimeMinutes,
    json_ld: buildArticleJsonLd({
      url: input.url,
      title,
      description: seoDescription,
      publishedAtIso: input.publishedAtIso,
    }),
  };
}

export async function generateBlogPostFromProduct(product: Product, input: { slug: string; publishedAtIso: string; url: string; productUrl: string }): Promise<GeneratedBlogPost> {
  const prompt = `
Você é redator(a) SEO do blog "Balão da Informática" (pt-BR).

Objetivo: criar um artigo completo e informativo a partir de um produto do catálogo.

Regras obrigatórias:
- Escreva em pt-BR, original, sem copiar descrições de terceiros.
- Use HTML seguro e simples: p, h2, h3, ul, ol, li, strong, em, a.
- Otimize para SEO com palavras-chave do segmento de informática.
- Inclua link para o produto e 1-3 links internos no site ${SITE_URL}.
- Sempre que possível, direcione para WhatsApp (${WHATSAPP_URL}) com o número 19 98751-0267.
- Retorne SOMENTE um JSON válido no formato:
{
  "title": "...",
  "seo_title": "...",
  "seo_description": "...",
  "category": "...",
  "tags": ["...", "..."],
  "content_html": "..."
}

Produto:
Nome: ${JSON.stringify(product.name)}
Categoria: ${JSON.stringify(product.category)}
Preço: ${JSON.stringify(product.price)}
URL do produto: ${JSON.stringify(input.productUrl)}
`;

  const data = await generateFromGemini(prompt);

  const title = (typeof data?.title === "string" && data.title.trim()) || `Vale a pena: ${product.name}`;
  const seoTitle =
    (typeof data?.seo_title === "string" && data.seo_title.trim()) ||
    `${product.name} | Guia e Dicas`.slice(0, 60);
  const seoDescription =
    (typeof data?.seo_description === "string" && data.seo_description.trim()) ||
    `Entenda para quem o ${product.name} é ideal e veja dicas de compra. Fale no WhatsApp 19 98751-0267.`;
  const category = (typeof data?.category === "string" && data.category.trim()) || "Guia de Compra";
  const tags = Array.isArray(data?.tags) ? data.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 10) : [];

  const rawHtml =
    (typeof data?.content_html === "string" && data.content_html.trim()) ||
    `<p>${seoDescription}</p><h2>Veja o produto</h2><p><a href="${input.productUrl}">${product.name}</a></p><h2>Fale com a Balão da Informática</h2><p><a href="${WHATSAPP_URL}">WhatsApp 19 98751-0267</a></p>`;

  const contentHtml = sanitizeHtmlBasic(rawHtml);
  const excerpt = buildExcerptFromHtml(contentHtml, 180);
  const readingTimeMinutes = estimateReadingTimeMinutesFromHtml(contentHtml);

  return {
    title,
    seo_title: seoTitle,
    seo_description: seoDescription,
    category,
    tags,
    content_html: contentHtml,
    excerpt,
    reading_time_minutes: readingTimeMinutes,
    json_ld: buildArticleJsonLd({
      url: input.url,
      title,
      description: seoDescription,
      publishedAtIso: input.publishedAtIso,
      image: product.image || undefined,
    }),
  };
}

