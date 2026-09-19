import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getCategories, getProducts, searchProductsByKeywords } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import HeroCTA from "@/components/HeroCTA";
import PcGamerSearchGrid from "@/components/PcGamerSearchGrid";
import ProductCard from "@/components/ProductCard";
import {
  Gamepad2,
  Cpu,
  Zap,
  Wrench,
  MonitorPlay,
  Flame,
  Truck,
  ShieldCheck,
  MessageCircle,
  PackageCheck,
  ThermometerSun,
  Star,
  User,
  Quote,
  Building2,
  ThumbsUp,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PC Gamer em Campinas com Entrega Rápida | Balão da Informática",
  description:
    "PC Gamer de alta performance em Campinas no Cambuí. Montagem profissional com cable management, garantia local, 10% OFF no PIX e entrega rápida.",
  keywords: [
    "pc gamer campinas",
    "computador gamer campinas",
    "montagem pc gamer cambui",
    "pc gamer rtx campinas",
    "loja gamer campinas",
    "balao da informatica pc gamer",
  ],
  alternates: { canonical: "https://www.balao.info/pcgamer" },
  openGraph: {
    title: "PC Gamer em Campinas com Entrega Rápida | Balão da Informática",
    description:
      "PC Gamer de alta performance com montagem profissional, garantia local e entrega rápida em Campinas e região.",
    type: "website",
    url: "https://www.balao.info/pcgamer",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Gamer em Campinas | Balão da Informática",
    description: "Máquinas completas e prontas para jogar com garantia física no Cambuí.",
    images: ["/logo.png"],
  },
};

const PC_GAMER_FAQS = [
  {
    question: "O PC Gamer já vem totalmente montado e testado?",
    answer:
      "Sim! Todo PC Gamer sai montado com cable management profissional, sistema operacional instalado, BIOS e drivers atualizados e passa por bateria de testes de estresse antes da entrega.",
  },
  {
    question: "As peças são 100% novas e com garantia?",
    answer:
      "Sim! Trabalhamos exclusivamente com componentes novos, lacrados, originais com nota fiscal eletrônica e garantia de fábrica somada ao suporte técnico Balão.",
  },
  {
    question: "Posso alterar ou customizar a configuração do PC?",
    answer:
      "Com certeza! Nossos técnicos ajustam o processador, placa de vídeo, memórias RAM, watercooler e gabinete conforme seu orçamento e jogo preferido.",
  },
  {
    question: "Como funciona a garantia e o suporte pós-venda?",
    answer:
      "Você conta com a tranquilidade do balcão de suporte técnico direto na nossa loja física no Cambuí em Campinas.",
  },
];

export default async function PcGamerPage() {
  const [allProducts, keywordGamer, categories] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["gamer", "rtx", "ryzen", "core i5", "core i7", "watercooler", "gabinete"], 16),
    getCategories(),
  ]);

  let gamerProducts = keywordGamer.length > 0 ? keywordGamer : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "PC Gamer", item: "https://www.balao.info/pcgamer" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(gamerProducts, "https://www.balao.info/pcgamer"),
          generateFAQSchema(PC_GAMER_FAQS),
          generateServiceSchema({
            name: "Venda e Montagem de PC Gamer em Campinas",
            description:
              "Computadores gamer de alta performance com montagem profissional e peças originais no Cambuí.",
            url: "https://www.balao.info/pcgamer",
            serviceType: "Montagem e Venda de Computadores Gamer",
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
                <Gamepad2 className="w-4 h-4" />
                Campinas e Região • Pronta Entrega
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                PC Gamer com <span className="text-[#E60012]">Performance Extrema</span> e Zero Lag
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Máquinas projetadas para rodar os títulos mais pesados com taxas altíssimas de FPS.
                Montagem com cable management profissional, airflow direcionado e garantia local no Cambuí.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar os PCs Gamer prontos para entrega na Balão."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Consultar Setups no WhatsApp
                </a>
                <a
                  href="#vitrine"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Máquinas em Estoque
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">10% OFF</p>
                  <p className="text-xs text-slate-400">À Vista no PIX</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">10x S/ Juros</p>
                  <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Pronto Uso</p>
                  <p className="text-xs text-slate-400">Windows & Drivers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100% Testado</p>
                  <p className="text-xs text-slate-400">Benchmarks de Estresse</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DINÂMICA DE PRODUTOS GAMER */}
        <section id="vitrine" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Setups e Componentes</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Máquinas e Peças Gamer Disponíveis
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de montar um PC Gamer personalizado com as peças do catálogo."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Monte sua configuração sob medida <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {gamerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* PILARES DE PERFORMANCE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Engenharia de Performance</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Cada componente é escolhido para garantir estabilidade e máximo rendimento em jogos competitivos e 4K.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Processadores Top de Linha</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Intel Core i5, i7, i9 e AMD Ryzen 5, 7, 9 com frequências de boost sustentadas para zero gargalos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <MonitorPlay className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Placas NVIDIA RTX & Radeon</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Ray Tracing em tempo real, DLSS 3 com geração de quadros e larguras de banda para jogar em 144Hz ou 4K.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ThermometerSun className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Refrigeração de Alta Eficiência</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Watercoolers selados de 240/360mm e pastas térmicas de prata para temperaturas até 15°C mais baixas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre PC Gamer</h2>
          </div>

          <div className="space-y-4">
            {PC_GAMER_FAQS.map((faq, idx) => (
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
              Bancada Gamer no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Pronto para Elevar seu Nível de Jogo?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos montadores gamers no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de encomendar meu PC Gamer com a Balão da Informática."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Consultor Gamer
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
