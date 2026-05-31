import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getCategories, getProducts } from "@/lib/db";
import { parsePriceToNumber, type Category, type Product } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd from "@/components/JsonLd";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Cpu,
  Headset,
  type LucideIcon,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Categoria Premium em Campinas | Balão da Informática",
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

export const dynamic = "force-dynamic";

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

function getProductImage(product: Product): string {
  const urls = Array.isArray(product.image_urls) ? product.image_urls.filter(Boolean) : [];
  return urls[0] || product.image || "/logo.png";
}

function PremiumProductCard({ product, badge }: { product: Product; badge?: string }) {
  const href = `/product/${product.id}`;
  const imgSrc = getProductImage(product);
  const priceNum = parsePriceToNumber(product.price);
  const priceLabel = priceNum > 0 ? formatCurrency(priceNum) : product.price || "Consultar";

  return (
    <Link
      href={href}
      className="group rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#E60012]">
            {badge || "EM ESTOQUE"}
          </div>
          <div className="h-8 w-8 rounded-xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012]">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 relative aspect-[4/3] w-full rounded-2xl bg-gray-50 border border-black/5 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name || "Produto"}
            fill
            unoptimized
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-500 line-clamp-1">{product.category}</div>
          <div className="mt-1 text-base font-extrabold tracking-tight text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="text-lg font-black tracking-tight text-gray-900">{priceLabel}</div>
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E60012]/25 bg-white px-4 py-2 text-sm font-extrabold text-[#E60012] hover:bg-[#E60012]/5 transition-colors">
            Ver detalhes <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function InlineFeature({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <div className="h-9 w-9 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="font-semibold">{label}</div>
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
  const premiumWithImages = shuffleCopy(
    premiumOnly.filter((p) => Boolean(getProductImage(p) && getProductImage(p) !== "/logo.png")),
  );
  const heroImageProduct = premiumWithImages[0] || heroShowcaseProduct || premiumOnly[0];
  const heroImageSrc = heroImageProduct ? getProductImage(heroImageProduct) : "/logo.png";
  const lineImages = premiumWithImages.slice(1, 4).map((p) => getProductImage(p));

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
    <div className="min-h-screen bg-white text-gray-900">
      <JsonLd data={jsonLdData as any} />
      <Header />

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(230,0,18,0.08),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.04),transparent_55%)]" />
          <div className="container mx-auto px-4 pt-10 pb-10 sm:pt-14 sm:pb-12 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E60012]/25 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#E60012] shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Premium
                </div>

                <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.04] text-gray-900">
                  O seu sonho de ter um <span className="text-[#E60012]">PC PREMIUM</span> se realiza aqui.
                </h1>

                <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                  Curadoria premium, peças em destaque real e montagem profissional com testes rigorosos. Performance,
                  estabilidade e suporte que você sente a diferença.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#estoque"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] text-white px-6 py-3 font-extrabold transition-colors shadow-[0_14px_30px_rgba(230,0,18,0.20)]"
                  >
                    Ver Premium em destaque <ArrowRight className="h-5 w-5" />
                  </a>
                  <a
                    href={whatsAppDefault}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3 font-extrabold text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Falar no WhatsApp <MessageCircle className="h-5 w-5 text-[#E60012]" />
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <InlineFeature icon={BadgeCheck} label="Componentes de qualidade" />
                  <InlineFeature icon={Wrench} label="Montagem profissional" />
                  <InlineFeature icon={ShieldCheck} label="Garantia de verdade" />
                  <InlineFeature icon={Headset} label="Suporte especializado" />
                </div>
              </div>

              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto w-full max-w-[640px] aspect-[6/5] sm:aspect-[5/4]">
                  <div className="absolute inset-0 rounded-[44px] bg-[radial-gradient(circle_at_30%_20%,rgba(230,0,18,0.10),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.06),transparent_55%)]" />
                  <div className="absolute inset-0 rounded-[44px] border border-black/10 bg-white shadow-[0_24px_90px_rgba(0,0,0,0.10)]" />
                  <div className="absolute inset-0 p-6 sm:p-8">
                    <div className="relative h-full w-full">
                      <Image
                        src={heroImageSrc}
                        alt={heroImageProduct?.name || "PC Premium"}
                        fill
                        unoptimized
                        priority
                        className="object-contain drop-shadow-[0_24px_70px_rgba(0,0,0,0.25)]"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block absolute right-2 top-8">
                  <div className="w-56 rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">Montagem Profissional</div>
                        <div className="mt-1 text-xs text-gray-600">
                          Acabamento impecável e organização interna de alto nível.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-black/5 bg-white">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Truck, title: "Envio rápido", desc: "Para todo o Brasil" },
                  { icon: ShieldCheck, title: "Garantia total", desc: "Em todos os produtos" },
                  { icon: Headset, title: "Suporte real", desc: "Antes e depois da compra" },
                  { icon: CreditCard, title: "Até 12x sem juros", desc: "No cartão de crédito" },
                ].map((b) => (
                  <div key={b.title} className="flex items-center gap-3 rounded-3xl border border-black/10 bg-white px-4 py-4 shadow-sm">
                    <div className="h-11 w-11 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012]">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">{b.title}</div>
                      <div className="text-xs text-gray-600">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="estoque" className="py-10 sm:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">Premium do estoque</div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                  Premium em destaque
                </h2>
              </div>
              <Link
                href="/categoria/premium"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 hover:text-[#E60012] transition-colors"
              >
                Ver todos os PCs Premium <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedProducts.slice(0, 4).map((p) => (
                <PremiumProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-6 sm:hidden">
              <Link
                href="/categoria/premium"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-gray-900 hover:text-[#E60012] transition-colors"
              >
                Ver todos os PCs Premium <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-gray-50 border-y border-black/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(230,0,18,0.10),transparent_55%)]" />
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#E60012]">Monte seu PC</div>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                      Escolha a base. Personalize o resto.
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                      A gente recomenda a melhor configuração premium para seu uso e orçamento com as peças do nosso estoque.
                    </p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/monteseupc"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] text-white px-6 py-3 font-extrabold transition-colors shadow-[0_14px_30px_rgba(230,0,18,0.20)]"
                      >
                        Montar agora <ArrowRight className="h-5 w-5" />
                      </Link>
                      <a
                        href={whatsAppDefault}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3 font-extrabold text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Orçar no WhatsApp <MessageCircle className="h-5 w-5 text-[#E60012]" />
                      </a>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-3xl border border-black/10 bg-gray-50 overflow-hidden">
                    <Image
                      src={heroImageSrc}
                      alt="Ilustração Premium"
                      fill
                      unoptimized
                      className="object-contain p-6"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                {[
                  {
                    title: "Balão Gamer",
                    desc: "FPS alto e visual gamer.",
                    img: lineImages[0] || heroImageSrc,
                    msg: "Olá! Quero recomendações Premium para um PC Gamer. Meu orçamento é: (R$).",
                  },
                  {
                    title: "Balão Workstation",
                    desc: "Foco em trabalho e estabilidade.",
                    img: lineImages[1] || heroImageSrc,
                    msg: "Olá! Quero recomendações Premium para trabalho (Workstation). Meu orçamento é: (R$).",
                  },
                  {
                    title: "Balão Creator",
                    desc: "Edição, lives e criação.",
                    img: lineImages[2] || heroImageSrc,
                    msg: "Olá! Quero recomendações Premium para criação/edição/streaming. Meu orçamento é: (R$).",
                  },
                ].map((line) => (
                  <div key={line.title} className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-2xl bg-gray-50 border border-black/5 overflow-hidden">
                        <Image
                          src={line.img}
                          alt={line.title}
                          fill
                          unoptimized
                          className="object-contain p-2"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900">{line.title}</div>
                        <div className="text-sm text-gray-600">{line.desc}</div>
                      </div>
                    </div>
                    <a
                      href={buildWhatsAppLink(line.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E60012]/25 bg-white px-4 py-2.5 text-sm font-extrabold text-[#E60012] hover:bg-[#E60012]/5 transition-colors"
                    >
                      Orçar agora <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">Nosso processo premium</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
              Montagem profissional com padrão Balão
            </h2>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Entendimento do uso", desc: "Seu objetivo define a configuração ideal." },
                { title: "Peças do estoque", desc: "Disponibilidade real e custo-benefício." },
                { title: "Montagem e acabamento", desc: "Organização, airflow e estética." },
                { title: "Testes e validação", desc: "Estabilidade antes de entregar." },
              ].map((step, idx) => (
                <div key={step.title} className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold text-gray-900">{step.title}</div>
                    <div className="h-9 w-9 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012] font-black">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-gray-50 border-t border-black/5">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">Dúvidas rápidas</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">FAQ</h2>
            </div>

            <div className="mt-8 max-w-3xl mx-auto divide-y divide-black/10 rounded-[2rem] border border-black/10 bg-white overflow-hidden shadow-sm">
              {[
                {
                  q: "Os produtos mostrados aqui são do estoque do site?",
                  a: "Sim. Esta página lista produtos do mesmo catálogo do site. Atualizou no painel, atualiza aqui também.",
                },
                {
                  q: "Posso pedir um PC sob medida mesmo escolhendo um destaque?",
                  a: "Pode. Os destaques servem como base e a gente ajusta conforme seu uso, estética e orçamento.",
                },
                {
                  q: "Vocês verificam compatibilidade e estabilidade?",
                  a: "Sim. A proposta passa por validação de compatibilidade e a montagem passa por testes antes da entrega.",
                },
                {
                  q: "Entregam só em Campinas?",
                  a: "Atendemos Campinas e região, e também enviamos para outras cidades. Fale no WhatsApp para validar entrega e prazo.",
                },
              ].map((item) => (
                <details key={item.q} className="group p-5 sm:p-6">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <div className="text-base sm:text-lg font-extrabold text-gray-900">{item.q}</div>
                    <div className="h-8 w-8 rounded-2xl bg-[#E60012]/10 border border-[#E60012]/15 flex items-center justify-center text-[#E60012] group-open:rotate-45 transition-transform">
                      +
                    </div>
                  </summary>
                  <div className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="rounded-[2.25rem] border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#E60012]">Último passo</div>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                    Bora montar sua próxima máquina?
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl">
                    Fale com um especialista e receba uma proposta coerente com seu uso, seu orçamento e as peças do nosso estoque.
                  </p>
                </div>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E60012] hover:bg-[#cc0010] text-white px-8 py-4 font-extrabold transition-colors shadow-[0_14px_30px_rgba(230,0,18,0.20)]"
                >
                  Falar no WhatsApp <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
              Loja física em Campinas (Cambuí) • {SITE_CONFIG.address}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
