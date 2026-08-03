"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Model3DViewer from "@/components/Model3DViewer";
import {
  BadgeCheck,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Fan,
  Lock,
  MessageCircle,
  Sparkles,
  Wrench,
  Cable,
  Wind,
  Thermometer,
  Settings2,
  ListOrdered,
  Activity,
} from "lucide-react";

const WHATSAPP_LINK =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20uma%20montagem%20profissional%20de%20PC%20Gamer%20com%20cable%20management%20avan%C3%A7ado%2C%20airflow%20otimizado%2C%20ajuste%20de%20BIOS%20e%20valida%C3%A7%C3%A3o%20por%20benchmarks%20para%20maximizar%20FPS.";

const MODEL_ID = "44833fc6db3a43ce88be66609c1fe619";

function pushEvent(event: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;
  const dl = (window as any).dataLayer;
  if (Array.isArray(dl)) dl.push({ event, ...payload });
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

function SpecCard({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
  icon: any;
}) {
  return (
    <GlassCard className="p-6 hover:border-violet-400/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-white/60">
            {title}
          </div>
          <div className="mt-2 text-xl md:text-2xl font-black">{value}</div>
          <div className="mt-2 text-sm text-white/60 leading-relaxed">{hint}</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-600/25 via-[#0a0a0a] to-[#0a0a0a]" />
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 h-[680px] w-[680px] rounded-full bg-fuchsia-600/15 blur-[140px]" />

      <div className="container mx-auto px-4 relative z-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest border border-white/10 mb-7">
                <Sparkles className="h-4 w-4 text-violet-300" />
                Montagem profissional + mais FPS
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] uppercase">
                Montagem{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300">
                  de alto nível
                </span>
                <br />
                e FPS no máximo
              </h1>
              <p className="mt-6 text-lg md:text-2xl text-white/70 max-w-xl leading-relaxed">
                Seu PC montado do jeito certo: peças instaladas na ordem certa, pasta térmica bem aplicada, ar circulando
                como deve e BIOS ajustada para o máximo de FPS. Resultado: mais desempenho, menos barulho e zero
                superaquecimento.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link
                  href="#guia"
                  onClick={() => pushEvent("pcgamer3d_cta_primary_click", { location: "hero" })}
                  className="bg-white text-black px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  Ver como montamos
                  <ChevronRight className="h-6 w-6" />
                </Link>
                <Link
                  href={WHATSAPP_LINK}
                  target="_blank"
                  onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "hero" })}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-6 w-6" />
                  Falar com especialista
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { icon: ListOrdered, text: "Ordem certa de montagem" },
                  { icon: Thermometer, text: "Sem superaquecimento" },
                  { icon: Cable, text: "Cabos organizados" },
                  { icon: Settings2, text: "Configuração fina" },
                  { icon: BarChart3, text: "Testes de desempenho" },
                  { icon: Lock, text: "Estável e durável" },
                ].map((x) => (
                  <div
                    key={x.text}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs md:text-sm font-black uppercase tracking-widest text-white/80"
                  >
                    <x.icon className="h-4 w-4 text-violet-300" />
                    {x.text}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal delay={0.12}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-transparent">
                <Model3DViewer
                  title="PC Gamer 3D"
                  src={`https://sketchfab.com/models/${MODEL_ID}/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1`}
                  className="absolute bg-transparent"
                  style={{
                    top: -220,
                    left: -90,
                    width: "calc(100% + 180px)",
                    height: "calc(100% + 440px)",
                    transform: "scale(0.65)",
                    transformOrigin: "center",
                  }}
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  loading="eager"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs() {
  return (
    <section className="py-20 border-t border-white/5" id="specs">
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black uppercase">Pilares da montagem de alto nível</h2>
            <p className="text-white/60 mt-4 text-lg md:text-xl">
              Não é só encaixar peças: cuidamos de procedimento, temperatura, organização e desempenho testado de verdade.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Reveal>
            <SpecCard
              title="Sequência de montagem"
              value="Montagem sem erro"
              hint="Cada peça no lugar certo, na ordem certa, para o PC ligar de primeira e funcionar bem."
              icon={ListOrdered}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="Contato térmico"
              value="Temperatura sob controle"
              hint="Pasta térmica aplicada do jeito certo mantém o PC silencioso e sem superaquecimento."
              icon={Thermometer}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Cable management"
              value="Cabos organizados"
              hint="Cabos no caminho certo melhoram a ventilação, reduzem o barulho e facilitam a manutenção."
              icon={Cable}
            />
          </Reveal>
          <Reveal>
            <SpecCard
              title="Ventilação inteligente"
              value="Ar circulando bem"
              hint="Ventilação equilibrada para o PC esquentar menos e fazer menos barulho."
              icon={Wind}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="Ajuste de BIOS"
              value="Performance estável"
              hint="Configurações finas para o PC render mais FPS sem travar nem esquentar."
              icon={Settings2}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Testes de desempenho"
              value="Resultado comprovado"
              hint="Medimos o desempenho antes e depois para garantir que o ganho é real e seguro."
              icon={Activity}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BuildGuide() {
  const sequence = [
    {
      title: "1) Planejamento e organização",
      text: "Organizamos cabos, parafusos e peças antes de começar, sobre superfície segura. Cada item no lugar certo evita danos e garante um trabalho caprichado.",
    },
    {
      title: "2) Peças principais com cuidado",
      text: "Processador, memória e armazenamento entram com calma e precisão, sem risco de danos e com cada encaixe conferido.",
    },
    {
      title: "3) Pasta térmica e cooler no ponto",
      text: "Pasta na medida certa e cooler fixado com pressão uniforme. É isso que mantém seu processador frio e silencioso por muito mais tempo.",
    },
    {
      title: "4) Fonte e cabos organizados",
      text: "Cabos passados por trás da bandeja, com folga e curvas suaves. O ar circula livremente e o visual fica limpo.",
    },
    {
      title: "5) Ventilação equilibrada",
      text: "Ar frio entra e ar quente sai no caminho certo. Placa de vídeo e processador rendem no máximo sem esquentar demais.",
    },
    {
      title: "6) Placa de vídeo instalada",
      text: "A placa de vídeo é fixada com firmeza e os cabos seguem o caminho certo, sem bloquear o fluxo de ar.",
    },
    {
      title: "7) Primeiro teste completo",
      text: "Ligamos o PC, atualizamos o sistema e conferimos memória e temperatura antes de entregar para você.",
    },
  ];

  const paste = [
    "Superfície limpa: álcool isopropílico e pano sem fiapos.",
    "Quantidade na medida certa: nem de menos, nem de mais.",
    "Parafusos apertados em cruz, com pressão uniforme, para temperatura estável.",
    "Depois de encaixado, não mexe: a pasta fica coberta de forma perfeita.",
  ];

  return (
    <section className="py-20 border-t border-white/5" id="guia">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black uppercase">Como montamos seu PC</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl leading-relaxed">
                Cada etapa é pensada para somar estabilidade, silêncio e mais FPS. Nada de improviso: ordem certa,
                temperatura controlada e desempenho testado antes da entrega.
              </p>
            </Reveal>

            <div className="mt-10 space-y-4">
              {sequence.map((s, idx) => (
                <Reveal key={s.title} delay={idx * 0.03}>
                  <GlassCard className="p-7 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-black">{s.title}</div>
                        <div className="mt-2 text-white/60 leading-relaxed">{s.text}</div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.08}>
              <GlassCard className="p-7 md:p-8">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-6 w-6 text-orange-300" />
                  <div className="text-lg font-black uppercase tracking-widest">Pasta térmica: o cuidado que conta</div>
                </div>
                <div className="mt-5 space-y-3">
                  {paste.map((p) => (
                    <div key={p} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                      <div className="text-white/75 font-bold leading-relaxed">{p}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-7 text-white/60 text-sm leading-relaxed">
                  Dica prática: PC frio é PC silencioso e rápido. Com a pasta bem aplicada, as ventoinhas giram menos, o barulho
                  cai e o desempenho se mantém em sessões longas.
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-6">
                <GlassCard className="p-7 md:p-8">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-cyan-300" />
                    <div className="text-lg font-black uppercase tracking-widest">Testes em cada etapa</div>
                  </div>
                  <div className="mt-5 space-y-3 text-white/70 font-bold">
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Primeira ligação: tudo respondendo certo.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Uso leve: temperatura, barulho e ventoinhas equilibrados.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Teste real: um jogo rodando para ver o desempenho na prática.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Teste pesado: estabilidade garantida mesmo no limite.</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function CableManagement() {
  const principles = [
    {
      title: "Cabos no caminho certo",
      text: "Usamos as passagens do gabinete para manter os cabos longe do fluxo de ar, com trajeto curto e sem pressionar conectores.",
    },
    {
      title: "Cada cabo no seu lugar",
      text: "Velcro onde você pode precisar mexer e organização por função. Qualquer manutenção fica rápida e sem mistério.",
    },
    {
      title: "Folga e proteção dos cabos",
      text: "Deixamos folga controlada e evitamos dobras agressivas, prevenindo mau contato e desgaste dos conectores.",
    },
    {
      title: "Menos calor, mais beleza",
      text: "Cabos bem presos melhoram a ventilação, reduzem o barulho das ventoinhas e deixam o interior do gabinete impecável.",
    },
  ];

  const checklist = [
    "Nada encostando em fan ou hélice.",
    "Cabos da placa de vídeo soltos e fora do caminho do ar.",
    "Botões e luzes do gabinete organizados e funcionando.",
    "Painel traseiro fechando sem forçar, tudo limpo por dentro e por fora.",
  ];

  return (
    <section className="py-20 border-t border-white/5" id="cables">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Cabos organizados de verdade</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Não é só estética: cabos organizados fazem o PC esquentar menos, durar mais e ficar lindo por dentro.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-4">
              {principles.map((p, idx) => (
                <Reveal key={p.title} delay={idx * 0.03}>
                  <GlassCard className="p-7 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
                        <Cable className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-xl md:text-2xl font-black">{p.title}</div>
                        <div className="mt-2 text-white/60 leading-relaxed">{p.text}</div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.08}>
                <GlassCard className="p-7 md:p-8">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-6 w-6 text-green-400" />
                    <div className="text-lg font-black uppercase tracking-widest">O que garantimos na entrega</div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {checklist.map((c) => (
                      <div key={c} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        <div className="text-white/75 font-bold leading-relaxed">{c}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "cables" })}
                    className="mt-8 inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg transition-colors w-full"
                  >
                    <MessageCircle className="h-6 w-6" />
                    Quero essa organização no meu PC
                  </Link>
                </GlassCard>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AirflowAndThermals() {
  const airflow = [
    {
      title: "Menos poeira, mais ar frio",
      text: "Equilibramos a entrada e a saída de ar para reduzir poeira e garantir ar frio na medida certa. Filtros limpos também fazem parte do desempenho.",
      icon: Wind,
    },
    {
      title: "Ar quente para fora",
      text: "Ar frio entra pela frente e ar quente sai por cima e atrás, sem voltar para dentro. Sua placa de vídeo sempre bem alimentada.",
      icon: Fan,
    },
    {
      title: "Ventoinhas inteligentes",
      text: "As ventoinhas respondem à temperatura real, sem aquele “acelera e desacelera” irritante. Ruído baixo e desempenho constante.",
      icon: Settings2,
    },
    {
      title: "Cooler bem instalado",
      text: "Cooler fixado com firmeza e pasta no ponto certo: menos temperatura, menos perda de desempenho e mais FPS consistente.",
      icon: Thermometer,
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="airflow">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Ventilação no ponto certo</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Mais FPS passa por temperatura: um PC bem ventilado rende no máximo, esquenta menos e faz menos barulho.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {airflow.map((a, idx) => (
              <Reveal key={a.title} delay={idx * 0.04}>
                <GlassCard className="p-7 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
                      <a.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-black">{a.title}</div>
                      <div className="mt-2 text-white/60 leading-relaxed">{a.text}</div>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BiosAndFps() {
  const topics = [
    {
      title: "Configurações de base",
      items: [
        "Sistema atualizado e estável antes de qualquer ajuste.",
        "Memória rodando na velocidade correta, com estabilidade garantida.",
        "Potência ajustada para render bem sem esquentar nem fazer barulho.",
      ],
    },
    {
      title: "Mais desempenho com segurança",
      items: [
        "Ajustamos um item de cada vez e conferimos o resultado.",
        "Sem forçar além do necessário: é a temperatura estável que mantém o desempenho.",
        "Testamos em uso real e no limite para garantir estabilidade duradoura.",
      ],
    },
    {
      title: "FPS alto e sem engasgos",
      items: [
        "Preferimos um jogo liso o tempo todo a picos de FPS com engasgos.",
        "Drivers e energia ajustados para o desempenho não cair no meio da partida.",
        "Configurações escolhidas a dedo para manter a fluidez até nas cenas mais pesadas.",
      ],
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="bios">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Ajuste fino para mais FPS</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Pequenos ajustes que fazem grande diferença: seu PC rende o máximo, de forma estável e sem esquentar.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {topics.map((t, idx) => (
              <Reveal key={t.title} delay={idx * 0.05}>
                <GlassCard className="p-7 md:p-8 h-full">
                  <div className="flex items-center gap-3">
                    <Settings2 className="h-6 w-6 text-violet-300" />
                    <div className="text-lg font-black uppercase tracking-widest">{t.title}</div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {t.items.map((it) => (
                      <div key={it} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        <div className="text-white/75 font-bold leading-relaxed">{it}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-10 max-w-6xl mx-auto">
              <GlassCard className="p-7 md:p-8">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-300" />
                  <div className="text-lg font-black uppercase tracking-widest">Segurança e estabilidade</div>
                </div>
                <div className="mt-4 text-white/60 leading-relaxed">
                  Ajustes são feitos com segurança e testados de verdade. Se algo não se comportar bem, voltamos ao ponto
                  estável. O objetivo é desempenho que dura, não números de laboratório.
                </div>
              </GlassCard>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Benchmarks() {
  const steps = [
    {
      title: "Medição inicial",
      text: "Registramos temperatura, desempenho e fluidez em um cenário real e repetível.",
    },
    {
      title: "Ajuste um a um",
      text: "Mudamos uma configuração por vez (ventoinhas, energia, memória) e repetimos o teste.",
    },
    {
      title: "Prova do fogo",
      text: "Rodamos sessões longas para confirmar que não há instabilidade escondida.",
    },
    {
      title: "Resultado na mão",
      text: "Comparamos o ganho real: fluidez, barulho e temperatura no uso do dia a dia.",
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="benchmarks">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Testes e resultados comprovados</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Não trabalhamos no achismo: medimos o desempenho antes e depois para garantir que seu PC entrega o que promete.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((s, idx) => (
              <Reveal key={s.title} delay={idx * 0.04}>
                <GlassCard className="p-7 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-300 shrink-0">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-black">{s.title}</div>
                      <div className="mt-2 text-white/60 leading-relaxed">{s.text}</div>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12}>
            <div className="mt-10 text-center">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "benchmarks" })}
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors"
              >
                <MessageCircle className="h-6 w-6" />
                Quero meu PC no máximo
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="text-2xl font-black uppercase tracking-tight">
              Balão da Informática
            </div>
            <div className="mt-3 text-white/60 leading-relaxed">
              Montagem profissional focada em desempenho de verdade: ventilação certa, cabos organizados, configuração fina
              e testes completos.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: Wrench, text: "Montagem profissional" },
                { icon: Cable, text: "Cabos organizados" },
                { icon: Wind, text: "Ventilação" },
                { icon: Settings2, text: "Configuração fina" },
                { icon: BarChart3, text: "Testes" },
              ].map((x) => (
                <div
                  key={x.text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/80"
                >
                  <x.icon className="h-4 w-4 text-violet-300" />
                  {x.text}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-sm font-black uppercase tracking-widest text-white/70">
              Institucional
            </div>
            <div className="mt-4 space-y-2">
              {[
                { href: "/sobre-nos", label: "Sobre nós" },
                { href: "/envio-e-entrega", label: "Envio e entrega" },
                { href: "/trocas-e-devolucoes", label: "Trocas e devoluções" },
                { href: "/seguranca-e-privacidade", label: "Segurança e privacidade" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block text-white/70 hover:text-white font-bold"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="text-sm font-black uppercase tracking-widest text-white/70">
              Contato
            </div>
            <div className="mt-4 space-y-2 text-white/70 font-bold">
              <div>Av. Anchieta, 789 - Cambuí, Campinas/SP</div>
              <div>(19) 98751-0267</div>
              <div>Balaocastelo@balaodainformatica.com.br</div>
            </div>
            <div className="mt-6">
              <Link
                href={WHATSAPP_LINK}
                target="_blank"
                onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "footer" })}
                className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-lg hover:bg-zinc-200 transition-colors w-full"
              >
                <MessageCircle className="h-6 w-6" />
                Falar com especialista
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-white/40 text-sm font-bold">
          © {new Date().getFullYear()} Balão da Informática. Todos os direitos reservados.
        </div>
      </div>
    </section>
  );
}

export default function Pcgamer3dLanding() {
  useEffect(() => {
    pushEvent("pcgamer3d_view", { page: "/pcgamer3d" });
  }, []);

  return (
    <>
      <Hero />
      <Specs />
      <BuildGuide />
      <CableManagement />
      <AirflowAndThermals />
      <BiosAndFps />
      <Benchmarks />
      <Footer />
    </>
  );
}
