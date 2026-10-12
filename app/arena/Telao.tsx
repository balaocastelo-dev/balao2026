"use client";

// ============================================================
// Telão da Arena: a corrida de vendas que passa na TV da loja.
//
// O palco tem 1920 × 1080 e é escalado para a tela. A pista vai da largada
// (esquerda) à linha de chegada (direita); a linha de chegada de cada piloto
// é a META DELE. Depois da chegada fica o outdoor com a viagem do Airbnb.
// Pergunta ao site a cada 20 s e comemora o que mudou: venda, OS, orçamento,
// licença (turbo dourado), ultrapassagem, meta batida e meta da equipe.
// Desde 12/10 (tarde) a corrida é em reais (vendas do Bling + OS).
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { KartG, TINTA } from "@/components/arena/Kart";
import type { EstadoDoTelao, LinhaDoPlacar, PlacarDoPeriodo } from "@/lib/arena/tipos";
import "./telao.css";

const W = 1920;
const TOPO_PISTA = 488;
const FUNDO_PISTA = 992;
const INTERVALO_MS = 20_000;
const GUARDADO = "arena:ultima-corrida";
const TROCA_PERIODO_MS = 45_000;

// ------------------------------------------------------------------ som (sintetizado, sem arquivo)

class Som {
  ctx: AudioContext | null = null;
  ligado = false;
  ligar() {
    if (!this.ctx) {
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!C) return;
      this.ctx = new C();
    }
    void this.ctx.resume();
    this.ligado = true;
  }
  private nota(freq: number, ini: number, dur: number, tipo: OscillatorType = "square", vol = 0.08) {
    if (!this.ligado || !this.ctx) return;
    const t = this.ctx.currentTime + ini;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  moeda() {
    this.nota(988, 0, 0.08);
    this.nota(1319, 0.08, 0.35);
  }
  turbo() {
    if (!this.ligado || !this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.7);
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.85);
  }
  semaforo(final = false) {
    this.nota(final ? 880 : 440, 0, final ? 0.6 : 0.25, "square", 0.07);
  }
  fanfarra() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.nota(f, i * 0.14, i === 5 ? 0.7 : 0.16, "square", 0.07));
  }
}

// ------------------------------------------------------------------ utilidades

const nomeCurto = (l: LinhaDoPlacar) => l.piloto.apelido || l.piloto.nome.split(" ")[0];
const ORDINAIS = ["primeiro", "segundo", "terceiro", "quarto", "quinto", "sexto", "sétimo", "oitavo", "nono", "décimo"];
const lugar = (n: number) => ORDINAIS[n - 1] ?? `${n}`;
/** "R$ 12.345" */
const rs = (n: number) => `R$ ${Math.round(Number(n) || 0).toLocaleString("pt-BR")}`;
/** "12,3 mil" / "850" — para a plaquinha do kart, onde cabe pouco. */
const rsCurto = (n: number) => {
  const v = Math.round(Number(n) || 0);
  if (Math.abs(v) < 1000) return `R$ ${v}`;
  if (Math.abs(v) < 100_000) return `${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `${Math.round(v / 1000).toLocaleString("pt-BR")} mil`;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bordaEsq = (y: number) => lerp(520, 392, (y - TOPO_PISTA) / (FUNDO_PISTA - TOPO_PISTA));
const linhaChegada = (y: number) => lerp(1500, 1590, (y - TOPO_PISTA) / (FUNDO_PISTA - TOPO_PISTA));
const bordaDir = (y: number) => lerp(1790, 1900, (y - TOPO_PISTA) / (FUNDO_PISTA - TOPO_PISTA));

function relogio(ate: string, agora: number) {
  const ms = Math.max(0, Date.parse(ate) - agora);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${p(h)}:${p(m)}:${p(s)}` : `${p(h)}:${p(m)}:${p(s)}`;
}

type Faixa = { id: string; titulo: string; sub?: string; cor?: "ouro" | "azul" };
type Festa = { id: string; tipo: "piloto" | "equipe"; linha?: LinhaDoPlacar; placar: PlacarDoPeriodo };

// ------------------------------------------------------------------ cenário

function Ceu() {
  return (
    <g>
      <defs>
        <linearGradient id="arn-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FA9F5" />
          <stop offset="1" stopColor="#C6EEFF" />
        </linearGradient>
        <linearGradient id="arn-asfalto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5A5A6E" />
          <stop offset="1" stopColor="#44445A" />
        </linearGradient>
        <pattern id="arn-xadrez" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="#fff" />
          <rect width="14" height="14" fill={TINTA} />
          <rect x="14" y="14" width="14" height="14" fill={TINTA} />
        </pattern>
        <pattern id="arn-zebra" width="44" height="16" patternUnits="userSpaceOnUse">
          <rect width="22" height="16" fill="#E60012" />
          <rect x="22" width="22" height="16" fill="#fff" />
        </pattern>
      </defs>
      <rect width={W} height={1080} fill="url(#arn-ceu)" />
      <circle cx={1230} cy={150} r={70} fill="#FFE27A" opacity={0.9} />
      <g className="arn-nuvens">
        {[0, 2400].map((dx) => (
          <g key={dx} transform={`translate(${dx} 0)`} fill="#fff" opacity={0.95}>
            {[[300, 190, 1], [820, 120, 0.8], [1500, 230, 1.1], [2050, 160, 0.9]].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <ellipse cx={0} cy={0} rx={90} ry={34} />
                <ellipse cx={-50} cy={8} rx={60} ry={26} />
                <ellipse cx={50} cy={10} rx={64} ry={24} />
                <ellipse cx={10} cy={-20} rx={50} ry={30} />
              </g>
            ))}
          </g>
        ))}
      </g>
      {/* Balão da loja */}
      <g className="arn-balao">
        <g transform="translate(880 210)">
          <path d="M 0 -95 C 60 -95 78 -40 62 -2 C 48 30 20 44 10 62 L -10 62 C -20 44 -48 30 -62 -2 C -78 -40 -60 -95 0 -95 Z" fill="#E60012" stroke={TINTA} strokeWidth={6} />
          <path d="M 0 -95 C 26 -60 26 20 8 62 M 0 -95 C -26 -60 -26 20 -8 62" fill="none" stroke="#fff" strokeWidth={6} opacity={0.85} />
          <path d="M -10 62 L -14 84 M 10 62 L 14 84" stroke={TINTA} strokeWidth={4} />
          <rect x={-20} y={84} width={40} height={26} rx={5} fill="#B7773C" stroke={TINTA} strokeWidth={5} />
        </g>
      </g>
      {/* Morros */}
      <path d="M 0 400 Q 200 300 420 380 Q 620 290 860 370 Q 1100 280 1340 360 Q 1600 290 1920 370 L 1920 520 L 0 520 Z" fill="#7FCF6A" stroke={TINTA} strokeWidth={6} />
      <path d="M 0 450 Q 300 390 600 440 Q 900 380 1250 440 Q 1600 390 1920 440 L 1920 540 L 0 540 Z" fill="#4DB34A" stroke={TINTA} strokeWidth={6} />
      {/* Arquibancada com torcida */}
      <rect x={380} y={404} width={1000} height={70} rx={10} fill="#E9E4F5" stroke={TINTA} strokeWidth={6} />
      {Array.from({ length: 34 }).map((_, i) => {
        const cores = ["#E60012", "#1E6BFF", "#FFB800", "#00B86B", "#9B4DFF", "#FF5FA2"];
        return (
          <g key={i} className={`arn-torcida ${i % 2 ? "b" : ""}`}>
            <circle cx={410 + i * 28.5} cy={428 + (i % 3) * 3} r={10} fill={cores[i % cores.length]} stroke={TINTA} strokeWidth={3} />
            <circle cx={410 + i * 28.5} cy={452 + (i % 2) * 2} r={9} fill={cores[(i + 3) % cores.length]} stroke={TINTA} strokeWidth={3} />
          </g>
        );
      })}
      {[400, 700, 1000, 1340].map((x) => (
        <g key={x}>
          <path d={`M ${x} 404 V 340`} stroke={TINTA} strokeWidth={5} />
          <path className="arn-bandeira" d={`M ${x} 342 h 46 v 28 h -46 Z`} fill={x % 600 === 400 ? "#E60012" : "#FFB800"} stroke={TINTA} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
}

function Pista({ faixas, luzes }: { faixas: { y0: number; y1: number }[]; luzes: number }) {
  const poli = `${bordaEsq(TOPO_PISTA)},${TOPO_PISTA} ${bordaDir(TOPO_PISTA)},${TOPO_PISTA} ${bordaDir(FUNDO_PISTA)},${FUNDO_PISTA} ${bordaEsq(FUNDO_PISTA)},${FUNDO_PISTA}`;
  const lc = (y: number) => linhaChegada(y);
  return (
    <g>
      {/* grama da frente */}
      <rect x={0} y={FUNDO_PISTA - 6} width={W} height={100} fill="#3DA544" />
      <polygon points={poli} fill="url(#arn-asfalto)" stroke={TINTA} strokeWidth={6} />
      {/* zebras nas bordas */}
      <polygon points={`${bordaEsq(TOPO_PISTA)},${TOPO_PISTA - 14} ${bordaDir(TOPO_PISTA)},${TOPO_PISTA - 14} ${bordaDir(TOPO_PISTA)},${TOPO_PISTA} ${bordaEsq(TOPO_PISTA)},${TOPO_PISTA}`} fill="url(#arn-zebra)" stroke={TINTA} strokeWidth={4} />
      <polygon points={`${bordaEsq(FUNDO_PISTA)},${FUNDO_PISTA} ${bordaDir(FUNDO_PISTA)},${FUNDO_PISTA} ${bordaDir(FUNDO_PISTA)},${FUNDO_PISTA + 16} ${bordaEsq(FUNDO_PISTA)},${FUNDO_PISTA + 16}`} fill="url(#arn-zebra)" stroke={TINTA} strokeWidth={4} />
      {/* divisões das faixas */}
      {faixas.slice(1).map((f, i) => (
        <line key={i} x1={bordaEsq(f.y0) + 8} y1={f.y0} x2={bordaDir(f.y0) - 8} y2={f.y0} stroke="#fff" strokeWidth={4} strokeDasharray="34 26" opacity={0.75} />
      ))}
      {/* largada */}
      <polygon
        points={`${bordaEsq(TOPO_PISTA) + 110},${TOPO_PISTA} ${bordaEsq(TOPO_PISTA) + 122},${TOPO_PISTA} ${bordaEsq(FUNDO_PISTA) + 122},${FUNDO_PISTA} ${bordaEsq(FUNDO_PISTA) + 110},${FUNDO_PISTA}`}
        fill="#fff"
        opacity={0.9}
      />
      {/* linha de chegada */}
      <polygon points={`${lc(TOPO_PISTA)},${TOPO_PISTA} ${lc(TOPO_PISTA) + 44},${TOPO_PISTA} ${lc(FUNDO_PISTA) + 44},${FUNDO_PISTA} ${lc(FUNDO_PISTA)},${FUNDO_PISTA}`} fill="url(#arn-xadrez)" stroke={TINTA} strokeWidth={4} />
      {/* pórtico da chegada */}
      <path d={`M ${lc(TOPO_PISTA) - 8} ${TOPO_PISTA} V 360 M ${lc(TOPO_PISTA) + 52} ${TOPO_PISTA} V 360`} stroke={TINTA} strokeWidth={10} />
      <rect x={lc(TOPO_PISTA) - 70} y={318} width={184} height={50} rx={10} fill="url(#arn-xadrez)" stroke={TINTA} strokeWidth={6} />
      <rect x={lc(TOPO_PISTA) - 48} y={326} width={140} height={34} rx={6} fill="#fff" stroke={TINTA} strokeWidth={4} />
      <text x={lc(TOPO_PISTA) + 22} y={351} textAnchor="middle" fontSize={22} fontWeight={900} fontStyle="italic" fill={TINTA}>Meta</text>
      {/* semáforo da largada */}
      <g transform={`translate(${bordaEsq(TOPO_PISTA) + 60} 360)`}>
        <path d="M 56 0 V 128" stroke={TINTA} strokeWidth={10} />
        <rect x={0} y={0} width={112} height={44} rx={12} fill="#2A2546" stroke={TINTA} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            className="arn-luz"
            cx={22 + i * 34}
            cy={22}
            r={12}
            fill={luzes === 4 ? "#2EE65A" : luzes > i ? "#FF2E2E" : "#4A4466"}
            stroke={TINTA}
            strokeWidth={3}
          />
        ))}
      </g>
    </g>
  );
}

// ------------------------------------------------------------------ componente

export default function Telao({ inicial }: { inicial: EstadoDoTelao | null }) {
  const [estado, setEstado] = useState<EstadoDoTelao | null>(inicial);
  // Sem resposta do site na abertura: mostra a última corrida guardada nesta TV.
  useEffect(() => {
    if (inicial) {
      try {
        localStorage.setItem(GUARDADO, JSON.stringify(inicial));
      } catch {
        /* sem armazenamento: segue */
      }
      return;
    }
    try {
      const g = localStorage.getItem(GUARDADO);
      if (g) setEstado(JSON.parse(g) as EstadoDoTelao);
    } catch {
      /* nada guardado */
    }
  }, [inicial]);
  const [offline, setOffline] = useState(false);
  const [vista, setVista] = useState<"semana" | "mes">(inicial?.periodoTelao === "mes" ? "mes" : "semana");
  const [agora, setAgora] = useState(() => Date.now());
  const [escala, setEscala] = useState(1);
  const [luzes, setLuzes] = useState(0);
  const [largou, setLargou] = useState(false);
  const [faixa, setFaixa] = useState<Faixa | null>(null);
  const [festa, setFesta] = useState<Festa | null>(null);
  const [turbos, setTurbos] = useState<Record<string, { tipo: "normal" | "dourado"; valor: number; ate: number }>>({});
  const [somLigado, setSomLigado] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [hallI, setHallI] = useState(0);
  const [empe, setEmpe] = useState(false);

  const som = useRef(new Som());
  const vistos = useRef(new Set((inicial?.recentes ?? []).map((r) => r.id)));
  const anterior = useRef<EstadoDoTelao | null>(inicial);
  const filaFaixas = useRef<Faixa[]>([]);
  const filaFestas = useRef<Festa[]>([]);

  // ---------- escala do palco
  useEffect(() => {
    const ajustar = () => {
      setEscala(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
      setEmpe(window.innerHeight > window.innerWidth * 1.1);
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  // ---------- relógio
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ---------- largada (semáforo uma vez ao abrir)
  useEffect(() => {
    const passos = [700, 1500, 2300, 3100];
    const ts = passos.map((ms, i) =>
      setTimeout(() => {
        setLuzes(i + 1);
        som.current.semaforo(i === 3);
        if (i === 3) setLargou(true);
      }, ms)
    );
    return () => ts.forEach(clearTimeout);
  }, []);

  // ---------- troca semana/mês
  useEffect(() => {
    if (estado?.periodoTelao !== "alternar") {
      if (estado?.periodoTelao) setVista(estado.periodoTelao);
      return;
    }
    const t = setInterval(() => setVista((v) => (v === "semana" ? "mes" : "semana")), TROCA_PERIODO_MS);
    return () => clearInterval(t);
  }, [estado?.periodoTelao]);

  // ---------- hall da fama gira
  useEffect(() => {
    const t = setInterval(() => setHallI((i) => i + 1), 8000);
    return () => clearInterval(t);
  }, []);

  // ---------- esconde cursor e botões parados
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const mexeu = () => {
      setQuieto(false);
      clearTimeout(t);
      t = setTimeout(() => setQuieto(true), 4000);
    };
    mexeu();
    window.addEventListener("pointermove", mexeu);
    window.addEventListener("keydown", mexeu);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointermove", mexeu);
      window.removeEventListener("keydown", mexeu);
    };
  }, []);

  // ---------- tela não apaga (telão)
  useEffect(() => {
    let trava: { release: () => Promise<void> } | null = null;
    const pedir = async () => {
      try {
        const nav = navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } };
        trava = (await nav.wakeLock?.request("screen")) ?? null;
      } catch {
        /* sem permissão: segue */
      }
    };
    void pedir();
    const voltar = () => document.visibilityState === "visible" && void pedir();
    document.addEventListener("visibilitychange", voltar);
    return () => {
      document.removeEventListener("visibilitychange", voltar);
      void trava?.release().catch(() => {});
    };
  }, []);

  // ---------- filas de faixas e festas (uma de cada vez)
  // (Nada de mexer na fila dentro de setState: o React pode rodar a função
  // duas vezes e um anúncio sumiria.)
  const [fila, setFila] = useState(0);
  useEffect(() => {
    if (faixa) {
      const t = setTimeout(() => setFaixa(null), 4300);
      return () => clearTimeout(t);
    }
    const proxima = filaFaixas.current.shift();
    if (proxima) setFaixa(proxima);
  }, [faixa, fila]);
  const anunciar = useCallback((f: Faixa) => {
    filaFaixas.current.push(f);
    setFila((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!festa) return;
    som.current.fanfarra();
    const fim = Date.now() + 2500;
    const cores = ["#E60012", "#FFD23F", "#1E6BFF", "#00B86B", "#ffffff"];
    const solta = () => {
      confetti({ particleCount: 7, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: cores });
      confetti({ particleCount: 7, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: cores });
      if (Date.now() < fim) requestAnimationFrame(solta);
    };
    solta();
    const t = setTimeout(() => setFesta(null), festa.tipo === "equipe" ? 11000 : 8000);
    return () => clearTimeout(t);
  }, [festa]);
  const [filaF, setFilaF] = useState(0);
  useEffect(() => {
    if (festa) return;
    const proxima = filaFestas.current.shift();
    if (proxima) setFesta(proxima);
  }, [festa, filaF]);
  const comemorar = useCallback((f: Festa) => {
    filaFestas.current.push(f);
    setFilaF((n) => n + 1);
  }, []);

  // ---------- compara o estado novo com o anterior e comemora
  const comparar = useCallback(
    (novo: EstadoDoTelao) => {
      const velho = anterior.current;
      anterior.current = novo;
      const linhas = new Map(novo.semana.linhas.map((l) => [l.piloto.id, l]));

      // vendas, OS e orçamentos que acabaram de entrar
      const chegaram = novo.recentes.filter((r) => !vistos.current.has(r.id)).reverse();
      for (const r of chegaram) {
        vistos.current.add(r.id);
        const l = r.pilotoId ? linhas.get(r.pilotoId) : undefined;
        if (!l) continue;
        const dourado = r.licencas > 0;
        if (r.valor > 0) setTurbos((t) => ({ ...t, [l.piloto.id]: { tipo: dourado ? "dourado" : "normal", valor: r.valor, ate: Date.now() + 4500 } }));
        if (r.tipo === "venda") {
          som.current.turbo();
          if (dourado) {
            anunciar({ id: r.id, titulo: "Turbo dourado!", sub: `${nomeCurto(l)} vendeu licença · +${rs(r.valor)}`, cor: "ouro" });
          } else {
            anunciar({ id: r.id, titulo: `${nomeCurto(l)} vendeu!`, sub: `+${rs(r.valor)} na corrida` });
          }
        } else if (r.tipo === "os") {
          som.current.turbo();
          anunciar({ id: r.id, titulo: `${nomeCurto(l)} entregou uma OS!`, sub: `+${rs(r.valor)} na corrida`, cor: "azul" });
        } else if (r.tipo === "orcamento") {
          som.current.moeda();
        } else if (r.valor > 0) {
          som.current.moeda();
          anunciar({ id: r.id, titulo: `${nomeCurto(l)} na corrida`, sub: `+${rs(r.valor)}`, cor: "azul" });
        }
      }
      if (!velho) return;

      for (const per of ["semana", "mes"] as const) {
        const antes = new Map(velho[per].linhas.map((l) => [l.piloto.id, l]));
        const agoraL = novo[per].linhas;
        // ultrapassagem (só na corrida que está na tela, para não repetir)
        if (per === vista) {
          for (const l of agoraL) {
            const a = antes.get(l.piloto.id);
            if (!a || l.posicao >= a.posicao || l.valor <= a.valor) continue;
            const passado = agoraL.find((x) => x.posicao === l.posicao + 1);
            const pa = passado ? antes.get(passado.piloto.id) : undefined;
            if (passado && pa && pa.posicao < a.posicao && passado.valor > 0) {
              anunciar({ id: `ult-${l.piloto.id}-${Date.now()}`, titulo: "Ultrapassagem!", sub: `${nomeCurto(l)} passou ${nomeCurto(passado)} e agora é o ${lugar(l.posicao)}` });
            }
          }
        }
        // meta batida
        for (const l of agoraL) {
          const a = antes.get(l.piloto.id);
          if (a && !a.chegou && l.chegou) comemorar({ id: `meta-${per}-${l.piloto.id}`, tipo: "piloto", linha: l, placar: novo[per] });
        }
        if (velho[per].equipe.progresso < 1 && novo[per].equipe.progresso >= 1) {
          comemorar({ id: `equipe-${per}`, tipo: "equipe", placar: novo[per] });
        }
      }
    },
    [anunciar, comemorar, vista]
  );

  // ---------- pergunta ao site
  useEffect(() => {
    let vivo = true;
    const buscar = async () => {
      try {
        const r = await fetch("/api/arena/estado", { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const novo = (await r.json()) as EstadoDoTelao;
        if (!vivo) return;
        setOffline(false);
        comparar(novo);
        setEstado(novo);
        try {
          localStorage.setItem(GUARDADO, JSON.stringify(novo));
        } catch {
          /* sem armazenamento: segue */
        }
      } catch {
        if (vivo) setOffline(true);
      }
    };
    const t = setInterval(buscar, INTERVALO_MS);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [comparar]);

  // turbo dura alguns segundos
  useEffect(() => {
    const t = setInterval(() => {
      setTurbos((tb) => {
        const agora = Date.now();
        const resto = Object.fromEntries(Object.entries(tb).filter(([, v]) => v.ate > agora));
        return Object.keys(resto).length === Object.keys(tb).length ? tb : resto;
      });
    }, 500);
    return () => clearInterval(t);
  }, []);

  const placar = estado ? estado[vista] : null;
  const placarPremio = estado?.premio ? estado[estado.premio.periodo] : placar;

  // Faixa fixa para cada piloto (pelo número), para ninguém pular de faixa.
  const pistas = useMemo(() => {
    if (!placar) return [];
    const porFaixa = [...placar.linhas].sort((a, b) => a.piloto.numero - b.piloto.numero || a.piloto.nome.localeCompare(b.piloto.nome));
    const n = Math.max(1, porFaixa.length);
    const pesos = porFaixa.map((_, i) => 0.84 + (n === 1 ? 0.16 : (0.32 * i) / (n - 1)));
    const total = pesos.reduce((a, b) => a + b, 0);
    let y = TOPO_PISTA;
    return porFaixa.map((linha, i) => {
      const h = ((FUNDO_PISTA - TOPO_PISTA) * pesos[i]) / total;
      const y0 = y;
      y += h;
      return { linha, y0, y1: y, h };
    });
  }, [placar]);

  const ligarSom = () => {
    som.current.ligar();
    setSomLigado(true);
    som.current.moeda();
  };
  const telaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  if (!estado || !placar) {
    return (
      <div className="arn-fundo" style={{ display: "grid", placeItems: "center" }}>
        <p className="arn-letra" style={{ fontSize: 48, textAlign: "center", padding: 24 }}>
          A Arena está fora do ar agora.
          <br />
          <span style={{ fontSize: 28 }}>A tela tenta de novo sozinha.</span>
        </p>
        <meta httpEquiv="refresh" content="60" />
      </div>
    );
  }

  const vigiaVivo = Boolean(estado.vigiaUltimaVez && agora - Date.parse(estado.vigiaUltimaVez) < 15 * 60_000);
  const hall = estado.hallDaFama.length ? estado.hallDaFama[hallI % estado.hallDaFama.length] : null;
  const falta = placarPremio ? Math.max(0, Math.ceil(placarPremio.equipe.meta - placarPremio.equipe.valor)) : 0;
  const recentes = estado.recentes.slice(0, 6);
  const nomes = new Map(placar.linhas.map((l) => [l.piloto.id, nomeCurto(l)]));

  return (
    <div className={`arn-fundo ${quieto ? "arn-quieto" : ""}`}>
      <div className="arn-palco" style={{ transform: `translate(-50%, -50%) scale(${escala})` }}>
        <svg viewBox={`0 0 ${W} 1080`} width={W} height={1080} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <Ceu />
          <Pista faixas={pistas} luzes={luzes} />

          {/* nomes pintados no asfalto da largada */}
          {pistas.map(({ linha, y0, h }) => (
            <text
              key={`nome-${linha.piloto.id}`}
              x={bordaEsq(y0 + h / 2) + 18}
              y={y0 + h / 2 + 8}
              fontSize={Math.min(26, h * 0.34)}
              fontWeight={900}
              fontStyle="italic"
              fill="#fff"
              opacity={0.55}
            >
              {linha.piloto.numero}
            </text>
          ))}

          {/* karts: do fundo para a frente */}
          {pistas.map(({ linha, y1, h }) => {
            const s = Math.min(0.95, (h * 1.18) / 130);
            const yBase = y1 - 6;
            const xIni = bordaEsq(yBase) + 128;
            const xFim = linhaChegada(yBase);
            const p = largou ? Math.min(1, linha.progresso) : 0;
            const nariz = 196 * s;
            const x = linha.chegou && largou ? xFim + 52 : xIni + (xFim - nariz - xIni) * p;
            const tb = turbos[linha.piloto.id];
            return (
              <g key={linha.piloto.id} className="arn-kart" style={{ transform: `translate(${x}px, ${yBase - 124 * s}px)` }}>
                <g className="arn-kart-pulo" style={{ animationDelay: `${(linha.piloto.numero % 5) * -0.09}s` }}>
                  {tb && (
                    <g className="arn-velocidade" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeDasharray="40 80" opacity={0.8}>
                      <path d={`M -40 ${30 * s} H -220`} />
                      <path d={`M -20 ${70 * s} H -260`} />
                      <path d={`M -50 ${104 * s} H -200`} />
                    </g>
                  )}
                  <g transform={`scale(${s})`}>
                    <KartG
                      modelo={linha.piloto.kart}
                      cor={linha.piloto.cor}
                      nome={linha.piloto.apelido || linha.piloto.nome}
                      numero={linha.piloto.numero}
                      foto={linha.piloto.foto}
                      turbo={tb ? tb.tipo : null}
                    />
                  </g>
                </g>
                {/* plaquinha com nome e quanto já fez */}
                <g transform={`translate(${100 * s} ${4 * s}) scale(${Math.max(0.62, s * 1.15)})`}>
                  <rect x={-104} y={-34} width={208} height={34} rx={17} fill="#fff" stroke={TINTA} strokeWidth={4} />
                  <text x={0} y={-10} textAnchor="middle" fontSize={20} fontWeight={900} fill={TINTA}>
                    {nomeCurto(linha).slice(0, 10)} · {rsCurto(linha.valor)}
                  </text>
                  {linha.chegou && (
                    <g transform="translate(96 -44)">
                      <rect x={0} y={0} width={30} height={22} fill="url(#arn-xadrez)" stroke={TINTA} strokeWidth={3} />
                    </g>
                  )}
                </g>
                {tb && (
                  <text className="arn-mais" x={100 * s} y={-40 * s} textAnchor="middle" fontSize={44} fontWeight={900} fontStyle="italic" fill={tb.tipo === "dourado" ? "#FFD23F" : "#fff"} stroke={TINTA} strokeWidth={8} paintOrder="stroke">
                    +{rsCurto(tb.valor)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* ---------- HUD de cima ---------- */}
        <div style={{ position: "absolute", left: 24, top: 18, right: 24, height: 118, display: "flex", gap: 20, alignItems: "stretch" }}>
          <div className="arn-chip" style={{ padding: "10px 26px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#E60012" }}>
            <div className="arn-letra" style={{ fontSize: 44, lineHeight: 1 }}>{estado.titulo}</div>
            <div className="arn-letra" style={{ fontSize: 24, WebkitTextStroke: "5px #1a1440", marginTop: 6 }}>
              {vista === "semana" ? "Corrida da semana" : "Corrida do mês"} · {placar.rotulo}
            </div>
          </div>
          <div className="arn-chip" style={{ padding: "10px 24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: 290 }}>
            <div style={{ fontSize: 20, fontFamily: "Arial, sans-serif", fontWeight: 700 }}>Termina em</div>
            <div className="arn-letra" suppressHydrationWarning style={{ fontSize: 50, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{relogio(placar.terminaEm, agora)}</div>
          </div>
          <div className="arn-chip" style={{ flex: 1, padding: "12px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 22 }}>
              <span>Meta da equipe</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {rs(placar.equipe.valor)} de {rs(placar.equipe.meta)}
              </span>
            </div>
            <div style={{ position: "relative", height: 40, marginTop: 8, borderRadius: 20, background: "#E9E4F5", border: `5px solid ${TINTA}`, overflow: "hidden" }}>
              <motion.div
                initial={false}
                animate={{ width: `${Math.min(100, placar.equipe.progresso * 100)}%` }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", background: "repeating-linear-gradient(-45deg, #FFD23F 0 18px, #FFB800 18px 36px)" }}
              />
              <div className="arn-letra" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 26, WebkitTextStroke: "5px #1a1440" }}>
                {Math.floor(placar.equipe.progresso * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* ---------- placar da esquerda ---------- */}
        <div style={{ position: "absolute", left: 24, top: 160, width: 340, bottom: 104, display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence initial={false}>
            {placar.linhas.slice(0, 10).map((l) => (
              <motion.div
                key={l.piloto.id}
                layout
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="arn-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "6px 14px 6px 8px",
                  borderRadius: 18,
                  background: l.posicao === 1 ? "#FFD23F" : "#fff",
                  flex: "0 1 78px",
                  minHeight: 0,
                }}
              >
                <div className="arn-letra" style={{ fontSize: 40, width: 62, textAlign: "center", WebkitTextStroke: "6px #1a1440" }}>
                  {l.posicao}
                  <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: 20, WebkitTextStroke: "0", color: TINTA, verticalAlign: "super" }}>º</span>
                </div>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    border: `5px solid ${TINTA}`,
                    background: l.piloto.cor,
                    overflow: "hidden",
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: 20,
                  }}
                >
                  {l.piloto.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.piloto.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    nomeCurto(l).slice(0, 2).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontFamily: "Arial, sans-serif" }}>
                  <div style={{ fontWeight: 900, fontSize: 22, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {nomeCurto(l)} {l.chegou ? "🏁" : ""}
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "#E9E4F5", border: `3px solid ${TINTA}`, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, l.progresso * 100)}%`, height: "100%", background: l.piloto.cor, transition: "width 1.5s" }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 3, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {rsCurto(l.valor)} de {rsCurto(l.meta)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ---------- outdoor do prêmio ---------- */}
        <div style={{ position: "absolute", left: 1400, top: 152, width: 496, height: 300 }}>
          <div className="arn-chip" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20, background: TINTA }}>
            {estado.premio?.imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={estado.premio.imagem} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "linear-gradient(160deg,#FFD23F,#FF9F1C)", fontSize: 140 }}>🏆</div>
            )}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 18px 14px", background: "linear-gradient(transparent, rgba(26,20,64,.92) 45%)" }}>
              <div className="arn-letra" style={{ fontSize: 28, WebkitTextStroke: "5px #1a1440", lineHeight: 1.05 }}>
                {estado.premio ? estado.premio.titulo || estado.premio.local || "Viagem da equipe" : "Pódio da equipe"}
              </div>
              <div style={{ color: "#FFD23F", fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: 20, marginTop: 6 }}>
                {estado.premio
                  ? falta > 0
                    ? `Faltam ${rs(falta)} da equipe ${estado.premio.periodo === "mes" ? "no mês" : "na semana"} para a viagem`
                    : "Meta batida: a viagem é da equipe!"
                  : `Faltam ${rs(falta)} para a equipe bater a meta`}
              </div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 60, top: 300, width: 14, height: 40, background: TINTA }} />
          <div style={{ position: "absolute", right: 60, top: 300, width: 14, height: 40, background: TINTA }} />
          {estado.premio && (
            <div className="arn-chip" style={{ position: "absolute", left: -18, top: -18, padding: "4px 14px", borderRadius: 14, background: "#FF5A5F", transform: "rotate(-4deg)" }}>
              <span className="arn-letra" style={{ fontSize: 22, WebkitTextStroke: "4px #1a1440" }}>Prêmio</span>
            </div>
          )}
        </div>

        {/* ---------- rodapé: últimas jogadas e hall da fama ---------- */}
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 14, height: 76, display: "flex", gap: 16 }}>
          <div className="arn-chip" style={{ flex: 1, display: "flex", alignItems: "center", gap: 18, padding: "0 20px", overflow: "hidden", fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 21 }}>
            <span style={{ color: "#E60012", whiteSpace: "nowrap" }}>Últimas jogadas</span>
            {recentes.length === 0 && <span style={{ opacity: 0.6 }}>A primeira venda do dia abre a corrida.</span>}
            {recentes.map((r) => (
              <span key={r.id} style={{ whiteSpace: "nowrap" }}>
                {r.tipo === "venda" ? (r.licencas > 0 ? "⚡" : "💰") : r.tipo === "os" ? "🔧" : r.tipo === "orcamento" ? "📝" : "⭐"} {nomes.get(r.pilotoId ?? "") ?? "—"}
                {r.tipo === "orcamento" ? " orçou" : ` +${rsCurto(r.valor)}`}
              </span>
            ))}
          </div>
          {hall && (
            <div className="arn-chip" style={{ width: 520, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", fontFamily: "Arial, sans-serif" }}>
              <span style={{ fontSize: 34 }}>🏆</span>
              <AnimatePresence mode="wait">
                <motion.div key={hallI} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.7 }}>Hall da fama · {hall.rotulo}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {hall.campeao} · {rs(hall.valor)}{hall.chegaram > 1 ? ` · ${hall.chegaram} cruzaram a linha` : ""}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {placar.linhas.length === 0 && (
          <div className="arn-letra" style={{ position: "absolute", left: 400, right: 40, top: 640, textAlign: "center", fontSize: 54 }}>
            Nenhum piloto na pista ainda.
          </div>
        )}

        {/* ---------- faixa de anúncio ---------- */}
        {faixa && !festa && (
          <div key={faixa.id} className={`arn-faixa ${faixa.cor ?? ""}`}>
            <div className="arn-letra t">{faixa.titulo}</div>
            {faixa.sub && <div className="arn-letra s">{faixa.sub}</div>}
          </div>
        )}

        {/* ---------- festa ---------- */}
        {festa && (
          <div className="arn-festa" key={festa.id}>
            {festa.tipo === "piloto" && festa.linha ? (
              <>
                <svg viewBox="-80 0 290 135" width={760} height={354}>
                  <KartG modelo={festa.linha.piloto.kart} cor={festa.linha.piloto.cor} nome={festa.linha.piloto.apelido || festa.linha.piloto.nome} numero={festa.linha.piloto.numero} foto={festa.linha.piloto.foto} turbo="dourado" />
                </svg>
                <div className="arn-letra" style={{ fontSize: 110, marginTop: 10 }}>{nomeCurto(festa.linha)} cruzou a linha!</div>
                <div className="arn-letra" style={{ fontSize: 46, WebkitTextStroke: "6px #1a1440", marginTop: 14 }}>
                  Bateu a meta {festa.placar.periodo === "semana" ? "da semana" : "do mês"}: {rs(festa.linha.valor)}
                </div>
              </>
            ) : (
              <>
                {estado.premio?.imagem && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={estado.premio.imagem} alt="" referrerPolicy="no-referrer" style={{ width: 820, height: 460, objectFit: "cover", borderRadius: 28, border: `10px solid ${TINTA}`, boxShadow: "0 18px 0 rgba(26,20,64,.5)" }} />
                )}
                <div className="arn-letra" style={{ fontSize: 104, marginTop: 24 }}>A equipe bateu a meta!</div>
                <div className="arn-letra" style={{ fontSize: 46, WebkitTextStroke: "6px #1a1440", marginTop: 12 }}>
                  {estado.premio ? `${estado.premio.titulo || estado.premio.local} — a viagem é de vocês` : `${rs(festa.placar.equipe.valor)} ${festa.placar.periodo === "semana" ? "na semana" : "no mês"}`}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {empe && (
        <div style={{ position: "fixed", top: 16, left: 16, right: 16, zIndex: 60, textAlign: "center", font: "700 16px Arial, sans-serif", color: "#fff" }}>
          Vire o celular para ver a pista maior.
        </div>
      )}
      <div className="arn-controles">
        {!somLigado && estado.som && <button onClick={ligarSom}>🔊 Ligar som</button>}
        <button onClick={() => setVista((v) => (v === "semana" ? "mes" : "semana"))}>{vista === "semana" ? "Ver o mês" : "Ver a semana"}</button>
        <button onClick={telaCheia}>⛶ Tela cheia</button>
      </div>
      {(offline || !vigiaVivo) && (
        <div style={{ position: "fixed", left: 14, bottom: 14, zIndex: 60, font: "700 13px Arial, sans-serif", color: "#fff", background: "rgba(26,20,64,.8)", padding: "6px 10px", borderRadius: 8 }}>
          {offline ? "Sem conexão com o site — tentando de novo" : "Bling sem atualizar há mais de 15 min (o vigia do PC está ligado?)"}
        </div>
      )}
    </div>
  );
}
