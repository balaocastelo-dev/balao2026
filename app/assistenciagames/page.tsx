import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  Gamepad2,
  Cpu,
  Zap,
  ThermometerSun,
  Cable,
  Truck,
  MessageCircle,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  Disc,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assistência Técnica de Games em Campinas | Conserto PS5, PS4, Xbox Series e Switch | Balão da Informática",
  description:
    "Especialistas em conserto de consoles e controles em Campinas: PlayStation 5, PS4, Xbox Series X/S, Xbox One e Nintendo Switch. Troca de HDMI, limpeza e metal líquido, reparo de fonte e correção de drift.",
  keywords: [
    "conserto ps5 campinas",
    "manutencao ps4 campinas",
    "assistencia tecnica xbox series campinas",
    "troca hdmi ps5 campinas",
    "limpeza ps5 metal liquido campinas",
    "conserto controle ps5 drift campinas",
    "assistencia nintendo switch campinas",
    "balao da informatica games cambui",
  ],
  alternates: {
    canonical: "https://www.balao.info/assistenciagames",
  },
  openGraph: {
    title: "Assistência Técnica Especializada em Games e Consoles | Balão da Informática",
    description:
      "Seu console está superaquecendo, sem imagem ou desligando? Bancada própria no Cambuí para reparo rápido de PS5, PS4, Xbox e Nintendo Switch.",
    url: "https://www.balao.info/assistenciagames",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/images/landing/hero_assistenciagames.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Conserto de Consoles e Games em Campinas | Balão da Informática",
    description: "Laboratório próprio especializado em PlayStation, Xbox e Nintendo em Campinas.",
    images: ["/images/landing/hero_assistenciagames.jpg"],
  },
};

const GAMES_FAQS = [
  {
    question: "Quanto tempo demora o conserto do meu console?",
    answer:
      "Serviços preventivos como limpeza profunda com troca de metal líquido (PS5) ou pasta térmica premium (PS4/Xbox), além de troca de conector HDMI, costumam ser finalizados em 24 a 48 horas úteis em nosso laboratório próprio no Cambuí.",
  },
  {
    question: "Vocês consertam controle com drift nos analógicos?",
    answer:
      "Sim! Realizamos a substituição dos analógicos tradicionais e também a instalação de analógicos com tecnologia Hall Effect (magnéticos, que nunca mais sofrem com drift) para DualSense (PS5), Xbox Series e Nintendo Switch Joy-Con.",
  },
  {
    question: "Meus jogos, contas e saves são apagados no reparo?",
    answer:
      "Não. Nossos procedimentos de bancada preservam todos os seus dados e contas salvas no SSD/HD interno do console. Caso haja necessidade de restauração de fábrica em casos raros de corrupção de sistema, avisamos antes.",
  },
  {
    question: "Qual a garantia do conserto?",
    answer:
      "Todos os reparos de placa, trocas de conectores HDMI, fontes e periféricos contam com garantia legal com suporte direto no balcão da nossa loja física.",
  },
];

export default async function AssistenciaGamesPage() {
  const [allProducts, keywordGames] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["console", "gamer", "controle", "ps5", "xbox", "headset", "jogo"], 16),
  ]);

  let gameProducts = keywordGames;
  if (gameProducts.length === 0) {
    gameProducts = allProducts.slice(0, 8);
  }

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Assistência Games", item: "https://www.balao.info/assistenciagames" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(gameProducts, "https://www.balao.info/assistenciagames"),
          generateFAQSchema(GAMES_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica de Consoles e Games em Campinas",
            description:
              "Conserto e manutenção especializada de consoles PlayStation, Xbox e Nintendo Switch na loja física do Cambuí.",
            url: "https://www.balao.info/assistenciagames",
            serviceType: "Reparo e Manutenção de Consoles de Videogame",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO REAL DE BANCADA IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Gamepad2 className="w-4 h-4" />
                  Bancada Especializada em Games no Cambuí
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Conserto de Consoles com <span className="text-[#E60012]">Micro-Soldagem & Precisão</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Seu PlayStation 5, PS4, Xbox Series ou Switch esquentando, desligando sozinho ou sem sinal de vídeo?
                  Nosso laboratório conta com microscópios de precisão, reposição de metal líquido original e conserto de controles sem drift.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de um orçamento para conserto do meu videogame (PlayStation / Xbox / Nintendo Switch) na bancada da Balão."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Pedir Diagnóstico no WhatsApp
                  </a>
                  <a
                    href="#servicos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Principais Reparos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">24h a 48h</p>
                    <p className="text-xs text-slate-400">Diagnóstico Ágil</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">90 Dias</p>
                    <p className="text-xs text-slate-400">Garantia Balão</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Metal Líquido</p>
                    <p className="text-xs text-slate-400">Padrão Original PS5</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Hall Effect</p>
                    <p className="text-xs text-slate-400">Analógicos Sem Drift</p>
                  </div>
                </div>
              </div>

              {/* FOTO DA BANCADA TÉCNICA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_assistenciagames.jpg"
                  alt="Laboratório de manutenção de consoles em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bancada de Precisão BGA
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Microscópios térmicos e solda SMD certificada</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTOS E ACESSÓRIOS GAMER REAIS DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja & Acessórios</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos Gamer em Destaque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar controles e acessórios gamer disponíveis na loja física."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte periféricos e consoles no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {gameProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* PRINCIPAIS SERVIÇOS DE GAMES */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Serviços Mais Procurados</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Soluções técnicas com precisão cirúrgica para que você volte a jogar sem preocupações.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ThermometerSun className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Limpeza Térmica & Metal Líquido</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Desobstrução do dissipador, higienização do cooler e aplicação de metal líquido ou pasta térmica premium para eliminar superaquecimento e desligamentos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cable className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Conector HDMI</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição profissional da porta HDMI danificada com estação de retrabalho BGA e micro-soldagem com conectores blindados de alta durabilidade.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Gamepad2 className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Controles & Drift</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conserto de botões R2/L2, troca de analógicos com drift, substituição de baterias e instalação de sensores Hall Effect para PS5, Xbox e Switch.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Fonte Interna</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conserto e troca de fontes queimadas por raio ou picos de energia com componentes de padrão industrial.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Placa-Mãe (Curto)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Diagnóstico avançado com osciloscópio e câmera térmica para localização de curtos em linhas de alimentação e substituição de CI HDMI encoder.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Disc className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Leitor de Disco & Expansão SSD</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conserto do mecanismo de ejeção/leitura de Blu-ray e instalação de SSDs NVMe M.2 Gen4 com dissipador térmico para aumentar espaço no PS5.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Assistência Games</h2>
          </div>

          <div className="space-y-4">
            {GAMES_FAQS.map((faq, idx) => (
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
              Traga seu Console para um Orçamento sem Compromisso
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos técnicos gamers agora mesmo no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar a avaliação do meu videogame na assistência da Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Técnico de Games
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
