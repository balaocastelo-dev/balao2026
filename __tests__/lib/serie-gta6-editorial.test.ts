import { describe, expect, it } from "vitest";
import { ARTIGOS_AUTORAIS } from "@/content/blog/artigos";
import { jsonLdDoArtigo } from "@/lib/blog/seo";
import { avaliarArtigo } from "@/lib/blog/regua";
import { semAcento, textoPuro } from "@/lib/blog/texto";
import type { Artigo } from "@/lib/blog/tipos";

const SLUGS = [
  "gta-6-lancamento-19-novembro-2026",
  "gta-6-plataformas-ps5-xbox-e-pc",
  "gta-6-trailers-oficiais",
  "gta-6-mapa-leonida-e-vice-city",
  "gta-6-lucia-e-jason",
  "gta-6-preco-e-edicoes",
  "gta-6-perguntas-frequentes",
  "gta-6-pre-carga-e-tamanho",
  "pc-para-gta-6-sem-requisito-oficial",
  "placa-de-video-para-gta-6",
  "processador-para-gta-6",
  "memoria-ram-para-gta-6",
  "ssd-para-gta-6",
  "monitor-para-gta-6",
  "perifericos-para-gta-6",
  "pc-gamer-entrada-para-gta-6",
  "pc-gamer-intermediario-para-gta-6",
  "pc-gamer-alto-desempenho-gta-6",
  "upgrade-do-pc-antes-do-gta-6",
  "notebook-gamer-ou-desktop-gta-6",
  "pc-gamer-gta-6-campinas",
  "montagem-pc-gamer-campinas",
  "pc-para-live-de-gta-6",
  "obs-para-live-de-jogo",
  "setup-de-streamer-para-gta-6",
  "microfone-para-live-de-jogo",
  "webcam-para-stream",
  "internet-para-fazer-live",
  "gta-rp-e-o-que-o-gta-6-nao-e",
  "comecar-no-twitch-youtube-ou-kick",
] as const;

const PROIBIDO = [
  /esta frase/i,
  /esse texto/i,
  /este texto/i,
  /nesta mat[eé]ria/i,
  /neste artigo/i,
  /o centro dest[ea] (texto|mat[eé]ria|frase)/i,
  /\ba busca\b/i,
  /n[aã]o preenche/i,
  /carimbo/i,
  /ficha local/i,
  /est[aá] misturando/i,
  /vamos (ver|explorar|falar)/i,
  /[eé] importante (ressaltar|destacar)/i,
  /vale ressaltar/i,
  /\bem suma\b/i,
  /castelo/i,
];

function serie(): Artigo[] {
  return SLUGS.map((slug) => {
    const artigo = ARTIGOS_AUTORAIS.find((a) => a.slug === slug);
    if (!artigo) throw new Error(`sumiu: ${slug}`);
    return artigo;
  });
}

function textoTodo(artigo: Artigo): string {
  const partes = [
    artigo.titulo,
    artigo.resumo,
    artigo.seo?.titulo ?? "",
    artigo.seo?.descricao ?? "",
    ...artigo.blocos.flatMap((b) => {
      if (b.tipo === "paragrafo" || b.tipo === "destaque") return [b.texto];
      if (b.tipo === "titulo") return [b.texto];
      if (b.tipo === "lista" || b.tipo === "resumo") return b.itens;
      if (b.tipo === "tabela") return [b.titulo ?? "", ...b.linhas.flat(), b.nota ?? ""];
      if (b.tipo === "pros-contras") return [b.titulo ?? "", ...b.pros, ...b.contras];
      if (b.tipo === "citacao") return [b.texto];
      if (b.tipo === "chamada") return [b.titulo ?? "", b.texto ?? ""];
      if (b.tipo === "imagem") return [b.legenda ?? "", b.imagem.alt];
      return [];
    }),
    ...(artigo.perguntas ?? []).flatMap((p) => [p.pergunta, p.resposta]),
  ];
  return partes.join("\n");
}

describe("série GTA 6 reescrita", () => {
  const artigos = serie();

  it("são as 30 matérias, com foto de capa e três no corpo", () => {
    expect(artigos).toHaveLength(30);
    for (const artigo of artigos) {
      expect(artigo.capa?.src, artigo.slug).toMatch(/\.webp$/);
      expect(artigo.blocos.filter((b) => b.tipo === "imagem")).toHaveLength(3);
      expect(artigo.autor.nome).toContain("Anchieta");
      expect(artigo.atualizadoEm?.startsWith("2026-11-19")).toBe(true);
    }
  });

  it.each(artigos.map((a) => [a.slug, a] as const))("%s cumpre SEO e GEO", (_slug, artigo) => {
    const chave = artigo.seo?.palavrasChave?.[0] ?? "";
    expect(chave.length).toBeGreaterThan(3);
    const chaveNorma = semAcento(chave);
    const tituloGoogle = artigo.seo?.titulo ?? artigo.titulo;
    const descricao = artigo.seo?.descricao ?? artigo.resumo;
    const primeiro = artigo.blocos.find((b) => b.tipo === "paragrafo");
    const h2 = artigo.blocos.filter((b) => b.tipo === "titulo" && b.nivel === 2).map((b) => (b.tipo === "titulo" ? b.texto : ""));

    expect(tituloGoogle.length, "title").toBeLessThanOrEqual(60);
    expect(artigo.titulo.length).toBeGreaterThanOrEqual(30);
    expect(artigo.titulo.length).toBeLessThanOrEqual(80);
    expect(descricao.length, `meta ${descricao.length}`).toBeGreaterThanOrEqual(110);
    expect(descricao.length).toBeLessThanOrEqual(155);
    expect(semAcento(tituloGoogle)).toContain(chaveNorma);
    expect(semAcento(artigo.titulo)).toContain(chaveNorma);
    expect(semAcento(descricao)).toContain(chaveNorma);
    expect(primeiro?.tipo).toBe("paragrafo");
    if (primeiro?.tipo === "paragrafo") expect(semAcento(textoPuro(primeiro.texto))).toContain(chaveNorma);
    expect(h2.some((t) => semAcento(t).includes(chaveNorma))).toBe(true);

    const resumo = artigo.blocos.find((b) => b.tipo === "resumo");
    expect(resumo?.tipo === "resumo" && resumo.titulo).toBe("Resposta rápida");
    expect(artigo.perguntas?.length).toBeGreaterThanOrEqual(4);
    expect(artigo.perguntas?.length).toBeLessThanOrEqual(6);

    const palavras = avaliarArtigo(artigo).medidas.palavras;
    expect(palavras, `${palavras} palavras`).toBeGreaterThanOrEqual(900);
    expect(palavras).toBeLessThanOrEqual(1500);

    const nos = jsonLdDoArtigo(artigo);
    const tipos = nos.map((n) => n["@type"]);
    expect(tipos[0]).toBe(artigo.categoria === "noticias" ? "NewsArticle" : "BlogPosting");
    expect(tipos).toContain("BreadcrumbList");
    expect(tipos).toContain("FAQPage");
    if (artigo.slug.includes("campinas") || artigo.etiquetas.some((e) => e.toLowerCase() === "campinas")) {
      const loja = nos.find((n) => Array.isArray(n["@type"]) && (n["@type"] as string[]).includes("LocalBusiness"));
      expect(loja).toBeTruthy();
      expect(JSON.stringify(loja)).toContain("Av. Anchieta, 789");
      expect(JSON.stringify(loja)).toContain("(19) 3255-1661");
      expect(JSON.stringify(loja)).toContain("(19) 98751-0267");
    }
  });

  it("não repete frase robótica nem o mesmo parágrafo entre matérias", () => {
    const vistos = new Map<string, string>();
    for (const artigo of artigos) {
      const tudo = textoTodo(artigo);
      for (const regra of PROIBIDO) {
        expect(tudo, `${artigo.slug} ${regra}`).not.toMatch(regra);
      }
      const semLink = tudo.replace(/\([^)\s]+\)/g, "");
      const requisitos = semLink.match(/\brequisitos?\b/gi) ?? [];
      expect(requisitos.length, artigo.slug).toBeLessThanOrEqual(2);
      for (const bloco of artigo.blocos) {
        if (bloco.tipo !== "paragrafo") continue;
        const chave = textoPuro(bloco.texto).slice(0, 80);
        const outro = vistos.get(chave);
        expect(outro, `parágrafo repetido em ${artigo.slug} e ${outro}`).toBeUndefined();
        vistos.set(chave, artigo.slug);
      }
    }
  });
});
