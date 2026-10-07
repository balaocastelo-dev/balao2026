import { describe, it, expect } from "vitest";
import {
  aplicarMargem,
  calcularVenda,
  decidirPreco,
  lerParcelas,
  normalizarMargem,
  quedaSuspeita,
} from "@/lib/precos/calculo";
import { interpretarLinkKabum, interpretarPagina, montarUrlDaCategoria, precosDaKabum } from "@/lib/precos/kabum";
import { categoriaNoSite, montarProduto, motivoDeRecusa, nomeSemMontadora, slugDoProduto, type RegrasDaFonte } from "@/lib/precos/produto";
import type { ItemDeOrigem } from "@/lib/precos/kabum";

const fonte = (extra: Partial<RegrasDaFonte> = {}): RegrasDaFonte => ({
  id: "f1",
  nome: "Hardware",
  so_loja: true,
  margem: 33,
  preco_min: null,
  preco_max: null,
  trilha: "Hardware",
  categoria_destino: null,
  ...extra,
});

const item = (extra: Partial<ItemDeOrigem> = {}): ItemDeOrigem => ({
  codigo: "996572",
  nome: "Placa de Vídeo Husky Alpha RTX 3060, 12GB",
  marca: "Husky",
  categoria: "Hardware/Placa de vídeo (VGA)/Placa de vídeo Nvidia",
  vendedor: "KaBuM!",
  marketplace: false,
  openbox: false,
  preVenda: false,
  disponivel: true,
  pix: 2099.99,
  cartao: 2470.58,
  parcelas: 10,
  oferta: "ESQUENTA",
  url: "https://www.kabum.com.br/produto/996572/placa",
  foto: "https://images.kabum.com.br/produtos/fotos/996572/a.jpg",
  fotos: ["https://images.kabum.com.br/produtos/fotos/996572/a.jpg"],
  garantia: "1 ano",
  ...extra,
});

describe("precos/calculo", () => {
  it("aplica a margem nos dois preços, cada um sobre o seu", () => {
    const venda = calcularVenda({ pix: 2099.99, cartao: 2470.58, parcelas: 10 }, 33);
    expect(venda.pix).toBe(2792.99);
    expect(venda.cartao).toBe(3285.87);
    expect(venda.price).toBe("2.792,99");
    expect(venda.price_card).toBe("R$ 3.285,87");
    expect(venda.installment).toBe("10x de R$ 328,59");
    expect(venda.discount_pix).toBe("15%");
  });

  it("mudar a margem de 33 para 40 muda o preço na mesma proporção", () => {
    expect(aplicarMargem(1000, 33)).toBe(1330);
    expect(aplicarMargem(1000, 40)).toBe(1400);
    expect(aplicarMargem(1000, 0)).toBe(1000);
  });

  it("nunca vende abaixo da fonte nem aceita margem absurda", () => {
    expect(normalizarMargem(-10)).toBe(0);
    expect(normalizarMargem("abc")).toBe(0);
    expect(normalizarMargem(9999)).toBe(500);
    expect(aplicarMargem(0, 33)).toBe(0);
  });

  it("sem preço de cartão na fonte, o cartão acompanha o à vista", () => {
    const venda = calcularVenda({ pix: 100, cartao: 0, parcelas: 0 }, 33);
    expect(venda.cartao).toBe(133);
    expect(venda.installment).toBe("10x de R$ 13,30");
    expect(venda.discount_pix).toBe("0%");
  });

  it("lê o número de parcelas do texto da fonte", () => {
    expect(lerParcelas("10x de R$ 247,05")).toBe(10);
    expect(lerParcelas("12 x sem juros")).toBe(12);
    expect(lerParcelas(null)).toBe(0);
  });

  it("segura queda de mais da metade, mas deixa passar oferta comum e alta", () => {
    expect(quedaSuspeita(1000, 499)).toBe(true);
    expect(quedaSuspeita(1000, 700)).toBe(false);
    expect(quedaSuspeita(1000, 2500)).toBe(false);
    expect(quedaSuspeita(0, 10)).toBe(false);
  });

  it("aceita sozinho a queda que se confirma por 24 horas", () => {
    const t0 = "2026-10-07T10:00:00.000Z";
    expect(decidirPreco(1000, 400, null, t0)).toEqual({ acao: "reter", desde: t0 });
    expect(decidirPreco(1000, 400, t0, "2026-10-07T20:00:00.000Z")).toEqual({ acao: "reter", desde: t0 });
    expect(decidirPreco(1000, 400, t0, "2026-10-08T10:00:00.000Z")).toEqual({ acao: "aplicar" });
    expect(decidirPreco(1000, 900, t0, "2026-10-07T11:00:00.000Z")).toEqual({ acao: "aplicar" });
  });
});

describe("precos/kabum", () => {
  it("tira só o caminho da categoria do link colado", () => {
    expect(interpretarLinkKabum("https://www.kabum.com.br/hardware/placa-de-video-vga?page_number=3&sort=price")).toEqual({
      caminho: "hardware/placa-de-video-vga",
      soLojaNoLink: false,
    });
    expect(interpretarLinkKabum("www.kabum.com.br/computadores/pc/pc-gamer/")?.caminho).toBe("computadores/pc/pc-gamer");
  });

  it("reconhece o filtro 'vendido pela KaBuM!' que veio no link", () => {
    const filtro = Buffer.from(JSON.stringify({ kabum_product: ["true"] })).toString("base64");
    expect(interpretarLinkKabum(`https://www.kabum.com.br/hardware?facet_filters=${encodeURIComponent(filtro)}`)?.soLojaNoLink).toBe(true);
  });

  it("recusa o que não é categoria da KaBuM!", () => {
    expect(interpretarLinkKabum("https://www.kabum.com.br/produto/996572/placa")).toBeNull();
    expect(interpretarLinkKabum("https://www.kabum.com.br/busca/rtx-4060")).toBeNull();
    expect(interpretarLinkKabum("https://www.terabyteshop.com.br/hardware")).toBeNull();
    expect(interpretarLinkKabum("https://kabum.com.br.evil.com/hardware")).toBeNull();
    expect(interpretarLinkKabum("")).toBeNull();
  });

  it("monta a URL sem ordenação (o robots.txt da fonte veda URLs ordenadas)", () => {
    const comFiltro = montarUrlDaCategoria("hardware", true, 2);
    expect(comFiltro).toContain("page_number=2");
    expect(comFiltro).toContain("facet_filters=");
    expect(comFiltro).not.toContain("sort=");
    expect(montarUrlDaCategoria("computadores/pc/pc-gamer", false, 1)).not.toContain("facet_filters");
  });

  it("com oferta vigente, vale o preço da oferta; vencida, o de tabela", () => {
    const p = {
      price: 3529.4,
      priceWithDiscount: 2999.99,
      offer: { name: "ESQUENTA", price: 2470.58, priceWithDiscount: 2099.99, startsAt: 100, endsAt: 200 },
    };
    expect(precosDaKabum(p, 150)).toEqual({ pix: 2099.99, cartao: 2470.58, oferta: "ESQUENTA" });
    expect(precosDaKabum(p, 250)).toEqual({ pix: 2999.99, cartao: 3529.4, oferta: null });
    expect(precosDaKabum({ price: 100, priceWithDiscount: 90, offer: null }, 150)).toEqual({ pix: 90, cartao: 100, oferta: null });
  });

  it("lê os produtos de dentro da página", () => {
    const dados = {
      props: {
        pageProps: {
          data: JSON.stringify({
            catalogServer: {
              meta: { totalPagesCount: 4, totalItemsCount: 79, breadcrumb: [{ name: "Hardware" }, { name: "Placa de vídeo (VGA)" }] },
              data: [
                {
                  code: 996572,
                  name: " Placa X ",
                  friendlyName: "placa-x",
                  sellerName: "KaBuM!",
                  category: "Hardware/Placa de vídeo (VGA)",
                  manufacturer: { name: "Husky" },
                  image: "https://images.kabum.com.br/a.jpg",
                  images: ["https://images.kabum.com.br/a.jpg"],
                  price: 200,
                  priceWithDiscount: 170,
                  maxInstallment: "10x de R$ 20,00",
                  available: true,
                  flags: { isMarketplace: false, isOpenbox: false, isPreOrder: false },
                },
                { name: "sem código" },
              ],
            },
          }),
        },
      },
    };
    const html = `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(dados)}</script></html>`;
    const pagina = interpretarPagina(html, 0);
    expect(pagina?.totalDePaginas).toBe(4);
    expect(pagina?.anunciado).toBe(79);
    expect(pagina?.trilha).toBe("Hardware/Placa de vídeo (VGA)");
    expect(pagina?.itens).toHaveLength(1);
    expect(pagina?.itens[0]).toMatchObject({ codigo: "996572", nome: "Placa X", pix: 170, cartao: 200, parcelas: 10, marca: "Husky" });
    expect(interpretarPagina("<html>bloqueado</html>")).toBeNull();
  });
});

describe("precos/produto", () => {
  it("fonte 'só loja' recusa marketplace, openbox, pré-venda e indisponível", () => {
    expect(motivoDeRecusa(item(), fonte())).toBeNull();
    expect(motivoDeRecusa(item({ marketplace: true }), fonte())).toBe("marketplace");
    expect(motivoDeRecusa(item({ marketplace: true }), fonte({ so_loja: false }))).toBeNull();
    expect(motivoDeRecusa(item({ openbox: true }), fonte())).toBe("openbox");
    expect(motivoDeRecusa(item({ preVenda: true }), fonte())).toBe("pre_venda");
    expect(motivoDeRecusa(item({ disponivel: false }), fonte())).toBe("indisponivel");
    expect(motivoDeRecusa(item({ pix: 0 }), fonte())).toBe("sem_preco");
  });

  it("respeita a faixa de preço da fonte", () => {
    expect(motivoDeRecusa(item({ pix: 53793 }), fonte({ preco_max: 30000 }))).toBe("acima_da_faixa");
    expect(motivoDeRecusa(item({ pix: 10 }), fonte({ preco_min: 50 }))).toBe("abaixo_da_faixa");
  });

  it("mantém a categoria da fonte, ou troca a trilha pelo destino escolhido", () => {
    expect(categoriaNoSite(item(), fonte())).toBe("Hardware/Placa de vídeo (VGA)/Placa de vídeo Nvidia");
    const pc = item({ categoria: "Computadores/PC/PC Gamer/PC Gamer Completo" });
    const destino = fonte({ trilha: "Computadores/PC/PC Gamer", categoria_destino: "PC Gamer" });
    expect(categoriaNoSite(pc, destino)).toBe("PC Gamer/PC Gamer Completo");
    expect(categoriaNoSite(item({ categoria: "" }), fonte({ trilha: "Áudio" }))).toBe("Áudio");
  });

  it("tira a montadora do nome do PC de referência, sem mexer na configuração", () => {
    expect(nomeSemMontadora("PC Gamer Neologic AMD Ryzen 5 5600GT, 16GB RAM", "NEOLOGIC", "Loja X")).toBe(
      "PC Gamer AMD Ryzen 5 5600GT, 16GB RAM"
    );
    expect(nomeSemMontadora("PC Gamer Intel Core i7, RTX 5060 - Kalango Games", "Outros", "KALANGO GAMES")).toBe(
      "PC Gamer Intel Core i7, RTX 5060"
    );
    // "Intel" e "AMD" são peça, não montadora.
    expect(nomeSemMontadora("PC Gamer Intel Core i5", "Intel", null)).toBe("PC Gamer Intel Core i5");
  });

  it("monta o produto com os dois preços e guarda o preço de origem", () => {
    const p = montarProduto(item(), fonte());
    expect(p.id).toBe("996572");
    expect(p.venda.price).toBe("2.792,99");
    expect(p.venda.price_card).toBe("R$ 3.285,87");
    expect(p.origem_pix).toBe(2099.99);
    expect(p.origem_cartao).toBe(2470.58);
    expect(p.cost).toBe(2099.99);
    expect(p.supplier).toBe("KaBuM!");
    expect(p.brand).toBe("Husky");
    expect(p.slug).toBe(slugDoProduto(p.name, "996572"));
    expect(p.slug.endsWith("-996572")).toBe(true);
  });

  it("produto de referência não leva marca nem garantia de terceiro", () => {
    const p = montarProduto(
      item({ nome: "PC Gamer Neologic Ryzen 5", marca: "NEOLOGIC", vendedor: "2Eletro", marketplace: true }),
      fonte({ so_loja: false })
    );
    expect(p.name).toBe("PC Gamer Ryzen 5");
    expect(p.brand).toBeNull();
    expect(p.supplier).toBe("2Eletro");
    expect(p.specs).toEqual({});
  });
});
