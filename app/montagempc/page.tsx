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
import { SITE_CONFIG } from "@/lib/config";
import {
  BadgeCheck,
  Cable,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Cpu,
  Fan,
  Gauge,
  Gem,
  Monitor,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Wrench,
  ArrowRight,
  MapPin,
  Flame,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Montagem Profissional de PC Gamer em Campinas | Cable Management e Airflow | Balão da Informática",
  description:
    "Montagem profissional de PC Gamer com cable management impecável, airflow otimizado, watercooler e testes de estabilidade em Campinas no Cambuí. Entrega rápida em até 3 horas.",
  keywords: [
    "montagem de pc gamer campinas",
    "montador de pc campinas cambui",
    "cable management pc gamer",
    "montagem com watercooler campinas",
    "organizacao de cabos gabinete",
    "airflow pc gamer",
    "teste estabilidade cinebench furmark",
    "balao da informatica montagem pc",
  ],
  alternates: {
    canonical: "https://www.balao.info/montagempc",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Montagem Profissional de PC Gamer | Balão da Informática",
    description: "PC Gamer montado com padrão profissional: cabos ocultos, airflow e testes térmicos no Cambuí.",
    url: "https://www.balao.info/montagempc",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Montagem de PC Gamer em Campinas | Balão da Informática",
    description: "Montagem expressa com testes de estresse e acabamento de vitrine.",
    images: ["/logo.png"],
  },
};

const MONTAGEM_FAQS = [
  {
    question: "Quanto tempo demora a montagem do PC Gamer?",
    answer:
      "Com agendamento e peças disponíveis, a montagem expressa com cable management e testes pode ser entregue em até 3 horas em nossa bancada no Cambuí. Em setups complexos com watercooler customizado ou muitos fans ARGB, o prazo pode ser de 24 horas.",
  },
  {
    question: "Vocês montam computadores com peças compradas em outras lojas?",
    answer:
      "Sim! Realizamos a montagem completa com peças fornecidas pelo cliente ou adquiridas em nossa loja física, fazendo o checklist prévio de compatibilidade e testes individuais de integridade.",
  },
  {
    question: "Quais testes são executados antes da entrega da máquina?",
    answer:
      "Realizamos bateria de testes de estresse em CPU (Cinebench) e GPU (FurMark/Superposition), validação de estabilidade de memória RAM XMP/EXPO e monitoramento térmico de VRM para garantir zero thermal throttling.",
  },
  {
    question: "O serviço inclui instalação de Windows e drivers?",
    answer:
      "Sim! Instalamos a versão limpa e oficial do Windows com todos os drivers atualizados de chipset, placa de vídeo e BIOS na última versão estável.",
  },
];

export default async function MontagemPCPage() {
  const [allProducts, keywordHardware] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["gabinete", "watercooler", "fonte", "cooler", "placa mae", "rtx"], 16),
  ]);

  let hardwareProducts = keywordHardware;
  if (hardwareProducts.length === 0) {
    hardwareProducts = allProducts.slice(0, 8);
  }

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Montagem de PC Gamer", item: "https://www.balao.info/montagempc" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(hardwareProducts, "https://www.balao.info/montagempc"),
          generateFAQSchema(MONTAGEM_FAQS),
          generateServiceSchema({
            name: "Montagem Profissional de PC Gamer e Cable Management em Campinas",
            description:
              "Serviço de montagem especializada de PC Gamer com organização de cabos, otimização de fluxo de ar e testes de benchmark.",
            url: "https://www.balao.info/montagempc",
            serviceType: "Montagem e Customização de Computadores de Alta Performance",
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
                <Sparkles className="w-4 h-4" />
                Padrão Profissional de Vitrine
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Montagem de PC Gamer com <span className="text-[#E60012]">Cable Management Impecável</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Cabos ocultos, airflow direcionado para menor temperatura, pasta térmica de alta condutividade e testes
                rigorosos de estresse. Sua máquina montada por especialistas no Cambuí em até 3 horas.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de um orçamento para montagem do meu PC Gamer com cable management profissional."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Solicitar Montagem no WhatsApp
                </a>
                <a
                  href="#planos"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Níveis de Montagem
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Até 3h</p>
                  <p className="text-xs text-slate-400">Montagem Expressa</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">100% Oculto</p>
                  <p className="text-xs text-slate-400">Cable Management</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Stress Test</p>
                  <p className="text-xs text-slate-400">Cinebench & FurMark</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">BIOS Tuned</p>
                  <p className="text-xs text-slate-400">XMP/EXPO & Fan Curve</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPONENTES E GABINETES REAIS DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças para Montagem</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Gabinetes, Coolers e Fontes em Estoque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar gabinetes aquário e watercoolers disponíveis na loja."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte peças no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {hardwareProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* PILARES DO CABLE MANAGEMENT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Por que a Montagem Profissional Faz Diferença?</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Mais do que estética: fluxo de ar desobstruído garante temperaturas até 12°C menores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cable className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Rotas Ocultas com Velcros</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Amarração traseira setorizada que não pressiona conectores e facilita upgrades futuros sem bagunça.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Fan className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Airflow com Pressão Positiva</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Posicionamento estratégico das ventoinhas (intake/exhaust) para alimentar a GPU com ar fresco e evitar acúmulo de poeira.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Gauge className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Curva de Fans Personalizada</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Calibração da rotação das ventoinhas na BIOS para silêncio em tarefas leves e máxima refrigeração nos jogos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NÍVEIS DE MONTAGEM */}
        <section id="planos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Níveis de Serviço de Montagem</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Escolha a opção ideal para a complexidade do seu setup:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4">
              <h3 className="text-xl font-bold text-white">Montagem Padrão</h3>
              <p className="text-sm text-slate-300">
                Ideal para computadores tradicionais com Air Cooler, organização de cabos básica e teste de boot.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li>✓ Montagem completa de componentes</li>
                <li>✓ Cable management funcional</li>
                <li>✓ Atualização de BIOS</li>
              </ul>
            </div>

            <div className="bg-[#111827] border-2 border-[#E60012] rounded-3xl p-8 space-y-4 shadow-xl relative">
              <div className="absolute -top-3 right-6 bg-[#E60012] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Mais Escolhido
              </div>
              <h3 className="text-xl font-bold text-white">Montagem Gamer Pro</h3>
              <p className="text-sm text-slate-300">
                Para PCs gamer com Watercooler AIO 240/360mm, fans ARGB sincronizados, cable management de vitrine e testes.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li>✓ Instalação de Watercooler AIO</li>
                <li>✓ Cable management estético com velcro</li>
                <li>✓ Sincronização de controladora ARGB</li>
                <li>✓ Testes Cinebench + FurMark</li>
              </ul>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4">
              <h3 className="text-xl font-bold text-white">Montagem Extreme</h3>
              <p className="text-sm text-slate-300">
                Para gabinetes aquário, cabos sleevados, placas de vídeo verticais com riser PCIe 4.0 e tuning fino.
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <li>✓ Cabos sleevados e organizadores</li>
                <li>✓ GPU vertical e bracket anti-sag</li>
                <li>✓ Curva de fan acústica personalizada</li>
                <li>✓ Relatório de benchmark antes/depois</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Montagem de PC</h2>
          </div>

          <div className="space-y-4">
            {MONTAGEM_FAQS.map((faq, idx) => (
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
              Bancada de Montagem no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Pronto para Ver sua Máquina Montada com Perfeição?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Envie a lista de peças no WhatsApp e agende seu horário de montagem expressa.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar a montagem profissional do meu PC Gamer."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Agendar Montagem no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
