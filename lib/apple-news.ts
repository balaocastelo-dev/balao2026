import crypto from "crypto";
import { buildExcerptFromHtml, estimateReadingTimeMinutesFromHtml, slugify, stripHtmlToText } from "@/lib/blog-utils";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";
import { fetchRssItems, type RssItem } from "@/lib/rss";

export type AppleNewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  category: string;
  source_url: string;
  source_domain: string | null;
  source_feed: string;
  published_at: string;
  created_at: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  reading_time_minutes: number;
};

const APPLE_RADAR_FEEDS = [
  "https://www.apple.com/newsroom/rss-feed.rss",
  "https://feeds.macrumors.com/MacRumors-All",
  "https://9to5mac.com/feed/",
];

const APPLE_KEYWORDS = [
  "apple",
  "iphone",
  "ipad",
  "mac",
  "macbook",
  "imac",
  "mac mini",
  "watch",
  "apple watch",
  "ios",
  "ipados",
  "macos",
  "vision pro",
  "airpods",
  "wwdc",
  "siri",
  "icloud",
];

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function clip(input: string, max: number): string {
  const s = String(input || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function decodeHtmlEntities(input: string): string {
  return String(input || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeText(input: string): string {
  return decodeHtmlEntities(String(input || ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSourceDomain(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function isAppleNewsItem(item: RssItem): boolean {
  const domain = getSourceDomain(item.url) || getSourceDomain(item.sourceFeed) || "";
  if (domain.includes("apple.com") || domain.includes("macrumors.com") || domain.includes("9to5mac.com")) {
    return true;
  }

  const hay = normalizeText(`${item.title || ""} ${item.summary || ""}`);
  return APPLE_KEYWORDS.some((keyword) => hay.includes(normalizeText(keyword)));
}

function categorizeAppleNews(item: RssItem): string {
  const hay = normalizeText(`${item.title || ""} ${item.summary || ""}`);

  if (hay.includes("iphone") || hay.includes("ios")) return "iPhone";
  if (hay.includes("ipad") || hay.includes("ipados")) return "iPad";
  if (hay.includes("watch") || hay.includes("watchos")) return "Apple Watch";
  if (hay.includes("macbook") || hay.includes("imac") || hay.includes("mac mini") || hay.includes("mac pro") || hay.includes("mac studio") || hay.includes("macos")) {
    return "Mac";
  }
  if (hay.includes("airpods") || hay.includes("homepod") || hay.includes("apple tv")) return "Ecossistema Apple";
  if (hay.includes("siri") || hay.includes("vision pro") || hay.includes("icloud") || hay.includes("wwdc")) {
    return "Atualizações Apple";
  }

  return "Universo Apple";
}

function getServiceRecommendation(category: string): { title: string; href: string; label: string } {
  switch (category) {
    case "Mac":
      return {
        title: "Seu MacBook, iMac ou Mac Mini precisa de reparo?",
        href: "/wendell/apple/macbook",
        label: "Ver assistência Mac",
      };
    case "iPad":
      return {
        title: "Seu iPad está com tela quebrada, bateria ruim ou falha de carga?",
        href: "/wendell/apple/ipad",
        label: "Ver assistência iPad",
      };
    case "Apple Watch":
      return {
        title: "Apple Watch com tela, bateria ou coroa digital com defeito?",
        href: "/wendell/apple/apple-watch",
        label: "Ver assistência Apple Watch",
      };
    case "iPhone":
      return {
        title: "Também atendemos clientes que buscam suporte para dispositivos Apple em Campinas.",
        href: "/reparoapple",
        label: "Ver reparo Apple",
      };
    default:
      return {
        title: "Quer ajuda para decidir o melhor reparo ou suporte para seu equipamento Apple?",
        href: "/wendell/apple",
        label: "Ver especialista Apple",
      };
  }
}

function buildAppleRadarHtml(item: RssItem, category: string): string {
  const sourceDomain = getSourceDomain(item.url) || "fonte externa";
  const sourceSummary = clip(stripHtmlToText(String(item.summary || "")), 520);
  const service = getServiceRecommendation(category);

  const html = `
    <p><strong>Radar Apple:</strong> monitoramos automaticamente fontes do universo Apple para destacar lançamentos, atualizações e movimentos que podem impactar quem usa iPhone, iPad, Mac e Apple Watch.</p>
    ${sourceSummary ? `<p>${sourceSummary}</p>` : ""}
    <h2>Por que esta notícia importa</h2>
    <p>Se você acompanha o ecossistema Apple, esta atualização ajuda a entender tendências de hardware, software e suporte técnico. Para quem depende do equipamento no trabalho, no estudo ou na rotina, acompanhar essas mudanças facilita decisões de manutenção, upgrade e troca de dispositivo.</p>
    <h2>Leitura rápida do Radar</h2>
    <ul>
      <li>Categoria monitorada: <strong>${category}</strong>.</li>
      <li>Fonte acompanhada pelo radar: <strong>${sourceDomain}</strong>.</li>
      <li>Conteúdo publicado automaticamente com curadoria de notícias Apple.</li>
    </ul>
    <h2>Atendimento Apple em Campinas</h2>
    <p>${service.title} <a href="${service.href}">${service.label}</a>.</p>
    <p>Se preferir atendimento rápido, chame no WhatsApp <a href="https://wa.me/5519987510267" target="_blank" rel="noreferrer">19 98751-0267</a>.</p>
    <h2>Fonte original</h2>
    <p><a href="${item.url}" target="_blank" rel="nofollow noreferrer">${item.url}</a></p>
  `.trim();

  return sanitizeHtmlBasic(html);
}

function toApplePost(item: RssItem): AppleNewsPost {
  const sourceHash = sha256(item.url).slice(0, 8);
  const title = decodeHtmlEntities(String(item.title || "Notícia Apple")).replace(/\s+/g, " ").trim();
  const slug = `${slugify(title).slice(0, 72)}-${sourceHash}`;
  const category = categorizeAppleNews(item);
  const contentHtml = buildAppleRadarHtml(item, category);
  const excerpt =
    buildExcerptFromHtml(contentHtml, 180) ||
    `Acompanhe esta atualização do universo Apple e veja como ela pode impactar usuários em Campinas e região.`;
  const published = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const publishedIso = Number.isFinite(published.getTime()) ? published.toISOString() : new Date().toISOString();
  const sourceDomain = getSourceDomain(item.url);
  const canonicalUrl = `https://www.balao.info/wendell/apple/blog/${slug}`;

  return {
    id: sha256(`apple-radar:${item.url}`),
    slug,
    title,
    excerpt,
    content_html: contentHtml,
    cover_image: item.imageUrls?.[0] ? String(item.imageUrls[0]) : "/images/apple/hub-hero-real.png",
    category,
    source_url: item.url,
    source_domain: sourceDomain,
    source_feed: item.sourceFeed,
    published_at: publishedIso,
    created_at: publishedIso,
    seo_title: clip(`${title} | Radar Apple Balão`, 60),
    seo_description: clip(
      `${excerpt} Leia o Radar Apple e fale com a Balão da Informática no WhatsApp 19 98751-0267.`,
      155,
    ),
    canonical_url: canonicalUrl,
    reading_time_minutes: estimateReadingTimeMinutesFromHtml(contentHtml),
  };
}

export async function listAppleRadarPosts(take = 30): Promise<AppleNewsPost[]> {
  const allItems = await Promise.all(
    APPLE_RADAR_FEEDS.map(async (feedUrl) => {
      try {
        return await fetchRssItems(feedUrl, 18);
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const merged = allItems
    .flat()
    .filter(isAppleNewsItem)
    .filter((item) => {
      const key = String(item.url || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0))
    .slice(0, Math.max(1, Math.min(80, take)));

  return merged.map(toApplePost);
}

export async function getAppleRadarPostBySlug(slug: string): Promise<AppleNewsPost | null> {
  const posts = await listAppleRadarPosts(60);
  return posts.find((post) => post.slug === slug) || null;
}
