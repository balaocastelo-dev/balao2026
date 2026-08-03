import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";

export const revalidate = 3600;

const SPECIALTY_BLOCKS = [
  {
    title: "Assistência Técnica",
    description: "Conserto de computadores e notebooks com diagnóstico rápido, orçamento claro e garantia no serviço.",
    href: "/manutencao",
  },
  {
    title: "Notebooks",
    description: "Venda, upgrade, troca, avaliação e conserto de notebooks para trabalho, estudo e uso profissional.",
    href: "/notebooks",
  },
  {
    title: "PC Gamer",
    description: "Montagem, upgrade e setups completos: PC gamer com desempenho de verdade, montagem profissional e suporte pós-venda.",
    href: "/pcgamer",
  },
  {
    title: "Reparo Apple",
    description: "Reparo de iPhone, iPad e MacBook com peças de qualidade e atendimento rápido em Campinas.",
    href: "/reparoapple",
  },
  {
    title: "Recuperação de Dados",
    description: "Recuperamos seus arquivos de HD, SSD e sistemas com agilidade — ideal quando o prazo é curto e o dado é importante.",
    href: "/recuperacaodados",
  },
  {
    title: "Atendimento Regional",
    description: "Atendemos Campinas e toda a região com orçamento rápido e resposta direta no WhatsApp.",
    href: "/regiao",
  },
  {
    title: "Atendimento Urgente",
    description: "Precisa resolver hoje? Priorizamos quem não pode esperar: atendimento ágil e resposta imediata no WhatsApp.",
    href: "/urgente",
  },
];

const AUTHORITY_FAQS = [
  {
    question: "Qual página devo acessar se preciso de ajuda urgente?",
    answer: "Se o problema é reparo ou equipamento com defeito, a melhor entrada é a assistência técnica ou a página local da sua cidade na região.",
  },
  {
    question: "Vocês atendem só Campinas?",
    answer: "Não. O atendimento também cobre cidades próximas da região metropolitana e clientes que entram em contato por WhatsApp.",
  },
  {
    question: "Essas páginas servem para orçamento e compra?",
    answer: "Sim. O objetivo é facilitar tanto a captação de orçamento quanto a venda de produtos e upgrades.",
  },
];

export const metadata: Metadata = {
  title: "Especialidades em Informática",
  description:
    "Conheça as principais especialidades da Balão da Informática: assistência técnica, notebooks, PC Gamer, Apple, recuperação de dados e atendimento regional.",
  alternates: { canonical: "https://www.balao.info/especialidades" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/especialidades",
    title: "Especialidades em Informática | Balão da Informática",
    description:
      "Hub de especialidades para fortalecer navegação, SEO e descoberta por Google e IAs.",
  },
};

export default function EspecialidadesPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Especialidades", item: "https://www.balao.info/especialidades" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: "Especialidades e soluções da Balão da Informática",
            description:
              "Hub principal para orientar usuários e buscadores sobre as soluções mais importantes da empresa.",
            url: "https://www.balao.info/especialidades",
            serviceType: "Hub de soluções e especialidades",
          }),
          generateFAQSchema(AUTHORITY_FAQS),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-slate-950 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300 font-bold">
              Soluções em Informática
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Sua tecnologia resolvida hoje: conserto, notebooks, PC Gamer e mais
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
              Atendimento especializado em Campinas e região, com orçamento claro, serviço garantido e resposta rápida no WhatsApp.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {SPECIALTY_BLOCKS.map((block) => (
                <Link
                  key={block.href}
                  href={block.href}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:border-blue-500 hover:shadow-md"
                >
                  <h2 className="text-2xl font-black text-slate-900">{block.title}</h2>
                  <p className="mt-4 text-slate-600 leading-relaxed">{block.description}</p>
                  <p className="mt-5 text-sm font-bold text-blue-700">Ver soluções</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Por que a Balão é a escolha certa
            </h2>
            <div className="mt-8 space-y-4 text-slate-600 leading-relaxed">
              <p>
                Aqui cada especialidade tem gente de verdade por trás: diagnóstico honesto, preço combinado antes de começar e serviço com garantia.
              </p>
              <p>
                Resolvemos de tudo que envolve tecnologia: conserto de PCs e notebooks, montagem de PC gamer, reparo Apple, recuperação de dados e orçamento para empresas.
              </p>
              <p>
                E quando a urgência bate, não perca tempo: fale direto no WhatsApp e resolva hoje mesmo, sem sair de casa.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
