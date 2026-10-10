import { describe, it, expect } from "vitest";
import { lerFicha, rotuloDeMemoria, rotuloDePlaca, tipoDeVitrine, tituloDaMaquina } from "@/lib/catalogo/ficha";
import { nivelDeIA } from "@/lib/catalogo/ia-local";
import { emReais, montarMaquina, montarVitrine, TOTAL_DESKTOPS } from "@/lib/catalogo/vitrine-premium";
import type { Product } from "@/lib/utils";

// Todos os títulos abaixo são títulos de verdade do catálogo da loja em
// 10/10/2026, copiados como estão (com a grafia do vendedor de origem).

const PC = "Computadores/PC/PC Gamer";
const ficha = (name: string, category = PC) => lerFicha({ name, category });

describe("ficha — processador", () => {
  it.each([
    ["PC Gamer | Workstation - Amd Ryzen 7 9800x3d, Geforce RTX 5070 Ti 16gb, 64gb Ddr5, SSD 2TB Nvme, Fonte 850w 80 Plus, Bluepc Pgbp-wo1054", "AMD Ryzen 7 9800X3D"],
    ["PC Workstation Intel I7 14700KF, RTX 5070 Ti, 64gb Ddr5, Nvme 2TB", "Intel Core i7 14700KF"],
    ["PC Gamer | Workstation - Intel Core Ultra 245kf, Geforce RTX 5080 16gb, 64gb Ddr5, SSD 2TB Nvme", "Intel Core Ultra 5 245KF"],
    ["PC Gamer The Eras, Intel i7-12700f, 32GB DDR4, RTX 5060 8GB, SSD 1TB M.2, 600W 80 Plus, Windows 11 - Nli85320", "Intel Core i7 12700F"],
    ["Cpu PC Gamer Intel i9 11ª 64gb Ram SSD 2TB RTX 4060 8GB - Gabinete X-frame Bg-050 Cinza", "Intel Core i9 de 11ª geração"],
    ["Computador Intel I9 Watercooler Custom RTX 4080 Super", "Intel Core i9"],
    ["PC Gamer Apex Series, Amd Ryzne 5 5600gt, Radeon Rx 580 8GB, 16gb Ddr4, SSD 1TB M.2, Preto Sas018", "AMD Ryzen 5 5600GT"],
    ["PC Gamer Bluepc Force, Amd Ryzen 5, Radeon Rx, 8GB Ddr4, SSD 256gb, Fonte 500w - Pgbp-for100", "AMD Ryzen 5"],
  ])("%s", (nome, esperado) => {
    expect(ficha(nome).processador).toBe(esperado);
  });

  it("não inventa processador quando o título não diz", () => {
    expect(ficha("Computador Gamer Narok").processador).toBeNull();
    expect(ficha("Computador PC Gamer 5 5600g 32gb Ram Nvme 2TB / Monitor 23\" Branco").processador).toBeNull();
  });

  it("lê chip Apple e notebook", () => {
    const mac = lerFicha({
      name: 'MacBook Pro Apple 16" Chip M5 Max, CPU 18 Núcleos, GPU 32 Núcleos, 36GB, SSD 2TB, Preto-Espacial - MGED4BZ/A',
      category: "Computadores/Notebooks/Macbook/Macbook Pro",
    });
    expect(mac.processador).toBe("Apple M5 Max");
    expect(mac.appleSilicon).toBe(true);
    expect(mac.placaDeVideo).toBeNull(); // "GPU 32 Núcleos" não é placa dedicada

    const note = lerFicha({
      name: 'Notebook Gamer Gigabyte AORUS MASTER 16, 16" OLED QHD 240Hz, Ultra 9 275HX, 32GB, 1TB SSD, NVIDIA RTX 5080, W11 Home - BYHC5USE64SH',
      category: "Computadores/Notebooks/Notebook Gigabyte",
    });
    expect(note.processador).toBe("Intel Core Ultra 9 275HX");
    expect(note.tipo).toBe("notebook");
  });
});

describe("ficha — placa de vídeo e VRAM", () => {
  it("usa o que o título diz quando a versão existe", () => {
    expect(ficha("PC Gamer Amd Ryzen 5 5500, RTX 3060 12gb, 16gb Ram, SSD Nvme 500gb, W11")).toMatchObject({
      placaDeVideo: "GeForce RTX 3060",
      vramGb: 12,
      memoriaGb: 16,
    });
    expect(ficha("PC Gamer Aquário Amd Ryzen 5 5600, B550m, RTX 5060 Ti 16gb, 32gb Ram, Nvme 2TB, W11").vramGb).toBe(16);
  });

  it("modelo com duas versões e título mudo fica com a menor", () => {
    // RTX 5060 Ti existe com 8 e 16 GB; sem o título dizer, não promete 16.
    expect(ficha("PC Gamer Aquário Intel i7 14700KF, RTX 5060 Ti, 64gb Ddr5, Nvme 2TB").vramGb).toBe(8);
    expect(ficha("PC Gamer Completo Ryzen 7 5700x, RTX 3060, 16gb Ddr4, SSD Nvme 1TB, 700w 80 Plus, PCalt02-e").vramGb).toBe(8);
  });

  it("modelo de versão única vem da tabela", () => {
    expect(ficha("PC Workstation Intel I7 14700KF, RTX 5070 Ti, 64gb Ddr5, Nvme 2TB").vramGb).toBe(16);
    expect(ficha("PC Gamer Amd Ryzen 7 9700x, RTX 5070, 32gb Ddr5, 2TB Nvme, W11").vramGb).toBe(12);
  });

  it("não aceita versão que não existe", () => {
    // Não existe RTX 2060 de 16 GB: o título do vendedor está errado.
    expect(ficha("PC Gamer I7, RTX 2060 16GB, 16GB DDR4, SSD 480GB").vramGb).toBe(6);
  });

  it("o número colado na placa não é a RAM — e o depois da vírgula não é VRAM", () => {
    expect(ficha("PC Gamer Ludic By Bluepc - Intel Core i5 12400f, Geforce RTX 5070 12gb Gddr7, 16gb Ddr4, SSD 1TB M.2 Nvme, Fonte 750w 80 Plus")).toMatchObject({
      vramGb: 12,
      memoriaGb: 16,
      tipoDeMemoria: "DDR4",
    });
    expect(ficha("PC Gamer Amorim I5 4ª GTX 1650, 8GB, SSD 480GB, com Monitor 27\" e Kit Gamer")).toMatchObject({
      vramGb: 4,
      memoriaGb: 8,
    });
  });

  it("placa de notebook tem menos memória que a de mesa com o mesmo nome", () => {
    const mesa = ficha("PC Gamer Amd Ryzen 7 9700x, RTX 5070, 32gb Ddr5, 2TB Nvme, W11");
    const note = lerFicha({
      name: 'Notebook Gamer Gigabyte Gaming A18, 18" QHD+ 165Hz, AMD Ryzen 7 260, 32GB, 1TB SSD, NVIDIA RTX 5070, W11 Home - 3WHK3USC64SH',
      category: "Computadores/Notebooks/Notebook Gigabyte",
    });
    expect([mesa.vramGb, note.vramGb]).toEqual([12, 8]);
  });

  it("placa integrada não vira placa de vídeo", () => {
    const f = ficha("PC Gamer Amd Ryzen 5 5600gt, 16gb Ram, Placa De Video Radeon Vega 7, SSD 960gb, Fonte 550w");
    expect([f.placaDeVideo, f.vramGb]).toEqual([null, null]);
  });
});

describe("ficha — memória e armazenamento", () => {
  it.each([
    ["Cpu PC Gamer Intel i9 11ª 64gb Ram SSD 2TB RTX 4060 8GB - Gabinete X-frame Bg-050 Cinza", 64, "SSD 2 TB"],
    ["PC GAMER RYZEN 7 5700X WATER COOLER 240MM 32GB SSD 1TB RTX 4060 8GB GABINETE GAMER", 32, "SSD 1 TB"],
    ["PC Gamer Intel I7 10° RTX 2060 Memória 16gb Ram SSD 960gb", 16, "SSD 960 GB"],
    ["PC Gamer Aura By Bluepc - Intel Core i5 14400f, B760, Geforce RTX 5060 Ti 16gb, 32gb Ddr5, SSD M.2 PCie 512gb, Fonte 650w 80 Plus - Pgbp-aur137", 32, "SSD NVMe 512 GB"],
    ["PC Gamer Ryzen 7 5700x, RTX 4060, 32gb RGB Ddr4, SSD Nvme 1TB, 750w 80 Plus, Full Black - Pz37wi3d-e", 32, "SSD NVMe 1 TB"],
    ["PC Gamer Intel i7 12700f| 32gb 3200mhz| (RTX 3050 8GB)| SSD 480GB| 500w 80 Plus| 3 Fans RGB, - Nli97067", 32, "SSD 480 GB"],
    ["Computador Gamer Completo Aires, GT 730 4GB, 8GB, Hd 500GB, Wi-fi", 8, "HD 500 GB"],
    ["PC Gamer Completo Maximus I5 Gtx 1650 Mem.8GB Hd1TB SSD120GB", 8, "SSD 120 GB"],
  ])("%s", (nome, ram, disco) => {
    const f = ficha(nome);
    expect([f.memoriaGb, f.armazenamento]).toEqual([ram, disco]);
  });

  it("número colado numa placa que não tem essa versão era a RAM", () => {
    // Não existe RTX 3050 de 16 GB.
    expect(ficha("PC Gamer Completo Intel I7 10ª RTX3050 16gb SSD 960gb")).toMatchObject({ vramGb: 6, memoriaGb: 16 });
  });

  it("memória unificada dos Apple", () => {
    const imac = lerFicha({
      name: 'iMac Apple Tela Retina 24" 4.5K, Chip M4, CPU 10 Núcelos, GPU 10 Núcleos, Neural Engine de 16 Núcleos, 24GB RAM, 512GB SSD, Verde - MD2Q4BZ/A',
      category: "Computadores/PC/Computador IMAC",
    });
    expect(imac).toMatchObject({ tipo: "imac", memoriaGb: 24, armazenamento: "SSD 512 GB" });
    expect(rotuloDeMemoria(imac)).toBe("24 GB unificada");
    expect(rotuloDePlaca(imac)).toBe("Integrada ao M4");
  });

  it("fica vazio quando o título não diz", () => {
    const f = ficha("Computador Intel I9 Watercooler Custom RTX 4080 Super");
    expect([f.memoriaGb, f.armazenamento]).toEqual([null, null]);
    expect(rotuloDeMemoria(f)).toBeNull();
  });
});

describe("ficha — nome de vitrine", () => {
  it("troca o título do vendedor pelo que a máquina é", () => {
    const produto = {
      name: "PC Gamer | Workstation - Amd Ryzen 7 9800x3d, Geforce RTX 5070 Ti 16gb, 64gb Ddr5, SSD 2TB Nvme, Fonte 850w 80 Plus, Bluepc Pgbp-wo1054",
      category: PC,
    };
    expect(tituloDaMaquina(produto)).toBe("Ryzen 7 9800X3D com RTX 5070 Ti");
    expect(tipoDeVitrine(produto)).toBe("Workstation");
    expect(rotuloDePlaca(lerFicha(produto))).toBe("GeForce RTX 5070 Ti, 16 GB");
    expect(rotuloDeMemoria(lerFicha(produto))).toBe("64 GB DDR5");
  });

  it("Apple, notebook e título sem peça nenhuma", () => {
    expect(
      tituloDaMaquina({
        name: 'MacBook Pro Apple 16" Chip M5 Max, CPU 18 Núcleos, GPU 32 Núcleos, 36GB, SSD 2TB, Prateado - MGE74BZ/A',
        category: "Computadores/Notebooks/Macbook/Macbook Pro",
      })
    ).toBe("MacBook Pro 16″ M5 Max");
    expect(
      tituloDaMaquina({
        name: 'Notebook Gamer MSI Thin A15 Amd Ryzen 7-7735hs, 16gb Ram, Ssd 512gb, 15.6" Ips Fhd 144hz, GeForce Rtx 4060, Win 11h, Cinza - 9s7-16rk11-279',
        category: "Computadores/Notebooks/Notebook Gamer/Notebook MSI",
      })
    ).toBe("MSI Thin A15");
    expect(tituloDaMaquina({ name: "Computador Gamer Narok", category: PC })).toBe("Computador Gamer Narok");
    expect(tipoDeVitrine({ name: 'PC Gamer Completo Ryzen 5 5600gt, 16gb, SSD 480GB, Monitor 27" 100hz', category: PC })).toBe("PC com monitor");
  });
});

describe("IA local — quem entra na categoria", () => {
  const nivel = (name: string, category = PC) => nivelDeIA(lerFicha({ name, category }));

  it("RTX com 16 GB e 32 GB de RAM ou mais", () => {
    expect(nivel("PC Gamer | Workstation - Amd Ryzen 9 9950x3d, Geforce RTX 5080 16gb, 32gb Ddr5, SSD 2TB Nvme")).toBe("vram-16");
    expect(nivel("PC Workstation Intel I7 14700KF, RTX 5070 Ti, 64gb Ddr5, Nvme 2TB")).toBe("vram-16");
  });

  it("RTX com 12 GB", () => {
    expect(nivel("PC Gamer Amd Ryzen 7 9700x, RTX 5070, 32gb Ddr5, 2TB Nvme, W11")).toBe("vram-12");
    expect(nivel("PC Gamer Ludic By Bluepc - Amd Ryzen 5 8400f, Geforce RTX 3060 12gb, 32gb Ddr5, SSD 512gb M.2 Nvme, 600w 80 Plus")).toBe("vram-12");
  });

  it("placa boa com pouca RAM fica de fora", () => {
    expect(nivel("PC Gamer | Workstation - Amd Ryzen 7 9800x3d, Geforce RTX 5080 16gb, 16gb Ddr5, SSD 2TB Nvme")).toBeNull();
  });

  it("muita RAM com placa pequena fica de fora", () => {
    expect(nivel("PC Gamer | Workstation - Amd Ryzen 9 9950x3d, Geforce RTX 5060 8GB, 64gb Ddr5, SSD 2TB Nvme")).toBeNull();
    // 5060 Ti sem dizer a versão: não dá para prometer 16 GB.
    expect(nivel("PC Gamer Aquário Intel i7 14700KF, RTX 5060 Ti, 64gb Ddr5, Nvme 2TB")).toBeNull();
  });

  it("Radeon e placa integrada não entram", () => {
    expect(nivel("PC Gamer Ryzen 5 8400f, Rx 9060 Xt 16gb, 32gb Ddr5, SSD Nvme 500gb, 600w 80 Plus")).toBeNull();
    expect(nivel("PC Workstation Intel I5 14600K, 64gb Ddr5, Nvme 2TB")).toBeNull();
  });

  it("Apple entra pela memória unificada", () => {
    const pro = 'MacBook Pro Apple 16" Chip M5 Max, CPU 18 Núcleos, GPU 32 Núcleos, 36GB, SSD 2TB, Prateado - MGE74BZ/A';
    const air = 'MacBook Pro de 14", M5, CPU de 10 núcleos, GPU de 10 núcleos, 16GB RAM, SSD 1TB, Prateado - MDE54BZ/A';
    expect(nivel(pro, "Computadores/Notebooks/Macbook/Macbook Pro")).toBe("apple");
    expect(nivel(air, "Computadores/Notebooks/Macbook/Macbook Pro")).toBeNull();
  });

  it("notebook com RTX 5080 (16 GB na versão de notebook) entra; com RTX 5070 (8 GB) não", () => {
    expect(
      nivel(
        'Notebook Gamer Gigabyte AORUS MASTER 16, 16" OLED QHD 240Hz, Ultra 9 275HX, 32GB, 1TB SSD, NVIDIA RTX 5080, W11 Home - BYHC5USE64SH',
        "Computadores/Notebooks/Notebook Gigabyte"
      )
    ).toBe("vram-16");
    expect(
      nivel(
        'Notebook Gamer Gigabyte Gaming A18, 18" QHD+ 165Hz, AMD Ryzen 7 260, 32GB, 1TB SSD, NVIDIA RTX 5070, W11 Home - 3WHK3USC64SH',
        "Computadores/Notebooks/Notebook Gigabyte"
      )
    ).toBeNull();
  });
});

describe("vitrine — seleção das páginas", () => {
  const produto = (id: string, name: string, price: string, category = PC, extra: Partial<Product> = {}): Product => ({
    id,
    name,
    price,
    category,
    image: `https://exemplo/${id}.jpg`,
    slug: `maquina-${id}`,
    ...extra,
  });

  const catalogo: Product[] = [
    produto("a", "PC Workstation Intel I7 14700KF, RTX 5070 Ti, 64gb Ddr5, Nvme 2TB", "39.366,94", PC, {
      price_card: "R$ 39.366,94",
      installment: "10x de R$ 3.936,69",
    }),
    produto("b", "PC Gamer Ryzen 5 5600gt, 16gb Ddr4, SSD 480GB, 500w 80 Plus", "5.692,00", PC, { price_card: "R$ 6.300,00" }),
    produto("c", "PC Gamer Amd Ryzen 7 9700x, RTX 5070, 32gb Ddr5, 2TB Nvme, W11", "32.317,67"),
    produto("d", 'MacBook Pro Apple 16" Chip M5 Max, CPU 18 Núcleos, GPU 32 Núcleos, 36GB, SSD 2TB', "55.859,00", "Computadores/Notebooks/Macbook/Macbook Pro"),
    produto("e", "Monitor Gamer LG UltraGear 27", "2.000,00", "Computadores/Monitores"),
    produto("f", "Memória RAM Kingston Fury 64GB DDR5", "45.000,00", "Hardware/Memória RAM"),
    produto("g", "PC Gamer sem preço, RTX 5080 16gb, 64gb Ddr5", "", PC),
    produto("h", "PC Gamer esgotado, RTX 5080 16gb, 64gb Ddr5", "60.000,00", PC, { availability: "Indisponível" }),
  ];

  it("desktops do mais caro para o mais barato, só computador, só com preço e disponível", () => {
    const v = montarVitrine(catalogo);
    expect(v.desktops.map((m) => m.id)).toEqual(["a", "c", "b"]);
    expect(v.notebooks.map((m) => m.id)).toEqual(["d"]);
    expect(v.totalDeComputadores).toBe(4);
  });

  it("IA local junta desktop e notebook que atendem ao critério", () => {
    const v = montarVitrine(catalogo);
    expect(v.iaLocal.map((m) => [m.id, m.nivelDeIA])).toEqual([
      ["d", "apple"],
      ["a", "vram-16"],
      ["c", "vram-12"],
    ]);
  });

  it("corta a lista de desktops no limite", () => {
    const muitos = Array.from({ length: TOTAL_DESKTOPS + 10 }, (_, i) =>
      produto(`m${i}`, `PC Gamer Ryzen 5 5600gt, 16gb Ddr4, SSD 480GB ${i}`, `${1000 + i},00`)
    );
    const v = montarVitrine(muitos);
    expect(v.desktops).toHaveLength(TOTAL_DESKTOPS);
    expect(v.desktops[0].valor).toBe(1000 + TOTAL_DESKTOPS + 9);
    expect(v.totalDeComputadores).toBe(TOTAL_DESKTOPS + 10);
  });

  it("o preço é o do catálogo, sem conta nenhuma", () => {
    const [a] = montarVitrine(catalogo).desktops;
    expect(a.valor).toBe(39366.94);
    expect(a.valorNoCartao).toBeNull(); // igual ao à vista: não repete
    expect(a.parcelas).toBe("10x de R$ 3.936,69");
    expect(emReais(a.valor).replace(/\s/g, " ")).toBe("R$ 39.366,94");

    const b = montarMaquina(catalogo[1])!;
    expect([b.valor, b.valorNoCartao]).toEqual([5692, 6300]);
    expect(b.href).toBe("/product/maquina-b");
  });
});
