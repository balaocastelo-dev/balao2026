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
                Montagem avançada + performance
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
                Conteúdo técnico sobre sequência de instalação, aplicação correta de pasta térmica, airflow otimizado,
                cable management eficiente e ajuste fino de BIOS para maximizar FPS com estabilidade e temperaturas
                controladas.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link
                  href="#guia"
                  onClick={() => pushEvent("pcgamer3d_cta_primary_click", { location: "hero" })}
                  className="bg-white text-black px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all shadow-xl hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  Ver guia técnico
                  <ChevronRight className="h-6 w-6" />
                </Link>
                <Link
                  href={WHATSAPP_LINK}
                  target="_blank"
                  onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "hero" })}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-black text-lg md:text-xl transition-all hover:scale-105 inline-flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-6 w-6" />
                  Falar com técnico
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { icon: ListOrdered, text: "Sequência correta" },
                  { icon: Thermometer, text: "Controle térmico" },
                  { icon: Cable, text: "Cable management" },
                  { icon: Settings2, text: "BIOS tuning" },
                  { icon: BarChart3, text: "Benchmarks" },
                  { icon: Lock, text: "Estabilidade" },
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
              Método acima de “só encaixar peças”: foco em procedimento, térmica, organização e validação de desempenho.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Reveal>
            <SpecCard
              title="Sequência de montagem"
              value="Instalação sem retrabalho"
              hint="Ordem correta reduz risco de erros, melhora acesso e acelera o primeiro boot estável."
              icon={ListOrdered}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="Contato térmico"
              value="Pasta + pressão + padrão"
              hint="Aplicação consistente e torque uniforme evitam hotspots e melhoram boost sustentado."
              icon={Thermometer}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Cable management"
              value="Rotas limpas e funcionais"
              hint="Cabos bem roteados melhoram airflow, reduzem ruído e deixam manutenção mais rápida."
              icon={Cable}
            />
          </Reveal>
          <Reveal>
            <SpecCard
              title="Airflow e curvas de fan"
              value="Fluxo estável e silencioso"
              hint="Pressão interna controlada e fan curves bem definidas melhoram temperatura e acústica."
              icon={Wind}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <SpecCard
              title="BIOS tuning"
              value="Performance com estabilidade"
              hint="Configurações corretas evitam throttling e entregam FPS consistente com frametime estável."
              icon={Settings2}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SpecCard
              title="Validação por benchmark"
              value="Ganho mensurável"
              hint="Medição antes/depois com stress controlado garante desempenho real e seguro."
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
      title: "1) Preparação e antiestática",
      text: "Planeje o roteamento de cabos antes de instalar. Separe abraçadeiras/velcros, organize parafusos e deixe o gabinete com painéis removidos. Trabalhe com descarregamento eletrostático e superfície estável.",
    },
    {
      title: "2) Placa-mãe fora do gabinete",
      text: "Instale CPU, memória e armazenamento com a placa-mãe apoiada. Isso reduz flexão, melhora visibilidade e facilita conferir encaixes e travas.",
    },
    {
      title: "3) Pasta térmica e montagem do cooler",
      text: "Aplique pasta de forma consistente e priorize pressão uniforme: aperte em cruz, em passos curtos. Evite excesso e não reaproveite pasta contaminada. Se remover o cooler, limpe e reaplique.",
    },
    {
      title: "4) Fonte e cabos principais",
      text: "Pré-roteie cabos de alimentação e front panel por trás do tray. Trave folgas com velcro e mantenha curvas suaves (sem dobrar agressivamente).",
    },
    {
      title: "5) Ventoinhas e radiadores (airflow)",
      text: "Defina intake/exhaust com objetivo claro: alimentar GPU/CPU com ar frio e expulsar ar quente sem recirculação. Configure filtros e verifique direção das fans.",
    },
    {
      title: "6) GPU e cabos de vídeo/energia",
      text: "Instale a GPU por último para não atrapalhar acesso. Garanta fixação firme, ausência de tensão nos conectores e trajetória que não invada o fluxo de ar.",
    },
    {
      title: "7) Primeiro boot e validação base",
      text: "Faça POST, atualize firmware quando necessário e valide memória/temperaturas em carga leve antes de partir para ajustes de performance.",
    },
  ];

  const paste = [
    "Superfície limpa: álcool isopropílico e pano sem fiapos.",
    "Quantidade consistente: foco em cobertura, não em volume.",
    "Aperto em cruz: torque uniforme reduz hotspots.",
    "Evite mexer após contato: reposicionar quebra o padrão de espalhamento.",
  ];

  return (
    <section className="py-20 border-t border-white/5" id="guia">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black uppercase">Guia técnico de montagem</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl leading-relaxed">
                Um processo profissional é uma sequência de decisões pequenas que somam estabilidade, silêncio e FPS
                consistente. O objetivo é reduzir retrabalho, evitar gargalos térmicos e validar performance com método.
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
                  <div className="text-lg font-black uppercase tracking-widest">Pasta térmica: checklist</div>
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
                  Dica prática: a estabilidade térmica é o que mantém boost sustentado. Melhor contato geralmente significa
                  menos ruído (fans girando menos) e frametime mais estável em sessões longas.
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-6">
                <GlassCard className="p-7 md:p-8">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-cyan-300" />
                    <div className="text-lg font-black uppercase tracking-widest">Validação em etapas</div>
                  </div>
                  <div className="mt-5 space-y-3 text-white/70 font-bold">
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Primeiro boot: POST e sensores básicos.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Carga leve: temperatura, ruído e fan curves.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Carga real: jogo + monitoramento de frametime.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                      <div>Stress controlado: estabilidade térmica e elétrica.</div>
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
      title: "Roteamento com intenção",
      text: "Use passagens do gabinete para manter cabos fora do fluxo de ar. Priorize caminhos curtos e que não pressionem conectores.",
    },
    {
      title: "Amarração em pontos-chave",
      text: "Velcro para manutenção, abraçadeiras onde não precisa mexer. Agrupe por função (alimentação, dados, front panel) para facilitar diagnóstico.",
    },
    {
      title: "Folga e raio de curvatura",
      text: "Deixe folga controlada (service loop) e evite dobras agressivas. Cabos tensionados podem causar mau contato ou desgaste do conector.",
    },
    {
      title: "Eficiência térmica e estética",
      text: "Cabos bem presos reduzem turbulência, melhoram a eficiência das fans e deixam a vitrine limpa sem “emaranhado” visível.",
    },
  ];

  const checklist = [
    "Nada encostando em fan ou hélice.",
    "Cabos da GPU sem tensão e sem invadir intake.",
    "Front panel organizado e identificado.",
    "Trilho traseiro com fechamento sem forçar o painel.",
  ];

  return (
    <section className="py-20 border-t border-white/5" id="cables">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Cable management avançado</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Não é “arrumar por aparência”. É engenharia de fluxo, manutenção e confiabilidade.
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
                    <div className="text-lg font-black uppercase tracking-widest">Checklist final</div>
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
                    Quero otimizar meu PC
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
      title: "Pressão interna e poeira",
      text: "Equilibre intake e exhaust para reduzir entrada de poeira por frestas e manter alimentação de ar frio. Filtros limpos e fluxo sem obstruções são parte do desempenho.",
      icon: Wind,
    },
    {
      title: "Direção de fluxo e recirculação",
      text: "Evite criar bolsões de ar quente. Entrada frontal/baixo e saída superior/traseira costuma funcionar bem, mas a regra é: alimentar a GPU e expulsar calor sem voltar para dentro.",
      icon: Fan,
    },
    {
      title: "Curvas de fan por sensor",
      text: "Ajuste fan curves para responder a carga real. Priorize comportamento estável (sem “sobe e desce” irritante) e mantenha ruído controlado com rampas suaves.",
      icon: Settings2,
    },
    {
      title: "Contato térmico e montagem",
      text: "Cooler bem fixado e pasta aplicada corretamente fazem diferença prática em boost sustentado. Menos temperatura = menos throttling = mais FPS consistente.",
      icon: Thermometer,
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="airflow">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Airflow otimizado e térmica</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                A otimização de FPS passa por temperatura e estabilidade. O objetivo é sustentar clocks altos sem ruído
                excessivo e sem hotspots.
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
      title: "Configurações base de BIOS",
      items: [
        "Atualize firmware quando necessário e estabilize antes de otimizar.",
        "Habilite o perfil de memória adequado e valide estabilidade.",
        "Ajuste limites de potência/boost com foco em temperatura e ruído.",
      ],
    },
    {
      title: "Overclock/undervolt com método",
      items: [
        "Mude uma variável por vez e registre resultados.",
        "Evite aumentar tensão sem necessidade; eficiência térmica sustenta clocks.",
        "Valide em carga real e stress controlado para evitar instabilidade intermitente.",
      ],
    },
    {
      title: "Maximização de FPS e frametime",
      items: [
        "Priorize estabilidade: frametime regular é tão importante quanto FPS médio.",
        "Ajuste drivers e energia para evitar quedas de clock em carga.",
        "Use resolução e presets de forma estratégica para manter consistência em cenas pesadas.",
      ],
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="bios">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">BIOS tuning e FPS consistente</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                Ajuste fino é onde você “ganha de graça”: menos throttling, mais consistência e melhor eficiência térmica.
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
                  Overclock e undervolt devem ser feitos com cuidado. Se surgirem travamentos, artefatos ou reinícios,
                  retorne para o último ponto estável e valide novamente. O alvo é desempenho sustentável, não números
                  instantâneos.
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
      title: "Baseline (antes)",
      text: "Registre temperaturas, clocks, FPS médio e frametime em um cenário repetível.",
    },
    {
      title: "Ajuste (uma variável por vez)",
      text: "Mude apenas uma configuração (fan curve, limite de potência, memória) e repita o teste.",
    },
    {
      title: "Validação (stress controlado)",
      text: "Rode sessões longas para confirmar que não há instabilidade intermitente.",
    },
    {
      title: "Relatório (depois)",
      text: "Compare ganho real: consistência de frametime, ruído e temperatura em uso prolongado.",
    },
  ];

  return (
    <section className="py-20 border-t border-white/5" id="benchmarks">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black uppercase">Benchmarks e ganhos comprovados</h2>
              <p className="text-white/60 mt-4 text-lg md:text-xl">
                O que melhora de verdade é o que você mede e valida. O processo abaixo evita “achismo”.
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
                Quero montar/otimizar com método
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
              Montagem profissional com foco em performance real: airflow, cable management, BIOS tuning e validação por benchmarks.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: Wrench, text: "Montagem avançada" },
                { icon: Cable, text: "Cable management" },
                { icon: Wind, text: "Airflow" },
                { icon: Settings2, text: "BIOS tuning" },
                { icon: BarChart3, text: "Benchmarks" },
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
