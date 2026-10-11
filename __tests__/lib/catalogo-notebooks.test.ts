import { describe, it, expect } from "vitest";
import { ehNotebook, selecionarNotebooks } from "@/lib/catalogo/notebooks";
import catalogo from "@/data/catalogo-backup.json";
import type { Product } from "@/lib/utils";

// Os títulos abaixo são do catálogo da loja. Os da lista "não é notebook" são
// exatamente os que apareciam nos cards de www.balao.info/notebooks em
// 11/10/2026, quando a página buscava por palavra solta.

const NOTEBOOKS = "Computadores/Notebooks";

describe("ehNotebook", () => {
  it.each([
    ['Notebook Acer Aspire Go 15 AG15-71P-753G, Intel Core i7-13620H, 8GB RAM, SSD 256GB, 15.6" Full HD', `${NOTEBOOKS}/Notebook Acer`],
    ['Notebook Gamer Lenovo LOQ 15IRX9, 15.6" Full HD 144Hz, Intel Core i5-13450HX, 16GB, 512GB SSD', `${NOTEBOOKS}/Notebook Lenovo`],
    ['MacBook Air Apple 15" Chip M5, CPU de 10 Núcleos, GPU de 10 Núcleos, Neural Engine de 16 Núcleos', `${NOTEBOOKS}/Macbook`],
    ['MacBook Pro de 14", M5, CPU de 10 núcleos, GPU de 10 núcleos, 16GB RAM, SSD 1TB, Prateado', `${NOTEBOOKS}/Macbook/Macbook Pro`],
    ["Notebook ASUS TUF Gaming F16 Intel Core 5 210H, RTX 4050, 8GB, 512GB SSD", `${NOTEBOOKS}/Notebook Gamer/Notebook Gamer Asus`],
    // Notebook de fornecedor local, que entra fora da árvore da KaBuM!.
    ["Notebook Lenovo IdeaPad 1 Ryzen 5 8GB SSD 256GB", "Informática/Acessórios"],
    // Dentro da categoria, mesmo com o nome começando pela marca.
    ["Lenovo ThinkPad E14 Core i5 16GB SSD 512GB", `${NOTEBOOKS}/Notebook Lenovo`],
  ])("é notebook: %s", (name, category) => {
    expect(ehNotebook({ name, category })).toBe(true);
  });

  it.each([
    ["Memória RAM para Notebook Rise Mode Value Series, 4GB, 1600MHz, DDR3, CL11 - RM-D3-4G1600NL", "Hardware/Memória RAM/DDR 3/1600 Mhz PC12800"],
    ["Memoria RAM Para Notebook Rise Mode Value, 16GB, 3200MHZ, DDR4, CL22 - RM-D4-16G-3200VN", "Hardware/Memória RAM/DDR 4/3200MHz"],
    ["Cadeira Gamer XT Racer Viking Series, Até 120Kg, Com Almofadas, Reclinável - XTR-021", "Espaço Gamer/Cadeiras Gamer/XT Racer"],
    ["Cadeira de Escritório Ergonômica Presidente XT Racer Office X-Place - XTO-113", "Escritório/Home Office/Cadeira de Escritório"],
    ['Monitor Gamer Acer Nitro KG270 P0bi, 27" FHD, 144Hz, 1ms, HDMI, Preto - UM.HX0AA.011', "Computadores/Monitores/Monitor Gamer"],
    ["Fonte Notebook Dell 19,5V 3.34A 65W Pino Agulha Fino", "Energia/Fontes para Notebook"],
    ["Fonte Macbook Tipo C 87W", "Energia/Fontes para Notebook"],
    ["Suporte para Notebook com Cooler Knup KP 9013", "Informática/Suportes para Notebook"],
    ["Carregador Universal Notebook 120W Knup KP-525", "Energia/Fontes para Notebook"],
    ["Memória Notebook DDR4 8GB/3200 Keepdata", "Hardware/Memória RAM"],
    // Acessório cadastrado por engano dentro da categoria de notebooks.
    ["Mochila para Notebook 15.6 Dell Essential", `${NOTEBOOKS}/Notebook Gamer`],
    ["Base Refrigerada para Notebook Gamer com 6 Fans", `${NOTEBOOKS}/Notebook Gamer`],
    ["Dell Carregador 65W para Notebook Inspiron", `${NOTEBOOKS}`],
    ["PC Gamer Completo Ryzen 5 5600G 16GB SSD 480GB", "Computadores/PC/PC Gamer"],
  ])("não é notebook: %s", (name, category) => {
    expect(ehNotebook({ name, category })).toBe(false);
  });
});

describe("selecionarNotebooks", () => {
  const produto = (id: string, name: string, price: string, extra: Partial<Product> = {}) =>
    ({ id, name, price, category: `${NOTEBOOKS}/Notebook Acer`, image: "", slug: id, ...extra }) as Product;

  it("ordena do mais barato para o mais caro e tira o que não é notebook", () => {
    const { produtos, total } = selecionarNotebooks([
      produto("3", "Notebook C", "9.000,00"),
      produto("1", "Notebook A", "4.786,67"),
      produto("x", "Cadeira Gamer XT Racer Attack", "1.063,99", { category: "Espaço Gamer/Cadeiras Gamer/XT Racer" }),
      produto("2", "Notebook B", "R$ 6.382,67"),
    ]);
    expect(produtos.map((p) => p.id)).toEqual(["1", "2", "3"]);
    expect(total).toBe(3);
  });

  it("tira indisponível, sem preço e repetido", () => {
    const { produtos } = selecionarNotebooks([
      produto("1", "Notebook A", "4.000,00"),
      produto("1", "Notebook A", "4.000,00"),
      produto("2", "Notebook B", "5.000,00", { availability: "Indisponível" }),
      produto("3", "Notebook C", ""),
    ]);
    expect(produtos.map((p) => p.id)).toEqual(["1"]);
  });

  it("corta no limite, mas conta todos", () => {
    const lista = Array.from({ length: 60 }, (_, i) => produto(String(i), `Notebook ${i}`, `${1000 + i},00`));
    const { produtos, total } = selecionarNotebooks(lista, 48);
    expect(produtos).toHaveLength(48);
    expect(total).toBe(60);
  });

  it("aguenta lista vazia ou inválida", () => {
    expect(selecionarNotebooks([])).toEqual({ produtos: [], total: 0 });
    expect(selecionarNotebooks(null as unknown as Product[])).toEqual({ produtos: [], total: 0 });
  });
});

describe("catálogo de verdade (cópia guardada no repositório)", () => {
  const produtos = (catalogo as { produtos: Product[] }).produtos;
  const { produtos: cards, total } = selecionarNotebooks(produtos, 1000);

  it("acha os notebooks do catálogo", () => {
    expect(total).toBeGreaterThanOrEqual(40);
  });

  it("todo card é da categoria de notebooks e tem nome de notebook", () => {
    for (const p of cards) {
      expect(p.category.startsWith(NOTEBOOKS), `${p.name} — ${p.category}`).toBe(true);
      expect(/^(notebook|macbook)/i.test(p.name.trim()), p.name).toBe(true);
    }
  });

  it("não deixa nenhum notebook da categoria de fora", () => {
    const daCategoria = produtos.filter(
      (p) => p.category.startsWith(NOTEBOOKS) && !/indispon|esgotad|sem estoque/i.test(String(p.availability || ""))
    );
    expect(new Set(cards.map((p) => p.id)).size).toBe(new Set(daCategoria.map((p) => p.id)).size);
  });
});
