import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import ProductCard from "@/components/ProductCard";
import {
  Laptop,
  Battery,
  Wifi,
  Briefcase,
  GraduationCap,
  Zap,
  ShieldCheck,
  MessageCircle,
  CheckCircle,
  Truck,
  Cpu,
  HardDrive,
  Wrench,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notebooks em Campinas | Novos e Seminovos com Garantia | Balão da Informática",
  description:
    "Notebooks Dell, Lenovo, Acer, Asus e MacBooks no Cambuí, Campinas. Modelos corporativos e gamer com upgrade imediato de SSD/RAM, 10% OFF no PIX e garantia física.",
  keywords: [
    "notebook campinas",
    "comprar notebook campinas cambui",
    "notebook dell campinas",
    "macbook campinas",
    "notebook gamer campinas",
    "notebook seminovo revisado",
    "balao da informatica notebooks",
  ],
  alternates: { canonical: "https://www.balao.info/notebooks" },
  openGraph: {
    title: "Notebooks em Campinas: Performance e Mobilidade | Balão da Informática",
    description:
      "Notebooks novos e seminovos revisados com garantia, upgrade na hora e entrega rápida em Campinas e região.",
    type: "website",
    url: "https://www.balao.info/notebooks",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notebooks em Campinas | Balão da Informática",
    description: "Notebooks corporativos, gamer e MacBooks com garantia e retirada no Cambuí.",
    images: ["/logo.png"],
  },
};

const NOTEBOOK_FAQS = [
  {
    question: "Os notebooks vendidos possuem garantia?",
    answer:
      "Sim! Todos os notebooks novos contam com garantia oficial do fabricante acompanhada de Nota Fiscal eletrônica. Os modelos seminovos contam com 6 meses de garantia Balão da Informática.",
  },
  {
    question: "Vocês realizam upgrade de SSD e memória RAM na hora da compra?",
    answer:
      "Sim! Se você gostou de um modelo e deseja dobrar a memória RAM ou instalar um SSD NVMe de 1TB, realizamos a instalação na bancada e entregamos o aparelho pronto para uso.",
  },
  {
    question: "Aceitam meu notebook usado como parte do pagamento?",
    answer:
      "Sim! Realizamos a avaliação técnica do seu equipamento usado no balcão da loja física no Cambuí e abatemos o valor na compra de um novo.",
  },
];

export default async function NotebooksPage() {
  const [allProducts, keywordNotebooks] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["notebook", "laptop", "macbook", "thinkpad", "dell", "lenovo", "acer"], 16),
  ]);

  let notebookProducts = keywordNotebooks.length > 0 ? keywordNotebooks : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Notebooks", item: "https://www.balao.info/notebooks" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(notebookProducts, "https://www.balao.info/notebooks"),
          generateFAQSchema(NOTEBOOK_FAQS),
          generateServiceSchema({
            name: "Venda e Assistência de Notebooks em Campinas",
            description:
              "Loja especializada em notebooks novos, seminovos revisados e upgrades imediatos no Cambuí.",
            url: "https://www.balao.info/notebooks",
            serviceType: "Varejo e Manutenção de Computadores Portáteis",
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
                <Laptop className="w-4 h-4" />
                Novos & Seminovos Revisados
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Notebooks & Ultrabooks com <span className="text-[#E60012]">Garantia Real e Upgrade</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Dell, Lenovo, Acer, Asus e MacBooks para trabalho, faculdade e games.
                Turbine a memória RAM ou SSD NVMe na hora da compra com 10% de desconto à vista no PIX.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar os modelos de notebook disponíveis na loja do Cambuí."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Consultar Modelos no WhatsApp
                </a>
                <a
                  href="#catalogo"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Catálogo em Estoque
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
                  <p className="text-2xl font-black text-white">Upgrade</p>
                  <p className="text-xs text-slate-400">Feito na Hora</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Garantia</p>
                  <p className="text-xs text-slate-400">Balcão Físico Cambuí</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE NOTEBOOKS REAIS DO BANCO */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Portáteis em Destaque</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Notebooks Pronta Entrega
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar notebooks corporativos e gamer disponíveis."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte modelos e preços no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {notebookProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CATEGORIAS DE NOTEBOOK */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Encontre o Notebook Ideal</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Soluções pensadas para o seu dia a dia profissional, acadêmico ou entretenimento.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Briefcase className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Linha Corporativa & Trabalho</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dell Latitude, Lenovo ThinkPad e HP ProBook. Máxima durabilidade, leitor biométrico e resistência para trabalho intenso.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <GraduationCap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Estudos & Produtividade</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Ultrabooks leves e finos com bateria de longa duração, tela Full HD anti-reflexo e inicialização em menos de 10 segundos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Notebook Gamer & Criação</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Placas dedicadas NVIDIA RTX, telas de 144Hz e processadores Core i7/Ryzen 7 para renderização 3D e jogos em alto FPS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Notebooks</h2>
          </div>

          <div className="space-y-4">
            {NOTEBOOK_FAQS.map((faq, idx) => (
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
              Loja Física no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Teste seu Notebook Pessoalmente na Loja
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Endereço: {SITE_CONFIG.address} • Fale com nossos especialistas no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de consultar os modelos de notebook disponíveis na loja física."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista em Notebooks
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
