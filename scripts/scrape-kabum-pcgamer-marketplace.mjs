// Varre a listagem "Computadores/PC/PC Gamer" da KaBuM! SEM o filtro kabum_product,
// ou seja, incluindo os vendedores de marketplace (não só a própria KaBuM!).
// Reaproveita o mesmo mecanismo de leitura do __NEXT_DATA__ usado no scraper do catálogo 1P.

import fs from 'fs';
import path from 'path';

const PAGE_SIZE = 120;
const DELAY_MS = 350;
const MAX_RETRIES = 3;

const CATEGORY_PATH = 'computadores/pc/pc-gamer';
const SORT = 'most_searched';

const OUT_DIR = path.resolve(process.cwd(), 'scripts', 'output');
const OUT_FILE = path.join(OUT_DIR, 'kabum-pcgamer-marketplace.json');

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(pageNumber) {
  const params = new URLSearchParams({
    page_number: String(pageNumber),
    page_size: String(PAGE_SIZE),
    facet_filters: '',
    sort: SORT
  });
  return `https://www.kabum.com.br/${CATEGORY_PATH}?${params.toString()}`;
}

function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]);
    let d = parsed?.props?.pageProps?.data;
    if (typeof d === 'string') d = JSON.parse(d);
    return d || null;
  } catch {
    return null;
  }
}

async function fetchPage(pageNumber) {
  const url = buildUrl(pageNumber);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const data = extractNextData(html);
      if (!data?.catalogServer) throw new Error('payload __NEXT_DATA__ ausente/inesperado');
      return data.catalogServer;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        console.error(`  ✗ Falhou pág ${pageNumber} após ${MAX_RETRIES} tentativas: ${err.message}`);
        return null;
      }
      await sleep(800 * attempt);
    }
  }
  return null;
}

function mapProduct(p) {
  const url = `https://www.kabum.com.br/produto/${p.code}/${p.friendlyName}`;
  return {
    code: p.code,
    name: p.name,
    url,
    category: p.category || null,
    manufacturer: p.manufacturer?.name || null,
    tag_description: p.tagDescription || null,
    weight_g: p.weight ?? null,
    warranty: p.warranty || null,
    image: p.image || null,
    images: Array.isArray(p.images) ? p.images : [],
    price: p.price ?? null,
    price_with_discount: p.priceWithDiscount ?? null,
    old_price: p.oldPrice ?? null,
    discount_percentage: p.discountPercentage ?? null,
    max_installment: p.maxInstallment || null,
    prime_price: p.primePrice ?? null,
    prime_price_with_discount: p.primePriceWithDiscount ?? null,
    available: !!p.available,
    quantity: p.quantity ?? null,
    average_rating: p.averageRating ?? null,
    rating_count: p.ratingCount ?? null,
    description_html: p.description || null,
    seller_name: p.sellerName || null,
    is_marketplace: !!p.flags?.isMarketplace
  };
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const byCode = new Map();

  const first = await fetchPage(1);
  if (!first) {
    console.error('Falha ao obter a primeira página. Abortando.');
    process.exit(1);
  }

  const totalPages = first.meta?.totalPagesCount || 1;
  const totalItems = first.meta?.totalItemsCount || (first.data || []).length;
  console.log(`Total anunciado: ${totalItems} produtos em ${totalPages} páginas.`);

  for (const p of first.data || []) byCode.set(p.code, mapProduct(p));
  console.log(`Página 1/${totalPages} ok (${byCode.size} itens)`);

  for (let page = 2; page <= totalPages; page++) {
    await sleep(DELAY_MS);
    const cat = await fetchPage(page);
    if (!cat) continue;
    for (const p of cat.data || []) byCode.set(p.code, mapProduct(p));
    console.log(`Página ${page}/${totalPages} ok (acumulado: ${byCode.size})`);
  }

  const finalList = Array.from(byCode.values());
  fs.writeFileSync(OUT_FILE, JSON.stringify(finalList, null, 2));

  const sellerCounts = {};
  for (const p of finalList) sellerCounts[p.seller_name] = (sellerCounts[p.seller_name] || 0) + 1;

  console.log(`\n✅ Total de produtos únicos: ${finalList.length}`);
  console.log('Distribuição por vendedor:', JSON.stringify(sellerCounts, null, 2));
  console.log(`Arquivo final: ${OUT_FILE}`);
}

run().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
