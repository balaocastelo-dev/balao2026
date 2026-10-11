// ============================================================
// Vitrines da página inicial: que produtos entram em cada prateleira.
//
// Regras do Thiago (11/10): "Notebooks" mostra só notebook, "Monitores" só
// monitor (nada de luminária, suporte ou cabo de monitor). Por isso cada
// vitrine escolhe pela CATEGORIA do produto (o caminho que vem da fonte) e
// pelo começo do nome, nunca por "o nome contém a palavra".
//
// E a vitrine precisa parecer vitrine: produto com foto de verdade, de
// marcas variadas, sem o acessório de R$ 5 ganhando o lugar do produto que
// a pessoa veio ver. Função pura, testada.
// ============================================================

import { parsePriceToNumber, slugifyText, type Product } from "@/lib/utils";

export interface Vitrine {
  id: string;
  titulo: string;
  subtitulo: string;
  /** Endereço do "Ver todos". */
  href: string;
  produtos: Product[];
}

interface Regra {
  id: string;
  titulo: string;
  /** Nome curto, para os atalhos de departamento. */
  curto: string;
  subtitulo: string;
  /** Caminhos de categoria aceitos (prefixo). */
  categorias: string[];
  /** O nome precisa começar com uma destas palavras (vazio = qualquer). */
  comecaCom?: string[];
  /** Palavras que tiram o produto da vitrine. */
  fora?: RegExp;
  /** Preço mínimo para entrar (corta acessório barato perdido na categoria). */
  precoMinimo?: number;
  /** Só produtos de pronta entrega. */
  pronta?: boolean;
  href: string;
}

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();

const ACESSORIO = /\b(suporte|luminaria|cabo|adaptador|capa|pelicula|braco|limpa|kit de limpeza|bolsa|mochila|case|fonte|carregador|bateria|memoria|teclado|mouse)\b/;

export const REGRAS_DAS_VITRINES: Regra[] = [
  {
    id: "pc-gamer",
    curto: "PC Gamer",
    titulo: "Computador Gamer",
    subtitulo: "Montados e testados na nossa bancada, com garantia da loja.",
    categorias: ["Computadores/PC"],
    comecaCom: ["computador", "pc", "kit"],
    fora: /\b(monitor|notebook)\b/,
    precoMinimo: 900,
    href: "/categoria/computadores-pc",
  },
  {
    id: "notebooks",
    curto: "Notebooks",
    titulo: "Notebooks",
    subtitulo: "Para trabalho, estudo e jogos.",
    categorias: ["Computadores/Notebooks"],
    comecaCom: ["notebook", "macbook", "laptop", "chromebook", "ultrabook", "apple macbook"],
    fora: ACESSORIO,
    precoMinimo: 1200,
    href: "/categoria/computadores-notebooks",
  },
  {
    id: "monitores",
    curto: "Monitores",
    titulo: "Monitores",
    subtitulo: "Gamer, trabalho e ultrawide.",
    categorias: ["Computadores/Monitores"],
    comecaCom: ["monitor"],
    fora: ACESSORIO,
    precoMinimo: 300,
    href: "/categoria/computadores-monitores",
  },
  {
    id: "pronta-entrega",
    curto: "Pronta entrega",
    titulo: "Pronta entrega",
    subtitulo: "Disponível para entrega imediata, direto da loja no Cambuí.",
    categorias: [],
    pronta: true,
    // Cartucho e toner já têm a vitrine de Impressão.
    fora: /\b(cartucho|toner|tinta|refil|cabo|adaptador|pelicula|capa)\b/,
    precoMinimo: 80,
    href: "/?pronta=1",
  },
  {
    id: "hardware",
    curto: "Hardware",
    titulo: "Hardware e upgrade",
    subtitulo: "Placa de vídeo, processador, memória, SSD e placa-mãe.",
    categorias: [
      "Hardware/Placa de vídeo",
      "Hardware/Processadores",
      "Hardware/Memória RAM",
      "Hardware/SSD",
      "Hardware/Placas-mãe",
      "Hardware/Fontes",
    ],
    comecaCom: ["placa", "processador", "memoria", "ssd", "fonte", "kit"],
    fora: /\b(adaptador|case|gaveta|suporte|cabo|notebook|ddr3)\b/,
    precoMinimo: 250,
    href: "/categoria/hardware",
  },
  {
    id: "perifericos",
    curto: "Periféricos",
    titulo: "Periféricos e setup",
    subtitulo: "Teclado, mouse, headset e cadeira gamer.",
    categorias: ["Periféricos", "Áudio/Headset", "Espaço Gamer/Cadeiras Gamer"],
    comecaCom: ["teclado", "mouse", "headset", "kit", "cadeira", "fone", "webcam"],
    fora: /\b(pad|mousepad|apoio|suporte|cabo)\b/,
    precoMinimo: 80,
    href: "/categoria/perifericos",
  },
  {
    id: "games",
    curto: "Games",
    titulo: "Consoles e games",
    subtitulo: "PlayStation, Xbox, Nintendo e controles.",
    categorias: ["Games/Playstation", "Games/Xbox", "Games/Nintendo", "Games/Consoles"],
    comecaCom: ["console", "controle", "playstation", "nintendo", "xbox", "joy-con", "volante"],
    fora: /\b(capa|pelicula|case|suporte|cabo|carregador|base|protetor|grip|adesivo|bateria)\b/,
    precoMinimo: 200,
    href: "/categoria/games",
  },
  {
    id: "impressao",
    curto: "Impressão",
    titulo: "Impressão",
    subtitulo: "Impressoras, toners, cartuchos e tintas.",
    categorias: ["Impressão", "Escritório/Equipamentos"],
    comecaCom: ["impressora", "multifuncional", "toner", "cartucho", "tinta", "refil", "kit"],
    precoMinimo: 30,
    href: "/categoria/impressao",
  },
];

function entra(p: Product, r: Regra): boolean {
  const nome = semAcento(p.name);
  const cat = semAcento(p.category);
  if (r.pronta && semAcento(p.availability) !== "pronta entrega") return false;
  if (r.categorias.length && !r.categorias.some((c) => cat === semAcento(c) || cat.startsWith(`${semAcento(c)}/`))) return false;
  if (r.comecaCom?.length && !r.comecaCom.some((w) => nome.startsWith(semAcento(w)))) return false;
  if (r.fora && r.fora.test(nome)) return false;
  const preco = parsePriceToNumber(p.price);
  if (!(preco > 0)) return false;
  if (r.precoMinimo != null && preco < r.precoMinimo) return false;
  return true;
}

/** Foto boa: existe e não é a provisória nem a ilustrativa. */
function temFotoBoa(p: Product): boolean {
  const img = String(p.image || "");
  return !!img && !img.includes("produto-sem-foto") && !img.endsWith("#ilustrativa");
}

/**
 * Escolhe `quantos` produtos variando marca e faixa de preço: ordena por
 * preço, divide em faixas e vai tirando um de cada faixa, sem repetir marca
 * enquanto der. Assim a vitrine mostra do intermediário ao topo, não só o
 * mais barato.
 */
export function escolherVariados(produtos: Product[], quantos: number): Product[] {
  const comFoto = produtos.filter(temFotoBoa);
  const base = comFoto.length >= quantos ? comFoto : produtos;
  const vistos = new Set<string>();
  const unicos = base.filter((p) => {
    const chave = semAcento(p.name).slice(0, 48);
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
  const ordenados = [...unicos].sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
  if (ordenados.length <= quantos) return ordenados;

  // Começa pelo meio da faixa de preço (o que mais vende), depois alterna.
  const faixas = quantos;
  const tamanho = ordenados.length / faixas;
  const grupos: Product[][] = Array.from({ length: faixas }, (_, i) =>
    ordenados.slice(Math.floor(i * tamanho), Math.floor((i + 1) * tamanho))
  );
  const escolhidos: Product[] = [];
  const marcas = new Set<string>();
  for (const grupo of grupos) {
    const semRepetir = grupo.find((p) => !marcas.has(semAcento(p.brand || p.name.split(" ")[1])));
    const p = semRepetir || grupo[Math.floor(grupo.length / 2)];
    if (p) {
      escolhidos.push(p);
      marcas.add(semAcento(p.brand || p.name.split(" ")[1]));
    }
  }
  return escolhidos.slice(0, quantos);
}

export function montarVitrines(produtos: Product[], porVitrine: number): Vitrine[] {
  const usados = new Set<string>();
  const saida: Vitrine[] = [];
  for (const r of REGRAS_DAS_VITRINES) {
    const candidatos = produtos.filter((p) => !usados.has(String(p.id)) && entra(p, r));
    const escolhidos = escolherVariados(candidatos, porVitrine);
    if (escolhidos.length < Math.min(4, porVitrine)) continue;
    escolhidos.forEach((p) => usados.add(String(p.id)));
    saida.push({ id: r.id, titulo: r.titulo, subtitulo: r.subtitulo, href: r.href, produtos: escolhidos });
  }
  return saida;
}

/** Atalhos de departamento (com quantos produtos cada um tem). */
export function atalhosDeDepartamento(produtos: Product[]) {
  return REGRAS_DAS_VITRINES.map((r) => ({
    id: r.id,
    titulo: r.curto,
    href: r.href,
    total: produtos.filter((p) => entra(p, { ...r, precoMinimo: undefined })).length,
  })).filter((a) => a.total > 0);
}

export const slugDaCategoria = (caminho: string) => slugifyText(caminho.replace(/\//g, " "));
