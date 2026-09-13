import Header from "@/components/Header";
import ProductList from "@/components/ProductList";
import LenisProvider from "@/components/LenisProvider";
import SeoContent from "@/components/SeoContent";
import JsonLd, { generateHomeAiAndGoogleSchema } from "@/components/JsonLd";
import QuickLeadSection from "@/components/QuickLeadSection";
import Carousel from "@/components/Carousel";
import { getCachedProducts, getCachedProductsByExactCategories } from "@/lib/cache";
import { getCachedBlogDaHome, getCachedCategories, getCachedCarouselImages } from "@/lib/cache";
import { parsePriceToNumber, Product, type Category, getProductHref } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  MessageCircle,
  ChevronRight,
  Flame,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  MapPin,
  Clock,
  BadgePercent,
  Truck,
  Cpu,
  Laptop,
  Monitor,
  HardDrive,
  Keyboard,
  Printer,
  Wrench,
  Package,
  Star,
  Sparkles,
} from "lucide-react";

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

// helpers
function formatOldPrice(price: string) {
  const v = Number(price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  if (Number.isNaN(v) || v <= 0) return null;
  return (v * 1.18).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function WhiteShelf({
  title,
  subtitle,
  categorySlug,
  products,
  badge,
  countLabel,
}: {
  title: string;
  subtitle: string;
  categorySlug: string;
  products: Product[];
  badge: string;
  countLabel?: string;
}) {
  if (!products || products.length === 0) return null;
  const list = products.slice(0, 8);
  return (
    <section className="w-full rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-7 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#E60012] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm">
              {badge}
            </span>
            {countLabel && (
              <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                {countLabel}
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Pronta Entrega
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-[#111827] tracking-tight mt-2.5">{title}</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>
        </div>
        <Link
          href={`/categoria/${encodeURIComponent(categorySlug)}`}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-3 rounded-xl bg-white border border-[#E60012]/20 text-sm font-black text-[#E60012] hover:bg-[#E60012] hover:text-white hover:border-[#E60012] transition-all shadow-sm group"
        >
          <span>Ver todos</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {list.map((product) => {
          const href = getProductHref(product);
          const oldPrice = formatOldPrice(product.price);
          return (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#E60012]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[10px] font-black uppercase text-[#E60012] border border-red-100">
                    <Flame size={12} className="fill-[#E60012]" /> Oferta
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">Estoque Campinas</span>
                </div>
                <Link href={href} className="relative aspect-square w-full block overflow-hidden rounded-xl bg-white p-2 border border-slate-100">
                  <Image
                    src={product.image || "/logo.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300 bg-white"
                    unoptimized
                  />
                </Link>
                <Link href={href} className="block mt-3">
                  <h3 className="text-[13px] sm:text-sm font-bold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#E60012] transition-colors min-h-[38px] sm:min-h-[40px]">
                    {product.name}
                  </h3>
                </Link>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div>
                  {oldPrice && <div className="text-[11px] text-slate-400 line-through">De {oldPrice}</div>}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-xl font-black text-[#111827] tracking-tight">{product.price}</span>
                    <span className="text-[10px] font-black uppercase text-[#E60012]">no PIX</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">ou até 12x sem juros</div>
                </div>
                <div className="space-y-2">
                  <Link
                    href={href}
                    className="w-full py-3 px-3 rounded-xl bg-[#E60012] hover:bg-[#cc0010] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition-all active:scale-[0.98]"
                  >
                    <ShoppingCart size={14} /> Comprar
                  </Link>
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(`Olá! Quero ${product.name} (${product.price}) - vi em balao.info`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 text-center text-xs font-bold text-slate-600 hover:text-[#E60012] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={13} className="text-[#E60012]" /> Tirar dúvida no Whats
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  let products: Product[] = [];
  let categories: Category[] = [];
  let carouselImages: any[] = [];
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
    products = products.filter((p) => {
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

  const pcGamerProducts = sortRelevance(
    products.filter((p) => p.category === "Computadores" || p.name.toLowerCase().includes("pc gamer") || p.name.toLowerCase().includes("computador gamer"))
  );
  const notebookProducts = sortRelevance(
    products.filter((p) => p.category === "Notebooks" || p.name.toLowerCase().includes("notebook") || p.name.toLowerCase().includes("macbook"))
  );
  const monitorProducts = sortRelevance(
    products.filter(
      (p) =>
        (p.category === "Monitores" || p.category.startsWith("Monitores/") || p.name.toLowerCase().includes("monitor")) &&
        !p.name.toLowerCase().includes("suporte") &&
        !p.name.toLowerCase().includes("cabo") &&
        !p.name.toLowerCase().includes("adaptador")
    )
  );
  const isHardware = (c: string) => c === "Hardware" || c.startsWith("Hardware/");
  const isPeriferico = (c: string) => c === "Periféricos" || c === "Perifericos" || c.startsWith("Periféricos/") || c.startsWith("Perifericos/");
  const hardwareProducts = sortRelevance(products.filter((p) => isHardware(p.category)));
  const perifericoProducts = sortRelevance(
    products.filter(
      (p) =>
        isPeriferico(p.category) ||
        p.name.toLowerCase().includes("teclado") ||
        p.name.toLowerCase().includes("mouse") ||
        p.name.toLowerCase().includes("headset")
    )
  );
  const impressoraProducts = sortRelevance(products.filter((p) => p.category === "Impressão" || p.category === "Impressao" || p.category.startsWith("Impressão/") || p.category.startsWith("Impressao/")));

  const dealOfTheDay = pcGamerProducts[0] || hardwareProducts[0] || products[0] || null;

  const hasFilter = Boolean(search || (category && category !== "Todos os Produtos"));

  return (
    <LenisProvider>
      <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#111827] font-sans">
        <JsonLd data={generateHomeAiAndGoogleSchema()} />
        <Header />

        {/* FAIXA VERMELHA PROMOCIONAL — sempre branca/vermelha */}
        {!hasFilter && (
          <div className="w-full bg-[#E60012] text-white">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
              <span className="bg-white text-[#E60012] px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-widest uppercase animate-pulse">Semana do Hardware</span>
              <span className="text-sm sm:text-[15px] font-black tracking-wide flex items-center gap-2">
                <Sparkles size={16} className="hidden sm:inline" /> ATÉ 40% OFF • 12x sem juros • Retire no Cambuí em 2h
              </span>
              <span className="hidden lg:inline text-white/80 text-xs">• Frete grátis acima de R$ 299 •</span>
              <Link href="/categoria/hardware" className="ml-1 bg-white text-[#E60012] px-3 py-1 rounded-full text-xs font-black hover:bg-slate-100 transition-colors">
                Ver ofertas →
              </Link>
            </div>
          </div>
        )}

        {/* segunda faixa informativa branca com borda vermelha sutil */}
        {!hasFilter && (
          <div className="w-full bg-white border-b border-slate-200">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Loja aberta • Av. Anchieta, 789 - Cambuí</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline-flex items-center gap-1.5"><Clock size={12} className="text-[#E60012]" /> Seg-Sex 09h-18h • Sáb 09h-13h</span>
              </div>
              <div className="flex items-center gap-3 text-[#E60012]">
                <span className="inline-flex items-center gap-1"><BadgePercent size={14} /> 10% OFF no PIX</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1"><Truck size={14} /> Entrega expressa Campinas</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO */}
        {!hasFilter ? (
          <div className="w-full bg-[#ffffff]">
            {/* BANNER CARROSSEL GIGANTE */}
            <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 pt-4">
              <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-white border border-slate-200 shadow-sm">
                {carouselImages.length > 0 ? (
                  <Carousel images={carouselImages} />
                ) : (
                  <div className="py-14 px-8 text-center bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-[1.5rem]">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012] text-white text-xs font-black uppercase tracking-widest">Balão da Informática • 1288 produtos</span>
                    <h1 className="mt-4 text-3xl sm:text-5xl font-black text-[#111827] tracking-tight">
                      Hardware, <span className="text-[#E60012]">PC Gamer</span> e Setup Completo em Campinas
                    </h1>
                    <p className="mt-3 text-slate-500 max-w-3xl mx-auto">
                      1000 hardwares, 100 PCs gamer, 33 notebooks, 20 monitores, 35 impressoras e 100 periféricos com até 40% OFF.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Link href="/categoria/hardware" className="px-6 py-3 rounded-xl bg-[#E60012] text-white font-black text-sm">Ver Hardwares</Link>
                      <Link href="/categoria/computadores" className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-[#111827] font-black text-sm">PCs Gamer</Link>
                    </div>
                  </div>
                )}
                {/* h1 SEO oculto quando tem carrossel */}
                {carouselImages.length > 0 && (
                  <h1 className="sr-only">Balão da Informática — Hardware, PC Gamer, Notebooks e Monitores em Campinas — 1288 produtos com até 40% OFF</h1>
                )}
              </div>

              {/* faixas rápidas abaixo do banner */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                {[
                  { label: "Hardware", href: "/categoria/hardware", sub: "1000 produtos", icon: HardDrive },
                  { label: "PCs Gamer", href: "/categoria/computadores", sub: "100 montados", icon: Cpu },
                  { label: "Notebooks", href: "/categoria/notebooks", sub: "33 modelos", icon: Laptop },
                  { label: "Monitores", href: "/categoria/monitores", sub: "20 telas • 144Hz+", icon: Monitor },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      key={c.label}
                      href={c.href}
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#E60012]/30 hover:shadow-md transition-all"
                    >
                      <span className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E60012] group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-sm font-black text-[#111827] group-hover:text-[#E60012]">{c.label}</span>
                        <span className="block text-xs font-bold text-slate-500">{c.sub}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* marcas - versão BRANCA */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 shadow-sm flex items-center gap-3 overflow-hidden">
                <span className="hidden sm:inline-flex shrink-0 rounded-full bg-[#E60012] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Marcas oficiais • 1288 produtos</span>
                <span className="sm:hidden shrink-0 rounded-full bg-[#E60012] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">Marcas</span>
                <div className="relative flex-1 overflow-hidden">
                  <div className="flex w-max min-w-full items-center gap-2 py-1 pr-2 animate-[brand-carousel-marquee_34s_linear_infinite]">
                    {[...["Intel","AMD","NVIDIA","Kingston","Logitech","Corsair","Gigabyte","MSI","ASUS","Dell","HP","Epson","Canon","Balão.info"], ...["Intel","AMD","NVIDIA","Kingston","Logitech","Corsair","Gigabyte","MSI","ASUS","Dell","HP","Epson","Canon","Balão.info"]].map((brand, i) => (
                      <Link
                        key={`${brand}-${i}`}
                        href={`/?search=${encodeURIComponent(brand)}`}
                        className="flex-none whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-[#111827] hover:border-[#E60012] hover:text-[#E60012] hover:bg-red-50 transition-colors"
                      >
                        {brand}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* TRUST PILLARS — BRANCO/VERMELHO */}
            <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Zap, title: "Retirada no Cambuí em 2h", desc: "Compre online e retire no balcão ou receba com entrega expressa.", badge: "Rápido", href: SITE_CONFIG.mapsUrl, external: true, cta: "Ver no mapa" },
                  { icon: ShieldCheck, title: "Garantia & Laboratório próprio", desc: "Bancada técnica para reparos, upgrades e diagnósticos.", badge: "Garantia real", href: "/manutencao", external: false, cta: "Assistência" },
                  { icon: CreditCard, title: "12x sem juros ou 10% no PIX", desc: "Pague no cartão sem juros ou economize no PIX.", badge: "Melhor condição", href: "/promocao", external: false, cta: "Ver promoções" },
                  { icon: MessageCircle, title: "Atendimento especialista", desc: "Fale com técnicos de verdade no WhatsApp.", badge: "Online agora", href: `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Vim pelo site da Balão e quero atendimento.")}`, external: true, cta: "Chamar no Whats" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const Card = (
                    <div className="group h-full flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#E60012]/30 hover:shadow-md transition-all hover:-translate-y-1">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E60012] group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                            <Icon size={20} />
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-[#E60012]">{item.badge}</span>
                        </div>
                        <h3 className="text-[15px] font-black text-[#111827] leading-snug group-hover:text-[#E60012] transition-colors">{item.title}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#E60012]">
                        <span>{item.cta}</span>
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                  return item.external ? (
                    <a key={idx} href={item.href} target="_blank" rel="noreferrer" className="h-full">{Card}</a>
                  ) : (
                    <Link key={idx} href={item.href} className="h-full">{Card}</Link>
                  );
                })}
              </div>
            </section>

            {/* CORPO: MENU ESQUERDA + PRATELEIRAS */}
            <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 mt-8 pb-8">
              <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
                {/* MENU DEPARTAMENTOS — BRANCO */}
                <aside className="w-full lg:w-[300px] xl:w-[340px] shrink-0 space-y-5">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-100">
                      <span className="h-9 w-9 rounded-xl bg-[#E60012] text-white flex items-center justify-center"><Zap size={18} /></span>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-[#111827]">Departamentos</h2>
                        <span className="text-xs font-semibold text-slate-500">Navegue por categoria</span>
                      </div>
                    </div>
                    <nav className="space-y-1">
                      {[
                        { label: "Hardware — 1000 produtos", slug: "hardware", icon: HardDrive, badge: "RTX & Ryzen" },
                        { label: "PCs Gamer — 100 montados", slug: "computadores", icon: Cpu, badge: "Destaque" },
                        { label: "Notebooks — 33 modelos", slug: "notebooks", icon: Laptop, badge: "Pronta entrega" },
                        { label: "Monitores — 20 telas", slug: "monitores", icon: Monitor, badge: "144Hz • 240Hz" },
                        { label: "Setup Gamer — 100 itens", slug: "perifericos", icon: Keyboard, badge: "RGB" },
                        { label: "Impressoras — 35 modelos", slug: "impressao", icon: Printer, badge: "Wi-Fi • Tanque" },
                        { label: "Games & Consoles", slug: "games", icon: Cpu, badge: "" },
                        { label: "Redes & Segurança", slug: "seguranca", icon: ShieldCheck, badge: "" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.slug}
                            href={`/categoria/${item.slug}`}
                            className="group flex items-center justify-between p-3 rounded-xl text-sm font-bold text-[#111827] hover:bg-red-50 hover:text-[#E60012] border border-transparent hover:border-red-100 transition-all"
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <Icon size={18} className="text-[#E60012] shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </span>
                            {item.badge ? (
                              <span className="shrink-0 text-[10px] font-black uppercase px-2 py-1 rounded-full bg-red-50 text-[#E60012] border border-red-100">{item.badge}</span>
                            ) : (
                              <ChevronRight size={16} className="text-slate-300 group-hover:text-[#E60012]" />
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                      <Link href="/pcgamer" className="flex-1 text-center px-3 py-2.5 rounded-xl bg-[#E60012] text-white text-xs font-black uppercase">PC Gamer</Link>
                      <Link href="/promocao" className="flex-1 text-center px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-[#111827] text-xs font-black uppercase hover:border-[#E60012]/30">Ofertas</Link>
                    </div>
                  </div>

                  {/* OFERTA DO DIA — BRANCA */}
                  {dealOfTheDay && (
                    <div className="rounded-[1.5rem] border border-red-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                        <span className="inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-widest text-[#111827]"><Flame size={18} className="text-[#E60012]" /> Oferta do dia</span>
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-[#E60012] text-white">Imperdível</span>
                      </div>
                      <Link href={getProductHref(dealOfTheDay)} className="group block">
                        <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-white p-3 border border-slate-200">
                          <Image src={dealOfTheDay.image || "/logo.png"} alt={dealOfTheDay.name} fill sizes="200px" className="object-contain p-2 group-hover:scale-105 transition-transform bg-white" unoptimized />
                        </div>
                        <h3 className="mt-3 text-sm font-bold text-[#111827] line-clamp-2 group-hover:text-[#E60012] leading-snug">{dealOfTheDay.name}</h3>
                        <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3">
                          <span className="text-xs font-black uppercase text-[#E60012]">À vista no PIX</span>
                          <span className="text-lg font-black text-[#111827]">{dealOfTheDay.price}</span>
                        </div>
                        <span className="mt-3 w-full inline-flex justify-center py-3 rounded-xl bg-[#E60012] text-white text-xs font-black uppercase">Comprar agora</span>
                      </Link>
                    </div>
                  )}

                  {/* LOJA FÍSICA — BRANCA */}
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={18} className="text-[#E60012]" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-[#111827]">Loja Física Cambuí</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      {SITE_CONFIG.address}. Chame no WhatsApp para confirmar disponibilidade para retirada imediata no balcão.
                    </p>
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent("Olá! Quero confirmar disponibilidade para retirada no Cambuí.")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E60012] hover:bg-[#cc0010] text-white font-black text-xs uppercase shadow-md transition-colors"
                    >
                      <MessageCircle size={16} /> Chamar no WhatsApp
                    </a>
                  </div>
                </aside>

                {/* PRATELEIRAS PRINCIPAIS — 8 PRODUTOS CADA */}
                <div className="flex-1 min-w-0 space-y-6">
                  <WhiteShelf
                    title="⚡ Hardware em Oferta — 1000 produtos"
                    subtitle="Placas RTX/Radeon, Ryzen/Intel, SSD NVMe, DDR5 e tudo para seu upgrade com até 40% OFF e 12x sem juros."
                    categorySlug="hardware"
                    products={hardwareProducts}
                    badge="Mais vendido"
                    countLabel="1000 produtos"
                  />
                  <WhiteShelf
                    title="🚀 PCs Gamer Montados — 100 máquinas"
                    subtitle="Prontas para jogar, testadas e com garantia. Monte seu setup completo com a Balão."
                    categorySlug="computadores"
                    products={pcGamerProducts}
                    badge="Pronta entrega"
                    countLabel="100 PCs"
                  />
                  <WhiteShelf
                    title="💻 Notebooks — 33 modelos"
                    subtitle="Gamer, ultrafinos e para trabalho — todos com SSD e garantia. Retire no Cambuí."
                    categorySlug="notebooks"
                    products={notebookProducts}
                    badge="Notebooks"
                    countLabel="33 notebooks"
                  />
                </div>
              </div>

              {/* VTRINE MONITORES — BRANCA FULL WIDTH */}
              {monitorProducts.length > 0 && (
                <div className="mt-6">
                  <WhiteShelf
                    title="🖥️ Monitores Gamer & UltraWide — 20 telas"
                    subtitle="IPS 144Hz, 165Hz, 240Hz e 4K — 1ms, cores vivas e garantia. A vitrine mais completa de Campinas."
                    categorySlug="monitores"
                    products={monitorProducts}
                    badge="Vitrine especial"
                    countLabel="20 monitores"
                  />
                </div>
              )}

              <div className="mt-6 space-y-6">
                <WhiteShelf
                  title="🎧 Setup Gamer Completo — 100 produtos"
                  subtitle="Teclados mecânicos, mouses 8K, headsets 7.1 e cadeiras gamer. Monte seu setup dos sonhos."
                  categorySlug="perifericos"
                  products={perifericoProducts}
                  badge="Setup Gamer"
                  countLabel="100 produtos"
                />
                <WhiteShelf
                  title="🖨️ Impressoras — 35 modelos"
                  subtitle="Jato de tinta, laser e tanque com Wi-Fi — Epson, HP e Canon com economia real."
                  categorySlug="impressao"
                  products={impressoraProducts}
                  badge="Impressão"
                  countLabel="35 impressoras"
                />
              </div>

              {/* BLOG — BRANCO */}
              {blogPosts.length > 0 && (
                <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#E60012] text-white text-[10px] font-black uppercase tracking-widest">Conteúdo & Dicas</span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight mt-2">📰 Blog Balão da Informática</h2>
                      <p className="text-xs sm:text-sm text-slate-500">Guias técnicos e comparativos preparados pelos nossos especialistas.</p>
                    </div>
                    <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-[#111827] hover:border-[#E60012]/30 hover:text-[#E60012] transition-colors">
                      Ver todos os artigos <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {blogPosts.slice(0, 3).map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#E60012]/30 hover:shadow-md transition-all hover:-translate-y-1">
                        <div>
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 mb-3">
                            <Image src={post.cover_image || "/logo.png"} alt={post.title} fill sizes="350px" className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                            <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black uppercase text-[#E60012]">{post.category || "Informática"}</span>
                          </div>
                          <h3 className="text-sm font-bold text-[#111827] line-clamp-2 leading-snug group-hover:text-[#E60012]">{post.title}</h3>
                          {post.excerpt && <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#E60012]">
                          <span>Ler artigo</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* LOJA LOCAL — BRANCA */}
              <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E60012]">📍 Visite Nossa Loja Física</span>
                    <h2 className="mt-4 text-2xl font-black tracking-tight text-[#111827]">Balão da Informática Castelo</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">Traga seu equipamento para diagnóstico, retire seus produtos comprados no site ou monte sua máquina dos sonhos no balcão.</p>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                        <div>
                          <span className="block text-sm font-bold text-[#111827]">Endereço</span>
                          <span className="text-xs text-slate-500">{SITE_CONFIG.address} • CEP {SITE_CONFIG.postalCode}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                        <div>
                          <span className="block text-sm font-bold text-[#111827]">Horário</span>
                          <span className="text-xs text-slate-500">{SITE_CONFIG.openingHoursDisplay}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MessageCircle className="mt-0.5 shrink-0 text-[#E60012]" size={20} />
                        <div>
                          <span className="block text-sm font-bold text-[#111827]">Contato</span>
                          <span className="text-xs text-slate-500">Tel: {SITE_CONFIG.phone.display} • Whats: {SITE_CONFIG.whatsapp.display}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E60012] px-6 py-3 text-sm font-black text-white shadow-md hover:bg-[#cc0010]"> <MapPin size={16} /> Como chegar</a>
                    <a href={`https://wa.me/${SITE_CONFIG.whatsapp.number}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-[#111827] hover:border-[#E60012]/30 hover:text-[#E60012]"> <MessageCircle size={16} className="text-[#E60012]" /> Falar com vendedor</a>
                  </div>
                </div>
                <div className="lg:col-span-6 grid grid-rows-3 gap-3">
                  {[
                    { label: "Balcão & Atendimento", desc: "Av. Anchieta, Cambuí", icon: Package },
                    { label: "Laboratório Técnico", desc: "Reparos e Upgrades de PC/Notebook", icon: Wrench },
                    { label: "Estoque & Peças", desc: "Hardware a Pronta Entrega", icon: HardDrive },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-5 hover:border-[#E60012]/20 hover:shadow-sm transition-all">
                        <span className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#E60012] group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                          <Icon size={22} />
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-[#111827] group-hover:text-[#E60012]">{item.label}</h4>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                <div className="text-center max-w-xl mx-auto mb-6">
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#E60012]">⭐ Avaliações no Google</span>
                  <h3 className="mt-3 text-xl font-black text-[#111827]">Quem Compra em Campinas Recomenda</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Marcos S.", loc: "Cambuí - Campinas", text: "Fui à loja física no Cambuí montar meu PC Gamer. Atendimento técnico fantástico, escolhi as peças e retirei no mesmo dia. Nota 10!" },
                    { name: "Júlia R.", loc: "Barão Geraldo - Campinas", text: "Melhor assistência de notebooks de Campinas. Meu aparelho não ligava; levei de manhã e de tarde já estava pronto e formatado." },
                    { name: "Felipe M.", loc: "Sumaré - SP", text: "Comprei RTX 4070 Super pelo Whats. Moro em Sumaré e entregaram via motoboy em menos de 2 horas!" },
                  ].map((t, i) => (
                    <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-[#E60012]/20 transition-colors">
                      <div className="flex gap-1 text-[#E60012] mb-3">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={14} className="fill-current" />
                        ))}
                      </div>
                      <p className="text-xs italic leading-relaxed text-slate-600">“{t.text}”</p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                        <span className="font-black text-[#111827]">{t.name}</span>
                        <span className="font-semibold text-slate-500">{t.loc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-6">
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

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <SeoContent title="HARDWARE, PC GAMER E SETUP COMPLETO EM CAMPINAS - 1288 PRODUTOS COM 40% OFF">
                  <p className="mb-4 text-slate-600">
                    A <strong>Balão da Informática Castelo</strong> reabriu sua loja virtual com <strong>1288 produtos curados</strong>: <strong>1000 hardwares</strong> (RTX, Ryzen, Intel, SSD NVMe, DDR5), <strong>100 PCs gamer</strong> montados, <strong>33 notebooks</strong>, <strong>20 monitores</strong>, <strong>35 impressoras</strong> e <strong>100 periféricos gamer</strong>. Tudo com <strong>até 40% OFF</strong> nessa segunda e <strong>12x sem juros</strong>. Retire no Cambuí em 2h ou receba com entrega expressa. ChatGPT, Perplexity e Google já indexam nosso catálogo via <code>llms.txt</code> e <code>sitemap.xml</code> com 1288 URLs.
                  </p>
                </SeoContent>
              </div>
            </section>
          </div>
        ) : (
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20 py-6 bg-[#ffffff]">
            <section className="rounded-[1.5rem] p-6 md:p-8 border border-slate-200 bg-white shadow-sm">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#E60012]">Catálogo • 1288 produtos</div>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-[#111827] md:text-3xl">{category || `Resultados para: "${search}"`}</h1>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">{products.length} produtos</span>
              </div>
              {products.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center text-slate-500">
                  <p className="text-lg font-semibold">Nenhum produto encontrado para esta busca.</p>
                  <Link href="/" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#E60012] text-white text-sm font-black">Voltar à home</Link>
                </div>
              ) : (
                <ProductList products={products} />
              )}
            </section>
          </div>
        )}
      </div>
    </LenisProvider>
  );
}
