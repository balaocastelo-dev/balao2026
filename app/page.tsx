import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import Link from "next/link";
// InstagramFeed will be moved to Sidebar area
// import InstagramFeed from "@/components/InstagramFeed";
import { getProductsByCategories, getCarouselImages, getCategories, getHomeBlocks, getHomeBlockProductsByCategory } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { parsePriceToNumber, Product } from "@/lib/utils";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ category?: string; search?: string }>;

export default async function Home(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  // Optimized Data Fetching
  const carouselImagesPromise = getCarouselImages(true);
  const categoriesPromise = getCategories();
  const homeBlocksPromise = getHomeBlocks(true);
  
  let productsPromise: Promise<Product[]>;
  
  if (search) {
      // If searching, use the advanced FTS + Fuzzy search from Supabase
      productsPromise = (async () => {
          const supabase = await createClient();
          // Prepare AND query: "Desktop 2025" -> "Desktop & 2025"
          const searchTerms = search.trim().split(/\s+/).join(' & ');

          const { data, error } = await supabase.rpc('search_products_fts', { 
              query_text: searchTerms, 
              limit_count: 50 
          });
          
          if (error) {
              console.error("Search RPC error:", error);
              // Fallback to basic ILIKE search with strict AND logic for each term
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
  } else {
      productsPromise = Promise.resolve([]);
  }

  const [products, carouselImages, categories, homeBlocks] = await Promise.all([
    productsPromise,
    carouselImagesPromise,
    categoriesPromise,
    homeBlocksPromise
  ]);

  // Helper to find all descendant category names
  const getDescendantNames = (rootName: string, allCategories: any[]) => {
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

  const validCategories = new Set<string>();
  if (category) {
      validCategories.add(category);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach(d => validCategories.add(d));
  }

  let filteredProducts = products;
  let homeBlockProducts: Record<string, Product[]> = {};

  // If we are NOT searching, we might need to filter by category
  // (If we ARE searching, 'products' is already the search result from RPC)
  if (!search) {
      if (category && category !== "Todos os Produtos") {
        const categoryList = Array.from(validCategories);
        filteredProducts = await getProductsByCategories(categoryList);
      } else {
        const homeCategories = homeBlocks.map((b) => b.category_id).filter(Boolean);
        homeBlockProducts = await getHomeBlockProductsByCategory(homeCategories, 12);
        filteredProducts = [];
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />
      
      {/* Carousel Banner */}
      {!search && !category && (
          <div className="container mx-auto px-4 mt-6">
              {carouselImages.length > 0 ? (
                  <Carousel images={carouselImages} />
              ) : (
                  <div className="w-full h-40 md:h-64 lg:h-80 bg-gradient-to-r from-[#E60012] to-red-800 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      Ofertas Imperdíveis
                  </div>
              )}
          </div>
      )}

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar categories={categories} />
            {/* <div className="mt-4">
                <InstagramFeed />
            </div> */}
        </div>
        <main className="flex-1 w-full min-w-0">
            {!search && !category && (
              <div className="mb-6">
                <Link
                  href="/monte-seu-pc"
                  className="block rounded-2xl border border-red-200 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-red-100">Monte seu PC</div>
                      <div className="text-2xl md:text-3xl font-black leading-tight">
                        Monte seu PC com compatibilidade rigorosa
                      </div>
                      <div className="text-red-100 mt-1 text-sm">
                        Fluxo sequencial: CPU → Placa-mãe → RAM → SSD/NVMe → GPU → Fonte → Gabinete.
                      </div>
                    </div>
                    <div className="shrink-0 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-red-700 font-black">
                      Começar agora
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {/* Dynamic Home Blocks */}
            {!search && !category && (
                <>
                {/* Dynamic Home Blocks */}
                {homeBlocks.map(block => {
                    const blockProducts = homeBlockProducts[block.category_id] || [];
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
                <SeoContent title="BALÃO DA INFORMÁTICA: SUA LOJA DE INFORMÁTICA EM CAMPINAS E REGIÃO">
                    <p className="text-gray-600 mb-4">
                        Bem-vindo ao <strong>Balão da Informática</strong>, sua referência em tecnologia e hardware em <strong>Campinas e RMC</strong>. Encontre as melhores marcas de peças, notebooks e PC Gamer com preço justo e garantia.
                    </p>
                    <ul className="list-none pl-0 text-gray-600 space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-xl">📍</span>
                            <span><strong>Região RMC:</strong> Atendemos Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba e Jaguariúna.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🚀</span>
                            <span><strong>Especialistas:</strong> Montagem de PC Gamer High-End, Workstations para renderização e computadores para escritório.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">⚡</span>
                            <span><strong>Entrega Flash:</strong> Receba no mesmo dia em Campinas (consulte disponibilidade). Delivery rápido e seguro.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🏆</span>
                            <span><strong>Por que escolher:</strong> Maior estoque da região, preços agressivos em SSD/RAM/Video e suporte técnico especializado.</span>
                        </li>
                    </ul>
                </SeoContent>
            )}      
        </main>
      </div>
    </div>
  );
}
