import Link from "next/link";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import SeoContent from "@/components/SeoContent";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import StoreInfo from "@/components/StoreInfo";
import TestimonialsSection from "@/components/TestimonialsSection";
import JsonLd, { generateOrganizationSchema, generateFAQSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
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
  const title = "Balão da Informática | Loja de Informática com Entrega Rápida em Campinas e Região";
  const description =
    "Loja de informática completa com entrega rápida para Campinas e região. PCs Gamer, notebooks, hardware, periféricos e assistência técnica especializada.";
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

const HOME_FAQS = [
  {
    question: "Onde fica o Balão da Informática Castelo?",
    answer: "Nossa loja física está localizada na Av. Anchieta, 789 – Cambuí, Campinas – SP. Venha nos visitar!"
  },
  {
    question: "Qual o horário de funcionamento?",
    answer: "Atendimento presencial de segunda a sexta das 08h às 18h e aos sábados das 08h às 13h."
  },
  {
    question: "O WhatsApp atende fora do horário comercial?",
    answer: "Sim! Nosso WhatsApp funciona 24 horas por dia com agente de IA automatizado e atendimento humano em horários estendidos."
  },
  {
    question: "Vocês fazem assistência técnica?",
    answer: "Sim, somos especialistas em conserto de notebooks de todas as marcas, computadores desktops, limpeza térmica e upgrades."
  },
  {
    question: "Vocês vendem notebooks seminovos?",
    answer: "Sim, possuímos uma vitrine física completa de notebooks novos, seminovos e computadores com garantia."
  },
  {
    question: "Vocês montam PC Gamer?",
    answer: "Com certeza! Fazemos a montagem personalizada do seu PC Gamer com peças escolhidas a dedo ou peças trazidas pelo cliente."
  },
  {
    question: "Vocês aceitam equipamentos usados em consignação?",
    answer: "Sim. Realizamos avaliação física técnica e aceitamos computadores e notebooks modernos para venda consignada segura."
  }
];

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

    products = await (async () => {
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
  } else {
    [categories, carouselImages, homeBlocks] = await Promise.all([
      getCategories(),
      getCarouselImages(true),
      getHomeBlocks(true),
    ]);

    if (category && category !== "Todos os Produtos") {
      const validCategories = new Set<string>([category]);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach((name) => validCategories.add(name));
      products = await getProductsByExactCategories([...validCategories]);
    } else {
      const blockCategories = [...new Set(homeBlocks.map((block) => block.category_id).filter(Boolean))];
      products = await getProductsByExactCategories(blockCategories);
    }
  }

  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateFAQSchema(HOME_FAQS)
      ]} />
      <Header />

      {/* Home Hero Section */}
      {!search && !category && (
        <section className="bg-zinc-950 text-white py-16 relative overflow-hidden border-b-4 border-[#E60012]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black opacity-80" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <span className="bg-[#E60012]/15 border border-[#E60012]/30 text-[#E60012] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-6">
              Unidade Oficial Campinas - Cambuí
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase">
              Balão da Informática Castelo
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-6">
              Loja de informática, assistência técnica e PC Gamer em Campinas
            </h2>
            <p className="text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
              Atendimento presencial na Av. Anchieta, 789 – Cambuí. Venda de computadores, notebooks, peças, periféricos, assistência técnica e consignação de usados com atendimento via WhatsApp 24h.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WhatsAppCTA 
                label="Chamar no WhatsApp" 
                message="Olá! Gostaria de falar com o atendimento da loja Balão Castelo." 
                variant="primary" 
              />
              <a 
                href="#servicos" 
                className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white px-6 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Ver serviços
              </a>
            </div>
          </div>
        </section>
      )}
      
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
            {/* Dynamic Home Blocks */}
            {!search && !category && (
                <>
                {/* Dynamic Home Blocks */}
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

            {/* Nossos Serviços e Departamentos Grid */}
            {!search && !category && (
              <div id="servicos" className="mt-8 mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">Nossos Serviços e Especialidades</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-red-500 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Comprar Computadores</h3>
                      <p className="text-gray-500 text-xs mb-4">PCs Gamer montados sob medida, notebooks seminovos e novos, e peças com garantia física local.</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href="/pcgamer" className="text-xs font-bold text-[#E60012] hover:underline">PCs Gamer</Link>
                      <span className="text-gray-300 text-xs">|</span>
                      <Link href="/notebooks" className="text-xs font-bold text-[#E60012] hover:underline">Notebooks</Link>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-red-500 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Assistência Técnica</h3>
                      <p className="text-gray-500 text-xs mb-4">Conserto de notebook de qualquer marca, troca de tela e bateria, limpeza com pasta térmica e recuperação de dados.</p>
                    </div>
                    <Link href="/assistencia-tecnica" className="text-xs font-bold text-[#E60012] hover:underline">Conhecer Assistência &rarr;</Link>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-red-500 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2">Consignação de Usados</h3>
                      <p className="text-gray-500 text-xs mb-4">Deixe seu notebook ou PC Gamer antigo sob a guarda de nossa loja e venda com total segurança sem cair em golpes.</p>
                    </div>
                    <Link href="/venda-seu-usado" className="text-xs font-bold text-[#E60012] hover:underline">Vender com Segurança &rarr;</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Depoimentos */}
            {!search && !category && (
              <div className="mt-8 mb-12">
                <TestimonialsSection />
              </div>
            )}

            {/* StoreInfo / Atendimento Local */}
            {!search && !category && (
              <div className="mt-8 mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase text-center">Balão da Informática Castelo: atendimento local em Campinas</h2>
                <StoreInfo />
              </div>
            )}

            {/* FAQ Section */}
            {!search && !category && (
              <div className="mt-8 mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase">Perguntas Frequentes</h2>
                <div className="space-y-4">
                  {HOME_FAQS.map((faq, i) => (
                    <details key={i} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
                      <summary className="font-bold text-sm text-gray-800 flex justify-between items-center list-none">
                        {faq.question}
                        <span className="text-[#E60012] font-bold text-lg">+</span>
                      </summary>
                      <p className="mt-3 text-xs text-gray-600 leading-relaxed font-normal">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Content Section */}
            {!search && !category && (
                <SeoContent title="BALÃO DA INFORMÁTICA CASTELO: LOJA DE INFORMÁTICA EM CAMPINAS">
                    <p className="text-gray-600 mb-4">
                        Bem-vindo ao <strong>Balão da Informática Castelo</strong>, sua referência em tecnologia e hardware em <strong>Campinas – Cambuí</strong>. Encontre as melhores marcas de peças, notebooks e PC Gamer com preço justo e garantia. Estamos na <strong>Av. Anchieta, 789 – Cambuí, Campinas/SP</strong>.
                    </p>
                    <ul className="list-none pl-0 text-gray-600 space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-xl">📍</span>
                            <span><strong>Endereço:</strong> Av. Anchieta, 789 – Cambuí, Campinas – SP. CEP: 13012-100. Atendimento presencial de segunda a sexta das 08h às 18h e aos sábados das 08h às 13h.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">💬</span>
                            <span><strong>WhatsApp 24h:</strong> (19) 98751-0267 — atendimento com agente de IA e atendimento humano a qualquer hora.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🌎</span>
                            <span><strong>Região RMC:</strong> Atendemos Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba e Jaguariúna.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🚀</span>
                            <span><strong>Especialistas:</strong> Montagem de PC Gamer, assistência técnica em notebooks e desktops, manutenção de Apple, consignação de usados.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-xl">🏆</span>
                            <span><strong>Por que escolher:</strong> Maior estoque da região, preços agressivos em SSD/RAM/Vídeo e suporte técnico especializado com atendimento real.</span>
                        </li>
                    </ul>
                </SeoContent>
            )}      

            {!search && !category && (
              <div className="mt-8">
                <QuickLeadSection
                  title="Quer atendimento rápido para comprar ou consertar?"
                  description="Se você precisa de notebook, PC Gamer, assistência técnica, upgrade ou reparo Apple, fale com a equipe agora. O foco é transformar visita no site em atendimento real."
                  messageTemplate="Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região."
                  source="home"
                  cityLabel="Campinas e Região"
                  serviceLabel="Venda e Assistência Técnica"
                  formTitle="Pedir retorno rápido"
                />
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
