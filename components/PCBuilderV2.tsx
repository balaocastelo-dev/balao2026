"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/utils";
import {
  AlertCircle,
  Box,
  Check,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Info,
  MemoryStick,
  Monitor,
  Mouse,
  Plus,
  Search,
  Share2,
  ShoppingCart,
  Trash2,
  Wifi,
  Wrench,
  X,
  Zap,
  Shield,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

type StepId =
  | "cpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "gpu"
  | "psu"
  | "case"
  | "cooling"
  | "wifi"
  | "software"
  | "peripherals";

type SpecSnapshot = {
  socket?: string;
  ramType?: "DDR3" | "DDR4" | "DDR5";
  formFactor?: "E-ATX" | "ATX" | "M-ATX" | "MINI-ITX";
  wattage?: number;
  tdp?: number;
  gpuTier?: 0 | 1 | 2 | 3;
  gpuLengthMm?: number;
  caseMaxGpuLengthMm?: number;
  caseSupportedFormFactors?: string[];
  hasIntegratedVideo?: boolean;
};

type BuilderSelections = {
  cpu: string | null;
  motherboard: string | null;
  ram: string | null;
  storage: string | null;
  gpu: string | null;
  psu: string | null;
  case: string | null;
  cooling: string | null;
  wifi: string | null;
  software: string[];
  peripherals: string[];
};

type Step = {
  id: StepId;
  label: string;
  icon: React.ElementType;
  categoryKeywords: string[];
  exactCategories: string[];
  required: boolean | ((ctx: { gpuRequired: boolean }) => boolean);
  multiSelect?: boolean;
  maxItems?: number;
};

const STEPS: Step[] = [
  {
    id: "cpu",
    label: "Processador (CPU)",
    icon: Cpu,
    categoryKeywords: ["processador", "cpu", "intel", "amd"],
    exactCategories: ["Processadores (CPU)", "Processadores"],
    required: true,
  },
  {
    id: "motherboard",
    label: "Placa-mãe",
    icon: CircuitBoard,
    categoryKeywords: ["placa mae", "motherboard", "placa-mae"],
    exactCategories: ["Placas‑Mãe", "Placas-Mãe", "Placas Mãe"],
    required: true,
  },
  {
    id: "ram",
    label: "Memória RAM",
    icon: MemoryStick,
    categoryKeywords: ["memoria", "ram", "ddr4", "ddr5"],
    exactCategories: ["Memória RAM"],
    required: true,
  },
  {
    id: "storage",
    label: "Armazenamento (SSD/NVMe)",
    icon: HardDrive,
    categoryKeywords: ["ssd", "nvme", "m.2", "m2", "hd", "hdd", "sata"],
    exactCategories: ["SSD / HD / NVMe", "Armazenamento"],
    required: true,
  },
  {
    id: "gpu",
    label: "Placa de Vídeo (GPU)",
    icon: Monitor,
    categoryKeywords: ["placa de video", "gpu", "rtx", "gtx", "radeon", "rx", "arc"],
    exactCategories: ["Placas de Vídeo (GPU)", "Placas de Vídeo"],
    required: ({ gpuRequired }) => gpuRequired,
  },
  {
    id: "psu",
    label: "Fonte de Alimentação",
    icon: Zap,
    categoryKeywords: ["fonte", "power supply", "psu", "atx"],
    exactCategories: ["Fontes de Alimentação", "Fontes"],
    required: true,
  },
  {
    id: "case",
    label: "Gabinete",
    icon: Box,
    categoryKeywords: ["gabinete", "case", "tower", "mid tower", "full tower"],
    exactCategories: ["Gabinetes"],
    required: true,
  },
  {
    id: "cooling",
    label: "Refrigeração (Air/Water)",
    icon: Fan,
    categoryKeywords: ["cooler", "watercooler", "aircooler", "aio", "fan", "cooling"],
    exactCategories: ["Watercoolers", "Coolers", "Air Coolers", "Acessórios para Cooling"],
    required: false,
  },
  {
    id: "wifi",
    label: "Adaptador Wi‑Fi",
    icon: Wifi,
    categoryKeywords: ["wifi", "wi-fi", "wireless", "bluetooth", "adaptador", "placa de rede"],
    exactCategories: ["Rede & Conectividade", "Adaptadores", "Placas de Rede"],
    required: false,
  },
  {
    id: "software",
    label: "Softwares & Licenças",
    icon: Shield,
    categoryKeywords: ["windows", "office", "antivirus", "antivírus", "licenca", "licença", "software"],
    exactCategories: ["Softwares", "Licenças", "Licencas"],
    required: false,
    multiSelect: true,
    maxItems: 6,
  },
  {
    id: "peripherals",
    label: "Periféricos",
    icon: Mouse,
    categoryKeywords: [
      "teclado",
      "mouse",
      "headset",
      "fone",
      "webcam",
      "caixa de som",
      "som",
      "speaker",
      "kit teclado",
      "kit mouse",
    ],
    exactCategories: [
      "Periféricos",
      "Teclados Gamer e Mecânicos",
      "Mouses Gamer",
      "Headsets e Fones",
      "Mousepads",
      "Controles / Joysticks",
      "Volantes e Simuladores",
      "Webcams",
      "Microfones",
      "Caixas de Som",
    ],
    required: false,
    multiSelect: true,
    maxItems: 8,
  },
];

const STORAGE_KEY = "balao_pc_builder_v2";

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();

const getProductText = (p: Product) => normalize(`${p.name} ${p.description ?? ""}`);

const getSpecString = (p: Product, keys: string[]) => {
  const specs = p.specs ?? {};
  for (const key of keys) {
    const v = (specs as any)?.[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
};

const getSpecNumber = (p: Product, keys: string[]) => {
  const specs = p.specs ?? {};
  for (const key of keys) {
    const v = (specs as any)?.[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const parsed = Number(String(v).replace(",", ".").replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
};

const getSpecBoolean = (p: Product, keys: string[]) => {
  const specs = p.specs ?? {};
  for (const key of keys) {
    const v = (specs as any)?.[key];
    if (typeof v === "boolean") return v;
    if (typeof v === "string") {
      const t = normalize(v);
      if (["SIM", "TRUE", "YES"].includes(t)) return true;
      if (["NAO", "NÃO", "FALSE", "NO"].includes(t)) return false;
    }
    if (typeof v === "number") return v !== 0;
  }
  return null;
};

const detectSocket = (p: Product) => {
  const specSocket = getSpecString(p, ["socket", "cpu_socket", "soquete"]);
  if (specSocket) return normalize(specSocket).replace(/\s/g, "");

  const t = getProductText(p);
  if (t.includes("AM5")) return "AM5";
  if (t.includes("AM4")) return "AM4";
  if (t.includes("LGA1700") || t.includes("LGA 1700")) return "LGA1700";
  if (t.includes("LGA1200") || t.includes("LGA 1200")) return "LGA1200";
  if (t.includes("LGA1151") || t.includes("LGA 1151")) return "LGA1151";
  return null;
};

const detectRamType = (p: Product): SpecSnapshot["ramType"] => {
  const specRam = getSpecString(p, ["ram_type", "memory_type", "ddr", "ram"]);
  const t = normalize(`${specRam ?? ""} ${getProductText(p)}`);
  if (t.includes("DDR5")) return "DDR5";
  if (t.includes("DDR4")) return "DDR4";
  if (t.includes("DDR3")) return "DDR3";
  return undefined;
};

const detectFormFactor = (p: Product): SpecSnapshot["formFactor"] => {
  const specFf = getSpecString(p, ["form_factor", "motherboard_form_factor", "formato", "fator_de_forma"]);
  const t = normalize(`${specFf ?? ""} ${getProductText(p)}`);
  if (t.includes("E-ATX") || t.includes("EATX")) return "E-ATX";
  if (t.includes("MICRO ATX") || t.includes("MICRO-ATX") || t.includes("M-ATX") || t.includes("MATX")) return "M-ATX";
  if (t.includes("MINI ITX") || t.includes("MINI-ITX") || /\bITX\b/.test(t)) return "MINI-ITX";
  if (/\bATX\b/.test(t)) return "ATX";
  return undefined;
};

const detectCaseSupportFormFactors = (p: Product) => {
  const specs = p.specs ?? {};
  const direct = (specs as any)?.supported_motherboard_form_factors ?? (specs as any)?.supported_form_factors;
  if (Array.isArray(direct)) {
    return direct.map((x) => normalize(x)).filter(Boolean);
  }
  if (typeof direct === "string" && direct.trim()) {
    return direct
      .split(/[,/|;]/g)
      .map((x) => normalize(x))
      .filter(Boolean);
  }

  const t = getProductText(p);
  const supports: string[] = [];
  if (t.includes("E-ATX") || t.includes("EATX")) supports.push("E-ATX");
  if (/\bATX\b/.test(t)) supports.push("ATX");
  if (t.includes("M-ATX") || t.includes("MATX") || t.includes("MICRO ATX") || t.includes("MICRO-ATX")) supports.push("M-ATX");
  if (t.includes("ITX") || t.includes("MINI ITX") || t.includes("MINI-ITX")) supports.push("MINI-ITX");
  return supports.length ? Array.from(new Set(supports)) : null;
};

const detectWattage = (p: Product) => {
  const specW = getSpecNumber(p, ["wattage", "watts", "power_w", "potencia_w", "potencia"]);
  if (specW && specW > 0) return Math.round(specW);
  const t = getProductText(p);
  const m = t.match(/(\d{3,4})\s*W\b/);
  if (m) return Number(m[1]);
  return null;
};

const detectGpuTier = (p: Product): 0 | 1 | 2 | 3 => {
  const t = getProductText(p);
  if (t.includes("RTX 4090") || t.includes("RX 7900 XTX") || t.includes("RTX 4080")) return 3;
  if (t.includes("RTX 4070") || t.includes("RX 7800") || t.includes("RTX 3080")) return 2;
  if (t.includes("RTX 4060") || t.includes("RX 7600") || t.includes("RTX 3060")) return 1;
  return 0;
};

const detectGpuLengthMm = (p: Product) => {
  const specL = getSpecNumber(p, ["length_mm", "gpu_length_mm", "comprimento_mm", "length"]);
  if (specL && specL > 0) return Math.round(specL);
  return null;
};

const detectCaseMaxGpuLengthMm = (p: Product) => {
  const specL = getSpecNumber(p, ["gpu_max_length_mm", "max_gpu_length_mm", "gpu_clearance_mm", "max_gpu_mm"]);
  if (specL && specL > 0) return Math.round(specL);
  return null;
};

const detectTdp = (p: Product, kind: "cpu" | "gpu") => {
  const spec = getSpecNumber(p, ["tdp_w", "tdp", "power_draw_w", "consumo_w"]);
  if (spec && spec > 0) return Math.round(spec);

  const t = getProductText(p);
  const mw = t.match(/TDP\s*(\d{2,3})\s*W\b/);
  if (mw) return Number(mw[1]);

  if (kind === "gpu") {
    const tier = detectGpuTier(p);
    if (tier === 3) return 350;
    if (tier === 2) return 250;
    if (tier === 1) return 170;
    return 75;
  }

  const isIntelK = /\bI[3579]-\d{4,5}K\b/i.test(p.name);
  return isIntelK ? 125 : 65;
};

const hasIntegratedVideo = (cpu: Product) => {
  const explicit = getSpecBoolean(cpu, ["has_video_integrated", "has_igpu", "integrated_graphics", "video_integrado"]);
  if (explicit !== null) return explicit;

  const t = getProductText(cpu);
  const looksIntel = t.includes("INTEL") || /\bI[3579]-/i.test(cpu.name);
  if (looksIntel) {
    if (/\bKF\b/i.test(cpu.name) || /-KF\b/i.test(cpu.name)) return false;
    if (/\bF\b/i.test(cpu.name) || /-F\b/i.test(cpu.name)) return false;
    return true;
  }

  if (/\bRYZEN\b/i.test(cpu.name)) {
    if (/\bG\b/i.test(cpu.name)) return true;
  }

  return undefined;
};

const getSnapshot = (p: Product, step: StepId): SpecSnapshot => {
  if (step === "cpu") {
    return {
      socket: detectSocket(p) ?? undefined,
      ramType: detectRamType(p),
      tdp: detectTdp(p, "cpu") ?? undefined,
      hasIntegratedVideo: hasIntegratedVideo(p),
    };
  }

  if (step === "motherboard") {
    return {
      socket: detectSocket(p) ?? undefined,
      ramType: detectRamType(p),
      formFactor: detectFormFactor(p),
    };
  }

  if (step === "ram") {
    return { ramType: detectRamType(p) };
  }

  if (step === "gpu") {
    return {
      tdp: detectTdp(p, "gpu") ?? undefined,
      gpuTier: detectGpuTier(p) ?? 0,
      gpuLengthMm: detectGpuLengthMm(p) ?? undefined,
    };
  }

  if (step === "psu") {
    return { wattage: detectWattage(p) ?? undefined };
  }

  if (step === "case") {
    return {
      caseSupportedFormFactors: detectCaseSupportFormFactors(p) ?? undefined,
      caseMaxGpuLengthMm: detectCaseMaxGpuLengthMm(p) ?? undefined,
    };
  }

  return {};
};

const computeRecommendedPsuWattage = (cpu: Product | null, gpu: Product | null) => {
  if (!cpu && !gpu) return null;
  const cpuTdp = cpu ? detectTdp(cpu, "cpu") : 0;
  const gpuTdp = gpu ? detectTdp(gpu, "gpu") : 0;
  const base = cpuTdp + gpuTdp + 90;
  const withHeadroom = Math.ceil((base * 1.35) / 50) * 50;
  return Math.max(450, withHeadroom);
};

const getBuildTier = (total: number, gpu: Product | null) => {
  const tier = gpu ? (detectGpuTier(gpu) ?? 0) : 0;
  if (tier >= 3 || total >= 12000) return "Alto Nível";
  if (tier >= 1 || total >= 6000) return "Gamer Básico";
  return "Office";
};

const getAssemblyPrice = (buildTier: string) => {
  if (buildTier === "Alto Nível") return 450;
  if (buildTier === "Gamer Básico") return 249;
  return 150;
};

const parsePrice = (price: string) => {
  const raw = price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export default function PCBuilderV2({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<StepId>("cpu");
  const [searchTerm, setSearchTerm] = useState("");
  const [includeAssembly, setIncludeAssembly] = useState(false);
  const [selections, setSelections] = useState<BuilderSelections>({
    cpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    gpu: null,
    psu: null,
    case: null,
    cooling: null,
    wifi: null,
    software: [],
    peripherals: [],
  });

  const productById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const selectedCpu = selections.cpu ? productById.get(selections.cpu) ?? null : null;
  const selectedMobo = selections.motherboard ? productById.get(selections.motherboard) ?? null : null;
  const selectedRam = selections.ram ? productById.get(selections.ram) ?? null : null;
  const selectedStorage = selections.storage ? productById.get(selections.storage) ?? null : null;
  const selectedGpu = selections.gpu ? productById.get(selections.gpu) ?? null : null;
  const selectedPsu = selections.psu ? productById.get(selections.psu) ?? null : null;
  const selectedCase = selections.case ? productById.get(selections.case) ?? null : null;
  const selectedCooling = selections.cooling ? productById.get(selections.cooling) ?? null : null;
  const selectedWifi = selections.wifi ? productById.get(selections.wifi) ?? null : null;
  const selectedSoftware = selections.software.map((id) => productById.get(id)).filter(Boolean) as Product[];
  const selectedPeripherals = selections.peripherals.map((id) => productById.get(id)).filter(Boolean) as Product[];

  const cpuSnap = selectedCpu ? getSnapshot(selectedCpu, "cpu") : null;
  const moboSnap = selectedMobo ? getSnapshot(selectedMobo, "motherboard") : null;

  const gpuRequired = cpuSnap?.hasIntegratedVideo === false;
  const recommendedPsuW = computeRecommendedPsuWattage(selectedCpu, selectedGpu);

  const isStepRequired = (step: Step) => (typeof step.required === "function" ? step.required({ gpuRequired }) : step.required);

  const stepIndexById = useMemo(() => {
    const m = new Map<StepId, number>();
    STEPS.forEach((s, idx) => m.set(s.id, idx));
    return m;
  }, []);

  const firstMissingRequiredIndex = useMemo(() => {
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      if (!isStepRequired(step)) continue;
      const sel = (selections as any)[step.id];
      const ok = Array.isArray(sel) ? sel.length > 0 : Boolean(sel);
      if (!ok) return i;
    }
    return STEPS.length - 1;
  }, [selections, gpuRequired]);

  const canAccessStep = (target: StepId) => {
    const idx = stepIndexById.get(target) ?? 0;
    const cur = stepIndexById.get(currentStep) ?? 0;
    if (idx <= cur) return true;
    return idx <= firstMissingRequiredIndex;
  };

  const advance = () => {
    const idx = stepIndexById.get(currentStep) ?? 0;
    for (let i = idx + 1; i < STEPS.length; i++) {
      const next = STEPS[i].id;
      if (canAccessStep(next)) {
        setCurrentStep(next);
        return;
      }
    }
  };

  const clearDownstream = (from: StepId, next: BuilderSelections) => {
    const fromIdx = stepIndexById.get(from) ?? 0;
    for (let i = fromIdx + 1; i < STEPS.length; i++) {
      const id = STEPS[i].id;
      if (id === "software" || id === "peripherals") (next as any)[id] = [];
      else (next as any)[id] = null;
    }
    return next;
  };

  const handleSelect = (product: Product) => {
    const step = STEPS.find((s) => s.id === currentStep);
    if (!step) return;

    if (step.multiSelect) {
      const currentIds = (selections as any)[currentStep] as string[];
      if (currentIds.includes(product.id)) return;
      if (currentIds.length >= (step.maxItems ?? 6)) {
        showToast(`Máximo de ${step.maxItems} itens nessa etapa.`, "error");
        return;
      }
      setSelections((prev) => ({ ...prev, [currentStep]: [...currentIds, product.id] } as BuilderSelections));
      showToast(`${product.name} adicionado!`, "success");
      setSearchTerm("");
      return;
    }

    setSelections((prev) => {
      const next = { ...prev, [currentStep]: product.id } as BuilderSelections;
      if (currentStep === "cpu" || currentStep === "motherboard" || currentStep === "ram" || currentStep === "gpu") {
        return clearDownstream(currentStep, next);
      }
      return next;
    });
    setSearchTerm("");
    advance();
  };

  const handleRemove = (stepId: StepId, index?: number) => {
    if (stepId === "software" || stepId === "peripherals") {
      if (typeof index !== "number") return;
      setSelections((prev) => ({
        ...prev,
        [stepId]: (prev as any)[stepId].filter((_: string, i: number) => i !== index),
      }));
      return;
    }

    setSelections((prev) => {
      const next = { ...prev, [stepId]: null } as BuilderSelections;
      if (stepId === "cpu" || stepId === "motherboard" || stepId === "ram" || stepId === "gpu") {
        return clearDownstream(stepId, next);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelections({
      cpu: null,
      motherboard: null,
      ram: null,
      storage: null,
      gpu: null,
      psu: null,
      case: null,
      cooling: null,
      wifi: null,
      software: [],
      peripherals: [],
    });
    setIncludeAssembly(false);
    setCurrentStep("cpu");
    setSearchTerm("");
    showToast("Configuração limpa.", "success");
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const nextSelections: BuilderSelections = {
        cpu: typeof parsed?.selections?.cpu === "string" ? parsed.selections.cpu : null,
        motherboard: typeof parsed?.selections?.motherboard === "string" ? parsed.selections.motherboard : null,
        ram: typeof parsed?.selections?.ram === "string" ? parsed.selections.ram : null,
        storage: typeof parsed?.selections?.storage === "string" ? parsed.selections.storage : null,
        gpu: typeof parsed?.selections?.gpu === "string" ? parsed.selections.gpu : null,
        psu: typeof parsed?.selections?.psu === "string" ? parsed.selections.psu : null,
        case: typeof parsed?.selections?.case === "string" ? parsed.selections.case : null,
        cooling: typeof parsed?.selections?.cooling === "string" ? parsed.selections.cooling : null,
        wifi: typeof parsed?.selections?.wifi === "string" ? parsed.selections.wifi : null,
        software: Array.isArray(parsed?.selections?.software) ? parsed.selections.software.filter((x: any) => typeof x === "string") : [],
        peripherals: Array.isArray(parsed?.selections?.peripherals) ? parsed.selections.peripherals.filter((x: any) => typeof x === "string") : [],
      };
      const nextStep: StepId | null = typeof parsed?.currentStep === "string" ? (parsed.currentStep as StepId) : null;
      setSelections((prev) => ({ ...prev, ...nextSelections }));
      setIncludeAssembly(Boolean(parsed?.includeAssembly));
      if (nextStep && STEPS.some((s) => s.id === nextStep)) setCurrentStep(nextStep);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentStep,
          includeAssembly,
          selections,
        })
      );
    } catch {}
  }, [currentStep, includeAssembly, selections]);

  const currentStepInfo = STEPS.find((s) => s.id === currentStep);

  const filteredProducts = useMemo(() => {
    if (!currentStepInfo) return [];
    const normalizedSearch = normalize(searchTerm);

    const categoryMatches = (p: Product) => {
      const c = normalize(p.category ?? "");
      const isExact = currentStepInfo.exactCategories.some((cat) => normalize(cat) === c);
      if (c && c !== "HARDWARE" && currentStepInfo.exactCategories.length > 0) return isExact;
      const name = normalize(p.name);
      return currentStepInfo.categoryKeywords.some((kw) => c.includes(normalize(kw)) || name.includes(normalize(kw)));
    };

    const matchesSearch = (p: Product) => {
      if (!normalizedSearch) return true;
      return normalize(p.name).includes(normalizedSearch);
    };

    const compatibilityOk = (p: Product) => {
      if (currentStepInfo.id === "motherboard") {
        const socket = detectSocket(p);
        if (cpuSnap?.socket && socket && normalize(socket) !== normalize(cpuSnap.socket)) return false;
      }

      if (currentStepInfo.id === "ram") {
        const ramType = detectRamType(p);
        if (moboSnap?.ramType && ramType && ramType !== moboSnap.ramType) return false;
      }

      if (currentStepInfo.id === "psu") {
        if (!recommendedPsuW) return true;
        const w = detectWattage(p);
        if (w && w < recommendedPsuW) return false;
      }

      if (currentStepInfo.id === "case") {
        const supports = detectCaseSupportFormFactors(p);
        const moboFf = moboSnap?.formFactor;
        if (moboFf && supports && !supports.some((x) => normalize(x).includes(normalize(moboFf)))) return false;

        const maxLen = detectCaseMaxGpuLengthMm(p);
        const gpuLen = selectedGpu ? detectGpuLengthMm(selectedGpu) : null;
        if (maxLen && gpuLen && gpuLen > maxLen) return false;
      }

      return true;
    };

    try {
      if (currentStepInfo.id === "motherboard" && cpuSnap?.socket) {
        const wantedSocket = normalize(cpuSnap.socket);

        const isMotherboardCandidate = (p: Product) => {
          const c = normalize(p.category ?? "");
          const isExact = currentStepInfo.exactCategories.some((cat) => normalize(cat) === c);
          const name = normalize(p.name);
          const keywordMatch = currentStepInfo.categoryKeywords.some((kw) => c.includes(normalize(kw)) || name.includes(normalize(kw)));
          return isExact || keywordMatch;
        };

        const socketMatch = (p: Product) => {
          const byDetect = detectSocket(p);
          if (byDetect && normalize(byDetect) === wantedSocket) return true;
          return getProductText(p).includes(wantedSocket);
        };

        const base = products.filter((p) => isMotherboardCandidate(p) && matchesSearch(p));
        const strict = base.filter((p) => socketMatch(p));

        if (strict.length > 0) {
          return strict.sort((a, b) => {
            const am = socketMatch(a) ? 1 : 0;
            const bm = socketMatch(b) ? 1 : 0;
            return bm - am;
          });
        }

        return base.sort((a, b) => {
          const am = socketMatch(a) ? 1 : 0;
          const bm = socketMatch(b) ? 1 : 0;
          return bm - am;
        });
      }

      return products.filter((p) => categoryMatches(p) && matchesSearch(p) && compatibilityOk(p));
    } catch {
      return [];
    }
  }, [products, currentStepInfo, searchTerm, cpuSnap?.socket, moboSnap?.ramType, moboSnap?.formFactor, recommendedPsuW, selectedGpu]);

  const totalPartsPrice =
    (selectedCpu ? parsePrice(selectedCpu.price) : 0) +
    (selectedMobo ? parsePrice(selectedMobo.price) : 0) +
    (selectedRam ? parsePrice(selectedRam.price) : 0) +
    (selectedStorage ? parsePrice(selectedStorage.price) : 0) +
    (selectedGpu ? parsePrice(selectedGpu.price) : 0) +
    (selectedPsu ? parsePrice(selectedPsu.price) : 0) +
    (selectedCase ? parsePrice(selectedCase.price) : 0) +
    (selectedCooling ? parsePrice(selectedCooling.price) : 0) +
    (selectedWifi ? parsePrice(selectedWifi.price) : 0) +
    selectedSoftware.reduce((sum, p) => sum + parsePrice(p.price), 0) +
    selectedPeripherals.reduce((sum, p) => sum + parsePrice(p.price), 0);

  const buildTier = getBuildTier(totalPartsPrice, selectedGpu);
  const assemblyPrice = getAssemblyPrice(buildTier);
  const totalWithAssembly = totalPartsPrice + (includeAssembly ? assemblyPrice : 0);

  const formatPrice = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleFinish = () => {
    const missingRequired = STEPS.filter((s) => isStepRequired(s)).filter((s) => {
      const sel = (selections as any)[s.id];
      return Array.isArray(sel) ? sel.length === 0 : !sel;
    });

    if (missingRequired.length > 0) {
      showToast(`Faltam itens obrigatórios: ${missingRequired.map((s) => s.label).join(", ")}`, "error");
      return;
    }

    const toAdd: Product[] = [];
    if (selectedCpu) toAdd.push(selectedCpu);
    if (selectedMobo) toAdd.push(selectedMobo);
    if (selectedRam) toAdd.push(selectedRam);
    if (selectedStorage) toAdd.push(selectedStorage);
    if (selectedGpu) toAdd.push(selectedGpu);
    if (selectedPsu) toAdd.push(selectedPsu);
    if (selectedCase) toAdd.push(selectedCase);
    if (selectedCooling) toAdd.push(selectedCooling);
    if (selectedWifi) toAdd.push(selectedWifi);
    toAdd.push(...selectedSoftware);
    toAdd.push(...selectedPeripherals);
    toAdd.forEach((p) => addToCart(p));
    showToast("Setup adicionado ao carrinho!", "success");
  };

  const handleWhatsAppShare = () => {
    let message = "*Meu Setup Balão da Informática:*\n\n";

    const addLine = (label: string, p: Product | null) => {
      if (!p) return;
      message += `*${label}:* ${p.name}\n`;
    };

    addLine("CPU", selectedCpu);
    addLine("Placa-mãe", selectedMobo);
    addLine("RAM", selectedRam);
    addLine("Armazenamento", selectedStorage);
    if (selectedGpu) addLine("GPU", selectedGpu);
    addLine("Fonte", selectedPsu);
    addLine("Gabinete", selectedCase);
    if (selectedCooling) addLine("Refrigeração", selectedCooling);
    if (selectedWifi) addLine("Wi‑Fi", selectedWifi);
    if (selectedSoftware.length) {
      message += `*Softwares:*\n`;
      selectedSoftware.forEach((p) => (message += `- ${p.name}\n`));
    }
    if (selectedPeripherals.length) {
      message += `*Periféricos:*\n`;
      selectedPeripherals.forEach((p) => (message += `- ${p.name}\n`));
    }
    if (includeAssembly) message += `\n*Montagem Profissional (${buildTier}):* ${formatPrice(assemblyPrice)}\n`;
    message += `\n*Total:* ${formatPrice(totalWithAssembly)}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[80vh]">
      <div className="w-full xl:w-1/4 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden flex flex-col h-full max-h-[calc(100vh-180px)] sticky top-24">
          <div className="p-4 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart size={20} />
              Seu Setup
            </h2>
            <div className="text-red-100 text-sm">Fluxo sequencial com compatibilidade</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-zinc-50">
            {STEPS.map((step) => {
              const selection = (selections as any)[step.id];
              const isSelected = Array.isArray(selection) ? selection.length > 0 : Boolean(selection);
              const isCurrent = currentStep === step.id;
              const isLocked = !canAccessStep(step.id);
              const required = isStepRequired(step);

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (isLocked) {
                      showToast("Siga o fluxo em ordem: finalize as etapas anteriores.", "error");
                      return;
                    }
                    setCurrentStep(step.id);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all border relative group ${
                    isCurrent
                      ? "bg-white border-red-500 shadow-md ring-1 ring-red-100"
                      : isLocked
                        ? "bg-white border-zinc-200 opacity-60"
                        : "bg-white border-zinc-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-1 transition-colors ${
                        isSelected ? "bg-red-100 text-red-600" : isCurrent ? "bg-red-50 text-red-500" : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {isSelected && !step.multiSelect ? <Check size={16} /> : <step.icon size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-bold ${isCurrent ? "text-red-700" : "text-zinc-700"}`}>{step.label}</span>
                        {required && !isSelected && (
                          <span className="text-[10px] text-red-500 font-bold px-1.5 py-0.5 bg-red-50 rounded border border-red-100">REQ</span>
                        )}
                      </div>

                      {isSelected ? (
                        Array.isArray(selection) ? (
                          <div className="space-y-1">
                            {selection.map((id: string, idx: number) => {
                              const item = productById.get(id);
                              if (!item) return null;
                              return (
                                <div key={idx} className="flex justify-between items-center group/item">
                                  <span className="text-xs text-zinc-600 truncate max-w-[140px] block" title={item.name}>
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
                              );
                            })}
                          </div>
                        ) : (
                          <div className="group/item relative">
                            {(() => {
                              const item = productById.get(selection as string);
                              if (!item) return null;
                              return (
                                <>
                                  <div className="text-xs text-zinc-700 font-medium line-clamp-2" title={item.name}>
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-red-600 font-bold mt-0.5">{item.price}</div>
                                </>
                              );
                            })()}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(step.id);
                              }}
                              className="absolute -right-1 -top-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 p-1 bg-white rounded-full shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="text-xs text-zinc-400 italic">{isCurrent ? "Selecionando..." : "Não selecionado"}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white border-t border-zinc-200">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm font-medium">Total das peças</span>
                <span className="text-lg font-black text-zinc-800">{formatPrice(totalPartsPrice)}</span>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                      <Wrench size={16} className="text-red-600" />
                      Montagem Profissional
                    </div>
                    <div className="text-xs text-zinc-500">
                      Categoria: <span className="font-semibold text-zinc-700">{buildTier}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIncludeAssembly((v) => !v)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      includeAssembly ? "bg-red-600 text-white border-red-600" : "bg-white text-zinc-700 border-zinc-300 hover:border-red-300"
                    }`}
                  >
                    {includeAssembly ? "Incluída" : "Adicionar"}
                  </button>
                </div>
                {includeAssembly && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Valor</span>
                    <span className="font-bold text-red-600">{formatPrice(assemblyPrice)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end">
                <span className="text-zinc-500 text-sm font-medium">Total estimado</span>
                <span className="text-2xl font-black text-red-600">{formatPrice(totalWithAssembly)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="col-span-1 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Share2 size={16} />
                WhatsApp
              </button>
              <button
                onClick={handleFinish}
                className="col-span-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                <ShoppingCart size={16} />
                Comprar
              </button>
            </div>

            <button
              onClick={handleClearAll}
              className="w-full mt-2 py-2 px-4 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-zinc-200"
            >
              <Trash2 size={16} />
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 min-h-[600px]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
              {currentStepInfo?.icon && <currentStepInfo.icon className="text-red-600" />}
              {currentStepInfo?.label}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">{filteredProducts.length} produtos compatíveis encontrados</p>

            {(cpuSnap?.socket || moboSnap?.ramType || recommendedPsuW || gpuRequired) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cpuSnap?.socket && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <Cpu size={12} /> Socket: {cpuSnap.socket}
                  </span>
                )}
                {moboSnap?.ramType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <MemoryStick size={12} /> RAM: {moboSnap.ramType}
                  </span>
                )}
                {recommendedPsuW && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                    <Zap size={12} /> Fonte: {recommendedPsuW}W+
                  </span>
                )}
                {gpuRequired && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <Info size={12} /> GPU obrigatória (CPU sem vídeo)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder={`Buscar em ${currentStepInfo?.label ?? "itens"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {currentStep === "gpu" && !gpuRequired && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm text-zinc-700">GPU é opcional para CPUs com vídeo integrado.</div>
              <button
                onClick={() => {
                  handleRemove("gpu");
                  advance();
                }}
                className="px-3 py-2 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold text-sm"
              >
                Pular GPU
              </button>
            </div>
          )}

          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group border border-zinc-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all bg-white flex flex-col md:flex-row gap-4"
              >
                <div className="relative w-full md:w-24 md:h-24 aspect-square bg-zinc-50 rounded-lg overflow-hidden shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wider font-semibold">{product.category || "Hardware"}</div>
                      <h3 className="font-medium text-zinc-800 line-clamp-2 text-sm" title={product.name}>
                        {product.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(() => {
                          const snap = getSnapshot(product, currentStep);
                          const badges: Array<{ label: string; icon: React.ElementType }> = [];
                          if (snap.socket) badges.push({ label: `Socket ${snap.socket}`, icon: Cpu });
                          if (snap.ramType) badges.push({ label: snap.ramType, icon: MemoryStick });
                          if (snap.wattage) badges.push({ label: `${snap.wattage}W`, icon: Zap });
                          if (snap.formFactor) badges.push({ label: snap.formFactor, icon: CircuitBoard });
                          if (snap.caseMaxGpuLengthMm) badges.push({ label: `GPU até ${snap.caseMaxGpuLengthMm}mm`, icon: Box });
                          if (snap.gpuLengthMm) badges.push({ label: `${snap.gpuLengthMm}mm`, icon: Monitor });
                          return badges.slice(0, 3).map((b, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200"
                            >
                              <b.icon size={12} /> {b.label}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-lg font-bold text-red-600">{product.price}</div>
                      <button
                        onClick={() => handleSelect(product)}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                      >
                        <Plus size={18} />
                        Selecionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="py-12 text-center text-zinc-400">
                <AlertCircle className="mx-auto mb-3 text-zinc-300" size={48} />
                <p>Nenhum produto compatível encontrado.</p>
                <p className="text-sm mt-1">Ajuste a busca ou volte uma etapa para trocar componentes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

