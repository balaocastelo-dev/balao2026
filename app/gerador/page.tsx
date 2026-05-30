"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { pickPcHeroImage, toSlug } from "@/lib/vitrine/core";
import type { Product } from "@/lib/utils";
import type { VitrineCategory, VitrinePageRecord, VitrineStatus } from "@/lib/vitrine/types";

type GeneratorCategory = "Workstation" | "PC Gamer" | "Office";
type PartKind = "cpu" | "ram" | "storage" | "gpu" | "cooling" | "other";

type PartBlock = {
  id: string;
  kind: PartKind;
  label: string;
  productId: string | null;
  query: string;
};

type SnapshotProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
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

function toSnapshotProduct(p: any): SnapshotProduct {
  return {
    id: String(p?.id || ""),
    name: String(p?.name || ""),
    price: String(p?.price || ""),
    image: String(p?.image || ""),
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
  const [pages, setPages] = useState<VitrinePageRecord[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const [category, setCategory] = useState<GeneratorCategory>("Workstation");

  const [mainSearch, setMainSearch] = useState("");
  const [mainProductId, setMainProductId] = useState<string | null>(null);

  const [parts, setParts] = useState<PartBlock[]>([
    { id: id(), kind: "cpu", label: "Processador", productId: null, query: "" },
    { id: id(), kind: "ram", label: "Memória", productId: null, query: "" },
    { id: id(), kind: "storage", label: "Armazenamento", productId: null, query: "" },
    { id: id(), kind: "gpu", label: "Placa de vídeo", productId: null, query: "" },
  ]);

  const mainProduct = useMemo(() => {
    if (!mainProductId) return null;
    return products.find((p: any) => String((p as any).id) === String(mainProductId)) || null;
  }, [products, mainProductId]);

  const mainPriceText = useMemo(() => {
    const raw = String((mainProduct as any)?.price || "").trim();
    return raw || "Sob consulta";
  }, [mainProduct]);

  const filteredMainProducts = useMemo(() => {
    const q = normalizeText(mainSearch);
    const list = products as any[];
    if (!q) return list.slice(0, 20);
    return list
      .filter((p) => normalizeText(`${p?.name || ""} ${p?.category || ""} ${(p as any)?.id || ""}`).includes(q))
      .slice(0, 30);
  }, [products, mainSearch]);

  const partsResolved = useMemo(() => {
    const list: Array<{ kind: PartKind; label: string; product: SnapshotProduct }> = [];
    const byId = new Map<string, any>();
    for (const p of products as any[]) byId.set(String(p?.id || ""), p);
    for (const block of parts) {
      if (!block.productId) continue;
      const p = byId.get(String(block.productId));
      if (!p) continue;
      list.push({ kind: block.kind, label: block.label, product: toSnapshotProduct(p) });
    }
    return list;
  }, [parts, products]);

  const computedSlug = useMemo(() => {
    const name = String((mainProduct as any)?.name || "").trim();
    return name ? toSlug(name) : "";
  }, [mainProduct]);

  const shareUrl = useMemo(() => {
    const s = activeSlug || computedSlug || "produto";
    return `https://www.balao.info/p/${s}`;
  }, [computedSlug, activeSlug]);

  const whatsHref = useMemo(() => {
    const name = String((mainProduct as any)?.name || "").trim();
    if (!name) return buildWhatsAppHref("um produto", "Sob consulta");
    return buildWhatsAppHref(name, mainPriceText);
  }, [mainProduct, mainPriceText]);

  const resetForm = () => {
    setActivePageId(null);
    setActiveSlug(null);
    setCategory("Workstation");
    setMainSearch("");
    setMainProductId(null);
    setParts([
      { id: id(), kind: "cpu", label: "Processador", productId: null, query: "" },
      { id: id(), kind: "ram", label: "Memória", productId: null, query: "" },
      { id: id(), kind: "storage", label: "Armazenamento", productId: null, query: "" },
      { id: id(), kind: "gpu", label: "Placa de vídeo", productId: null, query: "" },
    ]);
  };

  const loadAll = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const [prodRes, pagesRes] = await Promise.all([fetch("/api/products", { cache: "no-store" }), fetch("/api/vitrine/pages", { cache: "no-store" })]);
      const prod = await prodRes.json().catch(() => []);
      const pagesJson = await pagesRes.json().catch(() => null);
      if (!Array.isArray(prod)) throw new Error("Falha ao carregar produtos");
      if (!pagesRes.ok || !pagesJson?.success) throw new Error(pagesJson?.error || "Falha ao carregar páginas");
      setProducts(prod);
      setPages(Array.isArray(pagesJson.pages) ? pagesJson.pages : []);
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

    const baseSlug = toSlug(main.name);
    const slug = activeSlug || (activePageId ? baseSlug : ensureUniqueSlug(baseSlug));

    const partsForDb = partsResolved.map((p) => ({ kind: p.kind, label: p.label, product: p.product }));
    const columnParts = mapPartsToColumns(partsForDb.map((p) => ({ kind: p.kind, product: p.product })));
    const images = mapPartsToImages(main.image, partsForDb.map((p) => ({ kind: p.kind, product: p.product })));
    if (!String(images.hero || "").trim()) {
      images.hero = pickPcHeroImage({ categoria: pickCategory(category) } as any);
    }

    const payload: Partial<VitrinePageRecord> & { extras?: any; images?: any } = {
      nome_pc: main.name,
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
        main_product: main,
        price_text: main.price || "Sob consulta",
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

    const storedParts: any[] = Array.isArray(extras?.parts) ? extras.parts : [];
    const blocks: PartBlock[] = storedParts.map((sp) => ({
      id: id(),
      kind: (sp?.kind as PartKind) || "other",
      label: String(sp?.label || "Peça"),
      productId: sp?.product?.id ? String(sp.product.id) : null,
      query: "",
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
                <input
                  value={mainSearch}
                  onChange={(e) => setMainSearch(e.target.value)}
                  placeholder="Buscar por nome, categoria ou ID..."
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                />
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
                        <div className="min-w-0">
                          <div className="font-extrabold text-gray-900 truncate">{String(p.name || "")}</div>
                          <div className="text-xs text-gray-600 truncate">{String(p.category || "")}</div>
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
                    onClick={() => setParts((prev) => prev.concat([{ id: id(), kind: "other", label: "Peça", productId: null, query: "" }]))}
                    className="px-3 py-2 rounded-xl border border-black/10 text-sm font-extrabold hover:bg-gray-50"
                  >
                    Adicionar bloco
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {parts.map((b) => {
                    const selectedProd = b.productId ? (products as any[]).find((p) => String(p.id) === String(b.productId)) : null;
                    return (
                      <div key={b.id} className="rounded-2xl border border-black/10 bg-white p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-3">
                            <select
                              value={b.kind}
                              onChange={(e) =>
                                setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, kind: e.target.value as PartKind } : x)))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                            >
                              <option value="cpu">CPU</option>
                              <option value="ram">RAM</option>
                              <option value="storage">SSD/Armazenamento</option>
                              <option value="gpu">GPU</option>
                              <option value="cooling">Resfriamento</option>
                              <option value="other">Outro</option>
                            </select>
                          </div>
                          <div className="sm:col-span-4">
                            <input
                              value={b.label}
                              onChange={(e) => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, label: e.target.value } : x)))}
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                              placeholder="Título do bloco"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <input
                              value={selectedProd ? String(selectedProd.name || "") : ""}
                              readOnly
                              className="w-full px-3 py-2 rounded-xl border border-black/10 bg-gray-50 text-sm font-semibold text-gray-800"
                              placeholder="Selecione um produto para esta peça"
                            />
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => setParts((prev) => prev.filter((x) => x.id !== b.id))}
                              className="px-3 py-2 rounded-xl border border-red-200 text-sm font-extrabold text-red-700 hover:bg-red-50"
                            >
                              X
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <input
                            placeholder="Buscar produto no catálogo para este bloco..."
                            value={b.query}
                            onChange={(e) => setParts((prev) => prev.map((x) => (x.id === b.id ? { ...x, query: e.target.value } : x)))}
                            className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d71920]/30"
                          />
                          <div className="mt-2 max-h-40 overflow-auto rounded-xl border border-black/5 bg-white">
                            {(products as any[])
                              .filter((p) => {
                                const q = normalizeText(b.query);
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
                                      prev.map((x) => (x.id === b.id ? { ...x, productId: String(p.id), query: String(p.name || "") } : x)),
                                    )
                                  }
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <div className="font-extrabold text-gray-900 truncate">{String(p.name || "")}</div>
                                    <div className="text-xs text-gray-600 truncate">{String(p.category || "")}</div>
                                  </div>
                                  <div className="text-xs font-extrabold text-[#d71920]">{String(p.price || "").trim() || "Sob consulta"}</div>
                                </button>
                              ))}
                          </div>
                        </div>
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
