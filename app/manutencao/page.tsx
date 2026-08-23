import { Metadata } from "next";
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
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manutenção de Computadores e Notebooks em Campinas | Balão da Informática",
    description: "Diagnóstico ágil, peças originais e garantia real na loja física do Cambuí.",
    images: ["/logo.png"],
  },
};

const MANUTENCAO_FAQS = [
  {
    question: "Quanto tempo leva o diagnóstico do meu notebook ou PC?",
    answer:
      "Na maioria dos casos, o diagnóstico completo em nossa bancada técnica é concluído em até 24 horas úteis, com relatório detalhado e orçamento antes de qualquer intervenção.",
  },
  {
    question: "Qual o prazo de garantia dos serviços prestados?",
    answer:
      "Todos os serviços de manutenção e peças trocadas contam com garantia legal com suporte pós-venda direto no balcão da nossa loja física no Cambuí.",
  },
  {
    question: "Vocês realizam o serviço de coleta e entrega (leva e traz)?",
    answer:
      "Sim! Oferecemos serviço de motoboy segurado para coleta e devolução de equipamentos em Campinas e cidades da região metropolitana.",
  },
  {
    question: "Meus arquivos pessoais e documentos da empresa são apagados?",
    answer:
      "Sempre preservamos seus dados. Em casos em que a reinstalação do sistema operacional é recomendada, efetuamos o backup completo prévio dos seus arquivos.",
  },
];

export default async function ManutencaoPage() {
  const [allProducts, keywordUpgrades] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["ssd", "memoria", "ram", "cooler", "pasta termica", "fonte"], 16),
  ]);

  let upgradeProducts = keywordUpgrades;
  if (upgradeProducts.length === 0) {
    upgradeProducts = allProducts.slice(0, 8);
  }

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Manutenção e Assistência Técnica", item: "https://www.balao.info/manutencao" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(upgradeProducts, "https://www.balao.info/manutencao"),
          generateFAQSchema(MANUTENCAO_FAQS),
          generateServiceSchema({
            name: "Assistência Técnica de Computadores e Notebooks em Campinas",
            description:
              "Serviços especializados de manutenção preventiva, formatação, troca de peças e reparos eletrônicos em Campinas/SP.",
            url: "https://www.balao.info/manutencao",
            serviceType: "Manutenção e Reparo de Computadores e Notebooks",
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
                <Wrench className="w-4 h-4" />
                Laboratório Próprio no Cambuí
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Assistência Técnica de PC & Notebook com <span className="text-[#E60012]">Garantia Real</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Computador travando, notebook não liga ou lentidão extrema?
                Nossos técnicos diagnosticam com rapidez e resolvem na bancada do Cambuí com peças de primeira linha.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de agendar um diagnóstico para o meu computador / notebook na assistência da Balão."
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
                  Conhecer Serviços
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">+15.000</p>
                  <p className="text-xs text-slate-400">Reparos Concluídos</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">24 Horas</p>
                  <p className="text-xs text-slate-400">Diagnóstico Médio</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">100%</p>
                  <p className="text-xs text-slate-400">Backup Seguro</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Garantia</p>
                  <p className="text-xs text-slate-400">Peças e Mão de Obra</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUTOS DE UPGRADE REAIS DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Peças para Upgrade</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                SSDs, Memórias e Peças Pronta Entrega
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar peças para upgrade no meu notebook / computador."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte upgrades com nossos técnicos <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {upgradeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* PRINCIPAIS SERVIÇOS TÉCNICOS */}
        <section id="servicos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Nossos Serviços Especializados</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Soluções técnicas completas para pessoas físicas e empresas em Campinas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Formatação Limpa com Backup</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reinstalação do Windows 11 oficial, atualização de todos os drivers, antivírus e preservação rigorosa de todos os seus arquivos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Sparkles className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Limpeza Preventiva & Pasta Térmica</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Desmontagem completa, banho ultrassônico em componentes, troca de pasta térmica por composto de prata/cerâmica e redução de ruído.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <HardDrive className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Upgrade de SSD NVMe e RAM</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição de HD antigo por SSD até 10x mais rápido com clonagem fiel do seu sistema sem perder programas instalados.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Laptop className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Troca de Tela e Teclado de Notebook</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Substituição de telas LED/IPS Full HD quebradas, troca de teclados falhando e recuperação de dobradiças de carcaça quebradas.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Cpu className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Reparo em Placa-Mãe (Micro-soldagem)</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Laboratório com câmera térmica para identificar curtos em linhas primárias, substituição de MOSFETs, PWM e regravação de chip de BIOS.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Truck className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Coleta e Entrega na Região</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Comodidade total: retiramos e entregamos seu equipamento em Campinas, Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Assistência Técnica</h2>
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
              Seu Computador Novo de Novo em Poucas Horas
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos técnicos no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de agendar o conserto do meu computador / notebook na Balão."
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
