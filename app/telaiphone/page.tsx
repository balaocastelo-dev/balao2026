import { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd, {
  generateOrganizationSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import {
  Smartphone,
  Battery,
  ShieldCheck,
  Clock,
  Zap,
  Star,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Award,
  CreditCard,
  MapPin,
  ChevronRight,
  Droplets,
  Eye,
  Camera,
  Search,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Model3DViewer from "@/components/Model3DViewer";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Troca de Tela e Bateria de iPhone em Campinas | Pronto em até 3 Horas | Balão da Informática",
  description:
    "Assistência técnica especializada Apple no Cambuí, Campinas. Troca de tela OLED/Retina e troca de bateria de iPhone em até 3 horas. Peças premium, True Tone mantido e garantia de até 1 ano.",
  keywords: [
    "troca tela iphone campinas",
    "trocar bateria iphone campinas",
    "conserto tela iphone cambui",
    "tela iphone oled campinas",
    "bateria iphone 100 saude",
    "assistencia tela iphone campinas",
    "balao da informatica tela iphone",
  ],
  alternates: {
    canonical: "https://www.balao.info/telaiphone",
  },
  openGraph: {
    title: "Troca de Tela e Bateria de iPhone em Campinas | Balão da Informática",
    description: "Seu iPhone novo de novo em até 3 horas. Especialistas em Apple no Cambuí, Campinas.",
    url: "https://www.balao.info/telaiphone",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Troca de Tela de iPhone em Campinas | Balão da Informática",
    description: "Troca de tela e bateria de iPhone com True Tone e garantia de 1 ano.",
    images: ["/logo.png"],
  },
};

const IPHONE_SCREEN_FAQS = [
  {
    question: "Quanto tempo demora a troca da tela do iPhone?",
    answer:
      "Na Balão da Informática, realizamos a troca da tela em até 3 horas na nossa loja física do Cambuí. Muitos modelos convencionais ficam prontos em menos de 60 minutos.",
  },
  {
    question: "O True Tone continua funcionando após a substituição?",
    answer:
      "Sim! Utilizamos reprogramadoras EEPROM para transferir o código serial da tela original para o novo display OLED, preservando 100% da calibração de cor do True Tone e o sensor de brilho automático.",
  },
  {
    question: "A bateria trocada mostra a saúde percentual no iOS?",
    answer:
      "Sim, utilizamos baterias com células de alta densidade e realizamos o transplante da placa controladora BMS original para que o percentual de saúde seja exibido normalmente nas configurações do iOS.",
  },
  {
    question: "O iPhone continua com a vedação contra poeira e respingos?",
    answer:
      "Sim, substituímos a fita adesiva perimetral de vedação (seal) no padrão de fábrica antes de fechar o aparelho para assegurar proteção contra umidade e poeira.",
  },
];

export default async function TelaIPhonePage() {
  const [allProducts, keywordApple] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["iphone", "apple", "capa", "carregador", "tela"], 16),
  ]);

  let appleProducts = keywordApple;
  if (appleProducts.length === 0) {
    appleProducts = allProducts.slice(0, 8);
  }

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Troca de Tela iPhone", item: "https://www.balao.info/telaiphone" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(appleProducts, "https://www.balao.info/telaiphone"),
          generateFAQSchema(IPHONE_SCREEN_FAQS),
          generateServiceSchema({
            name: "Troca Expressa de Tela e Bateria de iPhone em Campinas",
            description:
              "Serviço de substituição de tela OLED, vidro e bateria de iPhone em até 3 horas com garantia no Cambuí.",
            url: "https://www.balao.info/telaiphone",
            serviceType: "Reparo de Tela e Bateria de Smartphone Apple",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION WITH 3D MODEL */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Zap className="w-4 h-4" />
                  Pronto em até 3 Horas
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Troca de Tela & Bateria de <span className="text-[#E60012]">iPhone em Campinas</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Não fique dias sem seu celular. Troque a tela trincada ou a bateria viciada do seu iPhone
                  no mesmo dia com peças de primeira linha, vedação de fábrica e garantia de até 1 ano no Cambuí.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de um orçamento para troca de tela / bateria do meu iPhone."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Orçamento Imediato no WhatsApp
                  </a>
                  <a
                    href="#modelos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Modelos Atendidos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Até 3h</p>
                    <p className="text-xs text-slate-400">Tempo de Reparo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">1 Ano</p>
                    <p className="text-xs text-slate-400">Garantia em Telas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">True Tone</p>
                    <p className="text-xs text-slate-400">Cores Preservadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">100%</p>
                    <p className="text-xs text-slate-400">Saúde de Bateria</p>
                  </div>
                </div>
              </div>

              {/* 3D Model Interactive */}
              <div className="lg:col-span-5 relative aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800">
                <Model3DViewer
                  title="iPhone 3D Visualizer"
                  src="https://sketchfab.com/models/ba401e6a3cf14a13876e4c75fb7ca525/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS E ACESSÓRIOS APPLE DA BASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja de Acessórios</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Acessórios e Carregadores para iPhone
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar películas e capas para meu iPhone."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte películas 3D e cabos originais <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {appleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* MODELOS DE IPHONE ATENDIDOS */}
        <section id="modelos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Modelos com Troca Expressa</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Peças em estoque para atendimento imediato na bancada do Cambuí.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-center">
              {[
                "iPhone 15 / Plus / Pro / Max",
                "iPhone 14 / Plus / Pro / Max",
                "iPhone 13 / Mini / Pro / Max",
                "iPhone 12 / Mini / Pro / Max",
                "iPhone 11 / Pro / Pro Max",
                "iPhone X / XR / XS / XS Max",
                "iPhone SE (2ª e 3ª Geração)",
                "iPhone 8 / 8 Plus",
                "iPhone 7 / 7 Plus",
                "Vidros Traseiros a Laser",
                "Câmeras e Lentes Safira",
                "Conectores de Carga USB-C/Lightning",
              ].map((model, idx) => (
                <div
                  key={idx}
                  className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-4 hover:border-[#E60012] transition-colors"
                >
                  <Smartphone className="w-6 h-6 text-[#E60012] mx-auto mb-2" />
                  <p className="font-bold text-xs sm:text-sm text-white">{model}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Troca de Tela e Bateria</h2>
          </div>

          <div className="space-y-4">
            {IPHONE_SCREEN_FAQS.map((faq, idx) => (
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
              Bancada Técnica no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Recupere a Fluidez do seu iPhone Hoje Mesmo
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Atendimento rápido com técnicos especialistas em Apple.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de consultar o valor da troca de tela / bateria para o meu modelo de iPhone."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar Técnico no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
