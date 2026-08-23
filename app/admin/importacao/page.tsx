"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { parseProducts, Product, Category, buildCategoryTree, CATEGORIES } from "@/lib/utils";
import { Upload, CheckCircle, AlertCircle, Search, Save, X, Sparkles, Percent, Tag, Eye } from "lucide-react";

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Import State
  const [text, setText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "preview">("input");
  
  // Import Settings & Margem de Lucro (%)
  const [selectedCategoryMode, setSelectedCategoryMode] = useState<"keep" | "override">("keep");
  const [overrideCategory, setOverrideCategory] = useState("Hardware");
  const [priceAdjustment, setPriceAdjustment] = useState<number>(35); // Margem padrão de lucro (35%)
  const [adjustmentScope, setAdjustmentScope] = useState<"all" | "high_value" | "low_value">("all");
  const [scopeThreshold, setScopeThreshold] = useState<number>(1000);
  
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

  // Preview Logic with Price Margin Calculator
  const getPreviewProducts = () => {
    return parsedProducts.map((p: Product) => {
        let basePixPriceNum = parseFloat(
          p.price.replace(/R\$/gi, "").replace(/\./g, "").replace(",", ".").trim()
        );
        if (isNaN(basePixPriceNum) || basePixPriceNum <= 0) basePixPriceNum = 0;

        let applyAdjustment = false;
        if (adjustmentScope === "all") applyAdjustment = true;
        else if (adjustmentScope === "high_value" && basePixPriceNum >= scopeThreshold) applyAdjustment = true;
        else if (adjustmentScope === "low_value" && basePixPriceNum < scopeThreshold) applyAdjustment = true;

        let newPixPriceNum = basePixPriceNum;
        if (applyAdjustment && priceAdjustment !== 0) {
            newPixPriceNum = basePixPriceNum * (1 + priceAdjustment / 100);
        }

        // Preço no cartão de crédito (com 1% a mais por parcela ou 10% adicional sobre o à vista)
        const newCardPriceNum = newPixPriceNum * 1.10;
        const newInstallmentValue = newCardPriceNum / 10;

        const newPixFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPixPriceNum);
        const newCardFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newCardPriceNum);
        const newInstallmentStr = `10x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newInstallmentValue)}`;

        const finalCategory = selectedCategoryMode === "override" ? overrideCategory : (p.category || "Hardware");

        return {
            ...p,
            category: finalCategory,
            originalPrice: p.price,
            newPrice: newPixFormatted,
            newPriceCard: newCardFormatted,
            newInstallment: newInstallmentStr,
            priceChange: newPixPriceNum - basePixPriceNum
        };
    });
  };

  const handleParse = async () => {
    setStatus("loading");
    setMessage("Processando dados da planilha...");

    const products = parseProducts(text);
    if (products.length === 0) {
        setStatus("error");
        setMessage("Nenhum produto identificado no texto colado. Verifique as colunas e tente novamente.");
        return;
    }

    setParsedProducts(products);
    setImportStep("preview");
    setStatus("idle");
    setMessage(`${products.length} produtos carregados com sucesso! Revise os dados e defina a margem de lucro.`);
  };

  const handleConfirmImport = async () => {
    setStatus("loading");
    setMessage("Salvando produtos no banco de dados...");
    try {
      const previewList = getPreviewProducts();
      const finalProducts = previewList.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          price: p.newPrice, // Preço com margem aplicada
          price_card: p.newPriceCard,
          discount_pix: p.discount_pix || "10%",
          installment: p.newInstallment,
          brand: p.brand || "Balão da Informática",
          rating: p.rating || "5.0 ⭐",
          availability: p.availability || "Disponível",
          source_url: p.source_url || null,
          image: p.image || "/logo.png",
          image_urls: Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls : [p.image || "/logo.png"],
          product_url: p.product_url || `/product/${p.id}`,
          description: p.description || "",
          specs: p.specs || {},
          category: p.category || "Hardware",
          slug: p.slug || p.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
      }));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalProducts }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar produtos");
      }

      const data = await res.json();
      setStatus("success");
      setMessage(`🎉 ${finalProducts.length} produtos importados e publicados no site com sucesso!`);
      setText("");
      setParsedProducts([]);
      setImportStep("input");
    } catch (e: any) {
      console.error("Erro ao importar:", e);
      setStatus("error");
      setMessage(`Erro ao importar: ${e.message || "Erro desconhecido"}`);
    }
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

  const previewItems = getPreviewProducts();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-3">
                  <Upload className="text-[#E60012]" size={30} />
                  Importação Rápida de Produtos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Importe produtos em lote via TSV/Planilha com fotos Ultra HD, preços PIX/Cartão, marcas e controle de margem de lucro.
              </p>
            </div>

            {importStep === "preview" && (
                <button 
                    onClick={() => setImportStep("input")}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition"
                >
                    ← Voltar para Área de Texto
                </button>
            )}
        </div>

        {/* Status Messages */}
        {message && (
            <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold shadow-sm ${status === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800" : status === "error" ? "bg-red-50 border-red-300 text-red-800" : "bg-blue-50 border-blue-300 text-blue-800"}`}>
                {status === "success" ? <CheckCircle size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-red-600" />}
                <span>{message}</span>
            </div>
        )}

        {importStep === "input" ? (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Cole as linhas da planilha / TSV:
                      </label>
                      <span className="text-xs font-bold text-[#E60012] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        14 Colunas Oficiais Suportadas
                      </span>
                    </div>

                    <textarea
                        className="w-full h-80 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-xs sm:text-sm leading-relaxed"
                        placeholder="Cole aqui as linhas copiadas da sua planilha ou tabela...
Formato: ID | TÍTULO | PREÇO À VISTA | PREÇO PARCELADO | DESCONTO | PARCELAMENTO | CATEGORIA | MARCA | DISPONIBILIDADE | AVALIAÇÃO | LINK BALÃO | LINK ORIGEM | LINK FOTO ULTRA HD | DESCRIÇÃO"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                        <p className="font-bold text-slate-800">📌 Estrutura e Tratamento Automático:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><strong>Imagens Ultra HD:</strong> Converte e preserva fotos em resolução máxima (1500px).</li>
                          <li><strong>Sanitização de Marca:</strong> Substitui automaticamente nomes de concorrentes por <em>Balão.info</em>.</li>
                          <li><strong>Preços e Parcelamento:</strong> Você poderá aplicar margem de lucro de 33% a 99% antes de salvar no site.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleParse}
                        disabled={!text.trim() || status === "loading"}
                        className="bg-[#E60012] hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/20 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
                    >
                        <span>Processar Produtos</span>
                        <Search size={18} />
                    </button>
                </div>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Margem de Lucro e Configurações */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    {/* 1. Margem de Lucro */}
                    <div>
                        <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <Percent size={15} className="text-[#E60012]" />
                            Margem de Lucro Adicional (%)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={priceAdjustment}
                                onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-xl text-base font-bold text-gray-900 focus:ring-2 focus:ring-[#E60012]"
                                placeholder="35"
                            />
                            <span className="font-black text-gray-700 text-lg">%</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[33, 50, 75, 99].map(pct => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setPriceAdjustment(pct)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${priceAdjustment === pct ? "bg-[#E60012] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                              +{pct}%
                            </button>
                          ))}
                        </div>
                    </div>

                    {/* 2. Categoria */}
                    <div>
                        <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                            <Tag size={15} className="text-[#E60012]" />
                            Tratamento de Categoria
                        </label>
                        <select
                            value={selectedCategoryMode}
                            onChange={(e) => setSelectedCategoryMode(e.target.value as any)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold mb-2 bg-white"
                        >
                            <option value="keep">Manter Categoria Original da Planilha</option>
                            <option value="override">Definir Nova Categoria para Todos</option>
                        </select>

                        {selectedCategoryMode === "override" && (
                          <select
                              value={overrideCategory}
                              onChange={(e) => setOverrideCategory(e.target.value)}
                              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white"
                          >
                              {flatCategories.map(c => (
                                  <option key={c.name} value={c.name}>
                                      {'\u00A0'.repeat(c.level * 4)}{c.name}
                                  </option>
                              ))}
                          </select>
                        )}
                    </div>

                    {/* 3. Escopo de Aplicação */}
                    <div>
                        <label className="block text-xs font-black text-gray-800 mb-2 uppercase tracking-wide">
                            Aplicar Margem Em:
                        </label>
                        <select
                            value={adjustmentScope}
                            onChange={(e) => setAdjustmentScope(e.target.value as any)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold mb-2 bg-white"
                        >
                            <option value="all">Todos os produtos ({previewItems.length})</option>
                            <option value="high_value">Apenas produtos com preço acima de...</option>
                            <option value="low_value">Apenas produtos com preço abaixo de...</option>
                        </select>
                        {adjustmentScope !== "all" && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500">R$</span>
                                <input 
                                  type="number" 
                                  value={scopeThreshold}
                                  onChange={(e) => setScopeThreshold(Number(e.target.value))}
                                  className="w-full p-2 border border-gray-300 rounded-xl text-sm"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabela de Preview dos Produtos */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                            <Eye size={18} className="text-[#E60012]" />
                            Preview de Importação ({previewItems.length} Produtos)
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Valores calculados com margem de +{priceAdjustment}%.
                          </p>
                        </div>

                        <button
                            onClick={handleConfirmImport}
                            disabled={status === "loading" || previewItems.length === 0}
                            className="bg-[#E60012] hover:bg-red-700 text-white px-6 py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>Confirmar e Salvar no Site</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0 z-10 border-b border-slate-300">
                                <tr>
                                    <th className="p-3">Foto Ultra HD</th>
                                    <th className="p-3">ID / Código</th>
                                    <th className="p-3 min-w-[240px]">Título Oficial</th>
                                    <th className="p-3">Marca</th>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3">Preço PIX (Site)</th>
                                    <th className="p-3">Cartão / Parcelamento</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {previewItems.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-3">
                                            <div className="relative w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                                                <Image
                                                    src={product.image || "/logo.png"}
                                                    alt={product.name}
                                                    fill
                                                    sizes="56px"
                                                    className="object-contain p-0.5"
                                                    unoptimized
                                                />
                                            </div>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-gray-600">
                                            {product.id}
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900 line-clamp-2">
                                                {product.name}
                                            </div>
                                            {product.description && (
                                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                                {product.description}
                                              </p>
                                            )}
                                        </td>
                                        <td className="p-3 font-semibold text-gray-700">
                                            {product.brand || "Balão"}
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                                              {product.category}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-black text-sm text-[#E60012]">
                                                {product.newPrice}
                                            </div>
                                            <div className="text-[10px] text-gray-500 line-through">
                                                Orig: {product.originalPrice}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900">
                                                {product.newPriceCard}
                                            </div>
                                            <div className="text-[10px] font-semibold text-emerald-700">
                                                {product.newInstallment}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                                {product.availability || "Disponível"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleConfirmImport}
                        disabled={status === "loading" || previewItems.length === 0}
                        className="bg-[#E60012] hover:bg-red-700 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl shadow-red-950/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>Confirmar e Salvar {previewItems.length} Produtos no Site</span>
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}
