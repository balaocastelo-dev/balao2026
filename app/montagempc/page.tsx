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
    images: [{ url: "/images/landing/hero_montagempc.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Montagem de PC Gamer em Campinas | Balão da Informática",
    description: "Montagem expressa com testes de estresse e acabamento de vitrine.",
    images: ["/images/landing/hero_montagempc.jpg"],
  },
};

const MONTAGEM_FAQS = [
  {
    question: "Posso levar as peças que comprei na internet para vocês montarem?",
    answer:
      "Sim! Você pode trazer todo o seu kit ou comprar componentes que faltam direto na nossa loja física. Realizamos a conferência de compatibilidade, montagem com cable management e testes de bancada.",
  },
  {
    question: "Quanto tempo demora a montagem completa de um PC Gamer?",
    answer:
      "Oferecemos o serviço de montagem expressa em até 3 horas mediante agendamento prévio ou entrega padrão em até 24 horas com todos os testes térmicos e de estabilidade concluídos.",
  },
  {
    question: "O PC já é entregue com Windows e drivers instalados?",
    answer:
      "Sim! Entregamos a máquina com a BIOS atualizada para a versão mais estável, perfis XMP/EXPO de memória RAM habilitados, Windows instalado e todos os drivers da placa de vídeo e chipset configurados.",
  },
  {
    question: "Como funciona a garantia do serviço de montagem?",
    answer:
      "O serviço de montagem conta com garantia Balão da Informática e suporte técnico presencial em nosso balcão no Cambuí.",
  },
];

export default async function MontagemPCPage() {
  const [allProducts, keywordHardware] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["gabinete", "fonte", "watercooler", "cooler", "placa-mae", "rtx", "ryzen", "memoria"], 16),
  ]);

  let displayProducts = keywordHardware.length > 0 ? keywordHardware : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Montagem de PC", item: "https://www.balao.info/montagempc" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/montagempc"),
          generateFAQSchema(MONTAGEM_FAQS),
          generateServiceSchema({
            name: "Montagem Profissional de PC Gamer e Workstation",
            description:
              "Serviço de montagem com cable management de precisão, testes de estresse térmico e airflow otimizado no Cambuí, Campinas.",
            url: "https://www.balao.info/montagempc",
            serviceType: "Montagem e Otimização de Computadores",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DO PC BUILDER IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Cable className="w-4 h-4" />
                  Padrão Enthusiast • Cable Management Impecável
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Montagem de PC Gamer com <span className="text-[#E60012]">Acabamento de Vitrine</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Roteamento de cabos invisível, curva de fans calibrada para pressão positiva de ar e testes de estresse no Cinebench e FurMark.
                  Traga suas peças ou compre o setup completo no balcão do Cambuí.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de agendar a montagem profissional do meu PC Gamer com a equipe da Balão da Informática."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Agendar Montagem no WhatsApp
                  </a>
                  <a
                    href="#pilares"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Nossos Padrões
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Até 3h</p>
                    <p className="text-xs text-slate-400">Montagem Expressa</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Airflow</p>
                    <p className="text-xs text-slate-400">Pressão Positiva</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">XMP/EXPO</p>
                    <p className="text-xs text-slate-400">BIOS Calibrada</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">FurMark</p>
                    <p className="text-xs text-slate-400">Estresse Térmico</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO WORKSHOP IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_montagempc.jpg"
                  alt="Oficina de montagem profissional de PC Gamer em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Artesanato & Engenharia Térmica
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Gabinetes aquário, sleeves customizados e watercoolers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTOS E HARDWARE DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças para Montagem</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Hardware Disponível na Loja
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar gabinetes, fontes e watercoolers para meu novo PC."
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

        {/* OS 6 PILARES DE QUALIDADE NA MONTAGEM */}
        <section id="pilares" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Os 6 Pilares de Montagem da Balão</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Mais do que apenas encaixar peças: nossa montagem é focada em longevidade, silêncio e performance máxima.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cable className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Cable Management Militar</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Todos os cabos são amarrados e direcionados pelas canaletas traseiras com velcro de fixação, deixando a câmara frontal limpa para exibição.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Fan className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Airflow Otimizado</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Orientação correta de entrada e exaustão dos fans criando pressão positiva interna para expulsar a poeira e manter temperaturas baixas.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ThermometerSun className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Pasta Térmica de Alta Condutividade</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Aplicação uniforme de compostos térmicos à base de micropartículas de prata para máxima transferência de calor entre o processador e o cooler.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Atualização de BIOS & Perfil XMP</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Garantimos que sua memória RAM rode na frequência máxima contratada (DDR4/DDR5) ativando com segurança os perfis XMP/EXPO na BIOS.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Gauge className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Testes de Estresse & Temperatura</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Rodamos baterias completas no Cinebench, FurMark e MemTest para certificar que a máquina não terá travamentos ou telas azuis em jogos pesados.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ClipboardCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Checklist de Entrega & Caixas</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Todas as caixas originais, cabos extras, parafusos sobressalentes e manuais são entregues organizados para você.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Montagem</h2>
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
              Bancada Gamer no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Deixe seu PC Gamer nas Mãos de Quem Entende
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Agende sua montagem pelo WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar a montagem do meu PC na loja do Cambuí."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista em Montagem
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
