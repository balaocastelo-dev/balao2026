import snapshot from "@/content/blog/soro/snapshot.json";
import { classificarPorTitulo } from "../categorias";
import { htmlParaBlocos } from "../html-para-blocos";
import { semAcento } from "../texto";
import type { Artigo, Bloco } from "../tipos";

/**
 * Os artigos que o Soro escreve para a loja.
 *
 * Até aqui eles entravam na página por um script: o texto só existia depois
 * que o navegador rodava o JavaScript, e todos respondiam no mesmo endereço
 * (`/blog?post=...`, com canônico apontando para `/blog`). Para o Google eram
 * uma página só. Agora cada um vira uma página de verdade em `/blog/<slug>`.
 *
 * Duas camadas, de propósito:
 *
 *  1. A cópia guardada no repositório (`content/blog/soro/snapshot.json` e as
 *     capas em `public/blog/capas`). É o chão: com ela o blog abre mesmo que o
 *     Soro esteja fora do ar.
 *  2. A consulta ao vivo, de hora em hora. É por ela que um artigo novo do
 *     Soro aparece aqui sozinho, sem ninguém publicar nada.
 *
 * Se a consulta falhar, vale a cópia. A página do blog já ficou em branco
 * duas vezes por depender de uma chamada externa; não depende mais.
 */

const BASE = "https://app.trysoro.com";
/** O mesmo identificador que já estava no script público da página. */
const TOKEN_PADRAO = "71c5ae65-e641-4dca-928b-d80ac924512b";

type EntradaGuardada = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  publicadoEm: string;
  capaRemota: string | null;
  capaLocal: string | null;
  html: string;
};

type ItemDaLista = {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  publicadoEm: string;
  capaRemota: string | null;
};

const GUARDADOS = (snapshot as { artigos: EntradaGuardada[] }).artigos;

function token(): string {
  return String(process.env.BLOG_SORO_TOKEN || TOKEN_PADRAO).trim();
}

function sincroniaLigada(): boolean {
  return String(process.env.BLOG_SORO_SYNC || "").trim().toLowerCase() !== "false";
}

/**
 * O script do Soro traz a lista dentro de `var SORO_ARTICLES = [...]`.
 * Lê só esse trecho, contando colchetes e respeitando o que está entre aspas.
 */
export function extrairListaDoScript(js: string): ItemDaLista[] {
  const marca = js.indexOf("SORO_ARTICLES");
  if (marca === -1) return [];
  const inicio = js.indexOf("[", marca);
  if (inicio === -1) return [];

  let nivel = 0;
  let emTexto = false;
  let escape = false;
  let fim = -1;
  for (let i = inicio; i < js.length; i += 1) {
    const c = js[i];
    if (emTexto) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') emTexto = false;
      continue;
    }
    if (c === '"') emTexto = true;
    else if (c === "[") nivel += 1;
    else if (c === "]") {
      nivel -= 1;
      if (nivel === 0) {
        fim = i;
        break;
      }
    }
  }
  if (fim === -1) return [];

  let bruto: unknown;
  try {
    bruto = JSON.parse(js.slice(inicio, fim + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(bruto)) return [];

  const lista: ItemDaLista[] = [];
  for (const item of bruto as Record<string, unknown>[]) {
    const id = typeof item?.id === "string" ? item.id : "";
    const slug = typeof item?.slug === "string" ? item.slug : "";
    const titulo = typeof item?.title === "string" ? item.title.trim() : "";
    if (!id || !titulo || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
    const data = typeof item.isoDate === "string" ? new Date(item.isoDate) : null;
    lista.push({
      id,
      slug,
      titulo,
      resumo: typeof item.excerpt === "string" ? item.excerpt.trim() : "",
      publicadoEm: data && Number.isFinite(data.getTime()) ? data.toISOString() : new Date().toISOString(),
      capaRemota: typeof item.image === "string" && /^https:\/\//.test(item.image) ? item.image : null,
    });
  }
  return lista;
}

async function buscarListaAoVivo(): Promise<ItemDaLista[] | null> {
  try {
    const resposta = await fetch(`${BASE}/api/embed/${token()}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 3600, tags: ["blog"] },
    });
    if (!resposta.ok) return null;
    const lista = extrairListaDoScript(await resposta.text());
    return lista.length > 0 ? lista : null;
  } catch (erro) {
    console.warn("[blog] Soro não respondeu a lista; usando a cópia guardada:", (erro as Error).message);
    return null;
  }
}

async function buscarTextoAoVivo(id: string): Promise<string | null> {
  try {
    const resposta = await fetch(`${BASE}/api/embed/${token()}/article/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400, tags: ["blog"] },
    });
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as { content?: unknown };
    return typeof dados.content === "string" && dados.content.trim().length > 200 ? dados.content : null;
  } catch {
    return null;
  }
}

const ETIQUETAS: [string, string][] = [
  ["notebook", "Notebook"],
  ["pc gamer", "PC gamer"],
  ["ssd", "SSD"],
  ["memoria ram", "Memória RAM"],
  ["fonte", "Fonte"],
  ["placa de video", "Placa de vídeo"],
  ["monitor", "Monitor"],
  ["seminovo", "Seminovos"],
  ["empresa", "Empresas"],
  ["escritorio", "Escritório"],
  ["edicao de video", "Edição de vídeo"],
  ["dados", "Recuperação de dados"],
  ["manutencao", "Manutenção"],
  ["assistencia", "Assistência técnica"],
  ["montagem", "Montagem de PC"],
  ["upgrade", "Upgrade"],
  ["campinas", "Campinas"],
];

function etiquetasDoTitulo(titulo: string, slug: string): string[] {
  const t = semAcento(`${titulo} ${slug.replace(/-/g, " ")}`);
  return ETIQUETAS.filter(([termo]) => t.includes(termo)).map(([, nome]) => nome);
}

/**
 * Coloca duas chamadas no texto importado: uma perto da metade, encostada no
 * início de uma seção (nunca cortando um raciocínio), e outra no fim.
 * Artigo curto fica só com a do fim.
 */
export function inserirChamadas(blocos: Bloco[]): Bloco[] {
  const saida = [...blocos];
  const secoes = saida
    .map((b, i) => (b.tipo === "titulo" && b.nivel === 2 ? i : -1))
    .filter((i) => i > 0);

  if (secoes.length >= 4) {
    const alvo = saida.length * 0.55;
    const escolhida = secoes
      .filter((i) => i > saida.length * 0.35 && i < saida.length * 0.8)
      .sort((a, b) => Math.abs(a - alvo) - Math.abs(b - alvo))[0];
    if (escolhida !== undefined) saida.splice(escolhida, 0, { tipo: "chamada" });
  }
  saida.push({ tipo: "chamada", tema: "geral" });
  return saida;
}

function montarArtigo(entrada: {
  slug: string;
  titulo: string;
  resumo: string;
  publicadoEm: string;
  capa: string | null;
  html: string;
}): Artigo | null {
  const blocos = htmlParaBlocos(entrada.html);
  // Sem texto não há artigo: melhor não publicar do que publicar uma casca.
  if (blocos.filter((b) => b.tipo === "paragrafo").length < 3) return null;

  return {
    slug: entrada.slug,
    titulo: entrada.titulo,
    resumo: entrada.resumo,
    categoria: classificarPorTitulo(entrada.titulo, entrada.slug),
    etiquetas: etiquetasDoTitulo(entrada.titulo, entrada.slug),
    capa: entrada.capa ? { src: entrada.capa, alt: entrada.titulo, largura: 1536, altura: 1024 } : null,
    publicadoEm: entrada.publicadoEm,
    autor: { nome: "Equipe Balão da Informática", url: "/sobre-nos" },
    origem: "soro",
    blocos: inserirChamadas(blocos),
  };
}

/** Só a cópia guardada — usada nos testes e quando a sincronia está desligada. */
export function artigosGuardadosDoSoro(): Artigo[] {
  return GUARDADOS.map((g) =>
    montarArtigo({
      slug: g.slug,
      titulo: g.titulo,
      resumo: g.resumo,
      publicadoEm: g.publicadoEm,
      capa: g.capaLocal ?? g.capaRemota,
      html: g.html,
    }),
  ).filter((a): a is Artigo => a !== null);
}

/** Quantos artigos novos buscamos por vez — um teto para a página nunca esperar demais. */
const NOVOS_POR_VEZ = 8;

export async function listarArtigosDoSoro(): Promise<Artigo[]> {
  const guardados = artigosGuardadosDoSoro();
  if (!sincroniaLigada()) return guardados;

  const lista = await buscarListaAoVivo();
  if (!lista) return guardados;

  const porSlug = new Map(guardados.map((a) => [a.slug, a]));
  const idsGuardados = new Set(GUARDADOS.map((g) => g.id));

  // O Soro pode ter corrigido título ou resumo depois da cópia.
  for (const item of lista) {
    const existente = porSlug.get(item.slug);
    if (existente && idsGuardados.has(item.id)) {
      porSlug.set(item.slug, {
        ...existente,
        titulo: item.titulo || existente.titulo,
        resumo: item.resumo || existente.resumo,
        capa: existente.capa ? { ...existente.capa, alt: item.titulo || existente.capa.alt } : existente.capa,
      });
    }
  }

  const novos = lista.filter((item) => !porSlug.has(item.slug)).slice(0, NOVOS_POR_VEZ);
  const textos = await Promise.all(novos.map((item) => buscarTextoAoVivo(item.id)));
  novos.forEach((item, i) => {
    const html = textos[i];
    if (!html) return;
    const artigo = montarArtigo({
      slug: item.slug,
      titulo: item.titulo,
      resumo: item.resumo,
      publicadoEm: item.publicadoEm,
      capa: item.capaRemota,
      html,
    });
    if (artigo) porSlug.set(artigo.slug, artigo);
  });

  return [...porSlug.values()];
}
