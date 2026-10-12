import { describe, it, expect } from "vitest";
import { lerMargensPorCategoria, margemDaCategoria, margemDoProduto, margemAutomatica, type RegraDeMargem } from "@/lib/precos/margem";
import { fotoDaKyte, identificarLink, paraItemKyte, type ProdutoCapturado } from "@/lib/precos/techsupri";
import { analisarMarca, LADO } from "@/lib/precos/marca-dagua";
import { montarProduto, type RegrasDaFonte } from "@/lib/precos/produto";
import { categoriaDoTechsupri } from "@/lib/precos/techsupri";

const ROBSON: RegraDeMargem = { tipo: "escalonada", minima: 100, maxima: 500, precoDaMaxima: 10, precoDaMinima: 200, fixasNaMinima: [] };

describe("margem por categoria", () => {
  it("lê o que vem do banco e descarta lixo", () => {
    expect(lerMargensPorCategoria('{"Áudio/Fone de Ouvido": 120, " Impressão / Toners ": "300", "x": null, "y": "abc"}')).toEqual({
      "Áudio/Fone de Ouvido": 120,
      "Impressão/Toners": 300,
    });
    expect(lerMargensPorCategoria("não é json")).toEqual({});
    expect(lerMargensPorCategoria({ "Cabos": 900 })).toEqual({ Cabos: 500 });
  });

  it("a categoria mais específica ganha; sem margem fixa, vale a automática", () => {
    const margens = { "Áudio": 80, "Áudio/Fone de Ouvido": 120 };
    expect(margemDaCategoria(margens, "Áudio/Fone de Ouvido")).toBe(120);
    expect(margemDaCategoria(margens, "Áudio/Caixa de Som")).toBe(80);
    expect(margemDaCategoria(margens, "Informática/Cabos")).toBeNull();
  });

  it("margem fixa da categoria vence a regra escalonada e a margem única", () => {
    const fonte = { margem: 66, regra_margem: ROBSON, margens_categoria: { "Impressão/Toners": 300 } };
    expect(margemDoProduto(fonte, { nome: "Toner X", categoria: "Impressão/Toners", preco: 50 })).toBe(300);
    expect(margemDoProduto(fonte, { nome: "Cabo", categoria: "Informática/Cabos", preco: 5 })).toBe(500);
    expect(margemAutomatica(fonte, { nome: "Toner X", categoria: "Impressão/Toners", preco: 50 })).toBeLessThan(300);
    expect(margemDoProduto({ margem: 66 }, { nome: "Mouse", categoria: "Periféricos", preco: 30 })).toBe(66);
  });

  it("Robson Atacado: 500% no barato, 100% no caro, caindo no meio", () => {
    const m = (preco: number) => margemDoProduto({ margem: 66, regra_margem: ROBSON }, { nome: "Fone", categoria: "Áudio", preco });
    expect(m(2)).toBe(500);
    expect(m(10)).toBe(500);
    expect(m(250)).toBe(100);
    expect(m(22)).toBeGreaterThan(300);
    expect(m(22)).toBeLessThan(450);
  });

  it("o produto é precificado pela categoria do site", () => {
    const fonte: RegrasDaFonte = {
      id: "f", nome: "Robson", so_loja: true, margem: 66, preco_min: null, preco_max: null, trilha: null, categoria_destino: null,
      pronta_entrega: true, fornecedor: "Robson", margens_categoria: { "Celular & Smartphone/Suportes": 200 },
    };
    const item = paraItemKyte(
      { id: "1785328313205-udkt2", name: "SUPORTE MOTO ALTOMEX C-251", salePrice: 12.5, category: { name: "SUPORTE MOTO" } },
      { prefixo: "ky-", vendedor: "Robson", urlDoCatalogo: "https://robsonatacadoogmailcom.catalog.kyte.site/", usarFotoDoFornecedor: true }
    )!;
    const p = montarProduto(item, fonte);
    expect(p.category).toBe("Celular & Smartphone/Suportes");
    expect(p.venda.price).toBe("37,50"); // 12,50 + 200%
    expect(p.availability).toBe("Pronta entrega");
    expect(p.supplier).toBe("Robson");
  });
});

describe("fornecedor pelo link", () => {
  it("reconhece KaBuM! e catálogos da Kyte", () => {
    expect(identificarLink("https://www.kabum.com.br/hardware/ssd")).toEqual({ plataforma: "kabum" });
    expect(identificarLink("https://robsonatacadoogmailcom.catalog.kyte.site/")).toEqual({
      plataforma: "kyte",
      host: "robsonatacadoogmailcom.catalog.kyte.site",
      url: "https://robsonatacadoogmailcom.catalog.kyte.site/",
      nomeSugerido: "Robsonatacadoo",
    });
    expect(identificarLink("techsupri.kyte.site/pt-BR")?.plataforma).toBe("kyte");
    expect(identificarLink("https://firebasestorage.kyte.site/x")).toBeNull();
    expect(identificarLink("https://www.mercadolivre.com.br")).toBeNull();
    expect(identificarLink("não é link")).toBeNull();
  });
});

describe("fotos do fornecedor", () => {
  it("monta o endereço público da foto e troca a miniatura pela grande", () => {
    expect(fotoDaKyte("/udkt2RMlKxMC5zlgv1DIjZkngtN2%2FWJQc4VvuQlcm6tKnZqR5Jw%3D%3D.jpg?alt=media")).toBe(
      "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/udkt2RMlKxMC5zlgv1DIjZkngtN2%2FWJQc4VvuQlcm6tKnZqR5Jw%3D%3D.jpg?alt=media"
    );
    expect(fotoDaKyte("https://firebasestorage.stagebeta.kyte.site/v0/b/kyte-7c484.appspot.com/o/abc%2Fthumb_280_x.jpg?alt=media")).toBe(
      "https://firebasestorage.googleapis.com/v0/b/kyte-7c484.appspot.com/o/abc%2Fx.jpg?alt=media"
    );
    expect(fotoDaKyte("https://outro.site/foto.jpg")).toBe("");
    expect(fotoDaKyte("javascript:alert(1)")).toBe("");
  });

  it("usa a foto do fornecedor só quando ela é limpa", () => {
    const p: ProdutoCapturado = {
      id: "1726683890808-udkt2", name: "ADAPTADOR BLUETOOTH IT-BLUE LE-805b", salePrice: 8.5,
      image: "/udkt2RMlKxMC5zlgv1DIjZkngtN2%2FWJQc.jpg?alt=media",
    };
    const base = { prefixo: "ky-", vendedor: "Robson", urlDoCatalogo: "https://robsonatacadoogmailcom.catalog.kyte.site/" };
    expect(paraItemKyte(p, { ...base, usarFotoDoFornecedor: true })!.foto).toContain("firebasestorage.googleapis.com");
    expect(paraItemKyte(p, { ...base, usarFotoDoFornecedor: false })!.foto).toBe("");
    expect(paraItemKyte(p, { ...base, usarFotoDoFornecedor: true })!.codigo).toBe("ky-1726683890808-udkt2");
  });

  it("marca d'água: pixels escuros no mesmo lugar em todas as fotos", () => {
    const branca = () => new Uint8Array(LADO * LADO).fill(255);
    const comProduto = (i: number) => {
      const im = branca();
      // produto em lugar e tom diferentes em cada foto
      for (let y = 10; y < 30; y++) for (let x = 5 + i; x < 25 + i; x++) im[y * LADO + x] = (i * 37) % 200;
      return im;
    };
    const limpas = Array.from({ length: 12 }, (_, i) => comProduto(i));
    expect(analisarMarca(limpas).temMarca).toBe(false);
    const carimbadas = limpas.map((im) => {
      const c = new Uint8Array(im);
      for (let y = 38; y < 46; y++) for (let x = 36; x < 46; x++) c[y * LADO + x] = 60; // logo no canto
      return c;
    });
    expect(analisarMarca(carimbadas).temMarca).toBe(true);
    expect(analisarMarca(carimbadas.slice(0, 3)).temMarca).toBe(false); // poucas fotos: não decide
  });
});

describe("categorias do Robson Atacado", () => {
  it("o começo do nome decide", () => {
    expect(categoriaDoTechsupri("CONTROLE TV SAMSUNG SMART LELONG LE-7259", "CONTROLE TV")).toBe("Eletrônicos/Controles Remotos");
    expect(categoriaDoTechsupri("CONTROLE PS4 SEM FIO", "CONTROLE")).toBe("Games/Playstation");
    expect(categoriaDoTechsupri("SUPORTE CARRO TOMATE MTG-270", "SUPORTE CARRO")).toBe("Celular & Smartphone/Suportes");
    expect(categoriaDoTechsupri("FONTE NOT DELL TIPO-C", "FONTE NOTEBOOK")).toBe("Energia/Fontes para Notebook");
    expect(categoriaDoTechsupri("CARREG PORTÁTIL TOMATE TK1001", "POWER BANK")).toBe("Celular & Smartphone/Carregadores e Power Banks");
    expect(categoriaDoTechsupri("TAPE CARRO LEHMOX LEY-1845A", "TAPE CARRO")).toBe("Automotivo/Som Automotivo");
    expect(categoriaDoTechsupri("FONTE TOMATE 12V/1AP MTT-121", "FONTE")).toBe("Energia/Fontes e Adaptadores");
    expect(categoriaDoTechsupri("Fonte Tipo-c Skaiky 25W SK-UR-90", "SKAIKY")).toBe("Celular & Smartphone/Carregadores e Power Banks");
    expect(categoriaDoTechsupri("Fonte X-box 360 1 Pino KP-W017", "DIVERSOS")).toBe("Games/Acessórios Gamer");
    expect(categoriaDoTechsupri("Pipoqueira Tomate MAZ-118A", "DIVERSOS")).toBe("Diversos/Casa e Cozinha");
  });
});
