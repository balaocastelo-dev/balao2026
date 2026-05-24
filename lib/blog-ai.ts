import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
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

function buildFallbackRssHtml(input: { title: string; summary: string; sourceUrl: string }): string {
  const summary = (input.summary || "").trim();
  const lead = summary ? summary : `Veja os pontos principais sobre ${input.title} e como isso afeta compras e upgrades de informática.`;
  return `
<p><strong>${lead}</strong></p>
<h2>O que aconteceu</h2>
<p>O tema desta notícia envolve <strong>${input.title}</strong>. A seguir, reunimos os impactos práticos e o que vale monitorar antes de comprar ou atualizar seu setup.</p>
<h2>Impacto para quem compra tecnologia</h2>
<ul>
  <li>Planejamento de upgrade: avalie custo-benefício e compatibilidade.</li>
  <li>Escolha do hardware certo: priorize desempenho real para seu uso.</li>
  <li>Garantia e suporte: compre com assistência e orientação técnica.</li>
</ul>
<h2>Checklist rápido</h2>
<ol>
  <li>Defina seu objetivo (trabalho, jogos, estudo, criação).</li>
  <li>Confira CPU/GPU/RAM/SSD e compatibilidade.</li>
  <li>Compare preço e disponibilidade.</li>
</ol>
<h2>Quer ajuda para escolher?</h2>
<p>Fale com um especialista e receba indicação direta para o seu caso: <a href="${WHATSAPP_URL}" target="_blank" rel="noreferrer">WhatsApp 19 98751-0267</a>.</p>
<p>Atalhos úteis: <a href="${SITE_URL}/notebooks">Notebooks</a> • <a href="${SITE_URL}/pcgamer">PC Gamer</a> • <a href="${SITE_URL}/departamentos">Departamentos</a> • <a href="${SITE_URL}/promocao">Promoções</a></p>
<h2>Fonte</h2>
<p><a href="${input.sourceUrl}" rel="nofollow noopener" target="_blank">${input.sourceUrl}</a></p>
  `.trim();
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

async function generateFromGroq(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const client = new Groq({ apiKey });
  const model = process.env.BLOG_AI_MODEL || "llama-3.1-70b-versatile";

  const resp = await client.chat.completions.create({
    model,
    temperature: 0.6,
    messages: [
      { role: "system", content: "Você é um(a) redator(a) SEO especialista em tecnologia. Retorne apenas JSON válido." },
      { role: "user", content: prompt },
    ],
  });

  const text = resp.choices?.[0]?.message?.content || "";
  if (!text.trim()) return null;
  return safeParseJson(text);
}

async function generateFromAI(prompt: string) {
  const fromGroq = await generateFromGroq(prompt);
  if (fromGroq) return fromGroq;
  return null;
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

  const data = await generateFromAI(prompt);

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
    buildFallbackRssHtml({ title, summary: item.summary || "", sourceUrl: item.url });

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
      image: item.imageUrls?.[0],
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

  const data = await generateFromAI(prompt);

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
    `
<p><strong>${seoDescription}</strong></p>
<h2>Para quem é ideal</h2>
<p>O <strong>${product.name}</strong> é uma boa opção para quem busca desempenho e confiabilidade no dia a dia. Abaixo estão critérios práticos para decidir com segurança.</p>
<h2>O que avaliar antes de comprar</h2>
<ul>
  <li>Compatibilidade com seu setup (placa-mãe, fonte, gabinete, portas).</li>
  <li>Uso principal (trabalho, games, estudo, criação).</li>
  <li>Custo-benefício vs. alternativas.</li>
</ul>
<h2>Link do produto</h2>
<p><a href="${input.productUrl}">${product.name}</a></p>
<h2>Atendimento rápido</h2>
<p>Quer indicação personalizada? <a href="${WHATSAPP_URL}" target="_blank" rel="noreferrer">WhatsApp 19 98751-0267</a>.</p>
<p>Atalhos úteis: <a href="${SITE_URL}/notebooks">Notebooks</a> • <a href="${SITE_URL}/pcgamer">PC Gamer</a> • <a href="${SITE_URL}/departamentos">Departamentos</a> • <a href="${SITE_URL}/promocao">Promoções</a></p>
    `.trim();

  const contentHtmlBase = sanitizeHtmlBasic(rawHtml);
  const contentHtml =
    product.image && !/<img\b/i.test(contentHtmlBase)
      ? `<p><img src="${product.image}" alt="" /></p>${contentHtmlBase}`
      : contentHtmlBase;
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
