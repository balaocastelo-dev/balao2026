import { VitrineCategory, VitrineCommercialCopy, VitrineExtractedParts } from "./types";

function stripDiacritics(input: string) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function toSlug(input: string) {
  return stripDiacritics(String(input || ""))
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeInputText(input: string) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .replace(/[|•]/g, " ")
    .trim();
}

function titleCase(input: string) {
  return String(input || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function pickFirstMatch(text: string, patterns: RegExp[]) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[0]) return m[0].trim();
  }
  return "";
}

function findAllMatches(text: string, re: RegExp) {
  const out: string[] = [];
  const rx = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  let m: RegExpExecArray | null = null;
  while ((m = rx.exec(text)) !== null) {
    if (m[0]) out.push(m[0].trim());
  }
  return out;
}

function bestByNumber(matches: string[]) {
  let best = "";
  let bestScore = -1;
  for (const m of matches) {
    const num = Number((m.match(/\d+/) || [])[0] || 0);
    if (Number.isFinite(num) && num > bestScore) {
      bestScore = num;
      best = m;
    }
  }
  return best;
}

export function inferCategoryFromText(text: string): VitrineCategory | "" {
  const t = stripDiacritics(text).toLowerCase();
  if (/\bworkstation\b/.test(t)) return "Workstation";
  if (/\b(pc\s*)?gamer\b/.test(t)) return "PC Gamer";
  if (/\barquitetur(a|o)\b|\bcad\b|\brevit\b|\bsketchup\b/.test(t)) return "PC para arquitetura";
  if (/\bedic(a|a)o\b|\bvideo\b|\bafter\b|\bpremiere\b|\bdavinci\b/.test(t)) return "PC para edição";
  if (/\bprogram(a|a)c(a|a)o\b|\bdev\b|\bdeveloper\b|\bcodigo\b|\bprogramador\b/.test(t)) return "PC para programação";
  if (/\bescritorio\b|\boffice\b|\bcontabil\b|\bfinanceir\b/.test(t)) return "PC para escritório";
  if (/\bcusto\b|\bbeneficio\b|\beconomico\b|\bbasico\b/.test(t)) return "PC custo-benefício";
  return "";
}

function guessApplications(parts: VitrineExtractedParts) {
  const apps = new Set<string>();

  const cpu = stripDiacritics(parts.processador || "").toLowerCase();
  const gpu = stripDiacritics(parts.placa_video || "").toLowerCase();
  const ram = stripDiacritics(parts.memoria_ram || "").toLowerCase();
  const storage = stripDiacritics(parts.armazenamento || "").toLowerCase();

  const ramGb = Number((ram.match(/(\d+)\s*gb/i) || [])[1] || 0);
  const hasGpu = Boolean(gpu);
  const isHighRam = ramGb >= 32;
  const isVeryHighRam = ramGb >= 64;
  const isHighCpu = /\b(ryzen\s*[79]|core\s*i[79]|xeon)\b/.test(cpu);
  const isNvme = /\bnvme\b/.test(storage);

  if (hasGpu) {
    apps.add("Jogos de alto nível");
    apps.add("Streaming");
    apps.add("Produtividade avançada");
  }

  if (isHighCpu || isNvme) {
    apps.add("Programação");
    apps.add("Produtividade avançada");
  }

  if (hasGpu && (isHighCpu || isHighRam)) {
    apps.add("Edição de vídeo");
    apps.add("Modelagem 3D");
    apps.add("Arquitetura / CAD");
    apps.add("IA e Machine Learning");
  }

  if (!hasGpu && isHighCpu && isHighRam) {
    apps.add("Programação");
    apps.add("Produtividade avançada");
    apps.add("Edição de vídeo");
  }

  if (isVeryHighRam) {
    apps.add("Multitarefas avançadas");
  }

  if (apps.size === 0) {
    apps.add("Produtividade");
    apps.add("Estudos");
    apps.add("Uso geral");
  }

  return Array.from(apps);
}

export function extractParts(textInput: string, selectedCategory?: VitrineCategory): VitrineExtractedParts {
  const raw = normalizeInputText(textInput);
  const text = stripDiacritics(raw);

  const cpu = pickFirstMatch(text, [
    /\bAMD\s*Ryzen\s*(?:[3-9])\s*\d{4,5}[A-Z]?\b/i,
    /\bRyzen\s*(?:[3-9])\s*\d{4,5}[A-Z]?\b/i,
    /\bIntel\s*Core\s*i[3-9]\s*\d{4,5}[A-Z]?\b/i,
    /\bCore\s*i[3-9]\s*\d{4,5}[A-Z]?\b/i,
    /\bXeon\s*[A-Za-z0-9-]+\b/i,
  ]);

  const gpuRaw = pickFirstMatch(text, [
    /\bRTX\s*\d{3,4}\s*Ti\b/i,
    /\bRTX\s*\d{3,4}\b/i,
    /\bGTX\s*\d{3,4}\b/i,
    /\bRX\s*\d{4,5}\s*(?:XT|XTX)?\b/i,
  ]);
  const vram = pickFirstMatch(text, [/\b(\d{1,2})\s*GB\s*(?:GDDR6X|GDDR6|GDDR5X|GDDR5)\b/i, /\b(\d{1,2})\s*GB\b/i]);
  const gpuModel = gpuRaw ? titleCase(gpuRaw) + (vram ? ` ${vram.toUpperCase()}` : "") : "";
  const gpuFinal = gpuModel
    ? /^rx/i.test(gpuRaw || "")
      ? `AMD Radeon ${gpuModel}`
      : /^rtx|^gtx/i.test(gpuRaw || "")
        ? `NVIDIA GeForce ${gpuModel}`
        : gpuModel
    : "";

  const ramMatches = findAllMatches(text, /\b(\d{1,3})\s*GB\s*(DDR[345])?\b/i);
  const ramBest = bestByNumber(ramMatches);
  const ram = ramBest ? ramBest.toUpperCase().replace(/\s+/g, " ") : "";

  const storageNvme = pickFirstMatch(text, [/\b(\d+(?:[.,]\d+)?)\s*TB\s*NVMe\b/i, /\b(\d{3,4})\s*GB\s*NVMe\b/i]);
  const storageSsd = pickFirstMatch(text, [/\b(\d+(?:[.,]\d+)?)\s*TB\s*SSD\b/i, /\b(\d{3,4})\s*GB\s*SSD\b/i]);
  const storageHdd = pickFirstMatch(text, [/\b(\d+(?:[.,]\d+)?)\s*TB\s*HDD\b/i]);
  const storage = (storageNvme || storageSsd || storageHdd || "").toUpperCase().replace(/\s+/g, " ");

  const os = pickFirstMatch(text, [
    /\bWindows\s*11\b/i,
    /\bWindows\s*10\b/i,
    /\bW11\b/i,
    /\bW10\b/i,
  ]);
  const osNorm = os ? (/\bW11\b/i.test(os) ? "Windows 11" : /\bW10\b/i.test(os) ? "Windows 10" : titleCase(os)) : "";

  const cooling = pickFirstMatch(text, [
    /\bWater\s*Cooler\s*\d{2,3}\s*mm\b/i,
    /\bWater\s*Cooler\b/i,
    /\bAir\s*Cooler\b/i,
    /\bResfriamento\b/i,
    /\bCooler\b/i,
  ]);
  const coolingNorm = cooling ? titleCase(cooling) : "Resfriamento eficiente";

  const inferredCategory = selectedCategory || inferCategoryFromText(text) || "PC Gamer";

  const parts: VitrineExtractedParts = {
    processador: cpu ? titleCase(cpu.replace(/\s+/g, " ")) : undefined,
    placa_video: gpuFinal || (gpuRaw ? titleCase(gpuRaw) : undefined),
    memoria_ram: ram || undefined,
    armazenamento: storage || undefined,
    sistema_operacional: osNorm || undefined,
    resfriamento: coolingNorm || undefined,
    categoria: inferredCategory,
  };

  parts.aplicacoes = guessApplications(parts);
  return parts;
}

export function extractExtrasFromText(textInput: string) {
  const raw = String(textInput || "");
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const blob = raw.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n");
  const norm = stripDiacritics(blob.replace(/\s+/g, " ")).toLowerCase();

  const sanitize = (value: string) => {
    const v = String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[•|]+/g, " ")
      .trim();
    if (!v) return "";
    const cut = v
      .split("  ")[0]
      .split(" | ")[0]
      .split(" Ir para ")[0]
      .trim();
    const capped = cut.length > 200 ? cut.slice(0, 200).trim() : cut;
    if (/\bhttps?:\/\//i.test(capped)) return "";
    return capped;
  };

  const find = (labels: string[]) => {
    for (const label of labels) {
      const re = new RegExp(`${label}\\s*[:\\-]\\s*([^\\n\\r]+)`, "i");
      const m = raw.match(re);
      if (m?.[1]) return sanitize(m[1]);
    }
    return "";
  };

  const fromLines = (labels: string[]) => {
    const ls = labels.map((l) => stripDiacritics(l).toLowerCase());
    for (const line of lines) {
      const nl = stripDiacritics(line).toLowerCase();
      for (const l of ls) {
        if (nl.startsWith(l + ":") || nl.startsWith(l + " -") || nl.startsWith(l + "–")) {
          const idx = line.indexOf(":");
          if (idx >= 0) return sanitize(line.slice(idx + 1));
          const dash = line.indexOf("-");
          if (dash >= 0) return sanitize(line.slice(dash + 1));
        }
      }
    }
    return "";
  };

  const extras: Record<string, string> = {};

  const gabinete = fromLines(["Gabinete"]) || find(["Gabinete"]);
  if (gabinete) extras.gabinete = gabinete;

  const fonte = fromLines(["Fonte", "Fonte de alimentação", "Fonte de alimentacao"]) || find(["Fonte de alimentação", "Fonte"]);
  if (fonte) extras.fonte = fonte;

  const placaMae =
    fromLines(["Placa mãe", "Placa mae", "Motherboard"]) || find(["Placa mãe", "Placa mae", "Motherboard", "Chipset"]);
  if (placaMae) extras.placa_mae = placaMae;

  const monitor = fromLines(["Monitor"]) || find(["Monitor"]);
  if (monitor) extras.monitor = monitor;

  const teclado = fromLines(["Teclado"]) || find(["Teclado"]);
  if (teclado) extras.teclado = teclado;

  const mouse = fromLines(["Mouse"]) || find(["Mouse"]);
  if (mouse) extras.mouse = mouse;

  const mousepad = fromLines(["Mouse pad", "Mousepad"]) || find(["Mouse pad", "Mousepad"]);
  if (mousepad) extras.mouse_pad = mousepad;

  const headset = fromLines(["Headset"]) || find(["Headset"]);
  if (headset) extras.headset = headset;

  const soquete = norm.match(/\bsocket\s*[:\-]?\s*([a-z0-9]+)/i)?.[1] || "";
  if (soquete) extras.socket = soquete.toUpperCase();

  const chipset = norm.match(/\bchipset\s*[:\-]?\s*([a-z0-9 ]{2,30})/i)?.[1] || "";
  if (chipset) extras.chipset = chipset.trim().toUpperCase();

  const wifi = /\bwifi\b/.test(norm) ? "Wi‑Fi" : "";
  if (wifi) extras.wifi = wifi;

  return extras;
}

export function makeCommercialCopy(nomePc: string, parts: VitrineExtractedParts): VitrineCommercialCopy {
  const name = nomePc.trim() || "PC Exclusivo";
  const cpu = parts.processador || "Processador moderno";
  const gpu = parts.placa_video || "Placa de vídeo dedicada";
  const ram = parts.memoria_ram || "Memória de alta capacidade";
  const storage = parts.armazenamento || "Armazenamento rápido";
  const os = parts.sistema_operacional || "Sistema atualizado";
  const cooling = parts.resfriamento || "Resfriamento eficiente";
  const apps = (parts.aplicacoes || []).slice(0, 6);

  const heroSubtitle =
    "Desempenho e estabilidade para quem exige potência, fluidez e eficiência em cada detalhe.";

  const shortDescription = `Conheça o ${name} com ${cpu}, ${gpu}, ${ram}, ${storage} e ${os}. Uma configuração pensada para entregar velocidade, estabilidade e ótima experiência no dia a dia.`;

  return {
    heroSubtitle,
    shortDescription,
    processorText:
      "Processador moderno, ideal para produtividade, multitarefas, edição, programação e aplicações exigentes com resposta rápida e estabilidade.",
    ramText:
      "Memória de alta velocidade para fluxos de trabalho intensos, projetos complexos e multitarefa sem travamentos.",
    storageText:
      "Armazenamento rápido para inicialização ágil, abertura instantânea de programas e carregamentos mais curtos.",
    gpuText:
      "Potência gráfica para renderização, criação, edição e jogos com ótima qualidade, com suporte para recursos modernos de aceleração.",
    coolingText:
      "Sistema de resfriamento otimizado para manter a máquina fria, silenciosa e estável mesmo em uso intenso.",
    applicationsText:
      apps.length > 0
        ? `Ideal para ${apps.slice(0, 3).join(", ").toLowerCase()} e muito mais — uma máquina pronta para crescer com suas necessidades.`
        : "Uma máquina versátil para trabalho, estudos e entretenimento com excelente equilíbrio.",
  };
}

export function pickPcHeroImage(parts: VitrineExtractedParts) {
  const category = parts.categoria || "PC Gamer";
  const t = stripDiacritics(category).toLowerCase();
  if (t.includes("workstation")) return "/images/pcs/workstation.svg";
  if (t.includes("escritorio")) return "/images/pcs/escritorio.svg";
  if (t.includes("edicao")) return "/images/pcs/edicao.svg";
  if (t.includes("arquitetura")) return "/images/pcs/arquitetura.svg";
  if (t.includes("programacao")) return "/images/pcs/programacao.svg";
  if (t.includes("custo")) return "/images/pcs/custo-beneficio.svg";
  return "/images/pcs/pc-gamer.svg";
}

export function pickComponentImage(kind: "cpu" | "gpu" | "ram" | "storage" | "cooling", parts: VitrineExtractedParts) {
  const cpu = stripDiacritics(parts.processador || "").toLowerCase();
  const gpu = stripDiacritics(parts.placa_video || "").toLowerCase();
  const ram = stripDiacritics(parts.memoria_ram || "").toLowerCase();
  const cooling = stripDiacritics(parts.resfriamento || "").toLowerCase();

  if (kind === "cpu") {
    if (cpu.includes("intel") || cpu.includes("core")) return "/images/cpu/intel.svg";
    return "/images/cpu/amd.svg";
  }
  if (kind === "gpu") {
    if (gpu.includes("rx") || gpu.includes("radeon") || gpu.includes("amd")) return "/images/gpu/amd.svg";
    return "/images/gpu/nvidia.svg";
  }
  if (kind === "ram") {
    if (ram.includes("ddr5")) return "/images/ram/ddr5.svg";
    return "/images/ram/ddr4.svg";
  }
  if (kind === "storage") {
    return "/images/storage/nvme.svg";
  }
  if (kind === "cooling") {
    if (cooling.includes("water")) return "/images/cooling/water.svg";
    return "/images/cooling/air.svg";
  }
  return "/images/pcs/pc-gamer.svg";
}

export function buildRecommendedSlug(parts: VitrineExtractedParts, fallbackName: string) {
  const category = parts.categoria || inferCategoryFromText(fallbackName) || "PC Gamer";
  const catSlug = (() => {
    const t = stripDiacritics(category).toLowerCase();
    if (t.includes("workstation")) return "pc-workstation";
    if (t.includes("pc gamer") || t.includes("gamer")) return "pc-gamer";
    if (t.includes("escritorio")) return "pc-escritorio";
    if (t.includes("edicao")) return "pc-edicao";
    if (t.includes("arquitetura")) return "pc-arquitetura";
    if (t.includes("programacao")) return "pc-programacao";
    if (t.includes("custo")) return "pc-custo-beneficio";
    return "pc";
  })();

  const cpuSlug = parts.processador ? toSlug(parts.processador) : "";
  const gpuSlugRaw = parts.placa_video ? toSlug(parts.placa_video) : "";
  const gpuSlug = gpuSlugRaw
    .replace(/^nvidia-geforce-/, "")
    .replace(/^amd-radeon-/, "")
    .replace(/-\d{1,2}gb\b/, "")
    .replace(/-gddr\d+x?\b/, "")
    .replace(/-gddr\d+\b/, "")
    .replace(/-geforce\b/, "")
    .replace(/-radeon\b/, "");

  const pieces = [catSlug, cpuSlug, gpuSlug].filter(Boolean);
  const out = pieces.join("-");
  const cleaned = out.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned || toSlug(fallbackName) || "pc";
}
