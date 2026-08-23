import { Metadata } from "next";
import Header from "@/components/Header";
import {
  Smartphone,
  Battery,
  Cpu,
  ShieldCheck,
  Wrench,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
  AlertTriangle,
  MessageCircle,
  Truck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conserto de iPhone, iPad e MacBook em Campinas | Assistência Apple Especializada | Balão da Informática",
  description:
    "Assistência técnica especializada Apple no Cambuí, Campinas. Troca de tela de iPhone, bateria, conector de carga, Face ID, teclado e reparo de placa lógica de MacBook. Peças premium com garantia de até 1 ano.",
  keywords: [
    "conserto iphone campinas",
    "assistencia tecnica apple campinas cambui",
    "troca tela iphone campinas",
    "bateria iphone campinas",
    "conserto macbook campinas",
    "reparo placa iphone campinas",
    "face id iphone campinas",
    "balao da informatica apple",
  ],
  alternates: { canonical: "https://www.balao.info/reparoapple" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/reparoapple",
    title: "Assistência Técnica Especializada Apple em Campinas | Balão da Informática",
    description:
      "Troca de tela e bateria de iPhone em até 3 horas. Laboratório avançado para reparo de MacBooks e iPads no Cambuí.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conserto de iPhone e MacBook em Campinas | Balão da Informática",
    description: "Assistência técnica Apple com peças de alta definição e garantia em Campinas.",
    images: ["/logo.png"],
  },
};

const APPLE_FAQS = [
  {
    question: "Quanto tempo demora o conserto do iPhone ou MacBook?",
    answer:
      "Trocas de tela e bateria de iPhone são finalizadas em até 3 horas em nosso laboratório no Cambuí. Reparos de placa lógica, substituição de teclado de MacBook e troca de vidros traseiros a laser levam em média de 24h a 48h.",
  },
  {
    question: "As telas mantêm o True Tone e taxa de atualização de 120Hz ProMotion?",
    answer:
      "Sim! Utilizamos programadoras profissionais para transferir os dados da tela original (True Tone copy) e utilizamos displays OLED / Super Retina XDR que preservam 100% da fidelidade de cores, brilho e fluidez ProMotion.",
  },
  {
    question: "A bateria trocada exibe a saúde do sistema normalmente?",
    answer:
      "Sim. Em modelos recentes (iPhone 11 ao 15/16 Pro), realizamos o procedimento de solda com fita spot welder e reprogramação da controladora BMS original para que a saúde da bateria apareça sem avisos de 'peça desconhecida'.",
  },
  {
    question: "Vocês atendem por motoboy com coleta e entrega?",
    answer:
      "Sim! Oferecemos o serviço de coleta e entrega expressa via motoboy segurado em Campinas e cidades vizinhas (Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo).",
  },
];

export default async function ReparoApplePage() {
  const [allProducts, keywordApple] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["apple", "iphone", "macbook", "ipad", "airpods", "magsafe"], 16),
  ]);

  let appleProducts = keywordApple;
  if (appleProducts.length === 0) {
    appleProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Reparo Apple", item: "https://www.balao.info/reparoapple" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(appleProducts, "https://www.balao.info/reparoapple"),
          generateFAQSchema(APPLE_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica Apple Especializada em Campinas",
            description:
              "Reparo avançado de iPhone, iPad e MacBook com peças premium e garantia no Cambuí em Campinas.",
            url: "https://www.balao.info/reparoapple",
            serviceType: "Conserto e Manutenção de Equipamentos Apple",
          }),
        ]}
      />
      <Header />

      {/* Banner de Urgência Impeccable */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <AlertTriangle className="w-4 h-4 animate-pulse" />
        <span>SEU IPHONE CAIU NA ÁGUA OU QUEBROU A TELA? TRAGA NO CAMBUÍ PARA DIAGNÓSTICO IMEDIATO!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                <Smartphone className="w-4 h-4" />
                Assistência Especializada no Cambuí
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Conserto de iPhone & Mac com <span className="text-[#E60012]">Peças Premium</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Tela trincada, bateria durando pouco, Face ID inoperante ou MacBook sem ligar?
                Nosso laboratório conta com ferramentas de precisão, microscópios térmicos e técnicos certificados.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de um orçamento para reparo do meu equipamento Apple (iPhone / iPad / MacBook)."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir Orçamento no WhatsApp
                </a>
                <a
                  href="#servicos"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Tabela de Serviços
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Até 3 Horas</p>
                  <p className="text-xs text-slate-400">Troca de Tela / Bateria</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">1 Ano</p>
                  <p className="text-xs text-slate-400">Garantia em Telas</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">True Tone</p>
                  <p className="text-xs text-slate-400">Cores 100% Originais</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Vedação IP68</p>
                  <p className="text-xs text-slate-400">Adesivo Reposto</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE DISPOSITIVOS E ACESSÓRIOS APPLE DA BASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja & Acessórios Apple</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Produtos Apple e Acessórios em Destaque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar aparelhos e acessórios Apple disponíveis para pronta entrega."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte modelos e cabos originais <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {appleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* SERVIÇOS APPLE DETALHADOS */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Soluções Completas para seu Apple</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Atendimento rápido para iPhone, iPad, MacBook Air, MacBook Pro e iMac.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Smartphone className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Tela OLED / Retina</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição com tela de alta taxa de atualização, restauração de True Tone e preservação do Face ID.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Battery className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Bateria com Saúde 100%</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Células novas de polímero de lítio com transplante de chip BMS original para leitura correta de ciclos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Placa Lógica & Curto</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Micro-soldagem para aparelhos molhados, sem áudio (CI de áudio), sem sinal de rede (baseband) e problemas de carga (Tristar/Hydra).
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Wrench className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Vidro Traseiro a Laser</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Remoção limpa do vidro quebrado sem abrir todo o aparelho, mantendo o carregamento sem fio MagSafe intacto.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Teclado e Tela MacBook</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Troca de display Retina, teclado, trackpad e solução de falhas na linha de backlight (Flexgate) do MacBook Pro.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Conector de Carga & Câmeras</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição da porta Lightning / USB-C frouxa e lentes de câmera trincadas ou com foco instável.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Assistência Apple</h2>
          </div>

          <div className="space-y-4">
            {APPLE_FAQS.map((faq, idx) => (
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
              Laboratório no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Deixe seu Apple Novo de Novo Hoje Mesmo
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Entre em contato pelo WhatsApp e receba seu orçamento na hora.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar o conserto do meu iPhone / iPad / MacBook na assistência Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista Apple
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
