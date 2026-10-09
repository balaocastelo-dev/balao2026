import { cache } from "react";
import { ARTIGOS_AUTORAIS } from "@/content/blog/artigos";
import { listarResumosDoDiario, obterArtigoDoDiario } from "./fontes/diario";
import { artigosGuardadosDoSoro, listarArtigosDoSoro } from "./fontes/soro";
import { nomeDaCategoria } from "./categorias";
import { avaliarArtigo } from "./regua";
import { fundoGerado } from "./seo";
import { minutosDeLeitura } from "./texto";
import type { Artigo, ArtigoResumido, CategoriaSlug } from "./tipos";

/**
 * A única porta de entrada dos artigos.
 *
 * Páginas, sitemap, RSS e a home da loja pedem os artigos aqui — nunca direto
 * a uma fonte. São três:
 *
 *   - os artigos escritos neste repositório (`content/blog/artigos`);
 *   - os do Soro, lidos ao vivo, com uma cópia guardada de reserva;
 *   - os da rotina diária, lidos do ramo de conteúdo.
 *
 * As duas primeiras cabem inteiras na memória: são poucas dezenas de artigos.
 * A terceira cresce um artigo por dia, então dela o site lê só a lista (o que
 * os cartões precisam) e busca o texto de um artigo quando alguém o abre. Por
 * isso tudo que monta lista trabalha com `ArtigoResumido`, e só a página do
 * artigo pede o `Artigo` completo.
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

type ComData = { publicadoEm: string };

function porDataDecrescente(a: ComData, b: ComData): number {
  return (Date.parse(b.publicadoEm) || 0) - (Date.parse(a.publicadoEm) || 0);
}

/** Data no futuro é artigo agendado: ainda não aparece. */
function jaPublicado(a: ComData): boolean {
  return (Date.parse(a.publicadoEm) || 0) <= Date.now();
}

/**
 * Os artigos que vivem inteiros na memória: os escritos aqui e os do Soro.
 * Mesmo endereço nas duas fontes: vale o que foi escrito aqui.
 */
export const listarArtigosDaCasa = cache(async (): Promise<Artigo[]> => {
  const importados = await listarArtigosDoSoro().catch((erro) => {
    console.error("[blog] Falha ao ler o Soro; seguindo com a cópia guardada:", erro?.message || erro);
    return artigosGuardadosDoSoro();
  });

  const porSlug = new Map<string, Artigo>();
  for (const artigo of importados) porSlug.set(artigo.slug, artigo);
  for (const artigo of ARTIGOS_AUTORAIS.filter(prontoParaPublicar)) porSlug.set(artigo.slug, artigo);

  return [...porSlug.values()].filter(jaPublicado).sort(porDataDecrescente);
});

/** O site está sendo montado (`next build`), e não respondendo a uma visita. */
function montandoOSite(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * A lista da rotina diária.
 *
 * Se o ramo de conteúdo não responder, há duas saídas, e a certa depende de
 * quem pergunta:
 *
 *   - Uma página do blog sendo refeita deve FALHAR. O Next guarda a versão
 *     anterior e tenta de novo na próxima visita; ninguém vê artigo sumir, e
 *     nenhum artigo vira "não encontrado" por causa de uma falha de rede.
 *   - A home da loja, o sitemap, o RSS e a montagem do site devem SEGUIR sem
 *     esses artigos (`tolerante`): nenhum deles pode parar por causa do blog.
 */
const resumosDoDiario = cache(async (tolerante: boolean): Promise<ArtigoResumido[]> => {
  try {
    return (await listarResumosDoDiario()).filter(jaPublicado);
  } catch (erro) {
    if (!tolerante && !montandoOSite()) throw erro;
    console.error("[blog] Falha ao ler o ramo de conteúdo; seguindo sem os artigos da rotina:", (erro as Error)?.message || erro);
    return [];
  }
});

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
    ...(artigo.destaque ? { destaque: artigo.destaque } : {}),
  };
}

type Opcoes = {
  /** Segue sem os artigos da rotina se o ramo de conteúdo não responder. */
  tolerante?: boolean;
};

/** Todos os artigos publicados, das três fontes, do mais novo para o mais antigo. */
export async function listarResumos({ tolerante = false }: Opcoes = {}): Promise<ArtigoResumido[]> {
  const [daCasa, doDiario] = await Promise.all([listarArtigosDaCasa(), resumosDoDiario(tolerante)]);

  const porSlug = new Map<string, ArtigoResumido>();
  for (const resumo of doDiario) porSlug.set(resumo.slug, resumo);
  // Mesmo endereço aqui e no ramo de conteúdo: vale o artigo da casa.
  for (const artigo of daCasa) porSlug.set(artigo.slug, resumir(artigo));

  return [...porSlug.values()].sort(porDataDecrescente);
}

export async function obterArtigo(slug: string): Promise<Artigo | null> {
  const daCasa = (await listarArtigosDaCasa()).find((a) => a.slug === slug);
  if (daCasa) return daCasa;

  // Só busca o arquivo de um artigo que está na lista: endereço inventado não
  // gera pedido ao GitHub, e artigo retirado da lista sai do ar na hora.
  const naLista = (await resumosDoDiario(false)).some((r) => r.slug === slug);
  return naLista ? obterArtigoDoDiario(slug) : null;
}

/**
 * A vitrine do topo: primeiro o que foi marcado como destaque (peso maior na
 * frente), depois os mais recentes até completar.
 */
export function escolherDestaques(resumos: ArtigoResumido[], quantos = 4): ArtigoResumido[] {
  const marcados = resumos
    .filter((r) => (r.destaque ?? 0) > 0)
    .sort((a, b) => (b.destaque ?? 0) - (a.destaque ?? 0) || porDataDecrescente(a, b));
  const escolhidos = marcados.slice(0, quantos);
  for (const resumo of resumos) {
    if (escolhidos.length >= quantos) break;
    if (!escolhidos.includes(resumo)) escolhidos.push(resumo);
  }
  return escolhidos;
}

/** "Leia também": mesma categoria e etiquetas em comum pesam; empate vai para o mais novo. */
export function escolherRelacionados(
  artigo: Pick<Artigo, "slug" | "categoria" | "etiquetas">,
  todos: ArtigoResumido[],
  quantos = 3,
): ArtigoResumido[] {
  const etiquetas = new Set(artigo.etiquetas);
  return todos
    .filter((r) => r.slug !== artigo.slug)
    .map((r) => ({
      resumo: r,
      pontos: (r.categoria === artigo.categoria ? 2 : 0) + r.etiquetas.filter((e) => etiquetas.has(e)).length * 3,
    }))
    .sort((a, b) => b.pontos - a.pontos || porDataDecrescente(a.resumo, b.resumo))
    .slice(0, quantos)
    .map((r) => r.resumo);
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
  const resumos = await listarResumos({ tolerante: true });
  return resumos.slice(0, quantos).map((r) => ({
    id: r.slug,
    slug: r.slug,
    title: r.titulo,
    excerpt: r.resumo,
    category: nomeDaCategoria(r.categoria),
    // Artigo sem foto leva a capa desenhada, e não o logotipo da loja.
    cover_image: r.capa?.src ?? fundoGerado(r),
    published_at: r.publicadoEm,
    created_at: r.publicadoEm,
    reading_time_minutes: r.minutos,
  }));
}
