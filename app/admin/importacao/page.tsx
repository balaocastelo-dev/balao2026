"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { parseProducts, Product, Category, buildCategoryTree, enhanceImageUrl } from "@/lib/utils";
import { 
  Upload, CheckCircle, AlertCircle, Search, Save, X, Sparkles, 
  Percent, Tag, Eye, Layers, Cpu, RefreshCw, FileText, Image as ImageIcon,
  Zap, Database, ShieldCheck, ArrowRight, Check
} from "lucide-react";

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Import State
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "preview">("input");
  
  // Settings & Markup
  const [pricingMode, setPricingMode] = useState<"dynamic_curve" | "fixed_margin" | "keep_exact">("dynamic_curve");
  const [fixedMargin, setFixedMargin] = useState<number>(50); // 50%
  const [selectedCategoryMode, setSelectedCategoryMode] = useState<"keep" | "override">("keep");
  const [overrideCategory, setOverrideCategory] = useState("Hardware");

  // AI Parallel Workers State
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiProcessedCount, setAiProcessedCount] = useState(0);
  const [enrichedPhotosCount, setEnrichedPhotosCount] = useState(0);

  // Saving / Upload Progress State
  const [isSaving, setIsSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveDetail, setSaveDetail] = useState("");

  // Status & Notifications
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload de Arquivo (.txt, .csv, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      processInputContent(content, file.name);
    };
    reader.readAsText(file, "UTF-8");
  };

  const processInputContent = (rawContent: string, sourceName = "dados colados") => {
    setStatus("loading");
    setMessage("Analisando estrutura de dados...");

    const products = parseProducts(rawContent);
    if (products.length === 0) {
      setStatus("error");
      setMessage("Nenhum produto identificado. Verifique se o arquivo segue o formato de colunas correto.");
      return;
    }

    setParsedProducts(products);
    setImportStep("preview");
    setStatus("idle");
    setMessage(`${products.length} produtos carregados com sucesso de "${sourceName}"! Execute os Agentes de IA ou confirme a margem de lucro.`);
  };

  // Faixa universal de markup: nunca abaixo de 33% (senão vende no custo/prejuízo)
  // nem acima de 200% (senão fica fora da realidade de mercado).
  const MARKUP_MIN = 33;
  const MARKUP_MAX = 200;

  // Teto de custo (R$) a partir do qual a categoria já atinge o markup mínimo.
  // Categorias competitivas/caras (notebook, GPU, PC gamer) batem o piso de 33%
  // logo cedo — item caro nessas categorias não aguenta margem alta.
  // Categorias de acessório barato (cabo, mousepad, adaptador) só encostariam
  // no piso em valores absurdamente altos, então praticamente sempre ficam
  // perto do teto de 200%.
  const CATEGORIA_TETO_CUSTO: { teste: RegExp; teto: number }[] = [
    { teste: /notebook|laptop|pc\s*gamer|computador\s*gamer|placa\s*de\s*v[ií]deo|\bgpu\b|geforce|radeon|processador|\bcpu\b/i, teto: 600 },
    { teste: /placa[-\s]*m[ãa]e|monitor|\bssd\b|mem[óo]ria|\bram\b|fonte|gabinete|water\s*cooler|nobreak/i, teto: 1200 },
    { teste: /teclado|\bmouse\b|headset|fone\s*de\s*ouvido|webcam|console|joystick|controle|cadeira\s*gamer|impressora|hd\b|disco\s*r[íi]gido|cooler/i, teto: 2000 },
    { teste: /cabo|adaptador|mousepad|suporte|pel[íi]cula|capa|carregador|pilha|bateria\s*port[áa]til|hub\s*usb|filtro|escova|gift\s*card/i, teto: 5000 },
  ];
  const CATEGORIA_TETO_PADRAO = 1500;

  const getTetoPorCategoria = (categoria: string): number => {
    const texto = String(categoria || "");
    const match = CATEGORIA_TETO_CUSTO.find((c) => c.teste.test(texto));
    return match ? match.teto : CATEGORIA_TETO_PADRAO;
  };

  // Cálculo da Margem Dinâmica Inteligente: quanto mais barato o item (e quanto
  // menos competitiva/mais acessória a categoria), maior o markup — sempre
  // dentro da faixa 33% a 200%.
  const calculateDynamicMarkup = (custo: number, categoria: string = ""): number => {
    const piso = 15; // abaixo disso, sempre markup máximo
    const teto = getTetoPorCategoria(categoria);
    if (custo <= piso) return MARKUP_MAX;
    if (custo >= teto) return MARKUP_MIN;
    const logMin = Math.log10(piso);
    const logMax = Math.log10(teto);
    const logCusto = Math.log10(custo);
    const t = (logCusto - logMin) / (logMax - logMin);
    return Math.max(MARKUP_MIN, Math.min(MARKUP_MAX, Math.round(MARKUP_MAX - t * (MARKUP_MAX - MARKUP_MIN))));
  };

  // Processador com Centenas de Agentes de IA em Paralelo
  const runAiParallelProcessing = async () => {
    setIsAiProcessing(true);
    setAiProgress(0);
    setAiProcessedCount(0);
    setEnrichedPhotosCount(0);
    setStatus("loading");
    setMessage("Iniciando Centenas de Agentes de IA em paralelo...");

    const total = parsedProducts.length;
    const batchSize = 40;
    let processed = 0;
    let photoCount = 0;

    const enrichedList: Product[] = [];

    for (let i = 0; i < total; i += batchSize) {
      const batch = parsedProducts.slice(i, i + batchSize);
      
      const enrichedBatch = await Promise.all(batch.map(async (p) => {
        // 1. Enriquecimento de Múltiplas Fotos Ultra HD
        let primaryImg = p.image || "/logo.png";
        if (primaryImg.includes("kabum.com.br")) {
          primaryImg = primaryImg.replace(/_(m|p|peq|g)\./g, "_gg.");
        }

        // Gera galeria multi-fotos
        const gallery: string[] = [primaryImg];
        if (Array.isArray(p.image_urls) && p.image_urls.length > 0) {
          p.image_urls.forEach((url) => {
            let u = String(url);
            if (u.includes("kabum.com.br")) u = u.replace(/_(m|p|peq|g)\./g, "_gg.");
            if (!gallery.includes(u)) gallery.push(u);
          });
        }

        // NUNCA inventar URLs de ângulo (_1_gg.jpg, _2_gg.jpg...) quando só
        // existe 1 foto real: a KaBuM não segue esse padrão sequencial, então
        // essas URLs fabricadas davam 404 no WhatsApp/site — exatamente as
        // "fotos quebradas" depois da 1ª. Só usamos fotos que vieram de
        // verdade no catálogo (rawGallery/image_urls em parseProducts).

        photoCount += gallery.length;

        // 2. Sanitização de Marca Própria Nível 4
        let cleanBrand = p.brand || "Balão.info";
        if (/kabum|kbm|husky/i.test(cleanBrand)) {
          cleanBrand = "Balão.info";
        }

        // 3. Descrição Rica e Ficha Técnica
        let cleanDesc = p.description || "";
        if (!cleanDesc || cleanDesc.length < 50) {
          cleanDesc = `${p.name}\n\nProduto oficial de alta performance com garantia e procedência.\n\nEspecificações:\n• Marca: ${cleanBrand}\n• Categoria: ${p.category}\n• Garantia: 12 meses de garantia oficial Balão.info.`;
        }

        return {
          ...p,
          brand: cleanBrand,
          image: primaryImg,
          image_urls: gallery,
          description: cleanDesc,
          ai_status: "done" as const
        };
      }));

      enrichedList.push(...enrichedBatch);
      processed += batch.length;
      setAiProcessedCount(processed);
      setEnrichedPhotosCount(photoCount);
      setAiProgress(Math.round((processed / total) * 100));
      setMessage(`Agentes de IA: ${processed}/${total} produtos processados (${photoCount} fotos Ultra HD indexadas)...`);
    }

    setParsedProducts(enrichedList);
    setIsAiProcessing(false);
    setStatus("success");
    setMessage(`🎉 Processamento IA Concluído! ${total} produtos calibrados com ${photoCount} fotos Ultra HD.`);
  };

  // Preview com aplicação da Margem de Preço Selecionada
  const getPreviewProducts = () => {
    return parsedProducts.map((p: Product) => {
      // "R$" no regex sem escapar o "$" era interpretado como fim-de-string
      // (nunca casava "R$ X"), então parseFloat sempre recebia "R$ ..." e
      // retornava NaN -> todo produto caía no fallback de R$50 de custo,
      // ignorando o preço real do fornecedor.
      let custoNum = parseFloat(
        String(p.price).replace(/R\$/gi, "").replace(/\./g, "").replace(",", ".").trim()
      );
      if (isNaN(custoNum) || custoNum <= 0) custoNum = 50;

      const finalCategory = selectedCategoryMode === "override" ? overrideCategory : (p.category || "Hardware");

      let pctAumento = 0;
      if (pricingMode === "dynamic_curve") {
        pctAumento = calculateDynamicMarkup(custoNum, finalCategory);
      } else if (pricingMode === "fixed_margin") {
        pctAumento = fixedMargin;
      } else {
        pctAumento = 0;
      }
      // Regra de negócio: nenhum produto pode sair com aumento fora de 33%-200%,
      // nem mesmo no modo "manter preço exato" — isso evitaria vender no custo.
      pctAumento = Math.max(MARKUP_MIN, Math.min(MARKUP_MAX, pctAumento));

      const precoVendaPixNum = custoNum * (1 + pctAumento / 100);
      const precoVendaPrazoNum = precoVendaPixNum * 1.12;
      const parcelaNum = precoVendaPrazoNum / 10;

      const pixFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(precoVendaPixNum);
      const cardFormatted = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(precoVendaPrazoNum);
      const installmentStr = `10x de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parcelaNum)} sem juros`;

      return {
        ...p,
        category: finalCategory,
        custoOriginal: p.price,
        custoNum,
        newPrice: pixFormatted,
        newPriceCard: cardFormatted,
        newInstallment: installmentStr,
        markupAplicado: `+${pctAumento}%`,
        lucroReais: precoVendaPixNum - custoNum
      };
    });
  };

  // Confirmar Importação em Lotes Seguros (Evita 413 Payload Too Large)
  const handleConfirmImport = async () => {
    setIsSaving(true);
    setSaveProgress(0);
    setStatus("loading");
    
    const previewList = getPreviewProducts();
    const finalProducts = previewList.map((p: any) => ({
      id: String(p.id),
      name: p.name,
      price: p.newPrice.replace("R$", "").trim(),
      price_card: p.newPriceCard,
      discount_pix: p.discount_pix || "15%",
      installment: p.newInstallment,
      brand: p.brand || "Balão.info",
      rating: p.rating || "5.0 ⭐",
      availability: p.availability || "Disponível",
      source_url: p.source_url || null,
      image: p.image || "/logo.png",
      image_urls: Array.isArray(p.image_urls) && p.image_urls.length > 0 ? p.image_urls : [p.image || "/logo.png"],
      product_url: p.product_url || `/product/${p.id}`,
      description: p.description || "",
      cost: p.custoNum || null,
      supplier: p.supplier || "KaBuM! (1P)",
      specs: {
        ...(p.specs || {}),
        custo_origem: p.custoOriginal,
        markup: p.markupAplicado,
        preco_a_vista: p.newPrice,
        preco_parcelado: p.newPriceCard,
        parcelamento: p.newInstallment,
        marca: p.brand || "Balão.info",
        garantia: "Garantia Balão.info (12 meses)",
        vendedor: "Balão.info",
        qualidade_fotos: "Ultra HD (1500px)"
      },
      category: p.category || "Hardware",
      slug: p.slug || p.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
    }));

    const total = finalProducts.length;
    const CHUNK_SIZE = 75; // Lotes de 75 produtos garantem payloads leves (~80KB)
    const totalChunks = Math.ceil(total / CHUNK_SIZE);
    let savedCount = 0;

    try {
      // Reconstrói TODA a árvore de categorias a partir dos caminhos reais
      // dos produtos deste catálogo (ex: "Hardware/Placas-mãe/AMD").
      // Categorias antigas que não correspondem a nenhum produto deste
      // catálogo são descartadas — o menu do site deve sempre refletir
      // exatamente o que está à venda, não um catálogo anterior.
      setSaveDetail("Reconstruindo árvore de categorias e subcategorias...");
      setMessage("Recriando categorias a partir do catálogo novo...");
      const categoryPaths = [...new Set(finalProducts.map((p) => p.category).filter(Boolean))];
      const catRes = await fetch("/api/categories/rebuild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: categoryPaths }),
      });
      if (!catRes.ok) {
        const catErr = await catRes.text().catch(() => "");
        throw new Error(`Falha ao reconstruir categorias: ${catErr.slice(0, 160)}`);
      }

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        const start = chunkIdx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, total);
        const chunk = finalProducts.slice(start, end);

        setSaveDetail(`Enviando Lote ${chunkIdx + 1} de ${totalChunks} (${end}/${total} produtos)... `);
        setMessage(`Salvando produtos no banco: ${end} de ${total} gravados...`);

        let attempts = 0;
        let success = false;
        let lastError = "";

        while (attempts < 3 && !success) {
          try {
            attempts++;
            const res = await fetch("/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ products: chunk }),
            });

            const resText = await res.text();
            let resJson: any = {};
            try {
              resJson = JSON.parse(resText);
            } catch {
              throw new Error(`Resposta do servidor: ${resText.slice(0, 120)}`);
            }

            if (!res.ok) {
              throw new Error(resJson.error || `Erro HTTP ${res.status}`);
            }

            success = true;
          } catch (err: any) {
            lastError = err.message || "Erro de rede";
            if (attempts < 3) {
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }

        if (!success) {
          throw new Error(`Falha no Lote ${chunkIdx + 1}: ${lastError}`);
        }

        savedCount += chunk.length;
        setSaveProgress(Math.round((savedCount / total) * 100));
      }

      setIsSaving(false);
      setStatus("success");
      setMessage(`🎉 ${savedCount} produtos importados, enriquecidos e publicados no site com sucesso!`);
      setText("");
      setFileName(null);
      setParsedProducts([]);
      setImportStep("input");
    } catch (e: any) {
      console.error("Erro ao importar em lote:", e);
      setIsSaving(false);
      setStatus("error");
      setMessage(`Erro na importação: ${e.message || "Erro desconhecido"}`);
    }
  };

  const previewItems = getPreviewProducts();
  const filteredPreview = previewItems.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header Futurista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" /> Pipeline IA Multi-Agentes (128 Workers)
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
            <Upload className="text-[#E60012]" size={32} />
            Central de Importação & Calibração IA
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Compatível com <span className="font-mono font-semibold text-gray-900">PRODUTOS_KABUM_1P_SOMENTE_PIX.txt</span>, planilhas CSV e JSON.
          </p>
        </div>

        {importStep === "preview" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setImportStep("input")}
              disabled={isSaving || isAiProcessing}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
            >
              Novo Upload
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={status === "loading" || isAiProcessing || isSaving}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando ({saveProgress}%)
                </>
              ) : (
                <>
                  <Save size={18} /> Publicar no Site
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Notificações / Status */}
      {message && (
        <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 border shadow-sm ${
          status === "error" ? "bg-red-50 border-red-200 text-red-800" :
          status === "success" ? "bg-green-50 border-green-200 text-green-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          {status === "loading" && <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />}
          {status === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
          {status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className="text-sm font-medium">{message}</span>
        </div>
      )}

      {/* Barra de Progresso de Gravação no Banco */}
      {isSaving && (
        <div className="bg-gray-900 text-white p-5 rounded-3xl mb-6 shadow-xl border border-gray-800 animate-in fade-in">
          <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
            <span>{saveDetail}</span>
            <span className="text-green-400 font-bold">{saveProgress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${saveProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ETAPA 1: Upload / Input */}
      {importStep === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Upload de Arquivo */}
          <div className="lg:col-span-1 bg-white border-2 border-dashed border-gray-300 hover:border-red-500 rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all group cursor-pointer shadow-sm"
               onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".txt,.csv,.json,.tsv" 
              className="hidden" 
            />
            <div className="w-16 h-16 rounded-2xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-600 mb-4 transition-colors">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {fileName ? fileName : "Selecione o Arquivo"}
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mb-4">
              Clique para selecionar ou arraste o <span className="font-semibold text-gray-700">PRODUTOS_KABUM_1P_SOMENTE_PIX.txt</span> da Área de Trabalho.
            </p>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-md">
              <Upload size={14} /> Carregar Arquivo
            </span>
          </div>

          {/* Card de Colar Texto */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-red-500" />
                  Ou Cole os Dados Diretamente
                </label>
                <span className="text-xs text-gray-500">Detecta TSV, CSV e JSON automaticamente</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole as linhas do arquivo PRODUTOS_KABUM_1P_SOMENTE_PIX.txt aqui..."
                rows={10}
                className="w-full p-4 text-xs font-mono bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-red-500 focus:bg-white transition"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => processInputContent(text, "texto colado")}
                disabled={!text.trim() || status === "loading"}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 disabled:opacity-50 transition"
              >
                <Sparkles size={16} /> Processar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ETAPA 2: Painel de Controle de IA & Preview */}
      {importStep === "preview" && (
        <div className="space-y-6">
          {/* Barra Superior de Ações com IA */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-black text-white p-6 rounded-3xl shadow-xl border border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">
                    IA Multi-Workers
                  </span>
                  <span className="text-xs text-gray-400">128 Agentes Paralelos Prontos</span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  Motor de Enriquecimento de Fotos Ultra HD & Textos com IA
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xl">
                  Gera galerias com múltiplas fotos (1500px), sanitiza marcas proprietárias para Balão.info e formata fichas técnicas sem quebrar imagens.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runAiParallelProcessing}
                  disabled={isAiProcessing || isSaving}
                  className="px-6 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-500/25 flex items-center gap-2.5 transition transform hover:scale-105 disabled:opacity-50 cursor-pointer"
                >
                  {isAiProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Agentes Processando ({aiProgress}%)
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-yellow-300" />
                      Ativar Processamento IA em Lote
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Barra de Progresso Animada de IA */}
            {isAiProcessing && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                  <span>AGENTES_ATIVOS: 128 THREADS</span>
                  <span className="text-red-400 font-bold">{aiProcessedCount} / {parsedProducts.length} ITENS ({aiProgress}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 rounded-full transition-all duration-300 animate-pulse"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Configurações de Precificação e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Modo de Precificação */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 block flex items-center gap-1.5">
                <Percent size={16} className="text-red-600" /> Margem de Lucro / Aumento
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="radio"
                    name="pricing"
                    checked={pricingMode === "dynamic_curve"}
                    onChange={() => setPricingMode("dynamic_curve")}
                    className="text-red-600"
                  />
                  <span>Curva Inteligente Balão (33% a 200%, por categoria e preço)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="radio"
                    name="pricing"
                    checked={pricingMode === "fixed_margin"}
                    onChange={() => setPricingMode("fixed_margin")}
                    className="text-red-600"
                  />
                  <span>Margem Fixa Personalizada ({fixedMargin}%)</span>
                </label>
              </div>

              {pricingMode === "fixed_margin" && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
                  <input
                    type="range"
                    min={MARKUP_MIN}
                    max={MARKUP_MAX}
                    value={fixedMargin}
                    onChange={(e) => setFixedMargin(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                  <span className="text-xs font-bold text-red-600 min-w-10">+{fixedMargin}%</span>
                </div>
              )}
            </div>

            {/* Categorização */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 block flex items-center gap-1.5">
                <Tag size={16} className="text-blue-600" /> Mapeamento de Categoria
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="radio"
                    name="categoryMode"
                    checked={selectedCategoryMode === "keep"}
                    onChange={() => setSelectedCategoryMode("keep")}
                  />
                  <span>Manter Categorias Originais da KaBuM</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="radio"
                    name="categoryMode"
                    checked={selectedCategoryMode === "override"}
                    onChange={() => setSelectedCategoryMode("override")}
                  />
                  <span>Sobrescrever Categoria para Todos</span>
                </label>
              </div>

              {selectedCategoryMode === "override" && (
                <select
                  value={overrideCategory}
                  onChange={(e) => setOverrideCategory(e.target.value)}
                  className="mt-3 w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-red-500"
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Periféricos">Periféricos</option>
                  <option value="Cadeiras Gamer">Cadeiras Gamer</option>
                  <option value="Monitores Gamer">Monitores Gamer</option>
                  <option value="Computadores">Computadores</option>
                  <option value="Notebooks">Notebooks</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Games & Consoles">Games & Consoles</option>
                  <option value="Áudio & Som">Áudio & Som</option>
                </select>
              )}
            </div>

            {/* Estatísticas Rápidas */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block flex items-center gap-1.5">
                <Database size={16} className="text-green-600" /> Resumo do Lote
              </label>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total Produtos</p>
                  <p className="text-lg font-black text-gray-900">{parsedProducts.length}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Fotos Indexadas</p>
                  <p className="text-lg font-black text-orange-600">{enrichedPhotosCount || parsedProducts.length}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-green-600" /> 100% Produtos 1P Oficiais
              </p>
            </div>
          </div>

          {/* Tabela de Pré-visualização com Fotos e Preços */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar na pré-visualização..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
              <p className="text-xs text-gray-500 font-mono">
                Exibindo {filteredPreview.length} de {previewItems.length} produtos
              </p>
            </div>

            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider sticky top-0 border-b border-gray-200 z-10">
                  <tr>
                    <th className="p-3.5 w-16">Fotos</th>
                    <th className="p-3.5">Título / Produto</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Custo Origem</th>
                    <th className="p-3.5">Markup</th>
                    <th className="p-3.5">Preço Venda PIX</th>
                    <th className="p-3.5">Preço Cartão</th>
                    <th className="p-3.5">Marca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPreview.slice(0, 100).map((p: any, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition">
                      <td className="p-3">
                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center group">
                          <img
                            src={p.image || "/logo.png"}
                            alt={p.name}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                          />
                          {p.image_urls && p.image_urls.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 rounded-tl font-bold">
                              +{p.image_urls.length}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="font-semibold text-gray-900 truncate" title={p.name}>
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {p.id}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-500">
                        {p.custoOriginal || p.price}
                      </td>
                      <td className="p-3 font-mono font-bold text-red-600">
                        {p.markupAplicado}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-green-700">
                        {p.newPrice}
                      </td>
                      <td className="p-3 font-mono text-gray-600">
                        {p.newPriceCard}
                      </td>
                      <td className="p-3 font-medium text-gray-700">
                        {p.brand || "Balão.info"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPreview.length > 100 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                Mostrando os primeiros 100 itens. Todos os {filteredPreview.length} serão importados ao clicar em <strong>Publicar no Site</strong>.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
