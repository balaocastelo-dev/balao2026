import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
  generateFAQSchema,
} from "@/components/JsonLd";
import {
  REGIONAL_CITIES,
  REGIONAL_SERVICES,
  buildRegionalServicePath,
} from "@/lib/local-seo";
import { MapPin, ArrowRight, MessageCircle, Truck, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const REGIAO_FAQS = [
  {
    question: "Como funciona o atendimento para cidades vizinhas de Campinas?",
    answer:
      "Atendemos toda a Região Metropolitana de Campinas (Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba) com envio expresso via motoboy segurado e balcão físico para retirada no Cambuí.",
  },
  {
    question: "Posso solicitar coleta do meu equipamento em outra cidade?",
    answer:
      "Sim! Realizamos a retirada e entrega agendada via motoboy para sua comodidade ou fornecemos código de postagem reversa dos Correios.",
  },
  {
    question: "Os preços e condições de pagamento são os mesmos para toda a região?",
    answer:
      "Sim! 10% de desconto à vista no PIX e parcelamento em até 10x sem juros no cartão de crédito em toda a linha de produtos e serviços.",
  },
];

export const metadata: Metadata = {
  title: "Atendimento em Campinas e Região Metropolitana | Balão da Informática",
  description:
    "Assistência técnica especializada, venda de computadores, notebooks, PC Gamer e Apple para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.",
  alternates: { canonical: "https://www.balao.info/regiao" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/regiao",
    title: "Atendimento em Campinas e Região | Balão da Informática",
    description: "Cobertura regional com entrega rápida, retirada no balcão e WhatsApp comercial.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atendimento Regional | Balão da Informática",
    description: "Loja e assistência técnica para toda a Região Metropolitana de Campinas.",
    images: ["/logo.png"],
  },
};

export default async function RegiaoPage() {
  const allProducts = await getProducts();
  const showcaseProducts = allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Região", item: "https://www.balao.info/regiao" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(showcaseProducts, "https://www.balao.info/regiao"),
          generateFAQSchema(REGIAO_FAQS),
          generateServiceSchema({
            name: "Atendimento Local e Regional da Balão da Informática",
            description:
              "Cobertura regional de vendas de informática e assistência técnica para a Região Metropolitana de Campinas.",
            url: "https://www.balao.info/regiao",
            serviceType: "Atendimento Local e Varejo de TI",
          }),
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
                Cobertura Campinas & RMC
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Atendimento Técnico & Vendas em <span className="text-[#E60012]">Campinas e Região</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Compre peças e equipamentos com retirada expressa ou envie seu notebook, console e Apple para nossa
                bancada especializada no Cambuí com serviço de leva e traz segurado.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar o atendimento da Balão para a minha cidade na região de Campinas."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Consultar Atendimento no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* GRADE DE CIDADES REGIONAIS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Cidades Atendidas</div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Selecione sua Cidade</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {REGIONAL_CITIES.map((city) => (
              <div
                key={city.slug}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-[#E60012] transition-colors shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#161f32] border border-slate-700 flex items-center justify-center text-[#E60012]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{city.name}</h3>
                    <p className="text-xs text-slate-400">Região Metropolitana</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Bairros principais: {city.neighborhoods.slice(0, 4).join(", ")}.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-800">
                  {REGIONAL_SERVICES.map((service) => (
                    <Link
                      key={service.slug}
                      href={buildRegionalServicePath(city.slug, service.slug)}
                      className="rounded-xl border border-slate-700 bg-[#161f32] px-3 py-1.5 text-xs font-bold text-slate-300 hover:border-[#E60012] hover:text-white transition"
                    >
                      {service.shortName}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VITRINE DE PRODUTOS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja Balão da Informática</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos em Destaque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar o estoque para entrega na minha cidade."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte entregas no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {showcaseProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Atendimento Regional</h2>
          </div>

          <div className="space-y-4">
            {REGIAO_FAQS.map((faq, idx) => (
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
              Sede Física no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Sua Cidade Atendida com Agilidade e Garantia
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de falar sobre atendimento e compras para minha cidade."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Atendimento Regional
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
