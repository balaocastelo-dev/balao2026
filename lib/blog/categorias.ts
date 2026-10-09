import { semAcento } from "./texto";
import type { CategoriaSlug } from "./tipos";

export type Categoria = {
  slug: CategoriaSlug;
  nome: string;
  /** Uma frase para o topo da página da categoria e para o Google. */
  descricao: string;
};

/** A ordem daqui é a ordem dos filtros na página do blog. */
export const CATEGORIAS: Categoria[] = [
  {
    slug: "guias",
    nome: "Guias",
    descricao:
      "Como escolher computador, notebook e periféricos pelo uso que você vai dar, sem pagar por recurso que não vai usar.",
  },
  {
    slug: "hardware",
    nome: "Hardware",
    descricao:
      "Placa de vídeo, memória, SSD, fonte e as outras peças: o que cada uma faz, o que combina com o quê e quando vale o upgrade.",
  },
  {
    slug: "analises",
    nome: "Análises",
    descricao:
      "Comparativos com números de teste e fonte declarada, prós, contras e para quem cada opção serve de verdade.",
  },
  {
    slug: "noticias",
    nome: "Notícias",
    descricao:
      "O que mudou no mercado de informática e o que isso significa para quem vai comprar ou fazer upgrade agora.",
  },
  {
    slug: "assistencia",
    nome: "Assistência",
    descricao:
      "Sinais de defeito, manutenção, recuperação de dados e o que dá para resolver em casa antes de levar à bancada.",
  },
];

const POR_SLUG = new Map(CATEGORIAS.map((c) => [c.slug, c]));

export function categoriaPorSlug(slug: string): Categoria | null {
  return POR_SLUG.get(slug as CategoriaSlug) ?? null;
}

export function nomeDaCategoria(slug: CategoriaSlug): string {
  return POR_SLUG.get(slug)?.nome ?? "Guias";
}

/**
 * Os artigos que chegam do Soro não trazem categoria. Esta regra decide pelo
 * título e pelo endereço — e a ordem importa: "Como recuperar dados de HD"
 * fala de uma peça, mas é assunto de assistência, então assistência vem antes.
 */
export function classificarPorTitulo(titulo: string, slug = ""): CategoriaSlug {
  const t = ` ${semAcento(`${titulo} ${slug.replace(/-/g, " ")}`)} `;
  const tem = (...termos: string[]) => termos.some((termo) => t.includes(termo));

  if (tem("manutencao", "assistencia", "recuperar dados", "recuperacao de dados", "esquenta", "conserto", "nao liga", "defeito")) {
    return "assistencia";
  }
  if (tem("vale a pena", " vs ", " versus ", "analise", "review", "comparativo")) return "analises";
  if (
    tem(
      " ssd",
      " hd ",
      "fonte",
      "memoria ram",
      "placa de video",
      "placa mae",
      "processador",
      "suporte articulado",
      "water cooler",
      "gabinete",
      " vram",
    )
  ) {
    return "hardware";
  }
  return "guias";
}
