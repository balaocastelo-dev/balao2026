import { stripTags } from '@/lib/blog/utils';

export type ArticleExtract = {
  url: string;
  title: string | null;
  author: string | null;
  publishedAt: string | null;
  text: string;
  ogImage: string | null;
  images: string[];
  videoEmbedUrl: string | null;
};

function extractMeta(html: string, attr: 'property' | 'name', key: string): string | null {
  const re = new RegExp(`<meta[^>]*\\b${attr}="${key}"[^>]*\\bcontent="([^"]+)"[^>]*>`, 'i');
  const m = html.match(re);
  return m?.[1] ? m[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m?.[1]) return null;
  return stripTags(m[1]).trim() || null;
}

function extractBlock(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = html.match(re);
  return m?.[1] ? m[1] : null;
}

function collectImages(html: string, limit = 12): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (u: string) => {
    const v = (u || '').trim();
    if (!v) return;
    if (seen.has(v)) return;
    if (v.startsWith('data:')) return;
    seen.add(v);
    urls.push(v);
  };

  const meta = extractMeta(html, 'property', 'og:image') || extractMeta(html, 'name', 'twitter:image');
  if (meta) push(meta);

  for (const m of html.matchAll(/<img[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    if (!m?.[1]) continue;
    push(m[1]);
    if (urls.length >= limit) break;
  }
  return urls;
}

function findVideoEmbed(html: string): string | null {
  const iframe = [...html.matchAll(/<iframe[^>]*\bsrc="([^"]+)"[^>]*>/gi)].map(m => m[1]).find(Boolean);
  if (iframe) return iframe.trim();
  const ogVideo =
    extractMeta(html, 'property', 'og:video:url') ||
    extractMeta(html, 'property', 'og:video') ||
    extractMeta(html, 'property', 'og:video:secure_url');
  if (ogVideo) return ogVideo.trim();
  return null;
}

function extractReadableText(html: string): string {
  const cleaned = (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\s+/g, ' ');

  const article = extractBlock(cleaned, 'article') || extractBlock(cleaned, 'main') || extractBlock(cleaned, 'body') || cleaned;

  const text = stripTags(article)
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  return sentences.slice(0, 120).join(' ');
}

export async function fetchAndExtractArticle(url: string): Promise<ArticleExtract> {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'balao-bot/1.0 (+https://www.balao.info)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`Leitura da matéria falhou: ${res.status}`);
  const html = await res.text();

  const ogTitle = extractMeta(html, 'property', 'og:title');
  const title = ogTitle || extractTitle(html);

  const author =
    extractMeta(html, 'name', 'author') ||
    extractMeta(html, 'property', 'article:author') ||
    null;
  const publishedRaw =
    extractMeta(html, 'property', 'article:published_time') ||
    extractMeta(html, 'name', 'article:published_time') ||
    null;
  let publishedAt: string | null = null;
  if (publishedRaw) {
    const d = new Date(publishedRaw);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }

  const images = collectImages(html);
  const ogImage = images[0] || null;
  const videoEmbedUrl = findVideoEmbed(html);
  const text = extractReadableText(html);

  return {
    url,
    title,
    author,
    publishedAt,
    text,
    ogImage,
    images,
    videoEmbedUrl
  };
}
