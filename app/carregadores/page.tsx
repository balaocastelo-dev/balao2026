import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  Zap,
  Battery,
  Truck,
  ShieldCheck,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Flame,
  Plug,
  Laptop,
  Check,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Carregadores e Fontes de Notebook em Campinas | Entrega Expressa | Balão da Informática",
  description:
    "Fontes e carregadores originais e de primeira linha para notebooks Dell, Lenovo, Acer, HP, Samsung, Asus e Apple em Campinas. Retirada no Cambuí ou entrega expressa via motoboy.",
  keywords: [
    "carregador notebook campinas",
    "fonte notebook campinas",
    "carregador dell campinas",
    "carregador lenovo campinas",
    "carregador acer campinas",
    "carregador hp campinas",
    "carregador macbook campinas",
    "fonte tipo c notebook campinas",
    "entrega rapida carregador campinas",
    "balao da informatica cambui",
  ],
  alternates: { canonical: "https://www.balao.info/carregadores" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/carregadores",
    title: "Carregadores e Fontes de Notebook em Campinas | Balão da Informática",
    description:
      "Precisando de carregador urgente? Entregamos em até 60 minutos em Campinas e região. Fontes com garantia de 12 meses e teste na hora.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/landing/hero_carregadores.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carregadores de Notebook em Campinas | Balão da Informática",
    description:
      "Fontes e carregadores para Dell, Lenovo, HP, Acer, Asus, Apple com pronta entrega em Campinas.",
    images: ["/images/landing/hero_carregadores.jpg"],
  },
};

const CARREGADORES_FAQS = [
  {
    question: "Como saber se o carregador é compatível com o meu notebook?",
    answer:
      "Basta nos enviar uma foto da etiqueta debaixo do seu notebook ou do carregador antigo no WhatsApp. Nossos técnicos verificam voltagem (V), amperagem (A) e o tamanho exato do conector/plug em segundos.",
  },
  {
    question: "Vocês possuem carregadores USB-C / Type-C GaN de alta potência?",
    answer:
      "Sim! Temos carregadores padrão USB-C Power Delivery (PD) de 45W, 65W, 100W e 140W com tecnologia GaN (menores, mais frios e mais eficientes), compatíveis com Dell XPS, Lenovo ThinkPad, MacBooks e smartphones.",
  },
  {
    question: "Qual o prazo de entrega para Campinas e cidades vizinhas?",
    answer:
      "Para Campinas e RMC, enviamos via motoboy expresso ou você pode retirar em balcão em nossa loja física no Cambuí.",
  },
  {
    question: "Os carregadores contam com garantia?",
    answer:
      "Sim! Todos os nossos carregadores e fontes contam com garantia de até 12 meses contra defeitos de fabricação e circuitos de proteção ativa contra surtos de tensão.",
  },
];

export default async function CarregadoresPage() {
  const [allProducts, keywordChargers] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["carregador", "fonte", "adaptador", "usb-c", "magsafe", "power"], 16),
  ]);

  let displayProducts = keywordChargers.length > 0 ? keywordChargers : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Carregadores", item: "https://www.balao.info/carregadores" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/carregadores"),
          generateFAQSchema(CARREGADORES_FAQS),
          generateServiceSchema({
            name: "Venda de Carregadores e Fontes de Notebook em Campinas",
            description:
              "Fontes originais e homologadas para notebooks Dell, Apple, Lenovo, Acer, Asus, HP e Samsung.",
            url: "https://www.balao.info/carregadores",
            serviceType: "Venda de Acessórios e Peças de Reposição de TI",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DE PRODUTO IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Pronta Entrega • Teste no Balcão
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Carregadores & Fontes para <span className="text-[#E60012]">Notebooks</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Seu carregador queimou, quebrou o cabo ou parou de dar carga?
                  Temos todas as voltagens e conectores para Dell, Apple, Lenovo, Acer, Asus e HP com garantia de 12 meses.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de consultar um carregador compatível para o meu notebook na loja do Cambuí."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Consultar Modelo no WhatsApp
                  </a>
                  <a
                    href="#modelos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Linha de Fontes
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">12 Meses</p>
                    <p className="text-xs text-slate-400">Garantia Balão</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">GaN 100W</p>
                    <p className="text-xs text-slate-400">USB-C Power Delivery</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">10% OFF</p>
                    <p className="text-xs text-slate-400">À Vista no PIX</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Motoboy</p>
                    <p className="text-xs text-slate-400">Entrega Rápida</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO PRODUTO IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_carregadores.jpg"
                  alt="Carregadores de notebook e adaptadores de alta qualidade em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Proteção Ativa Anti-Surto
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Plugues originais, cabos reforçados e chips inteligentes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section id="modelos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Fontes em Estoque</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Carregadores Prontos para Retirada
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar se há carregador disponível para meu notebook."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Envie a foto do seu plug no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* MARCAS E PADRÕES ATENDIDOS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Compatibilidade Garantida</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Temos o conector exato para a sua máquina sem risco de queima de placa-mãe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Laptop className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Dell, Lenovo & HP</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conectores pino fino, pino grosso com agulha central e USB-C PD com chip identificador para carregar a bateria sem travar o processador.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Apple MacBook (MagSafe & USB-C)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Carregadores MagSafe 1, MagSafe 2 e carregadores USB-C de 67W, 96W e 140W com cabo magnético MagSafe 3.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Plug className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Acer, Asus, Samsung & Gamers</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Fontes de alta amperagem (120W a 330W) para notebooks gamer das linhas Nitro, Predator, ROG, TUF e Legion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Carregadores</h2>
          </div>

          <div className="space-y-4">
            {CARREGADORES_FAQS.map((faq, idx) => (
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
              Sua Loja de Informática no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Precisa de Carregador Agora? Fale Conosco
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de comprar um carregador para meu notebook agora."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Pedir Carregador no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
