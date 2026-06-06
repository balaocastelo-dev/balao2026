import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MapPin, Phone, type LucideIcon } from "lucide-react";

type ThemeClasses = {
  badge: string;
  button: string;
  buttonSoft: string;
  iconWrap: string;
  icon: string;
  ctaBg: string;
  ctaButtonText: string;
};

type HighlightItem = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

type ServiceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type AppleServicePageProps = {
  backHref: string;
  backLabel: string;
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  highlightedWord: string;
  description: string;
  heroImageSrc: string;
  heroImageAlt: string;
  heroCaption: string;
  whatsappHref: string;
  theme: ThemeClasses;
  highlights: HighlightItem[];
  services: ServiceItem[];
  localTitle: string;
  localDescription: string;
  ctaTitle: string;
  ctaDescription: string;
};

const neighborhoods = [
  "Cambuí",
  "Nova Campinas",
  "Guanabara",
  "Taquaral",
  "Bosque",
  "Centro",
  "Proença",
  "Chácara da Barra",
];

export default function AppleServicePage({
  backHref,
  backLabel,
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  highlightedWord,
  description,
  heroImageSrc,
  heroImageAlt,
  heroCaption,
  whatsappHref,
  theme,
  highlights,
  services,
  localTitle,
  localDescription,
  ctaTitle,
  ctaDescription,
}: AppleServicePageProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-gray-100 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.08),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <Link
                  href={backHref}
                  className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  <span aria-hidden="true">←</span>
                  <span>{backLabel}</span>
                </Link>

                <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${theme.badge}`}>
                  <BadgeIcon className="h-4 w-4" />
                  <span>{badgeLabel}</span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
                  {title}{" "}
                  <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    {highlightedWord}
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
                  {description}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href={whatsappHref} target="_blank">
                    <span
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold shadow-lg transition-all sm:w-auto ${theme.button}`}
                    >
                      <Phone className="h-5 w-5" />
                      Chamar no WhatsApp
                    </span>
                  </Link>
                  <Link href="#servicos-detalhados">
                    <span
                      className={`inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-base font-semibold transition-all sm:w-auto ${theme.buttonSoft}`}
                    >
                      Ver serviços com fotos
                    </span>
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    "Orçamento rápido",
                    "Atendimento com garantia",
                    "Especialistas em Apple",
                  ].map((item) => (
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
                      src={heroImageSrc}
                      alt={heroImageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
                        Atendimento Apple em Campinas
                      </p>
                      <p className="mt-2 text-xl font-bold text-white">{heroCaption}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicos-detalhados" className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Serviços mais procurados com fotos reais
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Conte com diagnóstico preciso, reparo seguro e explicação clara do que precisa
                ser feito no seu equipamento.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-3 text-gray-600">{item.description}</p>
                    <Link href={whatsappHref} target="_blank">
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600">
                        Solicitar orçamento
                        <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="text-3xl font-black text-gray-900">Problemas que resolvemos</h2>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service.title}
                      className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5"
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.iconWrap}`}>
                        <service.icon className={`h-6 w-6 ${theme.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{service.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  <MapPin className="h-4 w-4" />
                  Atendimento local
                </div>
                <h2 className="text-3xl font-black text-gray-900">{localTitle}</h2>
                <p className="mt-4 text-gray-600">{localDescription}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {neighborhoods.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-gray-900 p-6 text-white">
                  <h3 className="text-xl font-bold">Precisa resolver hoje?</h3>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Fale direto no WhatsApp para confirmar modelo, defeito e prazo estimado.
                  </p>
                  <Link href={whatsappHref} target="_blank">
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900">
                      <Phone className="h-4 w-4" />
                      Iniciar atendimento
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`py-16 md:py-20 ${theme.ctaBg}`}>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4" />
                Atendimento rápido para Campinas e região
              </div>
              <h2 className="text-3xl font-black text-white md:text-5xl">{ctaTitle}</h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
                {ctaDescription}
              </p>
              <Link href={whatsappHref} target="_blank">
                <span
                  className={`mt-8 inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-black shadow-2xl ${theme.ctaButtonText}`}
                >
                  <Phone className="h-6 w-6" />
                  Falar agora no WhatsApp
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
