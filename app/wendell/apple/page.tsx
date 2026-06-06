import { Metadata } from "next";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Laptop,
  MapPin,
  Monitor,
  Phone,
  ShieldCheck,
  Tablet,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20especializada%20em%20Apple%20em%20Campinas%20e%20regi%C3%A3o.%20Atendimento%20no%20Cambu%C3%AD!";

const features = [
  {
    icon: Wrench,
    title: "Especialização Apple",
    description: "Atendimento focado em MacBook, iMac, iPad, Apple Watch e Mac Mini.",
  },
  {
    icon: Zap,
    title: "Agilidade no atendimento",
    description: "Orientação rápida para entender defeito, modelo e melhor solução.",
  },
  {
    icon: ShieldCheck,
    title: "Serviço com garantia",
    description: "Processo técnico com mais segurança para o seu equipamento.",
  },
  {
    icon: MapPin,
    title: "Foco em Campinas",
    description: "Atendemos Cambuí, Nova Campinas, Guanabara, Taquaral e região.",
  },
];

const services = [
  {
    title: "Assistência Mac Mini",
    description: "Upgrade, limpeza e reparo eletrônico para recuperar desempenho e estabilidade.",
    href: "/wendell/apple/mac-mini",
    image: "/images/apple/subcategories/macmini-card.png",
    icon: Box,
    accent: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    title: "Assistência iMac",
    description: "Tela, SSD, memória e placa lógica com atendimento técnico especializado.",
    href: "/wendell/apple/imac",
    image: "/images/apple/subcategories/imac-card.png",
    icon: Monitor,
    accent: "text-purple-700 bg-purple-50 border-purple-100",
  },
  {
    title: "Assistência iPad",
    description: "Troca de tela, bateria e conector para deixar seu iPad pronto para uso.",
    href: "/wendell/apple/ipad",
    image: "/images/apple/subcategories/ipad-card.png",
    icon: Tablet,
    accent: "text-green-700 bg-green-50 border-green-100",
  },
  {
    title: "Assistência Apple Watch",
    description: "Tela, bateria, coroa digital e outros reparos com precisão.",
    href: "/wendell/apple/apple-watch",
    image: "/images/apple/subcategories/watch-card.png",
    icon: Watch,
    accent: "text-orange-700 bg-orange-50 border-orange-100",
  },
  {
    title: "Assistência MacBook",
    description: "Tela, bateria, teclado, SSD e placa lógica para Air e Pro.",
    href: "/wendell/apple/macbook",
    image: "/images/apple/subcategories/macbook-card.png",
    icon: Laptop,
    accent: "text-violet-700 bg-violet-50 border-violet-100",
  },
];

export const metadata: Metadata = {
  title: "Assistência Técnica Apple em Campinas | Especialista Apple",
  description:
    "Assistência técnica especializada em Apple em Campinas. Reparo de Mac Mini, iMac, iPad, Apple Watch e MacBook com atendimento no Cambuí e bairros próximos.",
  keywords: [
    "assistência apple campinas",
    "reparo mac mini campinas",
    "reparo imac campinas",
    "reparo ipad campinas",
    "reparo apple watch campinas",
    "reparo macbook campinas",
    "assistência técnica apple cambuí",
    "manutenção apple campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple",
    title: "Assistência Técnica Apple em Campinas | Especialista Apple",
    description:
      "Página principal de assistência Apple em Campinas com links rápidos para MacBook, iMac, iPad, Apple Watch e Mac Mini.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/apple/hub-hero-real.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Técnica Apple em Campinas | Especialista Apple",
    description:
      "Página principal de assistência Apple em Campinas com links rápidos para MacBook, iMac, iPad, Apple Watch e Mac Mini.",
    images: ["/images/apple/hub-hero-real.png"],
  },
};

function ServiceCard({
  title,
  description,
  href,
  image,
  icon: Icon,
  accent,
}: {
  title: string;
  description: string;
  href: string;
  image: string;
  icon: typeof Box;
  accent: string;
}) {
  return (
    <Link href={href} className="group">
      <article className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl">
        <div className="relative aspect-[4/3]">
          <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute left-5 top-5">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${accent}`}>
              <Icon className="h-4 w-4" />
              <span>{title.replace("Assistência ", "")}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-black text-gray-900">{title}</h3>
          <p className="mt-3 text-gray-600">{description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600">
            Ver página completa
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function AppleServicesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-gray-100 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.08),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  <Wrench className="h-4 w-4" />
                  Especialista Apple em Campinas
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
                  Assistência técnica{" "}
                  <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    Apple
                  </span>{" "}
                  com páginas dedicadas para cada serviço
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
                  Criamos uma experiência mais direta para quem procura conserto de MacBook, iMac,
                  iPad, Apple Watch e Mac Mini em Campinas, com foco em Cambuí e bairros próximos.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href={WHATSAPP_LINK} target="_blank">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-700 sm:w-auto">
                      <Phone className="h-5 w-5" />
                      Falar no WhatsApp
                    </span>
                  </Link>
                  <Link href="#servicos">
                    <span className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-800 transition-all hover:bg-gray-50 sm:w-auto">
                      Ver páginas de serviço
                    </span>
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Cambuí e região", "Atendimento rápido", "CTA direto para WhatsApp"].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-red-100/60 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/images/apple/hub-hero-real.png"
                      alt="Especialista Apple em Campinas"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
                        Balão da Informática
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">
                        Atendimento Apple para Campinas, Cambuí e bairros próximos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Escolha a página ideal para o seu dispositivo
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Cada subpágina foi organizada para destacar os serviços mais procurados, reforçar
                confiança e facilitar o contato.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.href} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Estrutura pensada para conversão e SEO local
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                O conteúdo foi orientado para buscas em Campinas, com destaque para Cambuí, Nova
                Campinas, Taquaral, Guanabara, Bosque, Centro e bairros próximos.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm"
                >
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-red-600 to-red-700 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-black text-white md:text-5xl">
                Precisa de assistência Apple em Campinas?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
                Fale agora no WhatsApp e siga direto para a página do serviço ideal para o seu
                equipamento.
              </p>
              <Link href={WHATSAPP_LINK} target="_blank">
                <span className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-black text-red-700 shadow-2xl">
                  <Phone className="h-6 w-6" />
                  Solicitar atendimento
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
