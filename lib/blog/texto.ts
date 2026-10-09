import type { Artigo, Bloco, ItemDoSumario, TextoRico } from "./tipos";

/**
 * Tudo que lê o texto de um artigo: a marcação mínima dos parágrafos, a
 * contagem de palavras, o tempo de leitura e o sumário.
 *
 * Fica separado dos componentes porque a régua de qualidade, o JSON-LD e os
 * testes usam as mesmas contas — e nenhum deles pode depender de React.
 */

export type Trecho =
  | { tipo: "texto"; valor: string }
  | { tipo: "negrito"; filhos: Trecho[] }
  | { tipo: "italico"; filhos: Trecho[] }
  | { tipo: "link"; href: string; filhos: Trecho[] };

const PADRAO = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*/;

/** Só deixa passar endereço que um link de artigo pode ter. */
export function hrefSeguro(href: string): string | null {
  const h = String(href || "").trim();
  if (!h) return null;
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  if (h.startsWith("#")) return h;
  if (/^https:\/\//i.test(h)) return h;
  if (/^(mailto|tel):/i.test(h)) return h;
  return null;
}

/** Quebra o texto com marcação mínima em trechos prontos para desenhar. */
export function lerTextoRico(texto: TextoRico): Trecho[] {
  const saida: Trecho[] = [];
  let resto = String(texto ?? "");

  while (resto.length > 0) {
    const m = PADRAO.exec(resto);
    if (!m) {
      saida.push({ tipo: "texto", valor: resto });
      break;
    }
    if (m.index > 0) saida.push({ tipo: "texto", valor: resto.slice(0, m.index) });

    if (m[1] !== undefined) {
      const href = hrefSeguro(m[2]);
      // Link com endereço estranho vira texto comum, em vez de sumir.
      if (href) saida.push({ tipo: "link", href, filhos: lerTextoRico(m[1]) });
      else saida.push({ tipo: "texto", valor: m[1] });
    } else if (m[3] !== undefined) {
      saida.push({ tipo: "negrito", filhos: lerTextoRico(m[3]) });
    } else if (m[4] !== undefined) {
      saida.push({ tipo: "italico", filhos: lerTextoRico(m[4]) });
    }
    resto = resto.slice(m.index + m[0].length);
  }
  return saida;
}

function trechosParaTexto(trechos: Trecho[]): string {
  return trechos.map((t) => (t.tipo === "texto" ? t.valor : trechosParaTexto(t.filhos))).join("");
}

/** O texto sem marcação nenhuma. */
export function textoPuro(texto: TextoRico): string {
  return trechosParaTexto(lerTextoRico(texto)).replace(/\s+/g, " ").trim();
}

function coletarLinks(trechos: Trecho[], saida: string[]) {
  for (const t of trechos) {
    if (t.tipo === "texto") continue;
    if (t.tipo === "link") saida.push(t.href);
    coletarLinks(t.filhos, saida);
  }
}

export function linksDoTexto(texto: TextoRico): string[] {
  const saida: string[] = [];
  coletarLinks(lerTextoRico(texto), saida);
  return saida;
}

export function semAcento(texto: string): string {
  return String(texto || "")
    .replace(/\u00a0/g, " ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function criarSlug(texto: string): string {
  const slug = semAcento(texto)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || "secao";
}

export function contarPalavras(texto: string): number {
  return String(texto || "")
    .split(/\s+/)
    .filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

/** Todo o texto que o leitor lê em um bloco, em linhas soltas. */
export function textosDoBloco(bloco: Bloco): string[] {
  switch (bloco.tipo) {
    case "paragrafo":
      return [textoPuro(bloco.texto)];
    case "titulo":
      return [bloco.texto];
    case "lista":
    case "resumo":
      return bloco.itens.map(textoPuro);
    case "destaque":
      return [bloco.titulo ?? "", textoPuro(bloco.texto)];
    case "benchmark":
      return [bloco.titulo, bloco.nota ? textoPuro(bloco.nota) : ""];
    case "tabela":
      return [bloco.titulo ?? "", ...bloco.linhas.flat().map(textoPuro), bloco.nota ? textoPuro(bloco.nota) : ""];
    case "pros-contras":
      return [...bloco.pros, ...bloco.contras];
    case "citacao":
      return [bloco.texto];
    case "chamada":
      return [bloco.titulo ?? "", bloco.texto ? textoPuro(bloco.texto) : ""];
    case "imagem":
      return [bloco.legenda ?? ""];
  }
}

export function palavrasDoArtigo(artigo: Pick<Artigo, "blocos" | "perguntas" | "analise">): number {
  let total = 0;
  for (const bloco of artigo.blocos) {
    for (const linha of textosDoBloco(bloco)) total += contarPalavras(linha);
  }
  for (const p of artigo.perguntas ?? []) total += contarPalavras(p.pergunta) + contarPalavras(p.resposta);
  if (artigo.analise) total += contarPalavras(artigo.analise.veredito);
  return total;
}

/**
 * 200 palavras por minuto é a leitura atenta de texto técnico em português.
 * Gráfico e tabela não têm palavras, mas tomam tempo: meio minuto cada.
 */
export function minutosDeLeitura(artigo: Pick<Artigo, "blocos" | "perguntas" | "analise">): number {
  const palavras = palavrasDoArtigo(artigo);
  const visuais = artigo.blocos.filter((b) => b.tipo === "benchmark" || b.tipo === "tabela").length;
  return Math.max(1, Math.round(palavras / 200 + visuais * 0.5));
}

/**
 * Dá a cada título a âncora que o sumário usa.
 * Dois títulos iguais não podem cair na mesma âncora: o segundo ganha "-2".
 */
export function montarSumario(blocos: Bloco[]): { sumario: ItemDoSumario[]; ids: Map<Bloco, string> } {
  const usados = new Map<string, number>();
  const ids = new Map<Bloco, string>();
  const sumario: ItemDoSumario[] = [];

  for (const bloco of blocos) {
    if (bloco.tipo !== "titulo") continue;
    const base = bloco.id ? criarSlug(bloco.id) : criarSlug(bloco.texto);
    const vezes = (usados.get(base) ?? 0) + 1;
    usados.set(base, vezes);
    const id = vezes === 1 ? base : `${base}-${vezes}`;
    ids.set(bloco, id);
    sumario.push({ id, texto: bloco.texto, nivel: bloco.nivel });
  }
  return { sumario, ids };
}

const FUSO = "America/Sao_Paulo";

/** "9 de outubro de 2026" — sempre no horário de Campinas, não no do servidor. */
export function dataPorExtenso(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: FUSO }).format(d);
}

/** "9 out. 2026" */
export function dataCurta(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: FUSO })
    .format(d)
    .replace(/ de /g, " ");
}

const UNIDADES = "GB|TB|MB|kB|W|Hz|kHz|MHz|GHz|fps|ms|mm|cm|bits|°C|%|polegadas|anos|min";

const NUMERO_E_UNIDADE = new RegExp(`(\\d) (${UNIDADES})(?![\\p{L}\\p{N}])`, "gu");

/** Prende o número à unidade: "16 GB" e "650 W" nunca se separam no fim da linha. */
export function prenderUnidades(texto: string): string {
  return String(texto || "").replace(NUMERO_E_UNIDADE, "$1\u00a0$2");
}

/**
 * Para títulos: além das unidades, prende a última palavra à penúltima, para
 * nenhuma ficar sozinha na linha de baixo.
 */
export function semQuebraRuim(titulo: string): string {
  const comUnidades = prenderUnidades(titulo);
  const ultimoEspaco = comUnidades.lastIndexOf(" ");
  if (ultimoEspaco === -1 || comUnidades.length - ultimoEspaco > 14) return comUnidades;
  return `${comUnidades.slice(0, ultimoEspaco)}\u00a0${comUnidades.slice(ultimoEspaco + 1)}`;
}

export function cortar(texto: string, max: number): string {
  const t = String(texto || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const ultimoEspaco = corte.lastIndexOf(" ");
  return `${(ultimoEspaco > max * 0.6 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,;:.]+$/, "")}…`;
}
