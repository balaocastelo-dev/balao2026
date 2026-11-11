// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PAGINAS } from "@/lib/landing/paginas";
import { metadadosDaPagina } from "@/lib/landing/metadados";

/**
 * Régua do título das páginas de captação.
 *
 * Em 11/11/2026, quando o Search Console foi ligado, as 37 páginas de captação
 * estavam com o título entre 85 e 105 caracteres e com a marca escrita duas
 * vezes: uma dentro de `seo.titulo` e outra pelo template do layout
 * ("%s | Balão da Informática"). O Google corta por volta de 60, então o
 * resultado aparecia truncado no meio da frase — em páginas feitas justamente
 * para trazer cliente. O CTR médio do site era de 2,5%.
 *
 * O nome "Balão da Informática" já aparece sozinho acima do título no resultado
 * de busca, então repetir a marca dentro do título só gasta caracteres.
 */
const LIMITE = 60;

/** Sufixos de marca que o resultado do Google já mostra por conta própria. */
const SUFIXO_DE_MARCA = /[|–-]\s*(balão|balao)[^|–-]*$/i;

describe("título das páginas de captação", () => {
  it("cabe no que o Google mostra", () => {
    const grandes = Object.values(PAGINAS)
      .map((p) => ({ slug: p.slug, tamanho: p.seo.titulo.length, titulo: p.seo.titulo }))
      .filter((p) => p.tamanho > LIMITE);
    expect(grandes).toEqual([]);
  });

  it("não termina com a marca, que o Google já mostra acima do título", () => {
    const comMarca = Object.values(PAGINAS)
      .filter((p) => SUFIXO_DE_MARCA.test(p.seo.titulo))
      .map((p) => `${p.slug}: ${p.seo.titulo}`);
    expect(comMarca).toEqual([]);
  });

  it("vai inteiro para o Next, sem o sufixo do layout", () => {
    for (const pagina of Object.values(PAGINAS)) {
      const meta = metadadosDaPagina(pagina);
      expect(meta.title).toEqual({ absolute: pagina.seo.titulo });
    }
  });

  it("a descrição fica na faixa que o Google mostra", () => {
    const fora = Object.values(PAGINAS)
      .map((p) => ({ slug: p.slug, tamanho: p.seo.descricao.length }))
      .filter((p) => p.tamanho < 110 || p.tamanho > 170);
    expect(fora).toEqual([]);
  });
});
