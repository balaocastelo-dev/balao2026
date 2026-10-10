// ============================================================
// Margem escalonada: quanto mais barato o produto, maior a margem.
//
// Pedido do Thiago para o fornecedor local (TechSupri): acréscimo entre 66% e
// 150% sobre o preço do fornecedor. Acessório barato (cabo, fone, pilha) leva
// perto de 150%; produto caro leva perto de 66%. Notebook, cartucho, toner,
// tinta e celular ficam sempre no mínimo (66%).
//
// Fonte sem regra continua com a margem única de sempre (`fontes_preco.margem`).
// Função pura, testada.
// ============================================================

import { normalizarMargem } from "./calculo";

export interface RegraDeMargem {
  tipo: "escalonada";
  /** Margem dos produtos caros e das categorias fixas (%). */
  minima: number;
  /** Margem dos produtos baratos (%). */
  maxima: number;
  /** Até este preço do fornecedor vale a margem máxima. */
  precoDaMaxima: number;
  /** A partir deste preço do fornecedor vale a margem mínima. */
  precoDaMinima: number;
  /** Palavras que, no nome ou na categoria, fixam a margem mínima. */
  fixasNaMinima: string[];
}

export const REGRA_TECHSUPRI: RegraDeMargem = {
  tipo: "escalonada",
  minima: 66,
  maxima: 150,
  precoDaMaxima: 20,
  precoDaMinima: 400,
  fixasNaMinima: [
    "notebook", "laptop", "macbook", "chromebook",
    "cartucho", "toner", "tinta", "refil", "fotocondutor", "cilindro",
    "celular", "smartphone", "iphone",
  ],
};

const semAcento = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase();

export function lerRegra(valor: unknown): RegraDeMargem | null {
  if (!valor) return null;
  let bruto: unknown = valor;
  if (typeof valor === "string") {
    try {
      bruto = JSON.parse(valor);
    } catch {
      return null;
    }
  }
  const r = bruto as Partial<RegraDeMargem>;
  if (!r || r.tipo !== "escalonada") return null;
  const minima = normalizarMargem(r.minima);
  const maxima = Math.max(minima, normalizarMargem(r.maxima));
  const precoDaMaxima = Math.max(0, Number(r.precoDaMaxima) || 0);
  const precoDaMinima = Math.max(precoDaMaxima + 1, Number(r.precoDaMinima) || 0);
  const fixasNaMinima = Array.isArray(r.fixasNaMinima)
    ? r.fixasNaMinima.map((p) => semAcento(p).trim()).filter(Boolean).slice(0, 60)
    : [];
  return { tipo: "escalonada", minima, maxima, precoDaMaxima, precoDaMinima, fixasNaMinima };
}

const palavras = (s: string) => semAcento(s).replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
const PREFIXOS = new Set(["kit", "combo", "conjunto", "par", "refil", "garrafa"]);
const singular = (p: string) => (p.length > 3 && p.endsWith("s") ? p.slice(0, -1) : p);

/**
 * O produto É de um tipo fixo (notebook, cartucho, celular...)?
 *
 * Só conta a palavra no começo do nome ("Cartucho HP 664", "Kit Cartucho...")
 * ou quando a última parte da categoria é o próprio tipo ("Impressão/Toners").
 * Assim "Fonte para Notebook" e "Capa para Celular" seguem como acessório,
 * com margem de acessório.
 */
function ehFixa(regra: RegraDeMargem, nome: string, categoria: string): boolean {
  const fixas = new Set(regra.fixasNaMinima);
  // "Cartucho HP 664", "Kit Cartucho...", "Refil de Tinta..." contam;
  // "Fonte Notebook Dell" e "Capa Celular" não (o tipo vem depois).
  const [primeira, segunda] = palavras(nome).map(singular);
  if (primeira && fixas.has(primeira)) return true;
  if (segunda && fixas.has(segunda) && PREFIXOS.has(primeira)) return true;
  const ultima = palavras(String(categoria || "").split("/").pop() || "").map(singular);
  return ultima.length === 1 && fixas.has(ultima[0]);
}

/**
 * A margem (%) de um produto pela regra.
 *
 * Entre os dois preços de referência a margem cai em escala logarítmica: de
 * R$ 20 para R$ 40 ela cai tanto quanto de R$ 200 para R$ 400. Assim um item
 * de R$ 60 não fica com quase a mesma margem de um de R$ 25.
 */
export function margemPelaRegra(regra: RegraDeMargem, produto: { nome: string; categoria: string; preco: number }): number {
  if (ehFixa(regra, produto.nome, produto.categoria)) return regra.minima;
  const preco = produto.preco;
  if (!(preco > 0) || preco <= regra.precoDaMaxima) return regra.maxima;
  if (preco >= regra.precoDaMinima) return regra.minima;
  const fracao =
    (Math.log(preco) - Math.log(Math.max(1, regra.precoDaMaxima))) /
    (Math.log(regra.precoDaMinima) - Math.log(Math.max(1, regra.precoDaMaxima)));
  const margem = regra.maxima - fracao * (regra.maxima - regra.minima);
  return Math.round(margem * 10) / 10;
}

/** A margem que vale para um produto da fonte: a regra, se houver, ou a margem única. */
export function margemDoProduto(
  fonte: { margem: number; regra_margem?: RegraDeMargem | null },
  produto: { nome: string; categoria: string; preco: number }
): number {
  return fonte.regra_margem ? margemPelaRegra(fonte.regra_margem, produto) : normalizarMargem(fonte.margem);
}

/** Texto curto da regra, para o painel. */
export function descreverRegra(regra: RegraDeMargem): string {
  const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return `${regra.maxima}% até ${reais(regra.precoDaMaxima)}, caindo até ${regra.minima}% a partir de ${reais(regra.precoDaMinima)}. Sempre ${regra.minima}%: ${regra.fixasNaMinima.slice(0, 8).join(", ")}${regra.fixasNaMinima.length > 8 ? "…" : ""}.`;
}
