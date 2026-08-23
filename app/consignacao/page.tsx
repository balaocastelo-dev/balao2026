import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import JsonLd, {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import {
  CheckCircle,
  MessageCircle,
  ShieldCheck,
  Zap,
  Cpu,
  MapPin,
  Lock,
  DollarSign,
  Camera,
  Users,
  Smartphone,
  XCircle,
  Monitor,
  Laptop,
  ArrowRight,
  Handshake,
  BadgeCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Venda seu PC ou Notebook Usado em Consignação em Campinas | Balão da Informática",
  description:
    "Transforme seu computador, notebook gamer ou MacBook usado em dinheiro sem riscos. Avaliação justa, vitrine física no Cambuí, contrato transparente e pagamento garantido via PIX.",
  keywords: [
    "vender pc usado campinas",
    "consignacao de computadores campinas",
    "vender notebook usado campinas",
    "compro seu pc gamer campinas",
    "vender macbook campinas",
    "troca de notebook usado campinas",
    "balao da informatica consignacao cambui",
  ],
  alternates: {
    canonical: "https://www.balao.info/consignacao",
  },
  openGraph: {
    title: "Venda seu Equipamento Usado em Consignação | Balão da Informática",
    description: "Nós vendemos seu PC ou notebook para você. Segurança total, vitrine no Cambuí e PIX garantido.",
    url: "https://www.balao.info/consignacao",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Venda seu Usado em Consignação em Campinas | Balão da Informática",
    description: "Avaliação justa, segurança na transação e pagamento rápido para computadores e notebooks usados.",
    images: ["/logo.png"],
  },
};

const CONSIGNACAO_FAQS = [
  {
    question: "Como funciona a venda em consignação na Balão da Informática?",
    answer:
      "Você traz seu equipamento (PC Gamer, Notebook, MacBook, Monitor) para nossa loja no Cambuí. Nossos técnicos realizam a higienização, testes de bancada e cadastram o produto em nossa vitrine física e site. Assim que o item é vendido, o valor combinado é transferido diretamente para a sua chave PIX com total segurança.",
  },
  {
    question: "Meus dados pessoais e arquivos ficam protegidos?",
    answer:
      "Sim! Antes de expor o computador ou notebook, executamos um procedimento de formatação segura (wipe de baixo nível) com instalação limpa do Windows/macOS, garantindo que nenhum documento, foto ou senha pessoal possa ser recuperado.",
  },
  {
    question: "Qual o prazo médio para a venda do equipamento?",
    answer:
      "A média de venda na nossa loja física é de 7 a 15 dias para itens precificados dentro da média de mercado, pois oferecemos aos compradores a possibilidade de parcelamento em até 10x no cartão de crédito e garantia de balcão.",
  },
  {
    question: "Vocês compram à vista ou pegam como entrada na troca por um novo?",
    answer:
      "Sim! Para diversos modelos de alta procura (como MacBooks, notebooks Dell/Lenovo recentes e placas de vídeo RTX), oferecemos a opção de compra imediata ou avaliação como abatimento na compra de um PC Gamer ou notebook novo da nossa loja.",
  },
];

export default async function ConsignacaoPage() {
  const [allProducts, keywordUsed] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["seminovo", "usado", "notebook", "gamer", "macbook"], 16),
  ]);

  let usedProducts = keywordUsed;
  if (usedProducts.length === 0) {
    usedProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Consignação e Venda de Usados", item: "https://www.balao.info/consignacao" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(usedProducts, "https://www.balao.info/consignacao"),
          generateFAQSchema(CONSIGNACAO_FAQS),
          generateServiceSchema({
            name: "Consignação e Avaliação de Computadores Usados em Campinas",
            description:
              "Serviço de intermediação e venda segura de computadores, notebooks e hardware usado na loja física do Cambuí.",
            url: "https://www.balao.info/consignacao",
            serviceType: "Consignação e Compra de Eletrônicos",
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
                <DollarSign className="w-4 h-4" />
                Venda Segura sem Golpes
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Venda seu PC ou Notebook Usado com <span className="text-[#E60012]">Segurança Total</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Evite encontros com estranhos e golpes de falsos comprovantes em marketplaces. Deixe seu equipamento na
                nossa vitrine física no Cambuí e receba o valor direto na sua conta via PIX com contrato formal.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de fazer uma avaliação para vender meu computador / notebook em consignação com a Balão."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <Camera className="w-6 h-6" />
                  Enviar Fotos para Avaliação Grátis
                </a>
                <a
                  href="#como-funciona"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Entenda o Processo
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">+2.500</p>
                  <p className="text-xs text-slate-400">Itens Intermediados</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">7 a 15 Dias</p>
                  <p className="text-xs text-slate-400">Tempo Médio de Venda</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">PIX Seguro</p>
                  <p className="text-xs text-slate-400">Pagamento Garantido</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Contrato</p>
                  <p className="text-xs text-slate-400">Documentação Completa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VITRINE DE PRODUTOS REAIS VENDIDOS EM CONIGNAÇÃO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Exemplos em Nossa Loja</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Equipamentos em Destaque na Vitrine
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Produtos revisados com garantia e parcelamento que atraem compradores todos os dias.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {usedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* COMPARATIVO IMPECCABLE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Por que Vender na Balão da Informática?</h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Veja a diferença entre tentar vender por conta própria versus deixar com nossa equipe:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-red-950/60 rounded-3xl p-8 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-black text-sm uppercase tracking-wider">
                <XCircle className="w-5 h-5 text-red-500" />
                Vender Sozinho em Redes / Classificados
              </div>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Risco de golpes do PIX agendado e falsos intermediários.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Estranhos marcando visitas na sua residência.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Centenas de mensagens de curiosos oferecendo trocas absurdas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Impossibilidade de oferecer garantia ou parcelar para o comprador.
                </li>
              </ul>
            </div>

            <div className="bg-[#111827] border border-[#E60012]/50 rounded-3xl p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider">
                <CheckCircle className="w-5 h-5 text-[#E60012]" />
                Vender na Balão da Informática
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#E60012] font-bold">✓</span>
                  Loja física segura no bairro Cambuí com equipe comercial treinada.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E60012] font-bold">✓</span>
                  Formatação segura e limpeza técnica antes de expor o produto.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E60012] font-bold">✓</span>
                  Oferecemos parcelamento em 10x e garantia ao comprador (vende 3x mais rápido).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E60012] font-bold">✓</span>
                  Pagamento pontual e garantido direto na sua conta bancária.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA O PROCESSO */}
        <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Passo a Passo da Consignação</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Processo simples, transparente e sem burocracia desnecessária:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Envio de Fotos",
                  desc: "Mande fotos e a ficha técnica do seu equipamento pelo nosso WhatsApp.",
                },
                {
                  step: "2",
                  title: "Pré-Avaliação",
                  desc: "Nossos técnicos estimam o valor ideal de venda com base no mercado.",
                },
                {
                  step: "3",
                  title: "Entrega na Loja",
                  desc: "Você deixa o equipamento no Cambuí, assina o contrato e formatamos com segurança.",
                },
                {
                  step: "4",
                  title: "PIX na Conta",
                  desc: "Assim que o cliente compra, o pagamento é transferido na mesma hora para você.",
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-base">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Comuns</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Consignação</h2>
          </div>

          <div className="space-y-4">
            {CONSIGNACAO_FAQS.map((faq, idx) => (
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
              Loja Física no Cambuí • Campinas/SP
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Quer Saber Quanto Vale seu Equipamento Hoje?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Envie fotos agora pelo WhatsApp e receba uma estimativa de preço em poucos minutos sem compromisso.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de uma avaliação para colocar meu computador / notebook em consignação com a Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar Avaliador no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
