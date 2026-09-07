import { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clock,
  Gamepad2,
  Headset,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Star,
  ThumbsUp,
  Wrench,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Brendon | Balão da Informática — Atendimento especializado em Campinas",
  description:
    "Conheça o Brendon, especialista do Balão da Informática em Campinas. Atendimento dedicado, orçamento rápido e suporte para escolher o equipamento ideal. Chame no WhatsApp.",
  keywords: [
    "brendon",
    "brendon balão da informática",
    "vendedor balão da informática",
    "atendimento balão da informática",
    "especialista em informática campinas",
    "comprar pc gamer campinas",
    "atendimento personalizado informática",
  ],
  alternates: {
    canonical: "https://www.balao.info/brendon",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/brendon",
    title: "Brendon | Balão da Informática",
    description:
      "Atendimento especializado em PCs, notebooks, games e assistência técnica em Campinas. Fale direto com o Brendon pelo WhatsApp.",
    siteName: "Balão da Informática",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brendon | Balão da Informática",
    description:
      "Atendimento especializado em PCs, notebooks, games e assistência técnica em Campinas.",
    images: ["/logo.png"],
  },
};

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Olá!%20Vim%20pela%20página%20do%20Brendon%20e%20gostaria%20de%20atendimento.";

const specialties = [
  {
    icon: Gamepad2,
    title: "PCs Gamer & Montagens",
    description:
      "Monta o PC perfeito pro seu jogo e orçamento, com as melhores peças do mercado.",
  },
  {
    icon: Smartphone,
    title: "Notebooks & Upgrades",
    description:
      "Ajuda na escolha do notebook ideal e upgrade de SSD, memória e performance.",
  },
  {
    icon: Wrench,
    title: "Assistência Técnica",
    description:
      "Orienta sobre manutenção, consertos e cuidados com seus equipamentos.",
  },
  {
    icon: Headset,
    title: "Atendimento Personalizado",
    description:
      "Atendimento de gente, sem enrolação: tira dúvidas, indica o melhor e acompanha seu pedido.",
  },
];

const depoimentos = [
  {
    name: "Cliente satisfeito",
    text: "O Brendon me ajudou a montar meu primeiro PC gamer do zero. Paciente, rápido e com o melhor custo-benefício. Recomendo demais!",
    stars: 5,
  },
  {
    name: "Cliente satisfeita",
    text: "Precisava trocar o notebook pra trabalho e ele me indicou o modelo certo sem tentar empurrar o mais caro. Atendimento nota 10.",
    stars: 5,
  },
  {
    name: "Cliente satisfeito",
    text: "Resolveu meu problema na hora pelo WhatsApp. Me orientou o que fazer e o equipamento ficou pronto super rápido. Nota mil!",
    stars: 5,
  },
];

export default function BrendonPage() {
  const breadcrumbItems = [
    { name: "Home", item: "https://www.balao.info" },
    { name: "Brendon", item: "https://www.balao.info/brendon" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(breadcrumbItems),
        ]}
      />
      <Header />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[var(--site-panel)] border-b border-[var(--site-border)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--site-accent-soft)] via-transparent to-transparent" />
        <div className="relative container mx-auto px-4 py-14 md:py-20 grid md:grid-cols-[1fr_320px] gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--site-accent)] mb-4">
              <Zap className="w-4 h-4" /> Equipe Balão da Informática
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--site-text)] mb-4">
              Olá, eu sou <span className="text-[var(--site-accent)]">Brendon</span>
            </h1>
            <p className="text-lg text-[var(--site-muted)] max-w-xl mb-8 leading-relaxed">
              Especialista em tecnologia aqui do Cambuí. Meu trabalho é
              simples: <strong className="text-[var(--site-text)]">te ajudar a escolher o equipamento
              certo</strong>, sem complicação e com o melhor preço — do PC gamer
              à assistência técnica.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[var(--site-accent)] text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[var(--site-accent-soft)]"
              >
                <MessageCircle className="w-5 h-5" /> Falar com o Brendon
              </a>
              <a
                href="#especialidades"
                className="inline-flex items-center gap-2 bg-[var(--site-panel-soft)] border border-[var(--site-border)] text-[var(--site-text)] font-bold px-6 py-3.5 rounded-xl hover:border-[var(--site-accent)] transition-colors"
              >
                Ver especialidades <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-[var(--site-muted)]">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--site-accent)]" /> Av. Anchieta, 789 — Cambuí
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--site-accent)]" /> Seg. a Sáb.
              </span>
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-[var(--site-accent)]" /> Garantia em todos os serviços
              </span>
            </div>
          </div>

          {/* Avatar placeholder */}
          <div className="relative mx-auto">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br from-[var(--site-panel-soft)] to-[var(--site-accent-soft)] border border-[var(--site-border)] flex items-center justify-center overflow-hidden">
              <Camera className="w-16 h-16 text-[var(--site-muted)]" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--site-panel)] border border-[var(--site-border)] px-5 py-2.5 rounded-full text-sm font-bold shadow-xl">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Atendimento nota 5.0
            </div>
          </div>
        </div>
      </section>

      {/* ===== ESPECIALIDADES ===== */}
      <section id="especialidades" className="container mx-auto px-4 py-14 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--site-accent)] mb-3">
            O que eu faço
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--site-text)] mb-4">
            Como posso te ajudar
          </h2>
          <p className="text-[var(--site-muted)] max-w-2xl mx-auto">
            Do primeiro PC à assistência técnica: estou aqui pra garantir que
            você faça a escolha certa, no tempo certo e pelo melhor preço.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {specialties.map((s) => (
            <div
              key={s.title}
              className="bg-[var(--site-panel)] border border-[var(--site-border)] rounded-2xl p-6 hover:border-[var(--site-accent)] hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--site-accent-soft)] flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-[var(--site-accent)]" />
              </div>
              <h3 className="font-bold text-[var(--site-text)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--site-muted)] leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== DEPOIMENTOS ===== */}
      <section className="bg-[var(--site-panel)] border-y border-[var(--site-border)]">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--site-accent)] mb-3">
              Quem já foi atendido
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--site-text)] mb-4">
              O que dizem do meu atendimento
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {depoimentos.map((d) => (
              <div
                key={d.name}
                className="bg-[var(--site-panel-soft)] border border-[var(--site-border)] rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: d.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--site-text)] leading-relaxed mb-4">
                  “{d.text}”
                </p>
                <p className="text-xs font-bold text-[var(--site-muted)] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-[var(--site-accent)]" />
                  {d.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="container mx-auto px-4 py-14 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--site-accent)] to-[#B3000E] p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Bora resolver isso agora?
            </h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8">
              Me chama no WhatsApp e eu te respondo rapidinho: dúvidas,
              orçamentos, montagem de PC, upgrade — o que precisar.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[var(--site-accent)] font-extrabold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-2xl"
            >
              <MessageCircle className="w-6 h-6" /> Chamar no WhatsApp
            </a>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-white/85">
              <span className="inline-flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" /> Orçamento sem compromisso
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" /> Resposta rápida
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Garantia em tudo
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}