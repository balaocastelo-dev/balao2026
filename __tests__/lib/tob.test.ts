import { describe, it, expect } from "vitest";
import {
  categoriaDaTob,
  identificarLinkTob,
  itensDaTob,
  lerCatalogoTob,
  marcaDaTob,
  precoDaTob,
  slugDoCaminho,
  type CatalogoTob,
} from "@/lib/precos/tob";
import { montarProduto, type RegrasDaFonte } from "@/lib/precos/produto";

const OPCOES = {
  prefixo: "tob-",
  vendedor: "TOB Distribuição",
  urlDoCatalogo: "https://catalogotob.tobdistribuicao.com.br/c/julianacambui",
  usarFotoDoFornecedor: true,
};

const CATALOGO: CatalogoTob = {
  rep: { slug: "julianacambui", margin_percent: 0, show_prices: true },
  categories: [
    { id: "c1", name: "Computadores" },
    { id: "c2", name: "Impressoras" },
    { id: "c3", name: "Teclados/Mouses" },
  ],
  products: [
    { id: "a1", sku: "10385", description: "Computador Completo TOB Intel Core i5 com SSD 120GB", base_price: 756.99, stock: 100, status: "active", category_id: "c1", photo: "https://images.tcdn.com.br/a.jpg" },
    { id: "a2", sku: "10385", description: "Computador Completo TOB Intel Core i5 com Monitor 19", base_price: 990, stock: 5, status: "active", category_id: "c1", photo: "https://images.tcdn.com.br/b.jpg" },
    { id: "a3", sku: "8750", description: "TINTA FORMULABS EPSON IMP 1L MAGENTA.", base_price: 40, stock: 3, status: "active", category_id: "c2" },
    { id: "a4", sku: "501", description: "Joystick USB Para Pc 7&amp;Z", base_price: 30, stock: 0, status: "active", category_id: "c3" },
    { id: "a5", sku: "777", description: "Mouse Gamer USB K-MEX M44J 2400 DPI", base_price: 19.9, stock: 1, status: "active", category_id: "c3", not_in_last_import: true },
  ],
};

describe("link da TOB", () => {
  it("reconhece o catálogo do representante, com ou sem categoria", () => {
    expect(identificarLinkTob("https://catalogotob.tobdistribuicao.com.br/c/julianacambui?cat=6a9581a4ee4b7fb9acca2afc")).toEqual({
      plataforma: "tob",
      host: "catalogotob.tobdistribuicao.com.br",
      slug: "julianacambui",
      url: "https://catalogotob.tobdistribuicao.com.br/c/julianacambui",
      caminho: "catalogotob.tobdistribuicao.com.br/c/julianacambui",
      nomeSugerido: "TOB Distribuição",
    });
    expect(identificarLinkTob("catalogotob.tobdistribuicao.com.br/c/julianacambui")?.slug).toBe("julianacambui");
    expect(identificarLinkTob("https://catalogotob.tobdistribuicao.com.br/")).toBeNull();
    expect(identificarLinkTob("https://outro.com.br/c/julianacambui")).toBeNull();
    expect(slugDoCaminho("catalogotob.tobdistribuicao.com.br/c/julianacambui")).toBe("julianacambui");
  });
});

describe("produtos da TOB", () => {
  it("preço do representante: base × margem dele (por produto, se houver)", () => {
    expect(precoDaTob({ id: "x", sku: "1", base_price: 100 }, { margin_percent: 0 })).toBe(100);
    expect(precoDaTob({ id: "x", sku: "1", base_price: 100 }, { margin_percent: 10 })).toBe(110);
    expect(precoDaTob({ id: "x", sku: "1", base_price: 100 }, { margin_percent: 10, product_margins: { "1": 20 } })).toBe(120);
    expect(precoDaTob({ id: "x", sku: "1", base_price: 0 }, null)).toBe(0);
  });

  it("vira item: sku no código, sku repetido não some, tinta compatível fica de fora", () => {
    const itens = itensDaTob(CATALOGO, OPCOES);
    expect(itens.map((i) => i.codigo)).toEqual(["tob-10385", "tob-10385-a2", "tob-501", "tob-777"]);
    const pc = itens[0];
    expect(pc).toMatchObject({ nome: "Computador Completo TOB Intel Core i5 com SSD 120GB", marca: "TOB", pix: 756.99, cartao: 756.99, disponivel: true });
    expect(pc.categoria).toBe("Computadores/PC/Computador Desktop");
    expect(pc.foto).toBe("https://images.tcdn.com.br/a.jpg");
    // sem estoque e fora da última importação do distribuidor: não está à venda
    expect(itens.find((i) => i.codigo === "tob-501")).toMatchObject({ nome: "Joystick USB Para Pc 7&Z", disponivel: false });
    expect(itens.find((i) => i.codigo === "tob-777")!.disponivel).toBe(false);
  });

  it("foto do fornecedor só quando é limpa", () => {
    expect(itensDaTob(CATALOGO, { ...OPCOES, usarFotoDoFornecedor: false })[0].foto).toBe("");
  });

  it("categorias da TOB no menu do site", () => {
    expect(categoriaDaTob("Computador PC Gamer Completo TOB Intel Core i5 SSD 240GB", "Computadores")).toBe("Computadores/PC/PC Gamer/PC Gamer Completo");
    expect(categoriaDaTob("Placa Mãe Gigabyte H610M K DDR4, Intel LGA 1700", "Placa-mãe")).toBe("Hardware/Placas-mãe/Placa-Mãe Intel");
    expect(categoriaDaTob("Placa Mãe DXMBB550GW M.2 AMD Ryzen AM4 DDR4", "Placa-mãe")).toBe("Hardware/Placas-mãe/Placa-Mãe AMD");
    expect(categoriaDaTob("Memoria DDR3 8GB 1600MHZ Best Memory", "Memória RAM")).toBe("Hardware/Memória RAM/DDR 3");
    expect(categoriaDaTob("Kit Teclado Gamer K-Mex KMM712 LED RGB + Mouse Gamer", "Teclados/Mouses")).toBe("Periféricos/Kit Teclado e Mouse");
    expect(categoriaDaTob("Water Cooler Kmex WACO 360MM Leds", "Cooler")).toBe("Hardware/Coolers/Water Cooler");
    expect(categoriaDaTob("Mochila para Notebook 15.6\" GT Basic", "Notebook")).toBe("Informática/Acessórios");
    expect(categoriaDaTob("Fonte Universal Notebook Knup KP-525 96W Preto", "Acessórios")).toBe("Energia/Fontes para Notebook");
    expect(categoriaDaTob("Nobreak Slim 600VA UPS E/S 120V 4T", "Energia")).toBe("Energia/Protetor Eletrônico/Nobreak");
    expect(categoriaDaTob("Leitor de Código de Barras USB Tob 210", "Automação/PDV")).toBe("Automação Comercial/Leitor de Código de Barras");
    expect(categoriaDaTob("Toner Compativel HP CF226X", "Impressoras")).toBe("Impressão/Toners");
    expect(categoriaDaTob("Qualquer coisa", "Categoria nova")).toBe("Informática/Acessórios");
  });

  it("marca pelo nome", () => {
    expect(marcaDaTob("Computador TOB Intel Core i7 10700f")).toBe("TOB");
    expect(marcaDaTob("Mouse Gamer USB K-MEX M44J")).toBe("K-Mex");
    expect(marcaDaTob("Toner Compativel HP CF226X")).toBeNull();
    expect(marcaDaTob("Cabo HDMI 5 Metros")).toBeNull();
  });

  it("entra com a faixa Pronta entrega e a margem da fonte por cima do preço do representante", () => {
    const fonte = {
      id: "f", nome: "TOB Distribuição", so_loja: true, margem: 66, preco_min: null, preco_max: null, trilha: null,
      categoria_destino: null, pronta_entrega: true, fornecedor: "TOB Distribuição", margens_categoria: { "Computadores/PC": 30 },
    } as RegrasDaFonte;
    const [pc] = itensDaTob(CATALOGO, OPCOES);
    const p = montarProduto(pc, fonte);
    expect(p.availability).toBe("Pronta entrega");
    expect(p.supplier).toBe("TOB Distribuição");
    expect(p.venda.price).toBe("984,09"); // 756,99 + 30% (margem da categoria)
  });
});

describe("leitura do catálogo", () => {
  it("chama a função do catálogo com o representante", async () => {
    let pedido: { url: string; corpo: string } | null = null;
    const buscar = (async (url: string, init: RequestInit) => {
      pedido = { url, corpo: String(init.body) };
      return new Response(JSON.stringify(CATALOGO), { status: 200, headers: { "content-type": "application/json" } });
    }) as unknown as typeof fetch;
    const r = await lerCatalogoTob("julianacambui", buscar);
    expect(r.ok).toBe(true);
    expect(pedido!.url).toBe("https://catalogotob.tobdistribuicao.com.br/api/apps/6a8cac9fe8865c46b84db6b6/functions/getCatalog");
    expect(JSON.parse(pedido!.corpo)).toEqual({ slug: "julianacambui" });
  });

  it("erro ou catálogo vazio não vira leitura boa (não apaga produto)", async () => {
    const com = (status: number, corpo: unknown) =>
      (async () => new Response(JSON.stringify(corpo), { status })) as unknown as typeof fetch;
    expect((await lerCatalogoTob("x", com(403, {}))).ok).toBe(false);
    expect((await lerCatalogoTob("x", com(200, { error: "not found" }))).ok).toBe(false);
    expect((await lerCatalogoTob("x", com(500, {}))).ok).toBe(false);
  });
});
