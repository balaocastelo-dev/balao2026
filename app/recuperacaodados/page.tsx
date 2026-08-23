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
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  HardDrive,
  Lock,
  MemoryStick,
  MapPin,
  MessageCircle,
  Server,
  ShieldCheck,
  Truck,
  Usb,
  Zap,
  Sparkles,
} from "lucide-react";
import Model3DViewer from "@/components/Model3DViewer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recuperação de Dados Profissional em Campinas e Brasil | HD, SSD/NVMe e RAID | Balão da Informática",
  description:
    "Laboratório especializado em recuperação de dados de HDs que não reconhecem, SSD/NVMe queimado, pendrives corrompidos e servidores RAID. Sigilo total, análise rápida e atendimento nacional em Campinas/SP.",
  keywords: [
    "recuperacao de dados campinas",
    "recuperar dados hd campinas",
    "recuperar dados ssd nvme campinas",
    "recuperacao de dados pendrive campinas",
    "recuperar dados raid servidor",
    "hd externo nao reconhece campinas",
    "recuperacao de arquivos deletados",
    "balao da informatica recuperacao de dados",
  ],
  alternates: {
    canonical: "https://www.balao.info/recuperacaodados",
  },
  openGraph: {
    title: "Recuperação de Dados Profissional em Campinas e Brasil | Balão da Informática",
    description:
      "Atendimento local em Campinas no Cambuí e envio nacional. Recuperação de HD, SSD/NVMe, pendrive e RAID com sigilo total e diagnóstico ágil.",
    url: "https://www.balao.info/recuperacaodados",
    type: "website",
    images: [{ url: "/images/landing/hero_recuperacaodados.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recuperação de Dados no Brasil | HD, SSD, RAID | Balão da Informática",
    description: "Laboratório próprio de recuperação de arquivos perdidos com confidencialidade garantida.",
    images: ["/images/landing/hero_recuperacaodados.jpg"],
  },
};

const RECUPERACAO_FAQS = [
  {
    question: "O que devo fazer imediatamente após perder meus arquivos?",
    answer:
      "Desconecte o dispositivo imediatamente da tomada ou da porta USB. Não tente rodar programas caseiros ou forçar leituras contínuas, pois isso pode desgastar magneticamente a mídia e inviabilizar a recuperação física dos setores.",
  },
  {
    question: "Quanto tempo leva o diagnóstico da minha mídia?",
    answer:
      "O diagnóstico preliminar leva entre 24h e 48h úteis. Em casos de urgência extrema para empresas ou servidores parados, temos atendimento prioritário emergencial no Cambuí.",
  },
  {
    question: "Meus dados e arquivos confidenciais estarão protegidos?",
    answer:
      "Sim. Operamos sob rígido termo de sigilo e confidencialidade (NDA). Os dados recuperados são transferidos para uma nova mídia segura e apagados de nossos servidores após a validação do cliente.",
  },
  {
    question: "É possível recuperar arquivos de SSD queimado ou não reconhecido?",
    answer:
      "Sim! Possuímos hardware para leitura direta de memórias NAND Flash (técnica de Chip-Off) e ferramentas de emulação de controladora para contornar falhas elétricas e de firmware.",
  },
];

export default async function RecuperacaoDadosPage() {
  const [allProducts, keywordStorage] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["ssd", "nvme", "hd", "externo", "pendrive", "kingston", "sandisk"], 16),
  ]);

  let displayProducts = keywordStorage.length > 0 ? keywordStorage : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Recuperação de Dados", item: "https://www.balao.info/recuperacaodados" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/recuperacaodados"),
          generateFAQSchema(RECUPERACAO_FAQS),
          generateServiceSchema({
            name: "Serviço de Recuperação de Dados Profissional",
            description:
              "Laboratório avançado de recuperação de dados em HD, SSD, RAID e mídias danificadas em Campinas.",
            url: "https://www.balao.info/recuperacaodados",
            serviceType: "Recuperação de Dados Forense e Corporativa",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DO LABORATÓRIO CLEANROOM IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Database className="w-4 h-4" />
                  Laboratório Próprio de Recuperação • Campinas/SP
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Recuperação Profissional de <span className="text-[#E60012]">HD, SSD & RAID</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Perdeu fotos, documentos, bancos de dados ou arquivos de trabalho?
                  Laboratório com ferramentas forenses de hardware, leitura de memórias NAND e sigilo absoluto.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Preciso de ajuda urgente para recuperar dados do meu HD / SSD / Servidor na Balão da Informática."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Avaliar Mídia no WhatsApp
                  </a>
                  <a
                    href="#midias"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Mídias Atendidas
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Sigilo NDA</p>
                    <p className="text-xs text-slate-400">100% Confidencial</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Chip-Off</p>
                    <p className="text-xs text-slate-400">Leitura Direta NAND</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Nacional</p>
                    <p className="text-xs text-slate-400">Atendimento Brasil</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Cambuí</p>
                    <p className="text-xs text-slate-400">Balcão Físico</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO LABORATÓRIO */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_recuperacaodados.jpg"
                  alt="Laboratório de recuperação de dados em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Cleanroom & Hardware Forense
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Estações de leitura de blocos e emulação de firmware</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS DE ARMAZENAMENTO E BACKUP DO BANCO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Mídias de Backup & Upgrade</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                SSDs e Unidades de Armazenamento
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar opções de SSD e HD externo para backup."
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

        {/* MÍDIAS ATENDIDAS */}
        <section id="midias" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Mídias e Cenários Atendidos</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Tecnologia para resolver desde quedas físicas até corrupção lógica complexa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <HardDrive className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">HD Externo & Mecânico</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  HDs com barulho de clique (agulha travada), disco não reconhece, queda no chão ou motor travado.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">SSD SATA & NVMe M.2</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  SSDs que entraram em modo de proteção ROM, falha de firmware, queima do circuito de carga e memórias NAND Flash corrompidas.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Server className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Servidores & Arranjos RAID</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Recuperação de arrays RAID 0, 1, 5, 6 e 10 desconfigurados, discos com falha múltipla e sistemas NAS corporativos.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Usb className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Pendrives & Cartões SD</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Conectores USB quebrados, cartões de câmera ilegíveis ou pedindo formatação.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Lock className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Ataques Ransomware</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Análise forense em arquivos sequestrados, identificação de cópias de sombra e restauração de bases SQL e ERPs.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <FileSearch className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Formatação Acidental</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Restauração profunda de partições deletadas, sistemas reinstalados por engano e exclusão permanente de arquivos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Recuperação de Dados</h2>
          </div>

          <div className="space-y-4">
            {RECUPERACAO_FAQS.map((faq, idx) => (
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
              Laboratório Especializado no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Não Arrisque a Perda Definitiva dos seus Arquivos
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos peritos no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de orientações para envio da minha mídia para recuperação de dados."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Iniciar Atendimento no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
