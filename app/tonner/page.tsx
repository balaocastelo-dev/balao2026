import { Metadata } from "next";
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
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venda e Entrega de Toner em Campinas | Balão da Informática",
    description: "Toners originais e compatíveis com entrega expressa em Campinas e região.",
    images: ["/logo.png"],
  },
};

const TONER_FAQS = [
  {
    question: "O toner compatível pode danificar minha impressora?",
    answer:
      "Não. Trabalhamos exclusivamente com toners compatíveis 100% novos (não são remanufaturados), importados e certificados com padrão ISO 9001/14001, com cilindro e pó de alta definição que garantem a mesma qualidade e proteção para o fusor da sua impressora.",
  },
  {
    question: "Vocês atendem faturamento corporativo para empresas (CNPJ)?",
    answer:
      "Sim! Oferecemos faturamento no boleto bancário para empresas cadastradas, com emissão de Nota Fiscal eletrônica (NFe) completa, desconto progressivo por quantidade e entregas programadas.",
  },
  {
    question: "Qual o tempo de entrega para escritórios em Campinas?",
    answer:
      "Para a cidade de Campinas (Cambuí, Centro, Taquaral, Guanabara, Barão Geraldo, Tecnopark, Swiss Park), realizamos a entrega expressa via motoboy no mesmo dia ou com opção de retirada imediata em nosso balcão.",
  },
  {
    question: "Qual a garantia oferecida nos toners?",
    answer:
      "Todos os nossos toners contam com garantia total contra defeitos de fabricação ou falhas de impressão com troca expressa diretamente em nossa loja física no Cambuí.",
  },
];

export default async function TonnerPage() {
  const [allProducts, keywordToners] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["toner", "cartucho", "tinta", "impressora", "suprimento"], 24),
  ]);

  const fallbackToners = allProducts.filter((p) => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase();
    return text.includes("toner") || text.includes("cartucho") || text.includes("impress");
  });

  const combined = [...keywordToners, ...fallbackToners];
  const uniqueProductsMap = new Map();
  for (const p of combined) {
    if (!uniqueProductsMap.has(p.id)) {
      uniqueProductsMap.set(p.id, p);
    }
  }

  let tonerProducts = Array.from(uniqueProductsMap.values());
  if (tonerProducts.length === 0) {
    tonerProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Toners e Suprimentos", item: "https://www.balao.info/tonner" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(tonerProducts, "https://www.balao.info/tonner"),
          generateFAQSchema(TONER_FAQS),
          generateServiceSchema({
            name: "Venda e Entrega de Toners e Suprimentos em Campinas",
            description:
              "Suprimentos de impressão laser e jato de tinta para escritórios, clínicas e empresas em Campinas com entrega expressa.",
            url: "https://www.balao.info/tonner",
            serviceType: "Distribuição e Venda de Suprimentos de Impressão",
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
                <Truck className="w-4 h-4" />
                Entrega Expressa para Empresas em Campinas
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Toners & Suprimentos com <span className="text-[#E60012]">Preço de Distribuidora</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Mantenha sua empresa imprimindo sem interrupções. Linha completa de toners HP, Brother, Samsung e Canon
                com alto rendimento de páginas, preto denso e faturamento facilitado para CNPJ.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de uma cotação de toner para a minha empresa. Qual o modelo que vocês têm disponível?"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Pedir Cotação Rápida no WhatsApp
                </a>
                <a
                  href="#catalogo"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Catálogo de Toners
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">100% Novos</p>
                  <p className="text-xs text-slate-400">Zero Remanufatura</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">Faturamento</p>
                  <p className="text-xs text-slate-400">Boleto para Empresas</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Alto Rendimento</p>
                  <p className="text-xs text-slate-400">Páginas com Cobertura 5%</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Garantia Balão</p>
                  <p className="text-xs text-slate-400">Troca Expressa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Estoque Físico & Pronta Entrega</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Toners e Suprimentos Disponíveis
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Preciso de um modelo de toner específico que não localizei no site. Vocês têm no estoque?"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte seu modelo com um atendente <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {tonerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* MARCAS ATENDIDAS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Marcas e Linhas Suportadas</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Suprimentos para impressoras laser monocromáticas e coloridas com alta durabilidade.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { brand: "HP LaserJet", models: "CF258A, CF248A, CE285A, W1030A, 105A" },
                { brand: "Brother", models: "TN1060, TN2370, TN3472, TN660, DR1060" },
                { brand: "Samsung / HP", models: "MLT-D111S, D101S, D104S, D105L" },
                { brand: "Canon", models: "CRG-051, 137, 128, G3110/G3160 tintas" },
                { brand: "Kyocera", models: "TK-1175, TK-3182, TK-1152" },
                { brand: "Ricoh", models: "SP3710, SP3510, MP2501" },
                { brand: "Epson EcoTank", models: "Tintas T544, T504, 664 originais" },
                { brand: "Suprimentos & Peças", models: "Cilindros de imagem (Drum) e chips" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-5 hover:border-[#E60012] transition-colors"
                >
                  <p className="font-extrabold text-base text-white">{item.brand}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.models}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS B2B */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4">
              <Building2 className="w-10 h-10 text-[#E60012]" />
              <h3 className="text-xl font-bold text-white">Faturamento para CNPJ</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cadastre sua empresa e pague no boleto a prazo com Nota Fiscal paulista e condições de atacado.
              </p>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4">
              <Truck className="w-10 h-10 text-[#E60012]" />
              <h3 className="text-xl font-bold text-white">Logística Expressa</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Não fique sem imprimir contratos ou notas fiscais. Entregamos no mesmo dia em Campinas.
              </p>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4">
              <ShieldCheck className="w-10 h-10 text-[#E60012]" />
              <h3 className="text-xl font-bold text-white">Garantia & Desempenho</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Testados rigorosamente com alta fidelidade de preto e rendimento real sem vazamento de pó.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Tire suas dúvidas</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas Frequentes sobre Toners</h2>
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
              Retirada no Balcão ou Entrega Expressa
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Cote Agora o Suprimento da sua Empresa
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fone / WhatsApp Comercial: +{SITE_CONFIG.phone.number}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de consultar o estoque e valores de toner para entrega em Campinas."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com o Setor de Suprimentos
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
