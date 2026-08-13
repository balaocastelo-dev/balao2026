"use client";

import { useState, useEffect } from "react";
import { parseProducts, Product, Category, buildCategoryTree, CATEGORIES } from "@/lib/utils";
import { Upload, CheckCircle, AlertCircle, Search, Save, X } from "lucide-react";

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Import State
  const [text, setText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "preview">("input");
  
  // Import Settings
  const [selectedCategory, setSelectedCategory] = useState("Hardware");
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [adjustmentScope, setAdjustmentScope] = useState<"all" | "high_value" | "low_value">("all");
  const [scopeThreshold, setScopeThreshold] = useState<number>(1000);
  const [migrateImages, setMigrateImages] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
        const res = await fetch("/api/categories");
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
    } catch (e) {
        console.error("Failed to fetch categories", e);
    }
  };

  // Preview Logic
  const getPreviewProducts = () => {
    return parsedProducts.map((p: Product) => {
        // Fix: Use global regex for replace all dots, then replace comma with dot
        let priceNum = parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        if (isNaN(priceNum)) priceNum = 0;

        let applyAdjustment = false;
        if (adjustmentScope === "all") applyAdjustment = true;
        else if (adjustmentScope === "high_value" && priceNum >= scopeThreshold) applyAdjustment = true;
        else if (adjustmentScope === "low_value" && priceNum < scopeThreshold) applyAdjustment = true;

        let newPriceNum = priceNum;
        if (applyAdjustment) {
            newPriceNum = priceNum * (1 + priceAdjustment / 100);
        }

        const newPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceNum);

        const finalCategory = (p.category && p.category.trim()) || selectedCategory;

        return {
            ...p,
            category: finalCategory,
            originalPrice: p.price,
            newPrice: newPriceFormatted,
            priceChange: newPriceNum - priceNum
        };
    });
  };

  const getCategoryMeta = (categoryName: string) => {
    const raw = String(categoryName || "").trim();
    if (!raw) {
      return {
        label: `Fallback: ${selectedCategory}`,
        badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
        indicator: "⚪",
        title: "Categoria não definida na 5ª coluna — usará o fallback do dropdown"
      };
    }

    const normalize = (s: unknown) =>
      String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}+/gu, "")
        .trim();

    const norm = normalize(raw);
    const exists = categories.some(c => normalize(c.name) === norm);

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
  };

  const validateImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        resolve(w >= 600 && h >= 600);
      };
      img.onerror = () => resolve(false); 
      img.src = url;
    });
  };

  const optimizeUrl = (url: string) => {
    try {
        const u = new URL(url);
        
        // 1. Remove common resize query parameters
        const paramsToRemove = ['w', 'h', 'width', 'height', 'size', 'resize', 'format', 'quality', 'fit', 'crop', 'dpr', 'auto', 'v'];
        paramsToRemove.forEach(p => u.searchParams.delete(p));

        let path = u.pathname;

        // 2. Handle Google/Blogspot image resizing (/sXXX/) -> switch to /s0/ (original)
        if (/\/s\d+(-c)?\//.test(path)) {
            path = path.replace(/\/s\d+(-c)?\//, '/s0/');
        }
        
        // 3. Remove size suffixes in filename (e.g., image_50x50.jpg -> image.jpg)
        // Matches _100x100, _thumb, -thumb, _small, .small before extension
        const sizePattern = /[-_](?:\d+x\d+|thumb|thumbnail|small|medium|large|mini)(?=\.[a-zA-Z0-9]+$)/i;
        if (sizePattern.test(path)) {
             path = path.replace(sizePattern, '');
        }

        u.pathname = path;
        return u.toString();
    } catch {
        // Fallback for non-standard URLs: try basic regex cleanup
        return url.replace(/[-_]\d+x\d+(?=\.[a-zA-Z0-9]+$)/, '');
    }
  };

  const toKabumOriginalUrl = (url: string) => {
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

  const handleParse = async () => {
    setStatus("loading");
    setMessage("IA pensando... (0/0)");

    const products = parseProducts(text);
    if (products.length === 0) {
        setStatus("error");
        setMessage("Nenhum produto encontrado no texto.");
        return;
    }

    const total = products.length;
    let aiDone = 0;
    let processed = 0;

    const updateRow = (id: string, patch: any) => {
      setParsedProducts((prev) => prev.map((it: any) => (it.id === id ? { ...it, ...patch } : it)));
    };

    const dedupeUrls = (urls: string[]) => Array.from(new Set((urls || []).map((u) => String(u || "").trim()).filter(Boolean)));

    const initialRows = products.map((p) => {
      let optimizedImage = optimizeUrl(p.image);
      if (optimizedImage.includes("kabum.com.br") && optimizedImage.includes("images.kabum.com.br")) {
        optimizedImage = toKabumOriginalUrl(optimizedImage);
      }

      return {
        ...p,
        image: optimizedImage,
        image_urls: dedupeUrls([optimizedImage]),
        description: "",
        specs: {},
        imageValid: false,
        ai_status: "thinking",
      };
    });

    setParsedProducts(initialRows as any);
    setImportStep("preview");
    setMessage(`IA pensando... (0/${total})`);

    const tasks = initialRows.map(async (p: any) => {
      try {
        let imageUrls: string[] = Array.isArray(p.image_urls) ? p.image_urls : [];
        let description = "";
        let specs: any = {};

        if (p.product_url && p.product_url.includes("kabum.com.br")) {
          try {
            const scrapeRes = await fetch("/api/scrape/product", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: p.product_url }),
            });
            if (scrapeRes.ok) {
              const scrapeData = await scrapeRes.json();
              if (Array.isArray(scrapeData.images) && scrapeData.images.length > 0) imageUrls = scrapeData.images;
              if (scrapeData.description) description = scrapeData.description;
              if (scrapeData.specs) specs = scrapeData.specs;
            }
          } catch (e) {
            console.error("Failed to scrape details for", p.name, e);
          }
        }

        imageUrls = dedupeUrls(imageUrls);
        updateRow(p.id, { image_urls: imageUrls, specs });

        if (description) {
          try {
            const aiRes = await fetch("/api/ai/rewrite-description", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productName: p.name, rawText: description, specs }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              if (aiData?.markdown) {
                description = aiData.markdown;
                updateRow(p.id, { ai_status: "done", description });
              } else {
                updateRow(p.id, { ai_status: "error" });
              }
            } else {
              updateRow(p.id, { ai_status: "error" });
            }
          } catch (e) {
            console.error("IA rewrite falhou para", p.name, e);
            updateRow(p.id, { ai_status: "error" });
          } finally {
            aiDone += 1;
            setMessage(`IA pensando... (${aiDone}/${total})`);
          }
        } else {
          updateRow(p.id, { ai_status: "error" });
          aiDone += 1;
          setMessage(`IA pensando... (${aiDone}/${total})`);
        }

        const validImageUrls: string[] = [];
        for (const candidate of imageUrls) {
          if (validImageUrls.length >= 12) break;
          const ok = await validateImage(candidate);
          if (ok) validImageUrls.push(candidate);
        }

        const primaryImage = validImageUrls[0] || "";
        updateRow(p.id, {
          image: primaryImage || p.image,
          image_urls: validImageUrls.length > 0 ? validImageUrls : imageUrls,
          imageValid: !!primaryImage,
        });
      } finally {
        processed += 1;
      }
    });

    await Promise.allSettled(tasks);

    setParsedProducts((prev: any) => {
      const filtered = prev.filter((r: any) => r.imageValid && r.image);
      setMessage(`${filtered.length} produtos válidos encontrados.`);
      return filtered;
    });

    setStatus("idle");
  };

  const handleConfirmImport = async () => {
    setStatus("loading");
    try {
      const normalize = (s: unknown) =>
        String(s || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}+/gu, "")
          .trim();

      const slugify = (s: string) =>
        normalize(s)
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/^-+|-+$/g, "")
          .substring(0, 80);

      const previewProducts = getPreviewProducts();

      const finalProducts = previewProducts.map((p: any) => ({
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

      const uniqueCategoryNames = Array.from(
        new Set(finalProducts.map(p => String(p.category || "").trim()).filter(Boolean))
      );

      const existingCategoryMap = new Map<string, Category>();
      categories.forEach(c => {
        existingCategoryMap.set(normalize(c.name), c);
      });

      const categoriesToCreate = uniqueCategoryNames.filter(
        name => !existingCategoryMap.has(normalize(name))
      );

      if (categoriesToCreate.length > 0) {
        setMessage(`Criando ${categoriesToCreate.length} categoria(s) nova(s)...`);

        const createPromises = categoriesToCreate.map(async (catName) => {
          const slug = slugify(catName) || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: catName,
              slug,
              parent_id: null,
              display_order: 0,
              active: true,
              icon: null
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.warn(`Categoria "${catName}" não foi criada:`, errData);
            return null;
          }
          return res.json();
        });

        const results = await Promise.all(createPromises);
        const createdCount = results.filter(r => r !== null).length;

        await fetchCategories();

        setMessage(`${createdCount} categoria(s) criada(s). Salvando produtos...`);
      } else {
        setMessage("Salvando produtos...");
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalProducts }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar");
      }

      const appliedCatsSummary = uniqueCategoryNames.length > 0
        ? uniqueCategoryNames.join(", ")
        : selectedCategory;

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_count: finalProducts.length,
            price_percentage: priceAdjustment,
            applied_category: appliedCatsSummary,
            applied_scope: adjustmentScope
        })
      });

      const data = await res.json();
      setStatus("success");
      setMessage(`${data.count} produtos importados com sucesso!${categoriesToCreate.length > 0 ? ` (${categoriesToCreate.length} categoria(s) criada(s))` : ""}`);
      setText("");
      setParsedProducts([]);
      setImportStep("input");

      setPriceAdjustment(0);
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setMessage(`Erro ao importar: ${e.message || "Erro desconhecido"}`);
    }
  };

  const removePreviewImage = (productId: string, imageUrl: string) => {
    setParsedProducts((prev: any) =>
      prev.flatMap((it: any) => {
        if (String(it?.id) !== String(productId)) return [it];
        const currentUrls: string[] = Array.isArray(it?.image_urls) && it.image_urls.length > 0 ? it.image_urls : it?.image ? [String(it.image)] : [];
        const nextUrls = currentUrls.filter((u) => String(u || "").trim() && String(u) !== String(imageUrl));
        const nextPrimary = String(nextUrls[0] || "").trim();
        if (!nextPrimary) return [];
        return [{ ...it, image: nextPrimary, image_urls: nextUrls, imageValid: true }];
      })
    );
  };

  const categoryTree = buildCategoryTree(categories);
  const flatCategories: { name: string; level: number }[] = [];
  
  const flatten = (nodes: Category[], level = 0) => {
    nodes.forEach(node => {
        flatCategories.push({ name: node.name, level });
        if (node.children) flatten(node.children, level + 1);
    });
  };
  flatten(categoryTree);

  return (
    <div className="animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Upload className="text-[#E60012]" />
                Importação de Produtos
            </h2>
            {importStep === "preview" && (
                <button 
                    onClick={() => setImportStep("input")}
                    className="text-sm text-gray-500 hover:text-gray-800 underline"
                >
                    Voltar para edição
                </button>
            )}
        </div>

        {/* Status Messages */}
        {message && (
            <div className={`mb-6 p-4 rounded-md border flex items-center gap-3 ${status === "success" ? "bg-green-50 border-green-200 text-green-700" : status === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                {status === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                {message}
            </div>
        )}

        {importStep === "input" ? (
            <>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cole o bloco de texto dos produtos:
                    </label>
                    <textarea
                        className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-sm"
                        placeholder="Exemplo: imageCard src... https://... Nome do Produto R$ 100,00"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        O sistema extrai automaticamente: URL da imagem, Nome do produto e Preço (R$).
                    </p>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleParse}
                        disabled={!text.trim()}
                        className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        Processar Texto
                        <Search size={18} />
                    </button>
                </div>
            </>
        ) : (
            <>
                {/* Preview & Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoria Padrão (fallback p/ produtos sem 5ª coluna)</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                        >
                            {flatCategories.length > 0 ? (
                                flatCategories.map(c => (
                                    <option key={c.name} value={c.name}>
                                        {'\u00A0'.repeat(c.level * 4)}{c.name}
                                    </option>
                                ))
                            ) : (
                                CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))
                            )}
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">Produtos com categoria definida na 5ª coluna sobrescrevem esta opção.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ajuste de Preço (%)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={priceAdjustment}
                                onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                                className="w-full p-2 border rounded-md text-sm"
                                placeholder="0"
                            />
                            <span className="text-gray-500 text-sm">%</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Use valores negativos para desconto.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Aplicar Ajuste Em</label>
                        <select
                            value={adjustmentScope}
                            onChange={(e) => setAdjustmentScope(e.target.value as any)}
                            className="w-full p-2 border rounded-md text-sm mb-2"
                        >
                            <option value="all">Todos os produtos</option>
                            <option value="high_value">Preço acima de...</option>
                            <option value="low_value">Preço abaixo de...</option>
                        </select>
                        {adjustmentScope !== "all" && (
                            <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">R$</span>
                                    <input 
                                    type="number" 
                                    value={scopeThreshold}
                                    onChange={(e) => setScopeThreshold(Number(e.target.value))}
                                    className="w-full p-1 border rounded text-sm"
                                    />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Opções Extras</label>
                        <div className="flex items-center h-[38px]">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={migrateImages} 
                                    onChange={(e) => setMigrateImages(e.target.checked)}
                                    className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]"
                                />
                                <span className="text-sm text-gray-700 font-medium">
                                    Migrar imagens para Supabase
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}

                <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
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
                            {getPreviewProducts().map((p, idx) => (
                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 overflow-x-auto max-w-[150px] py-1">
                                            {p.image_urls && p.image_urls.length > 0 ? (
                                                p.image_urls.map((img: string, i: number) => (
                                                    <div key={i} className="w-10 h-10 relative flex-shrink-0">
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
                                                            className={`w-full h-full object-contain rounded border ${i === 0 ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                                            title={i === 0 ? "Capa" : `Foto ${i+1}`}
                                                        />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="w-10 h-10 relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => removePreviewImage(String((p as any).id), String(p.image))}
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                                                        title="Remover foto"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                    <img 
                                                        src={p.image} 
                                                        alt="" 
                                                        className="w-full h-full object-contain rounded border"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {p.image_urls && p.image_urls.length > 1 && (
                                            <span className="text-[10px] text-gray-400">{p.image_urls.length} fotos extraídas</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={p.name}>
                                        {p.name}
                                        <div className="flex gap-1 mt-1">
                                            {p.description && (
                                                <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Desc OK</span>
                                            )}
                                            {p.specs && Object.keys(p.specs).length > 0 && (
                                                <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Specs OK</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{p.originalPrice}</td>
                                    <td className="px-4 py-3 font-bold text-gray-900">
                                        {p.newPrice}
                                        {p.priceChange !== 0 && (
                                            <span className={`ml-2 text-xs ${p.priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                ({p.priceChange > 0 ? '+' : ''}{p.priceChange.toFixed(2)})
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
                                    <td className="px-4 py-3">
                                        {p.ai_status === "thinking" ? (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">IA pensando...</span>
                                        ) : p.ai_status === "error" ? (
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">IA falhou</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">IA OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setImportStep("input")}
                        className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirmImport}
                        disabled={status === "loading"}
                        className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {status === "loading" ? "Salvando..." : "Confirmar Importação"}
                        <Save size={18} />
                    </button>
                </div>
            </>
        )}
    </div>
  );
}
