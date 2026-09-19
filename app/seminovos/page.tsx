import { SITE_CONFIG } from "@/lib/config";
import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import { getProducts, getCategories, searchProductsByKeywords } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import {
  Laptop,
  ShieldCheck,
  BadgeCheck,
  Truck,
  Award,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Clock,
  Zap,
  MapPin,
  Sparkles,
} from "lucide-react";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notebooks Seminovos em Campinas com Garantia de 6 Meses | Balão da Informática",
  description:
    "Compre notebooks usados e seminovos corporativos (Dell Latitude, Lenovo ThinkPad, HP ProBook, MacBook) revisados e com garantia real de 6 meses em Campinas. Retirada no Cambuí ou entrega expressa.",
  keywords: [
    "notebook seminovo campinas",
    "notebook usado campinas",
    "notebook corporativo usado",
    "notebook dell usado campinas",
    "thinkpad seminovo campinas",
    "macbook usado campinas",
    "notebook com garantia campinas",
    "balao da informatica seminovos",
  ],
  alternates: { canonical: "https://www.balao.info/seminovos" },
  openGraph: {
    title: "Notebooks Seminovos em Campinas com Garantia | Balão da Informática",
    description:
      "Notebooks corporativos revisados com 6 meses de garantia. Estoque real com entrega expressa para Campinas e região.",
    type: "website",
    url: "https://www.balao.info/seminovos",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/landing/hero_seminovos.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notebooks Seminovos em Campinas | Balão da Informática",
    description: "Notebooks seminovos de alta performance com garantia e entrega rápida.",
    images: ["/images/landing/hero_seminovos.jpg"],
  },
};

const SEMINOVOS_FAQS = [
  {
    question: "Qual a procedência dos notebooks seminovos da Balão?",
    answer:
      "Nossos notebooks seminovos são de linha corporativa (Dell Latitude, Lenovo ThinkPad, HP EliteBook/ProBook), provenientes de lotes de empresas com histórico de manutenção preventiva. São equipamentos muito mais resistentes e duráveis que modelos de varejo comuns.",
  },
  {
    question: "Qual o período de garantia dos seminovos?",
    answer:
      "Oferecemos 6 meses de garantia total de hardware para todos os nossos notebooks seminovos com suporte presencial em nossa loja física no Cambuí.",
  },
  {
    question: "Qual o estado de conservação estético dos aparelhos?",
    answer:
      "Trabalhamos com classificação Grau A: equipamentos sem trincas, telas sem dead pixels, teclados e trackpads impecáveis e baterias com teste de autonomia acima de 80%.",
  },
  {
    question: "Posso pedir upgrade de memória ou SSD no notebook seminovo?",
    answer:
      "Sim! Realizamos upgrade imediato na bancada: colocamos SSD de 512GB/1TB ou aumentamos a RAM para 16GB/32GB na hora da compra.",
  },
];

export default async function SeminovosPage() {
  const [allProducts, keywordSeminovos] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["seminovo", "recondicionado", "thinkpad", "latitude", "macbook", "notebook", "dell"], 16),
  ]);

  let displayProducts = keywordSeminovos.length > 0 ? keywordSeminovos : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Seminovos", item: "https://www.balao.info/seminovos" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/seminovos"),
          generateFAQSchema(SEMINOVOS_FAQS),
          generateServiceSchema({
            name: "Venda de Notebooks Seminovos Corporativos com Garantia",
            description:
              "Comércio de computadores portáteis seminovos revisados com garantia de 6 meses em Campinas.",
            url: "https://www.balao.info/seminovos",
            serviceType: "Varejo de Equipamentos Seminovos e Recondicionados",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DOS SEMINOVOS IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Laptop className="w-4 h-4" />
                  Linhas Corporativas • Grau A Impecável
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Notebooks Seminovos com <span className="text-[#E60012]">Garantia de 6 Meses</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Lenovo ThinkPad, Dell Latitude, HP e MacBook revisados em mais de 30 pontos de teste.
                  Economize até 50% em relação a um novo com nota fiscal e suporte presencial no Cambuí.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de consultar os notebooks seminovos disponíveis na loja do Cambuí."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Consultar Estoque no WhatsApp
                  </a>
                  <a
                    href="#vitrine"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Modelos Disponíveis
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">6 Meses</p>
                    <p className="text-xs text-slate-400">Garantia Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Grau A</p>
                    <p className="text-xs text-slate-400">Estado Impecável</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">10% OFF</p>
                    <p className="text-xs text-slate-400">À Vista no PIX</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">10x S/ Juros</p>
                    <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                  </div>
                </div>
              </div>

              {/* FOTO DOS SEMINOVOS IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_seminovos.jpg"
                  alt="Notebooks seminovos corporativos revisados em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Checklist de 30 Pontos Aprovado
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Bateria, tela, teclado, SSD e dissipação térmica 100%</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS SEMINOVOS REAIS DO BANCO */}
        <section id="vitrine" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Vitrine Balão Seminovos</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Notebooks Prontos para Retirada
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de fotos e detalhes dos notebooks seminovos em estoque."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Peça fotos no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* POR QUE ESCOLHER LINHA CORPORATIVA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">A Vantagem da Linha Corporativa</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Por que um ThinkPad ou Latitude seminovo dura muito mais que um notebook novo de supermercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Chassi de Magnésio & Fibra</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Construção reforçada com dobradiças de aço, resistência a torção e aprovação em testes de padrão militar (MIL-STD).
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Teclado Antiderramamento</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  O melhor conforto de digitação do mercado, com drenos contra respingos de líquidos e resposta tátil precisa.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <BadgeCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Facilidade de Upgrades</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Slots de memória RAM e SSD de fácil acesso, permitindo expandir a vida útil da sua máquina por muitos anos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Seminovos</h2>
          </div>

          <div className="space-y-4">
            {SEMINOVOS_FAQS.map((faq, idx) => (
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
              Venha Testar no Balcão • Cambuí Campinas
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Leve uma Máquina Corporativa de Alto Nível
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de reservar um notebook seminovo com a equipe do Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Atendimento de Seminovos
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
