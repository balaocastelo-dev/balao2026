// ============================================================
// Sugestões na página do produto (pedido do Thiago em 19/10/2026).
//
// Duas fileiras embaixo do produto:
//   1. "Opções parecidas": mesma categoria, preço perto do produto e nome com
//      as mesmas palavras (i3, 4ª geração, SSD 240GB...). É a alternativa para
//      quem achou caro, barato ou quer comparar.
//   2. "Combina com este produto": o que se leva junto. Para um computador,
//      monitor, teclado e mouse, headset, nobreak; para um processador, placa-
//      mãe, memória e cooler. A tabela REGRAS diz o que combina com o quê e em
//      que faixa de preço (fração do preço do produto), para não sugerir um
//      monitor de R$ 9 mil para um PC de R$ 1.200.
//
// Só entra produto com foto e disponível. Tudo aqui é função pura; a leitura
// do banco (enxuta, com cache) fica em lib/cache.ts → getCachedBaseDeSugestoes.
// ============================================================

import { parsePriceToNumber, type Product } from "@/lib/utils";
import { naCategoria, normalizar, temFoto } from "@/lib/landing/vitrine";

/** O que o card precisa. É isto que fica no cache, não o produto inteiro. */
export type ProdutoSugerido = Pick<
  Product,
  "id" | "name" | "price" | "image" | "category" | "slug" | "availability" | "price_card" | "installment" | "discount_pix" | "brand"
>;

export type GrupoQueCombina = {
  /** Caminhos de categoria (com as subcategorias). */
  caminhos: string[];
  /** Preço alvo: fração do preço do produto (monitor para PC ≈ 0,3). */
  fracao: number;
  /** O nome precisa casar (ex.: fonte de PC tem a potência em W). */
  exige?: RegExp;
  /** O nome não pode casar (ex.: fonte de CFTV cadastrada em Hardware/Fontes). */
  exclui?: RegExp;
  /**
   * Se o nome do PRODUTO casar, o grupo não entra: o "PC Gamer Completo com
   * monitor, teclado, mouse e headset" não precisa de sugestão de monitor.
   */
  jaVem?: RegExp;
};

type Regra = { prefixo: string; combina: GrupoQueCombina[] };

const g = (fracao: number, ...caminhos: string[]): GrupoQueCombina => ({ caminhos, fracao });

/** Fonte de PC: tem potência em W e não é fonte de CFTV/12 V cadastrada no mesmo lugar. */
const fonteDePc = (fracao: number): GrupoQueCombina => ({
  caminhos: ["Hardware/Fontes"],
  fracao,
  exige: /\b\d{3,4}\s?w\b/i,
  exclui: /cftv|12\s?v|gan\d|notebook/i,
});

/** O mesmo grupo, mas que não entra quando o produto já traz a peça. */
const sem = (jaVem: RegExp, grupo: GrupoQueCombina): GrupoQueCombina => ({ ...grupo, jaVem });

const VEM_MONITOR = /\bmonitor\b/i;
const VEM_TECLADO = /\bteclado\b/i;
const VEM_MOUSE = /\bmouse\b(?!\s?-?pad)/i;
const VEM_HEADSET = /\bheadset\b|\bfone\b/i;
const VEM_MOUSEPAD = /\bmouse\s?-?pad\b/i;

const HEADSET = ["Áudio/Headset", "Periféricos/Headset"];
const KIT_TECLADO_MOUSE = ["Periféricos/Kit Teclado e Mouse", "Periféricos/Kits Teclado e Mouse"];

/**
 * O que combina com o quê. A primeira regra cujo prefixo casa com a categoria
 * do produto vale; por isso as mais específicas vêm antes.
 */
export const REGRAS: Regra[] = [
  {
    prefixo: "Computadores/PC/PC Gamer",
    combina: [
      sem(VEM_MONITOR, g(0.3, "Computadores/Monitores/Monitor Gamer")),
      sem(VEM_TECLADO, g(0.04, ...KIT_TECLADO_MOUSE, "Periféricos/Teclados")),
      sem(VEM_MOUSE, g(0.03, "Periféricos/Mouses")),
      sem(VEM_HEADSET, g(0.05, ...HEADSET)),
      g(0.15, "Espaço Gamer/Cadeiras Gamer"),
      g(0.15, "Energia/Protetor Eletrônico/Nobreak"),
      sem(VEM_MOUSEPAD, g(0.01, "Periféricos/Mousepads")),
    ],
  },
  {
    prefixo: "Computadores/PC",
    combina: [
      sem(VEM_MONITOR, g(0.3, "Computadores/Monitores/Monitor Office", "Computadores/Monitores")),
      sem(VEM_TECLADO, g(0.06, ...KIT_TECLADO_MOUSE)),
      sem(VEM_HEADSET, g(0.05, ...HEADSET)),
      g(0.06, "Energia/Estabilizadores de Energia"),
      g(0.25, "Energia/Protetor Eletrônico/Nobreak"),
      g(0.05, "Periféricos/Webcams", "Áudio/Caixa de Som para PC"),
      sem(/wi-?fi|wireless/i, g(0.03, "Conectividade/Dispositivo de Rede/Adaptador usb")),
    ],
  },
  {
    prefixo: "Computadores/Notebooks",
    combina: [
      g(0.02, "Periféricos/Mouses"),
      g(0.02, "Informática/Suportes para Notebook"),
      g(0.03, "Diversos/Bolsas e Mochilas"),
      g(0.04, ...HEADSET),
      g(0.2, "Computadores/Monitores"),
      g(0.06, "Hardware/SSD/SSD Externo"),
      g(0.03, ...KIT_TECLADO_MOUSE),
    ],
  },
  {
    prefixo: "Computadores/Monitores",
    combina: [
      g(0.08, ...KIT_TECLADO_MOUSE),
      g(0.04, "Informática/Cabos e Adaptadores"),
      g(0.1, "Espaço Gamer/Suportes"),
      g(1.5, "Computadores/PC/Computador Mini PC", "Computadores/PC/Computador Desktop"),
    ],
  },
  {
    prefixo: "Hardware/Processadores",
    combina: [
      g(0.6, "Hardware/Placas-mãe"),
      g(0.25, "Hardware/Memória RAM"),
      g(0.25, "Hardware/Coolers/Air Cooler", "Hardware/Coolers/Water Cooler"),
      g(0.25, "Hardware/SSD/SSD PCIe NVMe"),
      g(0.03, "Hardware/Coolers/Pasta Térmica"),
    ],
  },
  {
    prefixo: "Hardware/Placas-mãe",
    combina: [
      g(1, "Hardware/Processadores"),
      g(0.4, "Hardware/Memória RAM"),
      g(0.4, "Hardware/SSD/SSD PCIe NVMe"),
      g(0.4, "Hardware/Gabinetes"),
      fonteDePc(0.4),
    ],
  },
  {
    prefixo: "Hardware/Memória RAM",
    combina: [g(1, "Hardware/SSD"), g(2.5, "Hardware/Placas-mãe")],
  },
  {
    prefixo: "Hardware/Placa de vídeo (VGA)",
    combina: [
      fonteDePc(0.2),
      g(0.4, "Computadores/Monitores/Monitor Gamer"),
      g(0.15, "Hardware/Gabinetes"),
      g(0.03, "Hardware/Coolers/FAN"),
    ],
  },
  {
    prefixo: "Hardware/Gabinetes",
    combina: [
      g(0.15, "Hardware/Coolers/FAN"),
      fonteDePc(0.6),
      g(0.6, "Hardware/Coolers/Water Cooler", "Hardware/Coolers/Air Cooler"),
    ],
  },
  {
    prefixo: "Hardware/Fontes",
    combina: [
      g(1, "Hardware/Gabinetes"),
      g(1.5, "Energia/Protetor Eletrônico/Nobreak"),
      g(0.5, "Energia/Estabilizadores de Energia"),
    ],
  },
  {
    prefixo: "Hardware/Coolers",
    combina: [g(0.15, "Hardware/Coolers/Pasta Térmica"), g(0.3, "Hardware/Coolers/FAN"), g(2, "Hardware/Gabinetes")],
  },
  {
    prefixo: "Hardware/SSD",
    combina: [
      g(0.3, "Armazenamento/Cases para HD e SSD"),
      g(1, "Hardware/Memória RAM"),
      g(0.1, "Informática/Cabos e Adaptadores"),
    ],
  },
  {
    prefixo: "Hardware/Disco Rígido (HD)",
    combina: [g(0.3, "Armazenamento/Cases para HD e SSD"), g(1, "Hardware/SSD"), g(0.1, "Informática/Cabos e Adaptadores")],
  },
  {
    prefixo: "Hardware/Kit Hardware",
    combina: [g(0.3, "Hardware/SSD"), g(0.2, "Hardware/Gabinetes"), fonteDePc(0.2), g(0.6, "Hardware/Placa de vídeo (VGA)")],
  },
  {
    prefixo: "Celular & Smartphone/Smartphones",
    combina: [
      g(0.03, "Celular & Smartphone/Carregadores e Power Banks", "Celular & Smartphone/Acessórios para Smartphones/Carregadores"),
      // Capa e película dependem do modelo exato: ficam de fora.
      { caminhos: ["Celular & Smartphone/Acessórios para Smartphones"], fracao: 0.02, exclui: /\bcapa|pel[ií]cula/i },
      g(0.05, "Áudio/Fone de Ouvido/Bluetooth", "Celular & Smartphone/Wearables/Apple/Airpods"),
      g(0.3, "Celular & Smartphone/Wearables"),
      g(0.01, "Celular & Smartphone/Suportes"),
    ],
  },
  {
    prefixo: "Celular & Smartphone/Wearables",
    combina: [g(0.1, "Celular & Smartphone/Carregadores e Power Banks"), g(4, "Celular & Smartphone/Smartphones")],
  },
  {
    prefixo: "Celular & Smartphone",
    combina: [
      g(1, "Celular & Smartphone/Carregadores e Power Banks"),
      g(0.8, "Informática/Cabos e Adaptadores"),
      g(1, "Celular & Smartphone/Suportes"),
    ],
  },
  {
    prefixo: "Tablets, iPads e E-readers",
    combina: [
      g(0.04, "Celular & Smartphone/Carregadores e Power Banks"),
      g(0.06, "Áudio/Fone de Ouvido/Bluetooth"),
      g(0.03, "Informática/Cabos e Adaptadores"),
      g(0.08, "Periféricos/Teclados"),
    ],
  },
  {
    prefixo: "Games/Playstation",
    combina: [
      g(0.12, "Games/Playstation/Controles Playstation"),
      g(0.08, "Games/Playstation/Jogos Playstation"),
      g(0.05, "Games/Playstation/Acessórios Playstation"),
      g(0.08, ...HEADSET),
    ],
  },
  {
    prefixo: "Games/Nintendo",
    combina: [
      g(0.1, "Games/Nintendo/Jogos Nintendo"),
      g(0.1, "Games/Nintendo/Controles Nintendo"),
      g(0.05, "Games/Nintendo/Acessórios Nintendo"),
    ],
  },
  {
    prefixo: "Games",
    combina: [g(0.3, "Games/Acessórios Gamer"), g(0.3, ...HEADSET), g(1, "Espaço Gamer/Cadeiras Gamer")],
  },
  {
    prefixo: "Periféricos",
    combina: [
      g(0.3, "Periféricos/Mousepads"),
      g(1, "Periféricos/Mouses"),
      g(1, "Periféricos/Teclados"),
      g(1.5, ...HEADSET),
    ],
  },
  {
    prefixo: "Espaço Gamer",
    combina: [
      g(1, "Espaço Gamer/Mesa Gamer"),
      g(1, "Espaço Gamer/Cadeiras Gamer"),
      g(0.2, "Espaço Gamer/Decoração Gamer"),
      g(0.1, "Periféricos/Mousepads", "Espaço Gamer/Tapete Gamer"),
    ],
  },
  {
    prefixo: "Escritório/Home Office",
    combina: [
      g(1, "Escritório/Home Office"),
      g(0.15, "Escritório/Equipamentos/Luminária"),
      g(0.1, "Informática/Suportes para Notebook"),
      g(0.15, ...KIT_TECLADO_MOUSE),
    ],
  },
  {
    // Toner, cartucho e tinta não têm "combina": quem compra já tem a impressora.
    prefixo: "Impressão/Impressoras",
    combina: [g(0.1, "Impressão/Toners", "Impressão/Cartuchos", "Impressão/Tintas")],
  },
  {
    prefixo: "Energia/Protetor Eletrônico",
    combina: [g(0.1, "Energia/Protetor Eletrônico/Filtro de Linha"), g(0.3, "Energia/Instalações Elétricas/Bateria")],
  },
  {
    prefixo: "Energia/Estabilizadores de Energia",
    combina: [g(0.3, "Energia/Protetor Eletrônico/Filtro de Linha"), g(2, "Energia/Protetor Eletrônico/Nobreak")],
  },
  {
    prefixo: "Energia/Fontes para Notebook",
    combina: [g(0.5, "Periféricos/Mouses"), g(0.5, "Informática/Suportes para Notebook"), g(0.3, "Informática/Cabos e Adaptadores")],
  },
  {
    prefixo: "Conectividade",
    combina: [
      g(0.3, "Conectividade/Cabo de Rede"),
      g(1, "Conectividade/Switch"),
      g(1, "Conectividade/Dispositivo de Rede"),
    ],
  },
  {
    prefixo: "Segurança",
    combina: [
      g(0.5, "Segurança/Câmeras"),
      g(1, "Segurança/DVR e NVR"),
      g(1, "Hardware/Disco Rígido (HD)/Corporativo/Vigilância"),
      g(0.2, "Segurança/Acessórios"),
    ],
  },
  {
    prefixo: "Automação Comercial",
    combina: [
      g(1, "Automação Comercial/Impressora Térmica"),
      g(0.5, "Automação Comercial/Leitor de Código de Barras"),
      g(0.5, "Automação Comercial/Gaveta de Dinheiro"),
      g(0.1, "Automação Comercial/Acessórios"),
    ],
  },
  {
    prefixo: "Áudio/Headset",
    combina: [g(1, "Áudio/Microfone"), g(1, "Periféricos/Streaming"), g(0.8, "Periféricos/Mouses"), g(1, "Periféricos/Webcams")],
  },
  {
    prefixo: "Áudio/Microfone",
    combina: [g(1, ...HEADSET), g(1, "Periféricos/Streaming"), g(1, "Periféricos/Webcams")],
  },
  {
    prefixo: "Áudio",
    combina: [
      g(0.5, "Celular & Smartphone/Carregadores e Power Banks"),
      g(0.2, "Informática/Cabos e Adaptadores"),
      g(1, "Áudio/Caixa de Som/Portátil"),
      g(1, "Áudio/Fone de Ouvido/Bluetooth"),
    ],
  },
  {
    prefixo: "Eletrônicos/TV e Streaming",
    combina: [
      g(0.3, "Eletrônicos/Suportes de TV"),
      g(0.05, "Informática/Cabos e Adaptadores"),
      g(1, "Áudio/Home Theater e Soundbar"),
      g(0.1, "Eletrônicos/Controles Remotos"),
    ],
  },
  {
    prefixo: "Projetores",
    combina: [g(0.3, "Projetores/Acessórios para Projeção"), g(0.05, "Informática/Cabos e Adaptadores"), g(0.5, "Áudio/Caixa de Som")],
  },
  {
    prefixo: "Armazenamento",
    combina: [
      g(1, "Armazenamento/Pen Drive"),
      g(1, "Armazenamento/Cartão de Memória"),
      g(3, "Hardware/SSD/SSD Externo"),
      g(0.5, "Informática/Cabos e Adaptadores"),
    ],
  },
];

export type PlanoDeSugestoes = {
  /** A categoria do produto. */
  categoria: string;
  /** Onde procurar os parecidos: a própria categoria ou a de cima (nunca a raiz). */
  escopo: string;
  combina: GrupoQueCombina[];
};

export function planoDeSugestoes(categoria: string): PlanoDeSugestoes {
  const cat = String(categoria || "").trim();
  const partes = cat.split("/").filter(Boolean);
  // "Computadores/Notebooks/Notebook Acer" procura em "Computadores/Notebooks";
  // "Hardware/Gabinetes" fica em si mesma (subir daria "Hardware" inteiro).
  const escopo = partes.length >= 3 ? partes.slice(0, -1).join("/") : cat;
  const regra = REGRAS.find((r) => cat === r.prefixo || cat.startsWith(`${r.prefixo}/`));
  return { categoria: cat, escopo, combina: regra ? regra.combina : [] };
}

/** Todos os caminhos que a consulta ao banco precisa trazer. */
export function caminhosDoPlano(plano: PlanoDeSugestoes): string[] {
  const todos = [plano.escopo, ...plano.combina.flatMap((g) => g.caminhos)].filter(Boolean);
  return [...new Set(todos)];
}

/** Categoria de acessório ("Placa de vídeo (VGA)/Acessórios", "Cadeiras Gamer/Acessórios"). */
export const ehAcessorio = (categoria: string) =>
  String(categoria || "")
    .split("/")
    .some((parte) => /^acess[oó]rios?\b/i.test(parte.trim()) && !/para smartphones/i.test(parte));

const indisponivel = (p: Pick<Product, "availability">) =>
  /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));
const prontaEntrega = (p: Pick<Product, "availability">) => /pronta entrega/i.test(String(p.availability || ""));

export function enxugar(p: Product): ProdutoSugerido {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    image: p.image,
    category: p.category,
    slug: p.slug,
    availability: p.availability,
    price_card: p.price_card,
    installment: p.installment,
    discount_pix: p.discount_pix,
    brand: p.brand,
  };
}

/** Pega no máximo `limite` itens espalhados por toda a faixa de preço. */
function amostraPorPreco<T extends Pick<Product, "price">>(itens: T[], limite: number): T[] {
  if (itens.length <= limite) return itens;
  const ordenados = [...itens].sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
  const passo = ordenados.length / limite;
  return Array.from({ length: limite }, (_, i) => ordenados[Math.floor(i * passo)]);
}

export type BaseDeSugestoes = {
  parecidos: ProdutoSugerido[];
  /** Um por grupo de PlanoDeSugestoes.combina, na mesma ordem. */
  combina: ProdutoSugerido[][];
};

export const MAX_PARECIDOS_NO_CACHE = 600;
export const MAX_POR_GRUPO_NO_CACHE = 150;

/**
 * Separa os candidatos que vieram do banco (ou da cópia) e guarda só o
 * necessário. É isto que vai para o cache: cabe folgado nos 2 MB do Next.
 */
export function montarBase(produtos: Product[], plano: PlanoDeSugestoes): BaseDeSugestoes {
  const validos = produtos.filter((p) => p && temFoto(p) && !indisponivel(p) && parsePriceToNumber(p.price) > 0);
  const parecidos = amostraPorPreco(
    validos.filter((p) => naCategoria(p.category, [plano.escopo])),
    MAX_PARECIDOS_NO_CACHE
  ).map(enxugar);
  const combina = plano.combina.map((grupo) => {
    // "Espaço Gamer/Cadeiras Gamer/Acessórios" (parafuso de cadeira) não entra
    // num grupo de cadeiras, a menos que o grupo peça acessório.
    const aceitaAcessorio = grupo.caminhos.some((c) => ehAcessorio(c));
    return amostraPorPreco(
      validos.filter(
        (p) =>
          naCategoria(p.category, grupo.caminhos) &&
          (aceitaAcessorio || !ehAcessorio(p.category)) &&
          (!grupo.exige || grupo.exige.test(p.name)) &&
          (!grupo.exclui || !grupo.exclui.test(p.name))
      ),
      MAX_POR_GRUPO_NO_CACHE
    ).map(enxugar);
  });
  return { parecidos, combina };
}

// ---------- escolha para um produto ----------

const PALAVRAS_VAZIAS = new Set(
  "de da do das dos com e para p/ em a o as os na no preto preta branco branca cor un unidade novo nova original".split(" ")
);

function palavras(nome: string): Set<string> {
  return new Set(
    normalizar(nome)
      .replace(/[^a-z0-9ªº.]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 1 && !PALAVRAS_VAZIAS.has(w))
  );
}

function semelhanca(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let comum = 0;
  for (const w of a) if (b.has(w)) comum++;
  return comum / (a.size + b.size - comum);
}

/** Mesmo produto vendido por outro fornecedor, ou o mesmo nome repetido. */
const chaveDoNome = (nome: string) => normalizar(nome).replace(/[^a-z0-9]+/g, "").slice(0, 60);

/**
 * Chaves para não repetir: o nome, e o começo do nome com o preço (a mesma
 * peça em outra cor tem o mesmo preço e só muda o fim do nome).
 */
const chavesDe = (p: Pick<Product, "id" | "name" | "price">) => [
  `id:${p.id}`,
  chaveDoNome(p.name),
  `${parsePriceToNumber(p.price).toFixed(2)}|${chaveDoNome(p.name).slice(0, 40)}`,
];

// ---------- compatibilidade (só para o "combina") ----------

const SOQUETE = /\b(am[2345]\+?|fm2\+?|lga\s?\d{4}|1150|1151|1155|1156|1200|1700|1851)\b/;

/** Chipset da placa-mãe → soquete. */
const CHIPSETS: Record<string, string> = {};
const chipsets = (soq: string, lista: string) => lista.split(" ").forEach((c) => (CHIPSETS[c] = soq));
chipsets("am4", "a320 b350 x370 b450 x470 a520 b550 x570");
chipsets("am5", "a620 b650 x670 b840 b850 x870");
chipsets("1155", "h61 b75 h77 z77 q77 h67 p67 z68");
chipsets("1150", "h81 b85 h87 h97 z87 z97");
chipsets("1151", "h110 b150 h170 z170 b250 h270 z270 h310 b360 b365 h370 z370 z390");
chipsets("1200", "h410 b460 h470 z490 h510 b560 h570 z590");
chipsets("1700", "h610 b660 h670 z690 b760 h770 z790");
chipsets("1851", "h810 b860 z890");

const SOQUETE_DA_GERACAO_INTEL: Record<number, string> = {
  2: "1155", 3: "1155", 4: "1150", 5: "1150", 6: "1151", 7: "1151", 8: "1151", 9: "1151",
  10: "1200", 11: "1200", 12: "1700", 13: "1700", 14: "1700",
};

/** Soquete de processador ou placa-mãe: escrito no nome, ou deduzido do modelo/chipset. */
export function soquete(nome: string): string {
  const n = normalizar(nome);
  const escrito = n.match(SOQUETE);
  if (escrito) return escrito[1].replace(/^lga\s?/, "").replace(/\s/g, "");
  for (const m of n.matchAll(/\b([abhqxzp]\d{2,3})[a-z]?\b/g)) {
    if (CHIPSETS[m[1]]) return CHIPSETS[m[1]];
  }
  const ryzen = n.match(/\bryzen\s?[3579]\s?(\d)\d{3}/);
  if (ryzen) return Number(ryzen[1]) >= 7 ? "am5" : "am4";
  if (/\bathlon\s?(200ge|3000g|300ge|320ge)\b/.test(n)) return "am4";
  if (/\bcore ultra\s?[3579]\s?2\d{2}/.test(n)) return "1851";
  const intel = n.match(/\bi[3579][\s-]?(\d{4,5})/);
  if (intel) {
    const num = intel[1];
    const geracao = num.length === 5 || num.charAt(0) === "1" ? Number(num.slice(0, 2)) : Number(num.charAt(0));
    return SOQUETE_DA_GERACAO_INTEL[geracao] || "";
  }
  const dita = n.match(/\b(\d{1,2})\s?(ª|a|º)?\s?gera[cç][aã]o/);
  if (dita && /\bi[3579]\b|intel/.test(n)) return SOQUETE_DA_GERACAO_INTEL[Number(dita[1])] || "";
  return "";
}

const ddr = (nome: string) => (normalizar(nome).match(/\bddr\s?([345])\b/) || [])[1] || "";
const iphone = (nome: string) => (normalizar(nome).match(/\biphone\s?(\d{1,2})\b/) || [])[1] || "";

/** Memórias que cada soquete aceita (1700: DDR4 ou DDR5, conforme a placa). */
const DDR_DO_SOQUETE: Record<string, string> = {
  "1155": "3", "1150": "3", "1151": "4", "1200": "4", "1700": "45", "1851": "5", am4: "4", am5: "5", "fm2+": "3", fm2: "3",
};

const ehMemoria = (categoria: string) => /memoria ram/.test(normalizar(categoria));

const ehProcessadorOuPlaca = (categoria: string) => /processador|placa[s]?[- ]m[aã]e/i.test(normalizar(categoria));

/** AMD ou Intel, para processador e placa-mãe. */
function plataforma(p: Pick<Product, "name" | "category">): string {
  if (!ehProcessadorOuPlaca(p.category)) return "";
  const texto = `${normalizar(p.category)} ${normalizar(p.name)}`;
  const amd = /\b(amd|ryzen|athlon)\b/.test(texto);
  const intel = /\b(intel|core i\d|i[3579])\b/.test(texto);
  return amd && !intel ? "amd" : intel && !amd ? "intel" : "";
}

/**
 * Não sugerir o que não serve: placa-mãe de outro soquete para o processador
 * (e vice-versa), memória DDR3 para placa DDR4, acessório de iPhone 16 para
 * iPhone 17. Entre processador e placa-mãe a regra é estrita: se o soquete do
 * produto é conhecido, o do candidato precisa ser conhecido e igual.
 */
export function compativel(
  produto: Pick<Product, "name" | "category">,
  candidato: Pick<Product, "name" | "category">
): boolean {
  if (ehProcessadorOuPlaca(produto.category) && ehProcessadorOuPlaca(candidato.category)) {
    const s1 = soquete(produto.name);
    const s2 = soquete(candidato.name);
    if (s1 && s1 !== s2) return false;
    const p1 = plataforma(produto);
    const p2 = plataforma(candidato);
    if (p1 && p2 && p1 !== p2) return false;
  }
  // Memória com processador/placa-mãe: memória de notebook não serve, e a
  // geração (DDR3/4/5) tem de ser a do soquete quando o nome não diz.
  for (const [peca, memoria] of [
    [produto, candidato],
    [candidato, produto],
  ]) {
    if (!ehProcessadorOuPlaca(peca.category) || !ehMemoria(memoria.category)) continue;
    if (/notebook|sodimm|so-dimm|ddr3l/.test(normalizar(memoria.name))) return false;
    const esperada = ddr(peca.name) || DDR_DO_SOQUETE[soquete(peca.name)] || "";
    const dela = ddr(memoria.name);
    if (esperada && (!dela || !esperada.includes(dela))) return false;
  }
  const d1 = ddr(produto.name);
  const d2 = ddr(candidato.name);
  if (d1 && d2 && d1 !== d2) return false;
  const i1 = iphone(produto.name);
  const i2 = iphone(candidato.name);
  if (i1 && i2 && i1 !== i2) return false;
  return true;
}

export const LIMITE_PARECIDOS = 12;
export const LIMITE_COMBINA = 12;

export type Sugestoes = { parecidos: ProdutoSugerido[]; combina: ProdutoSugerido[] };

export function escolherSugestoes(
  produto: Pick<Product, "id" | "name" | "price" | "category">,
  base: BaseDeSugestoes,
  plano: PlanoDeSugestoes
): Sugestoes {
  const preco = parsePriceToNumber(produto.price);
  const minhas = palavras(produto.name);
  const usados = new Set<string>(chavesDe(produto));
  const repetido = (p: ProdutoSugerido) => chavesDe(p).some((k) => usados.has(k));
  const marcar = (p: ProdutoSugerido) => chavesDe(p).forEach((k) => usados.add(k));

  const distanciaDePreco = (p: ProdutoSugerido, alvo: number) => {
    const v = parsePriceToNumber(p.price);
    if (!(alvo > 0) || !(v > 0)) return 0;
    return Math.abs(Math.log(v / alvo));
  };

  // 1. Parecidos: preço perto, mesma categoria, nome com as mesmas palavras.
  // Placa de vídeo não sugere "cabo riser" como parecido; acessório só sugere acessório.
  const souAcessorio = ehAcessorio(produto.category);
  const pontuados = base.parecidos
    .filter((p) => p.id !== String(produto.id) && ehAcessorio(p.category) === souAcessorio)
    .map((p) => {
      const mesmaCategoria = naCategoria(p.category, [plano.categoria]);
      const nota =
        distanciaDePreco(p, preco) +
        (mesmaCategoria ? 0 : 0.4) +
        (1 - semelhanca(minhas, palavras(p.name))) * 0.8 -
        (prontaEntrega(p) ? 0.1 : 0);
      return { p, nota, longe: preco > 0 && distanciaDePreco(p, preco) > Math.log(2.5) };
    })
    .filter((x) => !x.longe)
    .sort((a, b) => a.nota - b.nota);

  const parecidos: ProdutoSugerido[] = [];
  for (const { p } of pontuados) {
    if (repetido(p)) continue;
    marcar(p);
    parecidos.push(p);
    if (parecidos.length >= LIMITE_PARECIDOS) break;
  }

  // 2. Combina: um de cada grupo por vez, o de preço mais perto do alvo do grupo.
  const filas = plano.combina.map((grupo, i) => {
    if (grupo.jaVem && grupo.jaVem.test(produto.name)) return [];
    const alvo = preco > 0 ? preco * grupo.fracao : 0;
    return [...(base.combina[i] || [])]
      // Da mesma categoria do produto é "parecido", não "combina" (mouse com mouse).
      .filter((p) => !naCategoria(p.category, [plano.categoria]) && compativel(produto, p))
      .map((p) => ({ p, nota: distanciaDePreco(p, alvo) - (prontaEntrega(p) ? 0.15 : 0) }))
      .sort((a, b) => a.nota - b.nota)
      .map((x) => x.p);
  });

  const combina: ProdutoSugerido[] = [];
  let algum = true;
  while (combina.length < LIMITE_COMBINA && algum) {
    algum = false;
    for (const fila of filas) {
      while (fila.length) {
        const p = fila.shift()!;
        if (repetido(p)) continue;
        marcar(p);
        combina.push(p);
        algum = true;
        break;
      }
      if (combina.length >= LIMITE_COMBINA) break;
    }
  }

  return { parecidos, combina };
}
