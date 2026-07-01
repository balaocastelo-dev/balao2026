import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalHero from "@/components/HomeLocalHero";
import HomeLocalStoreInfo from "@/components/HomeLocalStoreInfo";
import { getProductsByExactCategories, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { parsePriceToNumber, Product, type Category } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 300;

type SearchParams = Promise<{ category?: string; search?: string }>;

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await props.searchParams;
  const hasFacet = Boolean((sp?.category || "").trim() || (sp?.search || "").trim());
  const title = "Loja de Informática em Campinas | PC Gamer, Notebook e Assistência Técnica";
  const description =
    "Balão da Informática Castelo: loja física em Campinas para PC Gamer, notebooks, peças, upgrades e assistência técnica. Compre pelo WhatsApp, retire no Cambuí ou consulte entrega rápida.";
  const canonical = "https://www.balao.info/";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
    robots: hasFacet ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function Home(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  // Helper to find all descendant category names
  const getDescendantNames = (rootName: string, allCategories: Category[]) => {
      const root = allCategories.find(c => c.name === rootName);
      if (!root) return [];
      
      const descendants: string[] = [];
      const stack = [root.id];
      
      while (stack.length > 0) {
          const currentId = stack.pop();
          const children = allCategories.filter(c => c.parent_id === currentId);
          children.forEach(child => {
              descendants.push(child.name);
              stack.push(child.id);
          });
      }
      return descendants;
  }

  let products: Product[] = [];
  let categories: Category[] = [];
  let carouselImages = [];
  let homeBlocks = [];

  if (search) {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    const rawSearchProducts = await (async () => {
      const supabase = await createClient();
      const searchTerms = search.trim().split(/\s+/).join(' & ');

      const { data, error } = await supabase.rpc('search_products_fts', {
        query_text: searchTerms,
        limit_count: 50
      });

      if (error) {
        console.error("Search RPC error:", error);
        let queryBuilder = supabase.from('products').select('*');

        const terms = search.trim().split(/\s+/);
        terms.forEach(term => {
          if (term.length > 0) {
            queryBuilder = queryBuilder.ilike('name', `%${term}%`);
          }
        });

        const { data: fallbackData } = await queryBuilder.limit(50);
        return ((fallbackData as Product[]) || []).sort(
          (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
        );
      }

      return ((data as Product[]) || []).sort(
        (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
      );
    })();

    // Deduplicate by name
    const seenNames = new Set();
    products = rawSearchProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  } else {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    let rawProducts: Product[] = [];
    if (category && category !== "Todos os Produtos") {
      const validCategories = new Set<string>([category]);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach((name) => validCategories.add(name));
      rawProducts = await getProductsByExactCategories([...validCategories]);
    } else {
      const blockCategories = [...new Set(homeBlocks.map((block) => block.category_id).filter(Boolean))];
      rawProducts = await getProductsByExactCategories(blockCategories);
    }

    // Deduplicate by name
    const seenNames = new Set();
    products = rawProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  }

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />

      {!search && !category && <HomeLocalHero />}
      
      {/* Carousel Banner */}
      {!search && !category && (
          <div className="container mx-auto px-4 mt-5 lg:px-0">
              {carouselImages.length > 0 ? (
                  <Carousel images={carouselImages} />
              ) : (
                  <div className="w-full h-40 md:h-64 lg:h-80 bg-gradient-to-r from-[#E60012] to-red-800 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      Ofertas ImperdÃ­veis
                  </div>
              )}
          </div>
      )}

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
            {/* Dynamic Home Blocks */}
            {!search && !category && (
                <>
                {homeBlocks.map(block => {
                    const blockProducts = products.filter(p => p.category === block.category_id);
                    if (blockProducts.length === 0) return null;
                    return (
                        <ProductCarousel 
                            key={block.id}
                            title={block.title || block.category_id}
                            products={blockProducts}
                            categoryId={block.category_id}
                        />
                    );
                })}
                </>
            )}

            {/* Product List - Only show when searching or browsing category */}
            {(category || search) && (
              <>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">
                        {category || `Resultados para: "${search}"`}
                    </h1>
                    <span className="text-sm text-gray-500">{filteredProducts.length} produtos</span>
                </div>

                {filteredProducts.length === 0 ? (
                   <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                      <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                   </div>
                ) : (
                  <ProductList products={filteredProducts} />
                )}
              </>
            )}

            {/* SEO Content Section */}
            {!search && !category && (
                <SeoContent title="LOJA DE INFORMÁTICA EM CAMPINAS COM ATENDIMENTO LOCAL">
                    <p className="text-zinc-400 mb-4">
                        A <strong>Balão da Informática Castelo</strong> atende Campinas e região com venda de <strong>PC Gamer, notebooks, peças, periféricos, upgrades e assistência técnica</strong>. O foco é resolver rápido: consulte estoque pelo WhatsApp, retire na loja física no Cambuí ou peça entrega conforme disponibilidade.
                    </p>
                    <ul className="list-none pl-0 text-zinc-400 space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-xl">📍</span>
                            <span><strong>Loja física:</strong> {SITE_CONFIG.address}. Atendimento para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba e Jaguariúna.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">💬</span>
                            <span><strong>Compra rápida:</strong> fale no WhatsApp para confirmar estoque, preço final, retirada e entrega antes de sair de casa.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🚀</span>
                            <span><strong>Especialistas:</strong> montagem de PC Gamer, upgrades, manutenção de notebooks e suporte técnico para empresas e clientes finais.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🏆</span>
                            <span><strong>Diferencial local:</strong> loja real, atendimento humano, assistência técnica e pós-venda perto do cliente.</span>
                        </li>
                    </ul>
                </SeoContent>
            )}      

            {!search && !category && (
              <HomeLocalStoreInfo />
            )}

            {!search && !category && (
              <div className="mt-8">
                <QuickLeadSection
                  title="Quer comprar ou consertar hoje?"
                  description="Fale com a equipe da Balão da Informática pelo WhatsApp para confirmar estoque, retirada, entrega ou assistência técnica em Campinas e região."
                  messageTemplate="Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região."
                  source="home"
                  cityLabel="Campinas e Região"
                  serviceLabel="Venda, Upgrade e Assistência Técnica"
                  formTitle="Pedir retorno rápido"
                />
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
