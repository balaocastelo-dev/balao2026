"use client";

import { useState, useMemo, useEffect } from "react";
import { Product } from "@/lib/utils";
import Image from "next/image";
import { 
  Cpu, 
  CircuitBoard, 
  MemoryStick, 
  HardDrive, 
  Monitor, 
  Mouse, 
  Keyboard, 
  Zap, 
  Box, 
  Check, 
  Search, 
  Trash2, 
  ShoppingCart,
  ChevronRight,
  AlertCircle,
  Share2,
  X,
  Plus,
  Bot,
  Sparkles,
  Info
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface PCBuilderProps {
  products: Product[];
}

type ComponentType = 
  | "processor" 
  | "motherboard" 
  | "memory" 
  | "gpu" 
  | "storage" 
  | "power_supply" 
  | "case" 
  | "monitor" 
  | "peripherals";

interface Step {
  id: ComponentType;
  label: string;
  icon: React.ElementType;
  categoryKeywords: string[];
  exactCategories: string[];
  required: boolean;
  multiSelect?: boolean;
  maxItems?: number;
}

const STEPS: Step[] = [
  { 
    id: "processor", 
    label: "Processador", 
    icon: Cpu, 
    categoryKeywords: ["processador", "cpu", "intel", "amd"], 
    exactCategories: ["Processadores (CPU)", "Processadores"],
    required: true 
  },
  { 
    id: "motherboard", 
    label: "Placa Mãe", 
    icon: CircuitBoard, 
    categoryKeywords: ["placa mãe", "motherboard", "placa-mãe"], 
    exactCategories: ["Placas‑Mãe", "Placas-Mãe", "Placas Mãe"], 
    required: true 
  },
  { 
    id: "memory", 
    label: "Memória RAM", 
    icon: MemoryStick, 
    categoryKeywords: ["memória", "ram", "ddr4", "ddr5"], 
    exactCategories: ["Memória RAM"],
    required: true 
  },
  { 
    id: "gpu", 
    label: "Placa de Vídeo", 
    icon: Monitor, 
    categoryKeywords: ["placa de vídeo", "gpu", "rtx", "gtx", "radeon", "rx"], 
    exactCategories: ["Placas de Vídeo (GPU)", "Placas de Vídeo"],
    required: false 
  },
  { 
    id: "storage", 
    label: "Armazenamento", 
    icon: HardDrive, 
    categoryKeywords: ["ssd", "hd", "disco rigido", "nvme"], 
    exactCategories: ["SSD / HD / NVMe", "Armazenamento"],
    required: true 
  },
  { 
    id: "power_supply", 
    label: "Fonte", 
    icon: Zap, 
    categoryKeywords: ["fonte", "atx", "power supply"], 
    exactCategories: ["Fontes de Alimentação", "Fontes"],
    required: true 
  },
  { 
    id: "case", 
    label: "Gabinete", 
    icon: Box, 
    categoryKeywords: ["gabinete", "case", "tower"], 
    exactCategories: ["Gabinetes"],
    required: true 
  },
  { 
    id: "monitor", 
    label: "Monitor", 
    icon: Monitor, 
    categoryKeywords: ["monitor", "tela", "display", "gamer"], 
    exactCategories: ["Monitores", "Monitor Gamer", "Monitor Curvo", "Monitor Profissional", "Monitor Ultrawide", "Monitor 4K"],
    required: false 
  },
  { 
    id: "peripherals", 
    label: "Periféricos", 
    icon: Keyboard, 
    categoryKeywords: ["teclado", "mouse", "headset", "fone"], 
    exactCategories: ["Periféricos", "Teclados Gamer e Mecânicos", "Mouses Gamer", "Headsets e Fones", "Mousepads", "Controles / Joysticks", "Volantes e Simuladores", "Webcams", "Microfones"],
    required: false,
    multiSelect: true,
    maxItems: 5
  }
];

// Helper to extract compatibility specs
const getProductSpecs = (p: Product) => {
  const name = p.name.toUpperCase();
  const desc = (p.description || "").toUpperCase();
  const text = `${name} ${desc}`;

  // Socket Detection
  let socket = null;
  if (text.includes("AM5")) socket = "AM5";
  else if (text.includes("AM4")) socket = "AM4";
  else if (text.includes("LGA 1700") || text.includes("LGA1700") || text.includes("1700")) socket = "LGA1700";
  else if (text.includes("LGA 1200") || text.includes("LGA1200") || text.includes("1200")) socket = "LGA1200";
  else if (text.includes("LGA 1151") || text.includes("LGA1151")) socket = "LGA1151";

  // Memory Type Detection
  let memory = null;
  if (text.includes("DDR5")) memory = "DDR5";
  else if (text.includes("DDR4")) memory = "DDR4";
  else if (text.includes("DDR3")) memory = "DDR3";

  // Wattage Detection (heuristic)
  let wattage = 0;
  // Match "850W", "750 W", etc.
  const wattageMatch = text.match(/(\d{3,4})\s*W/);
  if (wattageMatch) {
    wattage = parseInt(wattageMatch[1]);
  }

  // GPU Tier (for power estimation)
  let gpuTier = 0; // 0 = low, 1 = mid, 2 = high, 3 = extreme
  if (text.includes("RTX 4090") || text.includes("RX 7900 XTX") || text.includes("RTX 4080")) gpuTier = 3;
  else if (text.includes("RTX 4070") || text.includes("RX 7800") || text.includes("RTX 3080")) gpuTier = 2;
  else if (text.includes("RTX 4060") || text.includes("RX 7600") || text.includes("RTX 3060")) gpuTier = 1;

  return { socket, memory, wattage, gpuTier };
};

type Selections = {
  [K in ComponentType]: K extends 'peripherals' ? Product[] : (Product | null);
};

export default function PCBuilder({ products }: PCBuilderProps) {
  const [currentStep, setCurrentStep] = useState<ComponentType>("processor");
  
  // Initialize state with empty array for peripherals and null for others
  const [selections, setSelections] = useState<Selections>({
    processor: null,
    motherboard: null,
    memory: null,
    gpu: null,
    storage: null,
    power_supply: null,
    case: null,
    monitor: null,
    peripherals: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [aiMessage, setAiMessage] = useState<string>("");

  // Derived specs from current selections
  const selectedCpuSpecs = selections.processor ? getProductSpecs(selections.processor as Product) : null;
  const selectedMoboSpecs = selections.motherboard ? getProductSpecs(selections.motherboard as Product) : null;
  const selectedRamSpecs = selections.memory ? getProductSpecs(selections.memory as Product) : null;
  const selectedGpuSpecs = selections.gpu ? getProductSpecs(selections.gpu as Product) : null;

  // AI Assistant Logic
  useEffect(() => {
    const step = STEPS.find(s => s.id === currentStep);
    if (!step) return;

    let msg = `Olá! Estou aqui para ajudar você a escolher o melhor ${step.label}.`;

    if (currentStep === "processor") {
      msg = "O processador é o cérebro do PC. Escolha entre Intel ou AMD. Isso definirá qual Placa-Mãe você poderá usar.";
    } 
    else if (currentStep === "motherboard") {
      if (selectedCpuSpecs?.socket) {
        msg = `Ótima escolha de processador! Para ele, filtrei apenas as Placas-Mãe com socket ${selectedCpuSpecs.socket}.`;
      } else {
        msg = "A Placa-Mãe conecta tudo. Escolha uma compatível com seu processador.";
      }
    }
    else if (currentStep === "memory") {
      if (selectedMoboSpecs?.memory) {
        msg = `Sua Placa-Mãe suporta memória ${selectedMoboSpecs.memory}. Mostrando apenas módulos compatíveis.`;
      } else {
        msg = "Memória RAM é essencial para multitarefas e jogos. 16GB é o recomendado atualmente.";
      }
    }
    else if (currentStep === "gpu") {
      msg = "A Placa de Vídeo define o desempenho em jogos. Escolha com sabedoria!";
    }
    else if (currentStep === "power_supply") {
      if (selectedGpuSpecs && selectedGpuSpecs.gpuTier >= 2) {
        msg = "Com essa Placa de Vídeo potente, recomendo uma fonte de pelo menos 750W ou 850W para garantir estabilidade.";
      } else if (selectedGpuSpecs && selectedGpuSpecs.gpuTier >= 1) {
        msg = "Para essa configuração, uma fonte de 600W a 650W deve ser suficiente.";
      } else {
        msg = "Uma boa fonte garante a longevidade do seu PC. Não economize na qualidade aqui!";
      }
    }
    
    setAiMessage(msg);
  }, [currentStep, selectedCpuSpecs, selectedMoboSpecs, selectedGpuSpecs]);

  const handleSelect = (product: Product) => {
    const step = STEPS.find(s => s.id === currentStep);
    
    if (step?.multiSelect) {
      // Handle multi-select (Peripherals)
      const currentItems = selections[currentStep] as Product[];
      if (currentItems.length >= (step.maxItems || 5)) {
        showToast(`Máximo de ${step.maxItems} itens permitidos nesta categoria.`, "error");
        return;
      }
      setSelections(prev => ({
        ...prev,
        [currentStep]: [...(prev[currentStep] as Product[]), product]
      }));
      showToast(`${product.name} adicionado!`, "success");
    } else {
      // Handle single select
      setSelections(prev => ({ ...prev, [currentStep]: product }));
      
      // Auto-advance
      const currentIndex = STEPS.findIndex(s => s.id === currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1].id);
      }
    }
    setSearchTerm("");
  };

  const handleRemove = (stepId: ComponentType, index?: number) => {
    if (stepId === 'peripherals' && typeof index === 'number') {
      setSelections(prev => ({
        ...prev,
        peripherals: (prev.peripherals as Product[]).filter((_, i) => i !== index)
      }));
    } else {
      setSelections(prev => ({ ...prev, [stepId]: null }));
    }
  };

  const currentStepInfo = STEPS.find(s => s.id === currentStep);

  // Derived specs from current selections (REMOVED - already declared above)
  
  const filteredProducts = useMemo(() => {
    if (!currentStepInfo) return [];
    
    return products.filter(p => {
      const productCategory = (p.category || "").toLowerCase();
      const productName = p.name.toLowerCase();

      // 1. GLOBAL EXCLUSION
      const isInternalComponent = !["monitor", "peripherals"].includes(currentStepInfo.id);
      if (isInternalComponent) {
        if (productCategory.includes("computadores") || 
            productCategory.includes("notebooks") || 
            productCategory.includes("smartphones") ||
            productCategory.includes("monitores") ||
            productCategory.includes("periféricos")) {
          return false;
        }
      }

      // 2. CATEGORY MATCH
      const hasSpecificCategory = productCategory && productCategory !== "hardware";
      const isExactCategoryMatch = currentStepInfo.exactCategories.some(cat => 
        productCategory === cat.toLowerCase()
      );

      if (hasSpecificCategory && !isExactCategoryMatch) return false;

      // 3. COMPATIBILITY LOGIC
      const specs = getProductSpecs(p);

      // CPU Logic
      if (currentStepInfo.id === "processor") {
        // If motherboard selected, must match socket
        if (selectedMoboSpecs?.socket && specs.socket && specs.socket !== selectedMoboSpecs.socket) return false;
      }

      // Motherboard Logic
      if (currentStepInfo.id === "motherboard") {
        // If CPU selected, must match socket
        if (selectedCpuSpecs?.socket && specs.socket && specs.socket !== selectedCpuSpecs.socket) return false;
        // If RAM selected, must match memory type
        if (selectedRamSpecs?.memory && specs.memory && specs.memory !== selectedRamSpecs.memory) return false;
      }

      // Memory Logic
      if (currentStepInfo.id === "memory") {
        // If Motherboard selected, must match memory type
        if (selectedMoboSpecs?.memory && specs.memory && specs.memory !== selectedMoboSpecs.memory) return false;
        // If CPU selected, check compatibility (less common constraint, usually mobo dictates)
        if (selectedCpuSpecs?.memory && specs.memory && specs.memory !== selectedCpuSpecs.memory) return false;
      }
      
      // Power Supply Logic (Soft Check - maybe just warn, but user asked to ensure compatibility)
      if (currentStepInfo.id === "power_supply") {
         // If high-end GPU, maybe filter out very low wattage? 
         // Let's be safe and filter out < 600W for high-end cards
         if (selectedGpuSpecs && selectedGpuSpecs.gpuTier >= 2 && specs.wattage > 0 && specs.wattage < 600) return false;
      }

      // 4. KEYWORD/SEARCH MATCH
      if (isExactCategoryMatch) {
        return productName.includes(searchTerm.toLowerCase());
      }

      const keywordMatch = currentStepInfo.categoryKeywords.some(keyword => 
        productCategory.includes(keyword) || productName.includes(keyword)
      );
      
      const searchMatch = productName.includes(searchTerm.toLowerCase());
      
      return keywordMatch && searchMatch;
    });
  }, [products, currentStepInfo, searchTerm, selectedCpuSpecs, selectedMoboSpecs, selectedRamSpecs]);

  const totalPrice = Object.entries(selections).reduce((acc, [key, value]) => {
    if (!value) return acc;
    if (Array.isArray(value)) {
      return acc + value.reduce((sum, item) => {
        const price = parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", "."));
        return sum + price;
      }, 0);
    }
    const product = value as Product;
    const price = parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + price;
  }, 0);

  const formatPrice = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleFinish = () => {
    const missingRequired = STEPS.filter(s => s.required && !selections[s.id]);
    
    if (missingRequired.length > 0) {
      showToast(`Faltam itens obrigatórios: ${missingRequired.map(s => s.label).join(", ")}`, "error");
      return;
    }

    Object.values(selections).forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => addToCart(item));
      } else if (value) {
        addToCart(value as Product);
      }
    });
    
    showToast("Setup completo adicionado ao carrinho!", "success");
  };

  const handleWhatsAppShare = () => {
    let message = "*Meu Setup Balao da Informatica:*\n\n";
    
    STEPS.forEach(step => {
      const selection = selections[step.id];
      if (selection) {
        if (Array.isArray(selection)) {
          if (selection.length > 0) {
            message += `*${step.label}:*\n`;
            selection.forEach(item => message += `- ${item.name}\n`);
          }
        } else {
          message += `*${step.label}:* ${(selection as Product).name}\n`;
        }
      }
    });
    
    message += `\n*Total:* ${formatPrice(totalPrice)}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[80vh]">
      {/* Left Sidebar - Summary/Preview */}
      <div className="w-full xl:w-1/4 flex flex-col gap-4">
        
        {/* AI Assistant Box */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg border border-indigo-400 p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 font-bold text-indigo-100 uppercase tracking-wider text-xs">
              <Sparkles size={12} />
              Assistente Virtual
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                <Bot size={24} className="text-white" />
              </div>
              <div className="text-sm font-medium leading-relaxed">
                {aiMessage}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/70 border border-zinc-800 overflow-hidden flex flex-col h-full max-h-[calc(100vh-250px)] sticky top-24 rounded-xl shadow-lg">
          <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart size={20} />
              Seu Setup
            </h2>
            <div className="text-red-100 text-sm">Resumo da configuração</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-zinc-900/30">
            {STEPS.map((step) => {
              const selection = selections[step.id];
              const isSelected = Array.isArray(selection) ? selection.length > 0 : !!selection;
              const isCurrent = currentStep === step.id;
              
              return (
                <div 
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border relative group ${
                    isCurrent 
                      ? "bg-zinc-900 border-red-500 shadow-md ring-1 ring-red-950/30" 
                      : "bg-zinc-900/50 border-zinc-850 hover:border-red-500/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-1 transition-colors ${
                      isSelected ? "bg-red-950/30 text-red-400" : 
                      isCurrent ? "bg-red-950/20 text-red-500" : "bg-zinc-850 text-zinc-500"
                    }`}>
                      {isSelected && !step.multiSelect ? <Check size={16} /> : <step.icon size={16} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${isCurrent ? "text-red-400" : "text-zinc-300"}`}>
                          {step.label}
                        </span>
                        {step.required && !isSelected && (
                          <span className="text-[10px] text-red-500 font-bold px-1.5 py-0.5 bg-red-950/30 rounded border border-red-900/50">
                            REQ
                          </span>
                        )}
                      </div>
                      
                      {isSelected ? (
                        Array.isArray(selection) ? (
                          <div className="space-y-1">
                            {selection.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center group/item">
                                <span className="text-xs text-zinc-400 truncate max-w-[140px] block" title={item.name}>
                                  {item.name}
                                </span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(step.id, idx);
                                  }}
                                  className="text-zinc-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            {selection.length < (step.maxItems || 5) && (
                              <div className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                                <Plus size={10} /> Adicionar mais ({selection.length}/{step.maxItems})
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="group/item relative">
                            <div className="text-xs text-zinc-300 font-medium line-clamp-2" title={(selection as Product).name}>
                              {(selection as Product).name}
                            </div>
                            <div className="text-xs text-red-550 font-bold mt-0.5">
                              {(selection as Product).price}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(step.id);
                              }}
                              className="absolute -right-1 -top-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 p-1 bg-zinc-950 rounded-full shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="text-xs text-zinc-500 italic">
                          {isCurrent ? "Selecionando..." : "Não selecionado"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-zinc-900/40 border-t border-zinc-800">
            <div className="flex justify-between items-end mb-4">
              <span className="text-zinc-400 text-sm font-medium">Total Estimado</span>
              <span className="text-2xl font-black text-red-500">{formatPrice(totalPrice)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleWhatsAppShare}
                className="col-span-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 size={16} />
                WhatsApp
              </button>
              <button 
                onClick={handleFinish}
                className="col-span-1 py-2.5 px-4 bg-red-650 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/20"
              >
                <ShoppingCart size={16} />
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Product Selection */}
      <div className="flex-1 w-full">
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl shadow-lg p-6 min-h-[600px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              {currentStepInfo?.icon && <currentStepInfo.icon className="text-red-600" />}
              {currentStepInfo?.label}
            </h1>
            <p className="text-zinc-450 text-sm mt-1">
              {filteredProducts.length} produtos compatíveis encontrados
            </p>
            
            {/* Compatibility Badge */}
            {(selectedCpuSpecs?.socket || selectedMoboSpecs?.socket) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCpuSpecs?.socket && (
                   <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                     <Cpu size={12} /> Socket: {selectedCpuSpecs.socket}
                   </span>
                )}
                {selectedMoboSpecs?.memory && (
                   <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                     <MemoryStick size={12} /> RAM: {selectedMoboSpecs.memory}
                   </span>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-450" size={20} />
            <input
              type="text"
              placeholder={`Buscar em ${currentStepInfo?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-850 text-zinc-100 placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group border border-zinc-850 rounded-xl p-4 hover:border-red-500/50 hover:shadow-lg transition-all bg-zinc-900/40 flex flex-col"
              >
                <div className="relative aspect-square mb-4 bg-zinc-950 rounded-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">
                    {product.category || "Hardware"}
                  </div>
                  <h3 className="font-medium text-zinc-200 line-clamp-2 mb-2 flex-1 text-sm" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-3 border-t border-zinc-850 flex items-center justify-between">
                    <span className="text-lg font-bold text-red-500">
                      {product.price}
                    </span>
                    <button
                      onClick={() => handleSelect(product)}
                      className="p-2 bg-red-950/20 text-red-400 rounded-lg hover:bg-red-650 hover:text-white transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-400">
                <AlertCircle className="mx-auto mb-3 text-zinc-300" size={48} />
                <p>Nenhum produto compatível encontrado.</p>
                <p className="text-sm mt-1">Tente mudar os termos de busca ou escolher componentes diferentes nas etapas anteriores.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
