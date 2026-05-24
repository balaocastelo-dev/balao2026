import { stripTags } from '@/lib/blog/utils';

export type RssItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  summary: string;
  raw: string;
  imageUrl: string | null;
  author: string | null;
};

export type ParsedFeed = {
  sourceName: string | null;
  items: RssItem[];
};

function decodeEntities(input: string): string {
  return (input || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  if (!m?.[1]) return null;
  const v = m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/m, '');
  return decodeEntities(v).trim();
}

function extractAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}="([^"]+)"[^>]*\\/?>`, 'i');
  const m = block.match(re);
  return m?.[1] ? decodeEntities(m[1]).trim() : null;
}

function pickFirstUrl(...candidates: Array<string | null | undefined>): string | null {
  for (const c of candidates) {
    const v = (c || '').trim();
    if (v) return v;
  }
  return null;
}

export function parseFeedXml(xml: string): ParsedFeed {
  const raw = (xml || '').trim();
  const isAtom = /<feed[\s>]/i.test(raw) || /<entry[\s>]/i.test(raw);

  const sourceName = stripTags(extractTag(raw, 'title') || '').trim() || null;

  if (isAtom) {
    const entries = [...raw.matchAll(/<entry[\s>][\s\S]*?<\/entry>/gi)].map(m => m[0]);
    const items: RssItem[] = entries
      .map(entry => {
        const title = stripTags(extractTag(entry, 'title') || '').trim();
        const link =
          extractAttr(entry, 'link', 'href') ||
          extractTag(entry, 'link') ||
          '';
        const updated = extractTag(entry, 'updated') || extractTag(entry, 'published');
        const summaryHtml = extractTag(entry, 'summary') || extractTag(entry, 'content') || '';
        const summary = stripTags(summaryHtml).trim();
        const author = stripTags(extractTag(entry, 'name') || '').trim() || null;
        const imageUrl = pickFirstUrl(
          extractAttr(entry, 'media:content', 'url'),
          extractAttr(entry, 'enclosure', 'url')
        );
        return {
          title: title || 'Sem título',
          link: decodeEntities(link).trim(),
          publishedAt: updated ? new Date(updated).toISOString() : null,
          summary,
          raw: entry,
          imageUrl,
          author
        };
      })
      .filter(i => Boolean(i.link));
    return { sourceName, items };
  }

  const channelTitle = sourceName || '';
  const itemsRaw = [...raw.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map(m => m[0]);
  const items: RssItem[] = itemsRaw
    .map(item => {
      const title = stripTags(extractTag(item, 'title') || '').trim();
      const link = (extractTag(item, 'link') || '').trim();
      const pub = extractTag(item, 'pubDate') || extractTag(item, 'dc:date');
      const descHtml = extractTag(item, 'description') || extractTag(item, 'content:encoded') || '';
      const summary = stripTags(descHtml).trim();
      const author = stripTags(extractTag(item, 'dc:creator') || extractTag(item, 'author') || '').trim() || null;
      const imageUrl = pickFirstUrl(
        extractAttr(item, 'media:content', 'url'),
        extractAttr(item, 'enclosure', 'url')
      );
      let publishedAt: string | null = null;
      if (pub) {
        const d = new Date(pub);
        if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
      }
      return {
        title: title || 'Sem título',
        link: decodeEntities(link).trim(),
        publishedAt,
        summary,
        raw: item,
        imageUrl,
        author
      };
    })
    .filter(i => Boolean(i.link));

  return { sourceName: sourceName || channelTitle || null, items };
}

export async function fetchRssFeed(url: string): Promise<ParsedFeed> {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'balao-bot/1.0 (+https://www.balao.info)',
      accept: 'application/rss+xml, application/atom+xml, text/xml, */*'
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`RSS fetch falhou: ${res.status}`);
  const xml = await res.text();
  return parseFeedXml(xml);
}
