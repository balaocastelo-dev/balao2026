import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  Key,
  ShieldCheck,
  Download,
  MessageCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Laptop,
  Check,
  Zap,
  Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Licenças Originais Microsoft em Campinas | Windows 11 e Office 365 | Balão da Informática",
  description:
    "Compre licenças originais Microsoft Windows 10, Windows 11 Pro, Office 365 e Office Home & Business em Campinas. Envio digital imediato com Nota Fiscal, suporte para instalação e ativação oficial.",
  keywords: [
    "licenca windows 11 campinas",
    "comprar windows original campinas",
    "office 365 campinas",
    "licenca microsoft campinas",
    "windows 10 pro original",
    "office home and business campinas",
    "chave ativacao microsoft campinas",
    "balao da informatica software",
  ],
  alternates: { canonical: "https://www.balao.info/microsoft" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/microsoft",
    title: "Licenças Microsoft Originais em Campinas | Balão da Informática",
    description:
      "Garanta seu software 100% legalizado. Licenças oficiais Windows e Office com Nota Fiscal, garantia vitalícia de ativação e suporte técnico.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Licenças Microsoft Originais em Campinas | Balão da Informática",
    description: "Windows 11 e Office 365 originais com suporte e envio imediato.",
    images: ["/logo.png"],
  },
};

const MICROSOFT_FAQS = [
  {
    question: "Como é feito o envio da chave de ativação da licença?",
    answer:
      "O envio é 100% digital e imediato após a confirmação do pagamento via WhatsApp ou e-mail, acompanhado do link oficial de download direto dos servidores da Microsoft (microsoft.com), instruções de instalação passo a passo e Nota Fiscal eletrônica.",
  },
  {
    question: "A licença do Windows ou Office é vitalícia?",
    answer:
      "Licenças ESD do Windows 10/11 Pro e Office 2021/2024 são perpétuas (vitalícias) para o computador instalado. Já o Microsoft 365 funciona no modelo de assinatura anual com direito a atualizações contínuas e 1TB de nuvem OneDrive.",
  },
  {
    question: "Vocês realizam a instalação ou formatação na loja física?",
    answer:
      "Sim! Se preferir trazer seu notebook ou computador em nossa loja no Cambuí em Campinas, nossa equipe técnica realiza a formatação limpa, instalação oficial do Windows com todos os drivers e ativação da licença.",
  },
  {
    question: "A licença emite Nota Fiscal para comprovação em auditorias de empresas?",
    answer:
      "Sim, fornecemos Nota Fiscal eletrônica completa (NFe) com CNPJ, ideal para conformidade em auditorias de software da ABES e Microsoft.",
  },
];

export default async function MicrosoftPage() {
  const [allProducts, keywordSoftware] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["microsoft", "windows", "office", "licença", "software", "teclado microsoft"], 24),
  ]);

  const fallbackSoftware = allProducts.filter((p) => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase();
    return text.includes("microsoft") || text.includes("windows") || text.includes("office");
  });

  const combined = [...keywordSoftware, ...fallbackSoftware];
  const uniqueProductsMap = new Map();
  for (const p of combined) {
    if (!uniqueProductsMap.has(p.id)) {
      uniqueProductsMap.set(p.id, p);
    }
  }

  let softwareProducts = Array.from(uniqueProductsMap.values());
  if (softwareProducts.length === 0) {
    softwareProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Microsoft & Software", item: "https://www.balao.info/microsoft" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(softwareProducts, "https://www.balao.info/microsoft"),
          generateFAQSchema(MICROSOFT_FAQS),
          generateServiceSchema({
            name: "Venda e Instalação de Software Microsoft em Campinas",
            description:
              "Licenciamento oficial Microsoft Windows e Office com ativação genuína e suporte em Campinas.",
            url: "https://www.balao.info/microsoft",
            serviceType: "Licenciamento e Suporte de Software",
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
                <ShieldCheck className="w-4 h-4" />
                Chaves Oficiais & Ativação Genuína
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Licenças Microsoft com <span className="text-[#E60012]">Envio Imediato</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Legalize o sistema da sua empresa ou PC gamer com chaves genuínas Microsoft. Windows 11 Pro, Office 365
                e Pacote Office com Nota Fiscal, suporte técnico de instalação e ativação oficial.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de comprar uma licença oficial Microsoft (Windows / Office). Como funciona o envio?"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Comprar Licença no WhatsApp
                </a>
                <a
                  href="#catalogo"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Softwares Disponíveis
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">Digital</p>
                  <p className="text-xs text-slate-400">Ativação Imediata</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">100% Legal</p>
                  <p className="text-xs text-slate-400">Com Nota Fiscal NFe</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Suporte</p>
                  <p className="text-xs text-slate-400">Auxílio na Instalação</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Seguro</p>
                  <p className="text-xs text-slate-400">Download no Servidor Oficial</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Catálogo Oficial</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Softwares e Licenças Microsoft
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Preciso de cotação para licenças por volume / corporativas Microsoft para minha empresa."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Licenciamento por Volume / Empresas <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {softwareProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* POR QUE USAR SOFTWARE GENUÍNO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Vantagens do Software Original</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Ativadores piratas (KMS/Cracks) instalam mineradores de criptomoeda e backdoors que roubam senhas bancárias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Lock className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Segurança Total</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Receba todas as atualizações de segurança e patches contra vírus e ransomwares diretamente pelo Windows Update.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Zap className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Desempenho Máximo</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sem processos ocultos consumindo CPU e memória. Seu PC Gamer ou máquina de trabalho roda com 100% de fluidez.
                </p>
              </div>

              <div className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <Building2 className="w-8 h-8 text-[#E60012]" />
                <h3 className="text-lg font-bold text-white">Conformidade Jurídica</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sua empresa blindada contra multas em fiscalizações de software através da comprovação por Nota Fiscal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Licenças Microsoft</h2>
          </div>

          <div className="space-y-4">
            {MICROSOFT_FAQS.map((faq, idx) => (
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
              <Key className="w-4 h-4" />
              Ativação Genuína e Imediata
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Adquira sua Licença em Menos de 5 Minutos
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Nossa equipe orienta você na instalação e ativação oficial. Loja física no Cambuí em Campinas/SP.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Quero comprar uma licença Microsoft original com Nota Fiscal e suporte."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista Microsoft
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
