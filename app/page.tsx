import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import HomeOfferTabs from "@/components/HomeOfferTabs";
import { getProducts, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { parsePriceToNumber, Product } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Briefcase, CircuitBoard, CreditCard, Cpu, Gamepad2, Headset, MapPin, Monitor, ShieldCheck, Star, Truck, Wrench } from "lucide-react";

export const dynamic = 'force-dynamic';

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
      // Otherwise fetch all products (for category browsing and home blocks)
      productsPromise = getProducts();
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

  // If we are NOT searching, we might need to filter by category
  // (If we ARE searching, 'products' is already the search result from RPC)
  if (!search) {
      filteredProducts = products.filter(p => {
        if (category && category !== "Todos os Produtos" && !validCategories.has(p.category)) return false;
        return true;
      });
  }

  const isHome = !search && !category;
  const whatsappHref = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    "Olá! Quero ajuda para escolher um produto (PC Gamer / notebook / upgrade)."
  )}`;

  const pickCategory = (preferredNames: string[]) => {
    const norm = (s: string) => s.trim().toLowerCase();
    const list = categories || [];
    for (const name of preferredNames) {
      const exact = list.find((c: any) => norm(c.name) === norm(name));
      if (exact) return exact;
      const partial = list.find((c: any) => norm(c.name).includes(norm(name)) || norm(name).includes(norm(c.name)));
      if (partial) return partial;
    }
    return null;
  };

  const pcGamerCat = pickCategory(["PC Gamer", "Computadores Gamer", "Games & Consoles"]);
  const notebooksCat = pickCategory(["Notebooks", "Apple", "Computadores & Informática"]);
  const hardwareCat = pickCategory(["Hardware", "Armazenamento", "Rede & Conectividade"]);
  const monitorsCat = pickCategory(["Monitores", "Monitores & Displays"]);
  const accessoriesCat = pickCategory(["Periféricos", "Acessórios"]);

  const offerTabs = (homeBlocks || [])
    .slice()
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .slice(0, 6)
    .map((block) => {
      const blockProducts = products.filter((p) => p.category === block.category_id);
      return {
        key: block.id,
        title: (block.title || block.category_id || "Ofertas").toString(),
        categoryId: block.category_id,
        products: blockProducts,
      };
    })
    .filter((t) => t.products.length > 0);

  const pcFeatured = products
    .filter((p) => /pc\s*gamer/i.test(String(p.category || "")) || /pc\s*gamer/i.test(String(p.name || "")))
    .slice(0, 4);
  const pcBadges = ["Mais vendido", "Custo benefício", "Alta performance", "Profissional"];

  const premiumProducts = products.filter(
    (p) => /premium/i.test(String(p.category || "")) || /pcs?\s*premium/i.test(String(p.name || "")),
  );
  const premiumImagePool = premiumProducts
    .map((p) => (typeof p?.image === "string" ? p.image.trim() : ""))
    .filter(Boolean);

  const pickRandomPremiumImage = () => {
    if (premiumImagePool.length === 0) return null;
    const index = Math.floor(Math.random() * premiumImagePool.length);
    return premiumImagePool[index] || null;
  };

  const heroIllustration = pickRandomPremiumImage() || "/images/prizes/pc.webp";
  const buildIllustration = (() => {
    if (premiumImagePool.length <= 1) return pickRandomPremiumImage() || "/images/prizes/pc.png";
    let candidate = pickRandomPremiumImage();
    let attempts = 0;
    while (candidate && candidate === heroIllustration && attempts < 5) {
      candidate = pickRandomPremiumImage();
      attempts += 1;
    }
    return candidate || "/images/prizes/pc.png";
  })();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />
      
      {isHome && (
        <section className="relative overflow-hidden bg-white border-b border-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(230,0,18,0.10),transparent_52%),radial-gradient(circle_at_86%_40%,rgba(0,0,0,0.05),transparent_55%)]" />
          <div className="container mx-auto px-4 py-10 sm:py-14 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/25 bg-[#E60012]/5 px-3 py-1 text-xs font-extrabold tracking-wide text-[#E60012]">
                  <BadgeCheck className="h-4 w-4" />
                  ALTA PERFORMANCE
                </div>
                <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight text-gray-900 leading-[0.98]">
                  Máquinas potentes{" "}
                  <span className="block mt-2 text-[#E60012]">para quem exige mais</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                  PCs Gamer, Profissionais e Workstations com componentes premium e montagem especializada.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                  <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                      <CircuitBoard className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">Componentes premium</div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">Montagem profissional</div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                      <Headset className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-extrabold text-gray-900">Suporte especializado</div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/pcgamer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] px-7 py-4 text-base font-extrabold text-white transition-colors shadow-[0_18px_60px_rgba(230,0,18,0.18)]"
                  >
                    VER PC GAMER
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/montagempc"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white hover:bg-zinc-50 px-7 py-4 text-base font-extrabold text-gray-900 transition-colors"
                  >
                    MONTAR MEU PC
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[34px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.10),transparent_55%)]" />
                  <div className="relative rounded-[28px] border border-black/5 bg-white overflow-hidden shadow-sm">
                    <div className="relative aspect-[16/11] sm:aspect-[16/10]">
                      <Image
                        src={heroIllustration}
                        alt="PC Gamer Balão da Informática"
                        fill
                        className="object-contain p-6 sm:p-10"
                        priority
                        unoptimized
                      />
                    </div>
                  </div>

                  <div className="absolute left-6 bottom-6 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">+15 anos</div>
                        <div className="text-xs text-gray-600">de experiência</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50 border-t border-black/5">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <Truck className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Entrega para todo o Brasil</div>
                    <div className="text-xs text-gray-600">envios rápidos e seguros</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Garantia e qualidade</div>
                    <div className="text-xs text-gray-600">produtos com garantia</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <Headset className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Suporte especializado</div>
                    <div className="text-xs text-gray-600">antes e depois da compra</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3 shadow-sm">
                  <CreditCard className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Até 12x sem juros</div>
                    <div className="text-xs text-gray-600">parcele com tranquilidade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar categories={categories} />
            {/* <div className="mt-4">
                <InstagramFeed />
            </div> */}
        </div>
        <main className="flex-1 w-full min-w-0">
            {isHome && (
              <>
                <section className="mt-4 px-4 lg:px-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">
                        ENCONTRE SEU PC
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-2">
                        PCs em destaque
                      </h2>
                    </div>
                    <Link href="/pcgamer" className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 hover:text-[#E60012] transition-colors">
                      Ver todos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pcFeatured.length > 0 ? (
                      pcFeatured.map((p, idx) => (
                        <ProductCard key={p.id} product={p} layout="featured" badgeLabel={pcBadges[idx] || "Destaque"} />
                      ))
                    ) : (
                      <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-black/10 bg-white p-8 text-center text-gray-600">
                        Nenhum PC Gamer encontrado para exibir aqui.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 sm:hidden">
                    <Link href="/pcgamer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white border border-black/10 px-5 py-3 font-extrabold text-gray-900 hover:bg-zinc-50 transition-colors">
                      Ver todos <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </section>

                <section className="mt-10 px-4 lg:px-0">
                  <div className="relative overflow-hidden rounded-[28px] bg-white border border-black/5 shadow-sm">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(230,0,18,0.10),transparent_58%),radial-gradient(circle_at_90%_55%,rgba(0,0,0,0.04),transparent_55%)]" />
                    <div className="relative px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-7">
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">MONTE SEU PC</div>
                        <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                          Monte seu PC do seu jeito!
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                          Escolha as peças do nosso estoque com ajuda de um especialista e garanta compatibilidade, desempenho e acabamento premium.
                        </p>
                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                          <Link
                            href="/montagempc"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] px-6 py-3.5 text-sm font-extrabold text-white transition-colors shadow-[0_18px_60px_rgba(230,0,18,0.28)]"
                          >
                            Montar agora
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white hover:bg-zinc-50 px-6 py-3.5 text-sm font-extrabold text-gray-900 transition-colors"
                          >
                            Pedir ajuda no WhatsApp
                            <ArrowRight className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                      <div className="lg:col-span-5">
                        <div className="relative w-full aspect-[16/10] rounded-[24px] border border-black/5 bg-white overflow-hidden shadow-sm">
                          <Image src={buildIllustration} alt="Monte seu PC" fill className="object-contain p-6" unoptimized />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="categorias" className="mt-10 px-4 lg:px-0">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">
                        CATEGORIAS POPULARES
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-2">
                        O que você procura?
                      </h2>
                    </div>
                    <Link href="/departamentos" className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 hover:text-[#E60012] transition-colors">
                      Ver todas categorias <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    {[
                      { label: "PC Gamer", href: "/pcgamer", Icon: Gamepad2 },
                      { label: "PC Profissional", href: "/premium", Icon: Briefcase },
                      { label: "Workstation", href: "/vitrine", Icon: Cpu },
                      { label: "Monitores", href: "/?category=Monitores", Icon: Monitor },
                      { label: "Placas de Vídeo", href: "/?search=RTX", Icon: CircuitBoard },
                      { label: "Periféricos", href: "/?category=Perif%C3%A9ricos", Icon: Gamepad2 },
                      { label: "Hardware", href: "/?category=Hardware", Icon: Cpu },
                    ].map(({ label, href, Icon }) => (
                      <Link
                        key={label}
                        href={href}
                        className="group rounded-2xl border border-black/5 bg-white p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-[#E60012]/10 text-[#E60012] flex items-center justify-center border border-[#E60012]/20 group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="text-sm font-extrabold text-gray-900">{label}</div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 sm:hidden">
                    <Link href="/departamentos" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white border border-black/10 px-5 py-3 font-extrabold text-gray-900 hover:bg-zinc-50 transition-colors">
                      Ver todas categorias <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </section>

                {offerTabs.length > 0 && (
                  <section id="ofertas" className="mt-10">
                    <div className="px-4 lg:px-0">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Destaques</div>
                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-1">
                            Ofertas e oportunidades
                          </h2>
                          <p className="text-sm text-gray-600 mt-2">
                            Produtos com alta procura e melhor custo-benefício do momento.
                          </p>
                        </div>
                        <Link href="/promocao" className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012] hover:underline">
                          Ver promoções
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-6">
                      <HomeOfferTabs tabs={offerTabs} />
                    </div>
                  </section>
                )}

                <section className="mt-12 px-4 lg:px-0">
                  <div className="rounded-[28px] border border-black/5 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-10 sm:px-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-6">
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">
                          Por que comprar na Balão da Informática?
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mt-3">
                          Confiança, montagem profissional e suporte de verdade.
                        </h2>
                        <p className="text-gray-600 mt-3 leading-relaxed max-w-2xl">
                          Atendimento humano e especializado para você comprar certo: compatibilidade, performance e custo-benefício.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] px-6 py-3.5 text-base font-extrabold text-white transition-colors shadow-[0_18px_60px_rgba(18,140,126,0.18)]"
                          >
                            Atendimento no WhatsApp
                            <ArrowRight className="h-5 w-5" />
                          </a>
                          <Link
                            href="/fale-conosco"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white hover:bg-zinc-50 px-6 py-3.5 text-base font-extrabold text-gray-900 transition-colors"
                          >
                            Ver contatos
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>

                      <div className="lg:col-span-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-extrabold text-gray-900">+15 anos</div>
                              <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                                <BadgeCheck className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">de experiência</div>
                          </div>

                          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-extrabold text-gray-900">+1.200</div>
                              <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                                <Star className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">clientes satisfeitos</div>
                          </div>

                          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-extrabold text-gray-900">Produtos</div>
                              <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                                <ShieldCheck className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">originais e com garantia</div>
                          </div>

                          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-extrabold text-gray-900">Suporte</div>
                              <div className="h-9 w-9 rounded-xl bg-[#E60012]/10 border border-[#E60012]/20 flex items-center justify-center text-[#E60012]">
                                <Headset className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">especializado</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mt-12">
                  <div className="px-4 lg:px-0">
                    <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Especialistas</div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-1">
                      Serviços em destaque
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                      A Balão não é só loja. Somos referência em serviços e suporte técnico.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-0">
                    {[
                      { title: "Montagem PC Gamer", desc: "Projeto sob medida com peças do estoque.", href: "/montagempc" },
                      { title: "Manutenção", desc: "Diagnóstico e reparo com agilidade.", href: "/manutencao" },
                      { title: "Reparo Apple", desc: "Troca de tela/bateria e serviços Apple.", href: "/reparoapple" },
                      { title: "Recuperação de Dados", desc: "Resgate de arquivos e diagnóstico.", href: "/recuperacaodados" },
                      { title: "Consignação", desc: "Venda com garantia e parcelamento.", href: "/consignacao" },
                      { title: "Assistência Games", desc: "Consoles, controles e acessórios.", href: "/assistenciagames" },
                    ].map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="group rounded-[28px] border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="text-sm font-black text-gray-900 group-hover:text-[#E60012] transition-colors">
                          {s.title}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">{s.desc}</div>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012]">
                          Saiba mais <ArrowRight className="h-4 w-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="mt-12">
                  {(homeBlocks || []).map((block) => {
                    const blockProducts = products.filter((p) => p.category === block.category_id);
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
                </section>
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
