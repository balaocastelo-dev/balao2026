type ArticleExtract = {
  url: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
  imageUrl: string | null;
  contentText: string;
  wordCount: number;
};

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = null;
  while ((match = scriptRegex.exec(html))) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;
    const parsed = safeJsonParse(raw);
    if (!parsed) continue;
    if (Array.isArray(parsed)) blocks.push(...parsed);
    else blocks.push(parsed);
  }
  return blocks;
}

function cleanWhitespace(input: string): string {
  return String(input || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string): string {
  return cleanWhitespace(String(html || "").replace(/<[^>]*>/g, " "));
}

function pickLongestTagBlock(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`, "gi");
  const matches = Array.from(html.matchAll(re)).map((m) => m[0]);
  if (matches.length === 0) return null;
  matches.sort((a, b) => b.length - a.length);
  return matches[0] || null;
}

function getMeta(html: string, name: string): string | null {
  const re = new RegExp(`<meta\\b[^>]*(?:property|name)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m?.[1] ? cleanWhitespace(m[1]) : null;
}

function normalizeExtractedText(text: string): string {
  const cleaned = String(text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return cleaned;
}

function htmlToTextCandidate(html: string): string {
  let out = String(html || "");
  out = out.replace(/<script\b[\s\S]*?<\/script>/gi, " ");
  out = out.replace(/<style\b[\s\S]*?<\/style>/gi, " ");
  out = out.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  out = out.replace(/<!--[\s\S]*?-->/g, " ");
  out = out.replace(/<svg\b[\s\S]*?<\/svg>/gi, " ");
  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<\/p>/gi, "\n\n");
  out = out.replace(/<\/h[1-6]>/gi, "\n\n");
  out = out.replace(/<\/li>/gi, "\n");
  out = stripTags(out);
  return normalizeExtractedText(out);
}

function countWords(text: string): number {
  const words = cleanWhitespace(text).split(/\s+/).filter(Boolean);
  return words.length;
}

export async function readArticle(url: string, input?: { timeoutMs?: number }): Promise<ArticleExtract> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(3000, input?.timeoutMs ?? 12000));

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; BalaoBot/1.0; +https://www.balao.info)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    const html = await res.text();

    const title =
      getMeta(html, "og:title") ||
      (() => {
        const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        return m?.[1] ? cleanWhitespace(m[1]) : null;
      })();
    const description = getMeta(html, "og:description") || getMeta(html, "description");
    const siteName = getMeta(html, "og:site_name");
    const imageUrl = getMeta(html, "og:image");

    const blocks = extractJsonLdBlocks(html);
    let jsonLdBody: string | null = null;
    for (const b of blocks) {
      if (!b || typeof b !== "object") continue;
      const obj: any = b;
      const candidates: any[] = [obj];
      if (Array.isArray(obj["@graph"])) candidates.push(...obj["@graph"]);
      for (const node of candidates) {
        if (!node || typeof node !== "object") continue;
        const t = node["@type"];
        const isArticle = t === "NewsArticle" || t === "Article" || t === "ReportageNewsArticle";
        if (!isArticle) continue;
        if (typeof node.articleBody === "string" && node.articleBody.trim().length > 200) {
          jsonLdBody = node.articleBody;
          break;
        }
      }
      if (jsonLdBody) break;
    }

    const articleBlock = pickLongestTagBlock(html, "article");
    const mainBlock = pickLongestTagBlock(html, "main");
    const candidateHtml = jsonLdBody ? jsonLdBody : articleBlock || mainBlock || html;
    const contentText = htmlToTextCandidate(candidateHtml);
    const wordCount = countWords(contentText);

    return {
      url,
      title,
      description,
      siteName,
      imageUrl,
      contentText,
      wordCount,
    };
  } catch {
    return {
      url,
      title: null,
      description: null,
      siteName: null,
      imageUrl: null,
      contentText: "",
      wordCount: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

