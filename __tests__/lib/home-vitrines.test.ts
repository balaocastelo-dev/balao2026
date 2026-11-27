import { describe, it, expect } from "vitest";
import { montarVitrines, escolherVariados } from "@/lib/home/vitrines";
import type { Product } from "@/lib/utils";

const p = (id: string, name: string, category: string, price: string, extra: Partial<Product> = {}) =>
  ({ id, name, category, price, image: `https://img/${id}.jpg`, brand: name.split(" ")[1], ...extra }) as Product;

describe("vitrines da página inicial", () => {
  const produtos = [
    p("n1", "Notebook Lenovo IdeaPad 3", "Computadores/Notebooks/Notebook Lenovo", "3.000,00"),
    p("n2", "Notebook Acer Aspire 5", "Computadores/Notebooks/Notebook Acer", "4.000,00"),
    p("n3", "MacBook Air M3", "Computadores/Notebooks/Macbook", "9.000,00"),
    p("n4", "Notebook Dell Inspiron", "Computadores/Notebooks/Notebook Dell", "5.000,00"),
    p("x1", "Memória RAM para Notebook 8GB", "Hardware/Memória RAM/DDR4", "200,00"),
    p("x2", "Fonte Notebook Dell 65W", "Energia/Fontes para Notebook", "119,00"),
    p("x3", "Suporte para Notebook", "Computadores/Notebooks/Acessórios", "90,00"),
    p("m1", "Monitor LG 24", "Computadores/Monitores/Monitor Gamer", "900,00"),
    p("m2", "Monitor AOC 27", "Computadores/Monitores/Monitor Gamer", "1.200,00"),
    p("m3", "Monitor Samsung 32", "Computadores/Monitores/Monitor Gamer", "1.800,00"),
    p("m4", "Monitor Dell 24", "Computadores/Monitores/Monitor Office", "800,00"),
    p("y1", "Luminária Led para Monitor", "Computadores/Monitores/Acessórios", "120,00"),
    p("y2", "Suporte Articulado Monitor", "Computadores/Monitores/Suporte", "200,00"),
  ];

  it("Notebooks só notebook, Monitores só monitor", () => {
    const vitrines = montarVitrines(produtos, 6);
    const nb = vitrines.find((v) => v.id === "notebooks")!;
    const mon = vitrines.find((v) => v.id === "monitores")!;
    expect(nb.produtos.map((x) => x.id).sort()).toEqual(["n1", "n2", "n3", "n4"]);
    expect(mon.produtos.map((x) => x.id).sort()).toEqual(["m1", "m2", "m3", "m4"]);
  });

  it("a seção gamer usa a mesma regra de /pcgamer: só placa dedicada", () => {
    const gamer = [
      p("sem", "Computador Cpu Intel Core i3 2120 16gb Ddr3 SSD 512gb Gabinete Gamer Fonte 500w", "Computadores/PC/PC Gamer", "1.200,00"),
      p("hd", "PC Gamer Intel i7-4770, 8GB, Intel HD Graphics 4600, SSD 240GB", "Computadores/PC/PC Gamer", "1.100,00"),
      p("3770", "PC Gamer Intel Core i7-3770, 8GB DDR3, SSD 512GB", "Computadores/PC/PC Gamer", "1.300,00"),
      p("rtx", "PC Gamer Ryzen 5 5600, RTX 4060 8GB, 16gb", "Computadores/PC/PC Gamer", "4.500,00"),
      p("rx", "PC Gamer Intel Core i3-2120, Radeon RX 580, 8GB DDR3, SSD 240GB", "Computadores/PC/PC Gamer", "1.800,00"),
    ];
    const vitrine = montarVitrines(gamer, 2).find((v) => v.id === "pc-gamer")!;
    expect(vitrine.produtos.map((x) => x.id).sort()).toEqual(["rtx", "rx"]);
  });

  it("escolhe variado e prefere foto de verdade", () => {
    const lista = Array.from({ length: 20 }, (_, i) =>
      p(`a${i}`, `Monitor Marca${i % 4} ${i}`, "Computadores/Monitores", `${(i + 1) * 100},00`, i === 0 ? { image: "/produto-sem-foto.svg" } : {})
    );
    const escolhidos = escolherVariados(lista, 6);
    expect(escolhidos).toHaveLength(6);
    expect(escolhidos.some((x) => x.id === "a0")).toBe(false);
  });
});
