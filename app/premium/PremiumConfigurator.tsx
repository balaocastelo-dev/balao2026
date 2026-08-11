"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Cpu,
  Database,
  Fan,
  HardDrive,
  Microchip,
  Monitor,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { premiumPartsCatalog, PremiumPlatform } from "@/data/premiumPartsCatalog";
import SafeImage from "@/components/SafeImage";

type GridItem = {
  value: string;
  title: string;
  subtitle?: string;
  meta?: string;
  priceLabel?: string;
};

type PremiumSelections = {
  purpose: string;
  platform: PremiumPlatform;
  processor: string;
  motherboard: string;
  waterCooler: string;
  gpu: string;
  memory: string;
  ssd: string;
  ssdQuantity: string;
  hd: string;
  hdQuantity: string;
  powerSupply: string;
  case: string;
  budget: string;
};

const defaultSelections = (): PremiumSelections => ({
  purpose: premiumPartsCatalog.purposes[0],
  platform: premiumPartsCatalog.platforms[0],
  processor:
    premiumPartsCatalog.processors.find((p) => p.platform === "Intel")?.name ||
    premiumPartsCatalog.processors[0].name,
  motherboard:
    premiumPartsCatalog.motherboards.find((m) => m.platform === "Intel")?.name ||
    premiumPartsCatalog.motherboards[0].name,
  waterCooler: premiumPartsCatalog.waterCoolers[0].name,
  gpu: premiumPartsCatalog.gpus[0].name,
  memory: premiumPartsCatalog.memories[1]?.name || premiumPartsCatalog.memories[0].name,
  ssd: premiumPartsCatalog.ssds[1]?.name || premiumPartsCatalog.ssds[0].name,
  ssdQuantity: premiumPartsCatalog.ssdQuantities[0],
  hd: premiumPartsCatalog.hds[0].name,
  hdQuantity: premiumPartsCatalog.hdQuantities[0],
  powerSupply: premiumPartsCatalog.powerSupplies[0].name,
  case: premiumPartsCatalog.cases[0].name,
  budget: premiumPartsCatalog.budgets[1] || premiumPartsCatalog.budgets[0],
});

const presets: Record<string, Partial<PremiumSelections>> = {
  "gamer-start": {
    purpose: "Jogos competitivos",
    platform: "Intel",
    processor: "Intel Core Ultra 5 245KF",
    motherboard: "MSI PRO H810M-B DDR5",
    waterCooler: "Antec Vortex 360 ARGB",
    gpu: "RTX 5060 8GB",
    memory: "16GB DDR5 6000MHz",
    ssd: "SSD NVMe 1TB",
    ssdQuantity: "1 unidade",
    hd: "Sem HD",
    hdQuantity: "Nenhum",
    powerSupply: "Fonte 800W 80 Plus Gold",
    case: "Masterbox K501L",
    budget: "R$ 4.000 a R$ 6.000",
  },
  "gamer-pro": {
    purpose: "Jogos pesados",
    platform: "Intel",
    processor: "Intel Core Ultra 7 265KF",
    motherboard: "Asus Prime Z890-P WiFi DDR5",
    waterCooler: "Antec Vortex 360 ARGB",
    gpu: "RTX 5070 12GB",
    memory: "32GB DDR5 6000MHz",
    ssd: "SSD NVMe 1TB",
    ssdQuantity: "1 unidade",
    hd: "HD 2TB",
    hdQuantity: "1 unidade",
    powerSupply: "Fonte 800W 80 Plus Gold",
    case: "Masterbox TD500 Mesh",
    budget: "R$ 9.000 a R$ 13.000",
  },
  "gamer-ultra": {
    purpose: "Streaming",
    platform: "AMD Ryzen",
    processor: "AMD Ryzen 9 9900X",
    motherboard: "Asus Prime X870-P WiFi",
    waterCooler: "Corsair iCUE H150i 360mm",
    gpu: "RTX 5070 Ti 16GB",
    memory: "32GB DDR5 6000MHz",
    ssd: "SSD NVMe 2TB",
    ssdQuantity: "1 unidade",
    hd: "HD 4TB",
    hdQuantity: "1 unidade",
    powerSupply: "Fonte 1050W 80 Plus Gold",
    case: "Corsair 4000D",
    budget: "R$ 13.000 a R$ 20.000",
  },
  extreme: {
    purpose: "Projeto extremo personalizado",
    platform: "Intel",
    processor: "Intel Core Ultra 9 285K",
    motherboard: "Asus Prime Z890-P WiFi DDR5",
    waterCooler: "NZXT Kraken Elite 360",
    gpu: "RTX 5090 32GB",
    memory: "64GB DDR5 6000MHz",
    ssd: "SSD NVMe 4TB",
    ssdQuantity: "2 unidades",
    hd: "HD 8TB",
    hdQuantity: "1 unidade",
    powerSupply: "Fonte Asus ROG Thor 1200P2 Platinum",
    case: "Asus ROG Hyperion GR701",
    budget: "Acima de R$ 20.000",
  },
  "workstation-pro": {
    purpose: "Arquitetura",
    platform: "AMD Ryzen",
    processor: "AMD Ryzen 9 9950X",
    motherboard: "Asus Prime X870-P WiFi",
    waterCooler: "Corsair iCUE H150i 360mm",
    gpu: "RTX 5080 16GB",
    memory: "64GB DDR5 6000MHz",
    ssd: "SSD NVMe 2TB",
    ssdQuantity: "1 unidade",
    hd: "HD 8TB",
    hdQuantity: "1 unidade",
    powerSupply: "Fonte 1050W 80 Plus Gold",
    case: "NZXT H7 Elite",
    budget: "R$ 13.000 a R$ 20.000",
  },
  "workstation-extreme": {
    purpose: "Renderização pesada / Engenharia / Simulação",
    platform: "AMD Threadripper",
    processor: "AMD Ryzen Threadripper PRO 9995WX",
    motherboard: "Asus Pro WS WRX90E-SAGE SE",
    waterCooler: "Corsair iCUE H150i 360mm",
    gpu: "RTX 5090 32GB",
    memory: "192GB DDR5",
    ssd: "SSD NVMe 8TB",
    ssdQuantity: "2 unidades",
    hd: "HD 20TB",
    hdQuantity: "1 unidade",
    powerSupply: "Fonte Asus ROG Thor 1200P2 Platinum",
    case: "Asus ROG Hyperion GR701",
    budget: "Acima de R$ 20.000",
  },
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatPriceLabel(price?: number | null) {
  if (price == null) return "Consultar valor";
  return brl.format(price);
}

function toGridItems(
  items: readonly {
    name: string;
    tier?: string;
    recommendedFor?: string;
    style?: string;
    price?: number | null;
  }[]
): GridItem[] {
  return items.map((i) => ({
    value: i.name,
    title: i.name,
    subtitle: i.tier || i.style,
    meta: i.recommendedFor,
    priceLabel: formatPriceLabel(i.price),
  }));
}

function ChoiceGrid({
  label,
  icon: Icon,
  items,
  value,
  onChange,
  columns = "grid-cols-1 sm:grid-cols-2",
  help,
}: {
  label: string;
  icon: React.ElementType;
  items: GridItem[];
  value: string;
  onChange: (value: string) => void;
  columns?: string;
  help?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-red-300">
            <Icon className="h-4 w-4" />
          </span>
          <div className="text-sm font-extrabold text-white/95">{label}</div>
        </div>
        <div className="text-xs font-semibold text-white/50">Obrigatório</div>
      </div>

      <div className={["grid gap-3", columns].join(" ")}>
        {items.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                selected
                  ? "border-red-500/60 bg-red-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
              ].join(" ")}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-extrabold text-white">{opt.title}</div>
                    {opt.priceLabel ? (
                      <div className="rounded-lg border border-white/10 bg-black/25 px-2 py-1 text-[11px] font-extrabold text-white/85">
                        {opt.priceLabel}
                      </div>
                    ) : null}
                  </div>
                  {opt.subtitle ? (
                    <div className="mt-1 text-xs font-semibold text-white/60">{opt.subtitle}</div>
                  ) : null}
                </div>
                <span
                  className={[
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition",
                    selected
                      ? "border-red-500/40 bg-red-500/15 text-red-200"
                      : "border-white/10 bg-black/10 text-white/60 group-hover:border-white/20",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Check className={selected ? "h-4 w-4" : "h-4 w-4 opacity-0"} />
                </span>
              </div>
              {opt.meta ? (
                <div className="mt-3 text-xs leading-relaxed text-white/65">{opt.meta}</div>
              ) : null}
            </button>
          );
        })}
      </div>

      {help ? <div className="text-xs text-white/55">{help}</div> : null}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2.5">
      <div className="text-xs font-semibold text-white/55">{label}</div>
      <div className="text-right text-xs font-extrabold text-white/85">{value}</div>
    </div>
  );
}

export default function PremiumConfigurator() {
  const searchParams = useSearchParams();

  const [selections, setSelections] = useState<PremiumSelections>(() => defaultSelections());

  const setupImages = useMemo(
    () => [
      {
        src: "/images/premium/setups/setup-gamer-premium-01.webp",
        alt: "Setup gamer premium em tons escuros com iluminação vermelha",
      },
      {
        src: "/images/premium/setups/setup-gamer-premium-02.webp",
        alt: "Setup gamer premium com PC iluminado em vermelho",
      },
      {
        src: "/images/premium/setups/setup-workstation-premium.webp",
        alt: "Setup workstation premium com dois monitores e iluminação vermelha",
      },
      {
        src: "/images/premium/setups/setup-creator-premium.webp",
        alt: "Setup creator premium para edição e produção",
      },
      {
        src: "/images/premium/setups/setup-extreme-premium.webp",
        alt: "PC premium com visual extremo e iluminação vermelha",
      },
    ],
    []
  );

  const platformItems: GridItem[] = premiumPartsCatalog.platforms.map((p) => ({
    value: p,
    title: p,
    subtitle: p === "Intel" ? "Core Ultra" : p === "AMD Ryzen" ? "Ryzen 9" : "Threadripper PRO",
    meta:
      p === "Intel"
        ? "Equilíbrio premium para jogos e produtividade."
        : p === "AMD Ryzen"
          ? "Alta performance para criação e workstation."
          : "Workstation extrema para projetos pesados.",
  }));

  const filteredProcessors = useMemo(() => {
    return premiumPartsCatalog.processors.filter((p) => p.platform === selections.platform);
  }, [selections.platform]);

  const filteredMotherboards = useMemo(() => {
    return premiumPartsCatalog.motherboards.filter((m) => m.platform === selections.platform);
  }, [selections.platform]);

  const processorItems = useMemo(() => toGridItems(filteredProcessors), [filteredProcessors]);
  const motherboardItems = useMemo(() => toGridItems(filteredMotherboards), [filteredMotherboards]);

  useEffect(() => {
    const allowedProcessorNames = new Set<string>(filteredProcessors.map((p) => p.name));
    const allowedMotherboardNames = new Set<string>(filteredMotherboards.map((m) => m.name));

    setSelections((prev) => {
      const next: PremiumSelections = { ...prev };
      if (!allowedProcessorNames.has(prev.processor)) {
        next.processor = filteredProcessors[0]?.name || prev.processor;
      }
      if (!allowedMotherboardNames.has(prev.motherboard)) {
        next.motherboard = filteredMotherboards[0]?.name || prev.motherboard;
      }
      return next;
    });
  }, [filteredProcessors, filteredMotherboards]);

  useEffect(() => {
    setSelections((prev) => {
      if (prev.hd === "Sem HD" && prev.hdQuantity !== "Nenhum") {
        return { ...prev, hdQuantity: "Nenhum" };
      }
      if (prev.hd !== "Sem HD" && prev.hdQuantity === "Nenhum") {
        return { ...prev, hdQuantity: "1 unidade" };
      }
      return prev;
    });
  }, [selections.hd, selections.hdQuantity]);

  useEffect(() => {
    const presetId = (searchParams.get("preset") || "").trim();
    if (!presetId) return;
    const preset = presets[presetId];
    if (!preset) return;

    setSelections((prev) => {
      const merged: PremiumSelections = { ...prev, ...preset } as PremiumSelections;
      return merged;
    });
  }, [searchParams]);

  const whatsappMessage = useMemo(() => {
    const lines = [
      "Olá, quero montar um PC Premium no Balão da Informática.",
      "",
      `Finalidade de uso: ${selections.purpose}`,
      `Plataforma: ${selections.platform}`,
      `Processador: ${selections.processor}`,
      `Placa-mãe: ${selections.motherboard}`,
      `Water cooler: ${selections.waterCooler}`,
      `Placa de vídeo: ${selections.gpu}`,
      `Memória RAM: ${selections.memory}`,
      `SSD: ${selections.ssd}`,
      `Quantidade de SSD: ${selections.ssdQuantity}`,
      `HD: ${selections.hd}`,
      `Quantidade de HD: ${selections.hdQuantity}`,
      `Fonte: ${selections.powerSupply}`,
      `Gabinete: ${selections.case}`,
      `Faixa de orçamento: ${selections.budget}`,
      "",
      "Pode me ajudar com esse orçamento?",
    ];
    return lines.join("\n");
  }, [selections]);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(whatsappMessage)}`;
  }, [whatsappMessage]);

  const purposeItems: GridItem[] = premiumPartsCatalog.purposes.map((p) => ({ value: p, title: p }));

  const waterCoolerItems = useMemo(() => toGridItems(premiumPartsCatalog.waterCoolers), []);
  const gpuItems = useMemo(() => toGridItems(premiumPartsCatalog.gpus), []);
  const memoryItems = useMemo(() => toGridItems(premiumPartsCatalog.memories), []);
  const ssdItems = useMemo(() => toGridItems(premiumPartsCatalog.ssds), []);
  const hdItems = useMemo(() => toGridItems(premiumPartsCatalog.hds), []);
  const psuItems = useMemo(() => toGridItems(premiumPartsCatalog.powerSupplies), []);
  const caseItems = useMemo(() => toGridItems(premiumPartsCatalog.cases), []);

  const ssdQuantityItems: GridItem[] = premiumPartsCatalog.ssdQuantities.map((q) => ({
    value: q,
    title: q,
    subtitle: q === "1 unidade" ? "Simples e direto" : "Mais espaço/organização",
  }));

  const hdQuantityItems: GridItem[] = premiumPartsCatalog.hdQuantities.map((q) => ({
    value: q,
    title: q,
    subtitle: q === "Nenhum" ? "Somente SSD" : "Armazenamento extra",
  }));

  const budgetItems: GridItem[] = premiumPartsCatalog.budgets.map((b) => ({ value: b, title: b }));

  const pricing = useMemo(() => {
    const getItemPrice = (list: readonly { name: string; price?: number | null }[], name: string) =>
      list.find((i) => i.name === name)?.price ?? null;

    const parseQty = (label: string) => {
      const m = label.match(/(\d+)/);
      if (!m) return 0;
      const n = Number(m[1]);
      return Number.isFinite(n) ? n : 0;
    };

    const ssdQty = parseQty(selections.ssdQuantity);
    const hdQty = selections.hdQuantity === "Nenhum" ? 0 : parseQty(selections.hdQuantity);

    const parts: Array<{ label: string; price: number | null }> = [
      { label: "Processador", price: getItemPrice(premiumPartsCatalog.processors, selections.processor) },
      { label: "Placa-mãe", price: getItemPrice(premiumPartsCatalog.motherboards, selections.motherboard) },
      { label: "Water cooler", price: getItemPrice(premiumPartsCatalog.waterCoolers, selections.waterCooler) },
      { label: "Placa de vídeo", price: getItemPrice(premiumPartsCatalog.gpus, selections.gpu) },
      { label: "Memória RAM", price: getItemPrice(premiumPartsCatalog.memories, selections.memory) },
      { label: "Fonte", price: getItemPrice(premiumPartsCatalog.powerSupplies, selections.powerSupply) },
      { label: "Gabinete", price: getItemPrice(premiumPartsCatalog.cases, selections.case) },
    ];

    const ssdUnit = getItemPrice(premiumPartsCatalog.ssds, selections.ssd);
    const hdUnit = getItemPrice(premiumPartsCatalog.hds, selections.hd);

    const missing = [
      ...parts.filter((p) => p.price == null).map((p) => p.label),
      ...(ssdUnit == null ? ["SSD"] : []),
      ...(hdUnit == null ? ["HD"] : []),
    ];

    const subtotal =
      parts.reduce((sum, p) => sum + (p.price ?? 0), 0) +
      (ssdUnit != null ? ssdUnit * Math.max(1, ssdQty) : 0) +
      (hdUnit != null ? hdUnit * Math.max(0, hdQty) : 0);

    return {
      subtotal,
      missingCount: missing.length,
      missingLabels: missing,
      ssdQty: Math.max(1, ssdQty),
      hdQty: Math.max(0, hdQty),
      ssdUnit,
      hdUnit,
    };
  }, [selections]);

  const summary = (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-extrabold text-white">Resumo do seu PC Premium</div>
          <div className="mt-1 text-xs text-white/60">Orçamento personalizado pelo WhatsApp</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-white/85">
          {pricing.subtotal > 0 ? `Estimativa: ${brl.format(pricing.subtotal)}` : "Preço final sob consulta"}
        </div>
      </div>
      {pricing.missingCount > 0 ? (
        <div className="mt-3 text-xs text-white/55">Itens sob consulta: {pricing.missingCount}</div>
      ) : null}

      <div className="mt-5">
        <SummaryRow label="Finalidade" value={selections.purpose} />
        <SummaryRow label="Plataforma" value={selections.platform} />
        <SummaryRow label="Processador" value={selections.processor} />
        <SummaryRow label="Placa-mãe" value={selections.motherboard} />
        <SummaryRow label="Water cooler" value={selections.waterCooler} />
        <SummaryRow label="Placa de vídeo" value={selections.gpu} />
        <SummaryRow label="Memória RAM" value={selections.memory} />
        <SummaryRow label="SSD" value={selections.ssd} />
        <SummaryRow label="Quantidade de SSD" value={selections.ssdQuantity} />
        <SummaryRow label="HD" value={selections.hd} />
        <SummaryRow label="Quantidade de HD" value={selections.hdQuantity} />
        <SummaryRow label="Fonte" value={selections.powerSupply} />
        <SummaryRow label="Gabinete" value={selections.case} />
        <SummaryRow label="Faixa de orçamento" value={selections.budget} />
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label="Enviar configuração completa no WhatsApp"
      >
        Enviar configuração no WhatsApp
        <ArrowUpRight className="h-5 w-5" />
      </a>
      <div className="mt-3 text-xs leading-relaxed text-white/55">
        O valor final depende da disponibilidade de peças, marcas, modelos e condições comerciais no momento do orçamento.
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-8">
      <div className="mb-8">
        <div className="text-sm font-extrabold text-white/95">Imagens ilustrativas</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {setupImages.map((img) => (
            <div key={img.src} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <div className="relative aspect-[16/10] w-full">
                <SafeImage
                  src={img.src}
                  fallbackSrc="/images/pc.webp"
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 220px"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-8">
          <ChoiceGrid
            label="Finalidade de uso"
            icon={Shield}
            items={purposeItems}
            value={selections.purpose}
            onChange={(v) => setSelections((s) => ({ ...s, purpose: v }))}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          />

          <ChoiceGrid
            label="Plataforma"
            icon={Microchip}
            items={platformItems}
            value={selections.platform}
            onChange={(v) => setSelections((s) => ({ ...s, platform: v as PremiumPlatform }))}
            columns="grid-cols-1 sm:grid-cols-3"
          />

          <ChoiceGrid
            label="Processador"
            icon={Cpu}
            items={processorItems}
            value={selections.processor}
            onChange={(v) => setSelections((s) => ({ ...s, processor: v }))}
            columns="grid-cols-1 sm:grid-cols-2"
          />

          <ChoiceGrid
            label="Placa-mãe"
            icon={Server}
            items={motherboardItems}
            value={selections.motherboard}
            onChange={(v) => setSelections((s) => ({ ...s, motherboard: v }))}
            columns="grid-cols-1 sm:grid-cols-2"
          />

          <ChoiceGrid
            label="Water cooler"
            icon={Fan}
            items={waterCoolerItems}
            value={selections.waterCooler}
            onChange={(v) => setSelections((s) => ({ ...s, waterCooler: v }))}
            columns="grid-cols-1 sm:grid-cols-3"
            help="Refrigeração ajuda a manter desempenho estável em jogos e trabalhos pesados."
          />

          <ChoiceGrid
            label="Placa de vídeo"
            icon={Monitor}
            items={gpuItems}
            value={selections.gpu}
            onChange={(v) => setSelections((s) => ({ ...s, gpu: v }))}
            columns="grid-cols-1 sm:grid-cols-2"
            help="RTX 5060 foca em Full HD/competitivo. RTX 5070/5070 Ti equilibra 1440p/stream/edição. RTX 5080/5090 é para 4K, render, IA e projetos extremos."
          />

          <ChoiceGrid
            label="Memória RAM"
            icon={Database}
            items={memoryItems}
            value={selections.memory}
            onChange={(v) => setSelections((s) => ({ ...s, memory: v }))}
            columns="grid-cols-1 sm:grid-cols-2"
            help="16GB: jogos e uso diário. 32GB: recomendado para jogos atuais, edição e streaming. 64GB+: ideal para workstation, arquitetura, render e projetos pesados."
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <ChoiceGrid
              label="SSD"
              icon={HardDrive}
              items={ssdItems}
              value={selections.ssd}
              onChange={(v) => setSelections((s) => ({ ...s, ssd: v }))}
              columns="grid-cols-1"
              help="SSD 1TB: sistema e programas. SSD 2TB: melhor equilíbrio. SSD 4TB/8TB: ideal para vídeos e projetos grandes."
            />
            <ChoiceGrid
              label="Quantidade de SSD"
              icon={HardDrive}
              items={ssdQuantityItems}
              value={selections.ssdQuantity}
              onChange={(v) => setSelections((s) => ({ ...s, ssdQuantity: v }))}
              columns="grid-cols-2 sm:grid-cols-3"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <ChoiceGrid
              label="HD"
              icon={Database}
              items={hdItems}
              value={selections.hd}
              onChange={(v) => setSelections((s) => ({ ...s, hd: v }))}
              columns="grid-cols-1"
              help="HD é ideal para arquivos, backup e acervo. Se preferir só velocidade, escolha “Sem HD”."
            />
            <ChoiceGrid
              label="Quantidade de HD"
              icon={Database}
              items={hdQuantityItems}
              value={selections.hdQuantity}
              onChange={(v) => setSelections((s) => ({ ...s, hdQuantity: v }))}
              columns="grid-cols-2 sm:grid-cols-3"
            />
          </div>

          <ChoiceGrid
            label="Fonte"
            icon={Zap}
            items={psuItems}
            value={selections.powerSupply}
            onChange={(v) => setSelections((s) => ({ ...s, powerSupply: v }))}
            columns="grid-cols-1 sm:grid-cols-3"
            help="Fonte de qualidade entrega energia com segurança para todos os componentes."
          />

          <ChoiceGrid
            label="Gabinete"
            icon={Server}
            items={caseItems}
            value={selections.case}
            onChange={(v) => setSelections((s) => ({ ...s, case: v }))}
            columns="grid-cols-1 sm:grid-cols-2"
            help="Gabinete define visual, airflow, espaço interno e acabamento do projeto."
          />

          <ChoiceGrid
            label="Faixa de orçamento"
            icon={Shield}
            items={budgetItems}
            value={selections.budget}
            onChange={(v) => setSelections((s) => ({ ...s, budget: v }))}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
            As peças e marcas podem variar conforme disponibilidade em estoque. O especialista do Balão da Informática poderá sugerir opções equivalentes ou superiores para manter desempenho, compatibilidade e melhor custo-benefício.
          </div>

          <div className="lg:hidden">{summary}</div>
        </div>

        <div className="hidden lg:block lg:sticky lg:top-24">{summary}</div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-20 px-4 sm:px-6 lg:hidden">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-base font-extrabold text-white shadow-2xl shadow-[#25D366]/20 transition hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Enviar configuração no WhatsApp"
        >
          Enviar configuração
          <ArrowUpRight className="h-5 w-5" />
        </a>
      </div>

      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
