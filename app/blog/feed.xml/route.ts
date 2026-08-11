import { NextResponse } from "next/server";
import { listBlogPostsForPage } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

function escapeXml(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await listBlogPostsForPage({ take: 50 });
  const site = "https://www.balao.info";
  const now = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${site}/blog/${p.slug}`;
      const title = escapeXml(p.title);
      const description = escapeXml(p.seo_description || p.excerpt || "");
      const pubDate = new Date(p.published_at).toUTCString();
      return `
  <item>
    <title>${title}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${description}</description>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>BalãoNews | Balão da Informática</title>
  <link>${site}/blog</link>
  <description>Notícias, guias e dicas práticas de tecnologia do Balão da Informática.</description>
  <language>pt-BR</language>
  <lastBuildDate>${now}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
