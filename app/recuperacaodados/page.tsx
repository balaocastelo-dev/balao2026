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
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recuperação de Dados no Brasil | HD, SSD, RAID | Balão da Informática",
    description: "Laboratório próprio de recuperação de arquivos perdidos com confidencialidade garantida.",
    images: ["/logo.png"],
  },
};

const RECUPERACAO_FAQS = [
  {
    question: "O que devo fazer imediatamente ao perceber a perda de dados ou ruídos no HD?",
    answer:
      "Desligue o computador ou desconecte o HD externo imediatamente da porta USB. Não tente instalar programas de recuperação na mesma unidade, pois novas gravações sobrescrevem os setores e podem tornar a perda definitiva. Entre em contato com nossa equipe para orientações.",
  },
  {
    question: "É possível recuperar dados de SSD e NVMe que pararam de ser reconhecidos na BIOS?",
    answer:
      "Sim! Possuímos ferramentas de hardware para diagnóstico em modo seguro (safe mode de controladoras Phison, Silicon Motion, Samsung) para reconstrução de firmware corrompido e leitura direta dos chips de memória NAND Flash.",
  },
  {
    question: "Como funciona a confidencialidade e sigilo dos meus arquivos e banco de dados?",
    answer:
      "Trabalhamos sob rigoroso termo de confidencialidade (NDA). Os dados recuperados são transferidos em ambiente isolado e entregues diretamente a você, sendo apagados com segurança de nossas estações temporárias após a sua confirmação.",
  },
  {
    question: "Vocês atendem por envio de outras cidades e estados?",
    answer:
      "Sim. Recebemos unidades de todo o Brasil via Sedex ou transportadora com rastreamento. Fornecemos instruções detalhadas de embalagem antiestática e acolchoada para proteção contra impactos no transporte.",
  },
];

const SSD_MODEL_ID = "ad215e54c381456895e21db5062f8714";

export default async function RecuperacaoDadosPage() {
  const [allProducts, keywordStorage] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["ssd", "nvme", "hd", "pendrive", "externo", "cartao"], 16),
  ]);

  let storageProducts = keywordStorage;
  if (storageProducts.length === 0) {
    storageProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Recuperação de Dados", item: "https://www.balao.info/recuperacaodados" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(storageProducts, "https://www.balao.info/recuperacaodados"),
          generateFAQSchema(RECUPERACAO_FAQS),
          generateServiceSchema({
            name: "Recuperação Profissional de Dados em Campinas e Brasil",
            description:
              "Serviço de recuperação de arquivos perdidos em HDs, SSDs NVMe, cartões de memória e sistemas RAID com sigilo total.",
            url: "https://www.balao.info/recuperacaodados",
            serviceType: "Recuperação Forense e Restauração de Dados Digitais",
          }),
        ]}
      />
      <Header />

      {/* Banner de Atenção Impeccable */}
      <div className="bg-[#E60012] text-white py-2.5 px-4 text-center text-xs sm:text-sm font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <AlertTriangle className="w-4 h-4 animate-pulse" />
        <span>HD FAZENDO ESTALOS OU SSD NÃO RECONHECIDO? DESLIGUE O APARELHO E FALE COM NOSSO LABORATÓRIO!</span>
      </div>

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION WITH 3D SSD VIEWER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Atendimento Nacional • Sigilo Absoluto
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Recuperação de Dados em <span className="text-[#E60012]">HD, SSD & RAID</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Perdeu fotos de família, projetos de engenharia ou o banco de dados da sua empresa?
                  Recuperamos arquivos de discos formatados, queimados, molhados ou com falha mecânica no Cambuí.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Preciso de ajuda com recuperação de dados urgente. Meu HD / SSD / dispositivo parou de funcionar."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Avaliar com Especialista no WhatsApp
                  </a>
                  <a
                    href="#dispositivos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Dispositivos Suportados
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Sigilo</p>
                    <p className="text-xs text-slate-400">Termo de Confidencialidade</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Análise Rápida</p>
                    <p className="text-xs text-slate-400">Diagnóstico Sem Compromisso</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Nacional</p>
                    <p className="text-xs text-slate-400">Campinas e Envio Sedex</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">Laboratório</p>
                    <p className="text-xs text-slate-400">Ferramentas de Precisão</p>
                  </div>
                </div>
              </div>

              {/* 3D SSD Viewer */}
              <div className="lg:col-span-5 relative aspect-square max-h-[380px] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800">
                <Model3DViewer
                  title="SSD Solid State Drive 3D"
                  src={`https://sketchfab.com/models/${SSD_MODEL_ID}/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1`}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE DRIVES E ARMAZENAMENTO PARA BACKUP DA BASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Unidades de Armazenamento</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                SSDs, HDs e Armazenamento para Backup
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de comprar um SSD / HD externo para fazer o backup seguro dos meus arquivos."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte opções de SSDs externos e pendrives <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {storageProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* DISPOSITIVOS ATENDIDOS */}
        <section id="dispositivos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Dispositivos que Recuperamos</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Cobertura ampla para mídias magnéticas, memórias flash e servidores corporativos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <HardDrive className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">HDs Internos e Externos</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  HDs Seagate, Western Digital, Toshiba que fazem barulho ('tec-tec'), com placa lógica queimada ou partição RAW.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Database className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">SSDs SATA, M.2 & NVMe</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Recuperação de firmware corrompido, controladora queimada e setores com falha de leitura em memórias NAND.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Server className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Servidores, NAS & RAID</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Reconstrução virtual de arrays RAID 0, 1, 5, 6, 10, volumes Synology, QNAP e servidores Dell PowerEdge.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Usb className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Pendrives e Cartões SD</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Cartões de câmeras fotográficas (SD, MicroSD, CFast) e pendrives que pedem para formatar ou com conector quebrado.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <FileSearch className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Bancos de Dados & Sistemas</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Recuperação de arquivos de e-mail (PST/OST), bancos de dados SQL Server, MySQL, Firebird e projetos AutoCAD/Revit.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Lock className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Arquivos Deletados & Formatados</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Varredura profunda por assinatura de arquivos em casos de exclusão acidental da lixeira ou formatação equivocada.
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
              Laboratório no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Seus Arquivos Têm Salvação. Fale com Nossos Peritos.
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Traga sua unidade ou solicite as orientações de envio por Sedex.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de uma avaliação para recuperação de dados do meu HD / SSD."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Perito em Recuperação
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
