import { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Monitor,
  Laptop,
  Tablet,
  Watch,
  Box,
  Phone,
  Wrench,
  CheckCircle2,
  MapPin,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK = "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20especializada%20em%20Apple%20em%20Campinas%20e%20regi%C3%A3o.%20Atendimento%20no%20Cambu%C3%AD!";

export const metadata: Metadata = {
  title: "Assistência Técnica Apple em Campinas | Especialista Apple - Balão da Informática",
  description: "Assistência técnica especializada em Apple em Campinas. Reparo de Mac Mini, iMac, iPad, Apple Watch e MacBook. Atendimento rápido, peças de qualidade e garantia. Localizado no Cambuí.",
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
    description: "Assistência técnica especializada em Apple em Campinas. Reparo de Mac Mini, iMac, iPad, Apple Watch e MacBook. Atendimento rápido, peças de qualidade e garantia.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Técnica Apple em Campinas | Especialista Apple",
    description: "Assistência técnica especializada em Apple em Campinas. Reparo de Mac Mini, iMac, iPad, Apple Watch e MacBook.",
    images: ["/logo.png"],
  },
};

function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all hover:scale-[1.02] shadow-lg">
        <div className={`w-16 h-16 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-6 group-hover:bg-${color}-500/20 transition-colors`}>
          <Icon className={`w-8 h-8 text-${color}-500`} />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-zinc-400 mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center gap-2 text-red-500 font-semibold">
          Saiba mais
          <div className="transform group-hover:translate-x-1 transition-transform">→</div>
        </div>
      </div>
    </Link>
  );
}

function Features() {
  const features = [
    { icon: Wrench, title: "Técnicos Especializados", desc: "Equipe treinada e certificada em reparos Apple" },
    { icon: Zap, title: "Atendimento Rápido", desc: "Muitos serviços realizados no mesmo dia" },
    { icon: ShieldCheck, title: "Garantia de Qualidade", desc: "Todas os reparos com garantia" },
    { icon: MapPin, title: "Localização Ideal", desc: "Atendimento no Cambuí, Campinas" },
  ];

  return (
    <section className="py-20 bg-zinc-900/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Por que escolher nossa assistência Apple?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Seu Apple com problemas?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Não perca tempo! Entre em contato agora e agende seu orçamento gratuito.
        </p>
        <Link href={WHATSAPP_LINK} target="_blank">
          <button className="inline-flex items-center gap-3 bg-white text-red-600 px-10 py-5 rounded-full font-black text-xl hover:bg-zinc-100 transition-colors shadow-2xl">
            <Phone className="w-6 h-6" />
            Falar com Especialista
          </button>
        </Link>
      </div>
    </section>
  );
}

export default function AppleServicesPage() {
  const services = [
    {
      title: "Assistência Mac Mini",
      description: "Reparo especializado para Mac Mini. Upgrades de memória, SSD, troca de fonte e muito mais.",
      icon: Box,
      href: "/wendell/apple/mac-mini",
      color: "blue",
    },
    {
      title: "Assistência iMac",
      description: "Manutenção completa para iMac. Troca de tela, disco, memória e solução de problemas de hardware.",
      icon: Monitor,
      href: "/wendell/apple/imac",
      color: "purple",
    },
    {
      title: "Assistência iPad",
      description: "Reparo de iPad de todos os modelos. Troca de tela, bateria, conector de carga e mais.",
      icon: Tablet,
      href: "/wendell/apple/ipad",
      color: "green",
    },
    {
      title: "Assistência Apple Watch",
      description: "Especialistas em Apple Watch. Reparo de tela, bateria, digital crown e problemas de software.",
      icon: Watch,
      href: "/wendell/apple/apple-watch",
      color: "orange",
    },
    {
      title: "Assistência MacBook",
      description: "Manutenção para todos os modelos de MacBook: Air, Pro e Retina. Troca de tela, bateria, teclado.",
      icon: Laptop,
      href: "/wendell/apple/macbook",
      color: "violet",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-zinc-100">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 text-zinc-300 text-sm font-semibold mb-8 border border-zinc-700">
                <Wrench className="w-4 h-4" />
                <span>Especialista Apple em Campinas</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Assistência Técnica{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                  Especializada em Apple
                </span>
              </h1>
              <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                Reparos profissionais para Mac Mini, iMac, iPad, Apple Watch e MacBook em Campinas.
                Atendimento rápido, peças de qualidade e garantia. Localizado no bairro Cambuí.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={WHATSAPP_LINK} target="_blank">
                  <button className="inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 px-8 py-4 text-lg rounded-full font-bold transition-all w-full sm:w-auto">
                    <Phone className="w-5 h-5" />
                    Orçamento Gratuito
                  </button>
                </Link>
                <Link href="#servicos">
                  <button className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-100 hover:bg-zinc-800 px-8 py-4 text-lg rounded-full font-semibold transition-all w-full sm:w-auto">
                    Ver Serviços
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="servicos" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Nossos Serviços Apple</h2>
            <p className="text-zinc-400 text-center text-lg mb-16 max-w-2xl mx-auto">
              Escolha o seu dispositivo e descubra como podemos ajudar
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {services.map((service, idx) => (
                <ServiceCard key={idx} {...service} />
              ))}
            </div>
          </div>
        </section>

        <Features />

        <CTA />
      </main>
    </div>
  );
}
