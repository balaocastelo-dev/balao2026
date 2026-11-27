import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ getProductsForSitemap: async () => [] }));
vi.mock("@/lib/catalogo-espelho", () => ({ lerCatalogoDoEspelho: async () => [] }));

import { lerProdutosDoSitemap, dataDoProduto, fatiarProdutos } from "@/lib/sitemap/produtos";
import { slugsAusentes } from "@/lib/sitemap/artigos";
import type { Product } from "@/lib/utils";

const prod = (id: string, slug: string, created_at?: string) =>
  ({ id, slug, created_at, name: id, price: "1", image: "", category: "" }) as Product;

describe("sitemap — produtos", () => {
  it("usa o banco quando ele responde", async () => {
    const lista = await lerProdutosDoSitemap(
      async () => [{ id: "1", slug: "a", created_at: "2026-10-16 10:00:00" }],
      async () => [prod("9", "da-copia")]
    );
    expect(lista.map((p) => p.slug)).toEqual(["a"]);
  });

  it("cai na cópia do catálogo quando o banco recusa a conexão", async () => {
    const lista = await lerProdutosDoSitemap(
      async () => {
        throw new Error("max_connections_per_hour");
      },
      async () => [prod("1", "a"), prod("2", "b")]
    );
    expect(lista.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("cai na cópia quando o banco devolve vazio (erro engolido)", async () => {
    const lista = await lerProdutosDoSitemap(async () => [], async () => [prod("1", "a")]);
    expect(lista).toHaveLength(1);
  });

  it("tira repetidos e itens sem endereço", async () => {
    const lista = await lerProdutosDoSitemap(
      async () => [],
      async () => [prod("1", "a"), prod("2", "a"), prod("3", ""), prod("", "x")]
    );
    expect(lista.map((p) => p.slug)).toEqual(["a"]);
  });

  it("não quebra se banco e cópia falharem", async () => {
    const lista = await lerProdutosDoSitemap(
      async () => Promise.reject(new Error("x")),
      async () => Promise.reject(new Error("y"))
    );
    expect(lista).toEqual([]);
  });

  it("não corta o catálogo em 5.000", async () => {
    const muitos = Array.from({ length: 5001 }, (_, i) => prod(String(i + 1), `p-${i}`));
    const lista = await lerProdutosDoSitemap(async () => [], async () => muitos);
    expect(lista).toHaveLength(5001);
    expect(fatiarProdutos(lista, 10000)).toHaveLength(1);
    expect(fatiarProdutos(lista, 5000)).toHaveLength(2);
  });

  it("tira do sitemap o post que a fonte confirma que não existe", async () => {
    const mortos = await slugsAusentes(
      ["vivo", "avell-storm-480-notebook-gamer-i9-rtx-4080", "instavel"],
      async (slug) => (slug === "avell-storm-480-notebook-gamer-i9-rtx-4080" ? "ausente" : slug === "instavel" ? "incerto" : "existe")
    );
    expect([...mortos]).toEqual(["avell-storm-480-notebook-gamer-i9-rtx-4080"]);
  });

  it("data só quando é válida", () => {
    expect(dataDoProduto(undefined)).toBeUndefined();
    expect(dataDoProduto("lixo")).toBeUndefined();
    expect(dataDoProduto("2026-10-16 10:00:00")?.toISOString()).toBe("2026-10-16T10:00:00.000Z");
    expect(dataDoProduto("2026-10-16T10:00:00.000Z")?.toISOString()).toBe("2026-10-16T10:00:00.000Z");
  });
});
