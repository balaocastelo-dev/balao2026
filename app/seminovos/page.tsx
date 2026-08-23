import { SITE_CONFIG } from "@/lib/config";
import React from "react";
import type { Metadata } from "next";
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
    "Compre notebooks usados e seminovos corporativos (Dell Latitude, Lenovo ThinkPad, HP ProBook, MacBook) revisados e com garantia real de 6 meses em Campinas. Retirada em 30 min no Cambuí ou entrega expressa.",
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
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notebooks Seminovos em Campinas | Balão da Informática",
    description: "Notebooks seminovos de alta performance com garantia e entrega rápida.",
    images: ["/logo.png"],
  },
};

const SEMINOVOS_FAQS = [
  {
    question: "Qual a procedência dos notebooks seminovos da Balão?",
    answer:
      "Nossos notebooks seminovos são de linha corporativa (Dell Latitude, Lenovo ThinkPad, HP EliteBook/ProBook), provenientes de lotes de empresas com histórico de manutenção preventiva. São equipamentos muito mais resistentes e duráveis que modelos de varejo comuns.",
  },
  {
    question: "Como é feita a revisão técnica antes da venda?",
    answer:
      "Cada máquina passa por um checklist rigoroso na nossa bancada técnica: teste de integridade do SSD/NVMe (100% de vida útil), teste de estresse de CPU e memória RAM, verificação de ciclos e saúde da bateria, limpeza interna profunda, troca da pasta térmica e instalação limpa do Windows 11 com todos os drivers.",
  },
  {
    question: "Qual o prazo e cobertura da garantia?",
    answer:
      "Oferecemos garantia real de 6 meses direto com a nossa loja física no Cambuí. Em caso de qualquer inconsistência, nossa equipe resolve rapidamente na bancada sem a burocracia de fabricantes.",
  },
  {
    question: "Posso testar o notebook pessoalmente antes de pagar?",
    answer:
      "Sim! Você pode visitar nossa loja física no bairro Cambuí em Campinas, ligar o notebook, testar a tela, teclado, som e desempenho com tranquilidade antes de finalizar a compra.",
  },
];

export default async function SeminovosPage() {
  const [allProducts, categories, keywordSeminovos] = await Promise.all([
    getProducts(),
    getCategories(),
    searchProductsByKeywords(["seminovo", "usado", "notebook", "dell", "thinkpad", "macbook"], 24),
  ]);

  const rootCategory = categories.find((c: Category) => c.slug === "semi-novo" || c.name.toLowerCase().includes("semi"));
  const validCategories = new Set<string>();

  if (rootCategory) {
    validCategories.add(rootCategory.name);
    const stack = [rootCategory.id];
    while (stack.length > 0) {
      const currentId = stack.pop() as string;
      const children = categories.filter((c) => c.parent_id === currentId);
      for (const child of children) {
        validCategories.add(child.name);
        stack.push(child.id);
      }
    }
  }

  const categorySeminovos = allProducts.filter((p: Product) => {
    if (!rootCategory || !p.category) return false;
    return validCategories.has(p.category);
  });

  const combined = [...categorySeminovos, ...keywordSeminovos];
  const uniqueProductsMap = new Map();
  for (const p of combined) {
    if (!uniqueProductsMap.has(p.id)) {
      uniqueProductsMap.set(p.id, p);
    }
  }

  let seminovos = Array.from(uniqueProductsMap.values());
  if (seminovos.length === 0) {
    seminovos = allProducts.filter((p) => p.category?.toLowerCase().includes("notebook") || p.name.toLowerCase().includes("notebook")).slice(0, 12);
  }
  if (seminovos.length === 0) {
    seminovos = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Seminovos", item: "https://www.balao.info/seminovos" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(seminovos, "https://www.balao.info/seminovos"),
          generateFAQSchema(SEMINOVOS_FAQS),
          generateServiceSchema({
            name: "Venda e Avaliação de Notebooks Seminovos em Campinas",
            description:
              "Notebooks corporativos seminovos revisados com garantia de 6 meses e entrega expressa em Campinas e região.",
            url: "https://www.balao.info/seminovos",
            serviceType: "Venda de Equipamentos de Informática Seminovos",
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
                <BadgeCheck className="w-4 h-4" />
                Garantia Real de 6 Meses
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Notebooks Seminovos <span className="text-[#E60012]">Revisados & Prontos</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Equipamentos corporativos de marcas líderes (Dell, Lenovo ThinkPad, HP, Apple) com chassi reforçado,
                armazenamento em SSD NVMe ultrarrápido e 100% testados na bancada do Cambuí.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de ver as opções de notebooks seminovos disponíveis com garantia de 6 meses."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Consultar Estoque no WhatsApp
                </a>
                <a
                  href="#catalogo"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Modelos Disponíveis
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">6 Meses</p>
                  <p className="text-xs text-slate-400">Garantia na Loja</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">10% OFF</p>
                  <p className="text-xs text-slate-400">À Vista no PIX</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">10x S/ Juros</p>
                  <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Pronta Entrega</p>
                  <p className="text-xs text-slate-400">Retirada em 30 min</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Estoque Físico Atualizado</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Oportunidades em Seminovos
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar se há novos notebooks seminovos chegando no estoque do Cambuí."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte modelos específicos com nossos técnicos <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {seminovos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* POR QUE COMPRAR CORPORATIVO SEMINOVO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">O Diferencial da Linha Corporativa</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Entenda por que um notebook corporativo seminovo dura o dobro de um modelo básico novo de plástico.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Chassi de Magnésio e Alumínio</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Dobradiças de aço reforçadas e estrutura anti-impacto projetadas para durar anos sem quebrar carcaça.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Upgrade Fácil de SSD e Memória</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sem memória soldada. Todos os nossos modelos permitem expansão futura de RAM e SSD para maior longevidade.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Laptop className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Teclado e Tela de Alta Resolução</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Telas foscas anti-reflexo Full HD e teclados ergonômicos confortáveis para longas jornadas de trabalho e estudo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Transparência Total</div>
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
              Retirada no Cambuí ou Entrega Grátis na Região
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Encontre o Notebook Perfeito para seu Trabalho ou Estudo
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos consultores técnicos no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de receber fotos e configurações dos notebooks seminovos disponíveis hoje."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Receber Opções no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
