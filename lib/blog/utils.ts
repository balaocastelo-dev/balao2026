import { BLOG_CATEGORY_DEFAULT_IMAGE, BLOG_CAMPINAS_KEYWORDS } from '@/lib/blog/constants';

export function slugify(input: string): string {
  const s = (input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
  return s || 'post';
}

export function normalizeCategory(input: string | null | undefined): string {
  const raw = (input || '').trim();
  if (!raw) return 'Tecnologia';
  if (raw.toLowerCase().includes('campinas')) return 'Campinas e Região';
  return raw;
}

export function ensureFeaturedImageUrl(input: string | null | undefined, category: string): string {
  const v = (input || '').trim();
  if (v) return v;
  return BLOG_CATEGORY_DEFAULT_IMAGE[category] || BLOG_CATEGORY_DEFAULT_IMAGE['Tecnologia'];
}

export function computeIsCampinas(text: string): boolean {
  const t = (text || '').toLowerCase();
  return BLOG_CAMPINAS_KEYWORDS.some(k => t.includes(k));
}

export function stripTags(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeHtmlBasic(html: string): string {
  const raw = (html || '').trim();
  if (!raw) return '';
  const noScripts = raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
  return noScripts;
}

export function guessVideoProvider(url: string | null | undefined): string | null {
  const u = (url || '').toLowerCase();
  if (!u) return null;
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('globo.com') || u.includes('globoplay') || u.includes('g1.globo.com')) return 'globo';
  return 'embed';
}

export function buildExcerptFromText(text: string, maxLen = 180): string {
  const raw = (text || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  if (raw.length <= maxLen) return raw;
  const cut = raw.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}
