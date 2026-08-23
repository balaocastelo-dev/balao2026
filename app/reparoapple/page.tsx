import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  MessageCircle,
  Truck,
  Sparkles,
  Zap,
  Award,
} from "lucide-react";
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
    images: [{ url: "/images/landing/hero_reparoapple.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conserto de iPhone e MacBook em Campinas | Balão da Informática",
    description: "Assistência técnica Apple com peças de alta definição e garantia em Campinas.",
    images: ["/images/landing/hero_reparoapple.jpg"],
  },
};

const APPLE_FAQS = [
  {
    question: "Quanto tempo demora o conserto do iPhone ou MacBook?",
    answer:
      "Trocas de tela e bateria de iPhone são finalizadas em até 3 horas em nosso laboratório no Cambuí. Reparos de placa lógica, substituição de teclado de MacBook e troca de vidros traseiros a laser levam em média de 24h a 48h.",
  },
  {
    question: "A função True Tone e o Face ID continuam funcionando após a troca de tela?",
    answer:
      "Sim! Utilizamos programadores EEPROM de bancada para clonar o serial de fábrica do seu display antigo para a tela nova, mantendo 100% ativas as funções True Tone, sensor de luminosidade e Face ID.",
  },
  {
    question: "Vocês realizam reparo de placa lógica de MacBook sem precisar trocar a placa inteira?",
    answer:
      "Sim! Realizamos reparo a nível de componentes eletrônicos (SMD/BGA), recuperação de trilhas oxidadas por líquido e desoxidação ultrassônica, economizando até 70% em relação ao custo de uma placa nova.",
  },
  {
    question: "Como funciona a garantia dos serviços Apple?",
    answer:
      "Oferecemos garantia de 90 dias a até 1 ano para componentes de tela e bateria, com suporte direto em nosso balcão físico.",
  },
];

export default async function ReparoApplePage() {
  const [allProducts, keywordApple] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["apple", "iphone", "macbook", "ipad", "airpods", "magsafe", "carregador"], 16),
  ]);

  let displayProducts = keywordApple.length > 0 ? keywordApple : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Reparo Apple", item: "https://www.balao.info/reparoapple" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/reparoapple"),
          generateFAQSchema(APPLE_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica Apple Especializada em Campinas",
            description:
              "Reparo avançado em iPhones, MacBooks, iPads e Apple Watch com bancada própria no Cambuí.",
            url: "https://www.balao.info/reparoapple",
            serviceType: "Manutenção e Reparo de Dispositivos Apple",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO REAL DE BANCADA APPLE IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Smartphone className="w-4 h-4" />
                  Especialista Apple no Cambuí
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Assistência Especializada para <span className="text-[#E60012]">iPhone & Mac</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Troca expressa de tela e bateria em até 3 horas com preservação do True Tone.
                  Reparo de placa lógica em microscópio óptico e desoxidação química com garantia e nota fiscal.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de um orçamento para reparo do meu aparelho Apple (iPhone / iPad / MacBook / Apple Watch)."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Orçamento Rápido no WhatsApp
                  </a>
                  <a
                    href="#servicos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Serviços de Bancada
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Até 3h</p>
                    <p className="text-xs text-slate-400">Telas e Baterias</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">True Tone</p>
                    <p className="text-xs text-slate-400">100% Preservado</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">12x S/ Juros</p>
                    <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Leva e Traz</p>
                    <p className="text-xs text-slate-400">Motoboy Segurado</p>
                  </div>
                </div>
              </div>

              {/* FOTO DA BANCADA APPLE */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_reparoapple.jpg"
                  alt="Laboratório avançado de reparo Apple em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Microscópios & Programador EEPROM
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Diagnóstico térmico e ferramentas certificadas</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS APPLE REAIS DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja Balão Apple</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos & Acessórios Apple
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar aparelhos e acessórios Apple disponíveis."
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

        {/* GRADE DE SERVIÇOS DE BANCADA */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Serviços Apple Especializados</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Técnicos treinados para atuar com a mais alta precisão em cada geração de hardware Apple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Smartphone className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Tela com True Tone</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição com peças OLED/Super Retina de alta resolução, calibração de toque e preservação total das cores originais.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Battery className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Bateria com Saúde 100%</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Células de íon de lítio de alta densidade sem mensagem de peça desconhecida e com ciclos zerados.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Placa Lógica & BGA</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Recuperação de MacBooks e iPhones que não ligam, curtos em linhas de alimentação e substituição de chips de carga (Tristar/Hydra).
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Wrench className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Vidro Traseiro a Laser</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Remoção limpa com máquina a laser de alta precisão sem necessidade de abrir o aparelho ou danificar o chassi.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Teclado & Trackpad de MacBook</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reparo e substituição de teclas travadas, falha no mecanismo tesoura/borboleta e trackpad que não clica.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Desoxidação por Contato com Líquido</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Banho químico em cuba ultrassônica com secagem em estufa térmica para reverter oxidações e salvar dados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Reparo Apple</h2>
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
              Sede Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Recupere seu Aparelho Apple com Segurança Total
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos técnicos Apple no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar o conserto do meu aparelho Apple no balcão do Cambuí."
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
