import { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Laptop,
  Wrench,
  CheckCircle2,
  Phone,
  Zap,
  ShieldCheck,
  Battery,
  HardDrive,
  Activity,
  AlertTriangle,
  Keyboard,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config";

const WHATSAPP_LINK = "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20assist%C3%AAncia%20t%C3%A9cnica%20para%20MacBook%20em%20Campinas!";

export const metadata: Metadata = {
  title: "Assistência MacBook em Campinas | Reparo de Tela e Teclado - Balão da Informática",
  description: "Assistência técnica especializada em MacBook em Campinas. Troca de tela, bateria, teclado, SSD, memória e reparo de placa. Atendimento no Cambuí com garantia.",
  keywords: [
    "assistência macbook campinas",
    "reparo macbook campinas",
    "troca tela macbook campinas",
    "troca teclado macbook cambuí",
    "upgrade macbook campinas",
    "manutenção macbook campinas",
  ],
  alternates: { canonical: "https://www.balao.info/wendell/apple/macbook" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/wendell/apple/macbook",
    title: "Assistência MacBook em Campinas | Reparo de Tela e Teclado",
    description: "Assistência técnica especializada em MacBook em Campinas. Troca de tela, bateria, teclado, SSD.",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistência MacBook em Campinas | Reparo de Tela e Teclado",
    description: "Assistência técnica especializada em MacBook em Campinas.",
    images: ["/logo.png"],
  },
};

function ServiceItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-md">
      <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-violet-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

export default function MacBookPage() {
  const services = [
    { icon: Laptop, title: "Troca de Tela", desc: "Substituição de telas quebradas ou com defeito" },
    { icon: Keyboard, title: "Troca de Teclado", desc: "Teclados novos para MacBook Air e Pro" },
    { icon: Battery, title: "Troca de Bateria", desc: "Bateria nova para durar o dia todo" },
    { icon: HardDrive, title: "Upgrade de SSD", desc: "Velocidade máxima com SSDs de alta performance" },
    { icon: Activity, title: "Reparo de Placa", desc: "Diagnóstico e reparo avançado de placa-mãe" },
    { icon: AlertTriangle, title: "Problemas Diversos", desc: "Não liga, superaquecimento, USB com defeito" },
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold mb-8 border border-violet-100">
                <Laptop className="w-4 h-4" />
                <span>Assistência Especializada</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                Assistência para{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-violet-700">
                  MacBook
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Reparo e upgrade profissional para seu MacBook Air, Pro ou Retina em Campinas. Trocamos tela, teclado,
                bateria, SSD e muito mais. Atendimento de qualidade no bairro Cambuí.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={WHATSAPP_LINK} target="_blank">
                  <button className="inline-flex items-center justify-center gap-2 bg-violet-600 text-white hover:bg-violet-700 px-8 py-4 text-lg rounded-full font-bold transition-all w-full sm:w-auto shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">Serviços para MacBook</h2>
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
                  { icon: Zap, title: "Atendimento Rápido", desc: "Muitos reparos no mesmo dia" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-md">
                    <item.icon className="w-12 h-12 mx-auto mb-6 text-violet-600" />
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-violet-600 to-violet-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Seu MacBook precisa de ajuda?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Entre em contato agora e vamos resolver!
            </p>
            <Link href={WHATSAPP_LINK} target="_blank">
              <button className="inline-flex items-center gap-3 bg-white text-violet-600 px-10 py-5 rounded-full font-black text-xl hover:bg-gray-100 transition-colors shadow-2xl">
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
