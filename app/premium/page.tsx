import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PremiumConfigurator from "@/app/premium/PremiumConfigurator";
import { getCategories, getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import { parsePriceToNumber, type Category, type Product } from "@/lib/utils";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Gauge,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  type LucideIcon,
  Wrench,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "PC Premium em Campinas | Montagem Personalizada Balão da Informática",
  description:
    "Monte seu PC Premium no Balão da Informática com orientação especialista, peças selecionadas, montagem profissional, testes completos e suporte real em Campinas.",
  keywords: [
    "pc premium campinas",
    "montagem premium campinas",
    "pc gamer premium campinas",
    "workstation campinas",
    "pc personalizado campinas",
    "montar pc premium",
    "balão da informática premium",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.balao.info/premium" },
  openGraph: {
    title: "PC Premium em Campinas | Balão da Informática",
    description:
      "Computadores gamers, workstations e máquinas personalizadas montadas por especialistas para quem exige desempenho, estética e confiança.",
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
    title: "PC Premium em Campinas | Balão da Informática",
    description:
      "Monte seu PC Premium com atendimento consultivo, montagem profissional e suporte real em Campinas.",
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

function findCategoryBySlug(slug: string, categories: Category[]) {
  return categories.find((category) => category.slug === slug);
}

function getDescendantNames(root: Category | undefined, categories: Category[]) {
  if (!root) return [];
  const descendants: string[] = [];
  const stack = [root.id];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const children = categories.filter((category) => category.parent_id === currentId);

    children.forEach((child) => {
      descendants.push(child.name);
      stack.push(child.id);
    });
  }

  return descendants;
}

function ProductTile({
  product,
  eyebrow,
  priority,
}: {
  product: Product;
  eyebrow?: string;
  priority?: boolean;
}) {
  const href = `/product/${product.id}`;
  const imgSrc = product.image || "/logo.png";
  const priceNum = parsePriceToNumber(product.price);
  const priceLabel = priceNum > 0 ? formatCurrency(priceNum) : product.price || "Consultar";

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,21,24,0.88),rgba(10,10,12,0.96))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_28px_110px_rgba(0,0,0,0.45)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(230,0,18,0.12),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex flex-col gap-5">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#ffffff,#f0f0f0)] p-4">
          <Image
            src={imgSrc}
            alt={product.name || "Produto premium"}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-3">
          {eyebrow ? (
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-200/90">
              {eyebrow}
            </div>
          ) : null}

          <div className="text-lg font-black leading-snug tracking-tight text-white line-clamp-2 sm:text-xl">
            {product.name}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="line-clamp-1 text-sm text-zinc-400">{product.category || "Premium"}</div>
            <div className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-black text-white">
              {priceLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-zinc-300">
          <span>Ver detalhes</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function SpotlightCard({ product }: { product: Product }) {
  const priceNum = parsePriceToNumber(product.price);
  const priceLabel = priceNum > 0 ? formatCurrency(priceNum) : product.price || "Consultar";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block overflow-hidden rounded-[36px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-red-300/30"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(230,0,18,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-red-100">
              <Star className="h-3.5 w-3.5 text-red-300" />
              Destaque Premium
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              {product.name}
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white">
            {priceLabel}
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#ffffff,#ececec)]">
          <Image
            src={product.image || "/logo.png"}
            alt={product.name || "Produto premium em destaque"}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 50vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Peças selecionadas",
            "Validação técnica",
            "Montagem com acabamento",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-zinc-100"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-black text-white">
          Ver máquina e detalhes
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-300 hover:border-white/20">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-300/15 bg-red-500/10 text-red-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>
    </div>
  );
}

function PresetCard({
  title,
  description,
  href,
  highlights,
}: {
  title: string;
  description: string;
  href: string;
  highlights: string[];
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,0,18,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_36%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col">
        <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-red-100">
          Linha premium
        </div>
        <h3 className="mt-5 text-2xl font-black tracking-tight text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>

        <div className="mt-6 space-y-3">
          {highlights.map((highlight) => (
            <div key={highlight} className="flex items-start gap-3 text-sm text-zinc-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-sm font-black text-white">
          Usar esta base no configurador
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function ExampleMachineCard({
  title,
  description,
  specs,
  message,
}: {
  title: string;
  description: string;
  specs: string[];
  message: string;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl">
      <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-300">
        Máquina exemplo
      </div>
      <h3 className="mt-4 text-2xl font-black tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{description}</p>

      <div className="mt-5 space-y-2">
        {specs.map((spec) => (
          <div key={spec} className="flex items-start gap-3 text-sm text-zinc-100">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <span>{spec}</span>
          </div>
        ))}
      </div>

      <a
        href={buildWhatsAppLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/12"
      >
        Solicitar orçamento
        <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  );
}

function ProcessStep({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-300/20 bg-red-500/10 text-base font-black text-red-100">
            {String(index).padStart(2, "0")}
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">{title}</h3>
        </div>
        <Workflow className="h-5 w-5 text-zinc-500" />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-zinc-300">{description}</p>
    </div>
  );
}

export default async function PremiumPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const premiumCategory = findCategoryBySlug("premium", categories);
  const validCategories = new Set<string>();

  if (premiumCategory?.name) {
    validCategories.add(premiumCategory.name);
    getDescendantNames(premiumCategory, categories).forEach((name) => validCategories.add(name));
  }

  const premiumOnly = products.filter((product) => {
    if (validCategories.size > 0) return validCategories.has(product.category);
    return normalize(product.category) === "premium";
  });

  const sorted = [...premiumOnly].sort((a, b) => {
    const priceA = parsePriceToNumber(a.price);
    const priceB = parsePriceToNumber(b.price);
    if (priceA === 0 && priceB === 0) return 0;
    if (priceA === 0) return 1;
    if (priceB === 0) return -1;
    return priceB - priceA;
  });

  const spotlightProduct = sorted[0];
  const featured = sorted.slice(0, Math.min(3, sorted.length));
  const stockPool = sorted.slice(featured.length);
  const stock = shuffleCopy(stockPool).slice(0, Math.min(6, stockPool.length));
  const displayedProducts = [...featured, ...stock].filter((product) => product?.id);

  const whatsAppDefault = buildWhatsAppLink(
    "Olá! Quero montar um PC Premium no Balão da Informática. Pode me ajudar a escolher a melhor configuração para meu uso e orçamento?"
  );
  const pageUrl = "https://www.balao.info/premium";
  const storeUrl = "https://www.balao.info";

  const faqItems = [
    {
      q: "O Balão monta PC gamer personalizado?",
      a: "Sim. Você escolhe o perfil ideal e a equipe ajusta as peças para desempenho, estética, refrigeração e orçamento.",
    },
    {
      q: "Posso escolher as peças do meu computador?",
      a: "Pode. Você pode mandar preferências de marcas, modelos e objetivos, e a equipe valida compatibilidade e alternativas.",
    },
    {
      q: "Vocês ajudam a escolher a configuração ideal?",
      a: "Sim. O atendimento é consultivo e considera tipo de uso, resolução, softwares, estética e orçamento disponível.",
    },
    {
      q: "A máquina já vai pronta para usar?",
      a: "Vai pronta, com montagem, testes e validações. Se precisar, também orientamos instalação e ajustes iniciais.",
    },
    {
      q: "Posso montar um PC para trabalho profissional?",
      a: "Sim. Workstations para arquitetura, engenharia, renderização, edição e produtividade fazem parte do foco premium.",
    },
    {
      q: "Vocês atendem empresas e fazem upgrade depois?",
      a: "Sim. Atendemos empresas e também planejamos expansão quando faz sentido, incluindo RAM, SSD, GPU e refrigeração.",
    },
    {
      q: "Como faço para pedir orçamento?",
      a: "Basta clicar em um dos botões de WhatsApp, enviar seu perfil de uso ou sua configuração e a equipe retorna com a proposta.",
    },
  ];

  const jsonLdData = [
    {
      "@type": "WebPage",
      "@id": pageUrl,
      url: pageUrl,
      name: "PC Premium em Campinas | Balão da Informática",
      description:
        "Monte seu PC Premium com orientação especialista, configuração personalizada e suporte real em Campinas.",
      inLanguage: "pt-BR",
      isPartOf: { "@type": "WebSite", "@id": storeUrl, url: storeUrl, name: SITE_CONFIG.name },
      about: { "@type": "Thing", name: "PC Premium" },
    },
    {
      "@type": "ComputerStore",
      "@id": `${storeUrl}/#store`,
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
      itemListElement: displayedProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.balao.info/product/${product.id}`,
        name: product.name,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    },
  ];

  return (
    <div className="bg-[#070709] text-white">
      <JsonLd data={jsonLdData as any} />
      <Header />

      <main className="overflow-hidden">
        <section className="relative isolate border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,0,18,0.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.11),transparent_24%),linear-gradient(180deg,#070709_0%,#0f1013_48%,#070709_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="container relative mx-auto px-4 pb-18 pt-16 sm:pb-24 sm:pt-20">
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-red-100 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-red-300" />
                  Montagem premium em Campinas/SP
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-[5.5rem]">
                  Seu <span className="text-red-200">PC Premium</span> começa aqui.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-200 sm:text-xl">
                  Computadores gamers, workstations e máquinas personalizadas montadas por especialistas para quem exige
                  desempenho, estética e confiança.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#monte"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff4d5a,#e60012)] px-6 py-4 text-base font-black tracking-tight text-white shadow-[0_18px_70px_rgba(230,0,18,0.34)] transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-110"
                  >
                    Montar meu PC Premium
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <a
                    href={whatsAppDefault}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-4 text-base font-black tracking-tight text-white backdrop-blur transition-colors duration-300 hover:bg-white/10"
                  >
                    Falar com especialista no WhatsApp
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: BadgeCheck, title: "Montagem especializada" },
                    { icon: Cpu, title: "Configuração personalizada" },
                    { icon: ShieldCheck, title: "Suporte técnico" },
                    { icon: MapPin, title: "Loja física em Campinas" },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/10 bg-white/6 p-4 text-center backdrop-blur-xl"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-red-200">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="mt-3 text-sm font-black leading-snug text-white">{item.title}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-200">
                  {[
                    "Cable management e acabamento premium",
                    "Testes completos antes da entrega",
                    "Peças selecionadas e compatibilidade",
                    "Upgrade e manutenção quando precisar",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {spotlightProduct ? <SpotlightCard product={spotlightProduct} /> : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      icon: Gauge,
                      title: premiumOnly.length > 0 ? `${premiumOnly.length}+ opções premium` : "Projeto sob medida",
                      description: "Produtos de alto padrão e configurações personalizadas com apoio consultivo.",
                    },
                    {
                      icon: PackageCheck,
                      title: "Fluxo completo",
                      description: "Da escolha das peças ao pós-venda, tudo passa por validação técnica e testes.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[26px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-red-200">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="mt-4 text-lg font-black tracking-tight text-white">{item.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-b border-white/10 bg-[#090a0d] py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_85%_10%,rgba(230,0,18,0.14),transparent_28%)]" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Autoridade e confiança</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Nao e so um computador. E uma maquina montada por quem entende.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Ha anos no ramo da informatica, o Balao da Informatica atende clientes que buscam computadores
                confiaveis, bonitos e preparados para jogos, trabalho, edicao, engenharia, arquitetura, streaming e
                produtividade.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  icon: Sparkles,
                  title: "Atendimento especialista",
                  description: "Entendemos objetivo, software, resolucao, estetica e orçamento antes de sugerir a configuracao.",
                },
                {
                  icon: MapPin,
                  title: "Loja fisica em Campinas",
                  description: "Base local para retirada, suporte presencial e acompanhamento real do projeto.",
                },
                {
                  icon: Blocks,
                  title: "Pecas selecionadas",
                  description: "Escolha orientada por compatibilidade, desempenho, airflow, ruido e vida util do conjunto.",
                },
                {
                  icon: ShieldCheck,
                  title: "Testes antes da entrega",
                  description: "A maquina passa por verificacoes e validacao de estabilidade antes de chegar ate voce.",
                },
                {
                  icon: PackageCheck,
                  title: "Suporte pos-venda",
                  description: "Voce continua amparado para ajustes, duvidas, upgrades e orientacoes depois da compra.",
                },
                {
                  icon: Wrench,
                  title: "Upgrade e manutencao",
                  description: "Projetos pensados para evoluir quando fizer sentido, sem gambiarra e sem improviso.",
                },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="linhas" className="relative border-b border-white/10 py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.07),transparent_24%),radial-gradient(circle_at_100%_20%,rgba(230,0,18,0.12),transparent_26%),linear-gradient(180deg,#070709_0%,#0b0c10_100%)]" />
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Linhas premium</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Escolha a linha certa para o seu estilo de uso.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                  Quatro linhas proprias do Balao da Informatica para facilitar seu orçamento e acelerar a escolha do
                  conjunto ideal. Depois, personalizamos tudo no configurador.
                </p>
              </div>

              <a
                href="#monte"
                className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/10"
              >
                Ir para configuracao detalhada
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Balão Gamer",
                  description:
                    "PCs para rodar seus jogos favoritos com desempenho, visual gamer e possibilidade de upgrade.",
                  href: "/premium?preset=gamer-start#monte",
                  highlights: ["Jogos competitivos e AAA", "Estética gamer com airflow", "Base ideal para upgrades"],
                },
                {
                  title: "Balão Workstation",
                  description:
                    "Máquinas para arquitetura, engenharia, edição, renderização e produtividade profissional.",
                  href: "/premium?preset=workstation-pro#monte",
                  highlights: ["Foco em estabilidade", "Criação, render e softwares técnicos", "Componentes pensados para trabalho"],
                },
                {
                  title: "Balão Creator",
                  description:
                    "Computadores para criadores de conteúdo, lives, edição, design e produção audiovisual.",
                  href: "/premium?preset=gamer-ultra#monte",
                  highlights: ["Multitarefa pesada", "Streaming e exportação rápida", "Setup equilibrado para criação"],
                },
                {
                  title: "Balão Extreme",
                  description:
                    "Projetos exclusivos para quem quer potência máxima, acabamento premium e presença de vitrine.",
                  href: "/premium?preset=extreme#monte",
                  highlights: ["Máximo desempenho", "Estética diferenciada", "Projeto 100% personalizado"],
                },
              ].map((item) => (
                <PresetCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  href={item.href}
                  highlights={item.highlights}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="monte" className="relative border-b border-white/10 bg-[#090a0d] py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(230,0,18,0.12),transparent_22%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.08),transparent_22%)]" />
          <div className="container relative mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Configuração detalhada</div>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                    Personalize peca por peca.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-zinc-300">
                    Escolha processador, placa de video, memoria, SSD, gabinete e muito mais. Depois envie sua
                    configuração para um especialista do Balão da Informática montar o orçamento ideal.
                  </p>

                  <div className="mt-7 space-y-3">
                    {[
                      "Processador para jogos, edição e render",
                      "GPU alinhada com resolução, FPS e softwares",
                      "RAM, SSD, refrigeração e gabinete sob medida",
                      "Resumo final pronto para envio no WhatsApp",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-zinc-100">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-5">
                    <div className="text-sm font-black text-white">Orçamento sob medida</div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                      Se preferir, você também pode mandar só seu uso e sua faixa de investimento que a equipe monta a
                      melhor proposta.
                    </p>
                    <a
                      href={buildWhatsAppLink(
                        "Olá! Quero montar um computador do meu jeito. Meu uso é: ( ). Meu orçamento é: (R$). Pode me ajudar com uma proposta Premium?"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff4d5a,#e60012)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_60px_rgba(230,0,18,0.28)] transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Pedir ajuda no WhatsApp
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <Suspense
                  fallback={
                    <div className="rounded-[32px] border border-white/10 bg-white/6 p-8 text-sm text-zinc-300 backdrop-blur-xl">
                      Carregando configurador premium...
                    </div>
                  }
                >
                  <PremiumConfigurator />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-b border-white/10 py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(230,0,18,0.10),transparent_24%),linear-gradient(180deg,#070709_0%,#0b0c10_100%)]" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Máquinas exemplo</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Projetos para voce se orientar antes de personalizar.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                Sem preço fixo: cada projeto é ajustado conforme estoque, objetivo, marcas desejadas e acabamento
                premium.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ExampleMachineCard
                title="PC Gamer Performance"
                description="Indicado para Fortnite, Valorant, GTA V, CS2 e jogos competitivos."
                specs={["Intel Core i5 ou Ryzen 5", "16GB RAM", "SSD NVMe", "Placa de vídeo dedicada"]}
                message="Olá, quero solicitar orçamento para um PC Gamer Performance. Meu uso é: Fortnite, Valorant, GTA V, CS2 e jogos competitivos."
              />
              <ExampleMachineCard
                title="PC Gamer Ultra"
                description="Indicado para Full HD/2K, streaming e multitarefas."
                specs={["Intel Core i7 ou Ryzen 7", "32GB RAM", "SSD NVMe 1TB", "GPU de alta performance"]}
                message="Olá, quero solicitar orçamento para um PC Gamer Ultra. Meu uso é: Full HD/2K, streaming e multitarefas."
              />
              <ExampleMachineCard
                title="Workstation Profissional"
                description="Indicado para AutoCAD, Revit, SketchUp, Blender, Premiere e render."
                specs={[
                  "Processador de alto desempenho",
                  "32GB ou 64GB RAM",
                  "SSD NVMe",
                  "GPU profissional ou gamer de alta performance",
                ]}
                message="Olá, quero solicitar orçamento para uma Workstation Profissional. Meu uso é: AutoCAD, Revit, SketchUp, Blender, Premiere e render."
              />
              <ExampleMachineCard
                title="Projeto Exclusivo Premium"
                description="Indicado para setup unico com gabinete diferenciado, RGB e acabamento premium."
                specs={["Configuração 100% personalizada", "Montagem sob medida", "Organização de cabos", "Testes completos"]}
                message="Olá, quero solicitar orçamento para um Projeto Exclusivo Premium. Meu uso é: setup unico com gabinete diferenciado, RGB e acabamento premium."
              />
            </div>
          </div>
        </section>

        <section id="estoque" className="relative border-b border-white/10 bg-[#090a0d] py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.06),transparent_20%),radial-gradient(circle_at_88%_0%,rgba(230,0,18,0.12),transparent_24%)]" />
          <div className="container relative mx-auto px-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Premium em estoque</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Produtos premium do estoque e bases para novos projetos.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                  Veja destaques do catálogo atual e use cada item como referência para um setup mais personalizado.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/categoria/premium"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-white/10"
                >
                  Ver categoria Premium
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsAppDefault}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-zinc-200"
                >
                  Receber recomendação rápida
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayedProducts.map((product, index) => (
                  <ProductTile
                    key={product.id}
                    product={product}
                    eyebrow={index < featured.length ? "Destaque Premium" : "Selecionado para você"}
                    priority={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-[32px] border border-white/10 bg-white/6 p-8 text-center backdrop-blur-xl">
                <div className="text-2xl font-black tracking-tight text-white">Nenhum produto premium encontrado agora.</div>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                  Mesmo sem itens publicados no catálogo, você ainda pode usar o configurador acima e pedir um projeto
                  personalizado no WhatsApp.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <a
                    href="#monte"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff4d5a,#e60012)] px-6 py-3 text-sm font-black text-white"
                  >
                    Abrir configurador
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={whatsAppDefault}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-6 py-3 text-sm font-black text-white"
                  >
                    Pedir orçamento
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative border-b border-white/10 py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(230,0,18,0.10),transparent_20%),radial-gradient(circle_at_80%_35%,rgba(255,255,255,0.06),transparent_26%)]" />
          <div className="container relative mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Processo premium</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Como funciona seu projeto premium.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                  Um passo a passo simples, direto e com validação técnica para você receber um PC pronto para usar.
                </p>

                <div className="mt-8 rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
                  <div className="text-lg font-black text-white">Compra segura, montagem profissional e suporte de verdade.</div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    Conte com uma loja especializada em Campinas e um atendimento que acompanha você antes, durante e
                    depois da compra.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Você fala com um especialista",
                    description: "O primeiro passo é entender com clareza seu cenário, suas prioridades e o estilo de máquina que você imagina.",
                  },
                  {
                    title: "Entendemos seu uso e orçamento",
                    description: "Jogos, trabalho, criação, empresa ou projeto híbrido: a recomendação nasce do seu contexto real.",
                  },
                  {
                    title: "Escolhemos as peças ideais",
                    description: "Selecionamos componentes pensando em desempenho, compatibilidade, estética, refrigeração e custo-benefício.",
                  },
                  {
                    title: "Montamos e testamos sua máquina",
                    description: "A configuração passa por montagem cuidadosa, organização de cabos e validação antes da entrega.",
                  },
                  {
                    title: "Você recebe seu PC pronto para usar",
                    description: "O resultado é uma máquina coerente com seu objetivo, com apoio para uso, expansão e manutenção futura.",
                  },
                ].map((step, index) => (
                  <ProcessStep
                    key={step.title}
                    index={index + 1}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-b border-white/10 bg-[#090a0d] py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(230,0,18,0.10),transparent_20%),radial-gradient(circle_at_5%_40%,rgba(255,255,255,0.05),transparent_22%)]" />
          <div className="container relative mx-auto px-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Montagem com padrão premium</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Compatibilidade, acabamento e estabilidade no mesmo projeto.
                </h2>
                <div className="mt-6 space-y-3">
                  {[
                    "Compatibilidade e desempenho alinhados ao seu uso",
                    "Acabamento e organização de cabos",
                    "Refrigeração dimensionada para estabilidade",
                    "Recomendações honestas para custo-benefício",
                    "Checklist e validação antes de entregar",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-zinc-100">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-7 backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Campinas e região</div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  PC Gamer Premium em Campinas é no Balão da Informática.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
                  Se você procura um PC gamer Campinas, uma workstation Campinas ou um computador gamer personalizado
                  para jogos, trabalho, edição, arquitetura, engenharia ou streaming, o Balão da Informática monta a
                  configuração ideal para o seu perfil.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    "Montar PC gamer com orientação",
                    "PC para arquitetura e engenharia",
                    "PC para edição de vídeo e criação",
                    "Computador premium com acabamento",
                  ].map((item) => (
                    <div key={item} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="relative py-18 sm:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(230,0,18,0.10),transparent_22%),linear-gradient(180deg,#070709_0%,#090a0d_100%)]" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Dúvidas frequentes</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">FAQ</h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                Respostas rápidas para você tomar a decisão com segurança.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-white/6 backdrop-blur-xl">
              {faqItems.map((item) => (
                <details key={item.q} className="group border-b border-white/10 p-6 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-left text-lg font-black tracking-tight text-white">{item.q}</span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-zinc-300 transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300 sm:text-base">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 pb-18 pt-10 sm:pb-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(230,0,18,0.16),transparent_26%),radial-gradient(circle_at_80%_100%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="container relative mx-auto px-4">
            <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-12">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">Pronto para começar?</div>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                    Monte seu novo PC Premium com orientação real.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                    Envie sua configuração ou descreva o que você precisa. A equipe do Balão retorna com uma proposta
                    coerente com seu uso, seu orçamento e as peças disponíveis.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#monte"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-6 py-4 text-base font-black text-white transition-colors hover:bg-white/12"
                  >
                    Abrir configurador
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <a
                    href={whatsAppDefault}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff4d5a,#e60012)] px-6 py-4 text-base font-black text-white shadow-[0_18px_70px_rgba(230,0,18,0.34)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Chamar no WhatsApp
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
