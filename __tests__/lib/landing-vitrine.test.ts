import { describe, expect, it } from "vitest";
import { casaComRegra, montarFileira, montarFileiras, origensDasRegras, temFoto } from "@/lib/landing/vitrine";
import { escolherArtigosDaPagina, escolherPaginasVizinhas, montarMensagem } from "@/lib/landing/rede";
import type { ArtigoResumido } from "@/lib/blog/tipos";

const p = (id: string, name: string, price: string, category: string, extra: Record<string, string> = {}) => ({
  id,
  name,
  price,
  category,
  slug: id,
  image: `https://exemplo.com/${id}.jpg`,
  availability: "Disponível",
  supplier: "KaBuM!",
  brand: undefined,
  ...extra,
});

describe("vitrine das páginas de captação", () => {
  it("toner não casa com notebook HP só porque tem 'hp' no nome", () => {
    const regra = { id: "t", titulo: "Toners", categorias: ["Impressão/Toners"] };
    expect(casaComRegra(p("1", "Toner HP 85A", "199,90", "Impressão/Toners"), regra)).toBe(true);
    expect(casaComRegra(p("2", "Notebook HP 250 G9", "2999,00", "Computadores/Notebooks"), regra)).toBe(false);
  });

  it("termo é palavra inteira: 'hp' não casa com 'chip'", () => {
    const regra = { id: "x", titulo: "x", categorias: ["A"], nomeContem: ["hp"] };
    expect(casaComRegra(p("1", "Cabo com chip", "10", "A"), regra)).toBe(false);
    expect(casaComRegra(p("2", "Cartucho HP 664", "60", "A"), regra)).toBe(true);
  });

  it("tira o que está sem foto, indisponível, fora da faixa e repetido", () => {
    const produtos = [
      p("1", "SSD A 480GB", "300", "Hardware/SSD"),
      p("2", "SSD A 480GB", "300", "Hardware/SSD"),
      p("3", "SSD B 1TB", "600", "Hardware/SSD", { image: "/produto-sem-foto.svg" }),
      p("4", "SSD C 2TB", "2000", "Hardware/SSD"),
      p("5", "SSD D 240GB", "200", "Hardware/SSD", { availability: "Indisponível" }),
      p("6", "SSD E 512GB", "350", "Hardware/SSD/SSD PCIe NVMe"),
    ];
    const f = montarFileira(produtos, { id: "s", titulo: "SSD", categorias: ["Hardware/SSD"], precoMax: 1000 });
    expect(f.produtos.map((x) => x.id)).toEqual(["6", "1"]);
    expect(temFoto({ image: "" })).toBe(false);
  });

  it("não repete produto entre fileiras e devolve o que pedir ao banco", () => {
    const produtos = [p("1", "Controle Sony DualSense", "500", "Games/Playstation/Controles Playstation")];
    const regras = [
      { id: "a", titulo: "A", categorias: ["Games/Playstation"] },
      { id: "b", titulo: "B", nomeComeca: ["Controle"] },
    ];
    const fileiras = montarFileiras(produtos, regras);
    expect(fileiras).toHaveLength(1);
    expect(origensDasRegras(regras)).toEqual({ categorias: ["Games/Playstation"], nomes: ["controle"] });
  });
});

describe("rede de links", () => {
  const paginas = [
    { slug: "a", temas: ["apple", "iphone"], relacionadas: ["c"] },
    { slug: "b", temas: ["apple"] },
    { slug: "c", temas: ["games"] },
    { slug: "d", temas: ["iphone", "apple"] },
  ];

  it("põe as pedidas primeiro e depois as que dividem mais temas", () => {
    expect(escolherPaginasVizinhas(paginas[0], paginas, 3).map((x) => x.slug)).toEqual(["c", "d", "b"]);
  });

  it("acha o artigo do blog pelo assunto e ignora o que não tem nada a ver", () => {
    const artigo = (slug: string, titulo: string, etiquetas: string[], publicadoEm: string) =>
      ({ slug, titulo, etiquetas, publicadoEm, resumo: "", categoria: "guias", capa: null, minutos: 3, temAnalise: false }) as ArtigoResumido;
    const artigos = [
      artigo("ssd-no-fim", "Como saber se o SSD está chegando ao fim", ["ssd", "backup"], "2026-10-11"),
      artigo("rtx", "RTX 5060 Ti", ["placa de vídeo"], "2026-10-12"),
    ];
    expect(escolherArtigosDaPagina({ termosDoBlog: ["SSD", "backup"] }, artigos).map((a) => a.slug)).toEqual(["ssd-no-fim"]);
  });

  it("monta a mensagem do WhatsApp com uma linha por resposta", () => {
    expect(montarMensagem("Olá!", [{ rotulo: "Aparelho", valor: "Notebook" }, { rotulo: "Problema", valor: ["Lento", "Esquenta"] }, { rotulo: "Vazio", valor: "" }], "Posso mandar foto?")).toBe(
      "Olá!\n• Aparelho: Notebook\n• Problema: Lento, Esquenta\nPosso mandar foto?"
    );
  });
});
