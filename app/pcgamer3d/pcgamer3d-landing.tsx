"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import Model3DViewer from "@/components/Model3DViewer";
import { Product } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { SITE_CONFIG } from "@/lib/config";
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
  ArrowRight,
  ShieldCheck,
  Cpu,
} from "lucide-react";

const WHATSAPP_LINK = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
  "Olá! Quero uma montagem profissional de PC Gamer com cable management avançado, airflow otimizado e validação por benchmarks na Balão."
)}`;

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
      className={`rounded-3xl border border-slate-800 bg-[#161f32] shadow-xl ${className}`}
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
    <GlassCard className="p-6 hover:border-[#E60012] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-slate-400">
            {title}
          </div>
          <div className="mt-2 text-xl md:text-2xl font-black text-white">{value}</div>
          <div className="mt-2 text-sm text-slate-300 leading-relaxed">{hint}</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-slate-700 flex items-center justify-center text-[#E60012] shrink-0">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </GlassCard>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-12">
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E60012]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-6 space-y-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#E60012]/15 px-4 py-1.5 text-xs md:text-sm font-black uppercase tracking-widest border border-[#E60012]/40 text-[#E60012] mb-4">
                  <Sparkles className="h-4 w-4" />
                  Montagem Avançada 3D + FPS Máximo
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight uppercase">
                  Montagem <span className="text-[#E60012]">de Alto Nível</span> e Zero Throttling
                </h1>
                <p className="mt-4 text-base sm:text-xl text-slate-300 leading-relaxed font-normal">
                  Sequência correta de instalação, aplicação precisa de pasta térmica, airflow direcionado,
                  cable management oculto e ajuste fino de BIOS para entregar máxima fluidez e frametimes estáveis.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="#guia"
                    onClick={() => pushEvent("pcgamer3d_cta_primary_click", { location: "hero" })}
                    className="bg-[#E60012] hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-base md:text-lg transition-all shadow-xl shadow-red-950/50 hover:scale-105 inline-flex items-center justify-center gap-3"
                  >
                    Ver Guia Técnico
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href={WHATSAPP_LINK}
                    target="_blank"
                    onClick={() => pushEvent("pcgamer3d_whatsapp_click", { location: "hero" })}
                    className="bg-[#161f32] hover:bg-slate-800 text-slate-200 border border-slate-700 px-8 py-4 rounded-2xl font-bold text-base md:text-lg transition-all inline-flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="h-5 w-5 text-[#E60012]" />
                    Falar com Montador
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
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
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300"
                    >
                      <x.icon className="h-3.5 w-3.5 text-[#E60012]" />
                      {x.text}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal delay={0.12}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#161f32] border border-slate-800">
                  <Model3DViewer
                    title="PC Gamer 3D"
                    src={`https://sketchfab.com/models/${MODEL_ID}/embed?ui_theme=dark&transparent=1&autostart=1&ui_infos=0&ui_watermark=0&ui_controls=0&ui_general_controls=0&ui_fullscreen=0&ui_help=0&ui_hint=0&ui_vr=0&ui_settings=0&ui_annotations=0&ui_stop=0&camera=0&dnt=1`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                    loading="eager"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Specs() {
  return (
    <section className="py-16 sm:py-20" id="specs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-4xl mx-auto text-center mb-14">
            <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Engenharia e Método</div>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-white">Pilares da montagem de alto nível</h2>
            <p className="text-slate-300 mt-4 text-base md:text-xl">
              Método acima de “só encaixar peças”: foco em procedimento, térmica, organização e validação de desempenho.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <section className="py-16 sm:py-20" id="guia">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Checklist Operacional</div>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white">Guia técnico de montagem</h2>
              <p className="text-slate-300 mt-4 text-base md:text-xl leading-relaxed">
                Um processo profissional é uma sequência de decisões pequenas que somam estabilidade, silêncio e FPS
                consistente. O objetivo é reduzir retrabalho e evitar gargalos térmicos.
              </p>
            </Reveal>

            <div className="mt-10 space-y-4">
              {sequence.map((s, idx) => (
                <Reveal key={s.title} delay={idx * 0.03}>
                  <GlassCard className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-slate-700 flex items-center justify-center text-[#E60012] shrink-0 font-bold">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg md:text-xl font-black text-white">{s.title}</div>
                        <div className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">{s.text}</div>
                      </div>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Reveal delay={0.08}>
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-6 w-6 text-[#E60012]" />
                  <div className="text-base font-black uppercase tracking-widest text-white">Pasta térmica: checklist</div>
                </div>
                <div className="mt-5 space-y-3">
                  {paste.map((p) => (
                    <div key={p} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#E60012] shrink-0 mt-0.5" />
                      <div className="text-slate-300 text-sm font-bold leading-relaxed">{p}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-slate-400 text-xs leading-relaxed border-t border-slate-800 pt-4">
                  Dica prática: a estabilidade térmica é o que mantém o boost sustentado da CPU e GPU durante jogos pesados.
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.12}>
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-[#E60012]" />
                  <div className="text-base font-black uppercase tracking-widest text-white">Validação em etapas</div>
                </div>
                <div className="mt-5 space-y-3 text-slate-300 text-sm font-bold">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#E60012] shrink-0" />
                    <div>Primeiro boot: POST e sensores de tensão.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#E60012] shrink-0" />
                    <div>Carga leve: temperatura, ruído e fan curves.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#E60012] shrink-0" />
                    <div>Carga real: jogo + monitoramento de 1% low FPS.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-[#E60012] shrink-0" />
                    <div>Stress controlado: estabilidade térmica do VRM.</div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Pcgamer3dLanding({ products = [] }: { products?: Product[] }) {
  useEffect(() => {
    pushEvent("pcgamer3d_view", { page: "/pcgamer3d" });
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      <Hero />
      <Specs />

      {/* VITRINE DE PRODUTOS REAIS DO BANCO */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#E60012] mb-1">Setups Gamer em Estoque</div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Máquinas e Hardwares Prontos para Montagem
              </h2>
            </div>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(
                "Olá! Gostaria de consultar opções de PC Gamer customizado para montar na Balão."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-[#E60012] transition-colors"
            >
              Monte seu setup sob medida no WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <BuildGuide />

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-b from-[#111827] to-[#090d16] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E60012]">
            <ShieldCheck className="w-4 h-4" />
            Bancada Especializada no Cambuí • Campinas/SP
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Monte seu PC Gamer com Montadores Profissionais
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base">
            Garantia de montagem limpa, testes de estresse e suporte técnico real no balcão da loja.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E60012] hover:bg-red-700 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center gap-3 text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar Montagem no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
