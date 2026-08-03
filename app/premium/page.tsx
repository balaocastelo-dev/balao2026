import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import PremiumPromoCountdown from "@/components/PremiumPromoCountdown";
import { getCategories, getProducts } from "@/lib/db";
import { getProductHref, parsePriceToNumber, type Category, type Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd from "@/components/JsonLd";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  type LucideIcon,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Categoria Premium em Campinas",
  description:
    "Produtos Premium em Campinas (Cambuí): seleção especial do Balão da Informática com disponibilidade no site/estoque, garantia e suporte real. Confira a categoria Premium.",
  keywords: [
    "categoria premium",
    "produtos premium",
    "premium campinas",
    "premium cambuí",
    "ofertas premium",
    "linha premium",
    "produto premium em estoque",
    "loja de informática campinas",
    "balão da informática",
    "cambuí campinas informática",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.balao.info/premium" },
  openGraph: {
    title: "Categoria Premium em Campinas | Balão da Informática",
    description:
      "Confira a categoria Premium do Balão da Informática: produtos premium do estoque, garantia e suporte real em Campinas.",
    type: "website",
    url: "https://www.balao.info/premium",
    images: [
      {
        url: "https://www.balao.info/logo.png",
        width: 512,
        height: 512,
        alt: "Balão da Informática",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Categoria Premium em Campinas | Balão da Informática",
    description:
      "Confira a categoria Premium do Balão da Informática: produtos premium do estoque, garantia e suporte real em Campinas.",
    images: ["https://www.balao.info/logo.png"],
  },
  other: {
    "geo.region": "BR-SP",
    "geo.placename": "Campinas",
    "geo.position": "-22.9099;-47.0626",
    ICBM: "-22.9099, -47.0626",
  },
};

export const revalidate = 600;

function normalize(text: string) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getPromoPricing(priceText: string) {
  const original = parsePriceToNumber(priceText);
  if (original <= 0) return null;
  return {
    original,
    promo: original * 0.5,
  };
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

function shuffleCopy<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ProductTile({
  product,
  eyebrow,
}: {
  product: Product;
  eyebrow?: string;
}) {
  const href = getProductHref(product);
  const imgSrc = product.image || "/logo.png";
  const promoPricing = getPromoPricing(product.price);
  const promoLabel = promoPricing ? formatCurrency(promoPricing.promo) : product.price || "Consultar";
  const originalLabel = promoPricing ? formatCurrency(promoPricing.original) : null;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,27,0.72),rgba(0,0,0,0.72))] backdrop-blur-xl transition-all hover:border-amber-200/20 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_58%)] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-5 sm:p-6 flex flex-col gap-4">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-white border border-zinc-200 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
          <Image
            src={imgSrc}
            alt={product.name || "Produto"}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <div className="flex flex-col gap-2">
          {eyebrow ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
              {eyebrow}
            </div>
          ) : null}
          <div className="text-lg sm:text-xl font-black tracking-tight text-white line-clamp-2 leading-snug">
            {product.name}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-zinc-400 text-sm line-clamp-1">{product.category}</div>
            <div className="shrink-0 rounded-full bg-gradient-to-r from-red-200 via-white to-red-100 px-3 py-1 text-sm font-black tracking-tight text-[#E60012]">
              50% OFF
            </div>
          </div>
        </div>

        <div className="mt-1">
          {originalLabel ? <div className="text-sm font-semibold text-zinc-500 line-through">{originalLabel}</div> : null}
          <div className="text-2xl font-black tracking-tight text-red-300">{promoLabel}</div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100/85">
            Promoção de 06 a 13 de julho
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-zinc-400">Ver detalhes</span>
          <ArrowRight className="w-4 h-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function FeaturedShowcase({ product }: { product: Product }) {
  const href = getProductHref(product);
  const imgSrc = product.image || "/logo.png";
  const promoPricing = getPromoPricing(product.price);
  const promoLabel = promoPricing ? formatCurrency(promoPricing.promo) : product.price || "Consultar";
  const originalLabel = promoPricing ? formatCurrency(promoPricing.original) : null;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[linear-gradient(180deg,rgba(24,24,27,0.70),rgba(0,0,0,0.78))] backdrop-blur-xl transition-all hover:border-amber-200/30 hover:shadow-[0_28px_110px_rgba(0,0,0,0.60)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(251,191,36,0.14),transparent_55%)] opacity-80" />
      <div className="relative p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-200/85">
              Promoção Premium
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight leading-tight line-clamp-2">
              {product.name}
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-gradient-to-r from-red-200 via-white to-red-100 px-4 py-2 text-sm font-black tracking-tight text-[#E60012]">
            50% OFF
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          {originalLabel ? <div className="text-lg font-semibold text-zinc-500 line-through">{originalLabel}</div> : null}
          <div className="text-3xl font-black tracking-tight text-red-300">{promoLabel}</div>
        </div>

        <div className="mt-6 relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-white border border-zinc-200 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.18)]">
          <Image
            src={imgSrc}
            alt={product.name || "Produto"}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white text-black px-5 py-3 font-black tracking-tight shadow-[0_18px_70px_rgba(255,255,255,0.10)]">
          Ver detalhes <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

function InfoTile({
  eyebrow,
  title,
  desc,
  href,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  href?: string;
  icon: LucideIcon;
}) {
  const content = (
    <div className="relative p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/80">{eyebrow}</div>
        <Icon className="w-5 h-5 text-amber-200/80" />
      </div>
      <div className="text-xl font-black tracking-tight">{title}</div>
      <div className="text-sm text-zinc-300 leading-relaxed">{desc}</div>
      {href ? (
        <div className="mt-1 inline-flex items-center gap-2 text-sm font-black text-white">
          Ver agora <ArrowRight className="w-4 h-4 text-white/80" />
        </div>
      ) : null}
    </div>
  );

  const cls =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-colors";

  if (href) {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_60%)] opacity-0 hover:opacity-100 transition-opacity" />
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={cls}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_60%)] opacity-0 hover:opacity-100 transition-opacity" />
        {content}
      </Link>
    );
  }

  return (
    <div className={cls}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_transparent_60%)] opacity-0 hover:opacity-100 transition-opacity" />
      {content}
    </div>
  );
}

export default async function PremiumPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const findBySlug = (s: string, all: Category[]) => all.find((c) => c.slug === s);
  const premiumCategory = findBySlug("premium", categories);

  const getDescendantNames = (root: Category | undefined, all: Category[]) => {
    if (!root) return [];
    const descendants: string[] = [];
    const stack = [root.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = all.filter((c) => c.parent_id === currentId);
      children.forEach((child) => {
        descendants.push(child.name);
        stack.push(child.id);
      });
    }
    return descendants;
  };

  const validCategories = new Set<string>();
  if (premiumCategory?.name) {
    validCategories.add(premiumCategory.name);
    getDescendantNames(premiumCategory, categories).forEach((n) => validCategories.add(n));
  }

  const premiumOnly = products.filter((p) => {
    if (validCategories.size > 0) return validCategories.has(p.category);
    return normalize(p.category) === "premium";
  });

  const sorted = [...premiumOnly].sort((a, b) => {
    const priceA = parsePriceToNumber(a.price);
    const priceB = parsePriceToNumber(b.price);
    if (priceA === 0 && priceB === 0) return 0;
    if (priceA === 0) return 1;
    if (priceB === 0) return -1;
    return priceB - priceA;
  });

  const featuredTarget = 6;
  const listTarget = 30;

  const featured = sorted.slice(0, Math.min(featuredTarget, sorted.length));
  const remaining = sorted.slice(featured.length);
  const stock = shuffleCopy(remaining).slice(0, Math.min(listTarget - featured.length, remaining.length));
  const heroShowcaseProduct = stock[0] || featured[0];

  const whatsAppDefault = buildWhatsAppLink(
    "Olá! Quero conhecer a categoria Premium do Balão da Informática. Pode me recomendar os melhores itens do estoque para o meu uso e orçamento?"
  );

  const displayedProducts = [...featured, ...stock].filter((p) => p?.id);
  const pageUrl = "https://www.balao.info/premium";
  const storeUrl = "https://www.balao.info";
  const jsonLdData = [
    {
      "@type": "WebPage",
      "@id": pageUrl,
      url: pageUrl,
      name: "Categoria Premium em Campinas | Balão da Informática",
      description:
        "Produtos Premium em Campinas (Cambuí): seleção especial do Balão da Informática com disponibilidade no site/estoque, garantia e suporte real.",
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", "@id": storeUrl, url: storeUrl, name: SITE_CONFIG.name },
      about: { "@type": "Thing", name: "Categoria Premium" },
    },
    {
      "@type": "ComputerStore",
      "@id": storeUrl,
      name: SITE_CONFIG.name,
      url: storeUrl,
      telephone: `+${SITE_CONFIG.phone.number}`,
      email: SITE_CONFIG.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE_CONFIG.address,
        addressLocality: "Campinas",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      geo: { "@type": "GeoCoordinates", latitude: -22.9099, longitude: -47.0626 },
      sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
    },
    {
      "@type": "ItemList",
      url: pageUrl,
      numberOfItems: displayedProducts.length,
      itemListElement: displayedProducts.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.balao.info/product/${p.id}`,
        name: p.name,
      })),
    },
  ];

  return (
    <div className="bg-black text-white">
      <JsonLd data={jsonLdData} />
      <Header />

      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-100/90 backdrop-blur">
                <Sparkles className="w-4 h-4 text-amber-200/80" />
                Montagem premium em Campinas/SP
              </div>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] max-w-none">
                <span className="block">O seu sonho de ter um</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400">
                  PC PREMIUM
                </span>
                <span className="block">se realiza aqui.</span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-200/90 leading-relaxed max-w-[44rem]">
                Uma seleção premium do nosso estoque. Itens escolhidos para quem quer qualidade, desempenho e segurança
                na compra, com suporte de verdade em Campinas.
              </p>

              <PremiumPromoCountdown />

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#estoque"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E60012] to-red-500 text-white px-6 py-3 font-black tracking-tight shadow-[0_18px_70px_rgba(230,0,18,0.28)] hover:brightness-110 transition-all ring-1 ring-amber-200/25"
                >
                  Ver Premium em estoque
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200/20 bg-white/5 px-6 py-3 font-black tracking-tight hover:bg-white/10 transition-colors backdrop-blur"
                >
                  Falar no WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  { icon: BadgeCheck, title: "Acabamento premium", desc: "Cable management e estética impecável." },
                  { icon: ShieldCheck, title: "Testes completos", desc: "Validação de estabilidade antes da entrega." },
                  { icon: Wrench, title: "Projeto sob medida", desc: "Compatibilidade e upgrades planejados." },
                  { icon: PackageCheck, title: "Loja física", desc: "Campinas com suporte e pós-venda." },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-amber-200/20"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-amber-200/80" />
                      <div className="text-sm font-black">{item.title}</div>
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>

              {heroShowcaseProduct ? (
                <div className="pt-2">
                  <FeaturedShowcase product={heroShowcaseProduct} />
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-6">
              {featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.map((p) => (
                    <ProductTile key={p.id} product={p} eyebrow="Premium" />
                  ))}
                  {featured.length < featuredTarget ? (
                    <>
                      <InfoTile
                        eyebrow="Categoria"
                        title="Ver todos os Premium"
                        desc="Abra a categoria Premium completa e navegue por todos os itens do estoque."
                        href="/categoria/premium"
                        icon={Sparkles}
                      />
                      <InfoTile
                        eyebrow="Suporte"
                        title="Ajuda para escolher"
                        desc="Fale com um especialista e receba indicação do melhor Premium para seu uso e orçamento."
                        href={whatsAppDefault}
                        icon={MessageCircle}
                      />
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
                  <div className="text-2xl font-black tracking-tight">Sem produtos Premium cadastrados</div>
                  <div className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    Cadastre produtos na categoria Premium para aparecerem aqui automaticamente.
                  </div>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/admin/produtos"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black hover:bg-zinc-200 transition-colors shadow-[0_18px_70px_rgba(255,255,255,0.08)]"
                    >
                      Cadastrar produtos
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                      href={whatsAppDefault}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-black hover:bg-white/10 transition-colors backdrop-blur"
                    >
                      Pedir orçamento
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm font-black tracking-tight">Quer um projeto único?</div>
                    <div className="text-sm text-zinc-300">
                      Diga seu uso e orçamento. A gente monta uma proposta com peças do nosso estoque.
                    </div>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      "Olá! Quero uma indicação de produtos da categoria Premium. Meu uso é: ( ). Meu orçamento é: (R$). Pode me ajudar?"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E60012] to-red-500 px-6 py-3 font-black hover:brightness-110 transition-all shadow-[0_18px_70px_rgba(230,0,18,0.22)]"
                  >
                    Montar comigo
                    <Cpu className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="estoque" className="relative py-14 sm:py-20 bg-zinc-950 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_10%_30%,rgba(230,0,18,0.08),transparent_45%)]" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Seleção premium</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Premium do estoque</h2>
            </div>
            <Link
              href="/categoria/premium"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-black hover:bg-white/10 transition-colors"
            >
              Ver categoria Premium
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stock.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
            {stock.length % 3 === 1 ? (
              <>
                <InfoTile
                  eyebrow="Premium"
                  title="Retire no Cambuí"
                  desc="Loja física em Campinas para retirada e suporte presencial."
                  icon={PackageCheck}
                />
                <InfoTile
                  eyebrow="Garantia"
                  title="Compra segura"
                  desc="Suporte e pós-venda do Balão da Informática para te acompanhar."
                  icon={ShieldCheck}
                />
              </>
            ) : null}
            {stock.length % 3 === 2 ? (
              <InfoTile
                eyebrow="WhatsApp"
                title="Recomendação rápida"
                desc="Diga seu objetivo e orçamento e a gente aponta o melhor Premium do estoque."
                href={whatsAppDefault}
                icon={MessageCircle}
              />
            ) : null}
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-lg font-black">Não achou o ideal?</div>
                <div className="text-sm text-zinc-300">
                  A gente te ajuda a escolher um Premium ideal para seu uso e orçamento.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/monteseupc"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black hover:bg-zinc-200 transition-colors shadow-[0_18px_70px_rgba(255,255,255,0.08)]"
                >
                  Montar agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-black hover:bg-white/10 transition-colors backdrop-blur"
                >
                  Orçar no WhatsApp
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20 bg-black border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.06),transparent_42%),radial-gradient(circle_at_85%_40%,rgba(167,139,250,0.08),transparent_45%)]" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Linhas premium</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Escolha a base. Personalize o resto.</h2>
            <p className="text-zinc-300 mt-3 max-w-3xl mx-auto">
              Quatro linhas autorais do Balão da Informática para acelerar sua escolha. Depois, ajustamos com peças do
              nosso estoque, do seu jeito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Balão Gamer",
                desc: "FPS alto, visual gamer e upgrades planejados. Ideal para quem joga competitivo e quer um setup bonito.",
                cta: "Quero recomendações Premium",
              },
              {
                title: "Balão Workstation",
                desc: "Estabilidade e performance para AutoCAD, Revit, render e produtividade. Configuração pensada para trabalho.",
                cta: "Quero opções Premium para trabalho",
              },
              {
                title: "Balão Creator",
                desc: "Edição, lives e criação de conteúdo com fluidez. Peças selecionadas para multitarefa e exportação rápida.",
                cta: "Quero opções Premium para criação",
              },
              {
                title: "Balão Extreme",
                desc: "Projeto exclusivo para quem quer o máximo: potência, acabamento e estética de vitrine.",
                cta: "Quero um projeto Premium",
              },
            ].map((line) => (
              <div
                key={line.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-white/20 transition-colors"
              >
                <div className="text-xl font-black tracking-tight">{line.title}</div>
                <div className="text-sm text-zinc-300 mt-2 leading-relaxed">{line.desc}</div>
                <a
                  href={buildWhatsAppLink(
                    `Olá! ${line.cta} no Balão da Informática. Meu uso é: (jogos/trabalho/edição). Meu orçamento é: (R$). Pode sugerir uma configuração com peças do estoque?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-black px-5 py-3 font-black hover:bg-zinc-200 transition-colors w-full justify-center shadow-[0_18px_70px_rgba(255,255,255,0.08)]"
                >
                  Orçar agora
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20 bg-zinc-950 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(230,0,18,0.08),transparent_48%),radial-gradient(circle_at_90%_70%,rgba(255,255,255,0.05),transparent_52%)]" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">SEO e localização</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
                Produtos Premium em Campinas é no Balão da Informática.
              </h2>
              <p className="text-zinc-300 mt-4 leading-relaxed">
                Se você busca <strong className="text-white">produtos Premium</strong> em Campinas, com compra segura,
                disponibilidade real no estoque e suporte pós-venda, esta é a página certa. Estamos no{" "}
                <strong className="text-white">Cambuí</strong> e atendemos Campinas e região, com envio para outras cidades.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Palavras-chave principais",
                  desc: "categoria premium, produtos premium, premium em campinas, premium cambuí, itens premium em estoque, comprar premium.",
                },
                {
                  title: "Localização (GEO)",
                  desc: `${SITE_CONFIG.address}. Atendimento em Campinas/SP e região.`,
                },
                {
                  title: "Perfis de uso",
                  desc: "Upgrade premium, setup premium, trabalho, criação e alta performance com curadoria do Balão.",
                },
                {
                  title: "O que você recebe",
                  desc: "Atendimento, suporte e recomendação certa para você comprar com tranquilidade.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-white/20 transition-colors"
                >
                  <div className="text-sm font-black tracking-tight">{card.title}</div>
                  <div className="text-sm text-zinc-300 mt-3 leading-relaxed">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20 bg-black border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(167,139,250,0.08),transparent_45%),radial-gradient(circle_at_10%_60%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Processo premium</div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
                Montagem profissional, do primeiro orçamento ao pós-venda.
              </h2>
              <p className="text-zinc-300 mt-4 leading-relaxed">
                Você não compra só peças. Você recebe uma máquina pronta, validada e acompanhada por quem monta e dá
                suporte.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Entendimento do uso",
                  desc: "Jogos, trabalho ou criação. A configuração nasce do seu objetivo, não de um template genérico.",
                },
                {
                  title: "Peças do estoque",
                  desc: "Priorizamos disponibilidade e custo-benefício, com alternativas equivalentes quando necessário.",
                },
                {
                  title: "Montagem e acabamento",
                  desc: "Organização, airflow e estética. Sem improviso, sem gambiarra.",
                },
                {
                  title: "Testes e validação",
                  desc: "Estabilidade antes de entregar. O objetivo é ligar e usar sem dor de cabeça.",
                },
              ].map((step, idx) => (
                <div
                  key={step.title}
                  className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black tracking-tight">{step.title}</div>
                    <div className="text-xs font-black text-white/70 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300 mt-3 leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20 bg-zinc-950 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_45%)]" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">FAQ</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Dúvidas rápidas</h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-white/10 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
            {[
              {
                q: "Os produtos mostrados aqui são do meu estoque do site?",
                a: "Sim. Esta página lista produtos carregados do mesmo catálogo do site. Se você cadastrar/atualizar no painel, aqui atualiza junto.",
              },
              {
                q: "Posso pedir um PC sob medida mesmo escolhendo um destaque?",
                a: "Pode. Os destaques servem como base. A gente ajusta a recomendação conforme seu uso, estética e orçamento.",
              },
              {
                q: "Vocês verificam compatibilidade e estabilidade?",
                a: "Sim. A proposta passa por validação de compatibilidade e a montagem passa por testes antes da entrega.",
              },
              {
                q: "Entregam só em Campinas?",
                a: "Atendemos Campinas e região, e também enviamos para outras cidades. O melhor caminho é falar no WhatsApp para validar entrega e prazo.",
              },
            ].map((item) => (
              <details key={item.q} className="group p-6">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <div className="text-lg font-black">{item.q}</div>
                  <div className="text-white/70 group-open:rotate-45 transition-transform">+</div>
                </summary>
                <div className="mt-3 text-zinc-300 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-20 bg-black border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(230,0,18,0.12),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(167,139,250,0.10),transparent_45%)]" />
        <div className="container mx-auto px-4">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Último passo</div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
                  Bora montar sua próxima máquina?
                </h2>
                <p className="text-zinc-300 mt-3 max-w-2xl leading-relaxed">
                  Fale com um especialista e receba uma proposta coerente com seu uso, seu orçamento e as peças do nosso
                  estoque.
                </p>
              </div>
              <a
                href={whatsAppDefault}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E60012] to-red-500 px-8 py-4 font-black text-lg hover:brightness-110 transition-all shadow-[0_18px_70px_rgba(230,0,18,0.28)]"
              >
                Chamar no WhatsApp
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
