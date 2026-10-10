import { describe, it, expect } from "vitest";
import { lerRegra, margemDoProduto, margemPelaRegra, REGRA_TECHSUPRI, descreverRegra } from "@/lib/precos/margem";
import {
  categoriaDoTechsupri,
  disponivelNoKyte,
  marcaDoTechsupri,
  nomeDoTechsupri,
  paraItemTechsupri,
  precoDoKyte,
  produtoDaPaginaKyte,
} from "@/lib/precos/techsupri";
import { montarProduto, type RegrasDaFonte } from "@/lib/precos/produto";
import { semelhanca, modelosDoNome, termoDeBusca } from "@/lib/precos/fotos";

const m = (nome: string, preco: number, categoria = "Informática/Acessórios") =>
  margemPelaRegra(REGRA_TECHSUPRI, { nome, categoria, preco });

describe("margem escalonada", () => {
  it("barato leva a máxima, caro leva a mínima", () => {
    expect(m("Cabo USB-C 1m", 12)).toBe(150);
    expect(m("Cabo USB-C 1m", 20)).toBe(150);
    expect(m("Roteador AX3000", 400)).toBe(66);
    expect(m("Roteador AX3000", 900)).toBe(66);
  });

  it("cai em escala logarítmica entre os dois preços", () => {
    const a = m("Mouse", 40);
    const b = m("Mouse", 100);
    const c = m("Mouse", 200);
    expect(a).toBeLessThan(150);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(66);
    // Ponto médio geométrico (√(20·400) ≈ 89,4) fica no meio da faixa.
    expect(m("Mouse", Math.sqrt(20 * 400))).toBeCloseTo(108, 0);
  });

  it("notebook, cartucho, toner, tinta e celular ficam sempre na mínima", () => {
    expect(m("Cartucho HP 664 Preto", 30)).toBe(66);
    expect(m("Kit Cartucho HP 667", 25)).toBe(66);
    expect(m("Toner Compatível CF258A", 15)).toBe(66);
    expect(m("Tinta Epson T544 Ciano", 40)).toBe(66);
    expect(m("Smartphone Xiaomi Redmi 14C", 900)).toBe(66);
    expect(m("Qualquer coisa", 10, "Impressão/Toners")).toBe(66);
    expect(m("Qualquer coisa", 10, "Celular & Smartphone/Smartphones")).toBe(66);
  });

  it("acessório de notebook ou celular segue como acessório", () => {
    expect(m("Fonte para Notebook Dell 65W", 30, "Energia/Fontes para Notebook")).toBeGreaterThan(120);
    expect(m("Capa para Celular", 15, "Celular & Smartphone/Acessórios para Smartphones")).toBe(150);
    expect(m("Relógio Amazfit", 300, "Celular & Smartphone/Wearables")).toBeGreaterThan(66);
  });

  it("fonte sem regra usa a margem única", () => {
    expect(margemDoProduto({ margem: 33 }, { nome: "x", categoria: "y", preco: 10 })).toBe(33);
    expect(margemDoProduto({ margem: 33, regra_margem: REGRA_TECHSUPRI }, { nome: "Cabo", categoria: "", preco: 10 })).toBe(150);
  });

  it("lê a regra gravada como texto e recusa lixo", () => {
    expect(lerRegra(JSON.stringify(REGRA_TECHSUPRI))).toEqual(REGRA_TECHSUPRI);
    expect(lerRegra("não é json")).toBeNull();
    expect(lerRegra({ tipo: "outra" })).toBeNull();
    expect(descreverRegra(REGRA_TECHSUPRI)).toContain("150%");
  });
});

describe("TechSupri", () => {
  it("preço: promoção vigente vence, custo nunca entra", () => {
    expect(precoDoKyte({ salePrice: 100, salePromotionalPrice: 80 })).toBe(80);
    expect(precoDoKyte({ salePrice: 100, salePromotionalPrice: 0 })).toBe(100);
    expect(precoDoKyte({ salePrice: 100, salePromotionalPrice: 120 })).toBe(100);
    expect(precoDoKyte({ salePrice: null })).toBe(0);
  });

  it("disponibilidade", () => {
    expect(disponivelNoKyte({ id: "1", name: "a" })).toBe(true);
    expect(disponivelNoKyte({ id: "1", name: "a", active: false })).toBe(false);
    expect(disponivelNoKyte({ id: "1", name: "a", showOnCatalog: false })).toBe(false);
    expect(disponivelNoKyte({ id: "1", name: "a", stockActive: true, stock: { current: 0 } })).toBe(false);
    expect(disponivelNoKyte({ id: "1", name: "a", stockActive: true, stock: { current: 3 } })).toBe(true);
    expect(disponivelNoKyte({ id: "1", name: "a", stockActive: false, stock: { current: 0 } })).toBe(true);
    expect(disponivelNoKyte({ id: "1", name: "a", stockStatus: "OUT_OF_STOCK" })).toBe(false);
  });

  it("categoria pelo nome, depois pela categoria da Kyte", () => {
    expect(categoriaDoTechsupri("Toner Compatível HP CF258A", "Toner HP Compatível")).toBe("Impressão/Toners");
    expect(categoriaDoTechsupri("Cartucho HP 664 Preto Original", "Cartucho HP Original")).toBe("Impressão/Cartuchos");
    expect(categoriaDoTechsupri("Garrafa de Tinta Epson T544", "Tinta Epson Original")).toBe("Impressão/Tintas");
    expect(categoriaDoTechsupri("Roteador TP Link AX1500 AX12", "TP-Link")).toBe("Conectividade/Dispositivo de Rede");
    expect(categoriaDoTechsupri("Fone de Ouvido JBL Tune 520BT", "JBL")).toBe("Áudio/Fone de Ouvido");
    expect(categoriaDoTechsupri("Caixa de Som JBL Flip 6", "JBL")).toBe("Áudio/Caixa de Som");
    expect(categoriaDoTechsupri("Headset Gamer Onikuma K10", "Onikuma")).toBe("Áudio/Headset");
    expect(categoriaDoTechsupri("Controle DualSense PS5", "Acessório PlayStation")).toBe("Games/Playstation");
    expect(categoriaDoTechsupri("Pen Drive Sandisk 64GB", "Sandisk")).toBe("Armazenamento/Pen Drive");
    expect(categoriaDoTechsupri("Pilha Alcalina AA Duracell", "Pilhas/Bateria")).toBe("Energia/Pilhas e Baterias");
    expect(categoriaDoTechsupri("Fonte para Notebook Dell 19V", "Fonte Notebook")).toBe("Energia/Fontes para Notebook");
    expect(categoriaDoTechsupri("Mouse sem fio Logitech M170", "Logitech")).toBe("Periféricos/Mouses");
    expect(categoriaDoTechsupri("Echo Dot 5ª geração", "Amazon")).toBe("Áudio/Assistente Virtual");
    expect(categoriaDoTechsupri("Produto misterioso", "Jogos")).toBe("Games/Jogos");
    expect(categoriaDoTechsupri("Produto misterioso", null)).toBe("Informática/Acessórios");
  });

  it("marca e nome", () => {
    expect(marcaDoTechsupri("Roteador TP-Link AX1500")).toBe("TP-Link");
    expect(marcaDoTechsupri("ROTEADOR TP LINK AX12")).toBeNull();
    expect(marcaDoTechsupri("Fone JBL Tune")).toBe("JBL");
    expect(nomeDoTechsupri("FONE BLUETOOTH JBL TUNE 520BT")).toBe("Fone Bluetooth JBL Tune 520BT");
    expect(nomeDoTechsupri("Roteador TP Link AX12")).toBe("Roteador TP Link AX12");
  });

  it("item: id com prefixo, sem foto da Kyte, pronta entrega no produto", () => {
    const item = paraItemTechsupri({
      id: "1731590851913-X5mQX",
      name: "Cabo HDMI 2m",
      salePrice: 15,
      foto: "https://images-cdn.kyte.site/x.jpg",
      fotos: ["https://images-cdn.kyte.site/x.jpg", "https://images.kabum.com.br/p/1.jpg"],
    })!;
    expect(item.codigo).toBe("ts-1731590851913-X5mQX");
    expect(item.foto).toBe("https://images.kabum.com.br/p/1.jpg");
    expect(item.fotos).toEqual(["https://images.kabum.com.br/p/1.jpg"]);
    expect(item.categoria).toBe("Informática/Cabos e Adaptadores");

    const fonte: RegrasDaFonte = {
      id: "ts", nome: "TechSupri", so_loja: true, margem: 66, preco_min: null, preco_max: null, trilha: null,
      categoria_destino: null, regra_margem: REGRA_TECHSUPRI, fornecedor: "TechSupri", pronta_entrega: true,
    };
    const p = montarProduto(item, fonte);
    expect(p.availability).toBe("Pronta entrega");
    expect(p.supplier).toBe("TechSupri");
    expect(p.venda.pix).toBe(37.5); // 15 + 150%
    expect(p.category).toBe("Informática/Cabos e Adaptadores");
  });

  it("tira o produto do payload RSC da página da Kyte", () => {
    const produto = { _id: "1-X", id: "1-X", name: 'Roteador "AX12"', salePrice: 180, category: { name: "TP-Link" } };
    const pedaco = `1c:["$","$L1c",null,{"product":${JSON.stringify(produto)}}]`;
    const html = `<script>self.__next_f.push([1,${JSON.stringify(pedaco)}])</script>`;
    expect(produtoDaPaginaKyte(html)).toEqual(produto);
    expect(produtoDaPaginaKyte("<html></html>")).toBeNull();
  });
});


describe("foto pela KaBuM!", () => {
  it("modelo precisa bater", () => {
    expect(modelosDoNome("Roteador TP Link AX1500 AX12")).toEqual(["ax1500", "ax12"]);
    expect(semelhanca("Roteador TP Link AX1500 AX12", "Roteador Tp-Link Gigabit Ex141, Wi-Fi 6, Dual Band - AX1500")).toBe(0);
    expect(semelhanca("Cartucho HP 664 Preto", "Cartucho De Tinta Hp 664 F6v29ab Preto")).toBeGreaterThan(0.55);
    expect(semelhanca("Caixa de Som JBL Flip 6", "Caixa De Som JBL Flip 5, Bluetooth")).toBe(0);
  });

  it("cor, kit e acessório no lugar do produto são recusados", () => {
    expect(semelhanca("Mouse Sem Fio Logitech M170 Vermelho", "Mouse Wireless Logitech M170 Preto")).toBe(0);
    expect(semelhanca("Cartucho Compatível HP 933XL Azul", "Cartucho HP 933XL Ciano")).toBeGreaterThan(0);
    expect(semelhanca("Pilha Recarregável AA C/4 Mox", "Carregador Com 4 Pilha Recarregável 2600mah Aa Mox")).toBe(0);
    expect(semelhanca("Kit Cartucho HP 667", "Kit Cartucho HP 667 Preto e Colorido")).toBeGreaterThan(0);
  });

  it("sem modelo, quase todo o nome precisa aparecer", () => {
    expect(semelhanca("Pen Drive Sandisk 64GB Cruzer Blade", "Pen Drive Sandisk 64gb Usb C/lightning")).toBe(0);
    expect(semelhanca("Pen Drive Sandisk 64GB Cruzer Blade", "Pen Drive 64gb Sandisk Cruzer Blade Z50")).toBeGreaterThan(0.55);
  });

  it("termo de busca", () => {
    expect(termoDeBusca("Caixa de Som JBL Flip 6")).toBe("caixa-som-jbl-flip-6");
  });
});

describe("foto: com fio x sem fio", () => {
  it("não troca um pelo outro", () => {
    expect(semelhanca("Controle Ps2 7&Z Com Fio", "Controle Ps2 Joystick Sem Fio Analógico")).toBe(0);
    expect(semelhanca("Headset com fio Logitech H390", "Headset Logitech H390, USB")).toBeGreaterThan(0);
  });
});
