/**
 * Onde moram as fotos de capa dos artigos da rotina diária.
 *
 * A foto vai junto com o artigo, no ramo de conteúdo: quem a grava é o comando
 * `scripts/blog-publicar.mjs publicar --capa foto.jpg`. O nome do arquivo leva
 * um pedaço do conteúdo (a "marca"), então trocar a foto troca o endereço — e
 * nenhuma cópia guardada da imagem antiga fica no caminho.
 *
 *   capas/<endereço-do-artigo>-<marca>.jpg
 */

export const RAMO_DE_CONTEUDO = "claude/blog-conteudo";
export const ENDERECO_DO_RAMO = `https://raw.githubusercontent.com/balaocastelo-dev/balao2026/refs/heads/${RAMO_DE_CONTEUDO}`;

/** O caminho da capa dentro do ramo de conteúdo. */
export function arquivoDaCapa(slug: string, marca: string, extensao: "jpg" | "png"): string {
  return `capas/${slug}-${marca}.${extensao}`;
}

/** O endereço público da capa: é o que vai no campo `capa.src` do artigo. */
export function enderecoDaCapa(slug: string, marca: string, extensao: "jpg" | "png"): string {
  return `${ENDERECO_DO_RAMO}/${arquivoDaCapa(slug, marca, extensao)}`;
}

/**
 * A capa de um artigo da rotina só pode ser o arquivo que o comando gravou
 * para aquele artigo. Imagem hospedada em outro lugar tem dono e pode mudar
 * ou sumir sem aviso; essa não entra.
 */
export function capaDaRotina(src: string, slug: string): boolean {
  const prefixo = `${ENDERECO_DO_RAMO}/capas/${slug}-`;
  return src.startsWith(prefixo) && /^[0-9a-f]{8}\.(?:jpg|png)$/.test(src.slice(prefixo.length));
}
