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
    description: "Conserto de computadores, notebooks e diagnóstico com foco em rapidez, clareza e retorno do cliente para a loja.",
    href: "/manutencao",
  },
  {
    title: "Notebooks",
    description: "Venda, upgrade, troca, avaliação e conserto de notebooks para trabalho, estudo e uso profissional.",
    href: "/notebooks",
  },
  {
    title: "PC Gamer",
    description: "Montagem, upgrade e setups completos para quem quer desempenho e atendimento técnico real.",
    href: "/pcgamer",
  },
  {
    title: "Reparo Apple",
    description: "Atendimento para iPhone, iPad, MacBook e outros equipamentos Apple com foco local e comercial.",
    href: "/reparoapple",
  },
  {
    title: "Recuperação de Dados",
    description: "Atendimento para falhas em HD, SSD, sistema e estrutura de backup, muito procurado por empresas e usuários em urgência.",
    href: "/recuperacaodados",
  },
  {
    title: "Atendimento Regional",
    description: "Páginas locais para Campinas e região, com forte intenção de busca e CTA direto para WhatsApp.",
    href: "/regiao",
  },
  {
    title: "Atendimento Urgente",
    description: "Páginas para captar buscas com urgência real, quando o cliente quer resolver hoje e já está pronto para chamar.",
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
              Hub Estratégico
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Páginas que precisam existir para o Google entender exatamente o que você vende e resolve
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
              Este hub centraliza as suas especialidades mais valiosas para tráfego orgânico, captação local e descoberta por mecanismos de busca e IAs.
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
                  <p className="mt-5 text-sm font-bold text-blue-700">Abrir página</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Como este hub ajuda seu negócio
            </h2>
            <div className="mt-8 space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Google e as IAs entendem melhor um site quando ele deixa claras as entidades principais,
                os serviços, as especialidades e os caminhos de navegação entre páginas.
              </p>
              <p>
                Em vez de concentrar tudo só na home, este hub distribui autoridade para páginas com intenção real:
                compra, reparo, urgência, atendimento local e orçamento.
              </p>
              <p>
                Isso aumenta suas chances de aparecer para pessoas da região que precisam resolver um problema agora
                e já estão prontas para mandar mensagem ou visitar a loja.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
