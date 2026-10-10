// ============================================================
// Ficha técnica lida do nome do produto.
//
// Os computadores entram no catálogo pelo espelhamento e chegam sem ficha
// preenchida: tudo o que se sabe da máquina está no título, do jeito que o
// vendedor de origem escreveu ("PC Gamer | Workstation - Amd Ryzen 7 9800x3d,
// Geforce RTX 5070 Ti 16gb, 64gb Ddr5, SSD 2TB Nvme, Fonte 850w ...").
//
// Aqui esse título vira dado: processador, placa de vídeo, memória da placa
// (VRAM), memória RAM e armazenamento. É o que permite à página Premium
// mostrar uma ficha limpa e à categoria de IA local escolher as máquinas por
// regra, em vez de alguém marcar produto por produto.
//
// Tudo é função pura e conservadora: na dúvida, o campo fica vazio. Uma ficha
// incompleta só deixa de mostrar uma linha; uma ficha inventada vende uma
// máquina que não existe.
// ============================================================

import type { Product } from "@/lib/utils";

export type TipoDeMaquina = "desktop" | "notebook" | "imac" | "macbook" | "mac";

export interface FichaDaMaquina {
  tipo: TipoDeMaquina;
  /** "AMD Ryzen 7 9800X3D", "Intel Core i7 14700KF", "Apple M5 Max". */
  processador: string | null;
  /** "GeForce RTX 5070 Ti", "Radeon RX 6600". Vazio em placa integrada. */
  placaDeVideo: string | null;
  fabricanteDaPlaca: "nvidia" | "amd" | "intel" | null;
  /**
   * Memória da placa de vídeo dedicada, em GB. Só existe para placa que está
   * na tabela; em modelo com mais de uma versão e título mudo, é a MENOR.
   */
  vramGb: number | null;
  /**
   * `true` quando dá para afirmar o número: o modelo só existe com essa
   * memória, ou o título disse uma versão que existe. Quando é `false`, o
   * número serve para a regra (por baixo), mas não é mostrado ao cliente.
   */
  vramConfirmada: boolean;
  /** O título diz que os gráficos são integrados (Vega, UHD, "integrado"). */
  placaIntegrada: boolean;
  /** Memória RAM, em GB. Nos Apple é a memória unificada. */
  memoriaGb: number | null;
  tipoDeMemoria: "DDR3" | "DDR4" | "DDR5" | null;
  /** "SSD NVMe 2 TB", "SSD M.2 1 TB", "SSD 512 GB", "HD 1 TB" — ou só "1 TB" quando o título não diz o tipo. */
  armazenamento: string | null;
  /** Chip Apple (M1 a M5, com Pro/Max/Ultra): memória unificada. */
  appleSilicon: boolean;
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

// ---------- memória das placas de vídeo ----------
//
// Quando o título não diz quantos GB a placa tem, vale a tabela do fabricante.
// Modelo vendido em mais de uma versão (RTX 5060 Ti de 8 ou 16 GB) fica com a
// MENOR, a não ser que o título diga a maior com todas as letras.

const VRAM_DESKTOP: Record<string, number[]> = {
  "rtx 5090": [32],
  "rtx 5080": [16],
  "rtx 5070 ti": [16],
  "rtx 5070": [12],
  "rtx 5060 ti": [8, 16],
  "rtx 5060": [8],
  "rtx 5050": [8],
  "rtx 4090": [24],
  "rtx 4080 super": [16],
  "rtx 4080": [16],
  "rtx 4070 ti super": [16],
  "rtx 4070 ti": [12],
  "rtx 4070 super": [12],
  "rtx 4070": [12],
  "rtx 4060 ti": [8, 16],
  "rtx 4060": [8],
  "rtx 3090 ti": [24],
  "rtx 3090": [24],
  "rtx 3080 ti": [12],
  "rtx 3080": [10, 12],
  "rtx 3070 ti": [8],
  "rtx 3070": [8],
  "rtx 3060 ti": [8],
  "rtx 3060": [8, 12],
  "rtx 3050": [6, 8],
  "rtx 2080 ti": [11],
  "rtx 2080 super": [8],
  "rtx 2080": [8],
  "rtx 2070 super": [8],
  "rtx 2070": [8],
  "rtx 2060 super": [8],
  "rtx 2060": [6, 12],
  "gtx 1660 ti": [6],
  "gtx 1660 super": [6],
  "gtx 1660": [6],
  "gtx 1650": [4],
  "rx 9070 xt": [16],
  "rx 9070": [16],
  "rx 9060 xt": [8, 16],
  "rx 7900 xtx": [24],
  "rx 7900 xt": [20],
  "rx 7800 xt": [16],
  "rx 7700 xt": [12],
  "rx 7600 xt": [16],
  "rx 7600": [8],
  "rx 6600": [8],
};

// As placas de notebook levam o mesmo nome e menos memória.
const VRAM_NOTEBOOK: Record<string, number[]> = {
  "rtx 5090": [24],
  "rtx 5080": [16],
  "rtx 5070 ti": [12],
  "rtx 5070": [8],
  "rtx 5060": [8],
  "rtx 5050": [8],
  "rtx 4090": [16],
  "rtx 4080": [12],
  "rtx 4070": [8],
  "rtx 4060": [8],
  "rtx 4050": [6],
  "rtx 3080": [8, 16],
  "rtx 3070": [8],
  "rtx 3060": [6],
  "rtx 3050": [4, 6],
};

// ---------- tipo ----------

function lerTipo(nome: string, categoria: string): TipoDeMaquina {
  if (/\bimac\b/.test(nome)) return "imac";
  if (/\bmacbook\b/.test(nome)) return "macbook";
  if (/\bmac\s*(mini|studio|pro)\b/.test(nome)) return "mac";
  if (/notebook|laptop/.test(categoria) || /^\s*(notebook|laptop)\b/.test(nome)) return "notebook";
  return "desktop";
}

// ---------- processador ----------
//
// Os sufixos são listados um a um de propósito. Um padrão frouxo ("qualquer
// letra depois do número") transformava "Tela Ultra 165hz" em "Core Ultra
// 165HZ" e "Ryzen 5 480GB" em processador.

const sufixo = (s: string) => s.toUpperCase();

const SUFIXO_RYZEN = "(?:x3d|xt|x|gt|ge|g|f|hs|hx|h|u|s|c|e)?";
const SUFIXO_INTEL = "(?:kf|ks|k|f|t|s|hx|hk|hs|h|u|p|v)?";

const RE_RYZEN_AI = /\bryzen\s*ai\s*([3579])[\s-]+(?:hx\s*)?(\d{3})\b/;
// "ryzne" é erro de digitação que aparece de verdade nos títulos de origem.
const RE_RYZEN = new RegExp(`\\bry(?:zen|zne)\\s*([3579])[\\s-]+(?:pro\\s+)?(\\d{3,4}${SUFIXO_RYZEN})\\b`);
const RE_RYZEN_SEM_NIVEL = new RegExp(`\\bryzen\\s*(\\d{4}${SUFIXO_RYZEN})\\b`);
const RE_RYZEN_SO_NIVEL = /\bry(?:zen|zne)\s*([3579])\b/;
const RE_ULTRA = new RegExp(`\\bultra\\s*([3579])?[\\s-]*(\\d{3}${SUFIXO_INTEL})\\b`);
const RE_ULTRA_SO_NIVEL = /\bcore\s*ultra\s*([3579])\b/;
const RE_CORE = new RegExp(`\\bi([3579])\\b(?:[\\s-]*(\\d{4,5}${SUFIXO_INTEL})\\b)?`);
const RE_CORE_NOVO = /\bcore\s*([3579])[\s-]+(\d{3}(?:hx|h|u))\b/;

function nivelDoCoreUltra(modelo: string): string | null {
  // 225/235/245 = Ultra 5, 255/265 = Ultra 7, 275/285 = Ultra 9.
  const dezena = Number(modelo.charAt(1));
  if (!Number.isFinite(dezena)) return null;
  if (dezena >= 7) return "9";
  if (dezena >= 5) return "7";
  if (dezena >= 2) return "5";
  return null;
}

function lerProcessador(nome: string, tipo: TipoDeMaquina): { rotulo: string | null; apple: boolean } {
  if (tipo === "imac" || tipo === "macbook" || tipo === "mac" || /\bapple\b/.test(nome)) {
    const chip = nome.match(/\bm([1-5])\b\s*(ultra|max|pro)?/);
    if (chip) {
      const variante = chip[2] ? ` ${chip[2].charAt(0).toUpperCase()}${chip[2].slice(1)}` : "";
      return { rotulo: `Apple M${chip[1]}${variante}`, apple: true };
    }
  }

  const ryzenAi = nome.match(RE_RYZEN_AI);
  if (ryzenAi) return { rotulo: `AMD Ryzen AI ${ryzenAi[1]} ${ryzenAi[2]}`, apple: false };
  const ryzen = nome.match(RE_RYZEN);
  if (ryzen) return { rotulo: `AMD Ryzen ${ryzen[1]} ${sufixo(ryzen[2])}`, apple: false };
  const ryzenSemNivel = nome.match(RE_RYZEN_SEM_NIVEL);
  if (ryzenSemNivel) return { rotulo: `AMD Ryzen ${sufixo(ryzenSemNivel[1])}`, apple: false };
  const ryzenSoNivel = nome.match(RE_RYZEN_SO_NIVEL);
  if (ryzenSoNivel) return { rotulo: `AMD Ryzen ${ryzenSoNivel[1]}`, apple: false };

  const ultra = nome.match(RE_ULTRA);
  if (ultra) {
    const nivel = ultra[1] || nivelDoCoreUltra(ultra[2]);
    return { rotulo: `Intel Core Ultra ${nivel ? `${nivel} ` : ""}${sufixo(ultra[2])}`, apple: false };
  }
  const ultraSoNivel = nome.match(RE_ULTRA_SO_NIVEL);
  if (ultraSoNivel) return { rotulo: `Intel Core Ultra ${ultraSoNivel[1]}`, apple: false };

  const core = nome.match(RE_CORE);
  if (core) {
    if (core[2]) return { rotulo: `Intel Core i${core[1]} ${sufixo(core[2])}`, apple: false };
    const resto = nome.slice(core.index! + core[0].length);
    const geracao = resto.match(/^[\s-]*(\d{1,2})\s*(?:[ªº°]|a\b)?\s*ger/) || resto.match(/^[\s-]*(\d{1,2})\s*[ªº°]/);
    if (geracao) return { rotulo: `Intel Core i${core[1]} de ${geracao[1]}ª geração`, apple: false };
    return { rotulo: `Intel Core i${core[1]}`, apple: false };
  }

  // A linha nova da Intel perdeu o "i": "Core 5 210H".
  const coreNovo = nome.match(RE_CORE_NOVO);
  if (coreNovo) return { rotulo: `Intel Core ${coreNovo[1]} ${sufixo(coreNovo[2])}`, apple: false };

  return { rotulo: null, apple: false };
}

// ---------- placa de vídeo ----------

interface PlacaLida {
  rotulo: string;
  chave: string;
  fabricante: "nvidia" | "amd" | "intel";
  /** Posição logo depois do modelo, para achar "16gb" colado nele. */
  fim: number;
}

function lerPlaca(nome: string): PlacaLida | null {
  // RTX e GTX primeiro. "GT" sozinho só vale para os modelos que existem:
  // sem isso, o gabinete "GT502" virava placa de vídeo.
  const nvidia =
    /\b(rtx|gtx)\W{0,3}(\d{3,4})\s*(ti\s*super|ti|super)?\b/.exec(nome) ||
    /\b(gt)\W{0,3}(610|630|640|710|720|730|740|1030)()\b/.exec(nome);
  if (nvidia) {
    const variante = (nvidia[3] || "").replace(/\s+/g, " ").trim();
    const chave = `${nvidia[1]} ${nvidia[2]}${variante ? ` ${variante}` : ""}`;
    const bonito = variante
      .split(" ")
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    return {
      rotulo: `GeForce ${nvidia[1].toUpperCase()} ${nvidia[2]}${bonito ? ` ${bonito}` : ""}`,
      chave,
      fabricante: "nvidia",
      fim: nvidia.index + nvidia[0].length,
    };
  }

  const amd = /\brx\W{0,2}(\d{3,4})\s*(xtx|xt)?\b/.exec(nome);
  if (amd) {
    const variante = amd[2] || "";
    return {
      rotulo: `Radeon RX ${amd[1]}${variante ? ` ${variante.toUpperCase()}` : ""}`,
      chave: `rx ${amd[1]}${variante ? ` ${variante}` : ""}`,
      fabricante: "amd",
      fim: amd.index + amd[0].length,
    };
  }

  const arc = /\barc\s*([ab])\s*(\d{3})\b/.exec(nome);
  if (arc) {
    return {
      rotulo: `Intel Arc ${arc[1].toUpperCase()}${arc[2]}`,
      chave: `arc ${arc[1]}${arc[2]}`,
      fabricante: "intel",
      fim: arc.index + arc[0].length,
    };
  }

  return null;
}

/**
 * A placa é a versão de notebook? Além dos notebooks, os mini PCs e os "tudo
 * em um" usam chip de notebook: uma "RTX 4070" neles tem 8 GB, não 12. O
 * processador de sufixo H/HX/HS/U denuncia isso mesmo quando a categoria não.
 */
function usaPlacaDeNotebook(nome: string, tipo: TipoDeMaquina, processador: string | null): boolean {
  if (tipo === "notebook") return true;
  if (/\bmini\s*-?\s*pc\b|\bnuc\b|all\s*-?\s*in\s*-?\s*one|\btudo em um\b/.test(nome)) return true;
  return /\d(HX|HS|HK|H|U)$/.test(processador || "");
}

// ---------- memória e armazenamento ----------

interface Capacidade {
  gb: number;
  unidade: "gb" | "tb";
  inicio: number;
  /** A palavra que dá contexto antes do número, dentro do mesmo trecho do título. */
  antes: string;
  /** A palavra logo depois do número. */
  depois: string;
  /** O número abre o próprio trecho ("…, 16gb, …"): não tem vizinho à esquerda. */
  abreOTrecho: boolean;
  /** A palavra seguinte é "ssd"/"nvme" e logo vem OUTRA capacidade ("32GB SSD 1TB"). */
  discoEhDoProximo: boolean;
}

const RAM_DEPOIS = /^(ram|ddr[345]|\d{4}mhz|rgb)$/;
const RAM_ANTES = /^(ram|memoria|mem\.?)$/;
const DISCO = /^(ssd|nvme|hd|hdd|m\.?2|pcie|sata|emmc)$/;
const PLACA_ANTES = /^(rtx|gtx|gt|geforce|radeon|rx|vga|video|nvidia|gpu)$/;
const DA_CONTEXTO = (p: string) => DISCO.test(p) || RAM_ANTES.test(p) || PLACA_ANTES.test(p);

function capacidades(nome: string): Capacidade[] {
  const saida: Capacidade[] = [];
  const padrao = /(\d{1,4})\s*(gb|tb)\b/g;
  const palavras = (trecho: string) => trecho.trim().split(/\s+/).filter(Boolean);
  let m: RegExpExecArray | null;
  while ((m = padrao.exec(nome))) {
    const valor = Number(m[1]);
    const unidade = m[2] as "gb" | "tb";
    // O "trecho" é o que está entre separadores: o contexto de "16gb" em
    // "RTX 3060, 16gb, SSD 1TB" é só "16gb", não a placa nem o disco.
    const esquerda = palavras(nome.slice(0, m.index).split(/[,|/+;()]| - /).pop() || "");
    const direita = palavras(nome.slice(m.index + m[0].length).split(/[,|/+;()]| - /)[0] || "");
    // Vale a palavra vizinha; se ela não disser nada, até duas casas atrás
    // ("SSD M.2 PCie 512gb", "Memória Ram 16gb").
    const vizinha = esquerda[esquerda.length - 1] || "";
    const antes = DA_CONTEXTO(vizinha) ? vizinha : [...esquerda].reverse().slice(1, 3).find(DA_CONTEXTO) || vizinha;
    saida.push({
      gb: unidade === "tb" ? valor * 1024 : valor,
      unidade,
      inicio: m.index,
      antes,
      depois: direita[0] || "",
      abreOTrecho: esquerda.length === 0,
      discoEhDoProximo: DISCO.test(direita[0] || "") && /^\d{1,4}(gb|tb)?$/.test(direita[1] || ""),
    });
  }
  return saida;
}

function rotuloDeCapacidade(gb: number): string {
  if (gb >= 1024) {
    const tb = gb / 1024;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1).replace(".", ",")} TB`;
  }
  return `${gb} GB`;
}

const MEMORIAS_COMUNS = [4, 6, 8, 12, 16, 18, 24, 32, 36, 48, 64, 96];
const MEMORIAS_GRANDES = [128, 192, 256];

// ---------- leitura completa ----------

export function lerFicha(produto: Pick<Product, "name" | "category">): FichaDaMaquina {
  const nome = semAcento(produto.name).replace(/[™®]/g, " ");
  const categoria = semAcento(produto.category);
  const tipo = lerTipo(nome, categoria);
  const processador = lerProcessador(nome, tipo);
  const placa = processador.apple ? null : lerPlaca(nome);
  const versoes = placa
    ? (usaPlacaDeNotebook(nome, tipo, processador.rotulo) ? VRAM_NOTEBOOK : VRAM_DESKTOP)[placa.chave]
    : undefined;

  let vramDita: number | null = null;
  /** "RX580 8GB DDR5", "Gtx 750 4gb Ram 16gb": colado na placa E com cara de RAM. */
  let coladaComCaraDeRam: number | null = null;
  let memoriaDita: number | null = null;
  const soltas: Capacidade[] = [];
  /** "128GB" sem palavra nenhuma: disco pequeno ou memória grande. */
  const grandesSoltas: Capacidade[] = [];
  const discos: (Capacidade & { tipo: "ssd" | "hd" | "indefinido" })[] = [];

  for (const c of capacidades(nome)) {
    const ramExplicita = RAM_DEPOIS.test(c.depois) || RAM_ANTES.test(c.antes);
    const comPalavraDeDisco = DISCO.test(c.antes) || (DISCO.test(c.depois) && !c.discoEhDoProximo);

    // Disco: tudo em TB e todo "GB" grande demais para ser memória.
    if (c.unidade === "tb" || c.gb >= 100) {
      if (c.unidade === "gb" && MEMORIAS_GRANDES.includes(c.gb) && !comPalavraDeDisco) {
        if (ramExplicita) {
          if (memoriaDita == null) memoriaDita = c.gb;
        } else {
          grandesSoltas.push(c);
        }
        continue;
      }
      const hd = /^(hd|hdd)$/.test(c.antes) || (/^(hd|hdd)$/.test(c.depois) && !c.discoEhDoProximo);
      discos.push({ ...c, tipo: hd ? "hd" : comPalavraDeDisco ? "ssd" : "indefinido" });
      continue;
    }

    // Daqui para baixo o número é pequeno: memória da placa ou RAM.
    const coladaNaPlaca = placa != null && c.inicio >= placa.fim && /^\s*$/.test(nome.slice(placa.fim, c.inicio));
    if (coladaNaPlaca && ramExplicita) {
      if (coladaComCaraDeRam == null) coladaComCaraDeRam = c.gb;
      continue;
    }
    if (!ramExplicita && (coladaNaPlaca || PLACA_ANTES.test(c.antes))) {
      if (vramDita == null) vramDita = c.gb;
      continue;
    }
    if (ramExplicita) {
      if (memoriaDita == null) memoriaDita = c.gb;
      continue;
    }
    if (MEMORIAS_COMUNS.includes(c.gb)) soltas.push(c);
  }

  // O número colado na placa com "DDR5"/"Ram" ao lado: se o título traz OUTRA
  // memória explícita, aquele era da placa (GDDR5 escrito como DDR5). Se não
  // traz, era mesmo a RAM ("RTX 5060 32gb Ddr4").
  let textoDaMemoria = nome;
  if (coladaComCaraDeRam != null) {
    if (memoriaDita != null) {
      vramDita ??= coladaComCaraDeRam;
      // O "DDR5" colado na placa é a memória DELA; não serve para dizer o tipo da RAM.
      textoDaMemoria = nome.slice(0, placa!.fim) + nome.slice(placa!.fim).replace(/^\s*\d+\s*gb\s*ddr\d/, " ");
    } else {
      memoriaDita = coladaComCaraDeRam;
    }
  }

  // "GTX 1650, 4GB, SSD 480GB, 8GB": o primeiro número solto, logo depois da
  // placa e igual à memória dela, é da placa; a RAM é o seguinte.
  let memoriaSolta = soltas[0]?.gb ?? null;
  if (soltas.length > 1 && placa && versoes?.includes(soltas[0].gb) && soltas[0].abreOTrecho) {
    const entre = nome.slice(placa.fim, soltas[0].inicio);
    if (/^\s*[,|/;]\s*$/.test(entre)) memoriaSolta = soltas[1].gb;
  }

  // VRAM: só de placa que está na tabela; o título apenas escolhe entre as
  // versões que existem. Placa fora da tabela fica sem número — era por ali
  // que "GTX 1050 16GB" virava placa de 16 GB.
  let vramGb: number | null = null;
  let vramConfirmada = false;
  let vramEraRam = false;
  if (versoes) {
    const ditaExiste = vramDita != null && versoes.includes(vramDita);
    vramGb = ditaExiste ? vramDita : versoes[0];
    vramConfirmada = ditaExiste || (versoes.length === 1 && vramDita == null);
    // "RTX 3050 16gb SSD 960gb": não existe 3050 de 16 GB — o número colado
    // na placa era a RAM do computador.
    vramEraRam = vramDita != null && !ditaExiste;
  }

  // "128GB" solto: é a memória quando o título já tem um disco de verdade
  // (MacBook "…, 128GB, SSD 4TB"); sozinho, é o disco.
  let memoriaGrande: number | null = null;
  for (const c of grandesSoltas) {
    if (memoriaGrande == null && discos.length > 0) memoriaGrande = c.gb;
    else discos.push({ ...c, tipo: "indefinido" });
  }

  const memoriaGb =
    memoriaDita ??
    memoriaSolta ??
    memoriaGrande ??
    (vramEraRam && vramDita != null && [8, 16, 32, 64].includes(vramDita) ? vramDita : null);

  const tipoDeMemoria = textoDaMemoria.match(/\bddr([345])\b/);
  // NVMe só quando o título diz NVMe ou PCIe. "M.2" é o formato do encaixe:
  // existe M.2 SATA, então vira "SSD M.2", sem prometer a velocidade.
  const temNvme = /\bnvme\b|\bpcie\b/.test(nome);
  const temM2 = /\bm\.?2\b/.test(nome);
  let armazenamento: string | null = null;
  const disco = discos.find((d) => d.tipo === "ssd") || discos.find((d) => d.tipo === "indefinido") || discos[0];
  if (disco) {
    const tamanho = rotuloDeCapacidade(disco.gb);
    if (disco.tipo === "hd") armazenamento = `HD ${tamanho}`;
    else if (temNvme) armazenamento = `SSD NVMe ${tamanho}`;
    else if (temM2) armazenamento = `SSD M.2 ${tamanho}`;
    else if (disco.tipo === "ssd" || /\bssd\b/.test(nome)) armazenamento = `SSD ${tamanho}`;
    else armazenamento = tamanho;
  }

  return {
    tipo,
    processador: processador.rotulo,
    placaDeVideo: placa?.rotulo ?? null,
    fabricanteDaPlaca: placa?.fabricante ?? null,
    vramGb,
    vramConfirmada,
    placaIntegrada: !placa && !processador.apple && /\bvega\b|\bintegrad|\buhd\b|\biris\b|radeon graphics/.test(nome),
    memoriaGb,
    tipoDeMemoria: tipoDeMemoria ? (`DDR${tipoDeMemoria[1]}` as FichaDaMaquina["tipoDeMemoria"]) : null,
    armazenamento,
    appleSilicon: processador.apple,
  };
}

// ---------- como a máquina se chama na vitrine ----------

const curto = (rotulo: string) => rotulo.replace(/^(AMD|Intel|GeForce|Radeon|Apple)\s+/, "");

/**
 * Nome de vitrine: o que a máquina É, sem o código do montador nem a lista de
 * peças. "Ryzen 7 9800X3D com RTX 5070 Ti", "MacBook Pro 16″ M5 Max".
 */
export function tituloDaMaquina(produto: Pick<Product, "name" | "category">, ficha = lerFicha(produto)): string {
  const nome = String(produto.name || "").trim();
  const limpo = semAcento(nome);

  if (ficha.appleSilicon) {
    const linha =
      (/\bimac\b/.test(limpo) && "iMac") ||
      (/\bmacbook pro\b/.test(limpo) && "MacBook Pro") ||
      (/\bmacbook air\b/.test(limpo) && "MacBook Air") ||
      (/\bmac mini\b/.test(limpo) && "Mac mini") ||
      (/\bmac studio\b/.test(limpo) && "Mac Studio") ||
      "Mac";
    const tela = limpo.match(/\b(\d{2})(?:[.,]\d)?\s*(?:"|''|”|pol)/);
    return `${linha}${tela ? ` ${tela[1]}″` : ""} ${curto(ficha.processador || "")}`.trim();
  }

  if (ficha.tipo === "notebook") {
    const cabeca = nome
      .split(/,| - /)[0]
      .replace(/^notebook(\s+gamer)?\s+/i, "")
      .replace(/\s+(amd|intel|ryzen|core)\b.*$/i, "")
      .trim();
    if (cabeca.length >= 6 && cabeca.length <= 60) return cabeca;
  }

  if (ficha.processador && ficha.placaDeVideo) {
    return `${curto(ficha.processador)} com ${curto(ficha.placaDeVideo)}`;
  }
  if (ficha.processador) return curto(ficha.processador);

  const cabeca = nome.split(/,| - |\|/)[0].trim();
  return cabeca.length > 70 ? `${cabeca.slice(0, 67).trim()}…` : cabeca;
}

/** "Workstation", "PC com monitor", "Desktop", "iMac", "Notebook", "MacBook". */
export function tipoDeVitrine(produto: Pick<Product, "name" | "category">, ficha = lerFicha(produto)): string {
  const nome = semAcento(produto.name);
  if (ficha.tipo === "imac") return "iMac";
  if (ficha.tipo === "macbook") return "MacBook";
  if (ficha.tipo === "mac") return "Mac";
  if (ficha.tipo === "notebook") return "Notebook";
  if (/\bmonitor\b/.test(nome)) return "PC com monitor";
  if (/\bworkstation\b/.test(nome)) return "Workstation";
  return "Desktop";
}

/** "64 GB DDR5", "36 GB unificada". */
export function rotuloDeMemoria(ficha: FichaDaMaquina): string | null {
  if (ficha.memoriaGb == null) return null;
  if (ficha.appleSilicon) return `${ficha.memoriaGb} GB unificada`;
  return `${ficha.memoriaGb} GB${ficha.tipoDeMemoria ? ` ${ficha.tipoDeMemoria}` : ""}`;
}

/**
 * "GeForce RTX 5070 Ti, 16 GB". O número só aparece quando dá para afirmar;
 * "GeForce RTX 5060 Ti" sozinho quando o título não diz qual das versões é.
 * Devolve "Integrada" só quando o título diz; `null` quando não se sabe.
 */
export function rotuloDePlaca(ficha: FichaDaMaquina): string | null {
  if (ficha.appleSilicon) return ficha.processador ? `Integrada ao ${curto(ficha.processador)}` : null;
  if (!ficha.placaDeVideo) return ficha.placaIntegrada ? "Integrada" : null;
  return ficha.vramGb && ficha.vramConfirmada ? `${ficha.placaDeVideo}, ${ficha.vramGb} GB` : ficha.placaDeVideo;
}
