/* eslint-disable */
/**
 * SCRAPER Kabum - Exporta todo o catalogo para TXT TAB-separado compativel
 * com o importador do Balao.info /admin/importacao.
 *
 * - Usa pool de N workers (default: 100) via Promise.all limitado
 * - Extrai: Categorias -> Paginas de Categoria -> Links de Produtos
 * - Para cada produto, faz SCRAPE PROFUNDO: nome, preco, categoria hierarquica
 *   e TODAS as imagens encontradas via JSON-LD + parse HTML + enriquecimento incremental
 *
 * Saida em: ./kabum-export-YYYYMMDD-HHmm.txt
 *   Formato de linha (colunas TAB separadas):
 *   ProductURL  TAB ImageURL_1  TAB [ImageURL_2 ...] TAB Nome TAB Preço TAB CategoriaA > CategoriaB > Folha
 *
 * MODO DE USO:
 *   # Default: 100 workers, todas categorias, max 50 paginas/categoria
 *   npx tsx scripts/scrape-kabum-full.ts
 *
 *   # Customizado
 *   WORKERS=60 MAX_PAGES_PER_CAT=10 CATEGORIES="hardware/redes-e-roteadores/switches,perifericos/teclados" \
 *     npx tsx scripts/scrape-kabum-full.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";
import * as http from "node:http";

// ------------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------------
const WORKERS = Math.max(1, Number(process.env.WORKERS || "100"));
const MAX_PAGES_PER_CAT = Math.max(1, Number(process.env.MAX_PAGES_PER_CAT || "50"));
const OUTPUT = process.env.OUTPUT || `./kabum-export-${DateStamp()}.txt`;
const CATEGORIES_FILTER = (process.env.CATEGORIES || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

// ------------------------------------------------------------------
// CATEGORIAS RAIZ do Kabum (mapeamento conhecido do /map do site)
// ------------------------------------------------------------------
const CATEGORIES_SEED: { path: string; label: string }[] = [
  { path: "hardware/processadores", label: "Hardware > Processadores" },
  { path: "hardware/placas-mae", label: "Hardware > Placas Mãe" },
  { path: "hardware/memorias-ram", label: "Hardware > Memórias RAM" },
  { path: "hardware/placa-de-video-vga", label: "Hardware > Placa de Vídeo" },
  { path: "hardware/ssd-e-hd/ssd", label: "Hardware > SSD e HD > SSD" },
  { path: "hardware/ssd-e-hd/hd-interno", label: "Hardware > SSD e HD > HD Interno" },
  { path: "hardware/fontes", label: "Hardware > Fontes" },
  { path: "hardware/gabinetes", label: "Hardware > Gabinetes" },
  { path: "hardware/coolers-e-ventoinhas", label: "Hardware > Coolers" },
  { path: "hardware/redes-e-roteadores/switches", label: "Hardware > Redes e Roteadores > Switches" },
  { path: "hardware/redes-e-roteadores/roteadores", label: "Hardware > Redes e Roteadores > Roteadores" },
  { path: "hardware/redes-e-roteadores/placa-de-rede", label: "Hardware > Redes e Roteadores > Placa de Rede" },
  { path: "perifericos/teclados", label: "Periféricos > Teclados" },
  { path: "perifericos/mouses", label: "Periféricos > Mouses" },
  { path: "perifericos/headsets-e-fones", label: "Periféricos > Headsets e Fones" },
  { path: "perifericos/webcams", label: "Periféricos > Webcams" },
  { path: "perifericos/controles", label: "Periféricos > Controles" },
  { path: "perifericos/mousepads", label: "Periféricos > Mousepads" },
  { path: "monitores", label: "Monitores" },
  { path: "tv", label: "TV" },
  { path: "notebooks", label: "Notebooks" },
  { path: "computadores", label: "Computadores" },
  { path: "pc-gamer", label: "PC Gamer" },
  { path: "celulares-e-smartphones/smartphones", label: "Celulares e Smartphones > Smartphones" },
  { path: "tablets-ipads-e-e-readers", label: "Tablets e iPads" },
  { path: "audio/caixas-de-som", label: "Áudio > Caixas de Som" },
  { path: "audio/soundbars", label: "Áudio > Soundbars" },
  { path: "projetores", label: "Projetores" },
  { path: "cameras-e-drones/cameras-digitais", label: "Câmeras e Drones > Câmeras Digitais" },
  { path: "escritorio/impressoras", label: "Escritório > Impressoras" },
  { path: "energia/nobreaks", label: "Energia > Nobreaks" },
  { path: "energia/estabilizadores", label: "Energia > Estabilizadores" },
  { path: "energia/filtros-de-linha", label: "Energia > Filtros de Linha" },
  { path: "seguranca/cameras-de-seguranca", label: "Segurança > Câmeras de Segurança" },
];

// ------------------------------------------------------------------
// HELPERS GERAIS
// ------------------------------------------------------------------
function DateStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
function pickUa() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
const TAB = "\t";
const EOL = "\r\n";

function safeForTsv(s: any): string {
  if (s == null) return "";
  return String(s).replace(/\r?\n/g, " ").replace(/\t/g, " ").trim();
}

// ------------------------------------------------------------------
// FETCH robusto com retry e Node.js nativo (evitar dependências)
// ------------------------------------------------------------------
interface FetchOptions {
  timeout?: number;
  retries?: number;
  backoffMs?: number;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
}

async function fetchText(url: string, opts: FetchOptions = {}): Promise<{ ok: boolean; status: number; text: string }> {
  const timeout = opts.timeout ?? 12000;
  const retries = opts.retries ?? 3;
  const backoffMs = opts.backoffMs ?? 300;
  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          "User-Agent": pickUa(),
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
          ...(opts.headers || {}),
        },
        body: opts.body,
        signal: controller.signal as any,
      } as any);
      clearTimeout(t);
      const text = await res.text();
      return { ok: res.ok, status: res.status, text };
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await sleep(backoffMs * Math.pow(2, attempt));
    }
  }
  return { ok: false, status: 0, text: "" };
}

// ------------------------------------------------------------------
// WORKER POOL
// ------------------------------------------------------------------
async function poolLimit<T, R>(concurrency: number, items: T[], worker: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function runOne() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await worker(items[i], i);
      } catch (e: any) {
        results[i] = null as any;
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runOne());
  await Promise.all(workers);
  return results;
}

// ------------------------------------------------------------------
// PARSER: Página de categoria (listagem) -> extrai links /produto/XXXXX
// ------------------------------------------------------------------
function extractProductLinksFromCategoryPage(html: string): { url: string; image?: string; name?: string }[] {
  const found: Map<string, { url: string; image?: string; name?: string }> = new Map();
  // Regex para <a ... href="/produto/123456/..." ... > ... img src="..." ... nome
  const aRe = /<a([^>]*?)href=(["'])([^"']*?\/produto\/\d+[^"']*)\2([^>]*?)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = aRe.exec(html))) {
    const href = m[3];
    if (!/\/produto\/\d+/i.test(href)) continue;
    const abs = /^https?:/i.test(href) ? href : `https://www.kabum.com.br${href.startsWith("/") ? href : "/" + href}`;
    const idMatch = abs.match(/\/produto\/(\d+)/);
    if (!idMatch) continue;
    const id = idMatch[1];
    if (found.has(id)) continue;
    const body = m[5];
    let img: string | undefined;
    const imgMatch = body.match(/<img[^>]+src=(["'])([^"']+)\1/i) || body.match(/data-src=(["'])([^"']+)\1/i);
    if (imgMatch) img = imgMatch[2].startsWith("http") ? imgMatch[2] : `https:${imgMatch[2]}`;
    let name: string | undefined;
    const strippedBody = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (strippedBody && strippedBody.length > 4 && strippedBody.length < 220) name = strippedBody;
    found.set(id, { url: abs, image: img, name });
  }
  return Array.from(found.values());
}

// ------------------------------------------------------------------
// PARSER: Página de produto (profundo) -> nome/preço/categoria/imagens
// Usa JSON-LD + regex HTML (mesmo algoritmo do /api/scrape/product do Next)
// ------------------------------------------------------------------
interface ScrapedProduct {
  productUrl: string;
  name: string;
  price: string;
  category: string;
  imageUrls: string[];
  description: string;
}

function normalizeMiraklToXlarge(u: string): string {
  return u
    .replace(/\/(mini|thumb|thumbnail|small|medium|large|original)\//i, "/xlarge/")
    .replace(/_mini\.(jpg|jpeg|png|webp)$/i, ".$1")
    .replace(/_(small|medium|large|original)\.(jpg|jpeg|png|webp)$/i, ".$2");
}

function toKabumOriginalUrl(u: string): string {
  return u
    .replace(/_m\.(jpg|jpeg|png|webp)$/i, ".$1")
    .replace(/_g\.(jpg|jpeg|png|webp)$/i, ".$1")
    .replace(/\/(small|medium|large|mini|thumb|thumbnail)\//i, "/original/");
}

function enrichImageVariants(existing: string[], maxVariants: number = 10): string[] {
  const out: string[] = (existing || []).slice();
  const seen = new Set(out.map((u) => u.toLowerCase()));
  const push = (u: string) => {
    if (!u) return;
    const s = u.toLowerCase();
    if (seen.has(s) || !/^https?:\/\//i.test(u)) return;
    seen.add(s);
    out.push(u);
  };
  for (const seed of existing || []) {
    if (out.length >= maxVariants) break;
    try {
      const url = new URL(seed);
      const filename = url.pathname.split("/").pop() || "";
      const m = filename.match(/(_)(\d{8,})(\.(?:jpg|jpeg|png|webp|gif))/i);
      if (m) {
        const baseNum = Number(m[2]);
        if (Number.isFinite(baseNum)) {
          const baseWithout = filename.slice(0, m.index) + m[1];
          const parentPath = url.pathname.slice(0, url.pathname.length - filename.length);
          const variants: number[] = [];
          for (let i = 1; i <= 8; i++) variants.push(baseNum + i);
          for (let i = 1; i <= 3; i++) variants.push(baseNum - i);
          for (const vNum of variants) {
            if (out.length >= maxVariants) break;
            const newName = baseWithout + String(vNum).padStart(m[2].length, "0") + m[3];
            const c = new URL(url.toString());
            c.pathname = parentPath + newName;
            c.search = "";
            push(c.toString());
          }
        }
      }
      if (/\/sync_mirakl\//i.test(url.pathname)) {
        const sizes = ["xlarge", "large", "original", "medium"];
        const parts = url.pathname.split("/").filter(Boolean);
        const sizeIdx = parts.findIndex((p) => /^(small|medium|large|xlarge|mini|thumb|thumbnail|original)$/i.test(p));
        for (const sz of sizes) {
          if (out.length >= maxVariants) break;
          const c = new URL(url.toString());
          const np = parts.slice();
          if (sizeIdx >= 0) np[sizeIdx] = sz;
          else {
            const pIdIdx = np.findIndex((p) => /^\d+$/.test(p) && /\/sync_mirakl\//i.test(url.pathname));
            if (pIdIdx >= 0 && np[pIdIdx + 1]) np.splice(pIdIdx + 1, 0, sz);
          }
          c.pathname = `/${np.join("/")}`;
          c.search = "";
          push(c.toString());
        }
      }
    } catch {}
  }
  return out;
}

function parseProductPageDeep(html: string, productUrl: string): ScrapedProduct | null {
  if (!html) return null;

  // 1. JSON-LD
  let ldName = "";
  let ldPrice = "";
  let ldImage: string[] = [];
  let ldCategory = "";
  let ldDescription = "";
  const ldRe = /<script[^>]+type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = ldRe.exec(html))) {
    try {
      const payload = JSON.parse(m[2]);
      const items = Array.isArray(payload) ? payload : payload["@graph"] ? payload["@graph"] : [payload];
      for (const it of items) {
        if (!it) continue;
        const type = Array.isArray(it["@type"]) ? it["@type"].join(",") : String(it["@type"] || "");
        if (!/product/i.test(type)) continue;
        if (!ldName && it.name) ldName = String(it.name);
        if (it.description) ldDescription = String(it.description);
        if (!ldCategory && it.category) ldCategory = String(it.category);
        if (!ldPrice && it.offers) {
          const off = Array.isArray(it.offers) ? it.offers[0] : it.offers;
          if (off?.price) {
            const pr = Number(off.price);
            if (Number.isFinite(pr) && pr > 0) ldPrice = `R$ ${pr.toFixed(2).replace(".", ",")}`;
          } else if (off?.priceCurrency && off?.priceSpecification) {
            const pr2 = Number(off.priceSpecification?.price);
            if (Number.isFinite(pr2) && pr2 > 0) ldPrice = `R$ ${pr2.toFixed(2).replace(".", ",")}`;
          }
        }
        if (!ldPrice && it.offers?.price) {
          const pr = Number(it.offers.price);
          if (Number.isFinite(pr) && pr > 0) ldPrice = `R$ ${pr.toFixed(2).replace(".", ",")}`;
        }
        if (ldImage.length === 0 && it.image) {
          const imgs = Array.isArray(it.image) ? it.image : typeof it.image === "string" ? [it.image] : [];
          ldImage = imgs.filter((x: any) => typeof x === "string" && /^https?:/i.test(x));
        }
      }
    } catch {}
  }

  // 2. Breadcrumb -> categoria hierarquica A > B > C
  let bread = ldCategory;
  const li = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g);
  if (li) {
    for (const tag of li) {
      try {
        const j = JSON.parse(tag.replace(/<script[^>]*>/, "").replace(/<\/script>/, ""));
        const arr = Array.isArray(j) ? j : j?.["@graph"] ? j["@graph"] : [j];
        for (const it of arr) {
          if (!it) continue;
          const t = Array.isArray(it["@type"]) ? it["@type"].join(",") : String(it["@type"] || "");
          if (!/BreadcrumbList/i.test(t)) continue;
          const items: any[] = it.itemListElement || [];
          const parts = items
            .map((x) => String(x?.item?.name || x?.name || "").trim())
            .filter((x) => x && x.toLowerCase() !== "kabum" && x.toLowerCase() !== "home" && x.toLowerCase() !== "início");
          if (parts.length >= 2) {
            bread = parts.join(" > ");
            break;
          }
        }
      } catch {}
    }
  }
  // Fallback do path URL se breadcrumb vazio
  if (!bread) {
    const pMatch = html.match(/window\.__NUXT__\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/i);
    const partsNo = productUrl.replace(/^https?:\/\/[^/]+\/+/i, "").split("/").filter(Boolean);
    if (!partsNo[0].startsWith("produto")) {
      bread = partsNo.slice(0, -1).map((p) => p.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ")).join(" > ");
    }
  }

  // 3. Nome (h1 / meta og:title)
  let name = ldName;
  if (!name) {
    const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1M) name = h1M[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  if (!name) {
    const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=(["'])([^"']+)\1/i) ||
                 html.match(/<meta[^>]+content=(["'])([^"']+)\1[^>]+property=["']og:title["']/i);
    if (og) name = og[2];
  }

  // 4. Preco
  let price = ldPrice;
  if (!price) {
    const pix = html.match(/(?:preço|preco|valor|pix)[^<]{0,20}R\$\s*([\d.,]+)/i) ||
                html.match(/R\$\s*([\d]{1,3}(?:\.\d{3})*\,\d{2})/) ||
                html.match(/(["']price["']\s*:\s*["']?)([\d.]+,?\d*)/i);
    if (pix) {
      const pr = String(pix[1] || pix[2]).replace(/[^\d,]/g, "").replace(",", ".");
      const n = Number(pr);
      if (Number.isFinite(n) && n > 0) price = `R$ ${n.toFixed(2).replace(".", ",")}`;
    }
  }
  if (!price) {
    const mm = html.match(/\b(\d{1,3}(?:\.\d{3})*,\d{2})\b/);
    if (mm) {
      const pr = mm[1].replace(/\./g, "").replace(",", ".");
      const n = Number(pr);
      if (Number.isFinite(n) && n > 1) price = `R$ ${n.toFixed(2).replace(".", ",")}`;
    }
  }

  // 5. Todas as imagens
  const images: Set<string> = new Set(ldImage.filter(Boolean));

  const imgRe = /<img[^>]+(?:src|data-src|data-original)=(["'])([^"']+)\1[^>]*>/gi;
  let mi: RegExpExecArray | null;
  while ((mi = imgRe.exec(html))) {
    let u = mi[2];
    if (!u) continue;
    if (!/^https?:/i.test(u) && u.startsWith("//")) u = "https:" + u;
    if (!/^https?:/i.test(u) && u.startsWith("/")) u = "https://www.kabum.com.br" + u;
    if (!/^https?:/i.test(u)) continue;
    if (!/\.(jpg|jpeg|png|webp|gif|svg|avif)/i.test(u) && !/image/i.test(u)) continue;
    if (/logo|banner|marca|brand|icon|avatar|logo_|logo-/i.test(u)) continue;
    if (/kabum\.com\.br\/(themes|conteudo|img\/(marca|logo))/i.test(u)) continue;
    images.add(u);
  }

  // 6. Sync Mirakl + classic patterns: normaliza para ORIGINAL / XLARGE
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const u of Array.from(images)) {
    let norm = u;
    if (/sync_mirakl/i.test(u)) norm = normalizeMiraklToXlarge(u);
    else norm = toKabumOriginalUrl(u);
    const k = norm.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(norm);
  }
  const enriched = enrichImageVariants(deduped, 10);

  if (!name || !price) return null;

  return {
    productUrl,
    name,
    price,
    category: bread || "",
    imageUrls: enriched,
    description: ldDescription || "",
  };
}

// ------------------------------------------------------------------
// EXTRAIR PAGINAÇÃO: total de paginas numa categoria
// ------------------------------------------------------------------
function extractTotalPagesFromCategory(html: string): number {
  // Regex busca: "Página X de Y", ou "page_number": Y, ou links com ?page=Y numerados
  const pageM = html.match(/(?:páginas|paginas|de)\s+(\d{1,4})[\s<"]/i);
  if (pageM) return Math.min(MAX_PAGES_PER_CAT, Number(pageM[1]) || 1);

  const pNumRe = /[\?&](?:page|page_number)=(\d+)/gi;
  let foundMax = 1;
  let pm: RegExpExecArray | null;
  while ((pm = pNumRe.exec(html))) {
    const n = Number(pm[1]);
    if (Number.isFinite(n) && n > foundMax) foundMax = n;
  }
  return Math.min(MAX_PAGES_PER_CAT, Math.max(1, foundMax));
}

// ------------------------------------------------------------------
// FLUXO PRINCIPAL
// ------------------------------------------------------------------
interface CategoryDef {
  urlPath: string;
  labelHierarchy: string;
}

async function main() {
  console.log(`\n⚙️  Config: WORKERS=${WORKERS}  MAX_PAGES_PER_CAT=${MAX_PAGES_PER_CAT}  OUTPUT=${OUTPUT}`);
  const catFilterSet = new Set(CATEGORIES_FILTER.map((s) => s.toLowerCase()));

  const cats: CategoryDef[] = CATEGORIES_SEED
    .filter((c) => catFilterSet.size === 0 || catFilterSet.has(c.path.toLowerCase()))
    .map((c) => ({ urlPath: `https://www.kabum.com.br/${c.path}`, labelHierarchy: c.label }));
  if (cats.length === 0) {
    console.error("Nenhuma categoria selecionada.");
    process.exit(1);
  }
  console.log(`📂 Categorias para crawl: ${cats.length}`);
  for (const c of cats) console.log(`   • ${c.labelHierarchy}  →  ${c.urlPath}`);

  // -------- PASSO 1: Listar paginas de categoria e extrair LINKS de PRODUTO (parcial)
  console.log(`\n🚀 PASSO 1/2: Extraindo links de produtos das páginas de categorias (WORKERS=${WORKERS})...`);
  const productSeeds = new Map<string, { url: string; fallbackCat: string; fallbackImage?: string; fallbackName?: string }>();

  const categoryPagesQueue: { url: string; fallbackCat: string; isFirst: boolean }[] = [];
  for (const c of cats) {
    categoryPagesQueue.push({ url: c.urlPath, fallbackCat: c.labelHierarchy, isFirst: true });
  }

  let cCrawled = 0;
  let cLinksFound = 0;

  await poolLimit(WORKERS, categoryPagesQueue, async (c) => {
    const res = await fetchText(c.url, { timeout: 15000, retries: 3 });
    if (!res.ok) return;

    const links = extractProductLinksFromCategoryPage(res.text);
    for (const l of links) {
      const id = l.url.match(/\/produto\/(\d+)/)?.[1];
      if (!id) continue;
      if (!productSeeds.has(id)) {
        productSeeds.set(id, { url: l.url, fallbackCat: c.fallbackCat, fallbackImage: l.image, fallbackName: l.name });
      }
    }

    if (c.isFirst) {
      const totalPages = extractTotalPagesFromCategory(res.text);
      const nextPages = Math.max(0, totalPages - 1);
      if (nextPages > 0) {
        for (let p = 2; p <= totalPages; p++) {
          const sep = c.url.includes("?") ? "&" : "?";
          const pageUrl = `${c.url}${sep}page_number=${p}`;
          categoryPagesQueue.push({ url: pageUrl, fallbackCat: c.fallbackCat, isFirst: false });
        }
      }
    }

    cCrawled++;
    if (links.length > 0) cLinksFound += links.length;
    if (cCrawled % 20 === 0) {
      console.log(`   paginas categoria crawleadas: ${cCrawled}/${categoryPagesQueue.length} • links unicos encontrados: ${productSeeds.size}`);
    }
  });

  // Páginas categoria adicionadas dinamicamente no isFirst — rodar pool 2a vez (se cresceu)
  while (cCrawled < categoryPagesQueue.length) {
    const remaining = categoryPagesQueue.slice(cCrawled);
    await poolLimit(WORKERS, remaining, async (c) => {
      const res = await fetchText(c.url, { timeout: 15000, retries: 2 });
      if (!res.ok) return;
      const links = extractProductLinksFromCategoryPage(res.text);
      for (const l of links) {
        const id = l.url.match(/\/produto\/(\d+)/)?.[1];
        if (!id) continue;
        if (!productSeeds.has(id)) {
          productSeeds.set(id, { url: l.url, fallbackCat: c.fallbackCat, fallbackImage: l.image, fallbackName: l.name });
        }
      }
      cCrawled++;
      if (cCrawled % 50 === 0) {
        console.log(`   paginas categoria: ${cCrawled}/${categoryPagesQueue.length} • links unicos: ${productSeeds.size}`);
      }
    });
  }

  console.log(`✅ PASSO 1 concluído. ${productSeeds.size} produtos únicos encontrados.`);
  if (productSeeds.size === 0) {
    console.error("Nenhum produto encontrado. Saindo.");
    process.exit(1);
  }

  // -------- PASSO 2: Crawlar PÁGINA DE CADA PRODUTO (deep scrape)
  console.log(`\n🚀 PASSO 2/2: Scrape detalhado de cada produto (WORKERS=${WORKERS})...`);
  const productsToDeepScrape = Array.from(productSeeds.values());
  const finalProducts: ScrapedProduct[] = [];
  let deepCount = 0;
  let deepOk = 0;
  let deepFallback = 0;

  await poolLimit(WORKERS, productsToDeepScrape, async (seed, i) => {
    const res = await fetchText(seed.url, { timeout: 15000, retries: 3 });
    if (res.ok) {
      const scraped = parseProductPageDeep(res.text, seed.url);
      if (scraped) {
        finalProducts.push(scraped);
        deepOk++;
      } else {
        // FALLBACK: ainda temos imagem/nome do partial + categoria do seed
        // Extrair preço do HTML parcial (mínimo)
        const mm = res.text.match(/R\$\s*([\d]{1,3}(?:\.\d{3})*\,\d{2})/);
        const price = mm ? `R$ ${mm[1]}` : "";
        if (price && seed.fallbackName) {
          finalProducts.push({
            productUrl: seed.url,
            name: seed.fallbackName,
            price,
            category: seed.fallbackCat,
            imageUrls: enrichImageVariants(seed.fallbackImage ? [seed.fallbackImage] : [], 8),
            description: "",
          });
          deepFallback++;
        }
      }
    } else if (seed.fallbackName && seed.fallbackImage) {
      // Deep falhou completamente, mas temos dados da listagem
      deepFallback++;
    }

    deepCount++;
    if (deepCount % 50 === 0) {
      console.log(`   ${deepCount}/${productsToDeepScrape.length} • ok=${deepOk} • fallback=${deepFallback} • arquivo terá ${finalProducts.length} linhas`);
    }
  });

  console.log(`✅ PASSO 2 concluído. ${finalProducts.length} produtos válidos p/ gravar.`);

  // -------- PASSO 3: Escrever TXT (linha = ProductURL TAB Img1 TAB Img2... TAB Name TAB Price TAB Cat)
  const outPath = path.resolve(process.cwd(), OUTPUT);
  let maxImgCols = 1;
  for (const p of finalProducts) if (p.imageUrls.length > maxImgCols) maxImgCols = Math.min(12, p.imageUrls.length);
  const HEADER = [
    "ProductURL",
    ...Array.from({ length: maxImgCols }, (_, i) => `ImageURL_${i + 1}`),
    "Nome",
    "Preço",
    "Categoria",
  ].join(TAB);

  const lines: string[] = [HEADER];
  for (const p of finalProducts) {
    const imgs = p.imageUrls.slice(0, maxImgCols);
    while (imgs.length < maxImgCols) imgs.push("");
    const line = [
      p.productUrl,
      ...imgs,
      safeForTsv(p.name),
      safeForTsv(p.price),
      safeForTsv(p.category || ""),
    ].join(TAB);
    lines.push(line);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join(EOL), "utf8");
  const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);

  console.log(`\n🎯 SUCESSO. Arquivo gravado em: ${outPath}`);
  console.log(`   ${lines.length - 1} produtos • ${maxImgCols} colunas de imagem • ${sizeKB} KB`);
  console.log(`\nComo importar no Balao.info:`);
  console.log(`   1. Acesse /admin/importacao`);
  console.log(`   2. Cole todo o conteúdo de ${path.basename(outPath)}`);
  console.log(`   3. Clique em Analisar Colunas → AutoGuessMapping vai reconhecer ProductURL/Imagens/Nome/Preço/Categoria automaticamente`);
  console.log(`   4. Ajuste se quiser → Aplicar e Prosseguir → Importar\n`);
}

main().catch((e) => {
  console.error("ERRO FATAL:", e);
  process.exit(1);
});

// Para nao cair em uso por tree-shaking em bundlers
export {};
