import { getProducts } from "@/lib/db";
import PCBuilder from "@/components/PCBuilder";
import { Monitor, Cpu, Settings, Wrench, ShieldCheck, Sparkles, MessageCircle, MapPin } from "lucide-react";
import Header from "@/components/Header";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monte seu PC Gamer Customizado em Campinas | Balão da Informática",
  description:
    "Configurador inteligente de PC Gamer peça por peça com verificação automática de compatibilidade, cable management profissional e retirada no Cambuí em Campinas.",
  keywords: [
    "monte seu pc gamer campinas",
    "configurador de pc gamer",
    "montar pc peca por peca",
    "compatibilidade pc gamer",
    "loja montagem pc campinas",
    "balao da informatica monte seu pc",
  ],
  alternates: { canonical: "https://www.balao.info/monteseupc" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/monteseupc",
    title: "Monte seu PC Gamer em Campinas | Balão da Informática",
    description: "Monte seu PC Gamer peça por peça com verificação de compatibilidade e montagem profissional.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monte seu PC Gamer | Balão da Informática",
    description: "Configurador interativo de PC Gamer com peças em estoque no Cambuí.",
    images: ["/logo.png"],
  },
};

const MONTE_SEU_PC_FAQS = [
  {
    question: "Como o configurador valida a compatibilidade das peças?",
    answer:
      "O sistema filtra automaticamente soquetes de processadores (LGA1700, AM4, AM5), compatibilidade de memória RAM (DDR4 vs DDR5), potência recomendada da fonte e suporte a slots M.2 NVMe.",
  },
  {
    question: "Quanto tempo demora para montar o PC que escolhi no configurador?",
    answer:
      "A montagem completa com cable management e testes de estresse é concluída em média entre 3 e 24 horas após a confirmação.",
  },
  {
    question: "Posso finalizar a compra pelo WhatsApp com um técnico?",
    answer:
      "Sim! Ao terminar de selecionar as peças, você pode enviar a lista gerada diretamente para o WhatsApp do nosso consultor para fechar com 10% de desconto no PIX.",
  },
];

export default async function MonteSeuPCPage() {
  const products = await getProducts();

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Monte Seu PC", item: "https://www.balao.info/monteseupc" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white font-sans selection:bg-[#E60012] selection:text-white flex flex-col">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(products.slice(0, 16), "https://www.balao.info/monteseupc"),
          generateFAQSchema(MONTE_SEU_PC_FAQS),
          generateServiceSchema({
            name: "Configurador e Montagem de PC Gamer Personalizado",
            description: "Ferramenta interativa de montagem de computadores sob medida em Campinas.",
            url: "https://www.balao.info/monteseupc",
            serviceType: "Montagem e Customização de Computadores",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-16 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Configurador Inteligente de Hardware
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Monte seu <span className="text-[#E60012]">PC Gamer & Workstation</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Escolha cada componente, verifique a compatibilidade em tempo real e monte a máquina perfeita
                para seu orçamento. Montagem profissional com testes térmicos e retirada no Cambuí.
              </p>
            </div>
          </div>
        </section>

        {/* COMPONENTE PC BUILDER INTERATIVO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PCBuilder products={products} />
        </section>

        {/* DIFERENCIAIS DE MONTAGEM */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#161f32] border border-slate-700 flex items-center justify-center text-[#E60012]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Montagem Profissional</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Seu PC é montado por especialistas com organização de cabos impecável e fluxo de ar otimizado.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#161f32] border border-slate-700 flex items-center justify-center text-[#E60012]">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Testado no Limite</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Realizamos baterias de testes de estresse no Cinebench e FurMark para certificar estabilidade térmica total.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#161f32] border border-slate-700 flex items-center justify-center text-[#E60012]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-white">Garantia Total & Balcão</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Garantia legal e do fabricante em todas as peças com suporte técnico direto na loja do Cambuí.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre a Montagem</h2>
          </div>

          <div className="space-y-4">
            {MONTE_SEU_PC_FAQS.map((faq, idx) => (
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
      </main>
    </div>
  );
}
