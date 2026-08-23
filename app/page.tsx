import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateOrganizationSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import HomeLocalStoreInfo from "@/components/HomeLocalStoreInfo";
import HomeProductShelf from "@/components/HomeProductShelf";
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
  ArrowRight,
  Clock3,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  PhoneCall,
  ShieldCheck,
  Store,
  Zap,
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

function vitrineDateText(page: HomeSidebarVitrinePage) {
  const rawDate = page.data_publicacao || page.data_criacao;
  if (!rawDate) return "Vitrine";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "Vitrine";
  return parsed.toLocaleDateString("pt-BR");
}

function productMatchesTerms(product: Product, terms: string[]) {
  const haystack = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

const homeBrands = [
  "BalÃ£o.info",
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

const homeHighlights = [
  {
    title: "Computadores",
    description: "Pronta entrega, montagem e upgrade com orientação no balcão e no WhatsApp.",
    icon: Cpu,
    href: "/pcgamer",
  },
  {
    title: "Notebooks",
    description: "Modelos para estudo, trabalho e uso profissional com retirada local.",
    icon: Laptop,
    href: "/?category=Notebook",
  },
  {
    title: "Periféricos Gamer",
    description: "Headsets, teclados, mouse e acessórios para montar seu setup completo.",
    icon: Headphones,
    href: "/?category=Periféricos",
  },
  {
    title: "Monitores e Vídeo",
    description: "Monitores, placas e upgrades para performance real em trabalho e jogo.",
    icon: Monitor,
    href: "/?category=Monitores",
  },
  {
    title: "Games e Consoles",
    description: "Categoria rápida para quem já quer chegar direto na vitrine certa.",
    icon: Gamepad2,
    href: "/?category=Games",
  },
];

const homeServicePillars = [
  {
    title: "Comprar hoje",
    description: "Peças, notebooks, PCs e periféricos com rota rápida para WhatsApp e retirada local.",
    href: "/pcgamer",
    icon: Zap,
  },
  {
    title: "Levar para assistência",
    description: "Diagnóstico, orçamento e reparo com equipe própria em Campinas e região.",
    href: "/manutencao",
    icon: ShieldCheck,
  },
  {
    title: "Visitar a loja física",
    description: "Veja localização, horário e contato direto antes de sair para a loja.",
    href: SITE_CONFIG.mapsUrl,
    icon: Store,
    external: true,
  },
];

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
  let blogPosts: HomeSidebarBlogPost[] = [];
  let vitrinePages: HomeSidebarVitrinePage[] = [];
  let semiNovoProducts: Product[] = [];
  let iphoneSemiNovoProducts: Product[] = [];
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
        .map(() => '(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)')
        .join(' AND ');
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

    // Deduplicate by name
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
      const defaultCategories = ['Hardware', 'Computadores', 'Notebooks', 'Monitores', 'Smartphones', 'Periféricos', 'Acessórios', 'Segurança', 'Impressão'];
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

  const semiNovoRootCandidates = categories.filter((item) => {
    const slug = String(item.slug || "").toLowerCase();
    return slug === "semi-novo" || slug === "semi-novos" || slug.includes("semi-novo");
  });
  if (semiNovoRootCandidates.length > 0) {
    const validSemiNovoCategories = new Set<string>();
    semiNovoRootCandidates.forEach((rootCategory) => {
      validSemiNovoCategories.add(rootCategory.name);
      const semiNovoDescendants = getDescendantNames(rootCategory.name, categories);
      semiNovoDescendants.forEach((name) => validSemiNovoCategories.add(name));
    });
    const semiNovoAllProducts = await getProductsByExactCategories([...validSemiNovoCategories]);
    iphoneSemiNovoProducts = semiNovoAllProducts
      .filter((product) => productMatchesTerms(product, ["iphone", "apple iphone", "ios"]))
      .slice(0, 6);

    const notebookCandidates = semiNovoAllProducts.filter((product) =>
      productMatchesTerms(product, ["notebook", "notebooks", "laptop", "macbook", "ultrabook", "chromebook"]),
    );

    semiNovoProducts = (notebookCandidates.length > 0
      ? notebookCandidates
      : semiNovoAllProducts.filter((product) => !productMatchesTerms(product, ["iphone", "apple iphone", "ios"]))
    ).slice(0, 6);
  }
  const semiNovoCards = Array.from({ length: 6 }, (_, index) => semiNovoProducts[index] || null);
  const iphoneSemiNovoCards = Array.from({ length: 6 }, (_, index) => iphoneSemiNovoProducts[index] || null);

  return (
    <div className="home-shell min-h-screen flex flex-col font-sans transition-colors duration-300">
      <JsonLd data={generateOrganizationSchema()} />
      <Header />

      {!search && !category && (
        <section className="container mx-auto px-3 pt-4 sm:px-4 lg:px-0 lg:pt-5">
          <div className="home-panel brand-carousel rounded-[1.5rem] px-3 py-3 sm:px-4">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-[var(--home-accent)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white sm:px-4 sm:text-[11px]">
                Marcas em destaque
              </span>
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--home-panel-bg)] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--home-panel-bg)] to-transparent" />
                <div className="brand-carousel-track flex w-max min-w-full items-center gap-2 py-1 pr-2 sm:gap-3">
                  {homeBrandCarousel.map((brand, index) => (
                    <Link
                      key={`${brand}-${index}`}
                      href={`/?search=${encodeURIComponent(brand)}`}
                      className="flex-none whitespace-nowrap rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-3 py-2 text-xs font-bold text-[var(--home-text)] transition hover:border-[var(--home-border-strong)] hover:text-[var(--home-accent)] sm:px-4 sm:text-sm"
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
          {blogPosts.length > 0 ? (
            <section className="home-panel rounded-[1.5rem] p-3">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Blog
                  </div>
                  <h2 className="mt-1 text-sm font-black text-[var(--home-text)]">Leia tambem</h2>
                </div>
                <Link
                  href="/blog"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
                >
                  Ver mais
                </Link>
              </div>

              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    prefetch={false}
                    className="home-card group flex items-center gap-3 rounded-[1.2rem] p-3 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={post.cover_image || "/logo.png"}
                        alt={post.title}
                        fill
                        sizes="72px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">{post.category}</span>
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--home-muted)]">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          {vitrinePages.length > 0 ? (
            <section className="home-panel rounded-[1.5rem] p-3">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Vitrine
                  </div>
                  <h2 className="mt-1 text-sm font-black text-[var(--home-text)]">Destaques</h2>
                </div>
                <Link
                  href="/vitrine"
                  className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
                >
                  Ver mais
                </Link>
              </div>

              <div className="space-y-3">
                {vitrinePages.map((page) => {
                  const imageMap = page.images && typeof page.images === "object" ? page.images : {};
                  const hero = String(imageMap.hero || pickPcHeroImage({ categoria: page.categoria }));
                  const priceText = priceTextFromVitrineRecord(page);

                  return (
                    <Link
                      key={page.id}
                      href={`/p/${page.slug}`}
                      prefetch={false}
                      className="home-card group flex items-center gap-3 rounded-[1.2rem] p-3 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                    >
                      <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                        <Image
                          src={hero || "/logo.png"}
                          alt={page.nome_pc}
                          fill
                          sizes="72px"
                          className="object-contain object-center p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                          <span className="text-[var(--home-accent)]">{page.categoria || "Vitrine"}</span>
                          <span>{vitrineDateText(page)}</span>
                        </div>
                        <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                          {page.nome_pc}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-[var(--home-muted)]">
                          {priceText}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}
          <section className="home-panel rounded-[1.5rem] p-3">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                  Semi-novo
                </div>
                <h2 className="mt-1 text-sm font-black text-[var(--home-text)]">Notebooks seminovos</h2>
              </div>
              <Link
                href="/categoria/semi-novos?search=notebook"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
              >
                Ver mais
              </Link>
            </div>

            <div className="space-y-3">
              {semiNovoCards.map((product, index) =>
                product ? (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    prefetch={false}
                    className="home-card group flex items-center gap-3 rounded-[1.2rem] p-3 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={product.image || "/logo.png"}
                        alt={product.name}
                        fill
                        sizes="72px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">{product.category || "Notebook seminovo"}</span>
                        <span>Estoque</span>
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-[var(--home-muted)]">
                        {product.price || "Sob consulta"}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div key={`semi-novo-placeholder-${index}`} className="home-card flex items-center gap-3 rounded-[1.2rem] p-3">
                    <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src="/logo.png"
                        alt="Mais estoque em breve"
                        fill
                        sizes="72px"
                        className="object-contain object-center p-2"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">Notebook seminovo</span>
                        <span>Em breve</span>
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)]">
                        Logo chegara mais notebooks seminovos
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--home-muted)]">
                        Estamos atualizando a vitrine de notebooks seminovos. Volte em breve para ver novas oportunidades.
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
          <section className="home-panel rounded-[1.5rem] p-3">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                  Semi-novo
                </div>
                <h2 className="mt-1 text-sm font-black text-[var(--home-text)]">iPhones seminovos</h2>
              </div>
              <Link
                href="/categoria/semi-novos?search=iphone"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--home-accent)] hover:opacity-80"
              >
                Ver mais
              </Link>
            </div>

            <div className="space-y-3">
              {iphoneSemiNovoCards.map((product, index) =>
                product ? (
                  <Link
                    key={product.id}
                    href={getProductHref(product)}
                    prefetch={false}
                    className="home-card group flex items-center gap-3 rounded-[1.2rem] p-3 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]"
                  >
                    <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src={product.image || "/logo.png"}
                        alt={product.name}
                        fill
                        sizes="72px"
                        className="object-contain object-center p-1"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">{product.category || "iPhone seminovo"}</span>
                        <span>Estoque</span>
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-[var(--home-muted)]">
                        {product.price || "Sob consulta"}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div key={`iphone-semi-novo-placeholder-${index}`} className="home-card flex items-center gap-3 rounded-[1.2rem] p-3">
                    <div className="relative h-[72px] w-[72px] flex-none overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-card-soft)]">
                      <Image
                        src="/logo.png"
                        alt="Mais iPhones seminovos em breve"
                        fill
                        sizes="72px"
                        className="object-contain object-center p-2"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--home-muted)]">
                        <span className="text-[var(--home-accent)]">iPhone seminovo</span>
                        <span>Em breve</span>
                      </div>
                      <h3 className="mt-1 line-clamp-3 text-xs font-black leading-4 text-[var(--home-text)]">
                        Logo chegara mais iPhones seminovos
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--home-muted)]">
                        Estamos atualizando a vitrine de iPhones seminovos. Volte em breve para ver novas oportunidades.
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
        <main className="flex-1 min-w-0">
          {!search && !category && (
            <div className="min-w-0 space-y-8">
              <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-4">
                  <div className="home-panel-strong overflow-hidden rounded-[1.75rem] p-3 sm:p-4 md:rounded-[2rem] md:p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--home-accent)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white">
                        Ofertas da semana
                      </span>
                      <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                        Loja física em Campinas
                      </span>
                      <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">
                        Retirada e assistência
                      </span>
                    </div>

                    <div className="mb-5 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
                      <div className="min-w-0">
                        <h1 className="text-2xl font-black tracking-tight text-[var(--home-text)] sm:text-3xl md:text-5xl">
                          Monte, compre e resolva sua informática no mesmo lugar.
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--home-muted)] md:text-base">
                          PCs, notebooks, peças, upgrades e assistência técnica com atendimento humano pelo WhatsApp e retirada na loja física no Cambuí.
                        </p>
                      </div>
                      <div className="grid min-w-0 grid-cols-2 gap-3">
                        <div className="home-card rounded-2xl px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">Contato</div>
                          <div className="mt-1 text-lg font-black text-[var(--home-text)]">WhatsApp</div>
                        </div>
                        <div className="home-card rounded-2xl px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--home-muted)]">Retirada</div>
                          <div className="mt-1 text-lg font-black text-[var(--home-text)]">No dia</div>
                        </div>
                      </div>
                    </div>

                    {carouselImages.length > 0 ? (
                      <Carousel images={carouselImages} />
                    ) : (
                      <div className="flex h-52 items-center justify-center rounded-[1.75rem] bg-gradient-to-r from-[#E60012] to-red-800 text-center text-3xl font-black text-white shadow-md md:h-72">
                        Ofertas Imperdíveis
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {homeHighlights.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.title} href={item.href} className="home-card group flex min-h-[190px] flex-col rounded-[1.5rem] p-4 sm:min-h-[220px] sm:p-5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                            <Icon size={20} />
                          </div>
                          <h3 className="mt-4 text-lg font-black tracking-tight text-[var(--home-text)] group-hover:text-[var(--home-accent)]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--home-muted)]">{item.description}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <aside className="min-w-0 space-y-4">
                  <div className="home-panel-strong rounded-[2rem] p-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--home-success-soft)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--home-success)]">
                      <Clock3 size={14} />
                      Atendimento rápido
                    </div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-[var(--home-text)]">
                      Quer resolver hoje?
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--home-muted)]">
                      Abra o WhatsApp da loja, veja como chegar ou fale por telefone sem perder o contexto do produto ou do serviço.
                    </p>

                    <div className="mt-6 space-y-3">
                      <a
                        href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero atendimento rápido da Balão da Informática para compra ou assistência técnica em Campinas e região.")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-black text-white transition hover:bg-[#128C7E]"
                      >
                        <MessageCircle size={18} />
                        Falar no WhatsApp agora
                      </a>
                      <a
                        href={`tel:${SITE_CONFIG.phone.number}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-bg)] px-5 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)]"
                      >
                        <PhoneCall size={18} />
                        Ligar para a loja
                      </a>
                      <a
                        href={SITE_CONFIG.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card-soft)] px-5 py-4 text-sm font-black text-[var(--home-text)] transition hover:border-[var(--home-accent)]"
                      >
                        <MapPin size={18} />
                        Abrir no Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {homeServicePillars.map((item) => {
                      const Icon = item.icon;
                      const card = (
                        <div className="home-card group min-h-[136px] rounded-[1.6rem] p-4 sm:min-h-[148px] sm:p-5 transition hover:-translate-y-0.5 hover:border-[var(--home-border-strong)]">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--home-accent-soft)] text-[var(--home-accent)]">
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg font-black tracking-tight text-[var(--home-text)]">{item.title}</div>
                              <p className="mt-1 text-sm leading-relaxed text-[var(--home-muted)]">{item.description}</p>
                              <div className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--home-accent)]">
                                Acessar
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                      return item.external ? (
                        <a key={item.title} href={item.href} target="_blank" rel="noreferrer">
                          {card}
                        </a>
                      ) : (
                        <Link key={item.title} href={item.href}>
                          {card}
                        </Link>
                      );
                    })}
                  </div>
                </aside>
              </section>

              {(activeBlocks && activeBlocks.length > 0 ? activeBlocks : homeBlocks).map((block, index) => {
                const blockProducts = products.filter((p) => p.category === block.category_id);
                if (blockProducts.length === 0) return null;

                return (
                  <HomeProductShelf
                    key={block.id}
                    title={block.title || block.category_id}
                    subtitle={index % 2 === 0 ? "Seleção curada para compra rápida, retirada e comparação direta." : "Produtos que puxam busca, clique e decisão rápida na home."}
                    products={blockProducts}
                    categoryId={block.category_id}
                    bannerTitle={index % 2 === 0 ? "Pronto para retirar ou pedir no WhatsApp" : "Vitrine com foco em giro e alta intenção"}
                    bannerText={index % 2 === 0 ? "Combine catálogo online com atendimento local para confirmar estoque, fechar pedido e sair com a solução certa." : "Mantive a lógica de vitrine horizontal da referência, mas com a identidade Balão e seus fluxos locais."}
                  />
                );
              })}

              {products.length > 0 && !(activeBlocks && activeBlocks.length > 0 ? activeBlocks : homeBlocks).some((block) => products.some((p) => p.category === block.category_id)) && (
                <section className="home-panel rounded-[2rem] p-6 md:p-8">
                  <div className="mb-6">
                    <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                      Catálogo em Destaque
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--home-text)] md:text-3xl">
                      Produtos Disponíveis
                    </h2>
                  </div>
                  <ProductList products={products.slice(0, 24)} />
                </section>
              )}
            </div>
          )}

          {(category || search) && (
            <section className="home-panel rounded-[2rem] p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--home-accent)]">
                    Navegação orientada
                  </div>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--home-text)] md:text-4xl">
                    {category || `Resultados para: "${search}"`}
                  </h1>
                </div>
                <span className="rounded-full border border-[var(--home-border)] bg-[var(--home-card-soft)] px-4 py-2 text-sm font-bold text-[var(--home-muted)]">
                  {filteredProducts.length} produtos
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--home-border)] bg-[var(--home-card-bg)] px-6 py-20 text-center text-[var(--home-muted)]">
                  <p className="text-xl font-medium">Nenhum produto encontrado.</p>
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
                description="Fale com a equipe da Balão da Informática pelo WhatsApp para confirmar estoque, retirada, entrega ou assistência técnica em Campinas e região."
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
                A <strong>Balão da Informática Castelo</strong> é uma <strong>loja de informática em Campinas</strong> com foco direto em
                conversão local: <strong>PC Gamer em Campinas</strong>, <strong>notebook em Campinas</strong>, peças para upgrade,
                periféricos, SSD, memória RAM, placa de vídeo e <strong>assistência técnica em Campinas</strong> com atendimento rápido
                pelo WhatsApp. Quem procura <strong>loja de computador no Cambuí</strong>, <strong>comprar notebook em Campinas</strong>,
                <strong>upgrade de PC</strong>, <strong>conserto de notebook</strong> ou <strong>peças de informática com retirada rápida</strong>
                encontra aqui uma rota curta para tirar dúvidas, consultar estoque e fechar pedido com mais segurança.
              </p>
              <p className="mb-4 text-[var(--home-muted)]">
                Nosso atendimento comercial e técnico é orientado para <strong>Campinas</strong> e para buscas locais em bairros como
                <strong> Cambuí</strong>, <strong>Centro</strong>, <strong>Guanabara</strong>, <strong>Taquaral</strong>,
                <strong> Nova Campinas</strong>, <strong>Castelo</strong>, <strong>Chapadão</strong>, <strong>Barão Geraldo</strong>,
                <strong> Sousas</strong> e <strong>Swiss Park</strong>. Se você precisa de <strong>assistência de computador em Campinas</strong>,
                <strong> manutenção de notebook</strong>, <strong>montagem de PC Gamer</strong>, <strong>upgrade com SSD e memória</strong>,
                <strong> comprar periféricos</strong> ou <strong>retirar produto hoje</strong>, este bloco foi reforçado para deixar claro
                para Google, IA e para o cliente final que a página atende intenção comercial local real.
              </p>
              <ul className="list-none space-y-3 pl-0 text-[var(--home-muted)]">
                <li className="flex items-start gap-2">
                  <span className="text-xl">📍</span>
                  <span><strong>Loja física em Campinas:</strong> {SITE_CONFIG.address}. Presença local para quem quer comprar computador, notebook, PC Gamer, acessórios e peças com mais confiança e retirada ágil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">💬</span>
                  <span><strong>Compra com alta intenção:</strong> fale no WhatsApp para confirmar estoque, melhor configuração, preço final, retirada, prazo e disponibilidade antes de sair de casa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🚀</span>
                  <span><strong>Especialistas em Campinas:</strong> montagem de PC Gamer, upgrade de computador, troca de SSD, memória RAM, manutenção de notebooks e suporte técnico para clientes finais e empresas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">🏆</span>
                  <span><strong>Diferencial que converte:</strong> loja real, atendimento humano, assistência técnica, pós-venda e orientação comercial para quem quer comprar certo sem perder tempo.</span>
                </li>
              </ul>
            </SeoContent>
          )}
        </main>
      </div>
    </div>
  );
}
