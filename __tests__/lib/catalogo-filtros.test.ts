import { describe, it, expect } from "vitest";
import { aplicarFiltros, casaComTermos, contarFiltros, lerFiltros, montarFacetas, ordenar, paraQuery, pontuar, termosDaBusca } from "@/lib/catalogo/filtros";
import type { Product } from "@/lib/utils";

const p = (id: string, name: string, category: string, price: string, brand?: string): Product => ({
  id, name, category, price, brand, image: "", slug: id,
});

// O caso do Thiago: buscar "16gb ddr5" querendo memória.
const resultado: Product[] = [
  p("pc1", "PC Gamer Completo Ryzen 7 8700f, RTX 5060, 16gb Ddr5, SSD Nvme 1TB, 700w 80 Plus", "Computadores/PC/PC Gamer/PC Gamer Completo", "7.999,00"),
  p("pc2", "PC Gamer Intel I7 14700KF, RTX 5060 Ti, 16gb Ddr5, Nvme 2TB", "Computadores/PC/PC Gamer", "9.500,00"),
  p("nb1", "Notebook Acer Nitro V15 Intel Core i7, 16GB DDR5, RTX 4050", "Computadores/Notebooks", "6.200,00", "Acer"),
  p("m1", "Memória RAM Kingston Fury Beast, 16GB, 5200MHz, DDR5, CL40", "Hardware/Memória RAM/DDR5", "599,90", "Kingston"),
  p("m2", "Memória RAM Corsair Vengeance, 16GB, 6000MHz, DDR5", "Hardware/Memória RAM/DDR5", "689,00", "Corsair"),
  p("m3", "Memória RAM Notebook Kingston, 16GB, DDR5, 4800MHz", "Hardware/Memória RAM/Memória para Notebook", "450,00", "KINGSTON"),
  p("mb1", "Placa-Mãe ASUS B650M, AM5, DDR5, suporta 16GB por slot", "Hardware/Placas-mãe", "1.100,00", "ASUS"),
];

describe("catalogo/filtros — leitura da URL", () => {
  it("lê e limpa os parâmetros", () => {
    const f = lerFiltros({ cat: " Hardware / Memória RAM ", marca: "Kingston, Corsair", min: "1.000,50", max: "100", tags: "DDR5", ordem: "menor", page: "3" });
    expect(f.cat).toBe("Hardware/Memória RAM");
    expect(f.marcas).toEqual(["Kingston", "Corsair"]);
    expect([f.min, f.max]).toEqual([100, 1000.5]); // invertidos voltam à ordem
    expect(f.tags).toEqual(["DDR5"]);
    expect(f.ordem).toBe("menor");
    expect(f.pagina).toBe(3);
    expect(contarFiltros(f)).toBe(5);
  });

  it("ignora lixo", () => {
    const f = lerFiltros({ min: "abc", max: "-5", ordem: "qualquer", page: "0" });
    expect([f.min, f.max, f.ordem, f.pagina]).toEqual([null, null, null, 1]);
    expect(contarFiltros(f)).toBe(0);
  });

  it("monta a query de volta, sem página 1", () => {
    const f = lerFiltros({ cat: "Hardware", marca: "Kingston", page: "1" });
    expect(paraQuery(f, { search: "16gb ddr5" })).toBe("search=16gb+ddr5&cat=Hardware&marca=Kingston");
    expect(paraQuery({ ...f, pagina: 2 })).toBe("cat=Hardware&marca=Kingston&page=2");
  });
});

describe("catalogo/filtros — o caso '16gb ddr5'", () => {
  const vazio = lerFiltros({});

  it("sem filtro, mostra os departamentos com a contagem de cada um", () => {
    const facetas = montarFacetas(resultado, vazio);
    expect(facetas.categorias).toEqual([
      { nome: "Hardware", caminho: "Hardware", total: 4 },
      { nome: "Computadores", caminho: "Computadores", total: 3 },
    ]);
    expect(facetas.trilha).toEqual([{ nome: "Todas as categorias", caminho: "" }]);
  });

  it("escolher Hardware tira os computadores e abre as subcategorias", () => {
    const f = lerFiltros({ cat: "Hardware" });
    expect(aplicarFiltros(resultado, f).map((x) => x.id)).toEqual(["m1", "m2", "m3", "mb1"]);
    const facetas = montarFacetas(resultado, f);
    expect(facetas.categorias.map((c) => [c.nome, c.total])).toEqual([["Memória RAM", 3], ["Placas-mãe", 1]]);
    expect(facetas.trilha.map((t) => t.nome)).toEqual(["Todas as categorias", "Hardware"]);
  });

  it("escolher Memória RAM chega só nas memórias", () => {
    const f = lerFiltros({ cat: "Hardware/Memória RAM" });
    expect(aplicarFiltros(resultado, f).map((x) => x.id)).toEqual(["m1", "m2", "m3"]);
    expect(montarFacetas(resultado, f).trilha.map((t) => t.caminho)).toEqual(["", "Hardware", "Hardware/Memória RAM"]);
  });

  it("categoria casa sem depender de acento ou caixa", () => {
    expect(aplicarFiltros(resultado, lerFiltros({ cat: "hardware/memoria ram" }))).toHaveLength(3);
    // "Hardware" não pode casar com um departamento que só começa igual.
    const extra = [...resultado, p("x", "Kit", "Hardware Usado/Kits", "10,00")];
    expect(aplicarFiltros(extra, lerFiltros({ cat: "Hardware" }))).toHaveLength(4);
  });

  it("marca junta grafias diferentes e não some quando já está marcada", () => {
    const f = lerFiltros({ cat: "Hardware/Memória RAM", marca: "Kingston" });
    expect(aplicarFiltros(resultado, f).map((x) => x.id)).toEqual(["m1", "m3"]);
    expect(montarFacetas(resultado, f).marcas).toEqual([
      { nome: "Kingston", total: 2 },
      { nome: "Corsair", total: 1 },
    ]);
  });

  it("faixa de preço filtra e informa os limites do que sobrou", () => {
    const f = lerFiltros({ cat: "Hardware", min: "500", max: "700" });
    expect(aplicarFiltros(resultado, f).map((x) => x.id)).toEqual(["m1", "m2"]);
    expect(montarFacetas(resultado, f).faixa).toEqual({ min: 450, max: 1100 });
  });

  it("numa página de categoria, a raiz é fixa e a trilha começa nela", () => {
    const hardware = resultado.filter((x) => x.category.startsWith("Hardware"));
    const facetas = montarFacetas(hardware, lerFiltros({ cat: "Hardware/Memória RAM" }), "Hardware", "Hardware");
    expect(facetas.trilha).toEqual([
      { nome: "Hardware", caminho: "Hardware" },
      { nome: "Memória RAM", caminho: "Hardware/Memória RAM" },
    ]);
    expect(facetas.categorias.map((c) => c.nome)).toEqual(["DDR5", "Memória para Notebook"]);
  });

  it("a relevância põe a memória antes do computador que só TEM memória", () => {
    const termos = termosDaBusca("16GB ddr5");
    expect(termos).toEqual(["16gb", "ddr5"]);
    const ids = ordenar(resultado, "relevancia", termos).map((x) => x.id);
    // As peças (memórias e placa-mãe) vêm antes de qualquer máquina completa.
    expect(ids.slice(0, 4).sort()).toEqual(["m1", "m2", "m3", "mb1"]);
    expect(ids.slice(4).sort()).toEqual(["nb1", "pc1", "pc2"]);
    expect(pontuar(resultado[3], termos)).toBeGreaterThan(pontuar(resultado[0], termos));
  });

  it("quem busca a máquina continua vendo a máquina primeiro", () => {
    const ids = ordenar(resultado, "relevancia", termosDaBusca("pc gamer 16gb ddr5")).map((x) => x.id);
    expect(ids.slice(0, 2).sort()).toEqual(["pc1", "pc2"]);
  });

  it("ordena por preço quando pedido", () => {
    expect(ordenar(resultado, "menor")[0].id).toBe("m3");
    expect(ordenar(resultado, "maior")[0].id).toBe("pc2");
  });
});

describe("catalogo/filtros — busca pela cópia do catálogo", () => {
  it("acha 'memoria' sem acento, 'ddr5' e a marca", () => {
    const achados = (busca: string) => resultado.filter((x) => casaComTermos(x, termosDaBusca(busca))).map((x) => x.id);
    expect(achados("memoria")).toEqual(["m1", "m2", "m3"]);
    expect(achados("MEMÓRIA")).toEqual(["m1", "m2", "m3"]);
    expect(achados("ddr5")).toHaveLength(7);
    expect(achados("kingston ddr5")).toEqual(["m1", "m3"]);
    expect(achados("placas-mae")).toEqual(["mb1"]); // pela categoria
    expect(achados("geladeira")).toEqual([]);
    expect(casaComTermos(resultado[0], [])).toBe(false);
  });
});

describe("catalogo/Paginacao", () => {
  it("mostra a primeira, a última e a vizinhança da página atual", async () => {
    const { paginasVisiveis } = await import("@/components/catalogo/Paginacao");
    expect(paginasVisiveis(1, 3)).toEqual([1, 2, 3]);
    expect(paginasVisiveis(1, 39)).toEqual([1, 2, 3, "…", 39]);
    expect(paginasVisiveis(20, 109)).toEqual([1, "…", 18, 19, 20, 21, 22, "…", 109]);
    expect(paginasVisiveis(109, 109)).toEqual([1, "…", 107, 108, 109]);
  });
});

describe("filtro de pronta entrega", () => {
  const produtos = [
    { id: "a", name: "Cabo HDMI", price: "10,00", category: "Informática/Cabos", availability: "Pronta entrega" },
    { id: "b", name: "Cabo VGA", price: "20,00", category: "Informática/Cabos", availability: "Disponível" },
    { id: "c", name: "Mouse", price: "30,00", category: "Periféricos/Mouses", availability: "Pronta entrega" },
  ] as unknown as Parameters<typeof aplicarFiltros>[0];

  it("lê, conta e monta o endereço", () => {
    const f = lerFiltros({ pronta: "1" });
    expect(f.pronta).toBe(true);
    expect(lerFiltros({}).pronta).toBe(false);
    expect(contarFiltros(f)).toBe(1);
    expect(paraQuery(f)).toBe("pronta=1");
  });

  it("filtra e conta na faceta sem depender de si mesmo", () => {
    const f = lerFiltros({ pronta: "1", cat: "Informática" });
    expect(aplicarFiltros(produtos, f).map((p) => p.id)).toEqual(["a"]);
    expect(montarFacetas(produtos, lerFiltros({})).prontaEntrega).toBe(2);
    expect(montarFacetas(produtos, lerFiltros({ cat: "Periféricos" })).prontaEntrega).toBe(1);
  });
});
