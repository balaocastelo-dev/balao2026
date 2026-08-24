// Varre o catálogo público da KaBuM! filtrado por "vendido pela KaBuM!" (facet kabum_product=true)
// em todos os departamentos e salva um JSON único com todos os produtos únicos encontrados.
//
// Uso: node scripts/scrape-kabum-1p-catalog.mjs
//
// A KaBuM! renderiza as páginas de listagem via Next.js SSR e embute o payload completo
// (nome, preço, imagens, descrição/HTML com specs, avaliação média, etc.) no script
// <script id="__NEXT_DATA__">. Não é necessário JS/headless browser: um fetch simples
// da página HTML já retorna esse JSON.

import fs from 'fs';
import path from 'path';

const FACET_KABUM_PRODUCT = 'eyJrYWJ1bV9wcm9kdWN0IjpbInRydWUiXX0='; // {"kabum_product":["true"]}
const PAGE_SIZE = 120; // máximo aceito pelo servidor (valores maiores são truncados para 120)
const DELAY_MS = 350; // intervalo entre requisições para não sobrecarregar/ser bloqueado
const MAX_RETRIES = 3;

const CATEGORY_SLUGS = [
  'hardware',
  'perifericos',
  'computadores',
  'gamer',
  'pc-gamer-completo',
  'espaco-gamer',
  'celular-smartphone',
  'tablets-ipads-e-e-readers',
  'audio',
  'tv',
  'eletroportateis',
  'casa-inteligente',
  'ferramentas',
  'ar-e-ventilacao',
  'seguranca',
  'conectividade',
  'geek',
  'servicos-digitais',
  'cameras-e-drones',
  'escritorio',
  'energia'
];

const OUT_DIR = path.resolve(process.cwd(), 'scripts', 'output');
const OUT_FILE = path.join(OUT_DIR, 'kabum-1p-catalog.json');
const PROGRESS_FILE = path.join(OUT_DIR, 'kabum-1p-catalog.progress.json');

const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(slug, pageNumber) {
  const params = new URLSearchParams({
    seller_id: '',
    page_number: String(pageNumber),
    page_size: String(PAGE_SIZE),
    facet_filters: FACET_KABUM_PRODUCT,
    sort: '',
    variant: 'retail'
  });
  return `https://www.kabum.com.br/${slug}?${params.toString()}`;
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

async function fetchPage(slug, pageNumber) {
  const url = buildUrl(slug, pageNumber);
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
        console.error(`  ✗ Falhou ${slug} pág ${pageNumber} após ${MAX_RETRIES} tentativas: ${err.message}`);
        return null;
      }
      await sleep(800 * attempt);
    }
  }
  return null;
}

function mapProduct(p, slug) {
  const url = `https://www.kabum.com.br/produto/${p.code}/${p.friendlyName}`;
  return {
    code: p.code,
    name: p.name,
    url,
    department_slug: slug,
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
    seller_name: p.sellerName || null
  };
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  /** @type {Map<number, any>} */
  const byCode = new Map();

  // Retoma de um progresso anterior, se existir.
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      for (const item of prev) byCode.set(item.code, item);
      console.log(`↻ Retomando progresso anterior: ${byCode.size} produtos já coletados.`);
    } catch {
      // ignora progresso corrompido
    }
  }

  const summary = [];

  for (const slug of CATEGORY_SLUGS) {
    console.log(`\n=== Departamento: ${slug} ===`);
    const first = await fetchPage(slug, 1);
    if (!first) {
      summary.push({ slug, totalItemsCount: 0, collected: 0, error: true });
      continue;
    }

    const totalPages = first.meta?.totalPagesCount || 1;
    const totalItems = first.meta?.totalItemsCount || (first.data || []).length;
    console.log(`  Total anunciado: ${totalItems} produtos em ${totalPages} páginas.`);

    let collectedThisSlug = 0;
    for (const p of first.data || []) {
      byCode.set(p.code, mapProduct(p, slug));
      collectedThisSlug++;
    }
    process.stdout.write(`  Página 1/${totalPages} ok (${collectedThisSlug} itens)\n`);

    for (let page = 2; page <= totalPages; page++) {
      await sleep(DELAY_MS);
      const cat = await fetchPage(slug, page);
      if (!cat) continue;
      for (const p of cat.data || []) {
        byCode.set(p.code, mapProduct(p, slug));
        collectedThisSlug++;
      }
      process.stdout.write(`  Página ${page}/${totalPages} ok (acumulado: ${collectedThisSlug})\n`);
    }

    summary.push({ slug, totalItemsCount: totalItems, collected: collectedThisSlug });

    // Salva progresso incremental para poder retomar em caso de falha/corte.
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(Array.from(byCode.values())));
    await sleep(DELAY_MS);
  }

  const finalList = Array.from(byCode.values());
  fs.writeFileSync(OUT_FILE, JSON.stringify(finalList, null, 2));

  console.log('\n\n=== RESUMO FINAL ===');
  for (const s of summary) {
    console.log(`  ${s.slug}: anunciado=${s.totalItemsCount} coletado=${s.collected}${s.error ? ' [ERRO]' : ''}`);
  }
  console.log(`\n✅ Total de produtos únicos (deduplicados por código): ${finalList.length}`);
  console.log(`Arquivo final: ${OUT_FILE}`);
}

run().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
