import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import QuickLeadSection from "@/components/QuickLeadSection";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { LEAD_INTENTS, getLeadIntent } from "@/lib/lead-intents";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return LEAD_INTENTS.map((intent) => ({ slug: intent.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const intent = getLeadIntent(slug);

  if (!intent) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `https://www.balao.info/urgente/${intent.slug}`;

  return {
    title: `${intent.title}`,
    description: intent.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title: `${intent.title} | Balão da Informática`,
      description: intent.description,
    },
  };
}

export default async function UrgenteIntentPage({ params }: Props) {
  const { slug } = await params;
  const intent = getLeadIntent(slug);

  if (!intent) {
    notFound();
  }

  const canonical = `https://www.balao.info/urgente/${intent.slug}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Urgente", item: "https://www.balao.info/urgente" },
    { name: intent.shortTitle, item: canonical },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: intent.title,
            description: intent.description,
            url: canonical,
            serviceType: intent.serviceLabel,
          }),
          generateFAQSchema(intent.faqs),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-sm uppercase tracking-[0.25em] text-red-300 font-bold">
              Atendimento Urgente
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {intent.title}
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
              {intent.urgency}
            </p>
          </div>
        </section>

        <section className="py-14 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              O que normalmente está acontecendo
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {intent.problems.map((problem) => (
                <div
                  key={problem}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 shadow-sm"
                >
                  {problem}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <QuickLeadSection
              title={`Precisa resolver: ${intent.shortTitle.toLowerCase()}?`}
              description="Quem chegou nessa página normalmente já está pronto para pedir ajuda. Use o formulário ou vá direto para o WhatsApp."
              messageTemplate={`Olá! Preciso de atendimento urgente para ${intent.shortTitle.toLowerCase()} em ${intent.city}.`}
              source={`urgente-${intent.slug}`}
              cityLabel={intent.city}
              serviceLabel={intent.serviceLabel}
              formTitle="Pedir ajuda urgente"
            />
          </div>
        </section>

        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Perguntas frequentes
            </h2>
            <div className="mt-8 space-y-4">
              {intent.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <summary className="cursor-pointer list-none text-lg font-bold text-slate-900">
                    {faq.question}
                  </summary>
                  <p className="mt-4 text-slate-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
