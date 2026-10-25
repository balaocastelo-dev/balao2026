import { describe, it, expect } from "vitest";
import { SETUPS_ASSINADOS, montarPaginaAssinada, paginasAssinadas } from "@/lib/vitrine/assinadas";
import type { Product } from "@/lib/utils";

const pc = (price: string, extra: Partial<Product> = {}): Product => ({
  id: "pc1",
  name: "PC Gamer Completo Amd Ryzen 5 5500, Radeon Rx 6600 8GB, 16gb Ddr4, SSD 512gb Nvme, Monitor 23\"",
  price,
  image: "https://exemplo/foto.jpg",
  category: "Computadores/PC/PC Gamer/PC Gamer Completo",
  slug: "pc-1",
  ...extra,
});

describe("setups assinados da vitrine", () => {
  it("são cinco, com endereço único", () => {
    expect(SETUPS_ASSINADOS).toHaveLength(5);
    expect(new Set(SETUPS_ASSINADOS.map((s) => s.slug)).size).toBe(5);
  });

  it("leva o preço de agora do catálogo, não um preço gravado", () => {
    const pagina = montarPaginaAssinada(SETUPS_ASSINADOS[0], pc("7.348,50"));
    expect(pagina?.status).toBe("publicada");
    expect((pagina?.extras as any).price_text).toBe("R$ 7.348,50");
    expect((pagina?.extras as any).main_product).toMatchObject({ id: "pc1", product_url: "/product/pc-1" });
    expect(pagina?.images?.hero).toBe("https://exemplo/foto.jpg");
  });

  it("some da vitrine fora da faixa de R$ 5.000 a R$ 10.000 ou sem produto", () => {
    expect(montarPaginaAssinada(SETUPS_ASSINADOS[0], pc("10.500,00"))).toBeNull();
    expect(montarPaginaAssinada(SETUPS_ASSINADOS[0], pc("4.999,00"))).toBeNull();
    expect(montarPaginaAssinada(SETUPS_ASSINADOS[0], null)).toBeNull();
  });

  it("lista só os que o catálogo achou", async () => {
    const lista = await paginasAssinadas(async (id) => (id === SETUPS_ASSINADOS[2].produto ? pc("8.833,50") : null));
    expect(lista.map((p) => p.slug)).toEqual([SETUPS_ASSINADOS[2].slug]);
  });
});
