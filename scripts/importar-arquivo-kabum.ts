/*
 * SCRIPT: importar-arquivo-kabum.ts
 * Uso:  npx tsx scripts/importar-arquivo-kabum.ts <arquivo.txt> [--base-url http://localhost:3000] [--dry]
 *       [--ajuste 0]  [-c N] [--scrape]
 *
 * Faz: parse local do TXT (colunas TAB: URL_PROD | IMG | NOME | PRECO | CAT A>B>C)
 *      -> resolve hierarquia de categorias via POST /api/categories (cria as que faltarem)
 *      -> envia lotes de [chunkSize] produtos via POST /api/products
 *      (opcional) enriquece fotos via POST /api/scrape/product por product_url (--scrape)
 */
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CHUNK = Number(process.env.CHUNK || process.env.BATCH || 100);
const DRY = !!process.env.DRY;
const SCRAPE = !!process.env.SCRAPE;
const AJUSTE_PCT = Number(process.env.AJUSTE || 0) / 100; // 0.10 = +10%

// ---------------- parse local (mesma logica do utils.ts parseProducts) ----------------
function slugify(s: string | null | undefined): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "sem-nome";
}
function parsePriceToNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const cleaned = raw.replace(/R\$/gi, "").replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;
  let n = cleaned;
  if (commas === 1 && dots === 0) n = cleaned.replace(",", ".");
  else if (commas === 1 && dots >= 1) n = cleaned.replace(/\./g, "").replace(",", ".");
  else if (commas === 0 && dots >= 2) n = cleaned.replace(/\./g, "");
  const num = Number(n);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}
function formatPriceBRL(n: number): string {
  const v = Number(n.toFixed(2));
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function extractLeafAndChain(raw: string) {
  const chain = String(raw || "")
    .split(/\s*[>➤»]\s*/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const leaf = chain.length ? chain[chain.length - 1] : "";
  return { chain, leaf, leafSlug: slugify(chain.join(" ")) };
}
interface ParsedProd {
  name: string;
  priceRaw: string;
  priceNum: number;
  image: string;
  product_url?: string;
  categoryRaw: string;
  categoryLeafName: string;
  categoryLeafSlug: string;
  categoryChain: string[];
}
function parseTxtFile(filePath: string): ParsedProd[] {
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  let start = 0;
  if (lines[0]) {
    const temHeaderSuspeito =
      /flex|href|relative|src|text-sm|text-base|categoria/i.test(lines[0]) ||
      !/kabum\.com\.br\/produto\//i.test(lines[0]);
    if (temHeaderSuspeito) start = 1;
  }
  const out: ParsedProd[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 3) continue;
    let product_url = "";
    let image = "";
    let name = "";
    let price = "";
    let categoryRaw = "";
    if (parts.length >= 5) {
      product_url = parts[0].trim();
      image = parts[1].trim();
      name = parts[2].trim();
      price = parts[3].trim();
      categoryRaw = parts[4].trim();
    } else if (parts.length === 4) {
      const firstIsHttp = parts[0].trim().startsWith("http");
      const last = parts[3].trim();
      const lastIsPrice =
        /(?:R\$\s*)?\d[\d\.,]*/.test(last) && !/^[A-Za-zçÇáàâãéêíóôõúü]/.test(last);
      if (firstIsHttp && lastIsPrice) {
        product_url = parts[0].trim();
        image = parts[1].trim();
        name = parts[2].trim();
        price = parts[3].trim();
      } else if (firstIsHttp) {
        product_url = parts[0].trim();
        image = parts[1].trim();
        name = parts[2].trim();
        categoryRaw = parts[3].trim();
      } else {
        image = parts[0].trim();
        name = parts[1].trim();
        price = parts[2].trim();
        categoryRaw = parts[3].trim();
      }
    } else {
      if (parts[0].startsWith("http") && /jpg|jpeg|png|webp|gif/i.test(parts[0])) {
        image = parts[0].trim();
      } else if (parts[0].startsWith("http") && /\/produto\//i.test(parts[0])) {
        product_url = parts[0].trim();
      } else {
        image = parts[0].trim();
      }
      name = parts[1].trim();
      price = parts[2].trim();
    }
    if (!name || !price) continue;
    const { chain, leaf, leafSlug } = extractLeafAndChain(categoryRaw);
    const num = parsePriceToNumber(price);
    out.push({
      name,
      priceRaw: price,
      priceNum: num,
      image: image.startsWith("http") ? image : "",
      product_url: product_url.startsWith("http") ? product_url : undefined,
      categoryRaw,
      categoryLeafName: leaf || "Outros",
      categoryLeafSlug: leafSlug || "outros",
      categoryChain: chain.length ? chain : ["Outros"],
    });
  }
  return out;
}

// ---------------- API calls com error details ----------------
async function httpJson(method: string, url: string, body?: any): Promise<any> {
  const opt: RequestInit & { headers: Record<string, string> } = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opt.body = JSON.stringify(body);
  const res = await fetch(url, opt);
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      data?.error ||
      (data && typeof data === "object" && Object.keys(data).length === 0 && text
        ? `HTTP ${res.status} — Resposta não-JSON: ${text.slice(0, 240)}`
        : `HTTP ${res.status}`);
    throw new Error(msg);
  }
  return data;
}

async function getCategoriesBySlug(): Promise<Record<string, { id: string; slug: string; name: string; parent_id: string | null }>> {
  const list = await httpJson("GET", `${BASE_URL}/api/categories`);
  if (!Array.isArray(list)) return {};
  const out: Record<string, any> = {};
  for (const c of list) if (c?.slug) out[c.slug] = c;
  return out;
}

// Cria hierarquia: primeiro nivel 1, depois nivel 2,... tudo referenciando parent_slug
async function ensureCategories(allChains: string[][]): Promise<void> {
  console.log(`\n⏳ Garantindo categorias...`);
  const existingBySlug: Record<string, any> = {};
  if (!DRY) {
    const list = await httpJson("GET", `${BASE_URL}/api/categories`);
    if (Array.isArray(list)) for (const c of list) if (c?.slug) existingBySlug[c.slug] = c;
  }
  const uniqSlugs = new Set(Object.keys(existingBySlug));
  // Agrupa por profundidade
  const byDepth: Map<number, Set<string>> = new Map();
  for (const chain of allChains) {
    for (let i = 0; i < chain.length; i++) {
      const prefixChain = chain.slice(0, i + 1);
      const slug = slugify(prefixChain.join(" "));
      if (!uniqSlugs.has(slug)) {
        if (!byDepth.has(i)) byDepth.set(i, new Set());
        byDepth.get(i)!.add(JSON.stringify({ name: prefixChain[prefixChain.length - 1], chain: prefixChain }));
      }
    }
  }
  if (byDepth.size === 0) {
    console.log(`   ✓ Todas as categorias já existem (${uniqSlugs.size} no DB)`);
    return;
  }
  const depths = [...byDepth.keys()].sort((a, b) => a - b);
  let totalCriar = 0;
  depths.forEach((d) => (totalCriar += byDepth.get(d)!.size));
  console.log(`   🔹 ${totalCriar} categorias novas para criar em ${depths.length} níveis`);
  for (const depth of depths) {
    const items = [...(byDepth.get(depth) || [])].map((s) => JSON.parse(s));
    console.log(`   └─ Nível ${depth + 1}: ${items.length} categorias`);
    for (const it of items) {
      const prefix = it.chain as string[];
      const name = it.name;
      const slug = slugify(prefix.join(" "));
      const parentSlug = prefix.length > 1 ? slugify(prefix.slice(0, -1).join(" ")) : null;
      const payload: any = { name, slug };
      if (parentSlug) payload.parent_slug = parentSlug;
      try {
        if (DRY) {
          // console.log(`      [DRY] POST /api/categories -> ${prefix.join(" > ")} (parent=${parentSlug ?? "RAIZ"})`);
        } else {
          await httpJson("POST", `${BASE_URL}/api/categories`, payload);
        }
        uniqSlugs.add(slug);
      } catch (e: any) {
        const warnMsg = e?.message ? String(e.message).slice(0, 200) : String(e);
        console.warn(`      ⚠️  ${prefix.join(" > ")} : ${warnMsg}`);
      }
    }
  }
  console.log(`   ✓ Categorias prontas`);
}

async function scrapeExtraImages(product_url: string, baseImgs: string[]): Promise<string[]> {
  try {
    const res = await httpJson("POST", `${BASE_URL}/api/scrape/product`, { url: product_url });
    const scraped: string[] = Array.isArray(res?.images) ? res.images : [];
    const merged = [...baseImgs];
    for (const s of scraped) if (s && !merged.includes(s)) merged.push(s);
    return merged;
  } catch {
    return baseImgs;
  }
}

async function main() {
  const args = process.argv.slice(2).filter((a) => !/^-/.test(a) || /\.txt$/i.test(a));
  const opts = process.argv.slice(2).filter((a) => /^-/.test(a));
  let file = args[0];
  for (const o of opts) {
    if (o === "--dry") (globalThis as any).__dry = true;
    if (o === "--scrape") (globalThis as any).__scrape = true;
  }
  const dryRun = DRY || !!(globalThis as any).__dry;
  const scrape = SCRAPE || !!(globalThis as any).__scrape;
  if (!file) {
    file = path.join(process.cwd(), "..", "kabum_scrape_result.txt");
  }
  if (!fs.existsSync(file)) {
    console.error(`❌ Arquivo não encontrado: ${file}`);
    console.error(`   Uso: npx tsx scripts/importar-arquivo-kabum.ts ./caminho/para/arquivo.txt [--scrape] [--dry]`);
    process.exit(1);
  }
  console.log(`\n📄 Arquivo: ${file}`);
  console.log(`🌐 API    : ${BASE_URL}`);
  console.log(`🧩 Chunk  : ${CHUNK}`);
  console.log(`💰 Ajuste : ${(AJUSTE_PCT * 100).toFixed(0)}%`);
  console.log(`📸 Scrape : ${scrape ? "SIM (enriquecer fotos por produto)" : "não"}`);
  console.log(`🧪 Dry    : ${dryRun ? "SIM (não envia para a API)" : "não"}`);

  const parsed = parseTxtFile(file);
  if (parsed.length === 0) {
    console.error(`❌ Nenhum item foi parseado do arquivo. Verifique separadores TAB.`);
    process.exit(2);
  }
  console.log(`\n✅ Parseados: ${parsed.length} itens`);
  const sample = parsed.slice(0, 3);
  sample.forEach((p, i) => {
    console.log(
      `   [${i + 1}] Nome=${p.name.slice(0, 50).padEnd(50)} Preço=${String(p.priceRaw).padEnd(12)} Cat=${p.categoryChain.join(" > ") || "Outros"}`
    );
  });

  const allChains = parsed.map((p) => p.categoryChain).filter((c) => c.length > 0);
  await ensureCategories(allChains);

  // Prepara payloads
  const payloads: any[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i];
    const id =
      typeof crypto !== "undefined" && (crypto as any)?.randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2, 15) + "-" + i;
    const slug = `${slugify(p.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const precoAjustado = p.priceNum * (1 + AJUSTE_PCT);
    const imgs = p.image ? [p.image] : [];
    payloads.push({
      id,
      name: p.name,
      price: formatPriceBRL(precoAjustado),
      image: imgs[0] || "",
      image_urls: imgs,
      product_url: p.product_url || null,
      category: p.categoryLeafSlug || "outros",
      slug,
      _idx: i,
    });
  }

  // (opcional) Scrape fotos
  if (scrape) {
    console.log(`\n📸 Enriquecendo imagens via scrape de product_url...`);
    const workerLimit = 20;
    let done = 0;
    let cursor = 0;
    const runWorker = async () => {
      while (cursor < payloads.length) {
        const i = cursor++;
        const p = payloads[i];
        const pu = parsed[i]?.product_url;
        if (pu) {
          const novas = await scrapeExtraImages(pu, p.image_urls || []);
          p.image_urls = novas;
          p.image = novas[0] || p.image || "";
        }
        done++;
        if (done % 25 === 0) console.log(`   Progresso: ${done}/${payloads.length}`);
      }
    };
    await Promise.all(Array.from({ length: workerLimit }, () => runWorker()));
    const totalFotos = payloads.reduce((s, p) => s + (p.image_urls?.length || 0), 0);
    console.log(`   ✓ Média de ${(totalFotos / payloads.length).toFixed(1)} fotos/produto (total ${totalFotos})`);
  }

  // Envia em lotes
  console.log(`\n💾 Salvando produtos em lotes de ${CHUNK}...`);
  let salvos = 0;
  for (let i = 0; i < payloads.length; i += CHUNK) {
    const lote = payloads.slice(i, i + CHUNK).map((p) => {
      const o: any = { ...p };
      delete o._idx;
      return o;
    });
    try {
      if (dryRun) {
        console.log(`   [DRY] Lote ${Math.floor(i / CHUNK) + 1}: ${lote.length} itens — não enviado.`);
      } else {
        const res = await httpJson("POST", `${BASE_URL}/api/products`, { products: lote });
        salvos += lote.length;
        console.log(
          `   ✔ Lote ${Math.floor(i / CHUNK) + 1}: ${lote.length} ok (${salvos}/${payloads.length}) ${
            res?.count ? `— confirmados ${res.count}` : ""
          }`
        );
      }
    } catch (e: any) {
      console.error(`   ❌ Lote ${Math.floor(i / CHUNK) + 1}: ${e?.message || String(e)}`);
      // Se erro no lote grande, tenta 1-a-1 p/ não perder os bons
      if (lote.length > 1) {
        console.log(`      → Retentando 1-a-1...`);
        for (const single of lote) {
          try {
            if (dryRun) {
              salvos++;
            } else {
              await httpJson("POST", `${BASE_URL}/api/products`, { products: [single] });
              salvos++;
            }
          } catch (e2: any) {
            console.error(
              `         ❌ ${single?.name?.slice(0, 40)}: ${e2?.message || String(e2)}`
            );
          }
        }
        console.log(`      → Resultado do lote após retry individual: ${salvos} salvos até agora`);
      }
    }
  }

  console.log(`\n🎉 CONCLUÍDO. ${salvos}/${payloads.length} produtos salvos.`);
}

main().catch((err) => {
  console.error(`\n💥 Fatal:`, err);
  process.exit(99);
});
