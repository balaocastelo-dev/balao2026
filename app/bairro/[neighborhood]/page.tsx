import Link from "next/link";
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
import {
  CAMPINAS_NEIGHBORHOODS,
  getNeighborhoodBySlug,
  getNeighborhoodWhatsAppUrl,
} from "@/lib/neighborhood-seo";
import { SITE_CONFIG } from "@/lib/config";

export const revalidate = 3600;

type Props = {
  params: Promise<{ neighborhood: string }>;
};

export async function generateStaticParams() {
  return CAMPINAS_NEIGHBORHOODS.map((n) => ({
    neighborhood: n.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhood: slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    return {
      title: "Bairro não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `Informática em ${neighborhood.name} Campinas | Loja de Computador e Assistência Técnica`;
  const description = `Loja de informática em ${neighborhood.name}, Campinas. Venda de PCs, notebooks, periféricos, assistência técnica, conserto de notebook e upgrades. Atendimento rápido pela Balão da Informática.`;
  const canonical = `https://www.balao.info/bairro/${neighborhood.slug}`;

  return {
    title,
    description,
    keywords: neighborhood.localKeywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      title,
      description,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const neighborhoodFaqs = [
  {
    question: "Vocês atendem essa região de Campinas?",
    answer:
      "Sim. A Balão da Informática atende todos os bairros de Campinas e região metropolitana, com loja física no Cambuí e atendimento por WhatsApp.",
  },
  {
    question: "Como faço para comprar ou pedir orçamento?",
    answer:
      "Basta clicar no botão do WhatsApp no topo da página. Enviamos mensagem pronta com os dados do bairro e serviço desejado.",
  },
  {
    question: "Vocês fazem entrega nessa região?",
    answer:
      "Sim. Para Campinas e região, oferecemos opções de retirada na loja e entrega com consulta de disponibilidade.",
  },
  {
    question: "A assistência técnica tem garantia?",
    answer:
      "Sim. Todo serviço e peça substituída contam com garantia legal e suporte pós-venda da nossa equipe.",
  },
];

export default async function NeighborhoodPage({ params }: Props) {
  const { neighborhood: slug } = await params;
  const neighborhood = getNeighborhoodBySlug(slug);

  if (!neighborhood) {
    notFound();
  }

  const canonical = `https://www.balao.info/bairro/${neighborhood.slug}`;
  const whatsappUrl = getNeighborhoodWhatsAppUrl(neighborhood);
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Campinas", item: "https://www.balao.info/regiao/campinas/assistencia-tecnica" },
    { name: neighborhood.name, item: canonical },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: `Informática em ${neighborhood.name}, Campinas`,
            description: `Loja de informática, assistência técnica e venda de computadores no bairro ${neighborhood.name}, Campinas.`,
            url: canonical,
            serviceType: "Loja de informática e assistência técnica",
            areaServed: [neighborhood.name, "Campinas", ...neighborhood.nearbyNeighborhoods],
          }),
          generateFAQSchema(neighborhoodFaqs),
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: SITE_CONFIG.name,
            description: `Atendimento de informática no bairro ${neighborhood.name}, Campinas. Venda de PCs, notebooks, assistência técnica e upgrades.`,
            url: canonical,
            telephone: `+${SITE_CONFIG.phone.number}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: SITE_CONFIG.address,
              addressLocality: "Campinas",
              addressRegion: "SP",
              postalCode: SITE_CONFIG.postalCode,
              addressCountry: "BR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: -22.9099,
              longitude: -47.0626,
            },
            areaServed: [
              { "@type": "City", name: "Campinas", containedInPlace: { "@type": "State", name: "São Paulo" } },
              ...neighborhood.nearbyNeighborhoods.map((n) => ({
                "@type": "Neighborhood",
                name: n,
                containedInPlace: { "@type": "City", name: "Campinas" },
              })),
            ],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Serviços de Informática",
              itemListElement: neighborhood.mainServices.map((service) => ({
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: service,
                },
              })),
            },
          },
        ]}
      />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-300 font-bold">
                {neighborhood.region} — Campinas/SP
              </p>
              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Informática em {neighborhood.name}
              </h1>
              <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
                {neighborhood.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  className="rounded-full bg-green-500 px-7 py-4 text-base font-black text-white hover:bg-green-600"
                >
                  Falar no WhatsApp Agora
                </Link>
                <Link
                  href="/manutencao"
                  className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-bold text-white hover:bg-white/15"
                >
                  Ver Serviços
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h2 className="text-2xl font-black">Atendimento em {neighborhood.name}</h2>
              <p className="mt-3 text-sm text-slate-300">
                Localização: {neighborhood.distanceFromStore}
              </p>
              <ul className="mt-5 space-y-3 text-slate-200">
                {neighborhood.mainServices.map((service) => (
                  <li key={service} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-black/20 p-4 text-sm text-slate-300">
                <strong>Pontos de referência:</strong> {neighborhood.landmarks.join(", ")}
              </div>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="py-14 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Serviços oferecidos em {neighborhood.name}
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {neighborhood.mainServices.map((service) => (
                <div
                  key={service}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      ✓
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{service}</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Atendimento profissional com garantia e suporte pós-venda.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sobre o bairro */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-6xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <h2 className="text-3xl font-black text-slate-900">
                Sobre {neighborhood.name}
              </h2>
              <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
                <p>{neighborhood.description}</p>
                <p>
                  <strong>Região:</strong> {neighborhood.region}
                </p>
                <p>
                  <strong>Pontos de referência:</strong> {neighborhood.landmarks.join(", ")}
                </p>
                <p>
                  <strong>Bairros vizinhos:</strong> {neighborhood.nearbyNeighborhoods.join(", ")}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-sm">
              <h2 className="text-3xl font-black">Bairros próximos</h2>
              <div className="mt-6 space-y-3">
                {neighborhood.nearbyNeighborhoods.map((nearby) => {
                  const nearbyData = CAMPINAS_NEIGHBORHOODS.find(
                    (n) => n.name === nearby
                  );
                  return (
                    <Link
                      key={nearby}
                      href={
                        nearbyData
                          ? `/bairro/${nearbyData.slug}`
                          : `/regiao/campinas/assistencia-tecnica`
                      }
                      className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10"
                    >
                      Informática em {nearby}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Perguntas frequentes sobre {neighborhood.name}
            </h2>
            <div className="mt-8 space-y-4">
              {neighborhoodFaqs.map((faq) => (
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

        {/* CTA */}
        <section className="py-16 bg-slate-950 text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              Precisa de informática em {neighborhood.name}?
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Atendemos {neighborhood.name} e regiões vizinhas com loja física no Cambuí,
              WhatsApp direto e suporte rápido.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={whatsappUrl}
                target="_blank"
                className="rounded-full bg-green-500 px-7 py-4 text-base font-black text-white hover:bg-green-600"
              >
                Solicitar Atendimento
              </Link>
              <Link
                href="/fale-conosco"
                className="rounded-full border border-white/20 px-7 py-4 text-base font-bold text-white hover:bg-white/10"
              >
                Ver Contatos da Loja
              </Link>
            </div>
          </div>
        </section>

        {/* Lead Form */}
        <section className="py-12 bg-slate-100 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <QuickLeadSection
              title={`Quer atendimento em ${neighborhood.name}?`}
              description={`Atendemos ${neighborhood.name} e região com loja física, WhatsApp e suporte rápido para computadores, notebooks e assistência técnica.`}
              messageTemplate={`Olá! Vim pelo site e quero atendimento da Balão da Informática para ${neighborhood.name}, Campinas.`}
              source={`bairro-${neighborhood.slug}`}
              cityLabel={neighborhood.name}
              serviceLabel="Informática"
              formTitle={`Pedir retorno em ${neighborhood.name}`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
