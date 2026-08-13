"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { parseProducts, Product, Category, buildCategoryTree, CATEGORIES, parsePriceToNumber, extractRawColumns, autoGuessMapping, buildProductsByMapping, ColumnMapping, ColumnRole, ExtractedRaw } from "@/lib/utils";
import { Upload, CheckCircle, AlertCircle, Search, Save, X, Zap, Settings, TrendingUp, Database, Clock, Layers, ChevronRight } from "lucide-react";

const PRICE_FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const BRAND_REGEXES: RegExp[] = [
  /\bconnect\s*barra\s*inform[aá]tica\b/gi,
  /\bkalango[-\s]*games\b/gi,
  /\b3green[-\s]*force\b/gi,
  /\b3green\b/gi,
  /\bklv[-\s]*notebook\b/gi,
  /\bskill\b/gi,
  /\bnext[-\s]*pc\b/gi,
  /\bnextpc\b/gi,
  /\bmax[-\s]*elite\b/gi,
  /\bdream[-\s]*computers?\b/gi,
  /\bdreamcomputers\b/gi,
  /\binfotech\b/gi,
  /\bprime[-\s]*shock!?\b/gi,
  /\bmulti[-\s]*pc\b/gi,
  /\bmultipc\b/gi,
  /\bneologic\b/gi,
  /\bi[-\s]*buy[-\s]*power\b/gi,
  /\bibuypower\b/gi,
  /\balpha[-\s]*pcs?\b/gi,
  /\balphapcs\b/gi,
  /\bstudio[-\s]*pc\b/gi,
  /\bstudiopc\b/gi,
  /\btop[-\s]*pc\b/gi,
  /\btoppc\b/gi,
  /kabum/gi,
  /\btob\s*pc[’'´`]?s\b/gi,
  /tob/gi,
  /alligator shop/gi,
  /mrp inform[aá]tica/gi
];

const normalizeStr = (s: unknown): string =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .trim();

const slugifyStr = (s: string): string =>
  normalizeStr(s)
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);

const chunk = <T,>(arr: T[], size: number): T[][] => {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const poolLimit = async <T,>(
  maxConcurrent: number,
  items: T[],
  worker: (item: T, idx: number) => Promise<void>,
  onProgress?: (done: number, total: number) => void
): Promise<void> => {
  const total = items.length;
  if (total === 0) return;
  let running = 0;
  let done = 0;
  let cursor = 0;
  return new Promise<void>((resolve) => {
    const tick = () => {
      while (running < maxConcurrent && cursor < total) {
        const idx = cursor++;
        running++;
        Promise.resolve()
          .then(() => worker(items[idx], idx))
          .catch(() => {})
          .finally(() => {
            running--;
            done++;
            if (onProgress) onProgress(done, total);
            tick();
          });
      }
      if (done >= total) resolve();
    };
    tick();
  });
};

const validateImageFast = (url: string, timeoutMs = 3500): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(false);
    }, timeoutMs);
    try {
      const img = new window.Image();
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.loading = "eager";
      img.onload = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        resolve(w >= 500 || h >= 500 || (w >= 300 && h >= 300));
      };
      img.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(false);
      };
      img.src = url;
    } catch {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(false);
    }
  });
};

const optimizeUrlFast = (url: string): string => {
  let enhanced = url;
  try {
    const urlObj = new URL(enhanced);
    const paramsToDelete = ['w', 'width', 'h', 'height', 'quality', 'q', 'resize', 'size'];
    paramsToDelete.forEach(param => urlObj.searchParams.delete(param));
    enhanced = urlObj.toString();
  } catch {}
  if (enhanced.includes('kabum.com.br')) enhanced = enhanced.replace(/_(m|p|peq)\./g, '_g.');
  if (enhanced.includes('terabyteshop.com.br')) enhanced = enhanced.replace(/(_t|_small)\./g, '_g.');
  if (enhanced.includes('amazon.com') || enhanced.includes('media-amazon.com')) enhanced = enhanced.replace(/\._[S|A][X|C|S]\d+_|\._[S|A][X|C|S]_/g, '');
  if (enhanced.includes('mercadolivre.com') || enhanced.includes('mlstatic.com')) {
    enhanced = enhanced.replace(/-(O|I|T)\./g, '-F.').replace(/-thumb\./g, '-F.');
  }
  enhanced = enhanced.replace(/[-_](thumb|small|mini|tiny|icon)\./gi, '.');
  enhanced = enhanced.replace(/[-_]\d+x\d+\./g, '.');
  return enhanced;
};

const toKabumOriginalUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const p = u.pathname;
    let nextPath = p.replace(/_(m|p|peq|g)\.jpg$/i, "_original.jpg");
    if (nextPath === p && /\.jpg$/i.test(p) && !/_original\.jpg$/i.test(p)) {
      nextPath = p.replace(/\.jpg$/i, "_original.jpg");
    }
    u.pathname = nextPath;
    u.search = "";
    return u.toString();
  } catch {
    let next = url.replace(/_(m|p|peq|g)\.jpg$/i, "_original.jpg");
    if (next === url && /\.jpg$/i.test(url) && !/_original\.jpg$/i.test(url)) {
      next = url.replace(/\.jpg$/i, "_original.jpg");
    }
    return next;
  }
};

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [text, setText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "mapping" | "preview">("input");

  const [selectedCategory, setSelectedCategory] = useState("Hardware");
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [adjustmentScope, setAdjustmentScope] = useState<"all" | "high_value" | "low_value">("all");
  const [scopeThreshold, setScopeThreshold] = useState<number>(1000);
  const [migrateImages, setMigrateImages] = useState(false);

  const [concurrencyMode, setConcurrencyMode] = useState<"turbo" | "balanced" | "light">("turbo");
  const [skipImageValidation, setSkipImageValidation] = useState(false);
  const [skipAiAndScrape, setSkipAiAndScrape] = useState(false);
  const [saveChunkSize, setSaveChunkSize] = useState<number>(500);

  const [rawColumns, setRawColumns] = useState<ExtractedRaw | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [progressPct, setProgressPct] = useState<number | null>(null);

  const abortRef = useRef<{ canceled: boolean }>({ canceled: false });
  const previewPageSize = 500;
  const [previewPage, setPreviewPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    return () => { abortRef.current.canceled = true; };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) setCategories(await res.json());
    } catch {}
  };

  const concurrencyConfig = useMemo(() => {
    switch (concurrencyMode) {
      case "turbo":
        return { ai: 24, img: 80, save: 8 };
      case "light":
        return { ai: 4, img: 12, save: 2 };
      case "balanced":
      default:
        return { ai: 12, img: 40, save: 4 };
    }
  }, [concurrencyMode]);

  const concurrencyMeta = useMemo(() => {
    switch (concurrencyMode) {
      case "turbo": return { label: "TURBO (até 30 mil itens)", icon: "🚀", cls: "bg-red-50 text-red-800 border-red-300", desc: "IA:24 • IMG:80 • SAVE:8" };
      case "light": return { label: "ECONÔMICO", icon: "🌱", cls: "bg-green-50 text-green-800 border-green-300", desc: "IA:4 • IMG:12 • SAVE:2" };
      case "balanced": return { label: "BALANCEADO", icon: "⚖️", cls: "bg-blue-50 text-blue-800 border-blue-300", desc: "IA:12 • IMG:40 • SAVE:4" };
    }
  }, [concurrencyMode]);

  const previewProducts = useMemo(() => {
    const scopedThresh = typeof scopeThreshold === "number" ? scopeThreshold : 1000;
    const defaultCat = selectedCategory;
    const scope = adjustmentScope;
    const pct = priceAdjustment / 100;
    return parsedProducts.map((p) => {
      const priceNum = parsePriceToNumber(p.price);
      const apply =
        scope === "all" ? true :
        scope === "high_value" ? priceNum >= scopedThresh :
        priceNum < scopedThresh;
      const newNum = apply ? priceNum * (1 + pct) : priceNum;
      const newPriceFormatted = PRICE_FMT.format(newNum);
      const finalCategory = (p.category && p.category.trim()) || defaultCat;
      return {
        ...p,
        category: finalCategory,
        originalPrice: p.price,
        newPrice: newPriceFormatted,
        priceChange: newNum - priceNum
      };
    });
  }, [parsedProducts, selectedCategory, priceAdjustment, adjustmentScope, scopeThreshold]);

  const pageStats = useMemo(() => {
    const total = previewProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / previewPageSize));
    const curPage = Math.min(Math.max(1, previewPage), totalPages);
    const start = (curPage - 1) * previewPageSize;
    const slice = previewProducts.slice(start, start + previewPageSize);
    const existingSet = new Set(categories.map(c => normalizeStr(c.name)));
    let existsCount = 0;
    let newCount = 0;
    let fallbackCount = 0;
    for (const p of previewProducts) {
      const cat = (p as any).category;
      const raw = String(cat || "").trim();
      if (!raw) { fallbackCount++; continue; }
      if (existingSet.has(normalizeStr(raw))) existsCount++;
      else newCount++;
    }
    return { total, totalPages, curPage, slice, existsCount, newCount, fallbackCount };
  }, [previewProducts, previewPage, categories]);

  const getCategoryMeta = useCallback((categoryName: string) => {
    const raw = String(categoryName || "").trim();
    if (!raw) {
      return {
        label: `Fallback: ${selectedCategory}`,
        badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
        indicator: "⚪",
        title: "Categoria não definida na 5ª coluna — usará o fallback do dropdown"
      };
    }
    const norm = normalizeStr(raw);
    const exists = categories.some(c => normalizeStr(c.name) === norm);
    if (exists) {
      return {
        label: raw,
        badgeClass: "bg-green-50 text-green-700 border border-green-200",
        indicator: "🟢",
        title: "Categoria já existe no banco"
      };
    }
    return {
      label: raw,
      badgeClass: "bg-yellow-50 text-yellow-800 border border-yellow-300",
      indicator: "🟡",
      title: "Categoria NÃO existe — será criada automaticamente na importação"
    };
  }, [categories, selectedCategory]);

  const handleAnalyzeColumns = useCallback(() => {
    const inputText = text;
    if (!inputText.trim()) {
      setStatus("error");
      setMessage("Nada para analisar. Cole o bloco de texto.");
      return;
    }
    setStatus("idle");
    setMessage("");
    const t0 = performance.now();
    const extracted = extractRawColumns(inputText);
    if (extracted.detectedColumnCount === 0 || extracted.columns.length === 0) {
      setStatus("error");
      setMessage("Nenhuma coluna TAB detectada. Confirme se o bloco de origem usa tabulação (TAB) entre os campos.");
      return;
    }
    const guess = autoGuessMapping(extracted);
    setRawColumns(extracted);
    setColumnMapping(guess);
    setImportStep("mapping");
    const hasHeaders = !!extracted.headers;
    setMessage(
      `${extracted.columns.length.toLocaleString("pt-BR")} linhas × ${extracted.detectedColumnCount} colunas detectadas em ${(performance.now() - t0).toFixed(0)}ms` +
      (hasHeaders ? " • Header reconhecido." : " • Sem header.") +
      " Ajuste o mapeamento abaixo se necessário."
    );
  }, [text]);

  const handleApplyMapping = useCallback(async () => {
    if (!rawColumns) return;
    abortRef.current.canceled = false;
    setStatus("loading");
    setProgressPct(0);
    setPreviewPage(1);
    const t0 = performance.now();

    setMessage("Construindo produtos com base no mapeamento... (0%)");
    await new Promise(r => setTimeout(r, 0));
    const builtProducts = buildProductsByMapping(rawColumns, columnMapping, selectedCategory);
    if (abortRef.current.canceled) { setStatus("idle"); return; }

    if (builtProducts.length === 0) {
      setStatus("error");
      setMessage("Nenhum produto válido encontrado com este mapeamento. Ajuste NOME / PREÇO / IMAGEM (mínimo obrigatório).");
      setProgressPct(null);
      return;
    }

    const products = builtProducts;
    const total = products.length;
    setProgressPct(5);
    setMessage(`${total.toLocaleString("pt-BR")} produtos. Preparando base... (5%)`);
    await new Promise(r => setTimeout(r, 0));

    const brandRegexes = BRAND_REGEXES;
    const dedupeUrls = (urls: string[]) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const u of urls || []) {
        const s = String(u || "").trim();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        out.push(s);
      }
      return out;
    };

    const patchBuffer: Record<string, Partial<Product>> = {};
    const flushPatches = () => {
      if (Object.keys(patchBuffer).length === 0) return;
      setParsedProducts(prev =>
        prev.map(it => patchBuffer[it.id] ? { ...it, ...patchBuffer[it.id] } : it)
      );
      for (const k of Object.keys(patchBuffer)) delete patchBuffer[k];
    };

    const initialRows: Product[] = new Array(total);
    for (let i = 0; i < total; i++) {
      const p = products[i];
      const rawImageUrls: string[] = Array.isArray((p as any).image_urls) && (p as any).image_urls.length > 0
        ? (p as any).image_urls
        : p.image ? [p.image] : [];

      const optimizedImgs = rawImageUrls
        .map(u => {
          let opt = optimizeUrlFast(u);
          if (opt.includes("kabum.com.br") && opt.includes("images.kabum.com.br")) {
            opt = toKabumOriginalUrl(opt);
          }
          return opt;
        });

      const deduped = dedupeUrls(optimizedImgs);
      const primaryImg = deduped[0] || optimizeUrlFast(p.image);

      let finalName = p.name;
      for (const regex of brandRegexes) finalName = finalName.replace(regex, "Balão.info");
      const slug = finalName.length > 0
        ? finalName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
        : `prod-${Date.now()}-${i}`;

      initialRows[i] = {
        ...p,
        name: finalName,
        image: primaryImg,
        image_urls: deduped.length > 0 ? deduped : [primaryImg],
        description: (p as any).description || "",
        specs: (p as any).specs || {},
        imageValid: false,
        ai_status: "thinking",
        slug
      } as any;
    }

    setParsedProducts(initialRows);
    setImportStep("preview");
    setProgressPct(10);
    setMessage(`Banco preparado. Iniciando enriquecimento (${concurrencyMeta.label})... (10%)`);
    await new Promise(r => setTimeout(r, 0));

    let enqueueFlushTimeout: any = null;
    const scheduleFlush = () => {
      if (enqueueFlushTimeout != null) return;
      enqueueFlushTimeout = setTimeout(() => {
        enqueueFlushTimeout = null;
        flushPatches();
      }, 120);
    };

    const updateRowBuffered = (id: string, patch: Partial<Product>) => {
      patchBuffer[id] = { ...(patchBuffer[id] || {}), ...patch };
      scheduleFlush();
    };

    let aiDone = 0;
    let imgDone = 0;
    const onAiProgress = () => {
      aiDone++;
      const overall = 10 + Math.floor((aiDone / total) * 40);
      setProgressPct(overall);
      setMessage(`Enriquecendo... IA ${aiDone}/${total} • IMG ${imgDone}/${total} (${overall}%)`);
    };
    const onImgProgress = () => {
      imgDone++;
      const overall = 50 + Math.floor((imgDone / total) * 45);
      setProgressPct(overall);
      setMessage(`Validando imagens... IA ${aiDone}/${total} • IMG ${imgDone}/${total} (${overall}%)`);
    };

    if (!skipAiAndScrape) {
      await poolLimit(
        concurrencyConfig.ai,
        initialRows,
        async (p: any) => {
          if (abortRef.current.canceled) return;
          let imageUrls: string[] = Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls.slice() : [];
          let description = "";
          let specs: any = {};

          if (p.product_url && String(p.product_url).includes("kabum.com.br")) {
            try {
              const controller = new AbortController();
              const t = setTimeout(() => controller.abort(), 9000);
              const scrapeRes = await fetch("/api/scrape/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: p.product_url }),
                signal: controller.signal
              });
              clearTimeout(t);
              if (scrapeRes.ok) {
                const scrapeData = await scrapeRes.json();
                if (Array.isArray(scrapeData.images) && scrapeData.images.length > 0) {
                  for (const im of scrapeData.images) imageUrls.push(im);
                }
                if (scrapeData.description) description = scrapeData.description;
                if (scrapeData.specs) specs = scrapeData.specs;
              }
            } catch {}
          }

          imageUrls = dedupeUrls(imageUrls);
          let aiNext: "done" | "error" = "error";

          if (description) {
            try {
              const controller = new AbortController();
              const t = setTimeout(() => controller.abort(), 12000);
              const aiRes = await fetch("/api/ai/rewrite-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productName: p.name, rawText: description, specs }),
                signal: controller.signal
              });
              clearTimeout(t);
              if (aiRes.ok) {
                const aiData = await aiRes.json();
                if (aiData?.markdown) {
                  description = aiData.markdown;
                  aiNext = "done";
                }
              }
            } catch {}
          }

          updateRowBuffered(p.id, { image_urls: imageUrls, specs, ai_status: aiNext, description } as any);
          onAiProgress();
        }
      );
    } else {
      for (const p of initialRows) updateRowBuffered(p.id, { ai_status: "done" } as any);
      aiDone = total;
      setProgressPct(50);
    }

    if (abortRef.current.canceled) { setStatus("idle"); setProgressPct(null); return; }

    await poolLimit(
      concurrencyConfig.img,
      initialRows,
      async (p: any) => {
        if (abortRef.current.canceled) return;
        if (skipImageValidation) {
          updateRowBuffered(p.id, { imageValid: true } as any);
          onImgProgress();
          return;
        }
        const urls: string[] = Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls : [p.image];
        const valid: string[] = [];
        for (const cand of urls) {
          if (valid.length >= 12) break;
          const ok = await validateImageFast(cand, 2500);
          if (ok) valid.push(cand);
        }
        const primary = valid[0] || "";
        updateRowBuffered(p.id, {
          image: primary || p.image,
          image_urls: valid.length > 0 ? valid : urls,
          imageValid: skipImageValidation ? true : !!primary
        } as any);
        onImgProgress();
      }
    );

    if (enqueueFlushTimeout != null) {
      clearTimeout(enqueueFlushTimeout);
      enqueueFlushTimeout = null;
    }
    flushPatches();

    if (abortRef.current.canceled) { setStatus("idle"); setProgressPct(null); return; }

    setProgressPct(95);
    setParsedProducts(prev => {
      const filtered = skipImageValidation ? prev : prev.filter((r: any) => r.imageValid && r.image);
      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      const avgImgs = filtered.length > 0
        ? (filtered.reduce((acc, r: any) => acc + (Array.isArray((r as any).image_urls) ? (r as any).image_urls.length : 1), 0) / filtered.length).toFixed(1)
        : "0";
      setMessage(`${filtered.length.toLocaleString("pt-BR")} produtos válidos em ${secs}s (média ${avgImgs} fotos/prod). Pronto para importar.`);
      return filtered;
    });
    setProgressPct(100);
    setTimeout(() => setProgressPct(null), 800);
    setStatus("idle");
  }, [rawColumns, columnMapping, selectedCategory, concurrencyConfig, concurrencyMeta, skipAiAndScrape, skipImageValidation]);

  const handleParse = handleAnalyzeColumns;

  const handleConfirmImport = useCallback(async () => {
    abortRef.current.canceled = false;
    setStatus("loading");
    setProgressPct(0);
    try {
      const preview = previewProducts;
      const total = preview.length;
      if (total === 0) throw new Error("Nenhum produto para importar.");

      const finalProducts = preview.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.newPrice,
        image: p.image,
        image_urls: p.image_urls,
        product_url: p.product_url,
        description: p.description,
        specs: p.specs,
        category: p.category,
        slug: p.slug
      }));

      const uniqueCats = Array.from(
        new Set(finalProducts.map(p => String(p.category || "").trim()).filter(Boolean))
      );

      const existingMap = new Map<string, Category>();
      categories.forEach(c => existingMap.set(normalizeStr(c.name), c));
      const missingCats = uniqueCats.filter(n => !existingMap.has(normalizeStr(n)));

      let currentPct = 2;
      setProgressPct(currentPct);

      if (missingCats.length > 0) {
        setMessage(`Criando ${missingCats.length} categoria(s)...`);
        const catChunks = chunk(missingCats, 20);
        let catDone = 0;
        for (const batch of catChunks) {
          const promises = batch.map(async (catName) => {
            const slug = slugifyStr(catName) || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            try {
              const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: catName, slug, parent_id: null, display_order: 0, active: true, icon: null })
              });
              return res.ok ? await res.json() : null;
            } catch { return null; }
          });
          await Promise.all(promises);
          catDone += batch.length;
          currentPct = Math.floor(5 + (catDone / missingCats.length) * 15);
          setProgressPct(currentPct);
          setMessage(`Categorias: ${catDone}/${missingCats.length}`);
        }
        await fetchCategories();
      }

      currentPct = 20;
      setProgressPct(currentPct);

      const chunkSize = Math.max(10, Math.min(5000, Number.isFinite(saveChunkSize) ? saveChunkSize : 500));
      const batches = chunk(finalProducts, chunkSize);

      let productsSaved = 0;
      setMessage(`Salvando ${total} produtos em ${batches.length} lotes de ${chunkSize}... (20%)`);

      await poolLimit(
        concurrencyConfig.save,
        batches.map((b, i) => ({ b, i })),
        async ({ b }) => {
          if (abortRef.current.canceled) return;
          try {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 90_000);
            const res = await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ products: b }),
              signal: controller.signal
            });
            clearTimeout(t);
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err?.error || `Lote com ${b.length} itens falhou`);
            }
            productsSaved += b.length;
          } catch (e: any) {
            console.error("Lote falhou:", e);
            productsSaved += Math.floor(b.length * 0);
          } finally {
            currentPct = Math.min(97, 20 + Math.floor((productsSaved / total) * 77));
            setProgressPct(currentPct);
            setMessage(`Salvando... ${productsSaved}/${total} (${currentPct}%)`);
          }
        }
      );

      currentPct = 97;
      setProgressPct(97);
      setMessage("Finalizando... (97%)");

      const appliedCatsSummary = uniqueCats.length > 0 ? uniqueCats.slice(0, 20).join(", ") : selectedCategory;
      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_count: productsSaved,
            price_percentage: priceAdjustment,
            applied_category: appliedCatsSummary,
            applied_scope: adjustmentScope
          })
        }).catch(() => {});
      } catch {}

      setStatus("success");
      setProgressPct(100);
      setMessage(
        `${productsSaved} produtos importados com sucesso!` +
        (missingCats.length > 0 ? ` (${missingCats.length} categoria(s) criada(s))` : "")
      );
      setTimeout(() => setProgressPct(null), 1200);
      setText("");
      setParsedProducts([]);
      setImportStep("input");
      setPriceAdjustment(0);
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setMessage(`Erro ao importar: ${e.message || "Erro desconhecido"}`);
      setProgressPct(null);
    }
  }, [previewProducts, categories, selectedCategory, priceAdjustment, adjustmentScope, concurrencyConfig.save, saveChunkSize]);

  const removePreviewImage = useCallback((productId: string, imageUrl: string) => {
    setParsedProducts(prev =>
      prev.flatMap(it => {
        if (String(it?.id) !== String(productId)) return [it];
        const currentUrls: string[] = Array.isArray((it as any)?.image_urls) && (it as any).image_urls.length > 0
          ? (it as any).image_urls
          : (it as any)?.image ? [String((it as any).image)] : [];
        const nextUrls = currentUrls.filter(u => String(u || "").trim() && String(u) !== String(imageUrl));
        const nextPrimary = String(nextUrls[0] || "").trim();
        if (!nextPrimary) return [];
        return [{ ...(it as any), image: nextPrimary, image_urls: nextUrls, imageValid: true } as any];
      })
    );
  }, []);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  const flatCategories = useMemo(() => {
    const out: { name: string; level: number }[] = [];
    const flatten = (nodes: Category[], level = 0) => {
      nodes.forEach(node => {
        out.push({ name: node.name, level });
        if (node.children) flatten(node.children, level + 1);
      });
    };
    flatten(categoryTree);
    return out;
  }, [categoryTree]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-[#E60012]" />
            Importação de Produtos
            <span title={concurrencyMeta.desc} className={`inline-flex items-center gap-1 ml-2 text-[10px] font-bold px-2 py-1 rounded border ${concurrencyMeta.cls}`}>
              <span>{concurrencyMeta.icon}</span>
              <span>{concurrencyMeta.label}</span>
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Otimizado para cargas colossais (30.000+ itens) • Worker pools, chunked saves, paginação de preview.
          </p>
        </div>
        {importStep === "preview" && (
          <button
            onClick={() => setImportStep("input")}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Voltar para edição
          </button>
        )}
      </div>

      {progressPct !== null && (
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-[#E60012] via-orange-500 to-yellow-400 transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }}
            />
          </div>
        </div>
      )}

      {message && (
        <div className={`mb-6 p-4 rounded-md border flex items-center gap-3 ${
          status === "success" ? "bg-green-50 border-green-200 text-green-700" :
          status === "error" ? "bg-red-50 border-red-200 text-red-700" :
          "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          {status === "success" ? <CheckCircle size={20} /> : status === "error" ? <AlertCircle size={20} /> : <Clock size={20} />}
          <span className="flex-1 font-mono text-xs break-all whitespace-pre-wrap">{message}</span>
        </div>
      )}

      {importStep === "input" ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 font-bold text-sm text-gray-700 uppercase tracking-wide">
                <Zap size={16} className="text-[#E60012]" /> Performance
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nível de Paralelismo</label>
                <select
                  value={concurrencyMode}
                  onChange={e => setConcurrencyMode(e.target.value as any)}
                  className="w-full p-2 border rounded-md text-sm bg-white"
                >
                  <option value="turbo">🚀 TURBO (30 mil+ itens • rápido)</option>
                  <option value="balanced">⚖️ BALANCEADO (10-20 mil itens)</option>
                  <option value="light">🌱 ECONÔMICO (≤ 5 mil itens)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">{concurrencyMeta.desc}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tamanho Lote (salvar DB)</label>
                <select
                  value={String(saveChunkSize)}
                  onChange={e => setSaveChunkSize(Number(e.target.value) || 500)}
                  className="w-full p-2 border rounded-md text-sm bg-white"
                >
                  <option value="200">200 / lote (seguro)</option>
                  <option value="500">500 / lote (padrão)</option>
                  <option value="1000">1000 / lote (rápido)</option>
                  <option value="2500">2500 / lote (turbo DB)</option>
                  <option value="5000">5000 / lote (EXTREMO)</option>
                </select>
              </div>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={skipImageValidation} onChange={e => setSkipImageValidation(e.target.checked)} className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]" />
                  <span className="text-sm font-medium text-gray-700">Pular validação de imagem (só confia)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={skipAiAndScrape} onChange={e => setSkipAiAndScrape(e.target.checked)} className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]" />
                  <span className="text-sm font-medium text-gray-700">Pular IA + Scrape Kabum (velocidade máxima)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={migrateImages} onChange={e => setMigrateImages(e.target.checked)} className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]" />
                  <span className="text-sm font-medium text-gray-700">Migrar imagens para Supabase</span>
                </label>
              </div>
              <div className="text-[10px] text-gray-500 pt-2 border-t border-gray-200 space-y-1">
                <div className="flex justify-between"><span>🛑 Scrape Kabum timeout</span><span>9s</span></div>
                <div className="flex justify-between"><span>🛑 IA rewrite timeout</span><span>12s</span></div>
                <div className="flex justify-between"><span>🛑 Validação imagem</span><span>2,5s</span></div>
                <div className="flex justify-between"><span>🛑 Salvar lote</span><span>90s</span></div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cole o bloco de texto dos produtos:
              </label>
              <textarea
                className="w-full h-72 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-xs"
                placeholder="Exemplo:&#10;ProductURL [TAB] ImageURL [TAB] Nome [TAB] Preço [TAB] Categoria (hierarquia > aceita)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
              />
              <p className="text-xs text-gray-500">
                Formatos suportados automaticamente: <strong>3 colunas</strong> (Img Nome Preço), <strong>4 colunas</strong> (Prod Img Nome Preço OU Img Nome Preço Cat), <strong>5 colunas</strong> (Prod Img Nome Preço Categoria).
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleParse}
                  disabled={!text.trim() || status === "loading"}
                  className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {status === "loading" ? "Processando..." : "Analisar Colunas"}
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : importStep === "mapping" ? (
        <>
          <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings size={20} className="text-[#E60012]" /> Mapear Colunas
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  O sistema tentou adivinhar automaticamente. Ajuste abaixo <b>Nome / Preço / Categoria</b> e selecione <b>quantas colunas de IMAGEM</b> você tiver (todas marcadas como IMAGEM serão importadas).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => setImportStep("input")}
                  className="text-xs px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-1"
                >
                  ← Voltar texto
                </button>
                <button
                  onClick={() => {
                    if (!rawColumns) return;
                    setColumnMapping(autoGuessMapping(rawColumns));
                  }}
                  className="text-xs px-3 py-2 rounded-md border bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold flex items-center gap-1"
                >
                  🎯 Re-adivinhar
                </button>
                <button
                  onClick={handleApplyMapping}
                  disabled={status === "loading"}
                  className="text-xs px-4 py-2 rounded-md bg-[#E60012] hover:bg-red-700 text-white font-bold flex items-center gap-1 disabled:opacity-50"
                >
                  {status === "loading" ? "Aplicando..." : "Aplicar e Prosseguir →"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-3 py-2 text-left font-bold text-gray-600 w-24">Coluna</th>
                    <th className="px-3 py-2 text-left font-bold text-gray-600 w-40">Papel (O que é?)</th>
                    <th className="px-3 py-2 text-left font-bold text-gray-600">Header detectado</th>
                    <th className="px-3 py-2 text-left font-bold text-gray-600">Amostra (2 primeiras linhas)</th>
                  </tr>
                </thead>
                <tbody>
                  {rawColumns && Array.from({ length: rawColumns.detectedColumnCount }).map((_, colIdx) => {
                    const currentRole: ColumnRole = columnMapping[colIdx] || "ignore";
                    const headerVal = rawColumns.headers ? rawColumns.headers[colIdx] : undefined;
                    const s1 = rawColumns.columns[0]?.[colIdx] ?? "";
                    const s2 = rawColumns.columns[1]?.[colIdx] ?? "";
                    const isImgPreview = /^https?:\/\//i.test(String(s1)) && /\.(?:jpg|jpeg|png|webp|gif|svg|avif|bmp)(?:[?#]|$)/i.test(String(s1));
                    return (
                      <tr key={colIdx} className={`border-b last:border-0 ${currentRole === "name" ? "bg-blue-50/60" : currentRole === "price" ? "bg-green-50/60" : currentRole === "category" ? "bg-purple-50/60" : currentRole === "image" ? "bg-pink-50/60" : currentRole === "product_url" ? "bg-cyan-50/60" : "bg-white"}`}>
                        <td className="px-3 py-3 font-mono font-bold text-gray-500">#{colIdx + 1}</td>
                        <td className="px-3 py-3">
                          <select
                            value={currentRole}
                            onChange={(e) => {
                              const newRole = e.target.value as ColumnRole;
                              setColumnMapping((prev) => {
                                const next = { ...prev };
                                if (newRole === "image") {
                                  next[colIdx] = newRole;
                                  return next;
                                }
                                for (const kStr of Object.keys(next)) {
                                  const k = Number(kStr);
                                  if (k !== colIdx && next[k] === newRole && newRole !== "ignore") delete next[k];
                                }
                                if (newRole === "ignore") delete next[colIdx];
                                else next[colIdx] = newRole;
                                return next;
                              });
                            }}
                            className="w-full p-1.5 border rounded bg-white text-xs font-medium"
                          >
                            <option value="ignore">❌ Ignorar</option>
                            <option value="name">📝 Nome do Produto</option>
                            <option value="price">💰 Preço</option>
                            <option value="category">📂 Categoria</option>
                            <option value="image">🖼️  Imagem (pode selecionar várias)</option>
                            <option value="product_url">🔗 URL do Produto</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          {headerVal ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono truncate max-w-[200px]" title={headerVal}>{headerVal}</span>
                          ) : (
                            <span className="text-gray-400 italic">— sem header —</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {isImgPreview && s1 ? (
                              <div className="flex items-center gap-2">
                                <img src={s1} alt="" className="w-8 h-8 object-cover rounded border bg-gray-100" />
                                <span className="font-mono truncate max-w-[280px] text-gray-600" title={s1}>{s1}</span>
                              </div>
                            ) : s1 ? (
                              <span className="font-mono truncate max-w-[340px] text-gray-700" title={s1}>▶ {s1 || "—"}</span>
                            ) : <span className="text-gray-300">▶ —</span>}
                            {s2 ? (
                              <span className="font-mono truncate max-w-[340px] text-gray-500" title={s2}>▷ {s2 || "—"}</span>
                            ) : <span className="text-gray-300">▷ —</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-4 text-[11px] text-gray-600 flex-wrap">
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Nome (único)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-300" /> Preço (único)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-purple-100 border border-purple-300" /> Categoria (único)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-pink-100 border border-pink-300" /> Imagem (várias = múltiplas fotos)</div>
              <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-cyan-100 border border-cyan-300" /> URL Produto (único)</div>
            </div>

            {(() => {
              const mandatoryMissing: string[] = [];
              const used = Object.values(columnMapping || {});
              if (!used.includes("name")) mandatoryMissing.push("📝 Nome");
              if (!used.includes("price")) mandatoryMissing.push("💰 Preço");
              if (!used.includes("image")) mandatoryMissing.push("🖼️  Imagem");
              if (mandatoryMissing.length > 0) return (
                <div className="mt-3 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium">
                  ⚠️ Campos obrigatórios faltando: {mandatoryMissing.join(" • ")}
                </div>
              );
              return null;
            })()}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setImportStep("mapping")}
              disabled={status === "loading"}
              className="text-xs px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              ← Ajustar mapeamento de colunas
            </button>
            <button
              onClick={() => setImportStep("input")}
              disabled={status === "loading"}
              className="text-xs px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              Trocar bloco de texto
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-1"><Database size={12} /> Total</div>
              <div className="text-lg font-bold text-gray-900">{pageStats.total.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-1"><Layers size={12} /> 🟢 Existentes</div>
              <div className="text-lg font-bold text-green-700">{pageStats.existsCount.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-1"><Save size={12} /> 🟡 Novas</div>
              <div className="text-lg font-bold text-yellow-700">{pageStats.newCount.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-1"><Settings size={12} /> ⚪ Fallback</div>
              <div className="text-lg font-bold text-gray-600">{pageStats.fallbackCount.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border rounded-lg p-3 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 mb-1"><TrendingUp size={12} /> Página</div>
              <div className="text-lg font-bold text-gray-900">{pageStats.curPage} / {pageStats.totalPages}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoria Padrão (fallback)</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md text-sm bg-white"
              >
                {flatCategories.length > 0 ? (
                  flatCategories.map(c => (
                    <option key={c.name} value={c.name}>{'\u00A0'.repeat(c.level * 4)}{c.name}</option>
                  ))
                ) : CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[10px] text-gray-500 mt-1">Sobrescrita pela 5ª coluna quando informada.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ajuste de Preço (%)</label>
              <div className="flex items-center gap-2">
                <input type="number" value={priceAdjustment} onChange={e => setPriceAdjustment(Number(e.target.value))} className="w-full p-2 border rounded-md text-sm bg-white" placeholder="0" />
                <span className="text-gray-500 text-sm">%</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Valores negativos = desconto.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Aplicar Ajuste Em</label>
              <select value={adjustmentScope} onChange={e => setAdjustmentScope(e.target.value as any)} className="w-full p-2 border rounded-md text-sm mb-2 bg-white">
                <option value="all">Todos os produtos</option>
                <option value="high_value">Preço acima de...</option>
                <option value="low_value">Preço abaixo de...</option>
              </select>
              {adjustmentScope !== "all" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">R$</span>
                  <input type="number" value={scopeThreshold} onChange={e => setScopeThreshold(Number(e.target.value))} className="w-full p-1 border rounded text-sm bg-white" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Resumo Categorias</label>
              <div className="text-[11px] space-y-1 pt-1 border rounded bg-white p-2 h-[70px] overflow-y-auto">
                {(() => {
                  const counter: Record<string, number> = {};
                  for (const p of previewProducts) {
                    const k = String((p as any).category || selectedCategory).trim() || "Sem Categoria";
                    counter[k] = (counter[k] || 0) + 1;
                  }
                  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1]).slice(0, 30);
                  return entries.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="truncate text-gray-700">{k}</span>
                      <span className="font-mono font-bold text-gray-900">{v}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {pageStats.total > previewPageSize && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-2">
              <button
                onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                disabled={pageStats.curPage <= 1}
                className="px-3 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
              >← Anterior</button>
              <div className="text-xs text-gray-600 font-mono">
                Página <b>{pageStats.curPage}</b> de {pageStats.totalPages} • exibindo {pageStats.slice.length.toLocaleString("pt-BR")} de {pageStats.total.toLocaleString("pt-BR")} produtos
              </div>
              <button
                onClick={() => setPreviewPage(p => Math.min(pageStats.totalPages, p + 1))}
                disabled={pageStats.curPage >= pageStats.totalPages}
                className="px-3 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50"
              >Próxima →</button>
            </div>
          )}

          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Preço Original</th>
                  <th className="px-4 py-3">Novo Preço</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageStats.slice.map((p, idx) => {
                  const offsetIdx = (pageStats.curPage - 1) * previewPageSize + idx;
                  return (
                    <tr key={String((p as any).id || offsetIdx)} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex gap-1 overflow-x-auto max-w-[150px] py-1">
                          {(p as any).image_urls && (p as any).image_urls.length > 0 ? (
                            (p as any).image_urls.slice(0, 3).map((img: string, i: number) => (
                              <div key={String(offsetIdx) + "_" + i} className="w-10 h-10 relative flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removePreviewImage(String((p as any).id), img)}
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                                  title="Remover foto"
                                >
                                  <X size={10} />
                                </button>
                                <img
                                  src={img}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className={`w-full h-full object-contain rounded border ${i === 0 ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  title={i === 0 ? "Capa" : `Foto ${i + 1}`}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="w-10 h-10 relative">
                              <button type="button" onClick={() => removePreviewImage(String((p as any).id), String((p as any).image))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black">
                                <X size={10} />
                              </button>
                              <img src={(p as any).image} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain rounded border" />
                            </div>
                          )}
                        </div>
                        {(p as any).image_urls && (p as any).image_urls.length > 1 && (
                          <span className="text-[10px] text-gray-400">{(p as any).image_urls.length} fotos</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={p.name}>
                        <div className="text-[10px] text-gray-400 font-mono mb-0.5">#{offsetIdx + 1}</div>
                        {p.name}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(p as any).description && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Desc OK</span>}
                          {(p as any).specs && Object.keys((p as any).specs).length > 0 && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Specs OK</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{(p as any).originalPrice}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                        {(p as any).newPrice}
                        {(p as any).priceChange !== 0 && (
                          <span className={`ml-2 text-xs ${(p as any).priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ({(p as any).priceChange > 0 ? '+' : ''}{(p as any).priceChange.toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const meta = getCategoryMeta((p as any).category);
                          return (
                            <span title={meta.title} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${meta.badgeClass}`}>
                              <span aria-hidden>{meta.indicator}</span>
                              <span className="max-w-[140px] truncate">{meta.label}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(p as any).ai_status === "thinking" ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Processando...</span>
                        ) : (p as any).ai_status === "error" ? (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">IA falhou</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {pageStats.slice.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">Nada para exibir nesta página.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pageStats.total > previewPageSize && (
            <div className="mb-4 flex items-center justify-between gap-3 bg-white border rounded-lg px-4 py-2">
              <button onClick={() => setPreviewPage(p => Math.max(1, p - 1))} disabled={pageStats.curPage <= 1} className="px-3 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50">← Anterior</button>
              <div className="text-xs text-gray-600 font-mono">Página <b>{pageStats.curPage}</b> / {pageStats.totalPages}</div>
              <button onClick={() => setPreviewPage(p => Math.min(pageStats.totalPages, p + 1))} disabled={pageStats.curPage >= pageStats.totalPages} className="px-3 py-1 text-xs border rounded disabled:opacity-40 hover:bg-gray-50">Próxima →</button>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setImportStep("input")}
              className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >Cancelar</button>
            <button
              onClick={handleConfirmImport}
              disabled={status === "loading"}
              className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {status === "loading" ? "Salvando..." : `Confirmar Importação (${pageStats.total.toLocaleString("pt-BR")} itens)`}
              <Save size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
