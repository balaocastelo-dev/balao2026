import { Metadata } from "next";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema, generateOrganizationSchema } from "@/components/JsonLd";
import SafeImage from "@/components/SafeImage";
import AppleReviewsCarousel, { type AppleReview } from "@/components/AppleReviewsCarousel";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  Box,
  Clock3,
  Laptop,
  MapPin,
  MessageCircleMore,
  Monitor,
  Newspaper,
  Phone,
  ShieldCheck,
  Smartphone,
  Tablet,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";
import { listAppleRadarPosts } from "@/lib/apple-news";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20or%C3%A7amento%20para%20assist%C3%AAncia%20Apple%20em%20Campinas.%20Meu%20equipamento%20%C3%A9%3A";

const heroImage = "/images/apple/hub-hero-real.png";

const trustPoints = [
  "Assistência Apple em 1 hora",
  "Retirada e entrega via motoboy grátis",
  "Orçamento sem compromisso e 12x sem juros",
];

const conversionCards = [
  {
    icon: Clock3,
    title: "Assistência Apple em 1 hora",
    description: "Para muitos reparos, você envia o modelo e o defeito e recebe orientação rápida para resolver em cerca de 1 hora.",
  },
  {
    icon: ShieldCheck,
    title: "Mais segurança no atendimento",
    description: "Você entende melhor o serviço, vê os atalhos certos e fala direto com quem resolve.",
  },
  {
    icon: MessageCircleMore,
    title: "Contato direto no WhatsApp",
    description: "Em poucos cliques você chega ao atendimento para tirar dúvidas e pedir orçamento.",
  },
  {
    icon: MapPin,
    title: "Atendimento em Campinas",
    description: "Cambuí, Nova Campinas, Guanabara, Taquaral, Centro e bairros próximos.",
  },
];

const processSteps = [
  {
    title: "1. Conte o defeito",
    description: "Envie modelo, sintoma e fotos pelo WhatsApp para acelerar o atendimento.",
  },
  {
    title: "2. Receba a orientação",
    description: "Você recebe a orientação certa para entender o reparo e seguir para o atendimento.",
  },
  {
    title: "3. Siga para o orçamento",
    description: "Você recebe orçamento sem compromisso, prazo estimado em 1 hora para muitos reparos e opção de parcelar em até 12x sem juros.",
  },
];

const reviews: AppleReview[] = [
  {
    name: "Julio Cesar",
    model: "iPhone 14 Pro Max",
    text: "A tela quebrou e eu precisava do celular pro trabalho. Trocado em 2h no Cambuí, serviço impecável.",
  },
  {
    name: "Beatriz Oliveira",
    model: "iPhone 12 Mini",
    text: "Minha bateria estava estufando. Resolveram rápido, preço justo e o atendimento foi excelente.",
  },
  {
    name: "Marcos Paulo",
    model: "iPhone 13",
    text: "Melhor assistência de Campinas. Atendimento claro, reparo rápido e resultado muito bom.",
  },
];

const services = [
  {
    title: "Assistência iPhone",
    description:
      "Troca de tela, bateria, conector, câmera e reparos técnicos para quem precisa de solução rápida em iPhone.",
    href: "/wendell/apple/iphone",
    image: "/images/apple/subcategories/iphone-card.png",
    icon: Smartphone,
    accent: "text-sky-700 bg-sky-50 border-sky-100",
  },
  {
    title: "Assistência Mac Mini",
    description:
      "Ideal para quem procura reparo, limpeza, upgrade e solução de falhas de desempenho em Mac Mini.",
    href: "/wendell/apple/mac-mini",
    image: "/images/apple/subcategories/macmini-card.png",
    icon: Box,
    accent: "text-blue-700 bg-blue-50 border-blue-100",
  },
  {
    title: "Assistência iMac",
    description:
      "Troca de tela, SSD, memória, placa lógica e atendimento técnico especializado para iMac.",
    href: "/wendell/apple/imac",
    image: "/images/apple/subcategories/imac-card.png",
    icon: Monitor,
    accent: "text-purple-700 bg-purple-50 border-purple-100",
  },
  {
    title: "Assistência iPad",
    description:
      "Troca de tela, bateria, conector de carga e reparos para quem precisa voltar a usar o iPad com segurança.",
    href: "/wendell/apple/ipad",
    image: "/images/apple/subcategories/ipad-card.png",
    icon: Tablet,
    accent: "text-green-700 bg-green-50 border-green-100",
  },
  {
    title: "Assistência Apple Watch",
    description:
      "Tela, bateria, coroa digital e outros reparos para Apple Watch com atendimento rápido.",
    href: "/wendell/apple/apple-watch",
    image: "/images/apple/subcategories/watch-card.png",
    icon: Watch,
    accent: "text-orange-700 bg-orange-50 border-orange-100",
  },
  {
    title: "Assistência MacBook",
    description:
      "Tela, bateria, teclado, SSD e placa lógica para MacBook Air e Pro com suporte especializado.",
    href: "/wendell/apple/macbook",
    image: "/images/apple/subcategories/macbook-card.png",
    icon: Laptop,
    accent: "text-violet-700 bg-violet-50 border-violet-100",
  },
];

export const metadata: Metadata = {
  title: "Assistência Apple em Campinas | Especialista Apple no Cambuí",
  description:
    "Especialista Apple em Campinas para iPhone, MacBook, iMac, iPad, Apple Watch e Mac Mini, com assistência Apple em 1 hora, motoboy grátis, orçamento sem compromisso e 12x sem juros.",
  keywords: [
    "assistência apple campinas",
    "especialista apple campinas",
    "assistência apple cambuí",
    "assistência iphone campinas",
    "conserto apple 12x sem juros campinas",
    "reparo apple motoboy grátis campinas",
    "reparo macbook campinas",
    "reparo imac campinas",
    "reparo ipad campinas",
    "reparo apple watch campinas",
    "reparo mac mini campinas",
    "manutenção apple cambuí",
    "assistência técnica apple nova campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple",
    title: "Assistência Apple em Campinas | Especialista Apple no Cambuí",
    description:
      "Atendimento Apple para iPhone, MacBook, iMac, iPad, Apple Watch e Mac Mini em Campinas com assistência em 1 hora, motoboy grátis e 12x sem juros.",
    siteName: SITE_CONFIG.name,
    images: [{ url: heroImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Apple em Campinas | Especialista Apple no Cambuí",
    description:
      "Atendimento Apple para iPhone, MacBook, iMac, iPad, Apple Watch e Mac Mini em Campinas com assistência em 1 hora, motoboy grátis e 12x sem juros.",
    images: [heroImage],
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
    <article className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl">
      <Link href={href} className="block">
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
      </Link>
      <div className="p-6">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600">{description}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
          >
            Ver página completa
          </Link>
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700"
          >
            Pedir orçamento
          </Link>
        </div>
      </div>
    </article>
  );
}

function NewsPreviewCard({ post }: { post: Awaited<ReturnType<typeof listAppleRadarPosts>>[number] }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm">
      <Link href={`/wendell/apple/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10]">
          <SafeImage
            src={post.cover_image || heroImage}
            fallbackSrc={heroImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-cover"
          />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="rounded-full bg-red-50 px-3 py-1 uppercase tracking-wide text-red-600">{post.category}</span>
            {post.source_domain ? <span>{post.source_domain}</span> : null}
          </div>
          <h3 className="mt-3 text-lg font-extrabold leading-snug text-gray-900">{post.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-600">
            Ler notícia
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default async function AppleServicesPage() {
  const radarPosts = await listAppleRadarPosts(3);

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Início", item: "https://www.balao.info" },
    { name: "Especialista Apple", item: "https://www.balao.info/wendell/apple" },
  ]);

  const faq = generateFAQSchema([
    {
      question: "Vocês atendem apenas Campinas?",
      answer:
        "O foco local desta página é Campinas, especialmente Cambuí, Nova Campinas, Guanabara, Taquaral, Bosque e Centro, mas o primeiro contato também pode ser feito online.",
    },
    {
      question: "Quais equipamentos Apple vocês atendem?",
      answer:
        "Atendemos iPhone, MacBook, iMac, iPad, Apple Watch e Mac Mini com páginas dedicadas para cada tipo de serviço.",
    },
    {
      question: "Como pedir orçamento rápido?",
      answer:
        "Clique nos botões de WhatsApp da página, envie o modelo do equipamento e descreva o defeito para receber orientação inicial.",
    },
    {
      question: "Vocês fazem retirada e entrega?",
      answer:
        "Sim. Informamos retirada e entrega na casa do cliente via motoboy grátis, além de orçamento sem compromisso e possibilidade de parcelamento em até 12x sem juros.",
    },
  ]);

  const org = generateOrganizationSchema();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <Header />

      <main>
        <JsonLd data={[org, breadcrumbs, faq]} />

        <section className="relative overflow-hidden border-b border-gray-100 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.10),_transparent_28%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  <Wrench className="h-4 w-4" />
                  Especialista Apple em Campinas
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
                  Assistência técnica Apple para quem precisa de
                  <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                    {" "}agilidade, confiança e atendimento rápido
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
                  Se você procura reparo de iPhone, MacBook, iMac, iPad, Apple Watch ou Mac Mini em Campinas,
                  aqui encontra assistência Apple em 1 hora para muitos reparos, orçamento sem compromisso,
                  retirada e entrega por motoboy grátis e conserto parcelado em até 12x sem juros.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link href={WHATSAPP_LINK} target="_blank">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-700 sm:w-auto">
                      <Phone className="h-5 w-5" />
                      Solicitar atendimento no WhatsApp
                    </span>
                  </Link>
                  <Link href="#servicos">
                    <span className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-800 transition-all hover:bg-gray-50 sm:w-auto">
                      Ver serviços Apple
                    </span>
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {trustPoints.map((item) => (
                    <div key={item} className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-700 shadow-sm">
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
                      src={heroImage}
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
                        Atendimento Apple para Cambuí, Nova Campinas, Guanabara, Taquaral e região
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-xl md:mt-5 lg:absolute lg:-bottom-4 lg:left-4 lg:right-4 lg:mt-0 lg:max-w-[360px] lg:left-auto lg:right-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                      <BadgeCheck className="h-6 w-6" />
                    </div>
                    <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-gray-500">Atendimento rápido</p>
                      <p className="mt-1 text-lg font-black text-gray-900">Quer resolver hoje?</p>
                      <p className="mt-2 text-sm text-gray-600">
                        Assistência Apple em 1 hora, motoboy grátis, orçamento sem compromisso e 12x sem juros.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-black"
                  >
                    Iniciar atendimento
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Atendimento claro para você resolver sem complicação
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Você encontra o serviço certo, vê fotos reais e fala direto com a equipe para agilizar diagnóstico, orçamento e reparo.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {conversionCards.map((card) => (
                <div key={card.title} className="rounded-[1.75rem] border border-gray-200 bg-white p-7 shadow-sm">
                  <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <card.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="mt-3 text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="servicos" className="bg-[#f8fafc] py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Escolha a página ideal para o seu equipamento Apple
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Escolha o equipamento e siga para a área com informações mais próximas do que você precisa.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.href} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm">
                  <Zap className="h-4 w-4" />
                  Como funciona
                </div>
                <h2 className="mt-5 text-3xl font-black text-gray-900">Como você avança para o atendimento</h2>
                <div className="mt-8 space-y-4">
                  {processSteps.map((step) => (
                    <div key={step.title} className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
                      <h3 className="text-lg font-black text-gray-900">{step.title}</h3>
                      <p className="mt-2 text-gray-600">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  <MapPin className="h-4 w-4" />
                  Atendimento local
                </div>
                <h2 className="mt-5 text-3xl font-black text-gray-900">
                  Presença forte para Campinas, Cambuí e bairros próximos
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Você conta com atendimento em Campinas para equipamentos Apple, com foco em Cambuí e bairros próximos.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
                    Assistência Apple em 1 hora
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
                    Retirada e entrega via motoboy grátis
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
                    Orçamento sem compromisso
                  </div>
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-700">
                    Conserto em até 12x sem juros
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {["Cambuí", "Nova Campinas", "Guanabara", "Taquaral", "Bosque", "Centro"].map((item) => (
                    <div key={item} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-[1.5rem] bg-gray-900 p-6 text-white">
                  <h3 className="text-xl font-black">Quer um atendimento direto e sem enrolação?</h3>
                  <p className="mt-3 text-sm leading-6 text-white/85">
                    Chame no WhatsApp, informe o equipamento Apple e receba prazo em 1 hora para muitos reparos, orçamento e orientação para retirada ou entrega com motoboy grátis.
                  </p>
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-gray-900"
                  >
                    Falar com especialista
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f8fafc] py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                  <Newspaper className="h-4 w-4" />
                  Notícias Apple em português
                </div>
                <h2 className="mt-5 text-3xl font-black text-gray-900 md:text-4xl">
                  Acompanhe novidades do universo Apple
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Veja notícias em português sobre iPhone, iPad, Mac e Apple Watch e, se precisar, siga direto para o atendimento especializado.
                </p>
              </div>
              <Link
                href="/wendell/apple/blog"
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-4 text-sm font-extrabold text-white hover:bg-red-700"
              >
                <BookOpenText className="mr-2 h-5 w-5" />
                Acessar Blog Apple
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {radarPosts.map((post) => (
                <NewsPreviewCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">Comentários 5 estrelas</h2>
              <p className="mt-4 text-lg text-gray-600">
                Veja avaliações de clientes que procuraram assistência Apple rápida em Campinas.
              </p>
            </div>
            <div className="mx-auto max-w-4xl">
              <AppleReviewsCarousel reviews={reviews} />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-red-600 to-red-700 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4" />
                Atendimento Apple em Campinas
              </div>
              <h2 className="text-3xl font-black text-white md:text-5xl">
                Precisa de assistência Apple em Campinas?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90 md:text-xl">
                Fale agora no WhatsApp para orçamento sem compromisso, assistência Apple em 1 hora, motoboy grátis e parcelamento em até 12x sem juros.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-white/95">
                <span className="rounded-full bg-white/10 px-4 py-2">Assistência em 1 hora</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Motoboy grátis</span>
                <span className="rounded-full bg-white/10 px-4 py-2">Sem compromisso</span>
                <span className="rounded-full bg-white/10 px-4 py-2">12x sem juros</span>
              </div>
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
