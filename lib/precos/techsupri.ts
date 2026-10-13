// ============================================================
// Fornecedores locais com catálogo na Kyte: TechSupri (techsupri.kyte.site)
// e qualquer outro que o Thiago cadastrar pelo link (ex.: Robson Atacado,
// robsonatacadoogmailcom.catalog.kyte.site).
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
// Fotos: depende do fornecedor. As da TechSupri têm marca d'água e NÃO são
// usadas (a foto vem de busca na internet, no campo `foto`). Fornecedor cujas
// fotos são limpas (conferido por marca-dagua.ts) usa as fotos dele mesmo.
// ============================================================

import type { ItemDeOrigem } from "./kabum";
import { ehCompativel, ehSuprimento } from "./fotos";

export const SITE_TECHSUPRI = "techsupri";
export const URL_TECHSUPRI = "https://techsupri.kyte.site/pt-BR";
export const PREFIXO_TECHSUPRI = "ts-";

/** Outros fornecedores na Kyte, cadastrados pelo link no painel. */
export const SITE_KYTE = "kyte";
export const PREFIXO_KYTE = "ky-";

/** As fotos da Kyte ficam no Firebase Storage; a Kyte serve por um endereço próprio, atrás da proteção. */
const FOTOS_KYTE = "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o";

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
  /** Foto do próprio fornecedor (endereço do Firebase ou caminho "/uid%2F...jpg"). */
  image?: string | null;
  gallery?: (string | null)[] | null;
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
  // Tipos que apareceram com o Robson Atacado (11/10): o começo do nome manda.
  [/^ controle (remoto|tv)\b|^ controle\b.*\b(tv|smart|roku|netflix|universal|ar condicionado)\b/, "Eletrônicos/Controles Remotos"],
  [/^ (conversor|receptor) digital\b|\bdtv\b/, "Eletrônicos/TV e Streaming"],
  [/^ (tape|som automotivo|radio automotivo|carplay|transmissor fm)\b|^ receptor bluetooth carro\b/, "Automotivo/Som Automotivo"],
  [/^ (base|cooler|suporte)\b.*\bnotebook\b/, "Informática/Suportes para Notebook"],
  [/^ suporte (de |para )?(carro|moto|retrovisor|veicular|magnetico|mesa|de mesa|celular|tablet)\b/, "Celular & Smartphone/Suportes"],
  [/^ (maquina de (cabelo|acabamento|nariz|barbear|corte)|barbeador|aparador|secador|chapinha|prancha|depilador)\b/, "Diversos/Cuidados Pessoais"],
  [/^ (balanca|mini batedor|batedor|liquidificador|mixer|cafeteira|chaleira)\b/, "Diversos/Casa e Cozinha"],
  [/^ chip\b/, "Celular & Smartphone/Chips"],
  [/^ radio\b/, "Áudio/Rádios"],
  [/^ lanterna\b/, "Diversos/Lanternas"],
  [/^ projetor\b/, "Eletrônicos/Projetores"],
  [/^ (fita de led|bastao (de )?iluminacao|lampada)\b/, "Diversos/Iluminação"],
  [/^ (video game|videogame) portatil\b/, "Games/Consoles Portáteis"],
  [/^ memory card\b.*\bplay/, "Games/Playstation"],
  [/^ (fonte|carregador|carreg) not\b/, "Energia/Fontes para Notebook"],
  [/^ (carreg|carregador) (de )?pilhas?\b/, "Energia/Pilhas e Baterias"],
  [/^ (carreg|carregador) portatil\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/^ (tripe|bastao,? tripe)\b/, "Periféricos/Streaming"],
  [/^ base tomada\b|^ fonte (pd|tomada|usb|turbo)\b|^ carreg\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/^ (filtro|extensao|extencao|extacao|estacao|regua)\b.*\btomadas?\b/, "Energia/Protetor Eletrônico"],
  [/^ fonte\b(?!.*\b(notebook|macbook|laptop|not|ultrabook)\b).*\b\d{1,2}(\.\d)?v\b/, "Energia/Fontes e Adaptadores"],
  [/^ cx (de )?som\b|\bsound.?bar\b/, "Áudio/Caixa de Som"],
  [/^ adap\b/, "Informática/Cabos e Adaptadores"],
  [/\brastreador\b/, "Celular & Smartphone/Acessórios para Smartphones"],
  [/^ fonte\b.*\b(x.?box|play ?\d|ps\d|playstation)\b/, "Games/Acessórios Gamer"],
  [/^ fonte\b(?!.*\b(notebook|macbook|laptop|not|ultrabook)\b).*\b(tipo.?c|usb|type.?c)\b/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/^ tomada universal\b/, "Energia/Fontes e Adaptadores"],
  [/^ (pipoqueira|processador de alimentos|escova eletrica churrasqueira|sanduicheira|air ?fryer|fritadeira)\b/, "Diversos/Casa e Cozinha"],
  [/^ (modelador|massageador|escova (secadora|alisadora|rotativa))\b/, "Diversos/Cuidados Pessoais"],
  [/^ (inversor veicular|bomba de ar|compressor de ar|aspirador automotivo)\b/, "Automotivo/Acessórios Automotivos"],
  [/^ campainha\b/, "Automação/Casa Inteligente"],
  [/^ mesa de som\b/, "Áudio/Microfone"],
  [/^ (adesivo|super bonder|cola)\b/, "Informática/Limpeza e Manutenção"],
  [/^ (pochete|bolsa|mochila)\b/, "Diversos/Bolsas e Mochilas"],
  [/^ bomba de agua\b/, "Diversos/Casa e Cozinha"],
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
  // Categorias do Robson Atacado
  [/controle tv/, "Eletrônicos/Controles Remotos"],
  [/suporte (carro|moto|celular)/, "Celular & Smartphone/Suportes"],
  [/maquina de cabelo/, "Diversos/Cuidados Pessoais"],
  [/balanca/, "Diversos/Casa e Cozinha"],
  [/^chip/, "Celular & Smartphone/Chips"],
  [/radio/, "Áudio/Rádios"],
  [/lanterna/, "Diversos/Lanternas"],
  [/projetor/, "Eletrônicos/Projetores"],
  [/tape carro|bluetooth p\/ carro/, "Automotivo/Som Automotivo"],
  [/relogio/, "Celular & Smartphone/Wearables"],
  [/ring light|tripe/, "Periféricos/Streaming"],
  [/power bank|carregador portatil/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/carregador|fonte carregador/, "Celular & Smartphone/Carregadores e Power Banks"],
  [/fone|heaphone|headphone/, "Áudio/Fone de Ouvido"],
  [/caixa (de )?som|sound/, "Áudio/Caixa de Som"],
  [/cabo|adaptador|conversor|hub|extensor/, "Informática/Cabos e Adaptadores"],
  [/camera/, "Automação/Câmeras de Segurança"],
  [/roteador|repetidor|antena|switch/, "Conectividade/Dispositivo de Rede"],
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
  // "Cartucho Compatível HP 932XL" não é da HP: a marca no anúncio enganaria.
  if (ehCompativel(nome)) return null;
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

/**
 * Endereço público de uma foto da Kyte, ou "" se não for foto da Kyte.
 * Aceita o caminho cru do catálogo ("/uid%2Fxxx.jpg?alt=media"), o endereço
 * do Firebase e o endereço que a Kyte usa (firebasestorage.*.kyte.site).
 */
export function fotoDaKyte(valor: unknown): string {
  const bruto = String(valor ?? "").trim();
  if (!bruto) return "";
  let caminho = "";
  if (bruto.startsWith("/") && !bruto.startsWith("//")) caminho = bruto;
  else {
    const m = bruto.match(/^https:\/\/(?:firebasestorage\.googleapis\.com|firebasestorage\.[a-z0-9.-]*kyte\.site)\/v0\/b\/kyte-7c484\.appspot\.com\/o(\/[^#\s]+)$/i);
    if (m) caminho = m[1];
  }
  if (!caminho || !/^\/[A-Za-z0-9%._~+=-]+(\?alt=media(&token=[A-Za-z0-9-]+)?)?$/.test(caminho)) return "";
  const semConsulta = caminho.split("?")[0];
  // A miniatura (thumb_280_) é pequena demais para a página do produto.
  return `${FOTOS_KYTE}${semConsulta.replace(/%2Fthumb_\d+_/i, "%2F")}?alt=media`;
}

export interface OpcoesDoFornecedor {
  /** Começo do código do produto no site ("ts-", "ky-"). */
  prefixo: string;
  /** Nome do fornecedor gravado no produto. */
  vendedor: string;
  /** Link do catálogo (vai como link de origem quando o produto não tem o seu). */
  urlDoCatalogo: string;
  /** true = as fotos do fornecedor são limpas e podem ir para o site. */
  usarFotoDoFornecedor: boolean;
}

const ehFotoDeFora = (u: unknown): u is string => typeof u === "string" && /^https:\/\//.test(u) && !/kyte/i.test(u);

/**
 * Cartucho ou tinta compatível ("paralelo"). O Thiago decidiu em 11/10 vender
 * só cartucho original: estes não entram no site (e saem na próxima passada).
 * Toner compatível continua (decisão dele no mesmo dia).
 */
export function ehCartuchoCompativel(nome: string): boolean {
  const n = ` ${semAcento(nome).replace(/[^a-z0-9]+/g, " ")} `;
  if (!ehSuprimento(nome) || / (toner|fotocondutor|cilindro) /.test(n)) return false;
  return ehCompativel(nome) || / (evolut|chinamate|ollix|byqualy|masterprint|kora|formulabs) /.test(n);
}

/** Produto da Kyte (de qualquer fornecedor) no formato que o resto do sistema entende. */
export function paraItemKyte(p: ProdutoCapturado, opcoes: OpcoesDoFornecedor): ItemDeOrigem | null {
  const id = String(p?.id || "").trim();
  const nomeCru = String(p?.name || "").trim();
  if (!id || !nomeCru || !/^[A-Za-z0-9-]{6,60}$/.test(id)) return null;
  if (ehCartuchoCompativel(nomeCru)) return null;
  const nome = nomeDoTechsupri(nomeCru);
  const preco = precoDoKyte(p);

  // Foto achada na internet (busca) sempre vale; a do fornecedor, só se for limpa.
  let fotos = (Array.isArray(p.fotos) ? p.fotos : []).filter(ehFotoDeFora).slice(0, 6);
  let foto = ehFotoDeFora(p.foto) ? p.foto : fotos[0] || "";
  if (!foto && opcoes.usarFotoDoFornecedor) {
    const doFornecedor = [p.image, ...(Array.isArray(p.gallery) ? p.gallery : [])].map(fotoDaKyte).filter(Boolean);
    fotos = [...new Set(doFornecedor)].slice(0, 6);
    foto = fotos[0] || "";
  }

  const host = (() => {
    try {
      return new URL(opcoes.urlDoCatalogo).host;
    } catch {
      return "";
    }
  })();
  const urlDoProduto = typeof p.url === "string" && host && p.url.startsWith(`https://${host}/`) ? p.url : opcoes.urlDoCatalogo;

  return {
    codigo: `${opcoes.prefixo}${id}`,
    nome,
    marca: marcaDoTechsupri(nomeCru),
    categoria: categoriaDoTechsupri(nomeCru, p.category?.name),
    vendedor: opcoes.vendedor,
    marketplace: false,
    openbox: false,
    preVenda: false,
    disponivel: disponivelNoKyte(p) && preco > 0,
    pix: preco,
    cartao: preco,
    parcelas: 0,
    oferta: null,
    url: urlDoProduto,
    foto,
    fotos: fotos.length ? fotos : foto ? [foto] : [],
    garantia: null,
  };
}

export function paraItemTechsupri(p: ProdutoCapturado): ItemDeOrigem | null {
  return paraItemKyte(p, {
    prefixo: PREFIXO_TECHSUPRI,
    vendedor: "TechSupri",
    urlDoCatalogo: URL_TECHSUPRI,
    usarFotoDoFornecedor: false,
  });
}

// ---------- link do fornecedor ----------

export type LinkDeFornecedor =
  | { plataforma: "kabum" }
  | { plataforma: "kyte"; host: string; url: string; nomeSugerido: string };

const PROVEDORES_DE_EMAIL = /(gmail|hotmail|outlook|yahoo|icloud|live|bol|uol|terra)(com)?(br)?$/;

/** Diz de que plataforma é o link colado no painel. */
export function identificarLink(texto: string): LinkDeFornecedor | null {
  let url: URL;
  try {
    url = new URL(String(texto || "").trim().replace(/^(?!https?:\/\/)/i, "https://"));
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === "kabum.com.br" || host.endsWith(".kabum.com.br")) return { plataforma: "kabum" };
  const kyte = host.match(/^([a-z0-9-]{2,63})\.(catalog\.)?kyte\.site$/);
  if (kyte && !["www", "app", "api", "web", "firebasestorage", "stagebeta"].includes(kyte[1])) {
    const base = kyte[1].replace(PROVEDORES_DE_EMAIL, "").replace(/-/g, " ").trim() || kyte[1];
    return {
      plataforma: "kyte",
      host,
      url: `https://${host}/`,
      nomeSugerido: base.charAt(0).toUpperCase() + base.slice(1),
    };
  }
  return null;
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

// ---------- captura em texto ----------

const SUFIXO_KYTE = "-X5mQX";

/**
 * Lê a captura feita pelo navegador (scripts/techsupri-captura-navegador.js),
 * uma linha por produto:
 *   <id sem -X5mQX>|<nome>|<preço>|<preço promocional>|<categoria kyte>|<X se indisponível>
 */
export function produtosDaCaptura(texto: string): ProdutoCapturado[] {
  return String(texto || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha): ProdutoCapturado | null => {
      const [id, nome, preco, promo, categoria, indisponivel] = linha.split("|");
      if (!/^\d{10,16}$/.test(String(id || "").trim()) || !String(nome || "").trim()) return null;
      const kyteId = `${id.trim()}${SUFIXO_KYTE}`;
      return {
        id: kyteId,
        name: nome.trim(),
        salePrice: Number(preco) || 0,
        salePromotionalPrice: Number(promo) || null,
        category: { name: (categoria || "").trim() || undefined },
        active: (indisponivel || "").trim() !== "X",
        showOnCatalog: true,
        url: `https://techsupri.kyte.site/pt-BR/p/produto/${kyteId}`,
      };
    })
    .filter((p): p is ProdutoCapturado => !!p);
}
