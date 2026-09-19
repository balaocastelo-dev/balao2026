import { Metadata } from "next";
import Link from "next/link";
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
  Tag,
  Percent,
  Timer,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  MessageCircle,
  MapPin,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Promoção de Informática em Campinas | Ofertas Relâmpago e Hardware | Balão da Informática",
  description:
    "As melhores promoções de informática, PC Gamer, notebooks, SSDs e periféricos em Campinas. Desconto de 10% no PIX, pronta entrega e retirada no balcão do Cambuí.",
  keywords: [
    "promocao informatica campinas",
    "ofertas hardware campinas",
    "desconto pc gamer campinas",
    "loja informatica cambui ofertas",
    "ssd barato campinas",
    "notebook promocao campinas",
    "balao da informatica promocoes",
  ],
  alternates: {
    canonical: "https://www.balao.info/promocao",
  },
  openGraph: {
    title: "Ofertas Relâmpago de Informática | Balão da Informática",
    description: "Hardware e PC Gamer com descontos reais em Campinas. Compre no PIX com 10% OFF.",
    url: "https://www.balao.info/promocao",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Promoções de Informática | Balão da Informática",
    description: "Ofertas com entrega rápida no interior paulista e retirada no Cambuí.",
    images: ["/logo.png"],
  },
};

const PROMO_FAQS = [
  {
    question: "Como funciona o desconto à vista no PIX?",
    answer:
      "Todos os produtos com o selo PIX possuem 10% de desconto imediato aplicado no checkout ou diretamente no balcão da loja física.",
  },
  {
    question: "Posso parcelar as compras no cartão de crédito?",
    answer:
      "Sim! Parcelamos em até 10x sem juros em todos os cartões de crédito aceitos no Brasil.",
  },
  {
    question: "Os produtos promocionais têm garantia de fábrica?",
    answer:
      "Sim! Todos os produtos são novos, lacrados e com garantia oficial do fabricante acompanhados de Nota Fiscal eletrônica (NFe).",
  },
  {
    question: "Posso comprar pelo site e retirar hoje mesmo na loja do Cambuí?",
    answer:
      "Com certeza! Selecione a opção 'Retirar na Loja' ou chame no WhatsApp para separar o produto no balcão imediatamente.",
  },
];

export default async function PromocaoPage() {
  const [allProducts, promoHardware, promoNotebooks] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["ssd", "rtx", "fonte", "gabinete", "cooler", "memoria"], 8),
    searchProductsByKeywords(["notebook", "dell", "lenovo", "thinkpad", "macbook"], 8),
  ]);

  let displayHardware = promoHardware.length > 0 ? promoHardware : allProducts.slice(0, 8);
  let displayNotebooks = promoNotebooks.length > 0 ? promoNotebooks : allProducts.slice(8, 16);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Promoção & Ofertas", item: "https://www.balao.info/promocao" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(allProducts.slice(0, 16), "https://www.balao.info/promocao"),
          generateFAQSchema(PROMO_FAQS),
          generateServiceSchema({
            name: "Central de Ofertas e Promoções Balão da Informática",
            description:
              "Ofertas relâmpago de computadores, periféricos e hardware com entrega expressa em Campinas e região.",
            url: "https://www.balao.info/promocao",
            serviceType: "Varejo de Tecnologia e Equipamentos de Informática",
          }),
        ]}
      />
      <Header />

      {/* Banner de Destaque Impeccable */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Flame className="w-4 h-4 animate-bounce" />
        <span>OFERTAS DA SEMANA COM ATÉ 10% OFF NO PIX + RETIRADA IMEDIATA NO CAMBUÍ!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Percent className="w-4 h-4" />
                Descontos Reais e Imediatos
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Ofertas Relâmpago de <span className="text-[#E60012]">Informática & Hardware</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Preços especiais em processadores, placas de vídeo, SSDs NVMe e notebooks corporativos e gamer.
                Pague à vista no PIX com superdesconto ou parcele em até 10x sem juros.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar as promoções relâmpago de hoje na Balão da Informática."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Garantir Oferta no WhatsApp
                </a>
                <a
                  href="#hardware"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Produtos em Oferta
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
                  <p className="text-2xl font-black text-white">Pronta Entrega</p>
                  <p className="text-xs text-slate-400">Estoque no Cambuí</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Nota Fiscal</p>
                  <p className="text-xs text-slate-400">Garantia Oficial</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE 1: HARDWARE & PC GAMER */}
        <section id="hardware" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Hardware em Oferta</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Peças, Coolers e Placas de Vídeo
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar ofertas de peças de PC e hardware."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte peças no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayHardware.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* VITRINE 2: NOTEBOOKS & MACBOOKS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Portáteis em Oferta</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Notebooks Novos & Seminovos Revisados
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar ofertas de notebooks e MacBooks."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte notebooks no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayNotebooks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre as Promoções</h2>
          </div>

          <div className="space-y-4">
            {PROMO_FAQS.map((faq, idx) => (
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
              Retirada no Balcão • Cambuí Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Quer Negociar uma Oferta em Lote ou para Empresa?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores de vendas B2B e PF.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de uma cotação especial para os produtos em promoção da Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Negociar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}