import { lerProdutosDoSitemap, fatiarProdutos, PRODUTOS_POR_ARQUIVO } from "@/lib/sitemap/produtos";

// O Next 16, com generateSitemaps(), só publica /sitemap/<id>.xml.
// O índice que o Google já conhece continua em /sitemap.xml: o proxy
// reescreve esse endereço para cá.
export async function GET() {
  const produtos = await lerProdutosDoSitemap().catch(() => []);
  const fatias = produtos.length === 0 ? [] : fatiarProdutos(produtos, PRODUTOS_POR_ARQUIVO);
  const partes = [
    "https://www.balao.info/sitemap/paginas.xml",
    ...fatias.map((_, i) => `https://www.balao.info/sitemap/produtos-${i}.xml`),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${partes.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;
  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
