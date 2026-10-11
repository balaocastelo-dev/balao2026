// ============================================================
// Vitrine da página /notebooks: só entra o que É um notebook.
//
// A página montava os cards com uma busca por palavra solta ("notebook",
// "dell", "lenovo", "acer"...) no nome, na categoria e na descrição. Isso
// trazia memória "para Notebook", monitor Acer e até cadeira "XT Racer"
// (tem "acer" dentro de "Racer"), e os notebooks de verdade nem apareciam.
//
// A regra agora é a do catálogo: produto da categoria Computadores/Notebooks
// (e das subcategorias), ou produto de outro fornecedor cujo nome começa
// dizendo que é notebook. Acessório nunca entra, mesmo que alguém o cadastre
// dentro da categoria.
//
// Tudo aqui é função pura: recebe a lista, devolve a seleção.
// ============================================================

import { parsePriceToNumber, type Product } from "@/lib/utils";
import { RAIZ_NOTEBOOKS } from "@/lib/catalogo/vitrine-premium";

export { RAIZ_NOTEBOOKS };

/** Quantos cards a página mostra; o resto fica na categoria, com os filtros. */
export const TOTAL_NA_PAGINA = 48;

type ProdutoDaVitrine = Pick<Product, "id" | "name" | "price" | "category" | "availability">;

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** O nome começa dizendo o que o produto é: "Notebook Acer...", "MacBook Air Apple...". */
const COMECA_COMO_NOTEBOOK = /^(apple )?(notebook|macbook|laptop|ultrabook|chromebook)\b/;

/**
 * O nome começa por outra coisa: "Memória RAM para Notebook", "Fonte Notebook
 * Dell", "Suporte para Notebook", "Mochila para Notebook".
 */
const COMECA_COMO_ACESSORIO =
  /^(kit |combo )?(memoria|fonte|carregador|carreg|suporte|base|cooler|mochila|bolsa|maleta|pasta|capa|case|luva|pelicula|protetor|skin|adesivo|bateria|tela|display|teclado|mouse|cabo|adaptador|conversor|hub|dock|docking|estacao|trava|cadeado|ssd|hd|mesa|cadeira|monitor)\b/;

/** "... para notebook", "... p/ notebook", "... de notebook" no meio do nome. */
const SERVE_PARA_NOTEBOOK = /\b(para|p\/|p|de|do) (o )?(notebooks?|macbooks?|laptops?)\b/;

const naCategoria = (categoria: unknown) => {
  const atual = String(categoria || "");
  return atual === RAIZ_NOTEBOOKS || atual.startsWith(`${RAIZ_NOTEBOOKS}/`);
};

const indisponivel = (p: ProdutoDaVitrine) => /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));

/** O produto é um notebook (e não uma peça ou um acessório de notebook)? */
export function ehNotebook(produto: Pick<Product, "name" | "category">): boolean {
  const nome = semAcento(produto.name);
  if (!nome) return false;
  if (COMECA_COMO_ACESSORIO.test(nome)) return false;
  if (COMECA_COMO_NOTEBOOK.test(nome)) return true;
  // Dentro da categoria vale o cadastro, desde que o nome não diga que a peça
  // é "para notebook".
  return naCategoria(produto.category) && !SERVE_PARA_NOTEBOOK.test(nome);
}

export interface VitrineDeNotebooks<T> {
  /** Os cards da página, do mais barato para o mais caro. */
  produtos: T[];
  /** Quantos notebooks a loja tem à venda (pode ser mais do que os cards). */
  total: number;
}

/** Tira o que não é notebook, o que está indisponível e o que veio repetido. */
export function selecionarNotebooks<T extends ProdutoDaVitrine>(
  produtos: T[],
  limite = TOTAL_NA_PAGINA
): VitrineDeNotebooks<T> {
  const vistos = new Set<string>();
  const notebooks: T[] = [];

  for (const produto of Array.isArray(produtos) ? produtos : []) {
    if (!produto || !ehNotebook(produto) || indisponivel(produto)) continue;
    if (!(parsePriceToNumber(produto.price) > 0)) continue;
    const id = String(produto.id || "");
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    notebooks.push(produto);
  }

  notebooks.sort(
    (a, b) =>
      parsePriceToNumber(a.price) - parsePriceToNumber(b.price) ||
      String(a.name).localeCompare(String(b.name), "pt-BR")
  );

  return { produtos: notebooks.slice(0, Math.max(1, limite)), total: notebooks.length };
}
