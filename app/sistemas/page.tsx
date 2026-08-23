import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import SistemasLeadForm from "@/components/SistemasLeadForm";
import { SITE_CONFIG } from "@/lib/config";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Globe,
  Lock,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Zap,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Criação de Sites, E-commerce e Sistemas Personalizados | Balão da Informática",
  description:
    "Desenvolvimento de sites profissionais, landing pages de alta conversão, lojas virtuais e sistemas web sob medida com SEO nacional, alta velocidade e tracking de leads. Projetos a partir de R$ 2.999.",
  keywords: [
    "criacao de sites campinas",
    "desenvolvimento de sistemas campinas",
    "landing page alta conversao",
    "criacao de e-commerce campinas",
    "desenvolvimento web profissional",
    "sistema web personalizado",
    "balao da informatica sistemas",
  ],
  alternates: {
    canonical: "https://www.balao.info/sistemas",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/sistemas",
    title: "Criação de Sites e Sistemas Personalizados | Balão da Informática",
    description: "Landing pages, sites institucionais e sistemas sob medida com SEO, performance e tracking.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Criação de Sites e Sistemas Personalizados | Balão da Informática",
    description: "Projetos web sob medida com foco em conversão de vendas e posicionamento no Google.",
    images: ["/logo.png"],
  },
};

const SISTEMAS_FAQS = [
  {
    question: "Quanto custa criar um site profissional ou landing page?",
    answer:
      "O investimento inicial para landing pages e sites profissionais é a partir de R$ 2.999,00. O valor final varia conforme o escopo (páginas, catálogo, integrações de pagamento/WhatsApp e regras de negócio). Apresentamos uma proposta detalhada com etapas e prazos.",
  },
  {
    question: "O site já é entregue pronto e otimizado para o Google (SEO)?",
    answer:
      "Sim! Todos os nossos projetos são desenvolvidos com Next.js / React de altíssima velocidade (Core Web Vitals nota máxima), marcação semântica JSON-LD Schema.org, sitemap XML e metadados estratégicos para ranquear em buscas locais e nacionais.",
  },
  {
    question: "Vocês realizam integração com WhatsApp, Google Analytics e Meta Pixel?",
    answer:
      "Sim. Integramos os botões de conversão direta para o WhatsApp da sua equipe, Google Tag Manager, Google Analytics 4, Meta Pixel e API de Conversões para rastreamento de campanhas de tráfego pago.",
  },
  {
    question: "Qual o prazo médio de entrega do projeto?",
    answer:
      "Landing pages de alta conversão costumam ser entregues em até 7 a 10 dias úteis. Sites institucionais completos e plataformas de sistemas levam de 15 a 30 dias com homologação por etapas.",
  },
];

export default async function SistemasPage() {
  const [allProducts, keywordPdv] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["leitor", "impressora", "computador", "mini pc", "monitor"], 16),
  ]);

  let hardwareProducts = keywordPdv;
  if (hardwareProducts.length === 0) {
    hardwareProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Sistemas & Soluções Web", item: "https://www.balao.info/sistemas" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(hardwareProducts, "https://www.balao.info/sistemas"),
          generateFAQSchema(SISTEMAS_FAQS),
          generateServiceSchema({
            name: "Criação de Sites e Sistemas Personalizados",
            description:
              "Desenvolvimento de software web, landing pages e soluções digitais sob medida para empresas em todo o Brasil.",
            url: "https://www.balao.info/sistemas",
            serviceType: "Desenvolvimento de Software e Web Design",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION WITH LEAD FORM */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Rocket className="w-4 h-4" />
                  Software & Web Sob Medida
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Criação de Sites e Sistemas que <span className="text-[#E60012]">Vendem e Escalam</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Landing pages de alta conversão, portais corporativos, catálogos digitais e sistemas de automação com
                  SEO nacional, carregamento instantâneo e integração direta ao WhatsApp. Projetos a partir de{" "}
                  <strong className="text-white font-bold">R$ 2.999,00</strong>.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href="#orcamento"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <ArrowRight className="w-6 h-6" />
                    Solicitar Proposta Comercial
                  </a>
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de conversar com um consultor sobre o desenvolvimento de um site / sistema sob medida para minha empresa."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 text-[#E60012]" />
                    WhatsApp Direto
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-bold">
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                    <Search className="w-5 h-5 text-[#E60012]" />
                    SEO Técnico & Local
                  </div>
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-[#E60012]" />
                    Velocidade Máxima
                  </div>
                  <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-[#E60012]" />
                    Tracking de Leads
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5" id="orcamento">
                <SistemasLeadForm />
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE EQUIPAMENTOS PARA EMPRESAS DA BASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Hardware Corporativo & PDV</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos para sua Empresa
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de uma cotação de computadores e leitores para automação comercial da minha empresa."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte pacotes de hardware corporativo <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {hardwareProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* METODOLOGIA DE DESENVOLVIMENTO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Nosso Processo de Criação</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Do briefing à entrega final com total transparência e código limpo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Code2 className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Tecnologia Moderna</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Utilizamos Next.js, React, Tailwind CSS e TypeScript para interfaces leves, responsivas e sem travamentos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Globe className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Arquitetura de Conversão</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Design pensado para transformar visitantes em leads qualificados no WhatsApp e no formulário de contato.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Segurança e Backup</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Certificado SSL incluso, proteção contra ataques e orientação completa de hospedagem estável e domínio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Criação de Sites</h2>
          </div>

          <div className="space-y-4">
            {SISTEMAS_FAQS.map((faq, idx) => (
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
              Balão da Informática • Atendimento Nacional
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Pronto para Impulsionar as Vendas da sua Empresa?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Fale agora com nosso time de desenvolvimento e receba um diagnóstico do seu projeto digital.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de solicitar um orçamento para desenvolvimento de site / sistema para meu negócio."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Desenvolvedor no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
