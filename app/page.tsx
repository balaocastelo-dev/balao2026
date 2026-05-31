import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
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
import { ArrowRight, BadgeCheck, CreditCard, Headset, MapPin, ShieldCheck, Truck } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />
      
      {isHome && (
        <section className="relative overflow-hidden bg-zinc-950 border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(230,0,18,0.18),transparent_45%),radial-gradient(circle_at_85%_55%,rgba(255,255,255,0.08),transparent_45%)]" />
          <div className="container mx-auto px-4 py-10 sm:py-14 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold tracking-wide text-white/80">
                  <BadgeCheck className="h-4 w-4 text-[#E60012]" />
                  Referência em tecnologia em Campinas
                </div>
                <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
                  Tecnologia de verdade para{" "}
                  <span className="text-[#E60012]">trabalho</span>,{" "}
                  <span className="text-[#E60012]">games</span> e{" "}
                  <span className="text-[#E60012]">performance</span>.
                </h1>
                <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                  PCs Gamer, notebooks e hardware com compra segura, suporte especializado e entrega rápida na região.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={pcGamerCat?.slug ? `/categoria/${encodeURIComponent(pcGamerCat.slug)}` : "/pcgamer"}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] px-6 py-3.5 text-base font-extrabold text-white transition-colors shadow-[0_18px_60px_rgba(230,0,18,0.28)]"
                  >
                    Comprar agora
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-base font-extrabold text-white transition-colors"
                  >
                    Falar no WhatsApp
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-extrabold text-white">Entrega rápida</div>
                    <div className="text-xs text-zinc-400">Campinas e região</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-extrabold text-white">Até 12x</div>
                    <div className="text-xs text-zinc-400">sem juros</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-extrabold text-white">Suporte</div>
                    <div className="text-xs text-zinc-400">especializado</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-extrabold text-white">Loja física</div>
                    <div className="text-xs text-zinc-400">em Campinas</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-[28px] border border-white/10 bg-white/5 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.22),transparent_55%)]" />
                  <div className="relative aspect-[16/11] sm:aspect-[16/10]">
                    <Image
                      src="/images/prizes/pc.webp"
                      alt="PC Gamer Balão da Informática"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
                  </div>
                  <div className="relative p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
                          Monte seu PC
                        </div>
                        <div className="text-lg sm:text-xl font-black text-white mt-1">
                          PC Gamer sob medida
                        </div>
                        <div className="text-sm text-zinc-300 mt-1">
                          Diga seu uso e orçamento. A gente recomenda as peças do estoque.
                        </div>
                      </div>
                      <Link
                        href="/montagempc"
                        className="shrink-0 inline-flex items-center justify-center rounded-2xl bg-white text-black px-4 py-2 font-extrabold hover:bg-zinc-200 transition-colors"
                      >
                        Montar agora
                      </Link>
                    </div>
                  </div>
                </div>

                {carouselImages.length > 0 && (
                  <div className="mt-5">
                    <Carousel images={carouselImages} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3">
                  <Truck className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Entrega rápida</div>
                    <div className="text-xs text-gray-600">Campinas e região</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Até 12x</div>
                    <div className="text-xs text-gray-600">sem juros</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3">
                  <Headset className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Suporte</div>
                    <div className="text-xs text-gray-600">especializado</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Compra segura</div>
                    <div className="text-xs text-gray-600">checkout protegido</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/5 bg-white p-4 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#E60012] mt-0.5" />
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">Loja física</div>
                    <div className="text-xs text-gray-600">Campinas • SP</div>
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
                <section id="categorias" className="mt-2">
                  <div className="flex items-end justify-between gap-4 px-4 lg:px-0">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">
                        Explore rápido
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-1">
                        Categorias em destaque
                      </h2>
                      <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                        Encontre o que você precisa com poucos cliques. Mais clareza, menos ruído.
                      </p>
                    </div>
                    <Link href="/departamentos" className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012] hover:underline">
                      Ver todos os departamentos
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 px-4 lg:px-0">
                    <Link
                      href={pcGamerCat?.slug ? `/categoria/${encodeURIComponent(pcGamerCat.slug)}` : "/pcgamer"}
                      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(230,0,18,0.16),transparent_55%)]" />
                      <div className="relative p-6">
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Performance</div>
                        <div className="mt-2 text-xl font-black text-gray-900">PC Gamer</div>
                        <div className="mt-2 text-sm text-gray-600 max-w-sm">
                          Configurações prontas e upgrades com foco em FPS e estabilidade.
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#E60012] px-4 py-2 text-sm font-extrabold text-white group-hover:bg-[#cc0010] transition-colors">
                          Ver produtos
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>

                    <Link
                      href={notebooksCat?.slug ? `/categoria/${encodeURIComponent(notebooksCat.slug)}` : "/notebooks"}
                      className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,rgba(0,0,0,0.10),transparent_55%)]" />
                      <div className="relative p-6">
                        <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Mobilidade</div>
                        <div className="mt-2 text-xl font-black text-gray-900">Notebooks</div>
                        <div className="mt-2 text-sm text-gray-600 max-w-sm">
                          Trabalho, estudo e criação com ótimo custo-benefício.
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-extrabold text-gray-900 group-hover:bg-zinc-50 transition-colors">
                          Ver ofertas
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>

                    <div className="grid grid-cols-1 gap-4">
                      <Link
                        href={hardwareCat?.slug ? `/categoria/${encodeURIComponent(hardwareCat.slug)}` : "/?category=Hardware"}
                        className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="relative p-6">
                          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Upgrade</div>
                          <div className="mt-2 text-lg font-black text-gray-900">Hardware</div>
                          <div className="mt-2 text-sm text-gray-600">Placas, SSDs, RAM e mais.</div>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012]">
                            Ver produtos <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                      <div className="grid grid-cols-2 gap-4">
                        <Link
                          href={monitorsCat?.slug ? `/categoria/${encodeURIComponent(monitorsCat.slug)}` : "/?category=Monitores"}
                          className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Visual</div>
                          <div className="mt-2 text-lg font-black text-gray-900">Monitores</div>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012]">
                            Ver <ArrowRight className="h-4 w-4" />
                          </div>
                        </Link>
                        <Link
                          href={accessoriesCat?.slug ? `/categoria/${encodeURIComponent(accessoriesCat.slug)}` : "/?category=Periféricos"}
                          className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">Setup</div>
                          <div className="mt-2 text-lg font-black text-gray-900">Periféricos</div>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#E60012]">
                            Ver <ArrowRight className="h-4 w-4" />
                          </div>
                        </Link>
                      </div>
                    </div>
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

                <section className="mt-12 rounded-[28px] overflow-hidden border border-black/5 bg-zinc-950 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(230,0,18,0.20),transparent_55%),radial-gradient(circle_at_86%_55%,rgba(255,255,255,0.08),transparent_55%)]" />
                  <div className="relative px-6 py-10 sm:px-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7">
                      <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">
                        Credibilidade e atendimento
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
                        Loja física em Campinas. Atendimento rápido no WhatsApp.
                      </h2>
                      <p className="text-zinc-300 mt-3 leading-relaxed">
                        Fale com quem entende. Ajudamos você a comprar certo, evitar incompatibilidades e montar o melhor setup dentro do seu orçamento.
                      </p>
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] px-6 py-3.5 text-base font-extrabold text-white transition-colors shadow-[0_18px_60px_rgba(18,140,126,0.28)]"
                        >
                          Atendimento no WhatsApp
                          <ArrowRight className="h-5 w-5" />
                        </a>
                        <Link
                          href="/fale-conosco"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-base font-extrabold text-white transition-colors"
                        >
                          Ver contatos
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm font-extrabold text-white">Até 12x sem juros</div>
                        <div className="text-sm text-zinc-300 mt-1">Compre com tranquilidade e condições facilitadas.</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm font-extrabold text-white">Assistência técnica própria</div>
                        <div className="text-sm text-zinc-300 mt-1">Suporte que continua depois da compra.</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm font-extrabold text-white">Compra segura</div>
                        <div className="text-sm text-zinc-300 mt-1">Checkout protegido e atendimento humano.</div>
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
