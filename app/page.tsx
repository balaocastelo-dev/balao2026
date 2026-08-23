import Header from "@/components/Header";
import ProductList from "@/components/ProductList";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateHomeAiAndGoogleSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalStoreInfo from "@/components/HomeLocalStoreInfo";
import HomeHeroFullWidth from "@/components/HomeHeroFullWidth";
import HomeTrustPillars from "@/components/HomeTrustPillars";
import HomeDepartmentMenu from "@/components/HomeDepartmentMenu";
import HomeCategoryShelf from "@/components/HomeCategoryShelf";
import HomeMonitoresFullWidth from "@/components/HomeMonitoresFullWidth";
import HomeBlogSection from "@/components/HomeBlogSection";
import { getProductsByExactCategories, getProducts } from "@/lib/db";
import { getCachedCategories, getCachedCarouselImages } from "@/lib/cache";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { turso } from "@/lib/turso";
import { parsePriceToNumber, Product, type Category } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import Link from "next/link";

export const revalidate = 60;

type SearchParams = Promise<{ category?: string; search?: string }>;

type HomeBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

const homeBrands = [
  "Balão.info", "Apple", "Dell", "Lenovo", "HP", "ASUS", "Acer", "Samsung", 
  "Microsoft", "Intel", "AMD", "NVIDIA", "Kingston", "Logitech", "Corsair", 
  "Gigabyte", "MSI", "Western Digital", "Seagate", "Crucial", "SanDisk", 
  "TP-Link", "D-Link", "Razer", "HyperX", "Cooler Master", "Thermaltake", 
  "EVGA", "ASRock", "Epson", "Canon", "Husky"
];

const homeBrandCarousel = [...homeBrands, ...homeBrands];

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await props.searchParams;
  const hasFacet = Boolean((sp?.category || "").trim() || (sp?.search || "").trim());
  const title = "Loja de Informática em Campinas | PC Gamer, Notebooks, Monitores e Assistência Técnica";
  const description =
    "Balão da Informática Castelo: a loja mais completa de informática em Campinas. PC Gamer, Notebooks, Monitores, Smartphones e Peças. Compre com desconto no PIX ou até 10x sem juros e retire no Cambuí.";
  const canonical = "https://www.balao.info/";

  return {
    title,
    description,
    metadataBase: new URL("https://www.balao.info"),
    alternates: { canonical },
    keywords: [
      "loja de informática campinas",
      "pc gamer campinas",
      "notebook campinas",
      "monitores gamer campinas",
      "smartphones campinas",
      "hardware e peças campinas",
      "assistência técnica cambuí",
      "placa de vídeo rtx",
      "processador ryzen intel",
      "balão da informática castelo",
      "loja de computador campinas"
    ],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Balão da Informática" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
    robots: hasFacet
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export default async function Home(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  let products: Product[] = [];
  let categories: Category[] = [];
  let carouselImages = [];
  let blogPosts: HomeBlogPost[] = [];

  [categories, carouselImages, blogPosts] = await Promise.all([
    getCachedCategories(),
    getCachedCarouselImages(),
    listBlogPostsForPage({ take: 6, skipDynamicFallback: true }) as Promise<HomeBlogPost[]>,
  ]);

  if (search) {
    const rawSearchProducts = await (async () => {
      const searchTerms = search.trim().split(/\s+/).filter((t) => t.length > 0);

      const conditions = searchTerms
        .map(() => "(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)")
        .join(" AND ");
      const args: string[] = [];
      searchTerms.forEach((term) => {
        const like = `%${term.toLowerCase()}%`;
        args.push(like, like);
      });

      try {
        const res = await turso.execute({
          sql: `SELECT * FROM products WHERE ${conditions} LIMIT 50`,
          args,
        });
        return ((res.rows as unknown as Product[]) || []).sort(
          (a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price)
        );
      } catch (err) {
        console.error("Search error:", err);
        return [] as Product[];
      }
    })();

    const seenNames = new Set();
    products = rawSearchProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  } else if (category && category !== "Todos os Produtos") {
    products = await getProductsByExactCategories([category]);
  } else {
    products = await getProducts();
  }

  // Ordenação global padrão: do MAIS CARO para o MAIS BARATO
  const sortPriceDesc = (list: Product[]) =>
    [...list].sort((a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price));

  // Segmentar produtos pelas categorias na ordem EXATA solicitada:
  // 1. Computador Gamer (ordenado do mais caro para o mais barato)
  const pcGamerProducts = sortPriceDesc(
    products.filter(p => p.category === "Computadores" || p.name.toLowerCase().includes("pc gamer") || p.name.toLowerCase().includes("computador gamer"))
  );

  // 2. Notebooks (ordenado do mais caro para o mais barato)
  const notebookProducts = sortPriceDesc(
    products.filter(p => p.category === "Notebooks" || p.category === "Notebooks Seminovos" || p.name.toLowerCase().includes("notebook") || p.name.toLowerCase().includes("macbook"))
  );

  // 3. Monitores (estritamente monitores, sem acessórios - ordenado do mais caro para o mais barato)
  const monitorProducts = sortPriceDesc(
    products.filter(p => 
      (p.category === "Monitores" || p.name.toLowerCase().includes("monitor")) &&
      !p.name.toLowerCase().includes("suporte") &&
      !p.name.toLowerCase().includes("cabo") &&
      !p.name.toLowerCase().includes("adaptador") &&
      !p.name.toLowerCase().includes("braço articulado")
    )
  );

  // 4. Smartphones (ordenado do mais caro para o mais barato)
  const smartphoneProducts = sortPriceDesc(
    products.filter(p => p.category === "Smartphones" || p.name.toLowerCase().includes("smartphone") || p.name.toLowerCase().includes("galaxy") || p.name.toLowerCase().includes("xiaomi") || p.name.toLowerCase().includes("iphone"))
  );

  // 5. Hardware (ordenado do mais caro para o mais barato)
  const hardwareProducts = sortPriceDesc(
    products.filter(p => p.category === "Hardware" || p.name.toLowerCase().includes("placa de vídeo") || p.name.toLowerCase().includes("processador") || p.name.toLowerCase().includes("ssd") || p.name.toLowerCase().includes("ram"))
  );

  // 6. Periféricos (ordenado do mais caro para o mais barato)
  const perifericoProducts = sortPriceDesc(
    products.filter(p => p.category === "Periféricos" || p.name.toLowerCase().includes("teclado") || p.name.toLowerCase().includes("mouse") || p.name.toLowerCase().includes("headset"))
  );

  // 7. Games (ordenado do mais caro para o mais barato)
  const gamesProducts = sortPriceDesc(
    products.filter(p => p.category === "Games" || p.name.toLowerCase().includes("console") || p.name.toLowerCase().includes("playstation") || p.name.toLowerCase().includes("xbox") || p.name.toLowerCase().includes("cadeira gamer"))
  );

  const dealOfTheDay = pcGamerProducts[0] || products[0] || null;

  return (
    <div className="home-shell min-h-screen flex flex-col font-sans transition-colors duration-300">
      <JsonLd data={generateHomeAiAndGoogleSchema()} />
      <Header />

      {/* Marcas Parceiras Marquee */}
      {!search && !category && (
        <section className="container mx-auto px-3 pt-3 sm:px-4 lg:px-0 lg:pt-4">
          <div className="home-panel brand-carousel rounded-2xl px-3 py-2 sm:px-4 border border-slate-700/80 bg-[#111827] shadow-md">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-[#E60012] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm sm:text-[11px]">
                Marcas Oficiais
              </span>
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#111827] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#111827] to-transparent" />
                <div className="brand-carousel-track flex w-max min-w-full items-center gap-2 py-1 pr-2 sm:gap-3">
                  {homeBrandCarousel.map((brand, index) => (
                    <Link
                      key={`${brand}-${index}`}
                      href={`/?search=${encodeURIComponent(brand)}`}
                      className="flex-none whitespace-nowrap rounded-full border border-slate-700/80 bg-[#161f32] px-3.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-[#E60012] hover:text-[#E60012] sm:px-4 sm:text-sm"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Container - Folgado e Espaçoso */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 py-6">
        {/* 1. Full-Width Stretched Hero Banner */}
        {!search && !category && (
          <HomeHeroFullWidth carouselImages={carouselImages} />
        )}

        {/* 2. Trust Pillars (4 interactive cards) */}
        {!search && !category && (
          <HomeTrustPillars />
        )}

        {/* 3. Main Body: Left Column (Department Menu) + Right Roomy Center Feed (PC Gamer & Notebooks) */}
        {!search && !category ? (
          <>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Dedicated Department Menu Sidebar (w-80 / 320px) */}
              <div className="w-full lg:w-80 shrink-0">
                <HomeDepartmentMenu categories={categories} dealOfTheDay={dealOfTheDay} />
              </div>

              {/* Right Column: Roomy Main Highlights Feed (Spacious, not squeezed!) */}
              <div className="flex-1 min-w-0 space-y-10 sm:space-y-12">
                {/* 1. Computador Gamer */}
                {pcGamerProducts.length > 0 && (
                  <HomeCategoryShelf
                    title="🚀 Computador Gamer & Setups"
                    subtitle="Máquinas de alta performance montadas com componentes selecionados e garantia total."
                    categorySlug="computadores"
                    products={pcGamerProducts}
                  />
                )}

                {/* 2. Notebooks */}
                {notebookProducts.length > 0 && (
                  <HomeCategoryShelf
                    title="💻 Notebooks & Laptops"
                    subtitle="Modelos para trabalho, estudos e gamers com máxima autonomia e potência."
                    categorySlug="notebooks"
                    products={notebookProducts}
                  />
                )}
              </div>
            </div>

            {/* 4. BLOCO 3 FULL SIZE: Monitores Gamer & UltraWide (Esticado na tela toda) */}
            {monitorProducts.length > 0 && (
              <div className="w-full">
                <HomeMonitoresFullWidth products={monitorProducts} />
              </div>
            )}

            {/* 5. Demais Categorias em Destaque (Smartphones, Hardware, Periféricos, Games) */}
            <div className="space-y-10 sm:space-y-12">
              {/* 4. Smartphones */}
              {smartphoneProducts.length > 0 && (
                <HomeCategoryShelf
                  title="📱 Smartphones & Celulares 5G"
                  subtitle="Os principais lançamentos com câmeras de alta resolução e bateria de longa duração."
                  categorySlug="smartphones"
                  products={smartphoneProducts}
                />
              )}

              {/* 5. Hardware & Peças */}
              {hardwareProducts.length > 0 && (
                <HomeCategoryShelf
                  title="⚡ Hardware & Peças para Upgrade"
                  subtitle="Placas de vídeo RTX/Radeon, processadores Ryzen/Intel, SSDs NVMe e memórias RAM."
                  categorySlug="hardware"
                  products={hardwareProducts}
                />
              )}

              {/* 6. Periféricos & Setup */}
              {perifericoProducts.length > 0 && (
                <HomeCategoryShelf
                  title="🎧 Periféricos & Setup Gamer"
                  subtitle="Teclados mecânicos, mouses de precisão, headsets com áudio espacial e microfones."
                  categorySlug="perifericos"
                  products={perifericoProducts}
                />
              )}

              {/* 7. Games & Consoles */}
              {gamesProducts.length > 0 && (
                <HomeCategoryShelf
                  title="🎮 Consoles, Games & Acessórios"
                  subtitle="PlayStation 5, Xbox, controles sem fio e cadeiras gamer ergonômicas."
                  categorySlug="games"
                  products={gamesProducts}
                />
              )}
            </div>

            {/* 6. Blog & Destaques de Conteúdo Full Width */}
            <div className="w-full">
              <HomeBlogSection blogPosts={blogPosts} />
            </div>
          </>
        ) : (
          <section className="home-panel rounded-[2rem] p-6 md:p-8 border border-slate-700/80 bg-[#111827] shadow-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E60012]">
                  Navegação do Catálogo
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white md:text-4xl">
                  {category || `Resultados para: "${search}"`}
                </h1>
              </div>
              <span className="rounded-full border border-slate-700 bg-[#161f32] px-4 py-2 text-sm font-bold text-slate-300">
                {products.length} produtos
              </span>
            </div>

            {products.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-700 bg-[#161f32] px-6 py-20 text-center text-slate-400">
                <p className="text-xl font-medium">Nenhum produto encontrado para esta busca.</p>
              </div>
            ) : (
              <ProductList products={products} />
            )}
          </section>
        )}

        {!search && !category && <HomeLocalStoreInfo />}

        {!search && !category && (
          <div className="mt-6 sm:mt-8">
            <QuickLeadSection
              title="Quer comprar ou consertar hoje?"
              description="Fale com a equipe da Balão da Informática pelo WhatsApp para confirmar estoque, retirada no Cambuí, entrega express ou assistência técnica."
              messageTemplate="Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região."
              source="home"
              cityLabel="Campinas e Região"
              serviceLabel="Venda, Upgrade e Assistência Técnica"
              formTitle="Pedir retorno rápido"
            />
          </div>
        )}

        {!search && !category && (
          <SeoContent title="LOJA DE INFORMATICA EM CAMPINAS COM WHATSAPP, RETIRADA E ASSISTENCIA TECNICA">
            <p className="mb-4 text-slate-300">
              A <strong>Balão da Informática Castelo</strong> é a principal <strong>loja de informática em Campinas</strong> para quem busca
              <strong>PC Gamer em Campinas</strong>, <strong>notebooks</strong>, <strong>monitores gamer</strong>, <strong>smartphones</strong> e peças de hardware para upgrade (placas de vídeo RTX/Radeon,
              processadores Intel e AMD Ryzen, memórias RAM DDR4/DDR5, SSDs NVMe e fontes selo 80 Plus), periféricos gamer e <strong>assistência técnica especializada em Campinas</strong> com atendimento imediato no balcão e no WhatsApp.
              Compre online com desconto progressivo no PIX ou em até 10x sem juros no cartão de crédito e retire seu pedido em até 30 minutos na loja física no bairro Cambuí.
            </p>
            <ul className="list-none space-y-3 pl-0 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-xl">📍</span>
                <span><strong>Loja física em Campinas:</strong> {SITE_CONFIG.address}. Presença local e balcão aberto para quem deseja comprar computador, notebook, peças e acessórios com total procedência, nota fiscal e garantia.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">💬</span>
                <span><strong>Atendimento consultivo e ágil:</strong> converse diretamente com nossa equipe técnica pelo WhatsApp para esclarecer dúvidas de compatibilidade, solicitar orçamento de montagem e fechar seu pedido com rapidez.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🚀</span>
                <span><strong>Bancada técnica própria:</strong> montagem profissional de PC Gamer com cable management, testes de estresse, manutenção preventiva, formatação e conserto de computadores e notebooks.</span>
              </li>
            </ul>
          </SeoContent>
        )}
      </div>
    </div>
  );
}
