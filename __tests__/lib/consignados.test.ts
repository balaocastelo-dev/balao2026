import { afterEach, describe, expect, it, vi } from "vitest";
import {
  BASE_PADRAO_DO_MEU_BLING,
  baseDoMeuBling,
  buscarConsignado,
  formatarPreco,
  linkDoWhatsAppDoConsignado,
  listarConsignados,
  normalizarItem,
  numeroDoSlug,
  ordenarConsignados,
  type ItemConsignado,
} from "@/lib/consignados";

const item = (extra: Partial<ItemConsignado> = {}): ItemConsignado => ({
  numero: 12,
  slug: "macbook-air-m1-8gb-c12",
  titulo: "MacBook Air M1 8GB",
  tipo: "NOTEBOOK",
  marca: "Apple",
  modelo: "Air M1",
  estado: "Ótimo, sem marcas",
  acessorios: "Carregador original",
  detalhes: "Bateria 92%\nTeclado perfeito",
  preco: 3499.9,
  codigo: "CONS-12",
  destaque: false,
  novidade: true,
  desde: "2026-10-27T12:00:00.000Z",
  fotos: ["https://exemplo.com/1.jpg"],
  garantia: "3 meses de garantia da loja",
  ...extra,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("numeroDoSlug", () => {
  it("lê o número do final -c<numero>", () => {
    expect(numeroDoSlug("macbook-air-m1-8gb-c12")).toBe(12);
    expect(numeroDoSlug("iphone-13-c7")).toBe(7);
    expect(numeroDoSlug("c3")).toBe(3);
  });
  it("recusa slug sem o final certo", () => {
    expect(numeroDoSlug("macbook-air-m1")).toBeNull();
    expect(numeroDoSlug("macbook-c12-air")).toBeNull();
    expect(numeroDoSlug("macbookc12")).toBeNull();
    expect(numeroDoSlug("notebook-c0")).toBeNull();
    expect(numeroDoSlug("")).toBeNull();
  });
});

describe("formatarPreco", () => {
  it("formata em reais no padrão brasileiro", () => {
    expect(formatarPreco(1234.56)).toBe("R$ 1.234,56");
    expect(formatarPreco(899)).toBe("R$ 899,00");
  });
});

describe("ordenarConsignados", () => {
  it("põe destaque primeiro e depois o mais novo", () => {
    const a = item({ numero: 1, desde: "2026-10-01T00:00:00Z" });
    const b = item({ numero: 2, desde: "2026-10-20T00:00:00Z" });
    const c = item({ numero: 3, desde: "2026-09-01T00:00:00Z", destaque: true });
    expect(ordenarConsignados([a, b, c]).map((i) => i.numero)).toEqual([3, 2, 1]);
  });
});

describe("normalizarItem", () => {
  it("descarta item sem preço ou título e fotos que não são https", () => {
    expect(normalizarItem({ ...item(), preco: 0 })).toBeNull();
    expect(normalizarItem({ ...item(), titulo: "" })).toBeNull();
    expect(normalizarItem({ ...item(), fotos: ["http://x/1.jpg", "https://x/2.jpg"] })?.fotos).toEqual(["https://x/2.jpg"]);
    expect(normalizarItem({ ...item(), tipo: "GELADEIRA" })?.tipo).toBe("OUTRO");
  });
});

describe("linkDoWhatsAppDoConsignado", () => {
  it("usa o número da loja e leva título, código e endereço", () => {
    const link = linkDoWhatsAppDoConsignado(item());
    expect(link.startsWith("https://wa.me/5519987510267?text=")).toBe(true);
    const texto = decodeURIComponent(link.split("text=")[1]);
    expect(texto).toContain("MacBook Air M1 8GB");
    expect(texto).toContain("CONS-12");
    expect(texto).toContain("https://www.balao.info/consignados/macbook-air-m1-8gb-c12");
  });
});

describe("baseDoMeuBling", () => {
  it("usa a VPS por padrão e aceita a variável de ambiente", () => {
    vi.stubEnv("MEU_BLING_URL_PUBLICA", "");
    expect(baseDoMeuBling()).toBe(BASE_PADRAO_DO_MEU_BLING);
    vi.stubEnv("MEU_BLING_URL_PUBLICA", "https://www.balao.info/sistema/");
    expect(baseDoMeuBling()).toBe("https://www.balao.info/sistema");
  });
});

describe("listarConsignados", () => {
  it("devolve [] quando o fetch falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fora do ar")));
    await expect(listarConsignados()).resolves.toEqual([]);
  });
  it("devolve [] quando a rota ainda não existe (404)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ erro: "Rota não encontrada" }), { status: 404 })));
    await expect(listarConsignados()).resolves.toEqual([]);
  });
  it("lê, filtra e ordena os itens", async () => {
    const dados = { data: [item({ numero: 1 }), { lixo: true }, item({ numero: 2, slug: "x-c2", destaque: true })] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(dados), { status: 200 })));
    const lista = await listarConsignados();
    expect(lista.map((i) => i.numero)).toEqual([2, 1]);
  });
});

describe("buscarConsignado", () => {
  it("404 vira 'vendido' e falha vira null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    await expect(buscarConsignado(12)).resolves.toBe("vendido");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("tempo esgotado")));
    await expect(buscarConsignado(12)).resolves.toBeNull();
  });
  it("devolve o item quando está à venda", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(item()), { status: 200 })));
    await expect(buscarConsignado(12)).resolves.toMatchObject({ numero: 12, codigo: "CONS-12" });
  });
});
