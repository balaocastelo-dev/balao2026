import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { LEAD_INTENTS } from "@/lib/lead-intents";

export const revalidate = 3600;

const HUB_FAQS = [
  {
    question: "Quando devo usar essas páginas urgentes?",
    answer: "Quando o problema precisa ser resolvido rápido e a pessoa já está pronta para pedir orçamento, chamar no WhatsApp ou levar o equipamento.",
  },
  {
    question: "Essas páginas são focadas em Campinas?",
    answer: "Sim. Elas foram estruturadas com foco principal em Campinas e também ajudam na captação da região próxima.",
  },
];

export const metadata: Metadata = {
  title: "Atendimento Urgente em Campinas",
  description:
    "Páginas de alta intenção para quem precisa resolver notebook, PC, console ou Apple com urgência em Campinas.",
  alternates: { canonical: "https://www.balao.info/urgente" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/urgente",
    title: "Atendimento Urgente em Campinas | Balão da Informática",
    description:
      "Hub para buscas urgentes de informática com CTA forte para WhatsApp e atendimento rápido.",
  },
};

export default function UrgenteHubPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Urgente", item: "https://www.balao.info/urgente" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: "Atendimento urgente em informática em Campinas",
            description:
              "Hub de páginas para captar buscas urgentes relacionadas a notebook, PC, Apple e videogames.",
            url: "https://www.balao.info/urgente",
            serviceType: "Atendimento urgente em informática",
          }),
          generateFAQSchema(HUB_FAQS),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-slate-950 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-sm uppercase tracking-[0.25em] text-red-300 font-bold">
              Atendimento no Mesmo Dia
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Resolva seu problema ainda hoje
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
              Seu computador ou notebook quebrou e você não pode esperar? Chame a Balão da Informática no WhatsApp e resolva ainda hoje, com atendimento rápido em Campinas.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2">
              {LEAD_INTENTS.map((intent) => (
                <Link
                  key={intent.slug}
                  href={`/urgente/${intent.slug}`}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:border-red-500 hover:shadow-md"
                >
                  <h2 className="text-2xl font-black text-slate-900">{intent.title}</h2>
                  <p className="mt-4 text-slate-600 leading-relaxed">{intent.description}</p>
                  <p className="mt-5 text-sm font-bold text-red-600">Preciso resolver agora</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
