"use client";

import { useState, useEffect } from "react";
import { parseProducts, Product, Category, buildCategoryTree, CATEGORIES } from "@/lib/utils";
import { Upload, CheckCircle, AlertCircle, Search, Save } from "lucide-react";

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [text, setText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "preview">("input");

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

  const getPreviewProducts = () => {
    return parsedProducts.map((p: Product) => {
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

      const newPriceFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        newPriceNum
      );

      return {
        ...p,
        category: selectedCategory,
        originalPrice: p.price,
        newPrice: newPriceFormatted,
        priceChange: newPriceNum - priceNum,
      };
    });
  };

  const optimizeUrl = (url: string) => {
    try {
      const u = new URL(url);

      const paramsToRemove = [
        "w",
        "h",
        "width",
        "height",
        "size",
        "resize",
        "format",
        "quality",
        "fit",
        "crop",
        "dpr",
        "auto",
        "v",
      ];
      paramsToRemove.forEach((p) => u.searchParams.delete(p));

      let path = u.pathname;

      if (/\/s\d+(-c)?\//.test(path)) {
        path = path.replace(/\/s\d+(-c)?\//, "/s0/");
      }

      const sizePattern = /[-_](?:\d+x\d+|thumb|thumbnail|small|medium|large|mini)(?=\.[a-zA-Z0-9]+$)/i;
      if (sizePattern.test(path)) {
        path = path.replace(sizePattern, "");
      }

      u.pathname = path;
      return u.toString();
    } catch {
      return url.replace(/[-_]\d+x\d+(?=\.[a-zA-Z0-9]+$)/, "");
    }
  };

  const handleParse = async () => {
    setStatus("loading");
    setMessage("Buscando imagens do KaBuM (original.jpg) com importação paralela...");

    const products = parseProducts(text);
    if (products.length === 0) {
      setStatus("error");
      setMessage("Nenhum produto encontrado no texto.");
      return;
    }

    const kabumUrls = products.map((p) => p.product_url).filter((u): u is string => Boolean(u && u.includes("kabum.com.br")));

    const scrapeMap = new Map<string, string[]>();
    if (kabumUrls.length > 0) {
      try {
        const scrapeRes = await fetch("/api/scrape/products-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: kabumUrls,
            concurrency: 12,
            headConcurrency: 30,
            imageLimit: 6,
          }),
        });
        if (scrapeRes.ok) {
          const scrapeData = await scrapeRes.json();
          if (scrapeData?.success && Array.isArray(scrapeData.results)) {
            for (const r of scrapeData.results) {
              if (r?.url && Array.isArray(r.images)) {
                scrapeMap.set(r.url, r.images);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to batch scrape Kabum images", e);
      }
    }

    const withImages = products.map((p) => {
      const imageUrls = p.product_url ? scrapeMap.get(p.product_url) || [] : [];
      const mainImage = imageUrls[0] || (p.image ? optimizeUrl(p.image) : "");
      return { ...p, image: mainImage, image_urls: imageUrls, imageValid: Boolean(mainImage) };
    });

    const validProducts = withImages.filter((r) => r.imageValid && r.image);

    setParsedProducts(validProducts);
    setImportStep("preview");
    setStatus("idle");

    if (validProducts.length < withImages.length) {
      setMessage(
        `${validProducts.length} produtos válidos encontrados. (${withImages.length - validProducts.length} removidos por imagem ausente).`
      );
    } else {
      setMessage(`${validProducts.length} produtos encontrados com sucesso.`);
    }
  };

  const handleConfirmImport = async () => {
    setStatus("loading");
    try {
      const finalProducts = getPreviewProducts().map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.newPrice,
        image: p.image,
        category: p.category,
        slug: p.slug,
      }));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalProducts }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar");
      }

      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_count: finalProducts.length,
          price_percentage: priceAdjustment,
          applied_category: selectedCategory,
          applied_scope: adjustmentScope,
        }),
      });

      const data = await res.json();
      setStatus("success");
      setMessage(`${data.count} produtos importados com sucesso!`);
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

  const categoryTree = buildCategoryTree(categories);
  const flatCategories: { name: string; level: number }[] = [];

  const flatten = (nodes: Category[], level = 0) => {
    nodes.forEach((node) => {
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
          <button onClick={() => setImportStep("input")} className="text-sm text-gray-500 hover:text-gray-800 underline">
            Voltar para edição
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md border flex items-center gap-3 ${
            status === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : status === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          {status === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message}
        </div>
      )}

      {importStep === "input" ? (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cole o bloco de texto dos produtos:</label>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-sm"
              placeholder={`Exemplo (TAB entre colunas):\nhttps://www.kabum.com.br/produto/895040\tFonte Cooler Master MWE Gold 850 V3...\t499,99\nhttps://www.kabum.com.br/produto/516056\tFonte Corsair CX Series CX650...\t359,79`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              Formato: URL do produto (KaBuM) + Nome + Preço. As imagens são buscadas automaticamente como original.jpg.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoria Destino</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                {flatCategories.length > 0 ? (
                  flatCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {"\u00A0".repeat(c.level * 4)}{c.name}
                    </option>
                  ))
                ) : (
                  CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
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
                  <span className="text-sm text-gray-700 font-medium">Migrar imagens para Supabase</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Imagem</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Preço Original</th>
                  <th className="px-4 py-3">Novo Preço</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {getPreviewProducts().map((p, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 relative">
                        <img src={p.image} alt="" className="w-full h-full object-contain rounded border" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="px-4 py-3">{p.originalPrice}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {p.newPrice}
                      {p.priceChange !== 0 && (
                        <span className={`ml-2 text-xs ${p.priceChange > 0 ? "text-red-500" : "text-green-500"}`}>
                          ({p.priceChange > 0 ? "+" : ""}{p.priceChange.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Pronto</span>
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
