// ============================================================
// Filtros das páginas de navegação do catálogo (busca e categoria).
//
// Quem procura "16gb ddr5" querendo memória recebia uma tela de computadores:
// todo PC traz "16GB DDR5" no nome. O filtro lateral resolve isso deixando a
// pessoa dizer ONDE está procurando (Hardware › Memória RAM), de que marca e
// em que faixa de preço.
//
// Tudo aqui é função pura. O estado dos filtros mora na URL:
//   ?cat=Hardware/Memória RAM&marca=Kingston,Corsair&min=100&max=900&tags=DDR5&ordem=menor&page=2
// ============================================================

import { extractTags, filterProductsByTags, type FilterTag } from "@/lib/product-filters";
import { parsePriceToNumber, type Product } from "@/lib/utils";

export type Ordem = "relevancia" | "menor" | "maior";

export interface Filtros {
  /** Caminho completo da categoria escolhida ("" = todas). */
  cat: string;
  marcas: string[];
  min: number | null;
  max: number | null;
  tags: string[];
  ordem: Ordem | null;
  pagina: number;
}

type Parametros = Record<string, string | string[] | undefined>;

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const lista = (v: string | string[] | undefined) =>
  primeiro(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

function preco(v: string | string[] | undefined): number | null {
  const texto = primeiro(v).trim().replace(/\./g, "").replace(",", ".");
  if (!texto) return null;
  const n = Number(texto);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function lerFiltros(sp: Parametros): Filtros {
  const ordem = primeiro(sp.ordem);
  const pagina = Number.parseInt(primeiro(sp.page) || "1", 10);
  let min = preco(sp.min);
  let max = preco(sp.max);
  if (min != null && max != null && min > max) [min, max] = [max, min];

  return {
    cat: primeiro(sp.cat)
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean)
      .join("/"),
    marcas: lista(sp.marca),
    min,
    max,
    tags: lista(sp.tags),
    ordem: ordem === "menor" || ordem === "maior" || ordem === "relevancia" ? ordem : null,
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

/** Quantos filtros estão ligados (ordem e página não contam). */
export function contarFiltros(f: Filtros): number {
  return (f.cat ? 1 : 0) + f.marcas.length + (f.min != null || f.max != null ? 1 : 0) + f.tags.length;
}

// ---------- aplicar ----------

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();

export function dentroDaCategoria(categoriaDoProduto: unknown, caminho: string): boolean {
  if (!caminho) return true;
  const atual = semAcento(categoriaDoProduto);
  const alvo = semAcento(caminho);
  return atual === alvo || atual.startsWith(`${alvo}/`);
}

type Dimensao = "cat" | "marca" | "preco" | "tags";

/**
 * Aplica os filtros. `menos` deixa uma dimensão de fora — é assim que cada
 * bloco do painel conta suas opções: a lista de marcas considera categoria,
 * preço e tags, mas não a marca já marcada (senão as outras sumiriam).
 */
export function aplicarFiltros<T extends Product>(produtos: T[], f: Filtros, menos?: Dimensao): T[] {
  let saida = produtos;

  if (menos !== "cat" && f.cat) {
    saida = saida.filter((p) => dentroDaCategoria(p.category, f.cat));
  }
  if (menos !== "marca" && f.marcas.length > 0) {
    const alvos = new Set(f.marcas.map(semAcento));
    saida = saida.filter((p) => alvos.has(semAcento(p.brand)));
  }
  if (menos !== "preco" && (f.min != null || f.max != null)) {
    saida = saida.filter((p) => {
      const valor = parsePriceToNumber(p.price);
      if (f.min != null && valor < f.min) return false;
      if (f.max != null && valor > f.max) return false;
      return true;
    });
  }
  if (menos !== "tags" && f.tags.length > 0) {
    saida = filterProductsByTags(saida, f.tags) as T[];
  }
  return saida;
}

// ---------- facetas ----------

export interface OpcaoDeCategoria {
  nome: string;
  caminho: string;
  total: number;
}

export interface Facetas {
  /** Do topo até a categoria escolhida; o primeiro item é "todas". */
  trilha: { nome: string; caminho: string }[];
  categorias: OpcaoDeCategoria[];
  marcas: { nome: string; total: number }[];
  tags: FilterTag[];
  faixa: { min: number; max: number } | null;
}

/**
 * @param raiz caminho fixo da página (a categoria da página /categoria/x). Na
 *             busca é "": a pessoa escolhe a partir dos departamentos.
 */
export function montarFacetas(produtos: Product[], f: Filtros, raiz = "", nomeDaRaiz = "Todas as categorias"): Facetas {
  // --- categoria: os filhos diretos de onde a pessoa está ---
  const base = f.cat || raiz;
  const profundidade = base ? base.split("/").length : 0;
  const porFilho = new Map<string, OpcaoDeCategoria>();
  for (const p of aplicarFiltros(produtos, f, "cat")) {
    if (!dentroDaCategoria(p.category, base)) continue;
    const partes = String(p.category || "").split("/").map((s) => s.trim()).filter(Boolean);
    const filho = partes[profundidade];
    if (!filho) continue;
    const caminho = partes.slice(0, profundidade + 1).join("/");
    const chave = semAcento(caminho);
    const atual = porFilho.get(chave);
    if (atual) atual.total++;
    else porFilho.set(chave, { nome: filho, caminho, total: 1 });
  }
  const categorias = [...porFilho.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));

  const trilha = [{ nome: nomeDaRaiz, caminho: raiz }];
  if (f.cat && semAcento(f.cat) !== semAcento(raiz)) {
    const partes = f.cat.split("/");
    const inicio = raiz && dentroDaCategoria(f.cat, raiz) ? raiz.split("/").length : 0;
    for (let i = inicio; i < partes.length; i++) {
      trilha.push({ nome: partes[i], caminho: partes.slice(0, i + 1).join("/") });
    }
  }

  // --- marca ---
  const porMarca = new Map<string, { nome: string; total: number }>();
  for (const p of aplicarFiltros(produtos, f, "marca")) {
    const nome = String(p.brand || "").trim();
    if (!nome || /^(outros|gen[eé]ric[oa]|generic|diversas|geral)$/i.test(nome)) continue;
    const chave = semAcento(nome);
    const atual = porMarca.get(chave);
    if (atual) atual.total++;
    else porMarca.set(chave, { nome, total: 1 });
  }
  const marcas = [...porMarca.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR"));

  // --- preço ---
  const valores = aplicarFiltros(produtos, f, "preco")
    .map((p) => parsePriceToNumber(p.price))
    .filter((v) => v > 0);
  const faixa = valores.length
    ? { min: Math.floor(Math.min(...valores)), max: Math.ceil(Math.max(...valores)) }
    : null;

  // --- características ---
  const tags = extractTags(aplicarFiltros(produtos, f, "tags"));
  // Tag marcada nunca some da lista, mesmo que a contagem dela tenha caído.
  for (const marcada of f.tags) {
    if (!tags.some((t) => t.name === marcada)) tags.push({ name: marcada, count: 0 });
  }

  return { trilha, categorias, marcas, tags, faixa };
}

// ---------- ordenação ----------

export function termosDaBusca(busca: string): string[] {
  return [...new Set(semAcento(busca).split(/[^a-z0-9.+-]+/).filter(Boolean))].slice(0, 8);
}

/**
 * Relevância na busca. Quanto maior a fatia do nome que a busca cobre, mais o
 * produto É aquilo: "Memória RAM Kingston 16GB DDR5" é uma memória; um PC com
 * quinze itens na ficha só TEM uma. O termo aparecer no começo também conta.
 */
const PALAVRAS_DE_MAQUINA = /^(pc|pcs|computador|computadores|desktop|notebook|notebooks|laptop|macbook|imac|gamer|completo|celular|smartphone|iphone|tablet|ipad|all-in-one)$/;
const CATEGORIAS_DE_MAQUINA = /^(computadores\/pc|computadores\/notebooks|celular|tablets)/;

/** Peso tirado da máquina completa quando a busca só fala de peça. */
const DESCONTO_DE_MAQUINA = 25;

export function pontuar(produto: Product, termos: string[]): number {
  if (termos.length === 0) return 0;
  const nome = semAcento(produto.name);
  if (!nome) return 0;
  const categoria = semAcento(produto.category);

  // "16gb ddr5" não cita máquina nenhuma: quem digita isso quer a peça. Aí o
  // PC e o notebook, que só TRAZEM a peça na ficha, vão para o fim da fila.
  // Quem digita "pc gamer 16gb" continua vendo os PCs primeiro.
  const buscaPorMaquina = termos.some((t) => PALAVRAS_DE_MAQUINA.test(t));
  const desconto = !buscaPorMaquina && CATEGORIAS_DE_MAQUINA.test(categoria) ? DESCONTO_DE_MAQUINA : 0;

  let cobertos = 0;
  let primeiraPosicao = nome.length;
  let naCategoria = 0;
  for (const termo of termos) {
    const onde = nome.indexOf(termo);
    if (onde >= 0) {
      cobertos += termo.length;
      primeiraPosicao = Math.min(primeiraPosicao, onde);
    }
    if (categoria.includes(termo)) naCategoria++;
  }
  return (cobertos / nome.length) * 100 + (1 - primeiraPosicao / nome.length) * 20 + naCategoria * 15 - desconto;
}

export function ordenar<T extends Product>(produtos: T[], ordem: Ordem, termos: string[] = []): T[] {
  const copia = [...produtos];
  const valor = (p: Product) => parsePriceToNumber(p.price);
  if (ordem === "menor") return copia.sort((a, b) => valor(a) - valor(b));
  if (ordem === "maior") return copia.sort((a, b) => valor(b) - valor(a));
  if (termos.length === 0) return copia.sort((a, b) => valor(a) - valor(b));
  const pontos = new Map(copia.map((p) => [p, pontuar(p, termos)]));
  return copia.sort((a, b) => pontos.get(b)! - pontos.get(a)! || valor(a) - valor(b));
}

// ---------- endereço ----------

/** Monta a query string a partir dos filtros (sem a página quando é a primeira). */
export function paraQuery(f: Partial<Filtros>, fixos: Record<string, string | undefined> = {}): string {
  const q = new URLSearchParams();
  for (const [chave, v] of Object.entries(fixos)) if (v) q.set(chave, v);
  if (f.cat) q.set("cat", f.cat);
  if (f.marcas?.length) q.set("marca", f.marcas.join(","));
  if (f.min != null) q.set("min", String(f.min));
  if (f.max != null) q.set("max", String(f.max));
  if (f.tags?.length) q.set("tags", f.tags.join(","));
  if (f.ordem) q.set("ordem", f.ordem);
  if (f.pagina && f.pagina > 1) q.set("page", String(f.pagina));
  return q.toString();
}
