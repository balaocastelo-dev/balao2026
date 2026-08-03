export function slugify(input: string): string {
  const text = String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const slug = text
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "post";
}

export function stripHtmlToText(html: string): string {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerptFromHtml(html: string, maxChars = 180): string {
  const text = stripHtmlToText(html);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

export function estimateReadingTimeMinutesFromHtml(html: string): number {
  const text = stripHtmlToText(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Detecta conteúdo gerado a partir de produto sem texto real (thin content):
// template genérico de fallback ou corpo curto demais. Posts assim só saem com
// conteúdo real (título + texto), nunca apenas com o template repetido.
export function isThinProductContent(input: { contentHtml: string; seoDescription: string }): boolean {
  const text = stripHtmlToText(input.contentHtml).toLowerCase();
  const description = String(input.seoDescription || "").toLowerCase();

  if (text.length < 300) return true;
  if (description.includes("entenda para quem o")) return true;
  if (text.includes("atalhos úteis")) return true;
  if (text.includes("boa opção para quem busca desempenho e confiabilidade")) return true;
  return false;
}

export function withUtm(url: string, params: Record<string, string>): string {
  try {
    const u = new URL(url);
    for (const [k, v] of Object.entries(params)) {
      u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}

