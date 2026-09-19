import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
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
import { LEAD_INTENTS, getLeadIntent } from "@/lib/lead-intents";
import {
  Flame,
  ArrowRight,
  ShieldAlert,
  MessageCircle,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return LEAD_INTENTS.map((intent) => ({ slug: intent.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const intent = getLeadIntent(slug);

  if (!intent) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://www.balao.info/urgente/${intent.slug}`;

  return {
    title: `${intent.title} em Campinas | Balão da Informática`,
    description: intent.description,
    keywords: [
      intent.slug.replace(/-/g, " "),
      "conserto urgente campinas",
      "assistencia tecnica cambui",
      "balao da informatica urgente",
    ],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title: `${intent.title} | Balão da Informática`,
      description: intent.description,
      images: [{ url: "/logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${intent.title} | Balão da Informática`,
      description: intent.description,
      images: ["/logo.png"],
    },
  };
}

export default async function UrgenteIntentPage({ params }: Props) {
  const { slug } = await params;
  const intent = getLeadIntent(slug);

  if (!intent) {
    notFound();
  }

  const [allProducts, keywordMatches] = await Promise.all([
    getProducts(),
    searchProductsByKeywords([intent.serviceLabel.toLowerCase(), "notebook", "ssd", "fonte", "tela"], 8),
  ]);

  let displayProducts = keywordMatches.length > 0 ? keywordMatches : allProducts.slice(0, 8);

  const canonical = `https://www.balao.info/urgente/${intent.slug}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Urgente", item: "https://www.balao.info/urgente" },
    { name: intent.shortTitle, item: canonical },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, canonical),
          generateServiceSchema({
            name: intent.title,
            description: intent.description,
            url: canonical,
            serviceType: intent.serviceLabel,
          }),
          generateFAQSchema(intent.faqs),
        ]}
      />
      <Header />

      {/* Banner de Urgência */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <AlertTriangle className="w-4 h-4 animate-pulse" />
        <span>ATENDIMENTO PRIORITÁRIO: TRAGA NA LOJA DO CAMBUÍ OU CHAME NO WHATSAPP PARA RESERVAR BANCADA!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Flame className="w-4 h-4" />
                {intent.serviceLabel} • Urgência
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {intent.title}
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                {intent.urgency}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    `Olá! Preciso de atendimento urgente para: ${intent.title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir Ajuda Urgente no WhatsApp
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Imediato</p>
                  <p className="text-xs text-slate-400">Triagem Técnica</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">90 Dias</p>
                  <p className="text-xs text-slate-400">Garantia Balão</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Cambuí</p>
                  <p className="text-xs text-slate-400">Loja Física</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Motoboy</p>
                  <p className="text-xs text-slate-400">Leva e Traz</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPLICAÇÃO DO PROBLEMA E SOLUÇÃO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Diagnóstico e Procedimentos Recomendados</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Nossos técnicos utilizam bancada de testes com isolamento eletrostático, fontes de alimentação digitais reguladas e estações de retrabalho para solucionar o problema sem colocar outros componentes em risco.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Clock className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">1. Análise Expressa</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Avaliação imediata dos sintomas para isolar se a falha é de software, alimentação elétrica ou hardware físico.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">2. Reparo com Peça Original</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição ou reparo no mesmo dia utilizando peças em estoque prontas em nossa loja no Cambuí.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">3. Teste de Estresse Final</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Validação completa sob carga para certificar que o aparelho está 100% confiável antes de ser entregue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS E PEÇAS DISPONÍVEIS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças e Hardwares</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos em Estoque no Balcão
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                `Olá! Gostaria de consultar peças para: ${intent.title}`
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

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre este Serviço</h2>
          </div>

          <div className="space-y-4">
            {intent.faqs.map((faq, idx) => (
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
              Bancada de Emergência no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Não Deixe o Problema Piorar. Fale Conosco Agora!
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Atendimento imediato no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  `Olá! Preciso de ajuda imediata para o problema: ${intent.title}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar no WhatsApp de Emergência
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
