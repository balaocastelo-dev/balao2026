import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import {
  BadgeCheck,
  Cable,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Cpu,
  Fan,
  Gauge,
  Gem,
  Monitor,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  ThermometerSun,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Montagem de PC Gamer + Cable Management em Campinas | Até 3 Horas",
  description:
    "Montagem profissional de PC gamer com cable management premium, airflow otimizado e testes de estabilidade. Atendimento em Campinas/SP. Orçamento rápido no WhatsApp.",
  keywords: [
    "montagem de pc gamer campinas",
    "montagem de pc campinas",
    "montador de pc gamer",
    "cable management pc",
    "organização de cabos pc",
    "organização de cabos gabinete",
    "airflow pc gamer",
    "montagem com teste de estabilidade",
    "instalação windows drivers",
    "otimização de fan curve",
    "undervolt cpu gpu",
    "montagem pc gamer cambuí",
    "montagem de pc com watercooler",
    "montagem pc rgb",
  ],
  alternates: {
    canonical: "https://www.balao.info/montagempc",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Montagem de PC Gamer + Cable Management | Balão da Informática",
    description:
      "PC gamer montado com padrão profissional: cabos organizados, airflow e testes. Campinas/SP.",
    url: "https://www.balao.info/montagempc",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Montagem de PC Gamer + Cable Management em Campinas",
    description:
      "Montagem profissional com testes e cable management premium. Orçamento rápido no WhatsApp.",
    images: ["/logo.png"],
  },
};

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Olá!%20Quero%20orçamento%20para%20montagem%20de%20PC%20Gamer%20com%20cable%20management.%20Segue%20minha%20configuração%20(ou%20posso%20enviar%20print%20das%20peças).";

const FAQS = [
  {
    question: "Quanto tempo leva a montagem do PC gamer?",
    answer:
      "Com agendamento e disponibilidade das peças, a montagem pode ficar pronta em até 3 horas. Em casos com watercooler, muitos fans/RGB ou ajustes finos, o prazo pode variar.",
  },
  {
    question: "O que é cable management e por que vale a pena?",
    answer:
      "É a organização profissional dos cabos por rotas internas do gabinete. Melhora o airflow, reduz bagunça visual e facilita upgrades e manutenção futura.",
  },
  {
    question: "Vocês fazem teste de estabilidade?",
    answer:
      "Sim. Realizamos testes de stress/estabilidade, monitoramento de temperaturas e validação do desempenho antes da entrega.",
  },
  {
    question: "Vocês montam watercooler, RGB e muitos fans?",
    answer:
      "Sim. Fazemos instalação de AIO/watercooler, controladoras, hubs, ARGB e fan curves, priorizando airflow e estabilidade.",
  },
  {
    question: "Instalam Windows, drivers e jogos?",
    answer:
      "Instalamos Windows e drivers (quando solicitado) e deixamos o PC pronto para uso. Jogos e configurações específicas podem ser feitos como serviço adicional.",
  },
  {
    question: "Vocês montam PC com peças compradas fora?",
    answer:
      "Sim. Montamos com peças trazidas pelo cliente e fazemos checklist de compatibilidade e integridade antes da montagem.",
  },
  {
    question: "Como envio a lista de peças para orçamento?",
    answer:
      "Pode enviar no WhatsApp um print do carrinho, uma lista em texto ou fotos das caixas. A gente confirma compatibilidade e sugere melhorias (quando fizer sentido).",
  },
];

const BUILD_GALLERY = [
  {
    src: "https://images.pexels.com/photos/16062764/pexels-photo-16062764.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Montagem de PC gamer em bancada com componentes",
    caption: "Montagem com checklist de compatibilidade",
  },
  {
    src: "https://images.pexels.com/photos/7199189/pexels-photo-7199189.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Interior de PC com componentes e organização interna",
    caption: "Cable management de vitrine",
  },
  {
    src: "https://images.pexels.com/photos/21336189/pexels-photo-21336189.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Placa-mãe gamer em close com componentes instalados",
    caption: "Acabamento premium para gabinetes com vidro",
  },
  {
    src: "https://images.pexels.com/photos/30469971/pexels-photo-30469971.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Setup gamer com iluminação e PC pronto para uso",
    caption: "Entrega pronta para jogar",
  },
  {
    src: "https://img.freepik.com/fotos-premium/detalhe-do-interior-do-gabinete-do-pc-gamer-placa-mae-cpu-water-cooling-memory-placa-grafica-e-fans-rgb_176814-1716.jpg",
    alt: "Interior de gabinete de PC gamer com placa-mãe, watercooler e fans RGB",
    caption: "Rotas limpas + fixação segura",
    unoptimized: true,
    referrerPolicy: "no-referrer" as const,
  },
  {
    src: "https://i.redd.it/8oei2fd3j8p71.jpg",
    alt: "PC gamer moderno com iluminação e airflow otimizado",
    caption: "Airflow otimizado e temperaturas menores",
    unoptimized: true,
    referrerPolicy: "no-referrer" as const,
  },
];

function BlockHero() {
  return (
    <section className="relative overflow-hidden bg-black text-white pt-20">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: "Home", item: "https://www.balao.info" },
            { name: "Montagem de PC Gamer", item: "https://www.balao.info/montagemPC" },
          ]),
          generateFAQSchema(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Montagem de PC Gamer e Cable Management",
            serviceType: "Montagem de computador gamer, cable management, testes e otimização",
            areaServed: [
              { "@type": "City", name: "Campinas" },
              { "@type": "AdministrativeArea", name: "Região Metropolitana de Campinas" },
            ],
            provider: {
              "@type": "LocalBusiness",
              name: "Balão da Informática",
              url: "https://www.balao.info",
            },
          },
        ]}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/25 via-black to-black" />
      <div className="absolute top-1/2 left-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-600/10 blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10 py-14 md:py-20">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest border border-white/10 mb-8">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            Montagem premium + cable management
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
            Montagem de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              PC Gamer
            </span>
            <br />
            com cable management
          </h1>

          <p className="mt-6 text-lg md:text-2xl text-zinc-300 max-w-4xl leading-relaxed">
            Seu PC montado com padrão profissional: cabos organizados, airflow otimizado, testes de estabilidade e acabamento
            impecável. Atendimento em <strong className="text-white">Campinas/SP</strong>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-6 w-6" />
              Orçar no WhatsApp
              <ChevronRight className="h-6 w-6" />
            </Link>
            <Link
              href="#planos"
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <BadgeCheck className="h-6 w-6" />
              Ver planos
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm md:text-base text-white/70 font-bold uppercase tracking-wider">
            <div className="inline-flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-300" />
              Até 3 horas com agendamento
            </div>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              Teste de estabilidade
            </div>
            <div className="inline-flex items-center gap-2">
              <Cable className="h-5 w-5 text-fuchsia-300" />
              Cable management premium
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockGallery() {
  return (
    <section className="bg-black py-20 border-t border-zinc-900" id="galeria">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Montagens reais (referência)</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Visual limpo, cabos organizados e montagem feita para durar. Use como referência do padrão de acabamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {BUILD_GALLERY.map((img) => (
            <div
              key={img.src}
              className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={img.unoptimized}
                  referrerPolicy={img.referrerPolicy}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-white font-black uppercase tracking-wide">{img.caption}</div>
                <div className="text-white/60 text-sm mt-1">Clique no WhatsApp e envie sua lista de peças.</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
            Enviar lista de peças
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockBeforeAfter() {
  const items = [
    {
      title: "Antes: cabos soltos",
      desc: "Cabo travando airflow, conectores tensionados e visual poluído.",
      img: "https://images.pexels.com/photos/7199189/pexels-photo-7199189.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      title: "Depois: cable management",
      desc: "Rotas limpas, fixações seguras e manutenção muito mais fácil.",
      img: "https://images.pexels.com/photos/16062764/pexels-photo-16062764.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Cable management muda tudo</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Além da estética, melhora airflow e facilita upgrades. É o “detalhe” que transforma o PC.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {items.map((it) => (
            <div key={it.title} className="rounded-3xl overflow-hidden border border-zinc-800 bg-black">
              <div className="relative aspect-[16/10]">
                <Image
                  src={it.img}
                  alt={it.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black uppercase">{it.title}</h3>
                <p className="text-zinc-400 mt-3 leading-relaxed">{it.desc}</p>
                <div className="mt-6">
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-white font-bold text-lg border-b-2 border-[#25D366] pb-1 hover:text-[#25D366] transition-colors"
                  >
                    Quero esse acabamento <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockWhy() {
  const items = [
    {
      title: "Airflow de verdade",
      desc: "Cabos bem roteados liberam o fluxo de ar e ajudam a reduzir temperaturas do CPU e GPU.",
      icon: Fan,
      tone: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Mais desempenho e silêncio",
      desc: "Com temperaturas mais baixas, dá para ajustar fan curves e reduzir ruído sem perder performance.",
      icon: ThermometerSun,
      tone: "text-orange-300",
      bg: "bg-orange-500/10",
    },
    {
      title: "Upgrade sem dor",
      desc: "Organização facilita manutenção e upgrades: trocar SSD, RAM, fans e GPU fica muito mais simples.",
      icon: Wrench,
      tone: "text-green-300",
      bg: "bg-green-500/10",
    },
    {
      title: "Acabamento de vitrine",
      desc: "Ideal para gabinetes com vidro: interior limpo e visual profissional.",
      icon: Sparkles,
      tone: "text-fuchsia-300",
      bg: "bg-fuchsia-500/10",
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Por que fazer com especialista?</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Montagem não é só “ligar peças”. É compatibilidade, segurança elétrica, estabilidade e acabamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-black border border-zinc-800 rounded-3xl p-8 hover:border-violet-500/40 transition-colors"
            >
              <div className={`w-14 h-14 rounded-2xl ${it.bg} ${it.tone} flex items-center justify-center mb-6`}>
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black mb-3 uppercase">{it.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockChecklist() {
  const items = [
    "Checklist de compatibilidade (CPU/placa-mãe/RAM, gabinete e fonte)",
    "Montagem elétrica segura (cabos sem tensão e conectores firmes)",
    "Aplicação correta de pasta térmica e pressão de cooler",
    "Airflow e pressão positiva/negativa de acordo com o gabinete",
    "Rotas de cabos (frontal, EPS, PCIe, SATA, fans e ARGB) com fixação",
    "Configuração básica de BIOS (XMP/EXPO quando compatível)",
    "Teste de estabilidade + validação de temperaturas",
    "Entrega com orientação de uso e upgrade",
  ];

  return (
    <section className="bg-black py-20" id="checklist">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase">Checklist de montagem profissional</h2>
            <p className="text-zinc-400 mt-4 text-lg leading-relaxed">
              Para evitar gargalos, travamentos e temperaturas altas, seguimos um checklist padrão. É aqui que a montagem
              “comum” vira montagem premium.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                Quero orçamento
              </Link>
              <Link
                href="#processo"
                className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-8 py-4 rounded-full font-black text-lg transition-colors"
              >
                <ClipboardCheck className="h-6 w-6" />
                Ver processo
              </Link>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/80 mb-6">
              <Settings className="h-4 w-4" />
              Incluído nos planos Pro/Ultra
            </div>
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it} className="flex items-start gap-3 text-zinc-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockExtras() {
  const extras = [
    {
      title: "Instalação de Windows + drivers",
      desc: "PC pronto para uso com drivers essenciais e ajustes básicos.",
      icon: Monitor,
    },
    {
      title: "Tuning de fan curve",
      desc: "Equilíbrio entre temperatura e silêncio com ajustes finos.",
      icon: ThermometerSun,
    },
    {
      title: "Sleeved cables / extensões",
      desc: "Upgrade de estética para interior de vitrine e rotas mais limpas.",
      icon: Gem,
    },
    {
      title: "Ajustes de performance",
      desc: "XMP/EXPO e validações adicionais para estabilidade (quando aplicável).",
      icon: Gauge,
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="extras">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Serviços extras (opcionais)</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Para deixar seu PC pronto para jogar, trabalhar e fazer upgrade sem dor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {extras.map((e) => (
            <div key={e.title} className="bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-6">
                <e.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black uppercase">{e.title}</h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-4 rounded-full font-black text-lg transition-all shadow-xl hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
            Quero PC pronto para jogar
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockPlans() {
  const plans = [
    {
      name: "Essencial",
      highlight: "Montagem segura",
      desc: "Montagem completa + checklist e testes básicos.",
      items: ["Checklist de compatibilidade", "Montagem completa", "Organização padrão de cabos", "Teste de boot e drivers básicos"],
      accent: "from-zinc-700 to-zinc-900",
    },
    {
      name: "Pro",
      highlight: "Cable management premium",
      desc: "Acabamento de vitrine com airflow otimizado.",
      items: [
        "Tudo do Essencial",
        "Cable management premium (rotas + fixações)",
        "Otimização de airflow (posição de fans)",
        "Teste de estabilidade com monitoramento",
      ],
      accent: "from-violet-700 to-slate-900",
      featured: true,
    },
    {
      name: "Ultra",
      highlight: "Tuning + relatório",
      desc: "Para quem quer performance, temperatura e silêncio.",
      items: [
        "Tudo do Pro",
        "Ajuste de fan curve (silêncio/temperatura)",
        "Benchmark e relatório de temperaturas",
        "Revisão de BIOS/EXPO/XMP (quando aplicável)",
      ],
      accent: "from-fuchsia-700 to-slate-900",
    },
  ];

  return (
    <section className="bg-black py-20" id="planos">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Planos de montagem</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Escolha o nível de acabamento e otimização. Se preferir, a gente recomenda o ideal para sua configuração.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-[2.5rem] p-[1px] ${p.featured ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" : "bg-zinc-800"}`}
            >
              <div className={`bg-zinc-950 rounded-[2.5rem] p-8 border border-zinc-800 h-full`}>
                <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5 px-4 py-2 rounded-full bg-gradient-to-r ${p.accent} text-white`}>
                  <Cpu className="h-4 w-4" />
                  {p.highlight}
                </div>
                <h3 className="text-3xl font-black uppercase">{p.name}</h3>
                <p className="text-zinc-400 mt-3 leading-relaxed">{p.desc}</p>
                <ul className="mt-8 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-zinc-200">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{it}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors w-full"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Pedir orçamento
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockProcess() {
  const steps = [
    { title: "1) Checklist de peças", desc: "Compatibilidade, BIOS, conexões e integridade.", icon: ShieldCheck },
    { title: "2) Montagem + cable management", desc: "Rotas, fixação e acabamento profissional.", icon: Cable },
    { title: "3) Testes e estabilidade", desc: "Stress test, temperaturas e validação de desempenho.", icon: Gauge },
    { title: "4) Entrega pronta para jogar", desc: "Tudo organizado e testado para uso imediato.", icon: BadgeCheck },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="processo">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Como entregamos padrão premium</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Processo claro e rastreável. Você aprova e acompanha.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{s.title}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockTestimonials() {
  const testimonials = [
    {
      name: "Lucas M.",
      role: "Gamer",
      text: "Montagem impecável. Cable management ficou nível vitrine e as temperaturas melhoraram muito.",
    },
    {
      name: "Bruna A.",
      role: "Streamer",
      text: "Atendimento rápido e detalhista. Meu PC ficou silencioso e pronto para live.",
    },
    {
      name: "Rafael K.",
      role: "Editor",
      text: "Precisava de estabilidade para render. Testaram tudo e entregaram com relatório.",
    },
  ];

  return (
    <section className="bg-black py-20 border-t border-zinc-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Quem montou, recomenda</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">Prova social de quem já saiu jogando.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <p className="text-zinc-200 leading-relaxed italic">"{t.text}"</p>
              <div className="mt-6">
                <div className="font-black">{t.name}</div>
                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockFAQ() {
  return (
    <section className="bg-zinc-950 py-20 border-t border-zinc-900" id="faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-black text-center uppercase italic">
          Dúvidas frequentes
        </h2>
        <div className="mt-12 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.question} className="bg-black border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                {faq.question}
              </h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockCTA() {
  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-700 to-slate-900 rounded-[3rem] p-10 md:p-16 border border-white/10 shadow-2xl">
          <h2 className="text-3xl md:text-6xl font-black text-white uppercase leading-tight">
            Seu PC gamer merece
            <br />
            montagem de elite.
          </h2>
          <p className="text-white/80 mt-6 text-lg md:text-2xl max-w-3xl leading-relaxed">
            Envie sua lista de peças (ou um print) e receba um orçamento rápido para montagem e cable management.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href={WHATSAPP_LINK}
              target="_blank"
              className="bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-6 w-6" />
              Chamar no WhatsApp
            </Link>
            <Link
              href="/fale-conosco"
              className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-10 py-4 rounded-full font-black text-lg transition-colors inline-flex items-center justify-center gap-3"
            >
              <Cpu className="h-6 w-6" />
              Fale Conosco
            </Link>
          </div>
          <div className="mt-10 text-white/70 font-bold uppercase tracking-widest text-sm">
            Av. Anchieta, 789 - Cambuí, Campinas/SP
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MontagemPCPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-500 selection:text-white">
      <Header />
      <main>
        <BlockHero />
        <BlockGallery />
        <BlockWhy />
        <BlockBeforeAfter />
        <BlockPlans />
        <BlockChecklist />
        <BlockProcess />
        <BlockExtras />
        <BlockTestimonials />
        <BlockFAQ />
        <BlockCTA />
      </main>
    </div>
  );
}
