import { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Tablet,
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

const WHATSAPP_LINK = "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20iPad%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência iPad em Campinas | Troca de Tela e Bateria - Balão da Informática",
  description: "Assistência técnica especializada em iPad em Campinas. Troca de tela, bateria, conector de carga, reparo de placa. Atendimento no Cambuí com garantia.",
  keywords: [
    "assistência ipad campinas",
    "reparo ipad campinas",
    "troca tela ipad campinas",
    "troca bateria ipad cambuí",
    "manutenção ipad campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/ipad" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/ipad",
    title: "Assistência iPad em Campinas | Troca de Tela e Bateria",
    description: "Assistência técnica especializada em iPad em Campinas. Troca de tela, bateria, conector de carga.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência iPad em Campinas | Troca de Tela e Bateria",
    description: "Assistência técnica especializada em iPad em Campinas.",
    images: ["/logo.png"],
  },
};

function ServiceItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-green-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}

export default function iPadPage() {
  const services = [
    { icon: Tablet, title: "Troca de Tela", desc: "Substituição de telas quebradas ou com touch defeituoso" },
    { icon: Battery, title: "Troca de Bateria", desc: "Bateria nova para durar o dia todo" },
    { icon: Zap, title: "Conector de Carga", desc: "Resolva problemas de carregamento" },
    { icon: Activity, title: "Reparo de Placa", desc: "Diagnóstico e reparo avançado" },
    { icon: ShieldCheck, title: "Home Button", desc: "Reparo ou substituição do botão home" },
    { icon: AlertTriangle, title: "Problemas Diversos", desc: "Não liga, câmera defeituosa, som com problema" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-zinc-100">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Link href="/wendell/apple" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6">
                ← Voltar para serviços Apple
              </Link>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-semibold mb-8 border border-green-500/20">
                <Tablet className="w-4 h-4" />
                <span>Assistência Especializada</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                Assistência para{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
                  iPad
                </span>
              </h1>
              <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
                Reparo profissional para seu iPad em Campinas. Troca de tela, bateria, conectores e muito mais.
                Atendimento rápido e de qualidade no bairro Cambuí.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={WHATSAPP_LINK} target="_blank">
                  <button className="inline-flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-8 py-4 text-lg rounded-full font-bold transition-all w-full sm:w-auto">
                    <Phone className="w-5 h-5" />
                    Orçamento Gratuito
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-zinc-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Serviços para iPad</h2>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Por que confiar no nosso serviço?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Wrench, title: "Especialistas Apple", desc: "Técnicos treinados e experientes" },
                  { icon: CheckCircle2, title: "Garantia", desc: "Todos os serviços com garantia" },
                  { icon: Zap, title: "Atendimento Rápido", desc: "Muitos reparos no mesmo dia" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
                    <item.icon className="w-12 h-12 mx-auto mb-6 text-green-500" />
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Seu iPad quebrou?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Não se preocupe! Nós consertamos rapidinho.
            </p>
            <Link href={WHATSAPP_LINK} target="_blank">
              <button className="inline-flex items-center gap-3 bg-white text-green-600 px-10 py-5 rounded-full font-black text-xl hover:bg-zinc-100 transition-colors shadow-2xl">
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
