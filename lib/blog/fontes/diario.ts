import { ENDERECO_DO_RAMO } from "../capas";
import { avaliarArtigo } from "../regua";
import type { Artigo, ArtigoResumido } from "../tipos";
import { lerArtigo, lerResumo } from "../validar";

/**
 * A terceira fonte de artigos: o ramo de conteúdo, onde a rotina diária
 * publica.
 *
 * O artigo do dia não entra no código do site. Ele é um arquivo JSON no ramo
 * `claude/blog-conteudo` deste mesmo repositório, e o site lê esse ramo de
 * tempos em tempos. Publicar um artigo, portanto, não refaz o site, não mexe
 * no ramo principal e não gasta conexão do banco: é só um arquivo novo.
 *
 *   indice.json            a lista, com o que os cartões precisam
 *   artigos/<endereço>.json  o artigo inteiro
 *   capas/<endereço>-<marca>.jpg  a foto de capa (veja `../capas`)
 *
 * Nada do que chega daqui é aceito de olhos fechados: o formato passa por
 * `lerArtigo` e o conteúdo passa pela régua editorial, as mesmas conferências
 * que o artigo sofreu antes de ser publicado. Arquivo que não passa fica fora
 * do site.
 */

const ENDERECO_PADRAO = ENDERECO_DO_RAMO;

/** De quanto em quanto tempo o site olha o ramo de novo, em segundos. */
const INTERVALO = 900;

export function diarioLigado(): boolean {
  return process.env.BLOG_DIARIO !== "false";
}

function endereco(caminho: string): string {
  const base = (process.env.BLOG_DIARIO_URL || ENDERECO_PADRAO).replace(/\/+$/, "");
  return `${base}/${caminho}`;
}

/**
 * Devolve o arquivo lido, ou `null` quando ele não existe (404). Qualquer
 * outra falha — rede, tempo esgotado, erro do GitHub — vira exceção, para
 * quem chama poder distinguir "não existe" de "não deu para saber".
 */
async function buscar(caminho: string): Promise<unknown | null> {
  const resposta = await fetch(endereco(caminho), {
    signal: AbortSignal.timeout(5000),
    next: { revalidate: INTERVALO, tags: ["blog"] },
  });
  if (resposta.status === 404) return null;
  if (!resposta.ok) throw new Error(`O ramo de conteúdo respondeu ${resposta.status} para ${caminho}.`);
  return resposta.json();
}

/** A lista do que a rotina já publicou, do mais novo para o mais antigo. */
export async function listarResumosDoDiario(): Promise<ArtigoResumido[]> {
  if (!diarioLigado()) return [];
  const indice = await buscar("indice.json");
  if (indice === null || typeof indice !== "object") return [];

  const linhas = (indice as { artigos?: unknown }).artigos;
  if (!Array.isArray(linhas)) return [];

  const vistos = new Set<string>();
  const resumos: ArtigoResumido[] = [];
  for (const linha of linhas) {
    const resumo = lerResumo(linha);
    if (!resumo || vistos.has(resumo.slug)) continue;
    vistos.add(resumo.slug);
    resumos.push(resumo);
  }
  return resumos;
}

/** O artigo inteiro. `null` se não existe, veio malformado ou não passa na régua. */
export async function obterArtigoDoDiario(slug: string): Promise<Artigo | null> {
  if (!diarioLigado() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const bruto = await buscar(`artigos/${slug}.json`);
  if (bruto === null) return null;

  const lido = lerArtigo(bruto);
  if (!lido.ok) {
    console.error(`[blog] "${slug}" do ramo de conteúdo ficou fora do site — arquivo malformado:\n- ${lido.erros.join("\n- ")}`);
    return null;
  }
  // O nome do arquivo é o endereço; um arquivo que diz ser outro artigo não entra.
  if (lido.valor.slug !== slug) return null;

  const avaliacao = avaliarArtigo(lido.valor);
  if (!avaliacao.aprovado) {
    console.error(`[blog] "${slug}" do ramo de conteúdo ficou fora do site — reprovado na régua:\n- ${avaliacao.erros.join("\n- ")}`);
    return null;
  }
  return lido.valor;
}
