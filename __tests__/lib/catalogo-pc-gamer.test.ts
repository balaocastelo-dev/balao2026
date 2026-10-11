import { describe, it, expect } from "vitest";
import { FILEIRAS, lerPc, montarFileiras, POR_FILEIRA, RAIZ_PC_GAMER } from "@/lib/catalogo/pc-gamer";
import catalogo from "@/data/catalogo-backup.json";
import type { Product } from "@/lib/utils";

// Os títulos são do catálogo da loja, copiados como estão.

const pc = (name: string, price = "5.000,00") => lerPc({ name, price, category: RAIZ_PC_GAMER });

describe("lerPc — placa de vídeo", () => {
  it.each([
    ["PC Gamer Ryzen 5 5600gt, 16gb Ddr4, SSD 480GB, 500w 80 Plus, PCgt11-e", "sem", null],
    ["PC Gamer Amd Ryzen 5 5600gt, 16gb Ram, Placa De Video Radeon Vega 7, SSD 480GB, Fonte 550w", "sem", null],
    ["PC GAMER DreamComputers AMD RYZEN 5 5600g, 16GB, VIDEO INTEGRADO VEGA 7, SSD M.2 480GB", "sem", null],
    ["Computador PC Gamer Tob Intel Core i5 SSD 240GB 8GB WINDOWS 10 Pro Trial", "sem", null],
    ["Computador Cpu PC Gamer I5 Ram 16gb Placa De Vídeo Gt 610 2gb SSD 240GB", "dedicada", 2],
    // GT 730 existe com 1, 2 e 4 GB: sem o número no título, vale a menor.
    ["PC Gamer I3, HD 500GB, 8GB, Placa De Vídeo GT730", "dedicada", 1],
    ["PC Gamer Hércules, Intel I3, GT 730 4GB 8GB, 500GB, Wi-Fi", "dedicada", 4],
    ["PC Gamer Bluepc Rush - Intel Core i5 16gb Ram Radeon Rx 550 4gb SSD 512gb - Pgbp-rus1000", "dedicada", 4],
    // "8GB Ddr4" é a memória do computador, não da RX 580.
    ["PC Gamer Amd Ryzen 5, Rx 580, 8GB Ddr4, SSD 240GB, 500w 80 Plus, C7zobx6z-e", "dedicada", 4],
    ["PC Gamer Bluepc Rush - Intel Core i5 16gb Ram Radeon Rx 580 8GB SSD 512gb - Pgbp-rus1001", "dedicada", 8],
    ["PC Gamer Hertz Intel Core i5 8500 3GHz, 8a Geração, 16GB 2666MHz, GTX 1660 6GB, SSD 480GB, 500W, Preto", "dedicada", 6],
    ["PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3060 12gb, SSD 480GB, Fonte 600w - Pg2e-0126fp", "dedicada", 12],
    ["PC Gamer | Workstation - Amd Ryzen 9 9950x3d, Geforce RTX 5080 16gb, 32gb Ddr5, SSD 2TB Nvme, Fonte 850w 80 Plus", "dedicada", 16],
    // Memória dita sem o modelo da placa.
    ["PC Gamer Completo Player, Intel Core i7, 16gb Ram, Placa De Vídeo Geforce 4gb, SSD 512gb, Fonte 500w", "dedicada", 4],
    ["Computador pc gamer Intel Core i7 4790 16GB SSD 480GB Placa de video GeForce GTX 4G", "dedicada", 4],
    ["PC Computador Gamer Amd Ryzen 7 5700 16gb Nvme 1TB Vga 8GB W11 1000w", "dedicada", 8],
    ["PC Gamer Completo i5 16gb 480GB Vídeo 4gb 550w Kit Gamer", "dedicada", 4],
    // Modelo sem o prefixo.
    ["PC Gamer Top Concórdia Processador i5 12400 16gb SSD 512gb Placa 3050 Fonte 600w", "dedicada", 6],
    // Tem placa, mas o título não deixa saber de quantos GB.
    ["PC Gamer Bluepc Force, Amd Ryzen 5, Radeon Rx, 16gb Ddr4, SSD 512gb, Fonte 500w - Pgbp-for138", "desconhecida", null],
    ["PC Gamer Amd Ryzen 5 5600gt, 16gb Ddr4, Placa De Vídeo Radeon, SSD 512gb Nvme M.2", "desconhecida", null],
  ])("%s", (nome, placa, vram) => {
    const lido = pc(nome);
    expect([lido.placa, lido.vramGb]).toEqual([placa, vram]);
  });
});

describe("lerPc — monitor", () => {
  it.each([
    ['PC Gamer Completo I3, 8GB, GT 730, HD 500GB, Monitor 19"', true],
    ["Computador Cpu Gamer I7 2ª 16g Ram SSD 480GB Placa De Video 4gb Tela 20", true],
    ["Computador Schneider Computer Intel I5 2a Geração, 8GB DDR3, SSD 240GB, HD 500GB, Windows 10 Pro + 19 Polegadas+ Kit Gamer", true],
    ['PC Gamer Completo I5 9º Gtx1050 Ram16gb Hd 1TB SSD 480GB 24"', true],
    ["PC Computador Gamer Completo | Intel i7 | 16gb | SSD 240GB | Monitor + Teclado + Mouse + Headset + Mouse Pad + Wi-fi", true],
    // "Completo" e kit de teclado e mouse não são monitor.
    ["PC Gamer Completo Ryzen 5 4600g, 16gb Ddr4, SSD 480GB, 400w 80 Plus", false],
    ["PC Gamer Tob, AMD Ryzen 5, 8GB, SSD 240GB, Windows 10 Pro Trial + Teclado/Mouse, Mouse Pad, Headset", false],
    ['PC Gamer Ryzen 7 5700x, RTX 5060 8GB, 16gb, SSD 2.5" 480GB', false],
  ])("%s", (nome, esperado) => {
    expect(pc(nome).comMonitor).toBe(esperado);
  });
});

describe("lerPc — linha do Ryzen", () => {
  it.each([
    ["PC Gamer Ludic By Bluepc - Amd Ryzen 5 5500, Geforce RTX 3060 12gb, 16gb Ddr4", 5],
    ["PC Gamer Completo Ryzen 5 4600g, 16gb Ddr4, SSD 480GB", 5],
    ["Computador Gamer Premium Ryzen 5500gt 16gb Ram SSD 512gb 500w", 5],
    ["PC Gamer Bluepc Frag, Amd Ryzen 7 5700x, Radeon Rx 580 8GB, B450, 16gb Ddr4", 7],
    ["Gamer 1 - Ryzen 5700g, SSD 480GB, 16gb + Wifi - Aquario Branco", 7],
    ["PC Gamer | Workstation - Amd Ryzen 7 9800x3d, Geforce RTX 5070 Ti 16gb, 64gb Ddr5", 7],
    ["Computador Pc Gamer Ryzen 9 3900x 32gb Ram 512gb Nvme Gabinete Aquario", 9],
    ["PC Gamer | Workstation - Amd Ryzen 9 9950x3d, Geforce RTX 5080 16gb, 32gb Ddr5", 9],
    ["PC Gamer Concórdia AMD Ryzen 3-3200G, RGB, 8GB DDR4, SSD 240GB, Linux", 3],
    ["PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3050 8GB, SSD 480GB", null],
    ["PC Workstation Intel I7 14700KF, RTX 5070 Ti, 64gb Ddr5, Nvme 2TB", null],
  ])("%s", (nome, esperado) => {
    expect(pc(nome).ryzen).toBe(esperado);
  });
});

describe("montarFileiras", () => {
  let n = 0;
  const produto = (name: string, price: string, extra: Partial<Product> = {}) =>
    ({ id: String(++n), name, price, category: RAIZ_PC_GAMER, image: "", slug: `p${n}`, ...extra }) as Product;

  const base = () => [
    produto("PC Gamer Ryzen 5 5600gt, 16gb Ddr4, SSD 480GB", "3.000,00"),
    produto("PC Gamer Hércules, Intel I3, GT 730 4GB 8GB, 500GB", "2.100,00"),
    produto("PC Gamer Hertz Intel Core i5 8500, 16GB, GTX 1660 6GB, SSD 480GB", "4.900,00"),
    produto("PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3050 8GB, SSD 480GB", "4.400,00"),
    produto("PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3060 12gb, SSD 480GB", "5.900,00"),
    produto('PC Gamer Completo I3, 8GB, GT 730 4GB, HD 500GB, Monitor 19"', "2.300,00"),
    produto("PC Gamer Amd Ryzen 5 5500, Geforce RTX 5060 8GB, 16gb Ddr4", "7.000,00"),
    produto("PC Gamer Amd Ryzen 7 5700x, Geforce RTX 5060 8GB, 16gb Ddr4", "8.000,00"),
    produto("PC Gamer Amd Ryzen 9 9900x3d, Geforce RTX 5070 12gb, 32gb Ddr5", "28.000,00"),
    produto("PC Gamer Intel Core Ultra 245kf, Geforce RTX 5080 16gb, 64gb Ddr5", "39.000,00"),
  ];

  it("põe cada máquina na fileira dela, na ordem pedida", () => {
    const { fileiras, total } = montarFileiras(base());
    expect(total).toBe(10);
    expect(fileiras.map((f) => f.id)).toEqual(FILEIRAS.map((f) => f.id));
    const nomes = Object.fromEntries(fileiras.map((f) => [f.id, f.produtos.map((p) => p.name)]));
    expect(nomes["entrada"]).toEqual(["PC Gamer Ryzen 5 5600gt, 16gb Ddr4, SSD 480GB"]);
    expect(nomes["ate-4gb"]).toEqual(["PC Gamer Hércules, Intel I3, GT 730 4GB 8GB, 500GB"]);
    expect(nomes["ate-6gb"]).toEqual(["PC Gamer Hertz Intel Core i5 8500, 16GB, GTX 1660 6GB, SSD 480GB"]);
    expect(nomes["8gb"][0]).toBe("PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3050 8GB, SSD 480GB");
    expect(nomes["12gb-ou-mais"][0]).toBe("PC Gamer Fps Intel Core i7, 16gb Ram, Geforce RTX 3060 12gb, SSD 480GB");
    expect(nomes["setups"]).toEqual(['PC Gamer Completo I3, 8GB, GT 730 4GB, HD 500GB, Monitor 19"']);
  });

  it("setup com monitor não entra nas fileiras por placa", () => {
    const { fileiras } = montarFileiras(base());
    for (const f of fileiras.slice(0, 5)) {
      for (const p of f.produtos) expect(lerPc(p).comMonitor, p.name).toBe(false);
    }
  });

  it("prefere produto que ainda não apareceu; só repete quando a fileira não tem outro", () => {
    // Ryzen 5: o 5600GT já está na entrada e o 5500 na de 8 GB. Sem outro
    // Ryzen 5 no catálogo, a fileira mostra os dois em vez de sumir.
    const pequena = montarFileiras(base()).fileiras.find((f) => f.id === "ryzen-5")!;
    expect(pequena.total).toBe(2);
    expect(pequena.produtos).toHaveLength(2);

    // Com um Ryzen 5 que não cabe na fileira de 8 GB (limite de 1), é ele que entra.
    const lista = [
      produto("PC Gamer Amd Ryzen 5 5500, Geforce RTX 5060 8GB, 16gb Ddr4", "7.000,00"),
      produto("PC Gamer Amd Ryzen 5 7600, Geforce RTX 5060 8GB, 16gb Ddr5", "9.000,00"),
    ];
    const ryzen5 = montarFileiras(lista, 1).fileiras.find((f) => f.id === "ryzen-5")!;
    expect(ryzen5.produtos.map((p) => p.price)).toEqual(["9.000,00"]);
  });

  it("PCs de elite: placa de 16 GB ou mais, do mais caro para o mais barato", () => {
    const lista = [
      produto("PC Gamer Intel Core i7, Geforce RTX 5080 16gb, 64gb Ddr5", "30.000,00"),
      produto("PC Gamer Intel Core i9, Geforce RTX 5090 32gb, 64gb Ddr5", "60.000,00"),
      produto("PC Gamer Intel Core i5, Geforce RTX 5070 Ti 16gb, 32gb Ddr5", "20.000,00"),
      produto("PC Gamer Intel Core i5, Geforce RTX 3060 12gb, 16gb Ddr4", "6.000,00"),
    ];
    const elite = montarFileiras(lista, 2).fileiras.find((f) => f.id === "elite")!;
    expect(elite.total).toBe(3);
    expect(elite.produtos.map((p) => p.price)).toEqual(["60.000,00", "30.000,00"]);
  });

  it("uma configuração de cada antes de repetir, e a fileira segue em ordem de preço", () => {
    const lista = [
      produto("PC Gamer A Intel Core i5 9400f, Radeon Rx 580 8GB, 16gb", "3.000,00"),
      produto("PC Gamer B Intel Core i5 9400f, Radeon Rx 580 8GB, 16gb", "3.100,00"),
      produto("PC Gamer C Intel Core i7 3770, Radeon Rx 580 8GB, 16gb", "3.200,00"),
    ];
    const cheia = montarFileiras(lista, 2).fileiras.find((f) => f.id === "8gb")!;
    expect(cheia.produtos.map((p) => p.price)).toEqual(["3.000,00", "3.200,00"]);
    const comSobra = montarFileiras(lista, 3).fileiras.find((f) => f.id === "8gb")!;
    expect(comSobra.produtos.map((p) => p.price)).toEqual(["3.000,00", "3.100,00", "3.200,00"]);
  });

  it("fica só com a categoria PC Gamer, disponível e com preço", () => {
    const { total } = montarFileiras([
      produto("PC Gamer Ryzen 5 5600g, 16gb", "3.000,00"),
      produto("Gabinete Gamer Rise Mode Glass 06X", "300,00", { category: "Hardware/Gabinetes" }),
      produto("Water Cooler Gamer 240mm RGB", "400,00", { category: "Hardware/Coolers/Water Cooler" }),
      produto("iMac Apple 24 M4", "15.000,00", { category: "Computadores/PC/Computador IMAC" }),
      produto("PC Gamer Ryzen 7 5700g, 16gb", "4.000,00", { availability: "Indisponível" }),
      produto("PC Gamer Ryzen 5 4600g, 16gb", ""),
    ]);
    expect(total).toBe(1);
  });

  it("aguenta lista vazia ou inválida", () => {
    expect(montarFileiras([])).toEqual({ fileiras: [], total: 0 });
    expect(montarFileiras(null as unknown as Product[])).toEqual({ fileiras: [], total: 0 });
  });
});

describe("catálogo de verdade (cópia guardada no repositório)", () => {
  const produtos = (catalogo as { produtos: Product[] }).produtos;
  const { fileiras, total } = montarFileiras(produtos);

  it("monta as dez fileiras, cheias", () => {
    expect(total).toBeGreaterThan(2000);
    expect(fileiras.map((f) => f.id)).toEqual(FILEIRAS.map((f) => f.id));
    for (const f of fileiras) expect(f.produtos.length, f.id).toBe(POR_FILEIRA);
  });

  it("todo card é da categoria PC Gamer", () => {
    for (const f of fileiras) {
      for (const p of f.produtos) expect(p.category.startsWith(RAIZ_PC_GAMER), `${f.id}: ${p.name}`).toBe(true);
    }
  });

  it("cada card atende ao critério da fileira em que está", () => {
    for (const f of fileiras) {
      const definicao = FILEIRAS.find((d) => d.id === f.id)!;
      for (const p of f.produtos) expect(definicao.entra(lerPc(p)), `${f.id}: ${p.name}`).toBe(true);
    }
  });

  it("nenhum produto aparece em duas fileiras", () => {
    const ids = fileiras.flatMap((f) => f.produtos.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
