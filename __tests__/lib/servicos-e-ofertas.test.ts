import { describe, it, expect } from "vitest";
import { prateleirasDaPagina, produtosMostrados } from "@/lib/servicos-e-ofertas/vitrines";
import { linkDoWhatsApp, NECESSIDADES, ORIGEM, PERGUNTAS, SERVICOS } from "@/lib/servicos-e-ofertas/conteudo";
import type { Product } from "@/lib/utils";

const p = (id: string, name: string, category: string, price: string, extra: Partial<Product> = {}) =>
  ({ id, name, category, price, image: `https://img/${id}.jpg`, brand: name.split(" ")[1], ...extra }) as Product;

describe("prateleiras de /servicos-e-ofertas", () => {
  const produtos = [
    p("n1", "Notebook Lenovo IdeaPad 3", "Computadores/Notebooks/Notebook Lenovo", "3.000,00"),
    p("n2", "Notebook Acer Aspire 5", "Computadores/Notebooks/Notebook Acer", "4.000,00"),
    p("n3", "MacBook Air M3", "Computadores/Notebooks/Macbook", "9.000,00"),
    p("n4", "Notebook Dell Inspiron", "Computadores/Notebooks/Notebook Dell", "5.000,00"),
    // As "ofertas" da versão antiga: não podem aparecer.
    p("x1", "Kit de Parafusos para Cadeira Gamer Husky", "Espaço Gamer/Cadeiras Gamer/Acessórios", "26,47"),
    p("x2", "Adaptador Kingston para SSD 2.5", "Hardware/SSD/Acessórios", "17,28"),
    p("m1", "Monitor LG 24", "Computadores/Monitores/Monitor Gamer", "900,00"),
    p("m2", "Monitor AOC 27", "Computadores/Monitores/Monitor Gamer", "1.200,00"),
    p("m3", "Monitor Samsung 32", "Computadores/Monitores/Monitor Gamer", "1.800,00"),
    p("m4", "Monitor Dell 24", "Computadores/Monitores/Monitor Office", "800,00"),
    p("i1", "Impressora Epson L3250", "Impressão/Impressoras", "1.000,00"),
    p("i2", "Impressora HP 2774", "Impressão/Impressoras", "400,00"),
    p("i3", "Impressora Canon G3110", "Impressão/Impressoras", "1.100,00"),
    p("i4", "Impressora Brother DCP", "Impressão/Impressoras", "1.500,00"),
  ];

  it("traz notebooks antes de monitores, sem acessório barato e sem impressão", () => {
    const prateleiras = prateleirasDaPagina(produtos);
    expect(prateleiras.map((v) => v.id)).toEqual(["notebooks", "monitores"]);
    const ids = produtosMostrados(prateleiras).map((x) => x.id);
    expect(ids).not.toContain("x1");
    expect(ids).not.toContain("x2");
    expect(ids.some((id) => id.startsWith("i"))).toBe(false);
  });

  it("não quebra sem produtos", () => {
    expect(prateleirasDaPagina([])).toEqual([]);
  });
});

describe("conteúdo de /servicos-e-ofertas", () => {
  it("toda mensagem de WhatsApp leva a origem e vai para o número da loja", () => {
    const link = linkDoWhatsApp(NECESSIDADES[0].mensagem);
    expect(link.startsWith("https://wa.me/5519987510267?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toContain(ORIGEM);
  });

  it("serviços têm página e foto locais, e as perguntas não falam preço de serviço", () => {
    for (const s of SERVICOS) {
      expect(s.href.startsWith("/")).toBe(true);
      expect(s.foto.startsWith("/images/servicos-e-ofertas/")).toBe(true);
    }
    for (const q of PERGUNTAS) expect(q.answer).not.toMatch(/R\$/);
  });
});

describe("piso de preço das prateleiras", () => {
  it("pronta entrega só a partir de R$ 150", () => {
    const pronta = (id: string, nome: string, preco: string) =>
      p(id, nome, "Diversos", preco, { availability: "Pronta entrega" });
    const lista = [
      pronta("a", "Suporte Veicular Para Moto", "80,00"),
      pronta("b", "Caixa de Som JBL Go", "250,00"),
      pronta("c", "Headphone Sony WH", "400,00"),
      pronta("d", "Smartwatch Xiaomi Band", "300,00"),
      pronta("e", "Roteador TP-Link Archer", "350,00"),
      pronta("f", "Webcam Logitech C920", "450,00"),
    ];
    const v = prateleirasDaPagina(lista).find((x) => x.id === "pronta-entrega");
    expect(v).toBeDefined();
    expect(v!.produtos.map((x) => x.id)).not.toContain("a");
  });
});

describe("foto do fornecedor", () => {
  it("produto com foto do catálogo Kyte fica de fora", () => {
    const kyte = "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/x.jpg?alt=media";
    const lista = [
      p("k", "Monitor Kyte 24", "Computadores/Monitores", "900,00", { image: kyte }),
      p("m1", "Monitor LG 24", "Computadores/Monitores/Monitor Gamer", "900,00"),
      p("m2", "Monitor AOC 27", "Computadores/Monitores/Monitor Gamer", "1.200,00"),
      p("m3", "Monitor Samsung 32", "Computadores/Monitores/Monitor Gamer", "1.800,00"),
      p("m4", "Monitor Dell 24", "Computadores/Monitores/Monitor Office", "800,00"),
    ];
    const ids = produtosMostrados(prateleirasDaPagina(lista)).map((x) => x.id);
    expect(ids).toEqual(expect.arrayContaining(["m1", "m2", "m3", "m4"]));
    expect(ids).not.toContain("k");
  });
});
