/* eslint-disable */
/**
 * SCRIPT DE IMPORTAÇÃO EM MASSA - Balao.info
 * Lê arquivo kabum_scrape_result.txt (formato 5-col TAB: URL|IMG|Nome|Preço|Categoria)
 * e importa TODOS os produtos via:
 *   - POST /api/categories  => cria categorias novas (em ordem hierárquica)
 *   - POST /api/products    => cria produtos em BATCH de 500
 *
 * MODO DE USO:
 *   1. Abra 1 terminal e RODE O SERVIDOR NEXT:
 *        cd balao2026 ; npm run dev
 *      (vai subir em http://localhost:3000)
 *
 *   2. Em OUTRO terminal, rode ESTE script:
 *        cd balao2026
 *        npx tsx scripts/importar-arquivo-kabum.ts \
 *             --arquivo "C:\\Users\\user\\Desktop\\repositorios github pra ia\\kabum_scrape_result.txt" \
 *             --servidor http://localhost:3000 \
 *             --batch 500 \
 *             --workers 50
 *
 *   Flags opcionais:
 *        --apenas-criar-categorias  (nao importa produtos, so cria arvore de categorias)
 *        --simular                  (dry-run, so mostra o que faria, sem POST)
 *        --limite N                 (importa so N primeiros produtos, p/ teste)
 */
import * as fs from "node:fs";
import * as path from "node:path";

// ------------------------------------------------------------------
// CONFIG (override via CLI)
// ------------------------------------------------------------------
interface CliConfig {
  arquivo: string;
  servidor: string;
  batch: number;
  workers: number;
  apenasCriarCategorias: boolean;
  simular: boolean;
  limite: number | null;
}
function parseArgs(argv: string[]): CliConfig {
  const cfg: CliConfig = {
    arquivo: "C:\\Users\\user\\Desktop\\repositorios github pra ia\\kabum_scrape_result.txt",
    servidor: "http://localhost:3000",
    batch: 500,
    workers: 50,
    apenasCriarCategorias: false,
    simular: false,
    limite: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--arquivo":
        cfg.arquivo = argv[++i];
        break;
      case "--servidor":
        cfg.servidor = argv[++i].replace(/\/$/, "");
        break;
      case "--batch":
        cfg.batch = Math.max(1, Number(argv[++i]) || 500);
        break;
      case "--workers":
        cfg.workers = Math.max(1, Number(argv[++i]) || 50);
        break;
      case "--apenas-criar-categorias":
        cfg.apenasCriarCategorias = true;
        break;
      case "--simular":
        cfg.simular = true;
        break;
      case "--limite":
        cfg.limite = Math.max(1, Number(argv[++i]) || 0);
        break;
    }
  }
  return cfg;
}

const CFG = parseArgs(process.argv.slice(2));

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
const NOW_MS = Date.now();
function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}
function elapsedSecs(): string {
  return ((Date.now() - NOW_MS) / 1000).toFixed(1);
}
function normalizeStr(s: string): string {
  return (s || "")
    .replace(/\r?\n/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function slugify(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "sem-nome";
}
function parsePriceBR(s: string): number {
  if (!s) return 0;
  const raw = String(s).replace(/[^0-9,\.]/g, "");
  const dots = (raw.match(/\./g) || []).length;
  const commas = (raw.match(/,/g) || []).length;
  let clean = raw;
  if (commas === 1 && dots === 0) {
    clean = raw.replace(",", ".");
  } else if (commas === 1 && dots >= 1) {
    clean = raw.replace(/\./g, "").replace(",", ".");
  } else if (commas === 0 && dots >= 2) {
    clean = raw.replace(/\./g, "");
  }
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}
// poolLimit
async function poolLimit<T, R>(concurrency: number, items: T[], worker: (it: T, i: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await worker(items[i], i);
      } catch (e) {
        results[i] = null as any;
      }
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

async function apiJson(method: "GET" | "POST", urlPath: string, body: any): Promise<{ ok: boolean; status: number; data: any; err?: string }> {
  const url = CFG.servidor + urlPath;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 2 * 60 * 1000);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal as any,
    } as any);
    clearTimeout(t);
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    return { ok: res.ok, status: res.status, data };
  } catch (e: any) {
    return { ok: false, status: 0, data: null, err: String(e?.message || e) };
  }
}

// ------------------------------------------------------------------
// LEITURA DO ARQUIVO
// ------------------------------------------------------------------
interface RawRow {
  productUrl: string;
  image: string;
  name: string;
  priceRaw: string;
  price: number;
  categoryRaw: string;
  categoryChain: string[];
  line: number;
}

function readArquivo(): { header: string[]; rows: RawRow[] } {
  const absArq = path.resolve(CFG.arquivo);
  console.log(`\n📂 Lendo arquivo: ${absArq}`);
  if (!fs.existsSync(absArq)) {
    console.error(`❌ Arquivo NÃO EXISTE: ${absArq}`);
    process.exit(1);
  }
  const conteudo = fs.readFileSync(absArq, "utf8").replace(/^\uFEFF/, "");
  const todasLinhas = conteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  console.log(`   Linhas válidas lidas: ${fmt(todasLinhas.length)}`);

  const primeira = todasLinhas[0] || "";
  const primeiraTemHeaderSuspeito =
    /flex|href|relative|src|text-sm|text-base|categoria/i.test(primeira) ||
    !primeira.includes("kabum.com.br/produto/");
  const comecaEm = primeiraTemHeaderSuspeito ? 1 : 0;
  if (primeiraTemHeaderSuspeito) {
    console.log(`   Linha 1 não é produto (provavelmente header scraper). Vamos começar na linha 2.`);
  }

  let skipVazios = 0;
  let skipSemPreco = 0;
  let skipSemNome = 0;
  const rows: RawRow[] = [];
  for (let i = comecaEm; i < todasLinhas.length; i++) {
    if (CFG.limite != null && rows.length >= CFG.limite) break;
    const raw = todasLinhas[i];
    const cells = raw.split("\t");
    if (cells.length < 5) {
      // Tentar split por 4+ espaços ou 2+ espaços (fallback colado)
      if (cells.length === 1 && raw.includes("  ")) {
        // improvável mas tentamos
        const re = /^(\S+)\s{2,}(\S+)\s{2,}(.+?)\s{2,}([\d.,]+)\s{2,}(.+)$/;
        const m = raw.match(re);
        if (m) cells.splice(0, cells.length, m[1], m[2], m[3], m[4], m[5]);
      }
    }
    if (cells.length < 5) {
      skipVazios++;
      continue;
    }
    const [prodUrl, image, nome, preco, cat] = cells;
    const n = normalizeStr(nome);
    const pr = parsePriceBR(preco);
    if (!n || n.length < 2) {
      skipSemNome++;
      continue;
    }
    if (!(pr > 0)) {
      skipSemPreco++;
      continue;
    }
    const chain = (cat || "")
      .split(/\s*[>➤»]\s*/g)
      .map((x) => normalizeStr(x))
      .filter(Boolean);
    rows.push({
      productUrl: normalizeStr(prodUrl),
      image: normalizeStr(image),
      name: n,
      priceRaw: normalizeStr(preco),
      price: pr,
      categoryRaw: normalizeStr(cat),
      categoryChain: chain,
      line: i + 1,
    });
  }
  console.log(`   Produtos válidos: ${fmt(rows.length)}`);
  if (skipVazios) console.log(`   Linhas sem colunas suficientes (skip): ${fmt(skipVazios)}`);
  if (skipSemNome) console.log(`   Linhas sem nome (skip): ${fmt(skipSemNome)}`);
  if (skipSemPreco) console.log(`   Linhas com preço 0 (skip): ${fmt(skipSemPreco)}`);
  return { header: [], rows };
}

// ------------------------------------------------------------------
// CATEGORIAS: construir hierarquia, enviar POST /api/categories
// ------------------------------------------------------------------
interface CatRow {
  name: string;
  parentSlug: string | null;
  fullChain: string[];
  slug: string;
  depth: number;
}

function buildCategoryPlan(rows: RawRow[]): {
  cats: CatRow[];
  byFullPath: Map<string, CatRow>;
} {
  const set = new Map<string, CatRow>();
  for (const r of rows) {
    const chain = r.categoryChain;
    for (let d = 0; d < chain.length; d++) {
      const subChain = chain.slice(0, d + 1);
      const key = subChain.join(" > ");
      if (set.has(key)) continue;
      const name = subChain[d];
      const parentSlug = d === 0 ? null : slugify(subChain.slice(0, d).join(" "));
      const slug = slugify(subChain.join(" "));
      set.set(key, {
        name,
        parentSlug,
        fullChain: subChain,
        slug,
        depth: d,
      });
    }
  }
  const cats = Array.from(set.values()).sort((a, b) => a.depth - b.depth || a.name.localeCompare(b.name));
  console.log(`\n📁 Total de categorias únicas: ${fmt(cats.length)}`);
  const byDepth = cats.reduce<Record<number, number>>((acc, c) => {
    acc[c.depth] = (acc[c.depth] || 0) + 1;
    return acc;
  }, {});
  Object.entries(byDepth)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([depth, qtd]) => console.log(`   Nível ${Number(depth) + 1} (depth ${depth}): ${fmt(qtd)} categorias`));
  return { cats, byFullPath: set };
}

async function ensureCategories(cats: CatRow[]): Promise<{
  sucessos: number;
  erros: number;
  jaExistiam: number;
}> {
  console.log(`\n🏷️  Criando categorias (workers=${CFG.workers})...`);
  let sucessos = 0, erros = 0, jaExistiam = 0;
  // Processar por depth para que pai exista antes do filho.
  const maxDepth = Math.max(...cats.map((c) => c.depth), 0);
  for (let d = 0; d <= maxDepth; d++) {
    const group = cats.filter((c) => c.depth === d);
    if (group.length === 0) continue;
    console.log(`   Depth ${d}: ${fmt(group.length)} categorias...`);
    await poolLimit(CFG.workers, group, async (c) => {
      if (CFG.simular) {
        sucessos++;
        return;
      }
      const payload: any = { name: c.name, slug: c.slug };
      if (c.parentSlug) payload.parentSlug = c.parentSlug;
      const r = await apiJson("POST", "/api/categories", payload);
      if (r.ok) sucessos++;
      else if (r.status === 409 || /already|exist|duplicate|slug/i.test(String(r.data || r.err || ""))) jaExistiam++;
      else erros++;
    });
    console.log(`      ok=${fmt(sucessos)}  ja-existiam=${fmt(jaExistiam)}  erros=${fmt(erros)}   t+${elapsedSecs()}s`);
  }
  return { sucessos, erros, jaExistiam };
}

// ------------------------------------------------------------------
// PRODUTOS: gerar payload e enviar em lotes via POST /api/products
// ------------------------------------------------------------------
function buildProductPayloads(rows: RawRow[], byFullPath: Map<string, CatRow>): any[] {
  const failsCat = new Set<string>();
  const payloads: any[] = rows.map((r) => {
    const leafChain = r.categoryChain;
    let slugCategory = "";
    for (let d = leafChain.length; d > 0; d--) {
      const k = leafChain.slice(0, d).join(" > ");
      if (byFullPath.has(k)) {
        slugCategory = byFullPath.get(k)!.slug;
        break;
      }
    }
    if (!slugCategory) failsCat.add(r.categoryRaw);
    // Normalizar imagem para ORIGINAL/XLARGE se for Kabum sync_mirakl
    let img = r.image;
    if (img && /sync_mirakl/i.test(img)) {
      img = img
        .replace(/\/(mini|thumb|thumbnail|small|medium|large|original)\//i, "/xlarge/")
        .replace(/_(small|medium|large|original)\.(jpg|jpeg|png|webp)$/i, ".$2");
    }
    const images = img ? [img] : [];
    return {
      name: r.name,
      slug: slugify(r.name) + "-" + Math.random().toString(36).slice(2, 7),
      price: Number(r.price.toFixed(2)),
      costPrice: Number((r.price * 0.6).toFixed(2)), // default 40% margem
      categorySlug: slugCategory || "outros",
      description: `${r.name}\n\nOrigem: Kabum\nProduto: ${r.productUrl}\nCategoria: ${r.categoryRaw || "Outros"}`,
      images,
      stock: 10,
      sourceUrl: r.productUrl,
      published: true,
    };
  });
  console.log(`\n🛒 Produtos prontos p/ enviar: ${fmt(payloads.length)}  (${fmt(failsCat.size)} categorias não localizadas, fallback para 'outros')`);
  return payloads;
}

async function importProducts(payloads: any[]): Promise<{
  sucessos: number;
  erros: number;
  errosLog: string[];
}> {
  if (CFG.apenasCriarCategorias) return { sucessos: 0, erros: 0, errosLog: [] };
  console.log(`\n🚚 Importando produtos (batch=${CFG.batch})...`);
  let sucessos = 0;
  let erros = 0;
  const errosLog: string[] = [];
  // Criar lotes
  const lotes: any[][] = [];
  for (let i = 0; i < payloads.length; i += CFG.batch) {
    lotes.push(payloads.slice(i, i + CFG.batch));
  }
  console.log(`   ${fmt(lotes.length)} lotes, cada um com até ${fmt(CFG.batch)} produtos.`);

  let iLote = 0;
  await poolLimit(Math.min(CFG.workers, Math.ceil(lotes.length / 4)), lotes, async (lote, idx) => {
    if (CFG.simular) {
      iLote++;
      if (iLote % 5 === 0) console.log(`   [SIMUL] lote ${iLote}/${fmt(lotes.length)}  t+${elapsedSecs()}s`);
      sucessos += lote.length;
      return;
    }
    const inicio = idx * CFG.batch + 1;
    const r = await apiJson("POST", "/api/products", { products: lote, returnIds: true });
    if (r.ok) {
      let count = lote.length;
      if (typeof r.data?.created === "number") count = r.data.created;
      if (Array.isArray(r.data?.ids)) count = r.data.ids.length;
      sucessos += count;
      if (r.data?.errors?.length) {
        erros += r.data.errors.length;
        for (let k = 0; k < Math.min(3, r.data.errors.length); k++) {
          errosLog.push(`lote#${idx + 1} err[${k}]: ${JSON.stringify(r.data.errors[k]).slice(0, 200)}`);
        }
      }
    } else {
      erros += lote.length;
      errosLog.push(
        `lote#${idx + 1} (itens ${inicio}-${inicio + lote.length - 1}) HTTP ${r.status}  ${(String(r.err || "") + JSON.stringify(r.data || {})).slice(0, 240)}`
      );
    }
    iLote++;
    if (iLote % 5 === 0 || idx === lotes.length - 1) {
      const pct = ((idx + 1) / lotes.length) * 100;
      console.log(
        `   progresso: ${idx + 1}/${fmt(lotes.length)} (${pct.toFixed(1)}%)  ok=${fmt(sucessos)}  erros=${fmt(erros)}   t+${elapsedSecs()}s`
      );
    }
  });
  return { sucessos, erros, errosLog: errosLog.slice(0, 50) };
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------
async function main() {
  console.log(
    `\n╔══════════════════════════════════════════════════════════════╗\n` +
      `║   IMPORTAÇÃO EM MASSA - Kabum → Balao.info                   ║\n` +
      `║   Servidor: ${CFG.servidor.padEnd(45)}║\n` +
      `║   Arquivo : ${path.basename(CFG.arquivo).padEnd(45)}║\n` +
      `║   Batch   : ${String(CFG.batch).padEnd(3)}  Workers: ${String(CFG.workers).padEnd(3)}  ${CFG.simular ? "[SIMULAÇÃO] ".padEnd(15) : "                "}║\n` +
      `╚══════════════════════════════════════════════════════════════╝`
  );

  // 0) Testa servidor
  console.log(`\n🔌 Testando conexão com servidor Next (${CFG.servidor})...`);
  const probe = await apiJson("GET", "/api/categories", null);
  if (!probe.ok && !CFG.simular) {
    console.error(
      `❌ SERVIDOR NÃO RESPONDEU em ${CFG.servidor}/api/categories\n` +
        `   Verifique se rodou "npm run dev" em outro terminal.\n` +
        `   Ou se quiser simular: adicione a flag --simular`
    );
    process.exit(2);
  }
  console.log(`   Servidor OK (status ${probe.status}).`);

  // 1) Lê arquivo
  const { rows } = readArquivo();
  if (rows.length === 0) {
    console.error("❌ Nenhum produto válido no arquivo. Saindo.");
    process.exit(3);
  }

  // 2) Plano de categorias
  const { cats, byFullPath } = buildCategoryPlan(rows);
  const rCat = await ensureCategories(cats);

  if (CFG.apenasCriarCategorias) {
    console.log(`\n🏁 Flag --apenas-criar-categorias ativa. Encerrando.`);
    finalReport(0, 0, 0, rCat);
    return;
  }

  // 3) Montar payloads + enviar produtos
  const payloads = buildProductPayloads(rows, byFullPath);
  const rProd = await importProducts(payloads);

  finalReport(rProd.sucessos, rProd.erros, 0, rCat);
  if (rProd.errosLog.length > 0) {
    console.log(`\n📋 Últimos erros (até 50):`);
    for (const e of rProd.errosLog) console.log(`   • ${e}`);
  }
}

function finalReport(
  produtosOk: number,
  produtosErro: number,
  _: number,
  rCat: { sucessos: number; erros: number; jaExistiam: number }
) {
  console.log(
    `\n╔══════════════════════════════════════════════════════════════╗\n` +
      `║   RELATÓRIO FINAL (t=${elapsedSecs()}s)                       ║\n` +
      `╠══════════════════════════════════════════════════════════════╣\n` +
      `║  CATEGORIAS:                                                  ║\n` +
      `║    criadas ok  : ${String(rCat.sucessos).padStart(10)}                                     ║\n` +
      `║    já existiam : ${String(rCat.jaExistiam).padStart(10)}                                     ║\n` +
      `║    erros       : ${String(rCat.erros).padStart(10)}                                     ║\n` +
      `╠══════════════════════════════════════════════════════════════╣\n` +
      `║  PRODUTOS:                                                    ║\n` +
      `║    importados  : ${String(produtosOk).padStart(10)}                                     ║\n` +
      `║    erros       : ${String(produtosErro).padStart(10)}                                     ║\n` +
      `╚══════════════════════════════════════════════════════════════╝`
  );
}

main().catch((e) => {
  console.error("ERRO FATAL:", e);
  process.exit(1);
});

export {};
