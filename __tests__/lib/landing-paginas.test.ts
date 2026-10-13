import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PAGINAS } from "@/lib/landing/paginas";
import { montarFileiras } from "@/lib/landing/vitrine";
import type { PaginaDeCaptacao, RegraDeVitrine } from "@/lib/landing/tipos";
import type { Product } from "@/lib/utils";

// A régua das páginas de captação. Roda com o resto dos testes.
//
// Para ver o que cada vitrine mostra com o catálogo de hoje, aponte para uma
// cópia do espelho da VPS (/api/crm/catalogo):
//   ESPELHO=/caminho/espelho.json npx vitest run __tests__/lib/landing-paginas.test.ts

const RAIZ = path.resolve(__dirname, "../..");
const paginas = Object.values(PAGINAS);

/** Frases que já apareceram nas páginas antigas e não se sustentam. */
const PROIBIDAS: [RegExp, string][] = [
  [/sem rob[oô]/i, "o WhatsApp tem a JUL.IA respondendo quando não há vendedor"],
  [/certificad/i, "nenhuma certificação confirmada"],
  [/(uma das )?maiores? (rede|loja)s? do brasil|l[ií]der/i, "não é verdade"],
  [/garantia de (até )?1 ano|12 meses de garantia/i, "garantia de serviço é a legal: 90 dias"],
  [/em at[eé] \d+ ?(h|horas|minutos)\b/i, "prazo não confirmado pelo Thiago"],
  [/100% (seguro|garantid)/i, "promessa vazia"],
  [/\bR\$ ?\d/i, "texto não fala preço; preço só na vitrine"],
];

function textosDaPagina(p: PaginaDeCaptacao): string[] {
  const textos: string[] = [p.chamada, p.seo.titulo, p.seo.descricao, p.hero.titulo, p.hero.texto, p.hero.contexto, p.final.titulo, p.final.texto];
  for (const f of p.hero.fatos ?? []) textos.push(f.valor, f.rotulo);
  for (const q of p.perguntas) textos.push(q.pergunta, q.resposta);
  for (const s of p.secoes) textos.push(JSON.stringify(s));
  return textos;
}

describe("páginas de captação", () => {
  it("são 21 e cada uma tem a rota em app/", () => {
    expect(paginas.length).toBe(21);
    for (const p of paginas) {
      expect(fs.existsSync(path.join(RAIZ, "app", p.slug, "page.tsx")), p.slug).toBe(true);
    }
  });

  it.each(paginas.map((p) => [p.slug, p] as const))("%s: SEO, assistente e perguntas completos", (_slug, p) => {
    expect(p.seo.titulo.length, "título").toBeLessThanOrEqual(90);
    expect(p.seo.descricao.length, "descrição curta demais").toBeGreaterThanOrEqual(110);
    expect(p.seo.descricao.length, "descrição longa demais").toBeLessThanOrEqual(175);
    expect(p.seo.palavras.length).toBeGreaterThanOrEqual(6);
    expect(p.perguntas.length).toBeGreaterThanOrEqual(4);
    expect(p.temas.length).toBeGreaterThan(0);
    expect(p.termosDoBlog.length).toBeGreaterThan(0);
    expect(p.secoes.length).toBeGreaterThanOrEqual(3);
    if (p.assistente) {
      expect(p.assistente.perguntas.length).toBeGreaterThanOrEqual(2);
      expect(p.assistente.perguntas.length).toBeLessThanOrEqual(4);
      for (const q of p.assistente.perguntas) expect(q.opcoes.length).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(paginas.map((p) => [p.slug, p] as const))("%s: imagens existem em public/", (_slug, p) => {
    const imagens = [p.hero.imagem.src];
    for (const s of p.secoes) {
      if ((s.tipo === "texto" || s.tipo === "beneficios") && s.imagem) imagens.push(s.imagem.src);
      if (s.tipo === "atalhos") for (const i of s.itens) if (i.imagem) imagens.push(i.imagem);
    }
    for (const src of imagens) {
      if (/^https?:/.test(src)) continue;
      expect(fs.existsSync(path.join(RAIZ, "public", src)), src).toBe(true);
    }
  });

  it.each(paginas.map((p) => [p.slug, p] as const))("%s: sem promessa que a loja não confirmou", (_slug, p) => {
    const texto = textosDaPagina(p).join("\n");
    for (const [padrao, motivo] of PROIBIDAS) {
      const achado = texto.match(padrao);
      expect(achado ? `${achado[0]} (${motivo})` : null).toBeNull();
    }
  });

  it("as páginas relacionadas existem e os slugs não se repetem", () => {
    const slugs = new Set(paginas.map((p) => p.slug));
    expect(slugs.size).toBe(paginas.length);
    for (const p of paginas) {
      for (const r of p.relacionadas ?? []) expect(slugs.has(r), `${p.slug} → ${r}`).toBe(true);
      expect(p.relacionadas ?? []).not.toContain(p.slug);
    }
  });

  it("toda vitrine monta alguma fileira com o catálogo de reserva (ou com o espelho apontado)", () => {
    const arquivo = process.env.ESPELHO || path.join(RAIZ, "data", "catalogo-backup.json");
    const catalogo = JSON.parse(fs.readFileSync(arquivo, "utf-8")) as { produtos: Product[] };
    const relatorio: string[] = [];
    for (const p of paginas) {
      const vitrines = p.secoes.filter((s): s is { tipo: "vitrine"; regras: RegraDeVitrine[] } => s.tipo === "vitrine");
      for (const v of vitrines) {
        const fileiras = montarFileiras(catalogo.produtos, v.regras);
        for (const r of v.regras) {
          const f = fileiras.find((x) => x.id === r.id);
          relatorio.push(`${p.slug} / ${r.id}: ${f?.produtos.length ?? 0}${f ? ` — ${f.produtos.slice(0, 3).map((x) => x.name.slice(0, 48)).join(" | ")}` : ""}`);
        }
      }
    }
    if (process.env.ESPELHO) console.log(relatorio.join("\n"));
    expect(relatorio.length).toBeGreaterThan(0);
  });
});
