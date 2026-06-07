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
  REGIONAL_CITIES,
  REGIONAL_SERVICES,
  buildRegionalServicePath,
  buildRegionalWhatsAppUrl,
  getRegionalCity,
  getRegionalService,
} from "@/lib/local-seo";

export const revalidate = 3600;

type Props = {
  params: Promise<{ city: string; service: string }>;
};

export async function generateStaticParams() {
  return REGIONAL_CITIES.flatMap((city) =>
    REGIONAL_SERVICES.map((service) => ({
      city: city.slug,
      service: service.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getRegionalCity(citySlug);
  const service = getRegionalService(serviceSlug);

  if (!city || !service) {
    return {
      title: "Página não encontrada",
      robots: { index: false, follow: false },
    };
  }

  const title = `${service.shortName} em ${city.name} | Balão da Informática`;
  const description = `${service.headline} em ${city.name}. ${service.description} Atendimento rápido, WhatsApp e suporte da Balão da Informática.`;
  const canonical = `https://www.balao.info${buildRegionalServicePath(city.slug, service.slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RegionalServicePage({ params }: Props) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = getRegionalCity(citySlug);
  const service = getRegionalService(serviceSlug);

  if (!city || !service) {
    notFound();
  }

  const canonical = `https://www.balao.info${buildRegionalServicePath(city.slug, service.slug)}`;
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Região", item: "https://www.balao.info/regiao" },
    { name: city.name, item: `https://www.balao.info/regiao/${city.slug}/${service.slug}` },
    { name: service.shortName, item: canonical },
  ];
  const whatsappUrl = buildRegionalWhatsAppUrl(city.name, service.headline);
  const nearbyCities = REGIONAL_CITIES.filter((item) => item.slug !== city.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: `${service.shortName} em ${city.name}`,
            description: `${service.headline} em ${city.name}. ${service.description}`,
            url: canonical,
            serviceType: service.serviceType,
          }),
          generateFAQSchema(service.faqs),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-blue-300 font-bold">
                {city.name} e Região
              </p>
              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
                {service.shortName} em {city.name}
              </h1>
              <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
                {service.hero}
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
                  href={service.primaryHref}
                  className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-bold text-white hover:bg-white/15"
                >
                  Ver Página Principal do Serviço
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <h2 className="text-2xl font-black">Atendimento que converte em cliente</h2>
              <ul className="mt-5 space-y-3 text-slate-200">
                {service.benefits.map((benefit) => (
                  <li key={benefit}>- {benefit}</li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl bg-black/20 p-4 text-sm text-slate-300">
                Bairros e regiões mais fortes em {city.name}: {city.neighborhoods.join(", ")}.
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              O que as pessoas de {city.name} mais procuram
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {service.problems.map((problem) => (
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

        <section className="py-14">
          <div className="container mx-auto px-4 max-w-6xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
              <h2 className="text-3xl font-black text-slate-900">
                Por que essa página existe
              </h2>
              <div className="mt-5 space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Quem busca <strong>{service.shortName.toLowerCase()}</strong> em{" "}
                  <strong>{city.name}</strong> geralmente está com urgência, dor real e quer resposta rápida.
                  Por isso esta página foi construída para responder intenção local, facilitar o contato e reduzir
                  o caminho até o orçamento.
                </p>
                <p>
                  A Balão da Informática atende {city.name} e cidades vizinhas com foco em resolução, transparência
                  e suporte de verdade, seja para loja física, atendimento por WhatsApp ou envio de equipamento.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-sm">
              <h2 className="text-3xl font-black">Cidades próximas</h2>
              <div className="mt-6 space-y-3">
                {nearbyCities.map((nearbyCity) => (
                  <Link
                    key={nearbyCity.slug}
                    href={buildRegionalServicePath(nearbyCity.slug, service.slug)}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10"
                  >
                    {service.shortName} em {nearbyCity.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 bg-white border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 text-center">
              Perguntas frequentes
            </h2>
            <div className="mt-8 space-y-4">
              {service.faqs.map((faq) => (
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

        <section className="py-16 bg-slate-950 text-white text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              Precisa de {service.shortName.toLowerCase()} em {city.name}?
            </h2>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              Clique abaixo e já comece um atendimento pelo WhatsApp com mensagem pronta.
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

        <section className="py-12 bg-slate-100 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-6xl">
            <QuickLeadSection
              title={`Quer ${service.shortName.toLowerCase()} em ${city.name}?`}
              description={`Este bloco foi feito para captar quem já está com intenção alta em ${city.name}. Você pode pedir retorno rápido, orçamento e atendimento pelo WhatsApp.`}
              messageTemplate={`Olá! Quero atendimento para ${service.headline.toLowerCase()} em ${city.name}.`}
              source={`regiao-${city.slug}-${service.slug}`}
              cityLabel={city.name}
              serviceLabel={service.shortName}
              formTitle={`Pedir retorno em ${city.name}`}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
