import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateHomeAiAndGoogleSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalStoreInfo from "@/components/HomeLocalStoreInfo";
import HomeProductShelf from "@/components/HomeProductShelf";
import HomeHeroInteractive from "@/components/HomeHeroInteractive";
import HomeTrustPillars from "@/components/HomeTrustPillars";
import HomeFlashDeals from "@/components/HomeFlashDeals";
import HomeSeminovosShowcase from "@/components/HomeSeminovosShowcase";
import Image from "next/image";
import { getProductsByExactCategories, getProducts } from "@/lib/db";
import { getCachedCategories, getCachedCarouselImages, getCachedHomeBlocks, getCachedVitrinePages } from "@/lib/cache";
import { listBlogPostsForPage } from "@/lib/blog-store";
import { pickPcHeroImage } from "@/lib/vitrine/core";
import type { VitrineCategory } from "@/lib/vitrine/types";
import { turso } from "@/lib/turso";
import { getProductHref, parsePriceToNumber, Product, type Category, type HomeBlock } from "@/lib/utils";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";
import Link from "next/link";
import {
  Gamepad2,
  Laptop,
} from "lucide-react";

export const revalidate = 60;

type SearchParams = Promise<{ category?: string; search?: string }>;

type HomeSidebarBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
};

type HomeSidebarVitrinePage = {
  id: string;
  slug: string;
  nome_pc: string;
  categoria?: VitrineCategory;
  extras?: Record<string, unknown>;
  images?: Record<string, unknown>;
  data_publicacao?: string | null;
  data_criacao?: string;
};

type VitrineExtras = {
  price_text?: string;
  main_product?: {
    price?: string;
  };
};

function priceTextFromVitrineRecord(page: HomeSidebarVitrinePage) {
  const extras: VitrineExtras = page?.extras && typeof page.extras === "object" ? (page.extras as VitrineExtras) : {};
  const direct = String(extras.price_text || "").trim();
  if (direct) return direct;
  const mainPrice = extras.main_product?.price ? String(extras.main_product.price).trim() : "";
  return mainPrice || "Sob consulta";
}

function productMatchesTerms(product: Product, terms: string[]) {
  const haystack = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

const homeBrands = [
  "Balão.info",
  "Apple",
  "Dell",
  "Lenovo",
  "HP",
  "ASUS",
  "Acer",
  "Samsung",
  "Microsoft",
  "Intel",
  "AMD",
  "NVIDIA",
  "Kingston",
  "Logitech",
  "Corsair",
  "Gigabyte",
  "MSI",
  "Western Digital",
  "Seagate",
  "Crucial",
  "SanDisk",
  "TP-Link",
  "D-Link",
  "Razer",
  "HyperX",
  "Cooler Master",
  "Thermaltake",
  "EVGA",
  "ASRock",
  "Epson",
  "Canon",
  "Husky",
];

const homeBrandCarousel = [...homeBrands, ...homeBrands];

export async function generateMetadata(props: { searchParams: SearchParams }): Promise<Metadata> {
  const sp = await props.searchParams;
  const hasFacet = Boolean((sp?.category || "").trim() || (sp?.search || "").trim());
  const title = "Loja de Informática em Campinas | PC Gamer, Peças, Notebooks e Assistência Técnica";
  const description =
    "Balão da Informática Castelo: loja física de informática em Campinas. Mais de 5.000 produtos com até 10% de desconto no PIX ou 10x sem juros. PC Gamer, Hardware, Notebooks e Assistência no Cambuí.";
  const canonical = "https://www.balao.info/";

  return {
    title,
    description,
    metadataBase: new URL("https://www.balao.info"),
    alternates: { canonical },
    keywords: [
      "loja de informática campinas",
      "pc gamer campinas",
      "comprar computador campinas",
      "notebook campinas",
      "assistência técnica campinas",
      "placa de vídeo campinas",
      "processador ryzen intel",
      "hardware campinas cambuí",
      "balão da informática castelo",
      "conserto de notebook campinas",
      "peças de informática campinas",
      "ssd nvme ram ddr4 ddr5",
      "periféricos gamer campinas",
      "monitores 144hz 240hz campinas"
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
  };

  let products: Product[] = [];
  let categories: Category[] = [];
  let carouselImages = [];
  let homeBlocks = [];
  let blogPosts: HomeSidebarBlogPost[] = [];
  let vitrinePages: HomeSidebarVitrinePage[] = [];
  let semiNovoProducts: Product[] = [];
  let pcGamerProducts: Product[] = [];
  let activeBlocks: HomeBlock[] = [];

  if (search) {
    [categories, carouselImages, homeBlocks, blogPosts, vitrinePages] = await Promise.all([
      getCachedCategories(),
      getCachedCarouselImages(),
      getCachedHomeBlocks(),
      listBlogPostsForPage({ take: 6, skipDynamicFallback: true }) as Promise<HomeSidebarBlogPost[]>,
      getCachedVitrinePages().then((pages) => pages.slice(0, 6)) as Promise<HomeSidebarVitrinePage[]>,
    ]);

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
          (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
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
  } else {
    [categories, carouselImages, homeBlocks, blogPosts, vitrinePages] = await Promise.all([
      getCachedCategories(),
      getCachedCarouselImages(),
      getCachedHomeBlocks(),
      listBlogPostsForPage({ take: 6, skipDynamicFallback: true }) as Promise<HomeSidebarBlogPost[]>,
      getCachedVitrinePages().then((pages) => pages.slice(0, 6)) as Promise<HomeSidebarVitrinePage[]>,
    ]);

    activeBlocks = homeBlocks;
    if (!activeBlocks || activeBlocks.length === 0) {
      const defaultCategories = ["Hardware", "Notebooks Seminovos", "Periféricos", "Monitores", "Computadores", "Games", "Smartphones", "Acessórios", "Segurança"];
      activeBlocks = defaultCategories.map((catName, i) => ({
        id: `default-block-${i}`,
        category_id: catName,
        title: catName,
        display_order: i,
        active: true,
        created_at: new Date().toISOString(),
      }));
    }

    let rawProducts: Product[] = [];
    if (category && category !== "Todos os Produtos") {
      const validCategories = new Set<string>([category]);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach((name) => validCategories.add(name));
      rawProducts = await getProductsByExactCategories([...validCategories]);
    } else {
      const blockCategories = [...new Set(activeBlocks.map((block) => block.category_id).filter(Boolean))];
      rawProducts = await getProductsByExactCategories(blockCategories);
      if (rawProducts.length === 0) {
        rawProducts = await getProducts();
      }
    }

    const seenNames = new Set();
    products = rawProducts.filter(p => {
      const nameKey = p.name.trim().toLowerCase();
      if (seenNames.has(nameKey)) return false;
      seenNames.add(nameKey);
      return true;
    });
  }

  const filteredProducts = products;

  // Carregar produtos de PC Gamer e Notebooks
  const [pcGamerDirect, notebookProductsDirect] = await Promise.all([
    getProductsByExactCategories(["Computadores"]),
    getProductsByExactCategories(["Notebooks Seminovos"]),
  ]);

  if (pcGamerDirect.length > 0) {
    const gamerFiltered = pcGamerDirect.filter((p) =>
      productMatchesTerms(p, ["gamer", "desktop gamer", "computador gamer", "ryzen", "core i", "rtx", "gtx", "pc gamer"])
    );
    pcGamerProducts = (gamerFiltered.length > 0 ? gamerFiltered : pcGamerDirect).slice(0, 6);
  } else {
    pcGamerProducts = products
      .filter((p) => productMatchesTerms(p, ["computador gamer", "pc gamer", "desktop gamer", "ryzen", "core i5", "core i7", "rtx", "gamer"]))
      .slice(0, 6);
  }

  if (notebookProductsDirect.length > 0) {
    semiNovoProducts = notebookProductsDirect.slice(0, 6);
  } else {
    const semiNovoRootCandidates = categories.filter((item) => {
      const slug = String(item.slug || "").toLowerCase();
      return slug.includes("notebook") || slug.includes("semi-novo") || slug.includes("seminovos");
    });
    if (semiNovoRootCandidates.length > 0) {
      const validSemiNovoCategories = new Set<string>();
      semiNovoRootCandidates.forEach((rootCategory) => {
        validSemiNovoCategories.add(rootCategory.name);
        const semiNovoDescendants = getDescendantNames(rootCategory.name, categories);
        semiNovoDescendants.forEach((name) => validSemiNovoCategories.add(name));
      });
      const semiNovoAllProducts = await getProductsByExactCategories([...validSemiNovoCategories]);
      const notebookCandidates = semiNovoAllProducts.filter((product) =>
        productMatchesTerms(product, ["notebook", "notebooks", "laptop", "macbook", "ultrabook", "chromebook"]),
      );
      semiNovoProducts = (notebookCandidates.length > 0
        ? notebookCandidates
        : semiNovoAllProducts.filter((product) => !productMatchesTerms(product, ["iphone", "apple iphone", "ios"]))
      ).slice(0, 6);
    }
  }

  const semiNovoCards = Array.from({ length: 6 }, (_, index) => semiNovoProducts[index] || null);
  const pcGamerCards = Array.from({ length: 6 }, (_, index) => pcGamerProducts[index] || null);

  return (
    <div className="home-shell min-h-screen flex flex-col font-sans transition-colors duration-300">
      <JsonLd data={generateHomeAiAndGoogleSchema()} />
      <Header />

      {!search && !category && (
        <section className="container mx-auto px-3 pt-4 sm:px-4 lg:px-0 lg:pt-5">
          <div className="home-panel brand-carousel rounded-[1.5rem] px-3 py-3 sm:px-4 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-sm">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-[var(--home-accent)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm sm:px-4 sm:text-[11px]">
                Marcas em Destaque
              </span>
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--home-panel-bg)] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--home-panel-bg)] to-transparent" />
                <div className="brand-carousel-track flex w-max min-w-full items-center gap-2 py-1 pr-2 sm:gap-3">
                  {homeBrandCarousel.map((brand, index) => (
                    <Link
                      key={`${brand}-${index}`}
                      href={`/?search=${encodeURIComponent(brand)}`}
                      className="flex-none whitespace-nowrap rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-1.5 text-xs font-bold text-[var(--home-text)] transition hover:border-[var(--home-border-strong)] hover:text-[var(--home-accent)] sm:px-4 sm:text-sm"
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

      <div className="container mx-auto flex flex-1 flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:gap-6 lg:px-0 lg:py-6">
        <div className={`w-64 flex-shrink-0 space-y-4 ${search || category ? "hidden lg:block" : "hidden xl:block"}`}>
          <Sidebar categories={categories} />

          {/* PC Gamer Sidebar */}
          <section className="home-panel rounded-[1.5rem] p-3 border border-red-500/20 bg-gradient-to-b from-red-950/20 via-[var(--home-panel-bg)] to-[var(--home-panel-bg)] shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)] flex items-center gap-1">
                  <Gamepad2 size={12} />
                  Setup Gamer
                </div>
                <h2 className="mt-0.5 text-sm font-black text-[var(--home-text)]">PC Gamer & Desktops</h2>
              </div>
              <Link
                href="/pcgamer"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
              >
                Ver mais
              </Link>
            </div>

            <div className="space-y-2.5">
              {pcGamerCards.map((product, index) =>
                product ? (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    prefetch={false}
                    className="home-card group flex items-center gap-2.5 rounded-[1.2rem] p-2.5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={product.image || "/logo.png"}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--home-accent)]">
                        {product.category || "PC Gamer"}
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs font-black text-white">
                        {product.price || "Sob consulta"}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div key={`pc-gamer-placeholder-${index}`} className="home-card flex items-center gap-2.5 rounded-[1.2rem] p-2.5">
                    <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src="/logo.png"
                        alt="Mais PCs Gamer em breve"
                        fill
                        sizes="64px"
                        className="object-contain object-center p-2"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-black uppercase text-[var(--home-muted)]">
                        Em breve
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)]">
                        Novos PCs Gamer sendo montados
                      </h3>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Notebooks Seminovos Sidebar */}
          <section className="home-panel rounded-[1.5rem] p-3 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-md">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400 flex items-center gap-1">
                  <Laptop size={12} />
                  Seminovo
                </div>
                <h2 className="mt-0.5 text-sm font-black text-[var(--home-text)]">Notebooks seminovos</h2>
              </div>
              <Link
                href="/categoria/notebooks-seminovos"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
              >
                Ver mais
              </Link>
            </div>

            <div className="space-y-2.5">
              {semiNovoCards.map((product, index) =>
                product ? (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    prefetch={false}
                    className="home-card group flex items-center gap-2.5 rounded-[1.2rem] p-2.5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={product.image || "/logo.png"}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-400">
                        {product.category || "Notebook seminovo"}
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs font-black text-white">
                        {product.price || "Sob consulta"}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div key={`semi-novo-placeholder-${index}`} className="home-card flex items-center gap-2.5 rounded-[1.2rem] p-2.5">
                    <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src="/logo.png"
                        alt="Mais estoque em breve"
                        fill
                        sizes="64px"
                        className="object-contain object-center p-2"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-black uppercase text-[var(--home-muted)]">
                        Em breve
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)]">
                        Novas unidades chegando
                      </h3>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* Blog Sidebar */}
          {blogPosts.length > 0 ? (
            <section className="home-panel rounded-[1.5rem] p-3 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Blog
                  </div>
                  <h2 className="mt-0.5 text-sm font-black text-[var(--home-text)]">Leia também</h2>
                </div>
                <Link
                  href="/blog"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
                >
                  Ver mais
                </Link>
              </div>

              <div className="space-y-2.5">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    prefetch={false}
                    className="home-card group flex items-center gap-2.5 rounded-[1.2rem] p-2.5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={post.cover_image || "/logo.png"}
                        alt={post.title}
                        fill
                        sizes="64px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">{post.category}</span>
                      </div>
                      <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Vitrine Sidebar */}
          {vitrinePages.length > 0 ? (
            <section className="home-panel rounded-[1.5rem] p-3 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-md">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Vitrine
                  </div>
                  <h2 className="mt-0.5 text-sm font-black text-[var(--home-text)]">Destaques</h2>
                </div>
                <Link
                  href="/vitrine"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
                >
                  Ver mais
                </Link>
              </div>

              <div className="space-y-2.5">
                {vitrinePages.map((page) => {
                  const imageMap = page.images && typeof page.images === "object" ? page.images : {};
                  const hero = String(imageMap.hero || pickPcHeroImage({ categoria: page.categoria }));
                  const priceText = priceTextFromVitrineRecord(page);

                  return (
                    <Link
                      key={page.id}
                      href={`/p/${page.slug}`}
                      prefetch={false}
                      className="home-card group flex items-center gap-2.5 rounded-[1.2rem] p-2.5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                    >
                      <div className="relative h-[64px] w-[64px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                        <Image
                          src={hero || "/logo.png"}
                          alt={page.nome_pc}
                          fill
                          sizes="64px"
                          className="object-contain object-center p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--home-accent)]">
                          {page.categoria || "Vitrine"}
                        </div>
                        <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                          {page.nome_pc}
                        </h3>
                        <p className="mt-1 text-xs font-black text-white">
                          {priceText}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {!search && !category && (
            <div className="min-w-0 space-y-6">
              {/* 1. Hero Section with Interactive Quick Finder */}
              <HomeHeroInteractive carouselImages={carouselImages} />

              {/* 2. Trust Pillars (4 interactive cards) */}
              <HomeTrustPillars />

              {/* 3. Flash Deals (Ofertas Relâmpago com Countdown) */}
              <HomeFlashDeals products={products} />

              {/* 4. Dual High Performance Showcase (PC Gamer & Notebooks) */}
              <HomeSeminovosShowcase
                pcGamerProducts={pcGamerProducts}
                notebookProducts={semiNovoProducts}
              />

              {/* 5. Modular Category Product Shelves */}
              {(activeBlocks && activeBlocks.length > 0 ? activeBlocks : homeBlocks).map((block, index) => {
                const blockProducts = products.filter((p) => p.category === block.category_id);
                if (blockProducts.length === 0) return null;

                return (
                  <HomeProductShelf
                    key={block.id}
                    title={block.title || block.category_id}
                    subtitle={index % 2 === 0 ? "Seleção com estoque garantido, entrega rápida e retirada no Cambuí." : "Produtos com alto giro, garantia direta e suporte especializado."}
                    products={blockProducts}
                    categoryId={block.category_id}
                    bannerTitle={index % 2 === 0 ? "Pronto para retirar ou pedir no WhatsApp" : "Vitrine de Alta Performance"}
                    bannerText={index % 2 === 0 ? "Combine catálogo online com atendimento local no Cambuí para confirmar estoque e fechar negócio." : "Peças e equipamentos com procedência comprovada e garantia total."}
                  />
                );
              })}

              {products.length > 0 && !(activeBlocks && activeBlocks.length > 0 ? activeBlocks : homeBlocks).some((block) => products.some((p) => p.category === block.category_id)) && (
                <section className="home-panel rounded-[2rem] p-6 md:p-8 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-xl">
                  <div className="mb-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                      Catálogo em Destaque
                    </div>
                    <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--home-text)] md:text-3xl">
                      Produtos Disponíveis
                    </h2>
                  </div>
                  <ProductList products={products.slice(0, 24)} />
                </section>
              )}
            </div>
          )}

          {(category || search) && (
            <section className="home-panel rounded-[2rem] p-6 md:p-8 border border-[var(--home-border)] bg-[var(--home-panel-bg)] shadow-xl">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Navegação Orientada
                  </div>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--home-text)] md:text-4xl">
                    {category || `Resultados para: "${search}"`}
                  </h1>
                </div>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-bold text-[var(--home-muted)]">
                  {filteredProducts.length} produtos
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-20 text-center text-[var(--home-muted)]">
                  <p className="text-xl font-medium">Nenhum produto encontrado para esta busca.</p>
                </div>
              ) : (
                <ProductList products={filteredProducts} />
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
              <p className="mb-4 text-[var(--home-muted)]">
                A <strong>Balão da Informática Castelo</strong> é a principal <strong>loja de informática em Campinas</strong> para quem busca
                <strong>PC Gamer em Campinas</strong>, <strong>notebooks</strong>, peças de hardware para upgrade (placas de vídeo RTX/Radeon,
                processadores Intel e AMD Ryzen, memórias RAM DDR4/DDR5, SSDs NVMe e fontes selo 80 Plus), periféricos gamer e <strong>assistência técnica especializada em Campinas</strong> com atendimento imediato no balcão e no WhatsApp.
                Compre online com desconto progressivo no PIX ou em até 10x sem juros no cartão de crédito e retire seu pedido em até 30 minutos na loja física no bairro Cambuí.
              </p>
              <ul className="list-none space-y-3 pl-0 text-[var(--home-muted)]">
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
        </main>
      </div>
    </div>
  );
}
