import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import {
  CAMPINAS_NEIGHBORHOODS,
  getNeighborhoodBySlug,
  getNeighborhoodWhatsAppUrl,
} from "@/lib/neighborhood-seo";
import { MapPin, ArrowRight, MessageCircle, Truck, ShieldCheck, Clock, Zap, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ neighborhood: string }>;
};

export async function generateStaticParams() {
  return CAMPINAS_NEIGHBORHOODS.map((n) => ({
    neighborhood: n.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhood: slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    return {
      title: "Bairro não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `Informática no ${neighborhood.name} em Campinas | Loja e Assistência Técnica | Balão da Informática`;
  const description = `Loja de informática e assistência técnica atendendo o bairro ${neighborhood.name} em Campinas. Venda de PCs, notebooks, periféricos, conserto de notebook e reparos Apple com entrega rápida.`;
  const canonical = `https://www.balao.info/bairro/${neighborhood.slug}`;

  return {
    title,
    description,
    keywords: neighborhood.localKeywords,
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
  };
}

const neighborhoodFaqs = [
  {
    question: "Como funciona a entrega e atendimento para o meu bairro?",
    answer:
      "Moradores e empresas deste bairro contam com atendimento prioritário, entrega expressa via motoboy ou retirada rápida em nossa loja física no Cambuí.",
  },
  {
    question: "A assistência técnica busca o equipamento no local?",
    answer:
      "Sim! Oferecemos o serviço de leva e traz para retirada de notebooks, computadores e videogames em seu endereço.",
  },
  {
    question: "Os produtos contam com garantia de loja física?",
    answer:
      "Sim! Todos os produtos e serviços contam com garantia legal com suporte direto no balcão e 10% de desconto à vista no PIX.",
  },
];

export default async function NeighborhoodPage({ params }: Props) {
  const { neighborhood: slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    notFound();
  }

  const [allProducts, keywordMatches] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["notebook", "ssd", "gamer", "fonte", "memoria"], 8),
  ]);

  let displayProducts = keywordMatches.length > 0 ? keywordMatches : allProducts.slice(0, 8);

  const canonical = `https://www.balao.info/bairro/${neighborhood.slug}`;
  const whatsappUrl = getNeighborhoodWhatsAppUrl(neighborhood);
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Bairros de Campinas", item: "https://www.balao.info/regiao" },
    { name: neighborhood.name, item: canonical },
  ];
  const nearbyNeighborhoods = CAMPINAS_NEIGHBORHOODS.filter((item) => item.slug !== neighborhood.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, canonical),
          generateServiceSchema({
            name: `Loja de Informática e Assistência Técnica no ${neighborhood.name}`,
            description: `Venda de computadores, notebooks e assistência técnica especializada no bairro ${neighborhood.name} em Campinas.`,
            url: canonical,
            serviceType: "Varejo de Informática e Assistência Técnica Local",
          }),
          generateFAQSchema(neighborhoodFaqs),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <MapPin className="w-4 h-4" />
                Atendimento no Bairro {neighborhood.name}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Loja de Informática & Assistência no <span className="text-[#E60012]">{neighborhood.name}</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                {neighborhood.description}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir no WhatsApp para {neighborhood.name}
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Motoboy</p>
                  <p className="text-xs text-slate-400">Entrega Rápida</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">90 Dias</p>
                  <p className="text-xs text-slate-400">Garantia Balão</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">10% OFF</p>
                  <p className="text-xs text-slate-400">À Vista no PIX</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Cambuí</p>
                  <p className="text-xs text-slate-400">Loja Física</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja Balão da Informática</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos com Entrega no {neighborhood.name}
              </h2>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte entrega no seu bairro <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* OUTROS BAIRROS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Veja também outros bairros de Campinas:</h3>
            <div className="flex flex-wrap gap-3">
              {nearbyNeighborhoods.map((nb) => (
                <Link
                  key={nb.slug}
                  href={`/bairro/${nb.slug}`}
                  className="rounded-2xl border border-slate-700 bg-[#161f32] px-4 py-2 text-sm font-bold text-slate-300 hover:border-[#E60012] hover:text-white transition"
                >
                  Informática no {nb.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Atendimento no {neighborhood.name}</h2>
          </div>

          <div className="space-y-4">
            {neighborhoodFaqs.map((faq, idx) => (
              <div key={idx} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E60012]" />
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed pl-4">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
              <MapPin className="w-4 h-4" />
              Sua Loja Física de Referência em Campinas
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Compre ou Conserte seu Equipamento com Tranquilidade
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Atendimento no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
