import { describe, it, expect } from "vitest";
import { caminhoDeComputadores, geracaoDoProcessador, lerMaquina } from "@/lib/catalogo/maquinas";
import { aplicarFiltros, contarFiltros, lerFiltros, montarFacetas, paraQuery } from "@/lib/catalogo/filtros";
import type { Product } from "@/lib/utils";

const p = (id: string, name: string, category = "Computadores/PC/PC Gamer", price = "3.000,00"): Product => ({
  id, name, category, price, image: "", slug: id,
});

describe("catalogo/maquinas — geração do processador", () => {
  const casos: [string, string | null][] = [
    ["Intel Core i5 12400F", "Intel 12ª geração"],
    ["Intel Core i5 6500", "Intel 6ª geração"],
    ["Intel Core i7 4790", "Intel 4ª geração"],
    ["Intel Core i3 10100F", "Intel 10ª geração"],
    ["Intel Core i7 14700KF", "Intel 14ª geração"],
    ["Intel Core i7 de 4ª geração", "Intel 4ª geração"],
    ["Intel Core Ultra 7 265K", "Intel Core Ultra Série 2"],
    ["Intel Core 5 120U", "Intel Core Série 1"],
    ["AMD Ryzen 5 5600G", "AMD Ryzen 5000"],
    ["AMD Ryzen 7 9800X3D", "AMD Ryzen 9000"],
    ["AMD Ryzen 5 8400F", "AMD Ryzen 8000"],
    ["AMD Ryzen 3 3200G", "AMD Ryzen 3000"],
    ["AMD Ryzen AI 9 370", "AMD Ryzen AI 300"],
    ["Apple M4 Pro", "Apple M4"],
    ["Intel Core i5", null],
    ["AMD Ryzen 5", null],
    [null as unknown as string, null],
  ];
  for (const [processador, esperado] of casos) {
    it(`${processador} → ${esperado}`, () => {
      expect(geracaoDoProcessador(processador)?.rotulo ?? null).toBe(esperado);
    });
  }
});

describe("catalogo/maquinas — leitura do título", () => {
  it("lê geração e placa de um PC gamer", () => {
    const l = lerMaquina(p("a", "PC Gamer Ryzen 5 5600GT, RTX 4060 8GB, 16GB DDR4, SSD 480GB"));
    expect(l.geracao?.chave).toBe("ryzen-5000");
    expect(l.placa?.chave).toBe("rtx-4060");
    expect(l.placa?.rotulo).toBe("GeForce RTX 4060");
  });

  it("PC sem placa vira vídeo integrado", () => {
    const l = lerMaquina(p("b", "Computador TOB Intel Core i5 3470 8GB SSD 240GB", "Computadores/PC/Computador Desktop"));
    expect(l.geracao?.rotulo).toBe("Intel 3ª geração");
    expect(l.placa?.chave).toBe("integrado");
  });

  it("placa sem modelo não entra em nenhuma opção", () => {
    const l = lerMaquina(p("c", "PC Gamer Intel i5 10400F 16GB Placa de vídeo 4GB SSD 480GB"));
    expect(l.placa).toBeNull();
  });

  it("produto que não é computador não é lido", () => {
    const l = lerMaquina(p("d", "Placa de Vídeo RTX 4060 8GB Gigabyte", "Hardware/Placa de Vídeo"));
    expect(l).toEqual({ geracao: null, placa: null });
  });

  it("só mostra os blocos na parte de computadores", () => {
    expect(caminhoDeComputadores("Computadores")).toBe(true);
    expect(caminhoDeComputadores("Computadores/PC/PC Gamer")).toBe(true);
    expect(caminhoDeComputadores("Computadores/Notebooks")).toBe(true);
    expect(caminhoDeComputadores("Computadores/Monitores")).toBe(false);
    expect(caminhoDeComputadores("Hardware")).toBe(false);
    expect(caminhoDeComputadores("")).toBe(false);
  });
});

describe("catalogo/filtros — geração e placa", () => {
  const pcs = [
    p("1", "PC Gamer Intel Core i5 12400F, RTX 4060, 16GB"),
    p("2", "PC Gamer Intel Core i5 12400F, RTX 3050 6GB, 16GB"),
    p("3", "PC Gamer Ryzen 5 5600, RX 6600, 16GB"),
    p("4", "PC Gamer Ryzen 7 5700X, RTX 4060 Ti, 32GB"),
    p("5", "Computador Intel Core i7 4790 8GB SSD 240GB", "Computadores/PC/Computador Desktop"),
    p("6", "Monitor Gamer LG 27\" 180Hz", "Computadores/Monitores/Monitor Gamer"),
  ];

  it("lê, conta e devolve na URL", () => {
    const f = lerFiltros({ geracao: "intel-12,Ryzen-5000", placa: "rtx-4060" });
    expect(f.geracoes).toEqual(["intel-12", "ryzen-5000"]);
    expect(f.placas).toEqual(["rtx-4060"]);
    expect(contarFiltros(f)).toBe(3);
    expect(paraQuery(f)).toBe("geracao=intel-12%2Cryzen-5000&placa=rtx-4060");
  });

  it("filtra por geração e por placa", () => {
    expect(aplicarFiltros(pcs, lerFiltros({ geracao: "intel-12" })).map((x) => x.id)).toEqual(["1", "2"]);
    expect(aplicarFiltros(pcs, lerFiltros({ placa: "rtx-4060" })).map((x) => x.id)).toEqual(["1"]);
    expect(aplicarFiltros(pcs, lerFiltros({ geracao: "ryzen-5000", placa: "rtx-4060-ti,rx-6600" })).map((x) => x.id)).toEqual(["3", "4"]);
    expect(aplicarFiltros(pcs, lerFiltros({ placa: "integrado" })).map((x) => x.id)).toEqual(["5"]);
  });

  it("monta as opções com contagem, na ordem certa", () => {
    const fac = montarFacetas(pcs, lerFiltros({}), "Computadores", "Computadores");
    expect(fac.geracoes.map((g) => [g.rotulo, g.total])).toEqual([
      ["Intel 12ª geração", 2],
      ["Intel 4ª geração", 1],
      ["AMD Ryzen 5000", 2],
    ]);
    expect(fac.placas.map((g) => g.chave)).toEqual(["rtx-4060-ti", "rtx-4060", "rtx-3050", "rx-6600", "integrado"]);
  });

  it("a contagem de placas respeita a geração marcada (e vice-versa)", () => {
    const fac = montarFacetas(pcs, lerFiltros({ geracao: "intel-12" }), "Computadores", "Computadores");
    expect(fac.placas.map((g) => [g.chave, g.total])).toEqual([["rtx-4060", 1], ["rtx-3050", 1]]);
    // As outras gerações continuam na lista para a pessoa trocar.
    expect(fac.geracoes.length).toBe(3);
  });

  it("fora de computadores, os blocos não aparecem", () => {
    const fac = montarFacetas(pcs, lerFiltros({}), "Hardware", "Hardware");
    expect(fac.geracoes).toEqual([]);
    expect(fac.placas).toEqual([]);
  });
});

describe("catalogo/maquinas — geração da Intel escrita fora do lugar", () => {
  const casos: [string, string][] = [
    ["Computador TOB Slim Compacto 4ª Geração Intel Core i3 SSD 120GB Memória 4GB", "intel-4"],
    ["Computador Intel I3,6º Geração, 16 GB, DDR 4, SSD240GB, Fonte 500w", "intel-6"],
    ["Computador PC i5 Sexta Geração 16 Gb Ddr4 SSD 240 Gb Fonte 500w", "intel-6"],
    ["Computador Intel i5 Geração 8 - 16gb SSD 480GB Gamer", "intel-8"],
    ["Computador Intel i7 Setima Geracao 16gb M.2 512gb Gamer 500w", "intel-7"],
    ["PC Gamer Intel I5, 6a Geração, 8GB DDR4, SSD 480GB", "intel-6"],
    ["Computador Gamer Brave Intel Core i5 6300hq Intel Hd Graphics 530 8GB Ddr4", "intel-6"],
  ];
  for (const [nome, chave] of casos) {
    it(nome.slice(0, 50), () => {
      expect(lerMaquina(p(nome, nome, "Computadores/PC/Computador Desktop")).geracao?.chave).toBe(chave);
    });
  }

  it("i5 com 8GB de RAM não vira 8ª geração", () => {
    expect(lerMaquina(p("x", "PC Gamer Intel Core i5, 8GB RAM, SSD 240GB")).geracao).toBeNull();
  });
});

describe("catalogo/maquinas — mais títulos do catálogo", () => {
  const casos: [string, string | null][] = [
    ["Computador PC i5 Sexta Geração 16 Gb Ddr4 SSD 240 Gb Fonte 500w", "intel-6"],
    ["PC Completo Ghost i7 4th 16gb SSD 512gb Monitor 19\"", "intel-4"],
    ["Notebook Acer AG15-71P-71YM CI713620H, 16GB, 512GB SSD", "intel-13"],
    ["PC Gamer KaBuM! 5500F, Radeon RX 580, 16GB DDR4, SSD 480G", "ryzen-5000"],
    ["Computador PC Gamer 5 2400g 16gb Ram Nvme 512gb Monitor 23\"", "ryzen-2000"],
    ["Computador Gamer Completo Aires, GT 730 4GB, 8GB, Hd 500GB, Wi-fi", null],
  ];
  for (const [nome, chave] of casos) {
    it(nome.slice(0, 50), () => {
      const categoria = nome.startsWith("Notebook") ? "Computadores/Notebooks/Notebook Acer" : "Computadores/PC/PC Gamer";
      expect(lerMaquina(p(nome, nome, categoria)).geracao?.chave ?? null).toBe(chave);
    });
  }
});
