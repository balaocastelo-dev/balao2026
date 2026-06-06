import { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Watch,
  Wrench,
  CheckCircle2,
  Phone,
  Zap,
  ShieldCheck,
  Battery,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK = "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20Apple%20Watch%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência Apple Watch em Campinas | Reparo e Troca de Bateria - Balão da Informática",
  description: "Assistência técnica especializada em Apple Watch em Campinas. Troca de tela, bateria, digital crown, reparo de placa. Atendimento no Cambuí com garantia.",
  keywords: [
    "assistência apple watch campinas",
    "reparo apple watch campinas",
    "troca tela apple watch campinas",
    "troca bateria apple watch cambuí",
    "manutenção apple watch campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/apple-watch" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/apple-watch",
    title: "Assistência Apple Watch em Campinas | Reparo e Troca de Bateria",
    description: "Assistência técnica especializada em Apple Watch em Campinas. Troca de tela, bateria, digital crown.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência Apple Watch em Campinas | Reparo e Troca de Bateria",
    description: "Assistência técnica especializada em Apple Watch em Campinas.",
    images: ["/logo.png"],
  },
};

function ServiceItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-md">
      <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-orange-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

export default function AppleWatchPage() {
  const services = [
    { icon: Watch, title: "Troca de Tela", desc: "Substituição de telas quebradas ou com defeito" },
    { icon: Battery, title: "Troca de Bateria", desc: "Bateria nova para durar o dia todo" },
    { icon: Zap, title: "Digital Crown", desc: "Reparo ou substituição da coroa digital" },
    { icon: Activity, title: "Reparo de Placa", desc: "Diagnóstico e reparo avançado de hardware" },
    { icon: ShieldCheck, title: "Botão Side", desc: "Reparo do botão lateral" },
    { icon: AlertTriangle, title: "Problemas Diversos", desc: "Não liga, não carrega, problemas de software" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-gray-900">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-white z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Link href="/wendell/apple" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
                ← Voltar para serviços Apple
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold mb-8 border border-orange-100">
                <Watch className="w-4 h-4" />
                <span>Assistência Especializada</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                Assistência para{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                  Apple Watch
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Reparo especializado para seu Apple Watch em Campinas. Trocamos tela, bateria, coroa digital e
                resolvemos diversos problemas. Atendimento no bairro Cambuí.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={WHATSAPP_LINK} target="_blank">
                  <button className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700 px-8 py-4 text-lg rounded-full font-bold transition-all w-full sm:w-auto shadow-lg">
                    <Phone className="w-5 h-5" />
                    Orçamento Gratuito
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Serviços para Apple Watch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {services.map((service, idx) => (
                <ServiceItem key={idx} {...service} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-900">Por que confiar no nosso serviço?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Wrench, title: "Especialistas Apple", desc: "Técnicos treinados e experientes" },
                  { icon: CheckCircle2, title: "Garantia", desc: "Todos os serviços com garantia" },
                  { icon: Zap, title: "Atendimento Rápido", desc: "Diagnóstico rápido e preciso" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-md">
                    <item.icon className="w-12 h-12 mx-auto mb-6 text-orange-600" />
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Seu Apple Watch parou?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Vamos consertar rapidinho para você!
            </p>
            <Link href={WHATSAPP_LINK} target="_blank">
              <button className="inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-full font-black text-xl hover:bg-gray-100 transition-colors shadow-2xl">
                <Phone className="w-6 h-6" />
                Falar no WhatsApp
              </button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
