import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Fan,
  HardDrive,
  Headphones,
  LifeBuoy,
  Monitor,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
  Wrench,
} from "lucide-react";

import Header from "@/components/Header";
import { SITE_CONFIG } from "@/lib/config";
import PremiumConfigurator from "./PremiumConfigurator";

const canonical = "https://www.balao.info/premium";
const metaTitle = "PC Gamer Premium em Campinas | Balão da Informática";
const metaDescription =
  "Monte seu PC gamer premium, workstation ou computador personalizado no Balão da Informática em Campinas. Atendimento especialista, montagem profissional e suporte.";

const whatsappBaseText =
  "Olá, quero montar um PC Premium no Balão da Informática";
const whatsappHref = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
  whatsappBaseText
)}`;

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: { canonical },
  keywords: [
    "PC gamer Campinas",
    "computador gamer personalizado",
    "workstation Campinas",
    "montar PC gamer",
    "loja de informática Campinas",
    "PC para arquitetura",
    "PC para edição de vídeo",
    "PC para jogos",
    "computador premium",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonical,
    title: metaTitle,
    description: metaDescription,
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/pc.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
    images: ["/images/pc.webp"],
  },
};

function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {kicker ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold tracking-wide text-white/75">
          <Sparkles className="h-4 w-4 text-red-300" />
          {kicker}
        </div>
      ) : null}
      <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function PremiumCard({
  title,
  description,
  cta,
  href,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-white/20 hover:bg-white/10">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-2xl" />
      <h3 className="relative text-xl font-extrabold text-white">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-white/70">
        {description}
      </p>
      <Link
        href={href}
        className="relative mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-extrabold text-white/90 transition hover:border-white/20 hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={cta}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function WhatsAppCta({
  label,
  text,
  variant = "primary",
}: {
  label: string;
  text: string;
  variant?: "primary" | "secondary";
}) {
  const href = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    text
  )}`;
  const className =
    variant === "primary"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-base font-extrabold text-white shadow-lg shadow-[#25D366]/20 transition hover:bg-[#128C7E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
      : "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-extrabold text-white/90 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto";

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
      <ArrowRight className="h-5 w-5" />
    </Link>
  );
}

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-[#07070a] text-white font-sans">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0b0b10] to-[#07070a]" />
          <div
            className="absolute inset-0 opacity-35 animate-stars pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(230,0,18,0.25),rgba(0,0,0,0))]"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="space-y-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold tracking-wide text-white/75">
                  <BadgeCheck className="h-4 w-4 text-red-300" />
                  Montagem premium em Campinas/SP
                </div>

                <div className="space-y-4">
                  <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Seu PC Premium começa aqui.
                  </h1>
                  <p className="text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
                    Computadores gamers, workstations e máquinas personalizadas
                    montadas por especialistas para quem exige desempenho,
                    estética e confiança.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="#monte"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-base font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
                    aria-label="Montar meu PC Premium"
                  >
                    Montar meu PC Premium
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-extrabold text-white/90 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
                    aria-label="Falar com especialista no WhatsApp"
                  >
                    Falar com especialista no WhatsApp
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Montagem especializada", icon: Wrench },
                    { label: "Configuração personalizada", icon: Cpu },
                    { label: "Suporte técnico", icon: LifeBuoy },
                    { label: "Loja física em Campinas", icon: Building2 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-extrabold text-white/80 shadow-sm backdrop-blur-sm transition hover:border-white/20"
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-red-300" />
                        <span className="leading-tight">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-b from-red-500/15 to-transparent blur-2xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-2xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black/30">
                    <Image
                      src="/images/pc.webp"
                      alt="PC gamer premium montado pelo Balão da Informática"
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="object-cover opacity-95"
                      priority
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      "Cable management e acabamento premium",
                      "Testes completos antes da entrega",
                      "Peças selecionadas e compatibilidade",
                      "Upgrade e manutenção quando precisar",
                    ].map((t) => (
                      <div
                        key={t}
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-xs font-semibold text-white/75"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-300" />
                          <span className="leading-snug">{t}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle
            kicker="Autoridade e confiança"
            title="Não é só um computador. É uma máquina montada por quem entende."
            description="Há anos no ramo da informática, o Balão da Informática atende clientes que buscam computadores confiáveis, bonitos e preparados para jogos, trabalho, edição, engenharia, arquitetura, streaming e produtividade."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Atendimento especialista", icon: Headphones },
              { title: "Loja física em Campinas", icon: Building2 },
              { title: "Peças selecionadas", icon: BadgeCheck },
              { title: "Testes antes da entrega", icon: ShieldCheck },
              { title: "Suporte pós-venda", icon: LifeBuoy },
              { title: "Upgrade e manutenção", icon: Wrench },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-red-300">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Experiência prática, organização e critérios de qualidade para
                  você comprar com segurança.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Linhas premium"
            title="Escolha a linha certa para o seu estilo de uso"
            description="Quatro linhas próprias do Balão da Informática para facilitar seu orçamento e acelerar a escolha do conjunto ideal."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PremiumCard
              title="Balão Gamer"
              description="PCs para rodar seus jogos favoritos com desempenho, visual gamer e possibilidade de upgrade."
              cta="Personalizar este PC"
              href="/premium?preset=gamer-start#monte"
            />
            <PremiumCard
              title="Balão Workstation"
              description="Máquinas para arquitetura, engenharia, edição, renderização e produtividade profissional."
              cta="Usar como base"
              href="/premium?preset=workstation-pro#monte"
            />
            <PremiumCard
              title="Balão Creator"
              description="Computadores para criadores de conteúdo, lives, edição, design e produção audiovisual."
              cta="Personalizar este PC"
              href="/premium?preset=gamer-ultra#monte"
            />
            <PremiumCard
              title="Balão Extreme"
              description="Projetos exclusivos para quem quer potência máxima e acabamento premium, do seu jeito."
              cta="Personalizar este PC"
              href="/premium?preset=extreme#monte"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Configuração detalhada"
            title="Personalize peça por peça"
            description="Escolha processador, placa de vídeo, memória, SSD, gabinete e muito mais. Depois envie sua configuração para um especialista do Balão da Informática montar o orçamento ideal."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Processador",
                icon: Cpu,
                text: "Define o desempenho em jogos, multitarefas, edição e renderização.",
              },
              {
                title: "Placa de vídeo",
                icon: Monitor,
                text: "Responsável por gráficos, FPS, resolução, edição, render e aceleração profissional.",
              },
              {
                title: "Memória RAM",
                icon: Database,
                text: "Ajuda o PC a rodar vários programas, jogos, abas e transmissões ao mesmo tempo.",
              },
              {
                title: "Armazenamento",
                icon: HardDrive,
                text: "SSD para velocidade e HD para arquivos, backup e grande capacidade.",
              },
              {
                title: "Refrigeração",
                icon: Fan,
                text: "Ajuda o processador a manter desempenho estável em jogos e trabalhos pesados.",
              },
              {
                title: "Fonte",
                icon: Zap,
                text: "Entrega energia com segurança para todos os componentes.",
              },
              {
                title: "Gabinete",
                icon: Server,
                text: "Define visual, airflow, espaço interno e acabamento do projeto.",
              },
              {
                title: "Orçamento",
                icon: ShieldCheck,
                text: "Você escolhe a faixa. A equipe ajusta as melhores peças dentro do seu objetivo.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-red-300">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{c.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="monte"
          className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <SectionTitle
            kicker="Orçamento sob medida"
            title="Monte seu computador do seu jeito"
            description="Selecione o que você busca e envie no WhatsApp. A equipe valida compatibilidade, sugere upgrades e monta a melhor opção no seu orçamento."
          />
          <div className="mt-10">
            <PremiumConfigurator />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Perfis recomendados"
            title="Máquinas exemplo para você se orientar"
            description="Sem preço fixo: cada projeto é ajustado conforme estoque, objetivo e estética desejada."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                name: "PC Gamer Performance",
                for: "Fortnite, Valorant, GTA V, CS2 e jogos competitivos.",
                specs: [
                  "Intel Core i5 ou Ryzen 5",
                  "16GB RAM",
                  "SSD NVMe",
                  "Placa de vídeo dedicada",
                ],
              },
              {
                name: "PC Gamer Ultra",
                for: "Full HD/2K, streaming e multitarefas.",
                specs: [
                  "Intel Core i7 ou Ryzen 7",
                  "32GB RAM",
                  "SSD NVMe 1TB",
                  "GPU de alta performance",
                ],
              },
              {
                name: "Workstation Profissional",
                for: "AutoCAD, Revit, SketchUp, Blender, Premiere e render.",
                specs: [
                  "Processador de alto desempenho",
                  "32GB ou 64GB RAM",
                  "SSD NVMe",
                  "GPU profissional ou gamer de alta performance",
                ],
              },
              {
                name: "Projeto Exclusivo Premium",
                for: "Setup único com gabinete diferenciado, RGB e acabamento premium.",
                specs: [
                  "Configuração 100% personalizada",
                  "Montagem sob medida",
                  "Organização de cabos",
                  "Testes completos",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-white/20"
              >
                <h3 className="text-xl font-extrabold text-white">{p.name}</h3>
                <p className="mt-2 text-sm text-white/70">
                  <span className="font-extrabold text-white/85">Indicado para:</span>{" "}
                  {p.for}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-white/75">
                  {p.specs.map((s) => (
                    <div key={s} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-300" />
                      <span className="leading-snug">{s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <WhatsAppCta
                    label="Solicitar orçamento"
                    text={`Olá, quero solicitar orçamento para: ${p.name}. Meu uso: ${p.for}`}
                    variant="secondary"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Processo premium"
            title="Como funciona seu projeto premium"
            description="Um passo a passo simples, direto e com validação técnica para você receber um PC pronto para usar."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Você fala com um especialista",
              "Entendemos seu uso e orçamento",
              "Escolhemos as peças ideais",
              "Montamos e testamos sua máquina",
              "Você recebe seu PC pronto para usar",
            ].map((step, i) => (
              <div
                key={step}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-red-500/10 text-sm font-extrabold text-red-200">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-sm font-extrabold text-white">{step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Alinhamento claro e execução profissional do início ao fim.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Garantias e suporte"
            title="Compra segura, montagem profissional e suporte de verdade."
            description="Conte com uma loja especializada em Campinas e um atendimento que acompanha você antes, durante e depois da compra."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-red-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Confiança na prática</h3>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-white/75">
                {[
                  "Loja física em Campinas",
                  "Atendimento humano e direto",
                  "Testes antes da entrega",
                  "Possibilidade de upgrades",
                  "Orientação para escolher o PC certo",
                  "Suporte após a compra",
                  "Opções para gamers, empresas e profissionais",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-300" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-red-300">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-extrabold text-white">Montagem com padrão premium</h3>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-white/75">
                {[
                  "Compatibilidade e desempenho alinhados ao seu uso",
                  "Acabamento e organização de cabos",
                  "Refrigeração dimensionada para estabilidade",
                  "Recomendações honestas para custo-benefício",
                  "Checklist e validação antes de entregar",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-300" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-balance text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  PC Gamer Premium em Campinas é no Balão da Informática
                </h2>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
                  Se você procura um PC gamer Campinas, uma workstation Campinas
                  ou um computador gamer personalizado para jogos, trabalho,
                  edição, arquitetura, engenharia ou streaming, o Balão da
                  Informática monta a configuração ideal para o seu perfil.
                  Nossa equipe ajuda você a escolher processador, placa de
                  vídeo, memória RAM, SSD, gabinete, fonte e refrigeração de
                  acordo com sua necessidade e orçamento, com montagem
                  profissional e suporte real.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "montar PC gamer com orientação",
                  "PC para arquitetura e engenharia",
                  "PC para edição de vídeo e criação",
                  "computador premium com acabamento",
                ].map((k) => (
                  <div
                    key={k}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white/75"
                  >
                    {k}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <SectionTitle
            kicker="Dúvidas frequentes"
            title="FAQ"
            description="Respostas rápidas para você tomar a decisão com segurança."
          />

          <div className="mt-10 grid gap-3">
            {[
              {
                q: "O Balão monta PC gamer personalizado?",
                a: "Sim. Você escolhe o perfil (gamer, workstation, creator) e a equipe ajusta as peças para desempenho, estética e orçamento.",
              },
              {
                q: "Posso escolher as peças do meu computador?",
                a: "Pode. Se quiser, você manda preferências de marcas e modelos e a equipe confirma compatibilidade e alternativas.",
              },
              {
                q: "Vocês ajudam a escolher a configuração ideal?",
                a: "Sim. O atendimento é consultivo: entendemos seu uso, resolução, softwares e orçamento para indicar a melhor combinação de peças.",
              },
              {
                q: "A máquina já vai pronta para usar?",
                a: "Vai pronta: montagem, testes e validações. Se você precisar, também orientamos instalação e ajustes iniciais.",
              },
              {
                q: "Posso montar um PC para trabalho profissional?",
                a: "Sim. Workstations para arquitetura, engenharia, renderização, edição e produtividade profissional fazem parte do foco premium.",
              },
              {
                q: "Vocês atendem empresas?",
                a: "Sim. Atendemos empresas com recomendações por perfil de uso, padronização, upgrades e suporte.",
              },
              {
                q: "Dá para fazer upgrade depois?",
                a: "Dá. Projetamos pensando em expansão quando faz sentido (RAM, SSD, GPU, refrigeração), e também fazemos manutenção.",
              },
              {
                q: "Como faço para pedir orçamento?",
                a: "Clique em qualquer botão de WhatsApp, envie suas escolhas e a equipe retorna com a melhor proposta para seu uso.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-5 py-4 transition hover:border-white/20"
              >
                <summary className="cursor-pointer list-none text-sm font-extrabold text-white focus-visible:outline-none">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.q}</span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-white/70 transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-white/70">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-red-600/20 via-white/10 to-white/5 p-7 sm:p-10">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-red-600/15 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Pronto para montar seu novo PC Premium?
                </h2>
                <p className="mt-4 text-pretty text-base leading-relaxed text-white/75">
                  Fale agora com o Balão da Informática e receba uma indicação de
                  configuração de acordo com seu uso, estilo e orçamento.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <WhatsAppCta
                    label="Chamar no WhatsApp"
                    text={whatsappBaseText}
                    variant="primary"
                  />
                  <a
                    href="#monte"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base font-extrabold text-white/90 transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-auto"
                    aria-label="Solicitar orçamento"
                  >
                    Solicitar orçamento
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Orçamento rápido no WhatsApp",
                  "Sugestões por perfil de uso",
                  "Montagem e testes profissionais",
                  "Loja física em Campinas/SP",
                ].map((b) => (
                  <div
                    key={b}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white/80"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-red-300" />
                      <span className="leading-snug">{b}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
