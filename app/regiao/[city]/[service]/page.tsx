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
  REGIONAL_CITIES,
  REGIONAL_SERVICES,
  buildRegionalServicePath,
  buildRegionalWhatsAppUrl,
  getRegionalCity,
  getRegionalService,
} from "@/lib/local-seo";
import { MapPin, ArrowRight, MessageCircle, Truck, ShieldCheck, Clock, Zap, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string; service: string }>;
};

export async function generateStaticParams() {
  return REGIONAL_CITIES.flatMap((city) =>
    REGIONAL_SERVICES.map((service) => ({
      city: city.slug,
      service: service.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getRegionalCity(citySlug);
  const service = getRegionalService(serviceSlug);

  if (!city || !service) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const title = `${service.shortName} em ${city.name} | Balão da Informática`;
  const description = `${service.headline} em ${city.name}. ${service.description} Atendimento rápido, WhatsApp e suporte da Balão da Informática.`;
  const canonical = `https://www.balao.info${buildRegionalServicePath(city.slug, service.slug)}`;

  return {
    title,
    description,
    keywords: [
      `${service.shortName.toLowerCase()} ${city.name.toLowerCase()}`,
      `informatica ${city.name.toLowerCase()}`,
      `assistencia tecnica ${city.name.toLowerCase()}`,
      "balao da informatica campinas regiao",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title,
      description,
      url: canonical,
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

export default async function RegionalServicePage({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getRegionalCity(citySlug);
  const service = getRegionalService(serviceSlug);

  if (!city || !service) {
    notFound();
  }

  const [allProducts, keywordMatches] = await Promise.all([
    getProducts(),
    searchProductsByKeywords([service.slug.replace(/-/g, " "), "notebook", "ssd", "gamer", "apple"], 8),
  ]);

  let displayProducts = keywordMatches.length > 0 ? keywordMatches : allProducts.slice(0, 8);

  const canonical = `https://www.balao.info${buildRegionalServicePath(city.slug, service.slug)}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Região", item: "https://www.balao.info/regiao" },
    { name: city.name, item: `https://www.balao.info/regiao/${city.slug}/${service.slug}` },
    { name: service.shortName, item: canonical },
  ];
  const whatsappUrl = buildRegionalWhatsAppUrl(city.name, service.headline);
  const nearbyCities = REGIONAL_CITIES.filter((item) => item.slug !== city.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, canonical),
          generateServiceSchema({
            name: `${service.shortName} em ${city.name}`,
            description: `${service.headline} em ${city.name}. ${service.description}`,
            url: canonical,
            serviceType: service.serviceType,
          }),
          generateFAQSchema(service.faqs),
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
                Atendimento em {city.name}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {service.headline} em <span className="text-[#E60012]">{city.name}</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                {service.description}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir Orçamento para {city.name}
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Motoboy</p>
                  <p className="text-xs text-slate-400">Coleta e Entrega</p>
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

        {/* BENEFÍCIOS DO SERVIÇO NA CIDADE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Como Funciona o Atendimento em {city.name}</h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Atendemos moradores e empresas dos bairros {city.neighborhoods.join(", ")} com máxima agilidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Truck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">1. Envio ou Retirada</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Envie seu aparelho via motoboy parceiro ou traga até nossa loja física no Cambuí em Campinas.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Clock className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">2. Diagnóstico Rápido</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Bancada com orçamento prévio aprovado via WhatsApp sem nenhuma surpresa na entrega.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">3. Devolução com Garantia</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Receba seu equipamento testado em bancada com nota fiscal e garantia de satisfação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja Balão da Informática</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Produtos Disponíveis para Envio para {city.name}
              </h2>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CIDADES VIZINHAS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Veja também em cidades vizinhas:</h3>
            <div className="flex flex-wrap gap-3">
              {nearbyCities.map((nc) => (
                <Link
                  key={nc.slug}
                  href={buildRegionalServicePath(nc.slug, service.slug)}
                  className="rounded-2xl border border-slate-700 bg-[#161f32] px-4 py-2 text-sm font-bold text-slate-300 hover:border-[#E60012] hover:text-white transition"
                >
                  {service.shortName} em {nc.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Atendimento em {city.name}</h2>
          </div>

          <div className="space-y-4">
            {service.faqs.map((faq, idx) => (
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
              Atendimento Dedicado a {city.name}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Solicite seu Orçamento de {service.shortName} Agora
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos especialistas no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Conversar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
