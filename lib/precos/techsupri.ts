// ============================================================
// Fornecedor local: TechSupri (catálogo na Kyte, techsupri.kyte.site).
//
// O catálogo da Kyte fica atrás de uma proteção contra robôs que recusa
// servidores (Vercel incluída). Por isso a TechSupri NÃO é lida pelo
// agendador: o catálogo é capturado pelo navegador da loja, navegando como
// gente, e chega aqui por importação (/api/precos/importar).
//
// Este arquivo transforma o produto como a Kyte o descreve no ItemDeOrigem
// que o resto do sistema de preços já entende, e decide em que categoria do
// site ele entra. Funções puras, testadas.
//
// Fotos: as da Kyte têm marca d'água do fornecedor e NÃO são usadas. A foto
// vem de fora (busca na internet) e chega pronta no campo `foto`.
// ============================================================

import type { ItemDeOrigem } from "./kabum";

export const SITE_TECHSUPRI = "techsupri";
export const URL_TECHSUPRI = "https://techsupri.kyte.site/pt-BR";
export const PREFIXO_TECHSUPRI = "ts-";

/** O que interessa do produto da Kyte. */
export interface ProdutoKyte {
  id: string;
  name: string;
  code?: string | null;
  salePrice?: number | null;
  salePromotionalPrice?: number | null;
  category?: { id?: string; name?: string } | null;
  active?: boolean;
  showOnCatalog?: boolean;
  stock?: { current?: number } | number | null;
  stockActive?: boolean;
  stockStatus?: string | null;
  /** Link do produto na Kyte (para conferência no painel). */
  url?: string | null;
}

/** Produto já capturado, com a foto achada na internet. */
export interface ProdutoCapturado extends ProdutoKyte {
  foto?: string | null;
  fotos?: string[] | null;
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

/** O preço que o fornecedor cobra agora: a promoção vigente, se houver. */
export function precoDoKyte(p: Pick<ProdutoKyte, "salePrice" | "salePromotionalPrice">): number {
  const normal = Number(p.salePrice) || 0;
  const promo = Number(p.salePromotionalPrice) || 0;
  if (promo > 0 && (normal <= 0 || promo < normal)) return promo;
  return normal > 0 ? normal : 0;
}

function estoqueAtual(p: ProdutoKyte): number | null {
  const s = p.stock;
  if (typeof s === "number") return s;
  if (s && typeof s === "object" && s.current != null && Number.isFinite(Number(s.current))) return Number(s.current);
  return null;
}

/** Está à venda no fornecedor? Inativo, fora do catálogo ou esgotado não entra. */
export function disponivelNoKyte(p: ProdutoKyte): boolean {
  if (p.active === false || p.showOnCatalog === false) return false;
  const status = semAcento(p.stockStatus);
  if (/out|esgot|sem.?estoque|unavailable/.test(status)) return false;
  if (p.stockActive) {
    const atual = estoqueAtual(p);
    if (atual != null && atual <= 0) return false;
  }
  return true;
}

// ---------- categoria ----------

/**
 * Regras na ordem: a primeira que casar com o NOME decide. O nome manda
 * porque muitas categorias da Kyte são marcas ("JBL", "Xiaomi", "Amazon"),
 * que misturam fone, relógio e carregador.
 */
const REGRAS: [RegExp, string][] = [
  // O começo do nome diz o que o produto É ("Cabo USB de Impressora" é cabo).
  [/^ cabo de rede\b|\bpatch cord\b|^ emenda rj45/, "Conectividade/Cabo de Rede"],
  [/^ (adaptador|placa|receptor)\b.*\b(wi.?fi|wireless|de rede|rj45)\b/, "Conectividade/Dispositivo de Rede"],
  [/^ (adaptador|transmissor)\b.*\bbluetoo?th?\b|^ bluetooth\b/, "Informática/Bluetooth"],
  [/^ case (para |p\/ )?(hd|ssd)\b|^ gaveta\b/, "Armazenamento/Cases para HD e SSD"],
  [/^ (cabo|adaptador|conversor|hub|splitter|duplicador|extensor|mini conversor|dock station)\b/, "Informática/Cabos e Adaptadores"],
  [/\b(alcool isopropilico|limpa tela|desengripante|cola para celular|jogo de chaves|pasta termica)\b/, "Informática/Limpeza e Manutenção"],
  [/\b(aspirador de po|soprador)\b/, "Informática/Limpeza e Manutenção"],
  [/\b(btv|uni tv|fire tv|tv box|tv stick)\b/, "Eletrônicos/TV e Streaming"],
  [/^ suporte\b.*\b(headset|fone|controle)\b/, "Espaço Gamer/Suportes"],
  [/\b(pelicula|case|capa|grip|protetor)\b.*\bswitch\b/, "Games/Nintendo"],
  [/^ (kit teclado|kit de teclado)\b/, "Periféricos/Kits Teclado e Mouse"],
  [/^ (mouse ?pad|mousepad|desk ?pad|apoio de teclado)\b/, "Periféricos/Mousepads"],
  [/^ teclado\b/, "Periféricos/Teclados"],
  [/^ mouse\b/, "Periféricos/Mouses"],
  [/^ (headset|headphone)\b/, "Áudio/Headset"],
  [/^ fone\b/, "Áudio/Fone de Ouvido"],
  [/^ (smartwatch|relogio|mi band|smart band)\b/, "Celular & Smartphone/Wearables"],
  [/^ (tablet|ipad)\b/, "Tablets, iPads e E-readers/Tablets"],
  [/^ (pen ?drive)\b/, "Armazenamento/Pen Drive"],
  [/^ (micro ?sd|cartao de memoria)\b/, "Armazenamento/Cartão de Memória"],
  [/^ (ssd externo|hd externo)\b|\bssd .*\bexterno\b/, "Armazenamento/HD e SSD Externo"],
  [/^ (fonte|carregador)\b.*\b(notebook|macbook|laptop)\b/, "Energia/Fontes para Notebook"],
  [/^ (gabinete)\b/, "Hardware/Gabinetes"],
  [/^ placa mae\b/, "Hardware/Placas-mãe"],
  [/^ (memoria)\b.*\bddr\d/, "Hardware/Memória RAM"],
  [/^ (suporte 3d|capa frontal|adesivo)\b.*\b(ps5|ps4|playstation|dualsense)\b/, "Games/Playstation"],
  [/^ jogo (ps4|ps5|xbox|switch|nintendo)\b/, "Games/Jogos"],
  [/^ (console|nintendo switch|playstation|bundle nintendo)\b/, "Games/Consoles"],
  // impressão
  [/\b(fotocondutor|cilindro|drum)\b/, "Impressão/Toners"],
  [/\btoner\b/, "Impressão/Toners"],
  [/\bcartuchos?\b|\bcart\.?\s/, "Impressão/Cartuchos"],
  [/\b(tinta|refil|garrafa)\b/, "Impressão/Tintas"],
  [/\bimpressora\b.*\bfonte\b|^ fonte\b.*\bimpressora\b/, "Impressão/Peças para Impressora"],
  [/^ (impressora|multifuncional)\b/, "Impressão/Impressoras"],
  // games: a plataforma vence o tipo ("Carregador para controle PS5" é acessório de PS5)
  [/\b(r36s|console portatil|game retro|retro portatil|anbernic|miyoo|game stick)\b/, "Games/Consoles Portáteis"],
  [/\b(playstation|ps5|ps4|ps3|ps2|dualsense|dualshock|doubleshock|portal)\b/, "Games/Playstation"],
  [/\b(xbox|x box)\b/, "Games/Xbox"],
  [/\b(nintendo|switch oled|switch lite|switch 2|joy.?con|joy.?pad|tns.?\d+)\b/, "Games/Nintendo"],
  [/\b(volante|cambio)\b.*\b(logitech|driving force|g29|g923)\b/, "Games/Simuladores"],
  [/\b(controle|joystick|gamepad)\b/, "Games/Acessórios Gamer"],
  // energia
  [/\bno.?break\b/, "Energia/Nobreak"],
  [/\bestabilizador\b/, "Energia/Estabilizadores de Energia"],
  [/\b(filtro de linha|protetor eletronico|regua)\b/, "Energia/Protetor Eletrônico"],
  [/\b(power ?bank|bateria portatil|carregador portatil)\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/\bpilhas?\b|^ bateria\b.*\b(\d+a|cr\d{4}|sr\d+|lr\d+|aa|aaa|9v|12v|3v|1.5v)\b/, "Energia/Pilhas e Baterias"],
  [/\b(carregador veicular)\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/\b(carregador|fonte usb|fonte de celular)\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/\b(fonte)\b.*\b(\d{3,4} ?w|atx|80 plus)\b/, "Hardware/Fontes"],
  [/^ fonte (universal|de alimentacao)\b/, "Energia/Fontes e Adaptadores"],
  // espaço gamer
  [/\b(cadeira)\b/, "Espaço Gamer/Cadeiras Gamer"],
  [/^ suporte\b.*\b(notebook)\b/, "Informática/Suportes para Notebook"],
  [/^ suporte\b.*\b(celular)\b/, "Celular & Smartphone/Acessórios para Smartphones"],
  [/^ suporte\b.*\b(tv)\b/, "Eletrônicos/Suportes de TV"],
  [/\b(luminaria|abajur|decorativ\w*|boneco|caneca|escudo|martelo|machado|espada|taco)\b/, "Espaço Gamer/Decoração Gamer"],
  // áudio
  [/\bheadset\b/, "Áudio/Headset"],
  [/\b(fone|earbuds?|airdots|headphones?|buds|tws|airpods)\b/, "Áudio/Fone de Ouvido"],
  [/\b(microfone)\b/, "Áudio/Microfone"],
  [/\b(karaoke|ikarao|icarao)\b/, "Áudio/Karaokê"],
  [/\b(caixa de som|caixa som|speaker|soundbar|boombox|partybox)\b/, "Áudio/Caixa de Som"],
  [/\b(echo dot|echo show|echo spot|alexa)\b/, "Áudio/Assistente Virtual"],
  [/\bplaca de som\b/, "Áudio/Placas de Som"],
  // celular, relógio, tablet
  [/\b(smartwatch|smart watch|relogio|smartband|smart band|mi band|amazfit)\b/, "Celular & Smartphone/Wearables"],
  [/\b(pelicula|capinha|capa)\b/, "Celular & Smartphone/Acessórios para Smartphones"],
  [/\b(tag rastreador|localizador)\b/, "Celular & Smartphone/Acessórios para Smartphones"],
  [/\b(kindle)\b/, "Tablets, iPads e E-readers/Kindles"],
  [/\b(ipad|tablet)\b/, "Tablets, iPads e E-readers/Tablets"],
  [/\b(fire tv|tv box|chromecast|mi stick|tv stick|btv|uni tv)\b/, "Eletrônicos/TV e Streaming"],
  [/\bantena digital\b/, "Eletrônicos/TV e Streaming"],
  [/\b(camera)\b.*\b(wi.?fi|vigilancia|tapo|ip)\b/, "Automação/Câmeras de Segurança"],
  [/\b(robo aspirador|robot vacuum)\b/, "Automação/Robôs Aspiradores"],
  [/\b(celular|smartphone|iphone)\b/, "Celular & Smartphone/Smartphones"],
  [/\bstarlink\b/, "Conectividade/Internet via Satélite"],
  // rede
  [/\bswitch\b/, "Conectividade/Switch"],
  [/\b(roteador|repetidor|access point|mesh|deco|placa de rede|antena|range extender)\b/, "Conectividade/Dispositivo de Rede"],
  // armazenamento e hardware
  [/\bssd\b|\bnvme\b/, "Hardware/SSD"],
  [/\b(hd externo|hd portatil)\b/, "Armazenamento/HD e SSD Externo"],
  [/\bhd\b.*\b(tb|gb)\b|\bdisco rigido\b/, "Hardware/Disco Rígido (HD)"],
  [/\b(cooler|fan|water ?cooler|pasta termica)\b/, "Hardware/Coolers"],
  [/\bmonitor\b/, "Computadores/Monitores"],
  [/\b(gravador de cd|gravador de dvd)\b/, "Hardware/Drives Ópticos"],
  // periféricos
  [/\b(kit teclado|teclado e mouse|combo)\b/, "Periféricos/Kits Teclado e Mouse"],
  [/\bteclado\b/, "Periféricos/Teclados"],
  [/\bmouse\b/, "Periféricos/Mouses"],
  [/\b(webcam|web cam)\b/, "Periféricos/Webcams"],
  [/\b(leitor de codigo|codigo de barras)\b/, "Periféricos/Leitores de Código de Barras"],
  [/\b(apresentador)\b/, "Periféricos/Apresentadores"],
  [/\b(ring ?light|captura|stream deck|tripe)\b/, "Periféricos/Streaming"],
  // cabos
  [/\b(cabo|adaptador|conversor|hub|extensor|splitter|displayport|hdmi|usb.?c|lightning|otg)\b/, "Informática/Cabos e Adaptadores"],
  // limpeza e manutenção
  [/\b(alcool isopropilico|limpa tela|desengripante|cola para celular|jogo de chaves)\b/, "Informática/Limpeza e Manutenção"],
  // escritório
  [/\b(papel|caneta|caderno|envelope|grampeador|etiqueta|fita adesiva|lapis|marca.?texto|post.?it|calculadora)\b/, "Escritório/Papelaria"],
  [/\b(hidratante|creme|locao|protetor solar)\b/, "Diversos/Cuidados Pessoais"],
];

/** Quando o nome não diz nada, a categoria da Kyte decide. */
const POR_CATEGORIA_KYTE: [RegExp, string][] = [
  [/toner/, "Impressão/Toners"],
  [/cart|cartucho/, "Impressão/Cartuchos"],
  [/tinta/, "Impressão/Tintas"],
  [/impressora/, "Impressão/Impressoras"],
  [/fonte impressora/, "Impressão/Peças para Impressora"],
  [/headset|onikuma/, "Áudio/Headset"],
  [/jbl|karaoke/, "Áudio/Caixa de Som"],
  [/acessorio xbox|xbox/, "Games/Xbox"],
  [/acessorio playstation|playstation/, "Games/Playstation"],
  [/acessorio nintendo|console nintendo/, "Games/Nintendo"],
  [/console portatil/, "Games/Consoles Portáteis"],
  [/jogos/, "Games/Jogos"],
  [/suportes gamer/, "Espaço Gamer/Suportes"],
  [/decoracao gamer/, "Espaço Gamer/Decoração Gamer"],
  [/cadeira/, "Espaço Gamer/Cadeiras Gamer"],
  [/pilhas|bateria/, "Energia/Pilhas e Baterias"],
  [/estab|nobreak/, "Energia/Estabilizadores de Energia"],
  [/fonte notebook/, "Energia/Fontes para Notebook"],
  [/papelaria/, "Escritório/Papelaria"],
  [/gabinete/, "Hardware/Gabinetes"],
  [/ssd/, "Hardware/SSD"],
  [/monitor/, "Computadores/Monitores"],
  [/tp-link|tp link/, "Conectividade/Dispositivo de Rede"],
  [/sandisk|kingston/, "Armazenamento/Pen Drive"],
  [/amazfit/, "Celular & Smartphone/Wearables"],
  [/hidratante/, "Diversos/Cuidados Pessoais"],
  [/streaming/, "Periféricos/Streaming"],
  [/eletronicos/, "Eletrônicos/Diversos"],
];

export const CATEGORIA_PADRAO_TECHSUPRI = "Informática/Acessórios";

export function categoriaDoTechsupri(nome: string, categoriaKyte?: string | null): string {
  const n = ` ${semAcento(nome).replace(/[^a-z0-9.+ -]+/g, " ").replace(/\s+/g, " ")} `;
  for (const [re, destino] of REGRAS) if (re.test(n)) return destino;
  const c = semAcento(categoriaKyte);
  if (c) for (const [re, destino] of POR_CATEGORIA_KYTE) if (re.test(c)) return destino;
  return CATEGORIA_PADRAO_TECHSUPRI;
}

// ---------- marca ----------

const MARCAS = [
  "TP-Link", "HP", "Canon", "Epson", "Brother", "Samsung", "Lexmark", "Amazon", "JBL", "Xiaomi", "Redmi", "Amazfit",
  "Kingston", "SanDisk", "Seagate", "Redragon", "Logitech", "Philips", "Havit", "Onikuma", "Knup", "Lehmox", "Exbom",
  "Kaidi", "Tomate", "It-Blue", "Grasep", "Joog", "Revenger", "Aula", "Ipega", "Realme", "Apple", "Keepdata",
  "Implastec", "Sony", "Microsoft", "Nintendo", "Intelbras", "Multilaser", "Elgin", "Duracell", "Energizer", "Baseus",
  "Ugreen", "Mercusys", "Positivo", "Lenovo", "Dell", "Acer", "Asus", "Motorola", "Haylou", "QCY", "Edifier",
];
const MARCAS_NORMALIZADAS = MARCAS.map((m) => [semAcento(m).replace(/[^a-z0-9]+/g, ""), m] as const);

export function marcaDoTechsupri(nome: string): string | null {
  const palavras = semAcento(nome).split(/[^a-z0-9-]+/).filter(Boolean);
  for (const palavra of palavras) {
    const limpa = palavra.replace(/-/g, "");
    const achada = MARCAS_NORMALIZADAS.find(([n]) => n === limpa);
    if (achada) return achada[1];
  }
  return null;
}

// ---------- item ----------

const SIGLAS = new Set([
  "usb", "hdmi", "led", "rgb", "ssd", "hd", "tv", "pc", "vga", "dvi", "wifi", "lan", "ram", "ddr", "nvme", "sata",
  "atx", "ups", "bt", "tws", "ps", "dc", "ac", "ip", "lcd", "oled", "jbl", "hp", "aoc", "lg", "sd", "mm", "gb", "tb",
]);

/** Nome como o site mostra: sem CAIXA ALTA gritando, sem espaços duplos. */
export function nomeDoTechsupri(nome: string): string {
  const limpo = String(nome || "").replace(/\s+/g, " ").trim();
  const letras = limpo.replace(/[^A-Za-zÀ-ÿ]/g, "");
  const maiusculas = letras.replace(/[^A-ZÀ-Þ]/g, "");
  if (letras.length < 8 || maiusculas.length / letras.length < 0.8) return limpo;
  // Tudo em maiúsculas: passa para "Título", preservando siglas curtas com número.
  return limpo
    .toLowerCase()
    .split(" ")
    .map((w) => {
      const marca = MARCAS_NORMALIZADAS.find(([n]) => n === semAcento(w).replace(/[^a-z0-9]+/g, ""));
      if (marca) return marca[1];
      if (/\d/.test(w) || w.length <= 2 || SIGLAS.has(semAcento(w))) return w.toUpperCase();
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function paraItemTechsupri(p: ProdutoCapturado): ItemDeOrigem | null {
  const id = String(p?.id || "").trim();
  const nomeCru = String(p?.name || "").trim();
  if (!id || !nomeCru) return null;
  const nome = nomeDoTechsupri(nomeCru);
  const preco = precoDoKyte(p);
  const fotos = (Array.isArray(p.fotos) ? p.fotos : [])
    .filter((u): u is string => typeof u === "string" && /^https:\/\//.test(u) && !/kyte/i.test(u))
    .slice(0, 6);
  const foto = typeof p.foto === "string" && /^https:\/\//.test(p.foto) && !/kyte/i.test(p.foto) ? p.foto : fotos[0] || "";

  return {
    codigo: `${PREFIXO_TECHSUPRI}${id}`,
    nome,
    marca: marcaDoTechsupri(nomeCru),
    categoria: categoriaDoTechsupri(nomeCru, p.category?.name),
    vendedor: "TechSupri",
    marketplace: false,
    openbox: false,
    preVenda: false,
    disponivel: disponivelNoKyte(p) && preco > 0,
    pix: preco,
    cartao: preco,
    parcelas: 0,
    oferta: null,
    url: p.url && /^https:\/\/techsupri\.kyte\.site\//.test(p.url) ? p.url : URL_TECHSUPRI,
    foto,
    fotos: fotos.length ? fotos : foto ? [foto] : [],
    garantia: null,
  };
}

/**
 * Tira o objeto do produto do HTML da página de produto da Kyte (Next.js App
 * Router: o produto vem no payload RSC, dentro de `self.__next_f.push`).
 */
export function produtoDaPaginaKyte(html: string): ProdutoKyte | null {
  let rsc = "";
  for (const m of String(html || "").matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) {
    try {
      rsc += JSON.parse(m[1]);
    } catch {
      /* pedaço que não é texto */
    }
  }
  const k = rsc.indexOf('"product":{"_id"');
  if (k < 0) return null;
  const inicio = k + '"product":'.length;
  let profundidade = 0;
  let emTexto = false;
  let escape = false;
  for (let j = inicio; j < rsc.length; j++) {
    const ch = rsc[j];
    if (emTexto) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') emTexto = false;
      continue;
    }
    if (ch === '"') emTexto = true;
    else if (ch === "{") profundidade++;
    else if (ch === "}") {
      profundidade--;
      if (profundidade === 0) {
        try {
          return JSON.parse(rsc.slice(inicio, j + 1)) as ProdutoKyte;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
