import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import { LEAD_INTENTS } from "@/lib/lead-intents";
import { Flame, ArrowRight, ShieldAlert, MessageCircle, MapPin, Clock, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const HUB_FAQS = [
  {
    question: "Como funciona o atendimento urgente na Balão da Informática?",
    answer:
      "Você pode trazer seu equipamento diretamente na loja física do Cambuí ou chamar no WhatsApp para priorização de bancada. Casos como queda de líquido, telas quebradas e fontes queimadas recebem triagem imediata.",
  },
  {
    question: "O atendimento urgente atende toda a região de Campinas?",
    answer:
      "Sim! Atendemos Campinas com balcão expresso e oferecemos serviço de coleta e entrega via motoboy para Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.",
  },
  {
    question: "Qual o prazo de reparos em casos urgentes?",
    answer:
      "Trocas de tela, substituição de baterias e fontes costumam ser finalizadas no mesmo dia (entre 1h e 3h). Diagnósticos de placa levam até 24h.",
  },
];

export const metadata: Metadata = {
  title: "Atendimento Urgente de Informática em Campinas | Balão da Informática",
  description:
    "Canal de atendimento expresso para computadores, notebooks, consoles e Apple no Cambuí, Campinas. Diagnóstico rápido e conserto no mesmo dia.",
  alternates: { canonical: "https://www.balao.info/urgente" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/urgente",
    title: "Atendimento Urgente em Campinas | Balão da Informática",
    description: "Hub para buscas urgentes de informática com atendimento prioritário e WhatsApp direto.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atendimento Urgente | Balão da Informática",
    description: "Conserto expresso de computadores e notebooks no Cambuí.",
    images: ["/logo.png"],
  },
};

export default async function UrgenteHubPage() {
  const allProducts = await getProducts();
  const showcaseProducts = allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Urgente", item: "https://www.balao.info/urgente" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(showcaseProducts, "https://www.balao.info/urgente"),
          generateFAQSchema(HUB_FAQS),
          generateServiceSchema({
            name: "Atendimento Urgente em Informática em Campinas",
            description: "Serviço prioritário para conserto de notebooks, PCs e dispositivos Apple no mesmo dia.",
            url: "https://www.balao.info/urgente",
            serviceType: "Assistência Técnica Urgente em Informática",
          }),
        ]}
      />
      <Header />

      {/* Banner de Urgência Impeccable */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <Flame className="w-4 h-4 animate-bounce" />
        <span>PRECISA RESOLVER HOJE? NOSSA BANCADA NO CAMBUÍ ESTÁ PRONTA PARA ATENDER SUA URGÊNCIA!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Zap className="w-4 h-4" />
                Atendimento Prioritário no Mesmo Dia
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Conserto Urgente para quem <span className="text-[#E60012]">Precisa Resolver Hoje</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Notebook de trabalho parou, iPhone quebrou antes de uma viagem ou PC da empresa travou?
                Traga para nossa bancada técnica física no Cambuí com peças a pronta entrega.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Preciso de atendimento urgente na bancada da Balão da Informática hoje."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Chamar no WhatsApp de Urgência
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* GRADE DE INTENÇÕES DE URGÊNCIA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {LEAD_INTENTS.map((intent) => (
              <Link
                key={intent.slug}
                href={`/urgente/${intent.slug}`}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-[#E60012] transition-colors flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#E60012]">
                    <ShieldAlert className="w-4 h-4" />
                    {intent.serviceLabel}
                  </div>
                  <h2 className="text-2xl font-black text-white group-hover:text-[#E60012] transition-colors">
                    {intent.title}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{intent.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E60012] pt-4 border-t border-slate-800">
                  Ver Solução Imediata <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* VITRINE DE HARDWARE DISPONÍVEL IMEDIATAMENTE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças Pronta Entrega</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Disponíveis para Troca Imediata no Balcão
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de saber se vocês têm peças para troca hoje na loja."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte estoque em tempo real <ArrowRight className="w-4 h-4" />
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
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Atendimento Urgente</h2>
          </div>

          <div className="space-y-4">
            {HUB_FAQS.map((faq, idx) => (
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
              Traga Agora para Diagnóstico Sem Fila
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossa equipe de plantão técnico no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Estou a caminho da loja física no Cambuí com um equipamento urgente."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Avisar Chegada no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
