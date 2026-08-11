import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import SistemasLeadForm from "@/components/SistemasLeadForm";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Code2,
  CreditCard,
  FileText,
  Globe,
  Lock,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Criação de Sites e Sistemas Personalizados | A partir de R$ 2.999",
  description:
    "Criação de sites profissionais e sistemas personalizados para empresas no Brasil. Projeto sob medida, SEO nacional, performance e tracking. Preço inicial R$ 2.999,00.",
  keywords: [
    "criação de sites",
    "criação de site profissional",
    "desenvolvimento de sites",
    "desenvolvimento web",
    "desenvolvimento de sistemas",
    "sistemas personalizados",
    "site institucional",
    "landing page alta conversão",
    "e-commerce desenvolvimento",
    "sistema de gestão",
    "portal corporativo",
    "integração api",
    "seo para sites",
    "site rápido",
    "criação de site brasil",
    "criação de site são paulo",
    "criação de site rio de janeiro",
    "criação de site belo horizonte",
    "criação de site brasília",
    "criação de site curitiba",
    "criação de site porto alegre",
    "criação de site salvador",
    "criação de site recife",
    "criação de site fortaleza",
  ],
  alternates: {
    canonical: "https://www.balao.info/sistemas",
    languages: {
      "pt-BR": "https://www.balao.info/sistemas",
      "x-default": "https://www.balao.info/sistemas",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.balao.info/sistemas",
    title: "Criação de Sites e Sistemas Personalizados | A partir de R$ 2.999",
    description:
      "Landing pages, sites institucionais e sistemas sob medida com SEO, performance e tracking de conversão.",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Criação de Sites e Sistemas Personalizados",
    description: "Projeto sob medida com SEO e performance. A partir de R$ 2.999.",
    images: ["/logo.png"],
  },
};

const FAQS = [
  {
    question: "Quanto custa criar um site profissional?",
    answer:
      "O investimento inicial é a partir de R$ 2.999,00. O valor final depende do escopo (páginas, integrações, e-commerce e automações). Você recebe uma proposta com etapas e prazos.",
  },
  {
    question: "Vocês atendem todo o Brasil?",
    answer:
      "Sim. Atendemos nacionalmente por reunião online. Você recebe um cronograma e acompanha entregas por etapas.",
  },
  {
    question: "O site já vem otimizado para o Google (SEO)?",
    answer:
      "Sim. Entregamos estrutura técnica (meta tags, headings, performance, sitemap e dados estruturados) e orientamos conteúdo e palavras-chave para busca nacional.",
  },
  {
    question: "Vocês instalam Google Analytics, Tag Manager e Pixel?",
    answer:
      "Podemos integrar GA/GTM e Meta Pixel quando você fornecer os IDs. Também configuramos eventos de conversão (ex.: envio de formulário e clique no WhatsApp).",
  },
  {
    question: "Em quanto tempo fica pronto?",
    answer:
      "Depende do projeto. Landing pages podem ser mais rápidas; sistemas e e-commerce exigem mais validações. Definimos prazo realista no orçamento.",
  },
  {
    question: "O que acontece depois da entrega?",
    answer:
      "Você pode seguir com suporte/ajustes evolutivos. Também orientamos hospedagem e boas práticas de segurança e backups.",
  },
];

const STATES = [
  { uf: "SP", name: "São Paulo" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PR", name: "Paraná" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "BA", name: "Bahia" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "CE", name: "Ceará" },
  { uf: "GO", name: "Goiás" },
  { uf: "PA", name: "Pará" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "AM", name: "Amazonas" },
  { uf: "PB", name: "Paraíba" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "AL", name: "Alagoas" },
  { uf: "SE", name: "Sergipe" },
  { uf: "PI", name: "Piauí" },
  { uf: "MA", name: "Maranhão" },
  { uf: "TO", name: "Tocantins" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "AP", name: "Amapá" },
  { uf: "AC", name: "Acre" },
];

function BlockHero() {
  return (
    <section className="relative overflow-hidden bg-black text-white pt-20">
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema([
            { name: "Home", item: "https://www.balao.info" },
            { name: "Sistemas", item: "https://www.balao.info/sistemas" },
          ]),
          generateFAQSchema(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Criação de Sites e Sistemas Personalizados",
            serviceType:
              "Desenvolvimento web, criação de sites profissionais, landing pages e sistemas sob medida",
            areaServed: { "@type": "Country", name: "Brasil" },
            provider: {
              "@type": "Organization",
              name: "Balão da Informática",
              url: "https://www.balao.info",
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "BRL",
              price: 2999,
              availability: "https://schema.org/InStock",
              url: "https://www.balao.info/sistemas",
            },
          },
        ]}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-black to-black" />
      <div className="absolute top-1/2 left-1/2 h-[850px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-widest border border-white/10 mb-8">
              <Rocket className="h-4 w-4 text-fuchsia-300" />
              Sites e sistemas sob medida
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
              Criação de{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                sites e sistemas
              </span>
              <br />
              que vendem e escalam
            </h1>

            <p className="mt-6 text-lg md:text-2xl text-zinc-300 max-w-3xl leading-relaxed">
              Landing pages, sites institucionais, e-commerce e sistemas personalizados com SEO nacional, performance e
              tracking de conversão. Preço inicial{" "}
              <strong className="text-white">R$ 2.999,00</strong>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="#orcamento"
                className="bg-white text-black px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <ArrowRight className="h-6 w-6" />
                Quero orçamento
              </Link>
              <Link
                href="https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site%20ou%20sistema%20(a%20partir%20de%20R%24%202.999)."
                target="_blank"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-6 w-6" />
                WhatsApp direto
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm md:text-base text-white/80 font-bold">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <Search className="h-5 w-5 text-fuchsia-300" />
                SEO nacional + técnico
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-300" />
                Performance e UX
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-cyan-300" />
                Tracking de conversão
              </div>
            </div>

            <div className="mt-10 text-xs md:text-sm text-white/60 font-bold uppercase tracking-widest">
              Atendimento nacional • reunião online • proposta por etapas
            </div>
          </div>

          <div className="lg:col-span-5" id="orcamento">
            <SistemasLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockWhatWeBuild() {
  const items = [
    {
      title: "Site institucional",
      desc: "Credibilidade, apresentação de serviços, captação de leads e SEO.",
      icon: Globe,
    },
    {
      title: "Landing page",
      desc: "Página de alta conversão para tráfego pago e orgânico.",
      icon: Rocket,
    },
    {
      title: "E-commerce",
      desc: "Catálogo, checkout e integrações (pagamento, frete, ERP).",
      icon: CreditCard,
    },
    {
      title: "Sistema de gestão",
      desc: "Operação interna: cadastros, relatórios, permissões e automações.",
      icon: FileText,
    },
    {
      title: "Portal corporativo",
      desc: "Área do cliente, conteúdo, autenticação e dashboards.",
      icon: BarChart3,
    },
    {
      title: "Integrações e APIs",
      desc: "Conecta sistemas, automatiza processos e reduz retrabalho.",
      icon: Code2,
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="tipos">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">
            O que entregamos
          </h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Soluções sob medida para vender, organizar processos e escalar operações.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((it) => (
            <div
              key={it.title}
              className="bg-black border border-zinc-800 rounded-3xl p-8 hover:border-fuchsia-500/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-6">
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black uppercase">{it.title}</h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockBenefits() {
  const bullets = [
    "Copy e estrutura pensadas para conversão (CTAs, prova social, objeções).",
    "SEO técnico completo + orientação de conteúdo para alcance nacional.",
    "Layout responsivo e rápido, com foco em experiência mobile.",
    "Tracking de conversões (formulário e WhatsApp) com IDs fornecidos por você.",
    "Código organizado e fácil de evoluir (novas páginas, integrações e funis).",
  ];

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase">
              Resultado antes de “beleza”
            </h2>
            <p className="text-zinc-400 mt-4 text-lg leading-relaxed">
              Design consistente, performance e mensagem certa. O objetivo é gerar lead e venda com previsibilidade.
            </p>
            <ul className="mt-8 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-zinc-200">
                  <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="#orcamento"
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
              >
                <ArrowRight className="h-6 w-6" />
                Ver orçamento
              </Link>
              <Link
                href="#processo"
                className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-8 py-4 rounded-full font-black text-lg transition-colors"
              >
                <Clock className="h-6 w-6" />
                Entenda o processo
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] p-[1px] bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 border border-zinc-800">
              <div className="text-xs font-black uppercase tracking-widest text-white/70">
                Checklist de conversão
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4">
                {[
                  { label: "CTA acima da dobra", icon: BadgeCheck },
                  { label: "Prova social e portfolio", icon: Star },
                  { label: "SEO + performance", icon: Search },
                  { label: "Segurança e LGPD", icon: Lock },
                ].map((x) => (
                  <div
                    key={x.label}
                    className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                      <x.icon className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-zinc-200">{x.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-zinc-500 text-sm leading-relaxed">
                Você recebe uma estrutura pronta para escalar tráfego e mensurar conversões.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockPortfolio() {
  const items = [
    {
      title: "Landing de serviço local",
      desc: "Estrutura de conversão com WhatsApp, FAQ e tracking.",
      tags: ["CRO", "SEO", "Lead"],
      image:
        "https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      title: "Portal corporativo",
      desc: "Áreas restritas, dashboards e conteúdo por permissão.",
      tags: ["Auth", "Dashboard", "B2B"],
      image:
        "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
    {
      title: "E-commerce e integrações",
      desc: "Catálogo, pagamentos e integrações com operações.",
      tags: ["E-commerce", "API", "Automação"],
      image:
        "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1600",
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="portfolio">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Portfolio</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Exemplos de entregáveis e estrutura (substituível pelos seus cases reais).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((it) => (
            <div key={it.title} className="bg-black border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>
              <div className="p-7">
                <div className="text-xl font-black uppercase">{it.title}</div>
                <p className="text-zinc-400 mt-2 leading-relaxed">{it.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {it.tags.map((t) => (
                    <span key={t} className="text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/70">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#orcamento"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
          >
            <ArrowRight className="h-6 w-6" />
            Quero um projeto assim
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockProcess() {
  const steps = [
    {
      title: "1) Diagnóstico e escopo",
      desc: "Objetivo, público, proposta de valor, páginas e integrações.",
      icon: FileText,
    },
    {
      title: "2) UX + layout",
      desc: "Wireframe e design com foco em clareza e conversão.",
      icon: Globe,
    },
    {
      title: "3) Desenvolvimento",
      desc: "Implementação, testes, SEO técnico e performance.",
      icon: Code2,
    },
    {
      title: "4) Tracking e publicação",
      desc: "Eventos de conversão e orientação para operação.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="bg-black py-20" id="processo">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Processo claro</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Você acompanha por etapas. Sem surpresa no final.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.title} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
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

function BlockGuarantees() {
  const items = [
    {
      title: "Sem travas",
      desc: "Você fica com o projeto e pode evoluir quando quiser.",
      icon: BadgeCheck,
    },
    {
      title: "Segurança",
      desc: "Boas práticas para reduzir risco (headers, validações e dependências).",
      icon: ShieldCheck,
    },
    {
      title: "Mensuração",
      desc: "Evento de conversão no formulário e WhatsApp (com seus IDs).",
      icon: BarChart3,
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="garantias">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Garantias</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Compromissos de entrega e boas práticas para operar com tranquilidade.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((it) => (
            <div key={it.title} className="bg-black border border-zinc-800 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-6">
                <it.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black uppercase">{it.title}</h3>
              <p className="text-zinc-400 mt-3 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockPricing() {
  const plans = [
    {
      name: "Start",
      highlight: "A partir de R$ 2.999",
      desc: "Para começar com presença e captação.",
      items: ["Landing page ou site simples", "CTA + WhatsApp", "SEO técnico básico", "Formulário com tracking"],
      accent: "from-zinc-700 to-zinc-900",
    },
    {
      name: "Growth",
      highlight: "Escalar tráfego",
      desc: "Mais páginas, mais SEO e conversão.",
      items: ["Estrutura de páginas", "SEO nacional", "Prova social/FAQ", "Eventos de conversão"],
      accent: "from-violet-700 to-slate-900",
      featured: true,
    },
    {
      name: "Custom",
      highlight: "Sistemas sob medida",
      desc: "Projetos com lógica, integrações e áreas restritas.",
      items: ["Sistema/portal/e-commerce", "Integrações e automações", "Permissões e relatórios", "Roadmap evolutivo"],
      accent: "from-fuchsia-700 to-slate-900",
    },
  ];

  return (
    <section className="bg-black py-20" id="planos">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Planos e pagamento</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Opções claras para você escolher e evoluir com consistência.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-[2.5rem] p-[1px] ${
                p.featured ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" : "bg-zinc-800"
              }`}
            >
              <div className="bg-zinc-950 rounded-[2.5rem] p-8 border border-zinc-800 h-full">
                <div
                  className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-5 px-4 py-2 rounded-full bg-gradient-to-r ${p.accent} text-white`}
                >
                  <Star className="h-4 w-4" />
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
                    href="#orcamento"
                    className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors w-full"
                  >
                    <ArrowRight className="h-6 w-6" />
                    Solicitar proposta
                  </Link>
                </div>
                <div className="mt-6 text-xs text-zinc-500 leading-relaxed">
                  Pagamento flexível conforme proposta (por etapas).
                </div>
              </div>
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
      name: "Cliente (serviços)",
      role: "Landing page",
      text: "A página ficou muito mais clara e o WhatsApp começou a receber leads melhores. O processo por etapas ajudou demais.",
    },
    {
      name: "Cliente (B2B)",
      role: "Portal",
      text: "O sistema organizou nosso fluxo e reduziu retrabalho. A entrega com tracking e ajustes foi bem objetiva.",
    },
    {
      name: "Cliente (varejo)",
      role: "E-commerce",
      text: "Integrações e estrutura ficaram redondas. Agora consigo medir de onde vêm as conversões e melhorar campanhas.",
    },
  ];

  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="depoimentos">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Depoimentos</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Espaço pronto para inserir depoimentos reais (mantendo consistência visual).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name + t.role} className="bg-black border border-zinc-800 rounded-3xl p-8">
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

function BlockRegionalSeo() {
  return (
    <section className="bg-black py-20 border-t border-zinc-900" id="brasil">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black uppercase">Atendimento nacional</h2>
          <p className="text-zinc-400 mt-4 text-lg md:text-xl">
            Desenvolvimento para todo o Brasil com reuniões online e entregas por etapas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {STATES.map((s) => (
            <div
              key={s.uf}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold text-zinc-200"
            >
              {s.name} ({s.uf})
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="#orcamento"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
          >
            <ArrowRight className="h-6 w-6" />
            Solicitar orçamento
          </Link>
        </div>
      </div>
    </section>
  );
}

function BlockFAQ() {
  return (
    <section className="bg-zinc-950 py-20 border-y border-zinc-900" id="faq">
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
            Pronto para transformar
            <br />
            seu site em vendas?
          </h2>
          <p className="text-white/80 mt-6 text-lg md:text-2xl max-w-3xl leading-relaxed">
            Envie o que você precisa e receba uma proposta objetiva com escopo, prazo e etapas. Preço inicial R$ 2.999,00.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="#orcamento"
              className="bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-3"
            >
              <ArrowRight className="h-6 w-6" />
              Solicitar proposta
            </Link>
            <Link
              href="https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20or%C3%A7amento%20para%20cria%C3%A7%C3%A3o%20de%20site%20ou%20sistema%20(a%20partir%20de%20R%24%202.999)."
              target="_blank"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-4 rounded-full font-black text-lg transition-colors inline-flex items-center justify-center gap-3"
            >
              <MessageCircle className="h-6 w-6" />
              WhatsApp
            </Link>
          </div>
          <div className="mt-10 text-white/70 font-bold uppercase tracking-widest text-sm">
            Atendimento em todo o Brasil • proposta por etapas • SEO + tracking
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SistemasPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-fuchsia-500 selection:text-white">
      <Header />
      <main>
        <BlockHero />
        <BlockWhatWeBuild />
        <BlockBenefits />
        <BlockPortfolio />
        <BlockProcess />
        <BlockGuarantees />
        <BlockPricing />
        <BlockTestimonials />
        <BlockRegionalSeo />
        <BlockFAQ />
        <BlockCTA />
      </main>
    </div>
  );
}

