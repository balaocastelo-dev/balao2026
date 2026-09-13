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
import { getCachedProducts, getCachedProductsByExactCategories } from "@/lib/cache";
import { getCachedBlogDaHome, getCachedCategories, getCachedCarouselImages } from "@/lib/cache";
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

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await props.searchParams;
  const hasFacet = Boolean((sp?.category || "").trim() || (sp?.search || "").trim());
  const title = "Balão da Informática | Hardware, PC Gamer e Setup Completo em Campinas - 1288 Produtos";
  const description =
    "A maior loja de informática de Campinas com 1288 produtos: 1000 hardwares, 100 PCs gamer, 33 notebooks, 20 monitores, 35 impressoras e 100 periféricos. Até 40% OFF + 12x sem juros. Retire no Cambuí ou receba em casa. Segunda é dia de oferta!";
  const canonical = "https://www.balao.info/";

  return {
    title,
    description,
    metadataBase: new URL("https://www.balao.info"),
    alternates: { canonical },
    keywords: [
      "loja de informática campinas",
      "hardware campinas",
      "pc gamer campinas",
      "notebook campinas",
      "monitor gamer",
      "placa de vídeo rtx",
      "processador ryzen",
      "ssd nvme",
      "balão da informática",
      "promoção informática segunda",
      "setup gamer campinas",
    ],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Balão da Informática - 1288 produtos" }],
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
    getCachedBlogDaHome<HomeBlogPost>(6),
  ]);

  if (search) {
    const searchTerms = search.trim().split(/\s+/).filter((t) => t.length > 0);
    const conditions = searchTerms.map(() => "(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)").join(" AND ");
    const args: string[] = [];
    searchTerms.forEach((term) => {
      const like = `%${term.toLowerCase()}%`;
      args.push(like, like);
    });
    try {
      const { turso } = await import("@/lib/turso");
      const res = await turso.execute({ sql: `SELECT * FROM products WHERE ${conditions} LIMIT 50`, args });
      products = ((res.rows as unknown as Product[]) || []).sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
    } catch (err) {
      console.error("Search error:", err);
      products = [] as Product[];
    }
    const seenNames = new Set();
    products = products.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  } else if (category && category !== "Todos os Produtos") {
    products = await getCachedProductsByExactCategories([category]);
  } else {
    products = await getCachedProducts();
  }

  const parseRelevanceSignal = (p: Product): { rating: number; count: number } => {
    const m = String(p.rating || "").match(/(\d+(?:[.,]\d+)?)\s*⭐?\s*\(?(\d+)?/);
    const rating = m ? parseFloat(m[1].replace(",", ".")) : 0;
    const count = m && m[2] ? parseInt(m[2], 10) : 0;
    return { rating, count };
  };

  const sortRelevance = (list: Product[]) =>
    [...list].sort((a, b) => {
      const ra = parseRelevanceSignal(a);
      const rb = parseRelevanceSignal(b);
      if (rb.count !== ra.count) return rb.count - ra.count;
      if (rb.rating !== ra.rating) return rb.rating - ra.rating;
      return parsePriceToNumber(a.price) - parsePriceToNumber(b.price);
    });

  const pcGamerProducts = sortRelevance(products.filter(p => p.category === "Computadores" || p.name.toLowerCase().includes("pc gamer") || p.name.toLowerCase().includes("computador gamer")));
  const notebookProducts = sortRelevance(products.filter(p => p.category === "Notebooks" || p.name.toLowerCase().includes("notebook") || p.name.toLowerCase().includes("macbook")));
  const monitorProducts = sortRelevance(products.filter(p => (p.category === "Monitores" || p.name.toLowerCase().includes("monitor")) && !p.name.toLowerCase().includes("suporte") && !p.name.toLowerCase().includes("cabo") && !p.name.toLowerCase().includes("adaptador")));
  const hardwareProducts = sortRelevance(products.filter(p => p.category === "Hardware"));
  const perifericoProducts = sortRelevance(products.filter(p => p.category === "Periféricos" || p.name.toLowerCase().includes("teclado") || p.name.toLowerCase().includes("mouse") || p.name.toLowerCase().includes("headset")));
  const impressoraProducts = sortRelevance(products.filter(p => p.category === "Impressão"));

  const dealOfTheDay = pcGamerProducts[0] || hardwareProducts[0] || products[0] || null;

  return (
    <div className="home-shell min-h-screen flex flex-col font-sans transition-colors duration-300">
      <JsonLd data={generateHomeAiAndGoogleSchema()} />
      <Header />

      {/* FAIXA PROMOÇÃO SEGUNDA - NOVA */}
      {!search && !category && (
        <section className="w-full bg-gradient-to-r from-[#E60012] via-[#ff1a2e] to-[#E60012] text-white py-2.5 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_infinite]"></div>
          <p className="relative text-sm md:text-base font-black tracking-wide flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-white text-[#E60012] px-2.5 py-0.5 rounded-full text-xs animate-pulse">SEGUNDA</span>
            <span>🔥 SEMANA DO HARDWARE - ATÉ 40% OFF</span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">12x sem juros</span>
            <span className="hidden md:inline">• Retire no Cambuí em 2h</span>
          </p>
        </section>
      )}

      {/* Marcas Parceiras */}
      {!search && !category && (
        <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-3 lg:pt-4">
          <div className="home-panel brand-carousel rounded-2xl px-4 py-2.5 sm:px-6 border border-slate-700/80 bg-[#111827] shadow-md">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-[#E60012] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm sm:text-[11px]">
                Marcas Oficiais • 1288 produtos
              </span>
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#111827] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#111827] to-transparent" />
                <div className="brand-carousel-track flex w-max min-w-full items-center gap-2 py-1 pr-2 sm:gap-3">
                  {[...["Balão.info", "Intel", "AMD", "NVIDIA", "Kingston", "Logitech", "Corsair", "Gigabyte", "MSI", "ASUS", "Dell", "HP", "Epson", "Canon"], ...["Balão.info", "Intel", "AMD", "NVIDIA", "Kingston", "Logitech", "Corsair", "Gigabyte", "MSI", "ASUS", "Dell", "HP", "Epson", "Canon"]].map((brand, index) => (
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

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-10 sm:space-y-14 py-6">
        {/* HERO NOVO - PROMOÇÃO + PRODUTOS EM DESTAQUE */}
        {!search && !category && (
          <>
            <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <HomeHeroFullWidth carouselImages={carouselImages} />
              {/* Card Destaque Hardware */}
              <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#E60012] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                    🔥 Mais vendido
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    Hardware com<br />
                    <span className="text-[#E60012]">40% OFF</span> essa semana
                  </h2>
                  <p className="text-slate-300 text-sm mt-2">1000 produtos em estoque • Pronta entrega Cambuí</p>
                </div>
                {hardwareProducts[0] && (
                  <Link href={`/product/${hardwareProducts[0].slug || hardwareProducts[0].id}`} className="mt-6 group">
                    <div className="bg-white rounded-xl p-4 flex gap-4 items-center hover:shadow-lg transition-shadow">
                      <img src={hardwareProducts[0].image} alt={hardwareProducts[0].name} className="w-20 h-20 object-contain flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] line-clamp-2 leading-tight group-hover:text-[#E60012]">{hardwareProducts[0].name}</p>
                        <p className="text-sm font-black text-[#E60012] mt-1">{hardwareProducts[0].price}</p>
                        <p className="text-[11px] text-slate-500">12x sem juros • Retire hoje</p>
                      </div>
                    </div>
                  </Link>
                )}
                <Link href="/categoria/hardware" className="mt-4 w-full bg-[#E60012] hover:bg-[#cc0010] text-white py-2.5 rounded-xl font-black text-sm text-center transition-colors">
                  Ver 1000 hardwares →
                </Link>
              </div>
            </section>
            <HomeTrustPillars />
          </>
        )}

        {/* CORPO PRINCIPAL */}
        {!search && !category ? (
          <>
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
              <div className="w-full lg:w-72 xl:w-80 2xl:w-96 shrink-0">
                <HomeDepartmentMenu categories={categories} dealOfTheDay={dealOfTheDay} />
              </div>
              <div className="flex-1 min-w-0 space-y-10 sm:space-y-14">
                {/* Hardware em primeiro - 1000 produtos */}
                {hardwareProducts.length > 0 && (
                  <HomeCategoryShelf
                    title="⚡ Hardware em Oferta - 1000 produtos"
                    subtitle="Placas RTX/Radeon, Ryzen/Intel, SSD NVMe, RAM DDR5 e tudo para upgrade com até 40% OFF."
                    categorySlug="hardware"
                    products={hardwareProducts}
                  />
                )}
                {pcGamerProducts.length > 0 && (
                  <HomeCategoryShelf
                    title="🚀 PCs Gamer Montados"
                    subtitle="Máquinas testadas, com garantia e prontas para jogar. Monte seu setup completo."
                    categorySlug="computadores"
                    products={pcGamerProducts}
                  />
                )}
                {notebookProducts.length > 0 && (
                  <HomeCategoryShelf
                    title="💻 Notebooks"
                    subtitle="Gamer, ultrafinos e para trabalho - com SSD e garantia."
                    categorySlug="notebooks"
                    products={notebookProducts}
                  />
                )}
              </div>
            </div>

            {monitorProducts.length > 0 && (
              <div className="w-full">
                <HomeMonitoresFullWidth products={monitorProducts} />
              </div>
            )}

            <div className="space-y-10 sm:space-y-14">
              {perifericoProducts.length > 0 && (
                <HomeCategoryShelf
                  title="🎧 Setup Gamer Completo"
                  subtitle="Teclados mecânicos, mouses 8K, headsets 7.1 e cadeiras - 100 produtos."
                  categorySlug="perifericos"
                  products={perifericoProducts}
                />
              )}
              {impressoraProducts.length > 0 && (
                <HomeCategoryShelf
                  title="🖨️ Impressoras"
                  subtitle="Jato de tinta, laser e 3D com tanque e Wi-Fi."
                  categorySlug="impressao"
                  products={impressoraProducts}
                />
              )}
            </div>

            <div className="w-full">
              <HomeBlogSection blogPosts={blogPosts} />
            </div>
          </>
        ) : (
          <section className="home-panel rounded-[2rem] p-6 md:p-8 border border-slate-700/80 bg-[#111827] shadow-xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E60012]">
                  Catálogo • 1288 produtos
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
              title="Segunda é dia de garantir seu upgrade!"
              description="Fale agora no WhatsApp e garanta 40% OFF no hardware + 12x sem juros. Retire no Cambuí em 2h ou receba em casa."
              messageTemplate="Olá! Vi a nova home www.balao.info com 1288 produtos e quero aproveitar a promoção de segunda!"
              source="home-nova"
              cityLabel="Campinas e Região"
              serviceLabel="Hardware • PC Gamer • Setup Completo"
              formTitle="Garantir oferta de segunda"
            />
          </div>
        )}

        {!search && !category && (
          <SeoContent title="HARDWARE, PC GAMER E SETUP COMPLETO EM CAMPINAS - 1288 PRODUTOS COM 40% OFF">
            <p className="mb-4 text-slate-300">
              A <strong>Balão da Informática Castelo</strong> reabriu sua loja virtual com <strong>1288 produtos curados</strong>: <strong>1000 hardwares</strong> (RTX, Ryzen, Intel, SSD NVMe, DDR5), <strong>100 PCs gamer</strong> montados, <strong>33 notebooks</strong>, <strong>20 monitores</strong>, <strong>35 impressoras</strong> e <strong>100 periféricos gamer</strong>. Tudo com <strong>até 40% OFF</strong> nessa segunda e <strong>12x sem juros</strong>. Retire no Cambuí em 2h ou receba com entrega expressa. ChatGPT, Perplexity e Google já indexam nosso catálogo via <code>llms.txt</code> e <code>sitemap.xml</code> com 1288 URLs.
            </p>
          </SeoContent>
        )}
      </div>
    </div>
  );
}
