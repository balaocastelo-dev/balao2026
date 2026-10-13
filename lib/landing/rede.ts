// ============================================================
// A rede de links entre as páginas de captação e o blog.
//
// Mesma ideia do "Leia também" do blog (padrão Soro, lib/blog/repositorio.ts):
// cada página diz de que temas trata; a página vizinha que divide mais temas
// aparece primeiro. As que a página pediu por nome vêm antes de todas.
// Do lado do blog vale o mesmo: o artigo que fala do assunto da página
// (no título, no endereço ou nas etiquetas) entra em "Antes de decidir".
//
// Funções puras: recebem as listas, devolvem a escolha.
// ============================================================

import type { ArtigoResumido } from "@/lib/blog/tipos";
import type { PaginaDeCaptacao } from "./tipos";
import { normalizar } from "./vitrine";

type PaginaNaRede = Pick<PaginaDeCaptacao, "slug" | "temas" | "relacionadas">;

/** "Também resolvemos": primeiro as pedidas, depois as que dividem mais temas. */
export function escolherPaginasVizinhas<T extends PaginaNaRede>(pagina: PaginaNaRede, todas: T[], quantas = 4): T[] {
  const porSlug = new Map(todas.map((p) => [p.slug, p]));
  const escolhidas: T[] = [];
  const ja = new Set<string>([pagina.slug]);

  for (const slug of pagina.relacionadas ?? []) {
    const p = porSlug.get(slug);
    if (p && !ja.has(slug)) {
      escolhidas.push(p);
      ja.add(slug);
    }
    if (escolhidas.length >= quantas) return escolhidas;
  }

  const temas = new Set(pagina.temas.map(normalizar));
  const pontuadas = todas
    .filter((p) => !ja.has(p.slug))
    .map((p, ordem) => ({ p, ordem, pontos: p.temas.map(normalizar).filter((t) => temas.has(t)).length }))
    .filter((x) => x.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem);

  for (const { p } of pontuadas) {
    if (escolhidas.length >= quantas) break;
    escolhidas.push(p);
  }
  return escolhidas;
}

/**
 * "Antes de decidir": artigos do blog sobre o assunto da página.
 * Etiqueta igual a um termo vale 3; termo no título vale 2; no endereço, 1.
 * Empate vai para o mais novo. Artigo sem nenhum ponto não entra.
 */
export function escolherArtigosDaPagina(
  pagina: Pick<PaginaDeCaptacao, "termosDoBlog">,
  artigos: ArtigoResumido[],
  quantos = 3
): ArtigoResumido[] {
  const termos = pagina.termosDoBlog.map(normalizar).filter(Boolean);
  if (termos.length === 0) return [];

  const contem = (texto: string, termo: string) => ` ${texto} `.includes(` ${termo} `) || texto.includes(termo);

  return artigos
    .map((a) => {
      const titulo = normalizar(a.titulo);
      const endereco = normalizar(a.slug.replace(/-/g, " "));
      const etiquetas = a.etiquetas.map(normalizar);
      let pontos = 0;
      for (const t of termos) {
        if (etiquetas.includes(t)) pontos += 3;
        if (contem(titulo, t)) pontos += 2;
        else if (contem(endereco, t)) pontos += 1;
      }
      return { a, pontos };
    })
    .filter((x) => x.pontos > 0)
    .sort((x, y) => y.pontos - x.pontos || y.a.publicadoEm.localeCompare(x.a.publicadoEm))
    .slice(0, quantos)
    .map((x) => x.a);
}

/** Mensagem do assistente: abertura, uma linha por resposta e o fecho. */
export function montarMensagem(
  abertura: string,
  respostas: { rotulo: string; valor: string | string[] }[],
  fecho?: string
): string {
  const linhas = respostas
    .map(({ rotulo, valor }) => {
      const texto = Array.isArray(valor) ? valor.filter(Boolean).join(", ") : String(valor || "").trim();
      return texto ? `• ${rotulo}: ${texto}` : "";
    })
    .filter(Boolean);
  return [abertura.trim(), ...linhas, fecho?.trim()].filter(Boolean).join("\n");
}
