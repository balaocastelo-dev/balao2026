import { Metadata } from "next";
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
  CheckCircle,
  MessageCircle,
  Search,
  Truck,
  Award,
  MapPin,
  Star,
  Wrench,
  ShieldCheck,
  Zap,
  Activity,
  Settings,
  Clock,
  ArrowRight,
  Laptop,
  Cpu,
  HardDrive,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assistência Técnica de Computadores e Notebooks em Campinas | Balão da Informática",
  description:
    "Conserto rápido de computadores, notebooks e MacBooks no Cambuí, Campinas. Formatação com backup, limpeza preventiva, troca de tela, upgrade de SSD NVMe e reparo de placa-mãe.",
  keywords: [
    "assistencia tecnica campinas",
    "manutencao de computadores campinas",
    "conserto de notebook campinas cambui",
    "formatacao de pc campinas",
    "limpeza preventiva pc gamer",
    "troca tela notebook campinas",
    "upgrade ssd campinas",
    "balao da informatica manutencao",
  ],
  alternates: {
    canonical: "https://www.balao.info/manutencao",
  },
  openGraph: {
    title: "Assistência Técnica Especializada em Informática | Balão da Informática",
    description: "Laboratório próprio com técnicos certificados para conserto ágil de PCs e notebooks em Campinas.",
    url: "https://www.balao.info/manutencao",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/images/landing/hero_manutencao.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manutenção de Computadores e Notebooks em Campinas | Balão da Informática",
    description: "Diagnóstico ágil, peças originais e garantia real na loja física do Cambuí.",
    images: ["/images/landing/hero_manutencao.jpg"],
  },
};

const MANUTENCAO_FAQS = [
  {
    question: "Quanto tempo demora o diagnóstico técnico do meu computador ou notebook?",
    answer:
      "A triagem inicial é realizada no mesmo dia da entrada. O orçamento detalhado é enviado diretamente no seu WhatsApp para aprovação antes de qualquer procedimento.",
  },
  {
    question: "Meus arquivos e documentos pessoais ficam seguros durante a manutenção?",
    answer:
      "Sim! Seus dados são tratados com sigilo total. Em serviços de formatação ou troca de SSD, realizamos backup prévio completo de documentos, fotos, navegadores e arquivos de trabalho.",
  },
  {
    question: "Vocês realizam upgrade de notebook lento com SSD e memória?",
    answer:
      "Sim! A instalação de um SSD NVMe de alta velocidade e expansão de memória RAM é o serviço mais procurado, deixando seu notebook até 10x mais rápido em poucas horas.",
  },
  {
    question: "Os serviços contam com garantia legal da loja?",
    answer:
      "Sim! Todos os serviços executados e peças substituídas contam com garantia de 90 dias com suporte presencial no balcão do Cambuí.",
  },
];

export default async function ManutencaoPage() {
  const [allProducts, keywordUpgrades] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["ssd", "memoria", "cooler", "fonte", "pasta termica", "teclado"], 16),
  ]);

  let displayProducts = keywordUpgrades.length > 0 ? keywordUpgrades : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Manutenção Técnica", item: "https://www.balao.info/manutencao" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/manutencao"),
          generateFAQSchema(MANUTENCAO_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica e Manutenção de Informática",
            description:
              "Conserto de computadores, notebooks e hardware com laboratório próprio no Cambuí em Campinas.",
            url: "https://www.balao.info/manutencao",
            serviceType: "Assistência Técnica em Informática",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DE BANCADA TÉCNICA IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Wrench className="w-4 h-4" />
                  Laboratório Próprio • Campinas Cambuí
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Manutenção de Computadores & <span className="text-[#E60012]">Notebooks</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Seu equipamento travando, esquentando ou com tela azul?
                  Laboratório técnico certificado com equipamentos de diagnóstico, upgrades na hora e garantia real.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de um orçamento para manutenção do meu computador / notebook na bancada da Balão da Informática."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Solicitar Orçamento no WhatsApp
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
                    <p className="text-2xl font-black text-white">Triagem 24h</p>
                    <p className="text-xs text-slate-400">Diagnóstico Ágil</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">90 Dias</p>
                    <p className="text-xs text-slate-400">Garantia Balão</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">100% Seguro</p>
                    <p className="text-xs text-slate-400">Backup Completo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Leva e Traz</p>
                    <p className="text-xs text-slate-400">Motoboy Campinas</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO LABORATÓRIO TÉCNICO IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_manutencao.jpg"
                  alt="Técnico realizando manutenção de computadores em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bancada Eletrostática ESD
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Substituição de componentes e teste térmico</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTOS PARA UPGRADE DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças para Upgrade</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Componentes de Upgrade na Hora
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar peças para upgrade do meu computador ou notebook."
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

        {/* GRADE DE SERVIÇOS DE MANUTENÇÃO */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">O que Fazemos no seu Equipamento</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Procedimentos padronizados para devolver velocidade, estabilidade e segurança.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Upgrade de SSD NVMe & RAM</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substitua seu HD lento por um SSD ultrarrápido com clonagem de sistema sem perder nada do seu setup.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Laptop className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Limpeza e Troca de Pasta Térmica</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Desobstrução do cooler, remoção de poeira e aplicação de pasta térmica à base de prata para reduzir temperaturas em até 20°C.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Settings className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Formatação Limpa com Backup</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Instalação oficial do Windows 11/10 com drivers otimizados, pacote Office e antivírus com backup integral de documentos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Wrench className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Tela & Teclado de Notebook</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição de displays quebrados, com linhas ou manchas e troca de teclados com teclas travadas ou falhas de digitação.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo de Placa-Mãe & Curto</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conserto a nível de componente eletrônico para equipamentos que não ligam, não carregam ou apagaram após surto de energia.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <ShieldCheck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Remoção de Vírus & Otimização</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Limpeza profunda de adwares, malwares e malwares espiões que deixam o computador lento ou abrindo janelas indesejadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Manutenção</h2>
          </div>

          <div className="space-y-4">
            {MANUTENCAO_FAQS.map((faq, idx) => (
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
              Deixe seu Computador como Novo Novamente
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos técnicos de plantão no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar uma manutenção para o meu computador / notebook."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Técnico no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
