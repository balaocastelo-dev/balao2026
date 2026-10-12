import { describe, it, expect } from "vitest";
import { escolherDestaques, ehMemoriaRam, ehSsdDeUpgrade, temFotoDoProduto } from "@/lib/catalogo/especialidades";
import type { Product } from "@/lib/utils";

const p = (id: string, name: string, price: string, extra: Partial<Product> = {}) =>
  ({ id, name, category: "Hardware/SSD", price, image: `https://img/${id}.jpg`, slug: id, ...extra }) as Product;

describe("vitrines da página /especialidades", () => {
  it("só entra produto com foto do próprio produto, preço e disponível", () => {
    const lista = [
      p("a", "SSD Kingston NV3 1TB NVMe", "500,00"),
      p("b", "SSD WD Black 2TB NVMe", "1.200,00", { image: "/produto-sem-foto.svg" }),
      p("c", "SSD Samsung 990 Pro 2TB NVMe", "1.500,00", { image: "https://img/c.jpg#ilustrativa" }),
      p("d", "SSD Crucial P3 1TB NVMe", "0"),
      p("e", "SSD Lexar 1TB NVMe", "450,00", { availability: "Indisponível" }),
      p("f", "SSD Kingston Fury 2TB NVMe", "1.100,00"),
    ];
    expect(escolherDestaques(lista, 4).map((x) => x.id)).toEqual(["f", "a"]);
  });

  it("abre a fileira pelo mais caro e não repete produto", () => {
    const lista = [
      p("1", "PC Gamer Ryzen 5 RTX 4060", "4.000,00", { brand: "A" }),
      p("2", "PC Gamer Ryzen 7 RTX 5070", "9.000,00", { brand: "B" }),
      p("3", "PC Gamer Ryzen 9 RTX 5090", "25.000,00", { brand: "C" }),
      p("2", "PC Gamer Ryzen 7 RTX 5070", "9.000,00", { brand: "B" }),
    ];
    const ids = escolherDestaques(lista, 4).map((x) => x.id);
    expect(ids).toEqual(["3", "2", "1"]);
  });

  it("filtros de upgrade separam SSD interno e memória RAM", () => {
    expect(ehSsdDeUpgrade(p("x", "SSD Kingston NV3 1TB M.2 2280 NVMe", "1"))).toBe(true);
    expect(ehSsdDeUpgrade(p("y", "SSD Externo Portátil Samsung T7 1TB", "1"))).toBe(false);
    expect(ehMemoriaRam(p("z", "Memória RAM Kingston Fury Beast 16GB DDR5 5600MHz", "1"))).toBe(true);
    expect(ehMemoriaRam(p("w", "Dissipador para Memória DDR4", "1"))).toBe(false);
    expect(temFotoDoProduto(p("v", "x", "1", { image: "" }))).toBe(false);
  });
});
