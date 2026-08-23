import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import { SITE_CONFIG } from "@/lib/config";
import {
  Printer,
  Truck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Building2,
  Package,
  BadgePercent,
  Phone,
  ArrowRight,
  Search,
  MessageCircle,
  Users,
  Trophy,
  ThumbsUp,
  Star,
  Zap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Venda e Entrega de Toners em Campinas | HP, Brother, Samsung e Canon | Balão da Informática",
  description:
    "Compre toner original e 100% novo compatível em Campinas com entrega expressa para empresas e escritórios. HP, Brother, Samsung, Canon, Kyocera e Ricoh. Faturamento no boleto ou 10% OFF no PIX.",
  keywords: [
    "toner campinas",
    "entrega toner campinas",
    "toner hp campinas",
    "toner brother campinas",
    "toner samsung campinas",
    "cartucho de toner campinas",
    "distribuidora de toner campinas",
    "suprimentos de impressao campinas",
    "toner compatível campinas cambui",
  ],
  alternates: { canonical: "https://www.balao.info/tonner" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/tonner",
    title: "Venda e Entrega de Toner em Campinas | Balão da Informática",
    description:
      "Toners para impressoras laser com entrega rápida para empresas em Campinas e região. Preços de atacado e varejo com pronta entrega no Cambuí.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/landing/hero_tonner.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venda e Entrega de Toner em Campinas | Balão da Informática",
    description: "Toners originais e compatíveis com entrega expressa em Campinas e região.",
    images: ["/images/landing/hero_tonner.jpg"],
  },
};

const TONER_FAQS = [
  {
    question: "Vocês realizam entrega rápida de toner para empresas em Campinas?",
    answer:
      "Sim! Realizamos entregas expressas via motoboy para escritórios, clínicas e empresas em todos os bairros de Campinas e cidades da RMC. Você também pode retirar no balcão do Cambuí.",
  },
  {
    question: "O toner 100% novo compatível danifica a impressora?",
    answer:
      "Não. Nossos toners compatíveis são importados, 100% novos (não são remanufaturados), possuem pó de toner micro-refinado e contam com chip inteligente calibrado que não danifica o cilindro fotocondutor.",
  },
  {
    question: "Empresas possuem faturamento no boleto ou condição especial para lotes?",
    answer:
      "Sim! Oferecemos faturamento via boleto para CNPJ cadastrado, tabela diferenciada para compra em quantidade e 10% de desconto à vista no PIX.",
  },
  {
    question: "Qual o rendimento de páginas dos cartuchos de toner?",
    answer:
      "O rendimento segue o padrão internacional ISO/IEC 19752 (cobertura de 5%), variando de 1.000 páginas até 12.000 páginas nos modelos de alta capacidade (XL).",
  },
];

export default async function TonnerPage() {
  const [allProducts, keywordToners] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["toner", "tinta", "cartucho", "impressora", "brother", "hp", "canon"], 16),
  ]);

  let displayProducts = keywordToners.length > 0 ? keywordToners : allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Toners e Suprimentos", item: "https://www.balao.info/tonner" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(displayProducts, "https://www.balao.info/tonner"),
          generateFAQSchema(TONER_FAQS),
          generateServiceSchema({
            name: "Venda e Distribuição de Toners e Suprimentos de Impressão",
            description:
              "Fornecimento de cartuchos de toner originais e compatíveis para empresas em Campinas e região.",
            url: "https://www.balao.info/tonner",
            serviceType: "Comércio de Suprimentos Corporativos de Impressão",
          }),
        ]}
      />
      <Header />

      <main className="flex-1 space-y-16 sm:space-y-24 py-8 sm:py-12">
        {/* HERO SECTION COM FOTO DE ESCRITÓRIO CORPORATIVO IA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E60012]/15 border border-[#E60012]/40 text-[#E60012] text-xs font-black uppercase tracking-widest">
                  <Printer className="w-4 h-4" />
                  Pronta Entrega Corporativa • Campinas & RMC
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Cartuchos de Toner & <span className="text-[#E60012]">Suprimentos de Impressão</span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Sua empresa não pode parar. Linha completa de toners originais e compatíveis premium para HP, Brother, Samsung e Canon com entrega expressa via motoboy no mesmo dia.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                      "Olá! Gostaria de uma cotação rápida de cartuchos de toner para minha impressora na Balão da Informática."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Cotar Toner no WhatsApp
                  </a>
                  <a
                    href="#produtos"
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                  >
                    Ver Linha de Suprimentos
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                  <div>
                    <p className="text-2xl font-black text-white">Motoboy</p>
                    <p className="text-xs text-slate-400">Entrega Rápida</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#E60012]">Faturado</p>
                    <p className="text-xs text-slate-400">Boleto para CNPJ</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">100% Novo</p>
                    <p className="text-xs text-slate-400">Sem Recarga</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">10% OFF</p>
                    <p className="text-xs text-slate-400">À Vista no PIX</p>
                  </div>
                </div>
              </div>

              {/* FOTO DO ESCRITÓRIO CORPORATIVO IA */}
              <div className="lg:col-span-5 relative aspect-[16/11] rounded-3xl overflow-hidden bg-[#161f32] border border-slate-800 shadow-2xl group">
                <Image
                  src="/images/landing/hero_tonner.jpg"
                  alt="Instalação de cartucho de toner em impressora corporativa em Campinas"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-[#111827]/90 backdrop-blur p-4 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E60012] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Preto Intenso & Alto Rendimento
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">Certificação ISO 9001 e sem resíduos no rolo fusor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS E SUPRIMENTOS DO BANCO */}
        <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Suprimentos em Estoque</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Toners e Tintas Disponíveis
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar se há toner compatível para o modelo da minha impressora."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Envie o modelo no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* MARCAS ATENDIDAS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Marcas e Modelos em Estoque</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Linha completa monocromática e colorida para os maiores fabricantes mundiais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Printer className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">HP LaserJet & Neverstop</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Modelos clássicos como 85A, 83A, 78A, 05A, 26A, 105A, 107A e toners coloridos da série 201A e 410A.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Printer className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Brother DCP & HL Series</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Cartuchos TN-1060, TN-2370, TN-3472, TN-3492 e unidades de cilindro DR-1060 e DR-2340 com chip de reset integrado.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Printer className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Samsung, Canon & Kyocera</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Linhas D111S, D101S, D104S, Canon CRG-137, Kyocera TK Series e garrafas de tinta para EcoTank Epson e MegaTank Canon.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Toners</h2>
          </div>

          <div className="space-y-4">
            {TONER_FAQS.map((faq, idx) => (
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
              Distribuição Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Sua Impressora Parou? Nós Entregamos Agora
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale com nossos atendentes no WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Preciso de toner urgente para minha impressora. Poderiam verificar se há em estoque?"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Pedir Toner Urgente no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
