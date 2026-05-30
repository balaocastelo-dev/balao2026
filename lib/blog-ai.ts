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

function decodeHtmlEntities(input: string): string {
  const map: Record<string, string> = {
    "&quot;": '"',
    "&#34;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&nbsp;": " ",
  };

  let out = input;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }

  out = out.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    const code = Number.parseInt(String(hex), 16);
    if (!Number.isFinite(code)) return _;
    try {
      return String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  out = out.replace(/&#(\d+);/g, (_, dec) => {
    const code = Number.parseInt(String(dec), 10);
    if (!Number.isFinite(code)) return _;
    try {
      return String.fromCodePoint(code);
    } catch {
      return _;
    }
  });

  return out;
}

function cleanText(input: string): string {
  return decodeHtmlEntities(input)
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.!?)\]])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .replace(/(\d)\.(\d)"/g, "$1,$2\"")
    .trim();
}

function cleanProductName(input: string): string {
  const s = cleanText(input)
    .replace(/"+/g, '"')
    .replace(/"/g, "")
    .replace(/\b([a-z0-9]{10,})\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return s.length > 110 ? `${s.slice(0, 107).trim()}...` : s;
}

function cleanRssTitle(input: string, sourceUrl: string): string {
  const base = cleanText(input).replace(/"+/g, '"').replace(/"/g, "").trim();
  const domain = (() => {
    try {
      return new URL(sourceUrl).hostname.replace(/^www\./i, "");
    } catch {
      return "";
    }
  })();

  const stripSuffix = (s: string, sep: string) => {
    const parts = s.split(sep).map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) return s;
    const last = parts[parts.length - 1] || "";
    const lastClean = last.toLowerCase();
    const looksLikeSite =
      last.length <= 18 &&
      !/\d/.test(last) &&
      (lastClean.includes("adrenaline") ||
        lastClean.includes("tecmundo") ||
        lastClean.includes("canaltech") ||
        (domain && (lastClean.includes(domain) || domain.includes(lastClean))));
    return looksLikeSite ? parts.slice(0, -1).join(sep) : s;
  };

  const noSuffix = stripSuffix(stripSuffix(base, " | "), " - ").trim();
  const clipped = noSuffix.length > 120 ? `${noSuffix.slice(0, 117).trim()}...` : noSuffix;
  return clipped || base || "Notícia de tecnologia";
}

function clip(input: string, max: number): string {
  const s = cleanText(input);
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trim()}…`;
}

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
  category?: string;
  tags?: string[];
}) {
  const keywords = (input.tags || []).filter(Boolean).slice(0, 12);
  const keywordString = keywords.length > 0 ? keywords.join(", ") : "informática, hardware, notebook, pc gamer, tecnologia";
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
    articleSection: input.category || "Tecnologia",
    keywords: keywordString,
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
  const lead = summary ? summary : "";
  return `
${lead ? `<p>${lead}</p>` : ""}
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
  const fallbackTitle = cleanRssTitle(item.title, item.url);
  const title = fallbackTitle;
  const seoTitle =
    clip(title, 60);
  const rawHtml = (item.summary || "").trim() || buildFallbackRssHtml({ title, summary: item.summary || "", sourceUrl: item.url });
  const contentHtml = sanitizeHtmlBasic(rawHtml);
  const excerptBase = buildExcerptFromHtml(contentHtml, 180);
  const seoDescription = clip(excerptBase || title, 155);
  const readingTimeMinutes = estimateReadingTimeMinutesFromHtml(contentHtml);
  const category = (() => {
    const feed = String(item.sourceFeed || "").toLowerCase();
    const url = String(item.url || "").toLowerCase();
    if (feed.includes("pox.globo.com/rss/g1/sp/campinas-regiao") || url.includes("/sp/campinas-regiao/") || url.includes("campinas-regiao")) {
      return "Campinas e Região";
    }
    return "Notícias";
  })();

  return {
    title,
    seo_title: seoTitle,
    seo_description: seoDescription,
    category,
    tags: [],
    content_html: contentHtml,
    excerpt: excerptBase,
    reading_time_minutes: readingTimeMinutes,
    json_ld: buildArticleJsonLd({
      url: input.url,
      title,
      description: seoDescription,
      publishedAtIso: input.publishedAtIso,
      image: item.imageUrls?.[0],
      category,
      tags: [],
    }),
  };
}

export async function generateBlogPostFromProduct(product: Product, input: { slug: string; publishedAtIso: string; url: string; productUrl: string }): Promise<GeneratedBlogPost> {
  const productName = cleanProductName(String(product.name || ""));
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
Nome: ${JSON.stringify(productName)}
Categoria: ${JSON.stringify(product.category)}
Preço: ${JSON.stringify(product.price)}
URL do produto: ${JSON.stringify(input.productUrl)}
`;

  const data = await generateFromAI(prompt);

  const title = (typeof data?.title === "string" && data.title.trim()) || `Vale a pena: ${productName}`;
  const seoTitle =
    (typeof data?.seo_title === "string" && data.seo_title.trim()) ||
    `${productName} | Guia e Dicas`.slice(0, 60);
  const seoDescription =
    (typeof data?.seo_description === "string" && data.seo_description.trim()) ||
    clip(
      `Entenda para quem o ${productName} é ideal e veja dicas de compra de informática. Atendimento no WhatsApp 19 98751-0267.`,
      155,
    );
  const category = (typeof data?.category === "string" && data.category.trim()) || String(product.category || "Guia de Compra");
  const tags = Array.isArray(data?.tags) ? data.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 10) : [];

  const rawHtml =
    (typeof data?.content_html === "string" && data.content_html.trim()) ||
    `
<p><strong>${seoDescription}</strong></p>
<h2>Para quem é ideal</h2>
<p>O <strong>${productName}</strong> é uma boa opção para quem busca desempenho e confiabilidade no dia a dia. Abaixo estão critérios práticos para decidir com segurança.</p>
<h2>O que avaliar antes de comprar</h2>
<ul>
  <li>Compatibilidade com seu setup (placa-mãe, fonte, gabinete, portas).</li>
  <li>Uso principal (trabalho, games, estudo, criação).</li>
  <li>Custo-benefício vs. alternativas.</li>
</ul>
<h2>Link do produto</h2>
<p><a href="${input.productUrl}">${productName}</a></p>
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
      category,
      tags,
    }),
  };
}
