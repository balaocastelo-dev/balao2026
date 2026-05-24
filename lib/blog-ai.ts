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
type AllowedCategory = "Início" | "Topic Trens" | "Hardware" | "Games" | "Mobile" | "Segurança" | "IA" | "Loja";

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

function enforceAllowedCategory(input: string, hint?: { title?: string; sourceUrl?: string; kind?: "rss" | "product" | "trend" }): AllowedCategory {
  const kind = hint?.kind;
  if (kind === "trend") return "Topic Trens";
  if (kind === "product") return "Loja";

  const raw = cleanText(input || "").toLowerCase();
  const title = cleanText(hint?.title || "").toLowerCase();
  const source = cleanText(hint?.sourceUrl || "").toLowerCase();

  if (raw.includes("topic") || raw.includes("trend") || raw.includes("trens")) return "Topic Trens";
  if (raw.includes("hardware")) return "Hardware";
  if (raw.includes("game")) return "Games";
  if (raw.includes("mobile") || raw.includes("celular") || raw.includes("smartphone")) return "Mobile";
  if (raw.includes("segurança") || raw.includes("seguranca") || raw.includes("ciber")) return "Segurança";
  if (raw === "ia" || raw.includes("inteligência artificial") || raw.includes("inteligencia artificial")) return "IA";
  if (raw.includes("loja") || raw.includes("ofertas") || raw.includes("guia de compra")) return "Loja";

  const looksCampinas =
    source.includes("campinas") ||
    title.includes("campinas") ||
    title.includes("cambui") ||
    title.includes("cambuí") ||
    title.includes("campinas e região") ||
    title.includes("campinas e regiao");
  if (looksCampinas) return "Início";

  if (
    /gpu|placa de v|placa de ví|processador|intel|amd|ryzen|core i|ssd|nvme|mem[oó]ria|ram|fonte|placa-m[aã]e|motherboard|gabinete/i.test(
      title,
    )
  ) {
    return "Hardware";
  }
  if (/game|games|steam|xbox|playstation|ps5|nintendo|switch|fortnite|gta|cs2|valorant/i.test(title)) return "Games";
  if (/android|iphone|ios|smartphone|celular|galaxy|xiaomi|motorola|samsung/i.test(title)) return "Mobile";
  if (/seguran[cç]a|ciber|malware|phishing|ransomware|vazamento|hack/i.test(title)) return "Segurança";
  if (/\bia\b|chatgpt|openai|gemini|llama|copilot|intelig[eê]ncia artificial/i.test(title)) return "IA";

  if (source.includes("balao.info") && source.includes("/product/")) return "Loja";

  return "Início";
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

function buildFallbackTrendHtml(input: { query: string; dateIso: string; sourceUrl: string }): string {
  const q = cleanText(input.query);
  const date = new Date(input.dateIso);
  const dateText = Number.isFinite(date.getTime()) ? date.toLocaleDateString("pt-BR") : "";
  const queryEscaped = q || "tendência do dia";
  return `
<p><strong>${queryEscaped}</strong> apareceu entre os assuntos em alta ${dateText ? `em ${dateText}` : "hoje"}. Abaixo, explicamos o que essa tendência pode indicar e como ela influencia decisões de compra de informática.</p>
<h2>Por que isso está em alta?</h2>
<p>Assuntos em alta normalmente se relacionam a lançamentos, promoções, atualizações de software, eventos e comparativos. Quando o tema envolve tecnologia, ele costuma gerar dúvidas sobre <strong>custo-benefício</strong>, compatibilidade e disponibilidade.</p>
<h2>O que isso muda na hora de comprar</h2>
<ul>
  <li><strong>Melhor momento de compra:</strong> tendências podem antecipar promoções e quedas de preço.</li>
  <li><strong>Compatibilidade:</strong> confira geração/soquete (CPU), padrão (RAM/SSD) e portas.</li>
  <li><strong>Uso real:</strong> priorize o que impacta seu dia a dia (trabalho, estudo, games, criação).</li>
</ul>
<h2>Checklist rápido (para decidir sem erro)</h2>
<ol>
  <li>Defina seu objetivo e seu orçamento.</li>
  <li>Escolha uma configuração equilibrada (CPU/GPU/RAM/SSD).</li>
  <li>Compare opções e valide compatibilidade antes de comprar.</li>
</ol>
<h2>Quer uma recomendação pronta?</h2>
<p>Fale com um especialista e receba indicação direta com link do produto: <a href="${WHATSAPP_URL}" target="_blank" rel="noreferrer">WhatsApp 19 98751-0267</a>.</p>
<p>Atalhos úteis: <a href="${SITE_URL}/notebooks">Notebooks</a> • <a href="${SITE_URL}/pcgamer">PC Gamer</a> • <a href="${SITE_URL}/departamentos">Departamentos</a> • <a href="${SITE_URL}/promocao">Promoções</a></p>
<h2>Palavras-chave relacionadas</h2>
<p>${queryEscaped}, notebook, PC gamer, hardware, SSD, memória RAM, placa de vídeo.</p>
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

  const fallbackTitle = cleanRssTitle(item.title, item.url);
  const title = (typeof data?.title === "string" && data.title.trim()) || fallbackTitle;
  const seoTitle =
    (typeof data?.seo_title === "string" && data.seo_title.trim()) ||
    clip(`${title} | Balão da Informática`, 60);
  const seoDescription =
    (typeof data?.seo_description === "string" && data.seo_description.trim()) ||
    clip(
      `Entenda ${title} e veja dicas práticas para comprar notebook, PC Gamer e hardware. Atendimento no WhatsApp 19 98751-0267.`,
      155,
    );
  const categoryRaw = (typeof data?.category === "string" && data.category.trim()) || "Início";
  const category = enforceAllowedCategory(categoryRaw, { title, sourceUrl: item.url, kind: "rss" });
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
      category,
      tags,
    }),
  };
}

function tagsFromQuery(query: string): string[] {
  const stop = new Set([
    "a",
    "o",
    "os",
    "as",
    "de",
    "da",
    "do",
    "das",
    "dos",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "para",
    "por",
    "com",
    "e",
    "ou",
    "um",
    "uma",
    "uns",
    "umas",
    "que",
    "como",
    "vale",
    "pena",
  ]);

  const cleaned = cleanText(query)
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúàâêôãõç ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !stop.has(w));

  const uniq: string[] = [];
  for (const w of words) {
    if (uniq.includes(w)) continue;
    uniq.push(w);
  }
  return uniq.slice(0, 10);
}

export async function generateBlogPostFromTrend(input: { query: string; publishedAtIso: string; url: string; sourceUrl: string }): Promise<GeneratedBlogPost> {
  const query = cleanText(input.query);
  const prompt = `
Você é redator(a) e estrategista SEO do blog "Balão da Informática" (pt-BR).

Objetivo: criar um artigo ORIGINAL e útil baseado em um termo em alta (Google Trends), com foco em intenção de compra.

Regras obrigatórias:
- Escreva em pt-BR.
- Não invente fatos específicos. Fale de forma geral e prática.
- Use HTML simples: p, h2, h3, ul, ol, li, strong, em, a.
- Inclua 2-4 perguntas frequentes (h2) e um CTA para WhatsApp (${WHATSAPP_URL}) com 19 98751-0267.
- Inclua 2-4 links internos para ${SITE_URL} (ex.: /notebooks, /pcgamer, /departamentos, /promocao).
- Retorne SOMENTE um JSON válido no formato:
{
  "title": "...",
  "seo_title": "...",
  "seo_description": "...",
  "category": "Topic Trens",
  "tags": ["...", "..."],
  "content_html": "..."
}

Termo em alta: ${JSON.stringify(query)}
Fonte (apenas referência): ${JSON.stringify(input.sourceUrl)}
`;

  const data = await generateFromAI(prompt);
  const title = (typeof data?.title === "string" && data.title.trim()) || `Em alta: ${cleanRssTitle(query, input.sourceUrl)}`;
  const seoTitle =
    (typeof data?.seo_title === "string" && data.seo_title.trim()) || clip(`${title} | Balão da Informática`, 60);
  const seoDescription =
    (typeof data?.seo_description === "string" && data.seo_description.trim()) ||
    clip(
      `Veja o que significa ${query} nas buscas e como isso afeta compras de informática. Atendimento no WhatsApp 19 98751-0267.`,
      155,
    );
  const category = enforceAllowedCategory("Topic Trens", { title, sourceUrl: input.sourceUrl, kind: "trend" });
  const tags = Array.isArray(data?.tags) ? data.tags.filter((t: any) => typeof t === "string" && t.trim()).slice(0, 10) : tagsFromQuery(query);

  const rawHtml =
    (typeof data?.content_html === "string" && data.content_html.trim()) ||
    buildFallbackTrendHtml({ query, dateIso: input.publishedAtIso, sourceUrl: input.sourceUrl });

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
      image: undefined,
      category,
      tags,
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
  const category = enforceAllowedCategory("Loja", { title, sourceUrl: input.productUrl, kind: "product" });
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
