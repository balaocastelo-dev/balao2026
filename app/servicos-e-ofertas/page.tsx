import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts, searchProductsByKeywords } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import {
  CheckCircle,
  MessageCircle,
  Wrench,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Truck,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  ArrowRight,
  Clock,
  Laptop,
  Sparkles,
  MapPin,
  Tag,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Serviços de Informática e Ofertas Especiais | Balão da Informática Campinas",
  description:
    "Assistência técnica especializada em notebooks, PCs e Apple no Cambuí, Campinas. Promoções exclusivas de computadores, monitores e periféricos com entrega rápida.",
  keywords: [
    "servicos de informatica campinas",
    "ofertas de computadores campinas",
    "assistencia tecnica informatica cambui",
    "promocoes pc gamer campinas",
    "conserto de notebook campinas",
    "balao da informatica ofertas",
  ],
  alternates: { canonical: "https://www.balao.info/servicos-e-ofertas" },
  openGraph: {
    title: "Serviços de TI e Ofertas Especiais | Balão da Informática",
    description: "Catálogo completo de serviços técnicos e ofertas em destaque no Cambuí, Campinas.",
    url: "https://www.balao.info/servicos-e-ofertas",
    type: "website",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Serviços e Ofertas | Balão da Informática",
    description: "Serviços especializados e ofertas de informática com garantia em Campinas.",
    images: ["/logo.png"],
  },
};

const SERVICOS_FAQS = [
  {
    question: "Como funciona a contratação de pacotes de serviço com compra de peças?",
    answer:
      "Ao adquirir qualquer peça (SSD, memória RAM, cooler ou fonte) em nossa loja física ou site, você pode optar pela instalação imediata com desconto promocional na mão de obra.",
  },
  {
    question: "Qual o prazo de atendimento para empresas da região de Campinas?",
    answer:
      "Atendemos com chamados prioritários para empresas, com diagnóstico no mesmo dia e opção de contrato de suporte mensal preventivo.",
  },
  {
    question: "Os produtos em oferta possuem garantia oficial?",
    answer:
      "Sim! Todos os produtos novos possuem garantia oficial com Nota Fiscal eletrônica (NFe), além de 10% de desconto para pagamento à vista no PIX.",
  },
];

export default async function ServicosEOfertasPage() {
  const [allProducts, keywordOffers] = await Promise.all([
    getProducts(),
    searchProductsByKeywords(["gamer", "notebook", "monitor", "ssd", "teclado"], 16),
  ]);

  let offerProducts = keywordOffers;
  if (offerProducts.length === 0) {
    offerProducts = allProducts.slice(0, 8);
  }

  const breadcrumbs = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Serviços e Ofertas", item: "https://www.balao.info/servicos-e-ofertas" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbs),
          generateItemListSchema(offerProducts, "https://www.balao.info/servicos-e-ofertas"),
          generateFAQSchema(SERVICOS_FAQS),
          generateServiceSchema({
            name: "Serviços de TI e Ofertas Comerciais em Campinas",
            description:
              "Central de serviços técnicos e ofertas promocionais de hardware e periféricos da Balão da Informática.",
            url: "https://www.balao.info/servicos-e-ofertas",
            serviceType: "Serviços de Tecnologia da Informação e Varejo Especializado",
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
                <Tag className="w-4 h-4" />
                Serviços de Bancada + Ofertas Especiais
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Assistência Especializada & <span className="text-[#E60012]">Ofertas Exclusivas</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Unimos a agilidade do e-commerce com a segurança de uma loja física tradicional no Cambuí.
                Confira nossos pacotes de manutenção com desconto na instalação de peças e pronta entrega.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar pacotes de serviços e ofertas disponíveis na loja do Cambuí."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Atendimento Comercial no WhatsApp
                </a>
                <a
                  href="#ofertas"
                  className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold py-4 px-8 rounded-2xl transition-all text-base flex items-center gap-2"
                >
                  Ver Ofertas da Semana
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 text-left">
                <div>
                  <p className="text-2xl font-black text-white">10% OFF</p>
                  <p className="text-xs text-slate-400">À Vista no PIX</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-[#E60012]">10x S/ Juros</p>
                  <p className="text-xs text-slate-400">No Cartão de Crédito</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">30 Minutos</p>
                  <p className="text-xs text-slate-400">Retirada no Balcão</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">Garantia Real</p>
                  <p className="text-xs text-slate-400">Loja Física Cambuí</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OFERTAS EM DESTAQUE REAIS DO BANCO */}
        <section id="ofertas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Ofertas da Semana</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Produtos em Destaque no Estoque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar as promoções ativas do site."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte descontos no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* CATÁLOGO DE SERVIÇOS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Serviços Mais Solicitados</h2>
              <p className="text-sm sm:text-base text-slate-400">
                Soluções técnicas ágeis executadas em nosso laboratório próprio no Cambuí.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Manutenção de Notebooks",
                  desc: "Troca de telas, baterias, teclados e reparo de placa-mãe.",
                  icon: Laptop,
                  href: "/manutencao",
                },
                {
                  title: "Montagem de PC Gamer",
                  desc: "Cable management de vitrine, testes de estresse e airflow otimizado.",
                  icon: Cpu,
                  href: "/montagempc",
                },
                {
                  title: "Reparo Especializado Apple",
                  desc: "Troca de tela e bateria de iPhone em até 3 horas e reparo de MacBook.",
                  icon: Smartphone,
                  href: "/reparoapple",
                },
                {
                  title: "Recuperação de Dados",
                  desc: "Restauração de arquivos em HDs corrompidos, SSDs e servidores RAID.",
                  icon: Database,
                  href: "/recuperacaodados",
                },
                {
                  title: "Assistência de Games",
                  desc: "Conserto de PS5, Xbox e Nintendo Switch, troca de HDMI e metal líquido.",
                  icon: Wrench,
                  href: "/assistenciagames",
                },
                {
                  title: "Criação de Sites e Sistemas",
                  desc: "Desenvolvimento web profissional, SEO e automação para empresas.",
                  icon: Zap,
                  href: "/sistemas",
                },
              ].map((service, idx) => (
                <Link
                  key={idx}
                  href={service.href}
                  className="bg-[#161f32] border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-[#E60012] transition-colors group block"
                >
                  <service.icon className="w-8 h-8 text-[#E60012]" />
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E60012] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{service.desc}</p>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#E60012] pt-2">
                    Saiba mais <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Perguntas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Dúvidas sobre Serviços e Compras</h2>
          </div>

          <div className="space-y-4">
            {SERVICOS_FAQS.map((faq, idx) => (
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
              Fale com Nosso Balcão de Atendimento
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Endereço: {SITE_CONFIG.address} • Atendimento de Segunda a Sexta das 09h às 18h e Sábados das 09h às 13h.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de consultar serviços e produtos disponíveis na loja."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
