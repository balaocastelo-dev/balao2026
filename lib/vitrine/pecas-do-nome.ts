// ============================================================
// Ler as peças do NOME do produto sem confundir uma com a outra.
//
// Problema achado pelo Thiago em 25/10 na vitrine: "RTX 3050 16GB" — placa
// que não existe (a RTX 3050 é de 6 ou 8 GB). O extrator antigo
// (lib/vitrine/core.ts → extractParts):
//   - pegava como memória da placa o PRIMEIRO "XX GB" do nome, mesmo quando
//     era da RAM ("Geforce RTX 3050, 16gb Ddr4" virava "RTX 3050 16GB");
//   - pegava como RAM o MAIOR "XX GB" do nome, que era o SSD ("512GB");
//   - não lia SSD escrito como "SSD 512gb".
//
// Regras agora (testadas em __tests__/lib/vitrine-pecas-do-nome.test.ts):
//   1. Memória da placa só vale se estiver COLADA no modelo ("RTX 3060 12gb",
//      "Rx 6600 8GB") ou marcada como GDDR ("8GB GDDR6"). Vírgula separa peças.
//   2. E ainda tem que existir de verdade para aquele modelo (tabela abaixo).
//      Valor impossível é descartado. Modelo que só existe em uma versão
//      recebe essa versão. Modelo fora da tabela: só aceita se estiver
//      marcado como GDDR.
//   3. RAM: o número ligado a RAM/DDR/memória; senão, o primeiro tamanho de
//      RAM possível (4…128 GB) que não seja da placa nem do SSD.
//   4. SSD/HD: o número ligado a SSD/NVMe/M.2/HD, antes ou depois da palavra.
// Para incluir placa nova: acrescente o modelo em MEMORIAS_DE_VIDEO.
// ============================================================

/** Memórias (GB) que cada placa tem de verdade, pelo fabricante. */
export const MEMORIAS_DE_VIDEO: Record<string, number[]> = {
  // NVIDIA GeForce GT / GTX
  "gt 710": [1, 2], "gt 730": [2, 4], "gt 1030": [2],
  "gtx 750 ti": [2, 4], "gtx 1050": [2, 3], "gtx 1050 ti": [4], "gtx 1060": [3, 6],
  "gtx 1070": [8], "gtx 1070 ti": [8], "gtx 1080": [8], "gtx 1080 ti": [11],
  "gtx 1630": [4], "gtx 1650": [4], "gtx 1650 super": [4], "gtx 1660": [6],
  "gtx 1660 super": [6], "gtx 1660 ti": [6],
  // NVIDIA GeForce RTX
  "rtx 2060": [6, 12], "rtx 2060 super": [8], "rtx 2070": [8], "rtx 2070 super": [8],
  "rtx 2080": [8], "rtx 2080 super": [8], "rtx 2080 ti": [11],
  "rtx 3050": [6, 8], "rtx 3060": [8, 12], "rtx 3060 ti": [8], "rtx 3070": [8],
  "rtx 3070 ti": [8], "rtx 3080": [10, 12], "rtx 3080 ti": [12], "rtx 3090": [24], "rtx 3090 ti": [24],
  "rtx 4060": [8], "rtx 4060 ti": [8, 16], "rtx 4070": [12], "rtx 4070 super": [12],
  "rtx 4070 ti": [12], "rtx 4070 ti super": [16], "rtx 4080": [16], "rtx 4080 super": [16], "rtx 4090": [24],
  "rtx 5050": [8], "rtx 5060": [8], "rtx 5060 ti": [8, 16], "rtx 5070": [12], "rtx 5070 ti": [16],
  "rtx 5080": [16], "rtx 5090": [32],
  // AMD Radeon
  "rx 550": [2, 4], "rx 560": [2, 4], "rx 570": [4, 8], "rx 580": [4, 8], "rx 590": [8],
  "rx 5500 xt": [4, 8], "rx 5600 xt": [6], "rx 5700": [8], "rx 5700 xt": [8],
  "rx 6400": [4], "rx 6500 xt": [4, 8], "rx 6600": [8], "rx 6600 xt": [8], "rx 6650 xt": [8],
  "rx 6700": [10], "rx 6700 xt": [12], "rx 6750 xt": [12], "rx 6800": [16], "rx 6800 xt": [16],
  "rx 6900 xt": [16], "rx 6950 xt": [16],
  "rx 7600": [8], "rx 7600 xt": [16], "rx 7700 xt": [12], "rx 7800 xt": [16], "rx 7900 gre": [16],
  "rx 7900 xt": [20], "rx 7900 xtx": [24],
  "rx 9060 xt": [8, 16], "rx 9070": [16], "rx 9070 xt": [16],
  // Intel Arc
  "arc a380": [6], "arc a580": [8], "arc a750": [8], "arc a770": [8, 16], "arc b570": [10], "arc b580": [12],
};

const TAMANHOS_DE_RAM = new Set([4, 8, 12, 16, 24, 32, 48, 64, 96, 128]);

const sem = (t: string) =>
  String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ");

// Modelo da placa no texto (minúsculo, sem acento). Grupos: 1 família, 2 número, 3 sufixo.
const RE_PLACA =
  /\b(rtx|gtx|gt|rx|arc)\s?-?([ab]?\d{3,4})\s?((?:ti\s?super|super|ti|xtx|xt|gre))?\b/;

export interface PlacaLida {
  /** Chave da tabela: "rtx 3050", "rx 7600 xt", "arc b580". */
  chave: string;
  /** Como mostrar: "NVIDIA GeForce RTX 3050 8GB". */
  nome: string;
  modelo: string;
  memoria: number | null;
}

/** Placa de vídeo do nome, com a memória só quando ela faz sentido. */
export function lerPlaca(texto: string): PlacaLida | null {
  const t = sem(texto);
  const m = t.match(RE_PLACA);
  if (!m) return null;
  const familia = m[1];
  const numero = m[2];
  const sufixo = (m[3] || "").replace(/\s+/g, " ").trim();
  // "GT 730" só vale para gt de 3-4 dígitos; "RX" exige número de placa.
  const chave = `${familia} ${numero}${sufixo ? ` ${sufixo}` : ""}`;
  const opcoes = MEMORIAS_DE_VIDEO[chave];

  // 1. memória colada no modelo, sem vírgula no meio ("rtx 3060 12gb").
  const depois = t.slice((m.index ?? 0) + m[0].length);
  const colada = depois.match(/^\s?(?:de\s)?(\d{1,2})\s?gb\b/);
  // 2. memória marcada como GDDR em qualquer lugar ("8gb gddr6").
  // (DDR4/DDR5 sem o "G" é RAM; só GDDR5/6/6X/7 conta para a placa.)
  const gddrValido = t.match(/\b(\d{1,2})\s?gb\s?gddr[567]x?\b/);

  let memoria: number | null = null;
  const candidata = colada ? Number(colada[1]) : gddrValido ? Number(gddrValido[1]) : null;
  if (opcoes) {
    if (candidata != null && opcoes.includes(candidata)) memoria = candidata;
    else if (opcoes.length === 1) memoria = opcoes[0];
  } else if (gddrValido) {
    memoria = Number(gddrValido[1]);
  }

  const marca = familia === "rx" ? "AMD Radeon" : familia === "arc" ? "Intel Arc" : "NVIDIA GeForce";
  const modelo = `${familia === "arc" ? "" : `${familia.toUpperCase()} `}${numero.toUpperCase()}${sufixo ? ` ${sufixo.toUpperCase().replace("SUPER", "Super")}` : ""}`.trim();
  const nome = `${marca} ${modelo}${memoria ? ` ${memoria}GB` : ""}`;
  return { chave, nome, modelo, memoria };
}

/** Memória RAM do nome ("16GB DDR4"), sem confundir com placa ou SSD. */
export function lerRam(texto: string): string {
  // Tira do texto o trecho da placa com a memória dela ("gtx 550ti 4gb ddr5",
  // "rtx 3060 12gb", "8gb gddr6"), para não ser lido como RAM.
  const t = sem(texto)
    .replace(new RegExp(`${RE_PLACA.source}\\s?(?:de\\s)?(?:\\d{1,2}\\s?gb)?(?:\\s?g?ddr[3-7]x?)?`, "g"), " placa ")
    .replace(/\b\d{1,2}\s?gb\s?gddr[567]x?\b/g, " ");
  const ddr = t.match(/\bddr\s?([345])\b/);
  const sufixo = ddr ? ` DDR${ddr[1]}` : "";
  const valida = (n: number) => TAMANHOS_DE_RAM.has(n);

  // Ligado a RAM/DDR/memória: "16gb ddr4", "16gb de ram", "16gb ram", "memória 16gb", "ram 32gb".
  const ligados = [
    /\b(\d{1,3})\s?gb\s?(?:de\s)?(?:ram|ddr\s?[345]|memoria)\b/,
    /\b(?:ram|memoria|ddr\s?[345])\s?(?:de\s)?(\d{1,3})\s?gb\b/,
  ];
  for (const re of ligados) {
    const m = t.match(re);
    if (m && valida(Number(m[1]))) return `${Number(m[1])}GB${sufixo}`;
  }

  // Senão: o primeiro tamanho de RAM possível que não seja da placa nem do armazenamento.
  const placa = t.match(RE_PLACA);
  const fimDaPlaca = placa ? (placa.index ?? 0) + placa[0].length : -1;
  for (const m of t.matchAll(/\b(\d{1,3})\s?gb\b/g)) {
    const n = Number(m[1]);
    const i = m.index ?? 0;
    if (!valida(n)) continue;
    const antes = t.slice(Math.max(0, i - 12), i);
    const depois = t.slice(i + m[0].length, i + m[0].length + 12);
    if (/^\s?gddr/.test(depois)) continue; // GDDR = memória da placa
    if (fimDaPlaca >= 0 && i >= fimDaPlaca && i <= fimDaPlaca + 4) continue; // colada na placa
    if (/(ssd|nvme|m\.?2|hd|hdd)\s?(de\s)?$/.test(antes) || /^\s?(ssd|nvme|m\.?2|hd\b|hdd)/.test(depois)) continue;
    return `${n}GB${sufixo}`;
  }
  return "";
}

/** Armazenamento do nome ("SSD 512GB NVMe", "SSD 1TB", "HD 1TB"). */
export function lerArmazenamento(texto: string): string {
  const t = sem(texto);
  const tam = (n: string, u: string) => `${n.replace(",", ".")}${u.toUpperCase()}`;
  const nvme = /nvme|m\.?2/.test(t);

  const ssdDepois = t.match(/\b(?:ssd|nvme|m\.?2)\s?(?:nvme\s?|m\.?2\s?|de\s)?(\d+(?:[.,]\d+)?)\s?(tb|gb)\b/);
  const ssdAntes = t.match(/\b(\d+(?:[.,]\d+)?)\s?(tb|gb)\s?(?:de\s)?(?:ssd|nvme|m\.?2)\b/);
  const ssd = ssdDepois || ssdAntes;
  if (ssd) {
    const n = Number(ssd[1].replace(",", "."));
    // 1–8 TB ou 120 GB para cima: tamanho de SSD de verdade.
    if ((ssd[2] === "tb" && n <= 8) || (ssd[2] === "gb" && n >= 120)) {
      return `SSD ${tam(ssd[1], ssd[2])}${nvme ? " NVMe" : ""}`;
    }
  }
  const hd = t.match(/\b(?:hd|hdd)\s?(?:de\s)?(\d+(?:[.,]\d+)?)\s?(tb|gb)\b/) || t.match(/\b(\d+(?:[.,]\d+)?)\s?(tb|gb)\s?(?:hd|hdd)\b/);
  if (hd) return `HD ${tam(hd[1], hd[2])}`;
  return "";
}
