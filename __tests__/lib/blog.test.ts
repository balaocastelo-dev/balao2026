import { describe, expect, it } from "vitest";
import { ARTIGOS_AUTORAIS } from "@/content/blog/artigos";
import { CATEGORIAS, classificarPorTitulo } from "@/lib/blog/categorias";
import { escolherTema, resolverChamada } from "@/lib/blog/chamadas";
import { artigosGuardadosDoSoro, extrairListaDoScript, inserirChamadas } from "@/lib/blog/fontes/soro";
import { ajustarLink, htmlParaBlocos } from "@/lib/blog/html-para-blocos";
import { avaliarArtigo } from "@/lib/blog/regua";
import { contarPorCategoria, escolherDestaques, escolherRelacionados, prontoParaPublicar, resumir } from "@/lib/blog/repositorio";
import { desenharFundo } from "@/lib/blog/fundo";
import { fundoGerado, jsonLdDoArtigo, metadataDoArtigo } from "@/lib/blog/seo";
import { hrefSeguro, lerTextoRico, linksDoTexto, minutosDeLeitura, montarSumario, textoPuro } from "@/lib/blog/texto";
import type { Artigo, Bloco } from "@/lib/blog/tipos";
import { lerArtigo, lerResumo } from "@/lib/blog/validar";

const importados = artigosGuardadosDoSoro();

describe("texto dos artigos", () => {
  it("lê negrito, itálico e link sem deixar marcação escapar", () => {
    const trechos = lerTextoRico("Veja **a fonte** e o [guia](/blog/fonte-ideal-para-pc-gamer) *completo*.");
    expect(trechos.map((t) => t.tipo)).toEqual(["texto", "negrito", "texto", "link", "texto", "italico", "texto"]);
    expect(textoPuro("Veja **a fonte** e o [guia](/x) *completo*.")).toBe("Veja a fonte e o guia completo.");
    expect(linksDoTexto("a [b](/c) d [e](https://f.com)")).toEqual(["/c", "https://f.com"]);
  });

  it("recusa endereço perigoso em link", () => {
    expect(hrefSeguro("javascript:alert(1)")).toBeNull();
    expect(hrefSeguro("//evil.com")).toBeNull();
    expect(hrefSeguro("http://sem-https.com")).toBeNull();
    expect(hrefSeguro("/manutencao")).toBe("/manutencao");
    expect(lerTextoRico("[clique](javascript:alert(1))")[0]).toEqual({ tipo: "texto", valor: "clique" });
  });

  it("dá âncoras únicas a títulos repetidos", () => {
    const blocos: Bloco[] = [
      { tipo: "titulo", nivel: 2, texto: "Memória RAM" },
      { tipo: "titulo", nivel: 3, texto: "Memória RAM" },
      { tipo: "titulo", nivel: 2, texto: "Preço & prazo" },
    ];
    expect(montarSumario(blocos).sumario.map((s) => s.id)).toEqual(["memoria-ram", "memoria-ram-2", "preco-prazo"]);
  });
});

describe("conversão do HTML importado", () => {
  it("vira blocos e não deixa script passar", () => {
    const blocos = htmlParaBlocos(
      '<p>Um <strong>teste</strong> com <a href="https://www.balao.info/manutencao">link</a>.</p>' +
        "<script>alert(1)</script><h2>Seção &amp; mais</h2><ul><li>um</li><li>dois</li></ul><h4>Sub</h4>",
    );
    expect(blocos).toEqual([
      { tipo: "paragrafo", texto: "Um **teste** com [link](/manutencao)." },
      { tipo: "titulo", nivel: 2, texto: "Seção & mais" },
      { tipo: "lista", ordenada: false, itens: ["um", "dois"] },
      { tipo: "titulo", nivel: 3, texto: "Sub" },
    ]);
  });

  it("conserta os endereços que morreram na troca do catálogo", () => {
    expect(ajustarLink("https://www.balao.info/categoria/hardware-memorias")).toBe("/categoria/hardware-memoria-ram");
    expect(ajustarLink("https://www.balao.info/categoria/hardware-placas-de-video")).toBe(
      "/categoria/hardware-placa-de-video-vga",
    );
    expect(ajustarLink("https://www.balao.info/product/placa-de-video-qualquer-rtx-5070")).toBe(
      "/categoria/hardware-placa-de-video-vga",
    );
    expect(ajustarLink("https://exemplo.com/a")).toBe("https://exemplo.com/a");
    expect(ajustarLink("javascript:alert(1)")).toBeNull();
  });
});

describe("artigos do Soro", () => {
  it("lê a lista de dentro do script de incorporação", () => {
    const js =
      '(function(){var SORO_ARTICLES = [{"id":"a1","title":"Título [com] colchetes","slug":"titulo-um","excerpt":"Resumo \\"citado\\"","content":null,"isoDate":"2026-10-01T10:00:00+00:00","image":"https://x.co/a.webp"},{"id":"","title":"sem id","slug":"x"}];var OUTRO=[1];})()';
    const lista = extrairListaDoScript(js);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ id: "a1", slug: "titulo-um", titulo: "Título [com] colchetes" });
    expect(extrairListaDoScript("nada aqui")).toEqual([]);
  });

  it("a cópia guardada vira artigos completos", () => {
    expect(importados.length).toBeGreaterThanOrEqual(18);
    for (const artigo of importados) {
      const secoes = artigo.blocos.filter((b) => b.tipo === "titulo" && b.nivel === 2).length;
      expect(secoes, artigo.slug).toBeGreaterThanOrEqual(3);
      expect(artigo.capa?.src, artigo.slug).toMatch(/^\/blog\/capas\/.+\.webp$/);
      expect(minutosDeLeitura(artigo), artigo.slug).toBeGreaterThanOrEqual(5);
      expect(artigo.blocos.filter((b) => b.tipo === "chamada").length, artigo.slug).toBeLessThanOrEqual(2);
      expect(artigo.blocos.at(-1)?.tipo, artigo.slug).toBe("chamada");
    }
  });

  it("nenhum link importado aponta para endereço morto ou para o domínio completo", () => {
    const mortos = ["/categoria/hardware-memorias", "/categoria/hardware-placas-de-video", "/product/"];
    for (const artigo of importados) {
      const links = artigo.blocos.flatMap((b) => (b.tipo === "paragrafo" ? linksDoTexto(b.texto) : []));
      for (const link of links) {
        expect(link.startsWith("https://www.balao.info"), `${artigo.slug}: ${link}`).toBe(false);
        expect(mortos.some((m) => link.startsWith(m)), `${artigo.slug}: ${link}`).toBe(false);
      }
    }
  });

  it("cada artigo cai em uma categoria que existe, e todas as de referência têm artigo", () => {
    const contagem = contarPorCategoria(importados);
    expect(contagem.guias).toBeGreaterThan(0);
    expect(contagem.hardware).toBeGreaterThan(0);
    expect(contagem.analises).toBeGreaterThan(0);
    expect(contagem.assistencia).toBeGreaterThan(0);
    expect(classificarPorTitulo("Como recuperar dados de HD sem piorar o problema")).toBe("assistencia");
    expect(classificarPorTitulo("PC gamer montado para jogos vale a pena?")).toBe("analises");
    expect(classificarPorTitulo("SSD NVMe em notebook: quando vale o upgrade?")).toBe("hardware");
    expect(classificarPorTitulo("Como escolher notebook para estudar e trabalhar")).toBe("guias");
  });

  it("a chamada do meio nunca corta uma seção", () => {
    const blocos: Bloco[] = [];
    for (let s = 0; s < 6; s += 1) {
      blocos.push({ tipo: "titulo", nivel: 2, texto: `Seção ${s}` });
      for (let p = 0; p < 4; p += 1) blocos.push({ tipo: "paragrafo", texto: "x" });
    }
    const saida = inserirChamadas(blocos);
    const meio = saida.findIndex((b) => b.tipo === "chamada");
    expect(saida[meio + 1]).toMatchObject({ tipo: "titulo", nivel: 2 });
    expect(meio).toBeGreaterThan(saida.length * 0.3);
  });
});

describe("chamadas contextuais", () => {
  it("acompanham o assunto do artigo", () => {
    const base = { categoria: "guias" as const, etiquetas: [] };
    expect(escolherTema({ ...base, titulo: "Como recuperar dados de HD", slug: "como-recuperar-dados-de-hd" })).toBe("dados");
    expect(escolherTema({ ...base, titulo: "Por que notebook esquenta muito?", slug: "x" })).toBe("manutencao");
    expect(escolherTema({ ...base, titulo: "RTX 5060 Ti de 8 GB ou 16 GB", slug: "x" })).toBe("placas-de-video");
    expect(escolherTema({ ...base, titulo: "Notebook seminovo com garantia vale a pena?", slug: "x" })).toBe("seminovos");
  });

  it("sem página interna, abrem o WhatsApp da loja com o título do artigo", () => {
    const c = resolverChamada({ tipo: "chamada", tema: "geral" }, { titulo: "Meu artigo", slug: "meu", categoria: "guias", etiquetas: [] });
    expect(c.externa).toBe(true);
    expect(c.href).toContain("https://wa.me/5519987510267?text=");
    expect(decodeURIComponent(c.href)).toContain("Meu artigo");
  });

  it("chamada escrita no artigo, sem link, é pergunta no WhatsApp — sem segundo link repetido", () => {
    const artigo = { titulo: "RTX 5060 Ti de 8 GB ou 16 GB", slug: "rtx", categoria: "analises" as const, etiquetas: [] };
    const propria = resolverChamada({ tipo: "chamada", titulo: "Mande a lista dos seus jogos", rotulo: "Perguntar no WhatsApp" }, artigo);
    expect(propria.externa).toBe(true);
    expect(propria.href).toContain("wa.me");
    const doTema = resolverChamada({ tipo: "chamada", tema: "placas-de-video" }, artigo);
    expect(doTema.externa).toBe(false);
    expect(doTema.href).toBe("/categoria/hardware-placa-de-video-vga");
  });
});

describe("régua editorial", () => {
  // Rascunho pode estar pela metade; o que não é rascunho tem de passar.
  it.each(ARTIGOS_AUTORAIS.filter((a) => !a.rascunho).map((a) => [a.slug, a] as const))(
    "%s passa na régua",
    (_slug, artigo) => {
      const avaliacao = avaliarArtigo(artigo);
      if (avaliacao.avisos.length > 0) console.info(`[${artigo.slug}] avisos:\n- ${avaliacao.avisos.join("\n- ")}`);
      expect(avaliacao.erros, avaliacao.erros.join("\n")).toEqual([]);
    },
  );

  it("rascunho e artigo reprovado ficam fora do site", () => {
    const aprovado = ARTIGOS_AUTORAIS.find((a) => !a.rascunho)!;
    expect(prontoParaPublicar(aprovado)).toBe(true);
    expect(prontoParaPublicar({ ...aprovado, rascunho: true })).toBe(false);
    expect(prontoParaPublicar({ ...aprovado, blocos: aprovado.blocos.slice(0, 3) })).toBe(false);
  });

  it("reprova o formato raso de página de produto", () => {
    const raso: Artigo = {
      slug: "vale-a-pena-monitor-x",
      titulo: "Vale a pena: Monitor Gamer X 27 polegadas 144Hz",
      resumo: "Entenda para quem o monitor é ideal e veja dicas de compra de informática com atendimento rápido no WhatsApp da loja.",
      categoria: "guias",
      etiquetas: [],
      capa: null,
      publicadoEm: "2026-10-01T12:00:00.000Z",
      autor: { nome: "Equipe" },
      origem: "autoral",
      blocos: [
        { tipo: "chamada", tema: "geral" },
        { tipo: "paragrafo", texto: "O monitor é uma boa opção para quem busca desempenho." },
        { tipo: "titulo", nivel: 2, texto: "Link do produto" },
        { tipo: "paragrafo", texto: "[Monitor](/product/monitor-x)" },
      ],
    };
    const avaliacao = avaliarArtigo(raso);
    expect(avaliacao.aprovado).toBe(false);
    expect(avaliacao.erros.join(" ")).toMatch(/palavras/);
    expect(avaliacao.erros.join(" ")).toMatch(/cedo demais/);
    expect(avaliacao.erros.join(" ")).toMatch(/elementos de apoio/);
  });

  it("os artigos de referência do Soro ficam dentro da faixa medida", () => {
    const palavras = importados.map((a) => avaliarArtigo(a).medidas.palavras);
    const media = palavras.reduce((a, b) => a + b, 0) / palavras.length;
    expect(media).toBeGreaterThan(1200);
    expect(media).toBeLessThan(1700);
  });
});

describe("dados estruturados", () => {
  const analise = ARTIGOS_AUTORAIS.find((a) => a.analise)!;
  const noticia = ARTIGOS_AUTORAIS.find((a) => a.categoria === "noticias")!;

  it("análise gera BlogPosting, Review, FAQPage e trilha de navegação", () => {
    const nos = jsonLdDoArtigo(analise);
    const tipos = nos.map((n) => n["@type"]);
    expect(tipos).toEqual(["BlogPosting", "BreadcrumbList", "Review", "FAQPage"]);

    const post = nos[0] as unknown as {
      headline: string;
      image: string[];
      mainEntityOfPage: { "@id": string };
      wordCount: number;
      timeRequired: string;
      citation: unknown[];
    };
    expect(post.headline.length).toBeLessThanOrEqual(110);
    expect(post.image[0]).toMatch(/^https:\/\/www\.balao\.info\//);
    expect(post.mainEntityOfPage["@id"]).toBe(`https://www.balao.info/blog/${analise.slug}`);
    expect(post.wordCount).toBeGreaterThan(1200);
    expect(post.timeRequired).toMatch(/^PT\d+M$/);
    expect(post.citation.length).toBe(analise.fontes!.length);

    const review = nos[2] as unknown as {
      itemReviewed: object;
      reviewRating: object;
      positiveNotes: { itemListElement: unknown[] };
      negativeNotes: { itemListElement: unknown[] };
    };
    expect(review.itemReviewed).toMatchObject({ "@type": "Product", name: "GeForce RTX 5060 Ti 16 GB" });
    expect(review.reviewRating).toMatchObject({ ratingValue: analise.analise!.nota, bestRating: 10, worstRating: 0 });
    expect(review.positiveNotes.itemListElement.length).toBeGreaterThan(0);
    expect(review.negativeNotes.itemListElement.length).toBeGreaterThan(0);

    const faq = nos[3] as unknown as { mainEntity: unknown[] };
    expect(faq.mainEntity).toHaveLength(analise.perguntas!.length);
  });

  it("a nota da análise é a média dos critérios", () => {
    const { nota, criterios } = analise.analise!;
    const media = criterios!.reduce((s, c) => s + c.nota, 0) / criterios!.length;
    expect(nota).toBeCloseTo(media, 1);
  });

  it("notícia sai como NewsArticle e artigo importado como BlogPosting", () => {
    expect(jsonLdDoArtigo(noticia)[0]["@type"]).toBe("NewsArticle");
    expect(jsonLdDoArtigo(importados[0])[0]["@type"]).toBe("BlogPosting");
  });

  it("metadados trazem canônico, Open Graph de artigo e imagem grande", () => {
    const meta = metadataDoArtigo(analise) as unknown as {
      title: string;
      description: string;
      alternates: { canonical: string };
      openGraph: { type: string; publishedTime: string };
      twitter: { card: string };
    };
    expect(meta.alternates.canonical).toBe(`/blog/${analise.slug}`);
    expect(meta.openGraph.type).toBe("article");
    expect(meta.openGraph.publishedTime).toBe(analise.publicadoEm);
    expect(meta.twitter.card).toBe("summary_large_image");
    expect(String(meta.title).length).toBeLessThanOrEqual(60);
    expect(String(meta.description).length).toBeLessThanOrEqual(165);
  });
});

describe("vitrine e relacionados", () => {
  const todos = [...ARTIGOS_AUTORAIS, ...importados]
    .sort((a, b) => Date.parse(b.publicadoEm) - Date.parse(a.publicadoEm))
    .map(resumir);

  it("o artigo marcado como destaque abre a vitrine, e ninguém se repete", () => {
    const destaques = escolherDestaques(todos, 4);
    expect(destaques[0].slug).toBe("rtx-5060-ti-8gb-ou-16gb");
    expect(new Set(destaques.map((d) => d.slug)).size).toBe(4);
  });

  it("o leia também não devolve o próprio artigo", () => {
    const relacionados = escolherRelacionados(todos[0], todos, 3);
    expect(relacionados).toHaveLength(3);
    expect(relacionados.some((r) => r.slug === todos[0].slug)).toBe(false);
  });

  it("as categorias do filtro são as cinco da taxonomia", () => {
    expect(CATEGORIAS.map((c) => c.slug)).toEqual(["guias", "hardware", "analises", "noticias", "assistencia"]);
  });
});

describe("rotina diária", () => {
  // Um artigo como a rotina escreve: JSON solto, sem autor nem origem.
  const paragrafo = (assunto: string) =>
    `Quem escolhe ${assunto} olhando só um número da caixa costuma errar. O que decide é o uso: quantas horas por dia, que programas ficam abertos e o que vai ser ligado junto. Por isso vale separar o que muda o dia a dia do que só aparece no anúncio.`;
  const secao = (titulo: string, assunto: string) => [
    { tipo: "titulo", nivel: 2, texto: titulo },
    ...Array.from({ length: 5 }, (_v, i) => ({ tipo: "paragrafo", texto: `${paragrafo(assunto)} Ponto ${i + 1}.` })),
  ];
  const artigoBruto = () => ({
    slug: "como-escolher-monitor-para-trabalho",
    titulo: "Como escolher monitor para trabalho sem pagar a mais",
    resumo:
      "Tamanho, resolução e tipo de painel: o que pesa na escolha de um monitor para trabalhar oito horas por dia, e o que é só número de anúncio.",
    categoria: "guias",
    etiquetas: ["monitor", "home office"],
    publicadoEm: "2026-10-09T09:00:00-03:00",
    blocos: [
      { tipo: "paragrafo", texto: paragrafo("monitor para trabalho") },
      { tipo: "resumo", itens: ["Tamanho pela distância dos olhos.", "Resolução pelo tamanho.", "Painel pelo uso."] },
      ...secao("Tamanho: a distância manda", "o tamanho"),
      {
        tipo: "tabela",
        colunas: ["Tamanho", "Resolução indicada"],
        linhas: [
          ["24 polegadas", "Full HD"],
          ["27 polegadas", "Quad HD"],
        ],
      },
      ...secao("Resolução: nitidez depende do tamanho", "a resolução"),
      { tipo: "chamada", tema: "geral" },
      ...secao("Painel: IPS, VA ou OLED", "o painel"),
      { tipo: "pros-contras", pros: ["Mais área de trabalho"], contras: ["Ocupa mais mesa"] },
      ...secao("Conexões e ajuste de altura", "as conexões"),
      { tipo: "paragrafo", texto: "Veja os [monitores](/categoria/computadores-monitores-monitor-gamer) e a [assistência técnica](/manutencao) da loja." },
      ...secao("Quando o segundo monitor compensa", "o segundo monitor"),
    ],
    perguntas: [
      { pergunta: "Monitor curvo cansa menos?", resposta: "Em telas largas, a curva mantém as bordas à mesma distância dos olhos." },
      { pergunta: "Preciso de 144 Hz para trabalhar?", resposta: "Não. A rolagem fica mais suave, mas não muda a produtividade." },
      { pergunta: "TV serve como monitor?", resposta: "Serve para vídeo; para texto, a nitidez costuma ser pior." },
    ],
    fontes: [
      { nome: "RTINGS: monitor size to distance", url: "https://www.rtings.com/monitor/learn/size-to-distance-relationship" },
      { nome: "VESA DisplayPort", url: "https://www.displayport.org/" },
    ],
  });

  it("aceita um artigo completo e assina pela equipe", () => {
    const lido = lerArtigo(artigoBruto());
    expect(lido.ok, lido.ok ? "" : lido.erros.join("\n")).toBe(true);
    if (!lido.ok) return;
    expect(lido.valor.origem).toBe("diario");
    expect(lido.valor.autor.pessoa).toBeUndefined();
    const avaliacao = avaliarArtigo(lido.valor);
    expect(avaliacao.erros, avaliacao.erros.join("\n")).toEqual([]);
  });

  it("recusa arquivo malformado em vez de publicar pela metade", () => {
    expect(lerArtigo(null).ok).toBe(false);
    expect(lerArtigo({ ...artigoBruto(), slug: "Com Espaço" }).ok).toBe(false);
    expect(lerArtigo({ ...artigoBruto(), categoria: "promocoes" }).ok).toBe(false);
    expect(lerArtigo({ ...artigoBruto(), blocos: [{ tipo: "html", texto: "<script>" }] }).ok).toBe(false);
    expect(lerArtigo({ ...artigoBruto(), blocos: [{ tipo: "imagem", imagem: { src: "javascript:alert(1)", alt: "x" } }] }).ok).toBe(false);
    // Nota e veredito falam em nome da loja: não entram por arquivo.
    expect(lerArtigo({ ...artigoBruto(), analise: { item: { nome: "X" }, nota: 9, veredito: "Ótimo" } }).ok).toBe(false);
  });

  const reprova = (mudar: (a: ReturnType<typeof artigoBruto>) => void): string[] => {
    const bruto = artigoBruto();
    mudar(bruto);
    const lido = lerArtigo(bruto);
    if (!lido.ok) return lido.erros;
    return avaliarArtigo(lido.valor).erros;
  };

  it("não deixa a rotina falar de preço, parcela ou desconto", () => {
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Sai por R$ 1.299 na loja." })).join(" ")).toMatch(/preço em reais/);
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Em até 10x sem juros." })).join(" ")).toMatch(/parcelamento/);
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Com 10% no PIX." })).join(" ")).toMatch(/desconto/);
    // "2x de 8 GB" é memória, não parcela.
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Prefira 2x de 8 GB a um pente só." }))).toEqual([]);
  });

  it("não deixa a rotina transcrever número de teste nem frase de terceiros", () => {
    const fonte = { nome: "Site", url: "https://exemplo.com/teste" };
    expect(
      reprova((a) =>
        a.blocos.push({
          tipo: "benchmark",
          titulo: "Quadros por segundo",
          unidade: "fps",
          grupos: [{ rotulo: "Jogo", barras: [{ nome: "A", valor: 60 }, { nome: "B", valor: 70 }] }],
          fonte,
        } as never),
      ).join(" "),
    ).toMatch(/benchmark/);
    expect(reprova((a) => a.blocos.push({ tipo: "citacao", texto: "É ótimo.", autor: "Fulano", fonte } as never)).join(" ")).toMatch(/citação/);
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Testamos na bancada e deu certo." })).join(" ")).toMatch(/teste próprio/);
  });

  it("a rotina só aponta para páginas conferidas e só usa chamada pronta", () => {
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Veja a [promoção](/promocao-relampago)." })).join(" ")).toMatch(/fora da lista/);
    expect(reprova((a) => a.blocos.push({ tipo: "paragrafo", texto: "Leia [outro artigo](/blog/fonte-ideal-para-pc-gamer)." }))).toEqual([]);
    expect(
      reprova((a) => a.blocos.push({ tipo: "chamada", titulo: "Garantia vitalícia", texto: "Só hoje." } as never)).join(" "),
    ).toMatch(/tema pronto/);
    expect(reprova((a) => (a.fontes = a.fontes.slice(0, 1))).join(" ")).toMatch(/duas fontes/);
    expect(reprova((a) => (a.categoria = "analises")).join(" ")).toMatch(/não publica análise/);
  });

  it("lê a lista do ramo de conteúdo e ignora linha estragada", () => {
    const linha = { slug: "a-b", titulo: "Título", resumo: "Resumo", categoria: "guias", publicadoEm: "2026-10-09T09:00:00Z", minutos: 7 };
    expect(lerResumo(linha)).toMatchObject({ slug: "a-b", minutos: 7, temAnalise: false, capa: null });
    expect(lerResumo({ ...linha, categoria: "outra" })).toBeNull();
    expect(lerResumo({ ...linha, publicadoEm: "ontem" })).toBeNull();
    expect(lerResumo("texto")).toBeNull();
  });

  it("artigo sem foto ganha capa desenhada, sempre a mesma, e sem texto", () => {
    const capa = desenharFundo("como-escolher-monitor-para-trabalho", "guias");
    expect(capa).toBe(desenharFundo("como-escolher-monitor-para-trabalho", "guias"));
    expect(capa).not.toBe(desenharFundo("pc-nao-liga-o-que-verificar", "guias"));
    expect(capa).toMatch(/^<svg /);
    expect(capa).not.toMatch(/<text/);
    expect(capa).toContain("#E60012");
    expect(fundoGerado({ slug: "a-b", categoria: "guias" })).toBe("/blog/api/og?fundo=1&category=guias&seed=a-b");
  });

  it("o artigo do dia entra na vitrine depois do destaque marcado", () => {
    const daCasa = [...ARTIGOS_AUTORAIS, ...importados].map(resumir);
    const doDia = lerResumo({
      slug: "artigo-do-dia",
      titulo: "Artigo do dia",
      resumo: "Resumo",
      categoria: "guias",
      publicadoEm: "2099-01-01T09:00:00Z",
    })!;
    const todos = [doDia, ...daCasa];
    expect(escolherDestaques(todos, 4).map((d) => d.slug).slice(0, 2)).toEqual(["rtx-5060-ti-8gb-ou-16gb", "artigo-do-dia"]);
  });
});
