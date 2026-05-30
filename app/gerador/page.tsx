"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { pickPcHeroImage, toSlug } from "@/lib/vitrine/core";
import type { Product } from "@/lib/utils";
import type { VitrineCategory, VitrinePageRecord, VitrineStatus } from "@/lib/vitrine/types";

type GeneratorCategory = "Workstation" | "PC Gamer" | "Office";
type PartKind =
  | "cpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "gpu"
  | "psu"
  | "cooling"
  | "case"
  | "monitor"
  | "accessories"
  | "peripherals"
  | "other";

type PartBlock = {
  id: string;
  kind: PartKind;
  label: string;
  category: string;
  productId: string | null;
  customName: string;
  query: string;
  picking: boolean;
};

type SnapshotProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
  image_urls?: string[];
  product_url?: string | null;
  slug?: string | null;
  category?: string | null;
};

function id() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2);
}

function pickCategory(input: GeneratorCategory): VitrineCategory {
  if (input === "Office") return "PC para escritório";
  return input;
}

function defaultAppsForCategory(input: GeneratorCategory): string[] {
  if (input === "Workstation") {
    return ["Arquitetura / CAD", "Modelagem 3D", "Edição de vídeo", "Programação", "IA e Machine Learning", "Produtividade avançada"];
  }
  if (input === "PC Gamer") {
    return ["Jogos de tiro", "Mundo aberto", "Jogos de corrida", "Streaming", "Produtividade avançada", "Programação"];
  }
  return ["Produtividade avançada", "Programação", "Planilhas", "Videoconferência", "Navegação", "Estudos"];
}

function normalizeText(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickDefaultCategoryFromList(kind: PartKind, categories: string[]) {
  const k = String(kind || "");
  if (k === "storage") {
    const exact = categories.find((c) => {
      const n = normalizeText(c);
      return n === normalizeText("ssd / nvme") || n === normalizeText("ssd/nvme") || n === normalizeText("ssd nvme");
    });
    if (exact) return exact;
    const both = categories.find((c) => {
      const n = normalizeText(c);
      return n.includes("ssd") && (n.includes("nvme") || n.includes("m.2") || n.includes("m2"));
    });
    if (both) return both;
  }
  if (k === "psu") {
    const exact = categories.find((c) => normalizeText(c) === normalizeText("fonte"));
    if (exact) return exact;
  }
  if (k === "case") {
    const exact = categories.find((c) => normalizeText(c) === normalizeText("gabinete"));
    if (exact) return exact;
  }
  if (k === "monitor") {
    const exact = categories.find((c) => normalizeText(c) === normalizeText("monitor"));
    if (exact) return exact;
    const plural = categories.find((c) => normalizeText(c).includes("monitor"));
    if (plural) return plural;
  }
  if (k === "accessories") {
    const exact = categories.find((c) => normalizeText(c) === normalizeText("acessorios") || normalizeText(c) === normalizeText("acessórios"));
    if (exact) return exact;
    const hit = categories.find((c) => normalizeText(c).includes("acessor"));
    if (hit) return hit;
  }
  if (k === "peripherals") {
    const exact = categories.find((c) => normalizeText(c) === normalizeText("perifericos") || normalizeText(c) === normalizeText("periféricos"));
    if (exact) return exact;
    const hit = categories.find((c) => normalizeText(c).includes("perifer"));
    if (hit) return hit;
  }
  const targets =
    k === "cpu"
      ? ["processador", "cpu"]
      : k === "motherboard"
        ? ["placa mae", "placa-m", "motherboard", "placa-mae"]
        : k === "ram"
          ? ["memoria", "ram", "ddr"]
          : k === "storage"
            ? ["ssd", "nvme", "armazenamento", "m.2", "hd"]
            : k === "gpu"
              ? ["placa de video", "gpu", "video", "rtx", "radeon"]
              : k === "psu"
                ? ["fonte", "psu"]
                : k === "case"
                  ? ["gabinete", "case"]
                  : k === "cooling"
                    ? ["cooler", "water", "resfriamento"]
                    : k === "monitor"
                      ? ["monitor", "tela"]
                      : k === "accessories"
                        ? ["acessor", "adaptador", "cabo"]
                        : k === "peripherals"
                          ? ["perifer", "mouse", "teclado", "headset"]
                    : [];

  if (targets.length === 0) return "";
  for (const cat of categories) {
    const nc = normalizeText(cat);
    for (const t of targets) {
      if (nc.includes(t)) return cat;
    }
  }
  return "";
}

function toSnapshotProduct(p: any): SnapshotProduct {
  const urls = Array.isArray(p?.image_urls) ? p.image_urls : [];
  const merged = Array.from(
    new Set([String(p?.image || "").trim(), ...urls.map((u: any) => String(u || "").trim())].filter(Boolean))
  ).slice(0, 12);
  return {
    id: String(p?.id || ""),
    name: String(p?.name || ""),
    price: String(p?.price || ""),
    image: String(p?.image || ""),
    image_urls: merged,
    product_url: p?.product_url ? String(p.product_url) : null,
    slug: typeof p?.slug === "string" ? p.slug : null,
    category: typeof p?.category === "string" ? p.category : null,
  };
}

function buildWhatsAppHref(productName: string, priceText: string) {
  const price = String(priceText || "").trim() || "Sob consulta";
  const msg = `Olá! Quero comprar ${productName} por ${price}. Pode confirmar estoque e prazo?`;
  return `https://wa.me/5519987510267?text=${encodeURIComponent(msg)}`;
}

function mapPartsToColumns(parts: Array<{ kind: PartKind; product: SnapshotProduct }>) {
  const out: Record<string, string> = {};
  for (const p of parts) {
    if (p.kind === "cpu" && !out.processador) out.processador = p.product.name;
    if (p.kind === "ram" && !out.memoria_ram) out.memoria_ram = p.product.name;
    if (p.kind === "storage" && !out.armazenamento) out.armazenamento = p.product.name;
    if (p.kind === "gpu" && !out.placa_video) out.placa_video = p.product.name;
    if (p.kind === "cooling" && !out.resfriamento) out.resfriamento = p.product.name;
  }
  return out;
}

function mapPartsToImages(mainImage: string, parts: Array<{ kind: PartKind; product: SnapshotProduct }>) {
  const images: Record<string, string> = {};
  if (mainImage) images.hero = mainImage;
  for (const p of parts) {
    const img = p.product.image;
    if (!img) continue;
    if (p.kind === "cpu" && !images.cpu) images.cpu = img;
    if (p.kind === "ram" && !images.ram) images.ram = img;
    if (p.kind === "storage" && !images.storage) images.storage = img;
    if (p.kind === "gpu" && !images.gpu) images.gpu = img;
    if (p.kind === "cooling" && !images.cooling) images.cooling = img;
  }
  return images;
}

export default function GeradorPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [siteCategories, setSiteCategories] = useState<string[]>([]);
  const [pages, setPages] = useState<VitrinePageRecord[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const [category, setCategory] = useState<GeneratorCategory>("Workstation");

  const [mainSearch, setMainSearch] = useState("");
  const [mainCategory, setMainCategory] = useState<string>("");
  const [mainProductId, setMainProductId] = useState<string | null>(null);
  const [mainCustomName, setMainCustomName] = useState<string>("");

  const [parts, setParts] = useState<PartBlock[]>([
    { id: id(), kind: "cpu", label: "CPU", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "motherboard", label: "Placa mãe", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "ram", label: "Memória RAM", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "storage", label: "Armazenamento", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "gpu", label: "Placa de vídeo", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "psu", label: "Fonte", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "cooling", label: "Resfriamento", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "case", label: "Gabinete", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "monitor", label: "Monitor", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "accessories", label: "Acessórios", category: "", productId: null, customName: "", query: "", picking: true },
    { id: id(), kind: "peripherals", label: "Periféricos", category: "", productId: null, customName: "", query: "", picking: true },
  ]);

  const mainProduct = useMemo(() => {
    if (!mainProductId) return null;
    return products.find((p: any) => String((p as any).id) === String(mainProductId)) || null;
  }, [products, mainProductId]);

  useEffect(() => {
    const next = mainProduct ? String((mainProduct as any)?.name || "") : "";
    setMainCustomName(next);
  }, [mainProductId]);

  const effectiveMainName = useMemo(() => {
    const override = String(mainCustomName || "").trim();
    if (override) return override;
    return String((mainProduct as any)?.name || "").trim();
  }, [mainCustomName, mainProduct]);

  const mainPriceText = useMemo(() => {
    const raw = String((mainProduct as any)?.price || "").trim();
    return raw || "Sob consulta";
  }, [mainProduct]);

  const filteredMainProducts = useMemo(() => {
    const q = normalizeText(mainSearch);
    const list = products as any[];
    const byCategory = String(mainCategory || "").trim()
      ? list.filter((p) => normalizeText(String(p?.category || "")) === normalizeText(String(mainCategory)))
      : list;
    if (!q) return byCategory.slice(0, 20);
    return list
      .filter((p) => normalizeText(`${p?.name || ""} ${p?.category || ""} ${(p as any)?.id || ""}`).includes(q))
      .filter((p) =>
        String(mainCategory || "").trim()
          ? normalizeText(String(p?.category || "")) === normalizeText(String(mainCategory))
          : true
      )
      .slice(0, 30);
  }, [products, mainSearch, mainCategory]);

  const categoryOptions = useMemo(() => {
    const fromDb = Array.isArray(siteCategories) ? siteCategories : [];
    const trimmed = fromDb.map((c) => String(c || "").trim()).filter(Boolean);
    if (trimmed.length > 0) return trimmed;
    const set = new Set<string>();
    for (const p of products as any[]) {
      const c = String(p?.category || "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [siteCategories, products]);

  useEffect(() => {
    if (categoryOptions.length === 0) return;
    setParts((prev) =>
      prev.map((b) => {
        if (String(b.category || "").trim()) return b;
        const picked = pickDefaultCategoryFromList(b.kind, categoryOptions);
        if (!picked) return b;
        return { ...b, category: picked };
      })
    );
  }, [categoryOptions]);

  useEffect(() => {
    if (products.length === 0) return;
    setParts((prev) => {
      let changed = false;
      const out = prev.map((b) => {
        if (!b.productId) return b;
        if (String(b.customName || "").trim()) return b;
        const p = (products as any[]).find((x) => String(x?.id || "") === String(b.productId));
        const name = p?.name ? String(p.name) : "";
        if (!name.trim()) return b;
        changed = true;
        return { ...b, customName: name };
      });
      return changed ? out : prev;
    });
  }, [products]);

  const selectedProductIds = useMemo(() => {
    const ids = new Set<string>();
    if (mainProductId) ids.add(String(mainProductId));
    for (const b of parts) {
      if (b.productId) ids.add(String(b.productId));
    }
    return ids;
  }, [mainProductId, parts]);

  const partsResolved = useMemo(() => {
    const list: Array<{ kind: PartKind; label: string; category: string; product: SnapshotProduct }> = [];
    const byId = new Map<string, any>();
    for (const p of products as any[]) byId.set(String(p?.id || ""), p);
    for (const block of parts) {
      if (!block.productId) continue;
      const p = byId.get(String(block.productId));
      if (!p) continue;
      const snap = toSnapshotProduct(p);
      const override = String(block.customName || "").trim();
      const nextSnap = override ? { ...snap, name: override } : snap;
      list.push({ kind: block.kind, label: block.label, category: block.category, product: nextSnap });
    }
    return list;
  }, [parts, products]);

  const computedSlug = useMemo(() => {
    const name = String(effectiveMainName || "").trim();
    return name ? toSlug(name) : "";
  }, [effectiveMainName]);

  const shareUrl = useMemo(() => {
    const s = activeSlug || computedSlug || "produto";
    return `https://www.balao.info/p/${s}`;
  }, [computedSlug, activeSlug]);

  const whatsHref = useMemo(() => {
    const name = String(effectiveMainName || "").trim();
    if (!name) return buildWhatsAppHref("um produto", "Sob consulta");
    return buildWhatsAppHref(name, mainPriceText);
  }, [effectiveMainName, mainPriceText]);

  const resetForm = () => {
    setActivePageId(null);
    setActiveSlug(null);
    setCategory("Workstation");
    setMainSearch("");
    setMainCategory("");
    setMainProductId(null);
    setMainCustomName("");
    setParts([
      { id: id(), kind: "cpu", label: "CPU", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "motherboard", label: "Placa mãe", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "ram", label: "Memória RAM", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "storage", label: "Armazenamento", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "gpu", label: "Placa de vídeo", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "psu", label: "Fonte", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "cooling", label: "Resfriamento", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "case", label: "Gabinete", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "monitor", label: "Monitor", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "accessories", label: "Acessórios", category: "", productId: null, customName: "", query: "", picking: true },
      { id: id(), kind: "peripherals", label: "Periféricos", category: "", productId: null, customName: "", query: "", picking: true },
    ]);
  };

  const loadAll = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const [prodRes, pagesRes, categoriesRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/vitrine/pages", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const prod = await prodRes.json().catch(() => []);
      const pagesJson = await pagesRes.json().catch(() => null);
      const categoriesJson = await categoriesRes.json().catch(() => []);
      if (!Array.isArray(prod)) throw new Error("Falha ao carregar produtos");
      if (!pagesRes.ok || !pagesJson?.success) throw new Error(pagesJson?.error || "Falha ao carregar páginas");
      const dbCats: string[] = Array.isArray(categoriesJson)
        ? categoriesJson.map((c: any) => String(c?.name || "").trim()).filter(Boolean)
        : [];
      setProducts(prod);
      setPages(Array.isArray(pagesJson.pages) ? pagesJson.pages : []);
      setSiteCategories(Array.from(new Set(dbCats)).sort((a, b) => a.localeCompare(b, "pt-BR")));
      setStatus("idle");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const ensureUniqueSlug = (base: string) => {
    const taken = new Set(pages.map((p) => String(p.slug || "").trim()).filter(Boolean));
    if (!taken.has(base)) return base;
    for (let i = 2; i < 500; i += 1) {
      const candidate = `${base}-${i}`;
      if (!taken.has(candidate)) return candidate;
    }
    return `${base}-${Date.now()}`;
  };

  const save = async (nextStatus: VitrineStatus) => {
    const main = mainProduct ? toSnapshotProduct(mainProduct) : null;
    if (!main || !main.id || !main.name) {
      alert("Selecione um produto principal.");
      return;
    }

    const finalMainName = String(effectiveMainName || "").trim() || main.name;
    const mainForDb = finalMainName ? { ...main, name: finalMainName } : main;

    const baseSlug = toSlug(finalMainName);
    const slug = activeSlug || (activePageId ? baseSlug : ensureUniqueSlug(baseSlug));

    const partsForDb = partsResolved.map((p) => ({ kind: p.kind, label: p.label, category: p.category, product: p.product }));
    const columnParts = mapPartsToColumns(partsForDb.map((p) => ({ kind: p.kind, product: p.product })));
    const images = mapPartsToImages(mainForDb.image, partsForDb.map((p) => ({ kind: p.kind, product: p.product })));
    if (!String(images.hero || "").trim()) {
      images.hero = pickPcHeroImage({ categoria: pickCategory(category) } as any);
    }

    const payload: any = {
      nome_pc: finalMainName,
      slug,
      categoria: pickCategory(category),
      descricao_original: "",
      processador: columnParts.processador || "",
      placa_video: columnParts.placa_video || "",
      memoria_ram: columnParts.memoria_ram || "",
      armazenamento: columnParts.armazenamento || "",
      sistema_operacional: "",
      resfriamento: columnParts.resfriamento || "",
      aplicacoes: defaultAppsForCategory(category),
      status: nextStatus,
      extras: {
        generator: "gerador_v1",
        generator_category: category,
        main_product: mainForDb,
        price_text: mainForDb.price || "Sob consulta",
        whatsapp: {
          number: "5519987510267",
          cta_label: "Quero comprar",
          template: "Olá! Quero comprar {NOME} por {PREÇO}. Pode confirmar estoque e prazo?",
        },
        parts: partsForDb,
      },
      images,
    };

    setStatus("loading");
    setMessage("");
    try {
      let res: Response;
      if (activePageId) {
        res = await fetch(`/api/vitrine/pages/${activePageId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/vitrine/pages", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao salvar");
      const saved = (data.page || null) as VitrinePageRecord | null;
      if (saved?.id) setActivePageId(saved.id);
      if (saved?.slug) setActiveSlug(saved.slug);
      await loadAll();
      setStatus("idle");
      setMessage("Página salva.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao salvar");
    }
  };

  const openForEdit = (p: VitrinePageRecord) => {
    setActivePageId(p.id);
    setActiveSlug(p.slug);
    const extras: any = (p as any)?.extras || {};
    const genCat: GeneratorCategory = extras?.generator_category === "PC Gamer" ? "PC Gamer" : extras?.generator_category === "Office" ? "Office" : "Workstation";
    setCategory(genCat);

    const main: any = extras?.main_product;
    const nextMainId = main?.id ? String(main.id) : null;
    setMainProductId(nextMainId);
    setMainSearch(main?.name ? String(main.name) : "");
    setMainCategory(typeof main?.category === "string" ? main.category : "");
    setMainCustomName(main?.name ? String(main.name) : "");

    const storedParts: any[] = Array.isArray(extras?.parts) ? extras.parts : [];
    const blocks: PartBlock[] = storedParts.map((sp) => ({
      id: id(),
      kind: (sp?.kind as PartKind) || "other",
      label: String(sp?.label || "Peça"),
      category: typeof sp?.category === "string" ? sp.category : "",
      productId: sp?.product?.id ? String(sp.product.id) : null,
      customName: sp?.product?.name ? String(sp.product.name) : "",
      query: "",
      picking: !sp?.product?.id,
    }));
    setParts(blocks.length > 0 ? blocks : parts);
    setMessage("");
  };

  const removePage = async (pageId: string) => {
    if (!confirm("Excluir esta página?")) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`/api/vitrine/pages/${pageId}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Falha ao excluir");
      if (activePageId === pageId) resetForm();
      await loadAll();
      setStatus("idle");
      setMessage("Página excluída.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Falha ao excluir");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#111111]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="font-extrabold tracking-tight">Gerador</div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-bold text-gray-700 hover:text-[#d71920]">
              Voltar para loja
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-black/5 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold">Minhas páginas</div>
                <div className="text-sm text-gray-600">Links em /p/&lt;slug&gt;</div>
              </div>
              <button
                onClick={resetForm}
                className="px-3 py-2 rounded-xl bg-[#d71920] text-white text-sm font-extrabold hover:bg-[#b9151b]"
              >
                Nova
              </button>
            </div>
            <div className="p-4">
              {pages.length === 0 ? (
                <div className="text-sm text-gray-600">Nenhuma página ainda.</div>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 60).map((p) => (
                    <div key={p.id} className={`rounded-xl border ${activePageId === p.id ? "border-[#d71920]/30 bg-red-50" : "border-black/5 bg-white"} p-4`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm truncate">{p.nome_pc}</div>
                          <div className="mt-1 text-xs text-gray-600 truncate">
                            {p.categoria} • /p/{p.slug} • {p.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/p/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl border border-black/10 text-xs font-extrabold hover:bg-white"
                          >
                            Abrir
                          </a>
                          <button
                            onClick={() => openForEdit(p)}
                            className="px-3 py-2 rounded-xl border border-black/10 text-xs font-extrabold hover:bg-white"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => removePage(p.id)}
                            className="px-3 py-2 rounded-xl border border-red-200 text-xs font-extrabold text-red-700 hover:bg-red-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-7 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-black/5">
              <div className="text-lg font-extrabold">{activePageId ? "Editar página" : "Criar página"}</div>
              <div className="text-sm text-gray-600">Selecione o produto principal e as peças. O preço sempre aparece.</div>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Categoria</div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GeneratorCategory)}
                    className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                  >
                    <option value="Workstation">Workstation</option>
                    <option value="PC Gamer">PC Gamer</option>
                    <option value="Office">Office</option>
                  </select>
                </div>

                <div>
                  <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">URL final</div>
                  <div className="mt-2 px-3 py-2 rounded-xl border border-black/10 bg-gray-50 text-sm font-semibold text-gray-800 truncate">
                    {shareUrl}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Produto principal</div>
                <select
                  value={mainCategory}
                  onChange={(e) => setMainCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                >
                  <option value="">Todas as categorias</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  value={mainSearch}
                  onChange={(e) => setMainSearch(e.target.value)}
                  placeholder="Buscar por nome, categoria ou ID..."
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                />
                {mainProduct ? (
                  <div className="mt-3 rounded-xl border border-black/5 bg-white p-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border border-black/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {String((mainProduct as any)?.image || "").trim() ? (
                        <img
                          src={String((mainProduct as any).image)}
                          alt={String((mainProduct as any)?.name || "Produto")}
                          className="w-full h-full object-contain bg-white"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-[10px] font-extrabold text-gray-400">SEM IMAGEM</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 whitespace-normal break-words leading-snug">
                        {String((mainProduct as any)?.name || "")}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600 whitespace-normal break-words">
                        {String((mainProduct as any)?.category || "")}
                      </div>
                      <div className="mt-1 text-xs font-extrabold text-[#d71920] whitespace-normal break-words">
                        {String((mainProduct as any)?.price || "").trim() || "Sob consulta"}
                      </div>
                    </div>
                  </div>
                ) : null}
                {mainProduct ? (
                  <div className="mt-3 rounded-xl border border-black/10 bg-gray-50 p-3">
                    <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Nome do produto (editável)</div>
                    <textarea
                      rows={2}
                      value={mainCustomName}
                      onChange={(e) => {
                        setMainCustomName(e.target.value);
                      }}
                      className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                    />
                  </div>
                ) : null}
                <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-black/5 bg-white">
                  {filteredMainProducts.map((p: any) => {
                    const selected = String(p.id) === String(mainProductId || "");
                    return (
                      <button
                        key={String(p.id)}
                        type="button"
                        onClick={() => setMainProductId(String(p.id))}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-3 ${selected ? "bg-red-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-white border border-black/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {String(p.image || "").trim() ? (
                              <img
                                src={String(p.image)}
                                alt={String(p.name || "Produto")}
                                className="w-full h-full object-contain bg-white"
                                loading="lazy"
                              />
                            ) : (
                              <div className="text-[10px] font-extrabold text-gray-400">SEM IMAGEM</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-gray-900 whitespace-normal break-words leading-snug">
                              {String(p.name || "")}
                            </div>
                            <div className="text-xs text-gray-600 whitespace-normal break-words">{String(p.category || "")}</div>
                          </div>
                        </div>
                        <div className="text-xs font-extrabold text-[#d71920]">{String(p.price || "").trim() || "Sob consulta"}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold">Botão</div>
                    <div className="text-xs text-gray-600">WhatsApp fixo (+55 19 98751-0267) com nome do produto e preço.</div>
                  </div>
                  <a
                    href={whatsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#16a34a] text-white font-extrabold text-sm hover:bg-green-700"
                  >
                    Quero comprar
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Peças (blocos)</div>
                    <div className="text-sm text-gray-600">Escolha quantas quiser e selecione no catálogo.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setParts((prev) =>
                        prev.concat([{ id: id(), kind: "other", label: "Peça", category: "", productId: null, customName: "", query: "", picking: true }])
                      )
                    }
                    className="px-3 py-2 rounded-xl border border-black/10 text-sm font-extrabold hover:bg-gray-50"
                  >
                    Adicionar bloco
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {parts.map((b) => {
                    const selectedProd = b.productId ? (products as any[]).find((p) => String(p.id) === String(b.productId)) : null;
                    const showPicker = b.picking || !selectedProd;
                    return (
                      <div
                        key={b.id}
                        className={`rounded-2xl border p-4 ${
                          selectedProd && !showPicker ? "border-emerald-200 bg-emerald-50/40" : "border-black/10 bg-white"
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-2">
                            <select
                              value={b.kind}
                              onChange={(e) =>
                                setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, kind: e.target.value as PartKind } : x)))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                            >
                              <option value="cpu">CPU</option>
                              <option value="motherboard">Placa-mãe</option>
                              <option value="ram">RAM</option>
                              <option value="storage">SSD/Armazenamento</option>
                              <option value="gpu">GPU</option>
                              <option value="psu">Fonte</option>
                              <option value="cooling">Resfriamento</option>
                              <option value="case">Gabinete</option>
                              <option value="monitor">Monitor</option>
                              <option value="accessories">Acessórios</option>
                              <option value="peripherals">Periféricos</option>
                              <option value="other">Outro</option>
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              value={b.label}
                              onChange={(e) => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, label: e.target.value } : x)))}
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                              placeholder="Título do bloco"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <select
                              value={b.category}
                              onChange={(e) => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, category: e.target.value } : x)))}
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                            >
                              <option value="">Todas as categorias</option>
                              {categoryOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            {selectedProd ? (
                              <div className="w-full px-3 py-2 rounded-xl bg-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {String((selectedProd as any)?.image || "").trim() ? (
                                    <img
                                      src={String((selectedProd as any).image)}
                                      alt={String((selectedProd as any)?.name || "Produto")}
                                      className="w-full h-full object-contain bg-white"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="text-[10px] font-extrabold text-gray-400">SEM IMAGEM</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-gray-700">Selecionado</div>
                                  <div className="mt-0.5 text-xs font-extrabold text-[#d71920]">
                                    {String((selectedProd as any)?.price || "").trim() || "Sob consulta"}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full px-3 py-2 rounded-xl border border-black/10 bg-gray-50 text-sm font-semibold text-gray-600">
                                Selecione um produto para esta peça
                              </div>
                            )}
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-end gap-2">
                            {selectedProd ? (
                              <button
                                type="button"
                                onClick={() => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, picking: true, query: "" } : x)))}
                                className="px-3 py-2 rounded-xl border border-black/10 text-sm font-extrabold hover:bg-white"
                              >
                                Trocar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setParts((prev) => prev.filter((x) => x.id !== b.id))}
                              className="px-3 py-2 rounded-xl border border-red-200 text-sm font-extrabold text-red-700 hover:bg-red-50"
                            >
                              X
                            </button>
                          </div>
                        </div>

                        {selectedProd ? (
                          <div className="mt-3 rounded-xl border border-black/10 bg-white p-3">
                            <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Peça selecionada</div>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                              <div className="sm:col-span-2">
                                <div className="w-full aspect-square rounded-xl bg-white border border-black/5 overflow-hidden flex items-center justify-center p-2">
                                  {String((selectedProd as any)?.image || "").trim() ? (
                                    <img
                                      src={String((selectedProd as any).image)}
                                      alt={String((selectedProd as any)?.name || "Produto")}
                                      className="w-full h-full object-contain bg-white"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="text-[10px] font-extrabold text-gray-400">SEM IMAGEM</div>
                                  )}
                                </div>
                              </div>
                              <div className="sm:col-span-10">
                                <div className="text-sm font-extrabold text-[#d71920]">
                                  {String((selectedProd as any)?.price || "").trim() || "Sob consulta"}
                                </div>
                                <div className="mt-2">
                                  <div className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">Nome (editável)</div>
                                  <textarea
                                    rows={2}
                                    value={String(b.customName || "")}
                                    onChange={(e) => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, customName: e.target.value } : x)))}
                                    placeholder={String((selectedProd as any)?.name || "")}
                                    className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {showPicker ? (
                          <div className="mt-3">
                            <input
                              placeholder="Buscar produto no catálogo para este bloco..."
                              value={b.query}
                              onChange={(e) =>
                                setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, query: e.target.value, picking: true } : x)))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                            />
                            <div className="mt-2 max-h-40 overflow-auto rounded-xl border border-black/5 bg-white">
                              {(products as any[])
                                .filter((p) => {
                                  const q = normalizeText(b.query);
                                  const catOk = !String(b.category || "").trim()
                                    ? true
                                    : normalizeText(String(p?.category || "")) === normalizeText(String(b.category || ""));
                                  if (!catOk) return false;

                                  const pid = String(p?.id || "");
                                  const alreadyPicked = selectedProductIds.has(pid) && pid !== String(b.productId || "");
                                  if (alreadyPicked) return false;

                                  if (!q) return true;
                                  return normalizeText(`${p?.name || ""} ${p?.category || ""} ${p?.id || ""}`).includes(q);
                                })
                                .slice(0, 25)
                                .map((p) => (
                                  <button
                                    key={String(p.id)}
                                    type="button"
                                    onClick={() =>
                                      setParts((prev) =>
                                        prev.map((x) =>
                                          x.id === b.id
                                            ? {
                                                ...x,
                                                productId: String(p.id),
                                                customName: String(p.name || ""),
                                                query: "",
                                                category: x.category || String(p?.category || ""),
                                                picking: false,
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-3"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-10 h-10 rounded-lg bg-white border border-black/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {String(p.image || "").trim() ? (
                                          <img
                                            src={String(p.image)}
                                            alt={String(p.name || "Produto")}
                                            className="w-full h-full object-contain bg-white"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className="text-[10px] font-extrabold text-gray-400">SEM IMAGEM</div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-extrabold text-gray-900 whitespace-normal break-words leading-snug">
                                          {String(p.name || "")}
                                        </div>
                                        <div className="text-xs text-gray-600 whitespace-normal break-words">{String(p.category || "")}</div>
                                      </div>
                                    </div>
                                    <div className="text-xs font-extrabold text-[#d71920]">{String(p.price || "").trim() || "Sob consulta"}</div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => save("publicada" as VitrineStatus)}
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#d71920] text-white font-extrabold hover:bg-[#b9151b] disabled:opacity-60"
                >
                  {activePageId ? "Atualizar e publicar" : "Gerar página"}
                </button>
                <button
                  onClick={() => save("rascunho" as VitrineStatus)}
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-black/10 bg-white font-extrabold hover:bg-gray-50 disabled:opacity-60"
                >
                  Salvar rascunho
                </button>
                <a
                  href={mainProduct ? `/p/${activeSlug || computedSlug || "produto"}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-black/10 bg-white font-extrabold hover:bg-gray-50"
                >
                  Ver preview
                </a>
              </div>

              {message ? <div className={`text-sm ${status === "error" ? "text-red-700" : "text-gray-700"}`}>{message}</div> : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
