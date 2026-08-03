import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import {
  REGIONAL_CITIES,
  REGIONAL_SERVICES,
  buildRegionalServicePath,
} from "@/lib/local-seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Atendimento em Campinas e Região",
  description:
    "Encontre atendimento local para assistência técnica, conserto de notebook, PC Gamer e reparo Apple em Campinas, Sumaré, Hortolândia, Paulínia, Valinhos e Vinhedo.",
  alternates: { canonical: "https://www.balao.info/regiao" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/regiao",
    title: "Atendimento em Campinas e Região | Balão da Informática",
    description:
      "Páginas locais para captar clientes de Campinas e região com atendimento rápido, WhatsApp e loja física.",
  },
};

export default function RegiaoPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Região", item: "https://www.balao.info/regiao" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
          generateServiceSchema({
            name: "Atendimento local em Campinas e região",
            description:
              "Hub de páginas regionais para captar clientes de informática, assistência técnica, notebooks, PC Gamer e Apple.",
            url: "https://www.balao.info/regiao",
            serviceType: "Atendimento local e captação regional",
          }),
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="bg-slate-950 text-white py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300 font-bold">
              SEO Local
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Atendimento em Campinas e Região para trazer cliente para dentro da loja
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-slate-300 leading-relaxed">
              Este hub concentra páginas locais com alta intenção de compra e atendimento.
              A ideia aqui é simples: quem procurar serviço ou produto na sua região encontra a Balão primeiro.
            </p>
          </div>
        </section>

        <section className="py-14 bg-white border-b border-slate-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Principais cidades atendidas
            </h2>
            <p className="mt-3 text-slate-600 max-w-3xl">
              Priorizamos cidades com maior proximidade, demanda e chance de conversão para loja física, retirada, orçamento e WhatsApp.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {REGIONAL_CITIES.map((city) => (
                <div
                  key={city.slug}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <h3 className="text-2xl font-black text-slate-900">{city.name}</h3>
                  <p className="mt-3 text-sm text-slate-600">
                    Bairros e regiões mais fortes: {city.neighborhoods.join(", ")}.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {REGIONAL_SERVICES.map((service) => (
                      <Link
                        key={service.slug}
                        href={buildRegionalServicePath(city.slug, service.slug)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                      >
                        {service.shortName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Serviços com maior intenção comercial
            </h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {REGIONAL_SERVICES.map((service) => (
                <div
                  key={service.slug}
                  className="rounded-3xl bg-white border border-slate-200 p-7 shadow-sm"
                >
                  <h3 className="text-2xl font-black text-slate-900">{service.shortName}</h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">{service.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {REGIONAL_CITIES.slice(0, 4).map((city) => (
                      <Link
                        key={`${service.slug}-${city.slug}`}
                        href={buildRegionalServicePath(city.slug, service.slug)}
                        className="text-sm font-bold text-blue-700 hover:text-blue-900"
                      >
                        {service.shortName} em {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
