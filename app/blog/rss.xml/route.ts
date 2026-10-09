import { nomeDaCategoria } from "@/lib/blog/categorias";
import { listarResumos } from "@/lib/blog/repositorio";
import { SITE, imagemDoArtigo, urlDoArtigo } from "@/lib/blog/seo";

// O feed é refeito de hora em hora, junto com as páginas.
export const revalidate = 3600;

function xml(texto: string): string {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const artigos = (await listarResumos({ tolerante: true })).slice(0, 50);
  const ultimo = artigos[0] ? new Date(artigos[0].publicadoEm) : new Date();

  const itens = artigos
    .map((a) => {
      const url = urlDoArtigo(a.slug);
      return `
  <item>
    <title>${xml(a.titulo)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(a.publicadoEm).toUTCString()}</pubDate>
    <category>${xml(nomeDaCategoria(a.categoria))}</category>
    <description>${xml(a.resumo)}</description>
    <enclosure url="${xml(imagemDoArtigo(a))}" type="${a.capa?.src.endsWith(".webp") ? "image/webp" : a.capa ? "image/jpeg" : "image/png"}" length="0" />
  </item>`;
    })
    .join("");

  const corpo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Blog da Balão da Informática</title>
  <link>${SITE}/blog</link>
  <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
  <description>Guias de compra, análises com números de teste e orientação de assistência técnica, de uma loja de informática de Campinas.</description>
  <language>pt-BR</language>
  <lastBuildDate>${ultimo.toUTCString()}</lastBuildDate>${itens}
</channel>
</rss>`;

  return new Response(corpo, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
