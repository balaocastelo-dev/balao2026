import type { Metadata } from "next";
import Image from "next/image";
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
  Sparkles,
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
    images: [{ url: "/images/landing/hero_sistemas.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Criação de Sites e Sistemas Personalizados | Balão da Informática",
    description: "Projetos web sob medida com foco em conversão de vendas e posicionamento no Google.",
    images: ["/images/landing/hero_sistemas.jpg"],
  },
};

const SISTEMAS_FAQS = [
  {
    question: "Quanto custa criar um site profissional ou landing page?",
    answer:
      "O investimento inicial para landing pages e sites profissionais é a partir de R$ 2.999,00. O valor final varia conforme o escopo (páginas, catálogo, integrações de pagamento/WhatsApp e regras de negócio). Apresentamos uma proposta detalhada com etapas e prazos.",
  },
  {
    question: "O site já vem pronto e otimizado para o Google (SEO)?",
    answer:
      "Sim! Todos os nossos projetos são desenvolvidos em Next.js com renderização ultra veloz (SSR), estrutura de dados JSON-LD (Schema.org) e metatags otimizadas para ranquear no topo do Google e em assistentes de inteligência artificial.",
  },
  {
    question: "Quanto tempo demora para meu site ou sistema ficar pronto?",
    answer:
      "Landing pages de alta conversão costumam ser entregues em 7 a 15 dias úteis. E-commerces e sistemas empresariais personalizados levam em média de 20 a 45 dias úteis.",
  },
  {
    question: "Eu terei acesso ao código-fonte e painel administrativo?",
    answer:
      "Sim! O projeto é 100% de propriedade da sua empresa, com painel intuitivo para você atualizar fotos, textos, preços e acompanhar métricas de acessos e leads.",
  },
];

export default async function SistemasPage() {
  const [allProducts, keywordBiz] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["monitor", "mini pc", "computador", "teclado", "mouse", "nobreak"], 16),
  ]);

  let displayProducts = keywordBiz.length > 0 ? keywordBiz : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Sistemas & Web", item: "https://www.balao.info/sistemas" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/sistemas"),
          generateFAQSchema(SISTEMAS_FAQS),
          generateServiceSchema({
            name: "Desenvolvimento de Software, E-commerce e Sistemas Web",
            description:
              "Criação de aplicações web de alta performance, landing pages e sistemas corporativos em Campinas.",
            url: "https://www.balao.info/sistemas",
            serviceType: "Desenvolvimento de Software e Engenharia Web",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DO DESENVOLVEDOR IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Rocket className="w-4 h-4" />
                  Engenharia de Software de Alta Conversão
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Sites, E-commerce & <span className="text-[#E60012]">Sistemas Sob Medida</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Construa a presença digital da sua empresa com tecnologia Next.js de nível mundial, SEO estruturado para o Google e automações de vendas pelo WhatsApp.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de conversar sobre um projeto de site / e-commerce / sistema sob medida para minha empresa."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Falar com Arquiteto de Software
                  </a>
                  <a
                    href="#orcamento"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Solicitar Proposta
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Next.js</p>
                    <p className="text-xs text-slate-400">Ultra Veloz</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">SEO IA</p>
                    <p className="text-xs text-slate-400">Schema.org</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">WhatsApp</p>
                    <p className="text-xs text-slate-400">Funil de Vendas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">100% Seu</p>
                    <p className="text-xs text-slate-400">Código & Dados</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO WORKSPACE DE SOFTWARE IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_sistemas.jpg"
                  alt="Estúdio de desenvolvimento de software e sistemas web em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Stack Moderna: React, Next.js & Turso
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Código limpo, arquitetura escalável e segurança de dados</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTOS E HARDWARE CORPORATIVO DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Hardware Corporativo</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos para Estações de Trabalho e PDV
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar equipamentos corporativos para minha empresa."
              )}`}
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

        {/* FORMULÁRIO DE CAPTAÇÃO DE PROJETO */}
        <section id="orcamento" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Solicite sua Proposta</div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">Conte-nos sobre seu Projeto</h2>
              <p className="text-slate-300 text-sm sm:text-base">
                Receba um plano técnico sob medida com escopo, cronograma e valor transparente.
              </p>
            </div>

            <SistemasLeadForm />
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Desenvolvimento</h2>
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
              Desenvolvimento em Campinas/SP • Atendimento Nacional
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Pronto para Transformar suas Vendas no Digital?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos arquitetos no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar uma reunião sobre o desenvolvimento de um sistema / site para minha empresa."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Consultor de Software
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
