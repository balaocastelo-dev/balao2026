import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/db";
import { SITE_CONFIG } from "@/lib/config";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
  generateItemListSchema,
} from "@/components/JsonLd";
import {
  Wrench,
  Laptop,
  Gamepad2,
  Smartphone,
  Database,
  MapPin,
  Flame,
  ArrowRight,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Especialidades e Soluções em Informática | Balão da Informática",
  description:
    "Hub oficial de especialidades da Balão da Informática: assistência técnica de PCs e notebooks, montagem de PC Gamer, reparo de iPhone e MacBook, recuperação de dados e atendimento regional em Campinas.",
  keywords: [
    "especialidades informatica campinas",
    "assistencia tecnica cambui",
    "reparo apple campinas",
    "pc gamer campinas",
    "recuperacao de dados campinas",
    "balao da informatica especialidades",
  ],
  alternates: { canonical: "https://www.balao.info/especialidades" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/especialidades",
    title: "Especialidades e Soluções em Informática | Balão da Informática",
    description: "Hub de soluções técnicas, produtos e atendimento especializado em Campinas.",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Especialidades | Balão da Informática",
    description: "Assistência técnica, PC Gamer, Apple e recuperação de dados em Campinas.",
    images: ["/logo.png"],
  },
};

const SPECIALTY_BLOCKS = [
  {
    title: "Assistência Técnica PC & Notebook",
    description:
      "Conserto ágil de computadores, notebooks e diagnósticos precisos com peças originais e garantia real na bancada do Cambuí.",
    href: "/manutencao",
    icon: Wrench,
  },
  {
    title: "Notebooks & Ultrabooks",
    description:
      "Venda de notebooks novos e seminovos revisados com 6 meses de garantia, upgrades de SSD NVMe e manutenção expressa.",
    href: "/notebooks",
    icon: Laptop,
  },
  {
    title: "PC Gamer & Montagem 3D",
    description:
      "Montagem profissional com cable management de vitrine, airflow direcionado, curvas de fan na BIOS e testes de estresse.",
    href: "/pcgamer",
    icon: Gamepad2,
  },
  {
    title: "Reparo Especializado Apple",
    description:
      "Troca de tela OLED com True Tone e bateria de iPhone em até 3 horas, além de reparo de placa lógica de MacBooks.",
    href: "/reparoapple",
    icon: Smartphone,
  },
  {
    title: "Recuperação de Dados",
    description:
      "Laboratório para recuperação de arquivos em HDs que não reconhecem, SSDs com falha de firmware e arrays RAID de servidores.",
    href: "/recuperacaodados",
    icon: Database,
  },
  {
    title: "Atendimento Urgente",
    description:
      "Canal prioritário para resolver urgências de hardware, fontes queimadas e troca de telas no mesmo dia.",
    href: "/urgente",
    icon: Flame,
  },
  {
    title: "Atendimento Regional",
    description:
      "Cobertura com entrega e motoboy para Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba.",
    href: "/regiao",
    icon: MapPin,
  },
];

const AUTHORITY_FAQS = [
  {
    question: "Qual especialidade devo escolher para um diagnóstico rápido?",
    answer:
      "Se o seu computador, notebook ou console está travando ou não liga, acesse a página de Manutenção Técnica ou envie uma mensagem direta no WhatsApp para triagem imediata com nossa equipe.",
  },
  {
    question: "A Balão da Informática atende somente a cidade de Campinas?",
    answer:
      "Não! Além da nossa loja física no Cambuí em Campinas, atendemos toda a Região Metropolitana de Campinas (RMC) com motoboy segurado e recebemos equipamentos de todo o Brasil via Correios.",
  },
  {
    question: "Os produtos e peças possuem garantia?",
    answer:
      "Sim! Todos os produtos e componentes novos contam com garantia do fabricante e nota fiscal, e os seminovos revisados contam com 6 meses de garantia Balão da Informática.",
  },
];

export default async function EspecialidadesPage() {
  const allProducts = await getProducts();
  const showcaseProducts = allProducts.slice(0, 8);

  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Especialidades", item: "https://www.balao.info/especialidades" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-[#E60012] selection:text-white">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateItemListSchema(showcaseProducts, "https://www.balao.info/especialidades"),
          generateFAQSchema(AUTHORITY_FAQS),
          generateServiceSchema({
            name: "Hub de Especialidades da Balão da Informática",
            description:
              "Guia completo de especialidades técnicas, venda de hardware e assistência em Campinas.",
            url: "https://www.balao.info/especialidades",
            serviceType: "Hub de Soluções e Especialidades em TI",
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
                <Sparkles className="w-4 h-4" />
                Hub de Soluções Especializadas
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Nossas Especialidades em <span className="text-[#E60012]">Tecnologia & Serviços</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                Há mais de duas décadas sendo referência em hardware e bancada técnica em Campinas.
                Conheça nossos setores especializados e escolha o atendimento ideal para sua necessidade.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                    "Olá! Gostaria de consultar uma das especialidades da Balão da Informática."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center gap-3 text-base sm:text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  Falar com um Especialista
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* GRADE DE ESPECIALIDADES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTY_BLOCKS.map((spec, idx) => (
              <Link
                key={idx}
                href={spec.href}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-8 space-y-4 hover:border-[#E60012] transition-colors group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#161f32] border border-slate-700 flex items-center justify-center text-[#E60012] group-hover:bg-[#E60012] group-hover:text-white transition-colors">
                    <spec.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-[#E60012] transition-colors">
                    {spec.title}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{spec.description}</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E60012] pt-4 border-t border-slate-800">
                  Acessar Especialidade <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUTOS REAIS EM DESTAQUE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Loja Balão da Informática</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Produtos e Equipamentos em Estoque
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar produtos disponíveis na loja física."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Consulte nosso catálogo completo <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {showcaseProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQ SCHEMA ENRICHED */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012]">Dúvidas Frequentes</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Perguntas sobre Nossas Especialidades</h2>
          </div>

          <div className="space-y-4">
            {AUTHORITY_FAQS.map((faq, idx) => (
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
              Precisa de Ajuda com Alguma Especialidade?
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
              Loja física: {SITE_CONFIG.address} • Fale diretamente com nossos técnicos e consultores comerciais.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                  "Olá! Gostaria de falar com o time de especialistas da Balão."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com Especialistas no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
