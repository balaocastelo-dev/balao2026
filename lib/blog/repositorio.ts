import { cache } from "react";
import { ARTIGOS_AUTORAIS } from "@/content/blog/artigos";
import { artigosGuardadosDoSoro, listarArtigosDoSoro } from "./fontes/soro";
import { nomeDaCategoria } from "./categorias";
import { avaliarArtigo } from "./regua";
import { minutosDeLeitura } from "./texto";
import type { Artigo, ArtigoResumido, CategoriaSlug } from "./tipos";

/**
 * A única porta de entrada dos artigos.
 *
 * Páginas, sitemap, RSS e a home da loja pedem os artigos aqui — nunca direto
 * a uma fonte. Hoje são duas (os artigos escritos neste repositório e os do
 * Soro); se um dia houver uma terceira, ela entra neste arquivo e o resto do
 * site não percebe.
 */

/**
 * A régua vale também aqui, e não só nos testes: artigo escrito no
 * repositório que está em rascunho ou foi reprovado simplesmente não aparece
 * no site. Assim, publicar por engano um texto pela metade deixa de ser
 * possível — o pior que acontece é ele não entrar.
 */
const jaAvaliados = new WeakMap<Artigo, boolean>();

export function prontoParaPublicar(artigo: Artigo): boolean {
  if (artigo.rascunho) return false;
  const anterior = jaAvaliados.get(artigo);
  if (anterior !== undefined) return anterior;

  const avaliacao = avaliarArtigo(artigo);
  if (!avaliacao.aprovado) {
    console.error(`[blog] "${artigo.slug}" ficou fora do site — reprovado na régua:\n- ${avaliacao.erros.join("\n- ")}`);
  }
  jaAvaliados.set(artigo, avaliacao.aprovado);
  return avaliacao.aprovado;
}

function porDataDecrescente(a: Artigo, b: Artigo): number {
  return (Date.parse(b.publicadoEm) || 0) - (Date.parse(a.publicadoEm) || 0);
}

function juntar(autorais: Artigo[], importados: Artigo[]): Artigo[] {
  const porSlug = new Map<string, Artigo>();
  for (const artigo of importados) porSlug.set(artigo.slug, artigo);
  // Mesmo endereço nas duas fontes: vale o que foi escrito aqui.
  for (const artigo of autorais) porSlug.set(artigo.slug, artigo);

  const agora = Date.now();
  return [...porSlug.values()]
    // Data no futuro é artigo agendado: ainda não aparece.
    .filter((a) => (Date.parse(a.publicadoEm) || 0) <= agora)
    .sort(porDataDecrescente);
}

export const listarArtigos = cache(async (): Promise<Artigo[]> => {
  const importados = await listarArtigosDoSoro().catch((erro) => {
    console.error("[blog] Falha ao ler o Soro; seguindo com a cópia guardada:", erro?.message || erro);
    return artigosGuardadosDoSoro();
  });
  return juntar(ARTIGOS_AUTORAIS.filter(prontoParaPublicar), importados);
});

export async function obterArtigo(slug: string): Promise<Artigo | null> {
  const artigos = await listarArtigos();
  return artigos.find((a) => a.slug === slug) ?? null;
}

export function resumir(artigo: Artigo): ArtigoResumido {
  return {
    slug: artigo.slug,
    titulo: artigo.titulo,
    resumo: artigo.resumo,
    categoria: artigo.categoria,
    etiquetas: artigo.etiquetas,
    capa: artigo.capa,
    publicadoEm: artigo.publicadoEm,
    minutos: minutosDeLeitura(artigo),
    temAnalise: Boolean(artigo.analise),
    nota: artigo.analise?.nota,
  };
}

export async function listarResumos(): Promise<ArtigoResumido[]> {
  return (await listarArtigos()).map(resumir);
}

/**
 * A vitrine do topo: primeiro o que foi marcado como destaque (peso maior na
 * frente), depois os mais recentes até completar.
 */
export function escolherDestaques(artigos: Artigo[], quantos = 4): Artigo[] {
  const marcados = artigos
    .filter((a) => (a.destaque ?? 0) > 0)
    .sort((a, b) => (b.destaque ?? 0) - (a.destaque ?? 0) || porDataDecrescente(a, b));
  const escolhidos = marcados.slice(0, quantos);
  for (const artigo of artigos) {
    if (escolhidos.length >= quantos) break;
    if (!escolhidos.includes(artigo)) escolhidos.push(artigo);
  }
  return escolhidos;
}

/** "Leia também": mesma categoria e etiquetas em comum pesam; empate vai para o mais novo. */
export function escolherRelacionados(artigo: Artigo, todos: Artigo[], quantos = 3): Artigo[] {
  const etiquetas = new Set(artigo.etiquetas);
  return todos
    .filter((a) => a.slug !== artigo.slug)
    .map((a) => ({
      artigo: a,
      pontos: (a.categoria === artigo.categoria ? 2 : 0) + a.etiquetas.filter((e) => etiquetas.has(e)).length * 3,
    }))
    .sort((a, b) => b.pontos - a.pontos || porDataDecrescente(a.artigo, b.artigo))
    .slice(0, quantos)
    .map((r) => r.artigo);
}

export function contarPorCategoria(artigos: { categoria: CategoriaSlug }[]): Record<CategoriaSlug, number> {
  const contagem: Record<CategoriaSlug, number> = { guias: 0, hardware: 0, analises: 0, noticias: 0, assistencia: 0 };
  for (const a of artigos) contagem[a.categoria] += 1;
  return contagem;
}

/**
 * Formato que a home da loja e a cópia enviada à VPS já esperavam do blog
 * antigo. Mantido para nenhuma das duas precisar mudar junto.
 */
export async function listarNoFormatoAntigo(quantos = 6) {
  const resumos = await listarResumos();
  return resumos.slice(0, quantos).map((r) => ({
    id: r.slug,
    slug: r.slug,
    title: r.titulo,
    excerpt: r.resumo,
    category: nomeDaCategoria(r.categoria),
    cover_image: r.capa?.src ?? null,
    published_at: r.publicadoEm,
    created_at: r.publicadoEm,
    reading_time_minutes: r.minutos,
  }));
}
