// ============================================================
// Os karts da Arena — desenhos originais (não são de nenhum jogo).
//
// Vista de lado, andando para a direita, caixa de 200 × 130. O capacete do
// piloto mostra a foto do vendedor (ou as iniciais). Seis modelos, todos com
// a mesma "tinta" de contorno azul-marinho para parecerem da mesma família.
// ============================================================

import { useId } from "react";
import type { ModeloDeKart } from "@/lib/arena/tipos";

export const TINTA = "#1A1440";

function escurecer(hex: string, f = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

function Roda({ x, y, r, cor, girando }: { x: number; y: number; r: number; cor: string; girando: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#24213A" stroke={TINTA} strokeWidth={4} />
      <circle r={r * 0.78} fill="none" stroke="#3B3756" strokeWidth={3} strokeDasharray="4 5" />
      <g className={girando ? "arn-roda" : undefined}>
        <circle r={r * 0.46} fill={cor} stroke={TINTA} strokeWidth={3} />
        <path d={`M ${-r * 0.42} 0 H ${r * 0.42} M 0 ${-r * 0.42} V ${r * 0.42}`} stroke={TINTA} strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
}

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export interface PropsDoKart {
  modelo: ModeloDeKart;
  cor: string;
  nome: string;
  numero: number;
  foto?: string | null;
  girando?: boolean;
  /** Fogo do turbo saindo do escapamento. */
  turbo?: "normal" | "dourado" | null;
}

/** O kart como <g> (para pôr dentro de um <svg> maior). */
export function KartG({ modelo, cor, nome, numero, foto, girando = true, turbo = null }: PropsDoKart) {
  const uid = useId().replace(/:/g, "");
  const escura = escurecer(cor);
  const clara = "#FFFFFF";

  // Posição das rodas e do piloto em cada modelo.
  const geo = {
    classico: { tras: [46, 100, 22], frente: [156, 104, 18], cab: [92, 38] },
    foguete: { tras: [44, 102, 20], frente: [160, 104, 17], cab: [86, 36] },
    buggy: { tras: [44, 96, 26], frente: [158, 98, 24], cab: [96, 30] },
    formula: { tras: [42, 102, 22], frente: [166, 106, 16], cab: [90, 42] },
    monster: { tras: [46, 92, 32], frente: [154, 92, 32], cab: [100, 22] },
    turbo: { tras: [48, 100, 24], frente: [154, 104, 18], cab: [90, 34] },
  }[modelo];
  const [tx, ty, tr] = geo.tras;
  const [fx, fy, fr] = geo.frente;
  const [cx, cy] = geo.cab;

  const corpo = {
    classico: (
      <>
        <path d="M 18 92 Q 16 70 40 66 L 120 62 Q 150 60 178 78 Q 190 86 184 96 L 24 100 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 30 74 L 118 70 Q 140 69 160 80" fill="none" stroke={clara} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      </>
    ),
    foguete: (
      <>
        <path d="M 10 86 Q 12 64 44 62 L 132 58 Q 176 60 194 84 Q 176 102 132 102 L 30 102 Q 12 100 10 86 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 20 64 L 6 44 L 40 62 Z" fill={escura} stroke={TINTA} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 150 70 L 182 82" stroke={clara} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        <circle cx={146} cy={82} r={7} fill="#BDEBFF" stroke={TINTA} strokeWidth={3} />
      </>
    ),
    buggy: (
      <>
        <path d="M 22 88 L 34 70 L 170 70 L 184 90 L 176 98 L 28 98 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 60 70 L 74 14 L 128 14 L 146 70" fill="none" stroke={TINTA} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 60 70 L 74 14 L 128 14 L 146 70" fill="none" stroke={escura} strokeWidth={3} strokeLinejoin="round" />
      </>
    ),
    formula: (
      <>
        <path d="M 14 90 L 24 72 L 110 66 L 196 92 L 194 100 L 22 102 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <rect x={6} y={42} width={30} height={10} rx={3} fill={escura} stroke={TINTA} strokeWidth={4} />
        <path d="M 22 52 L 22 72" stroke={TINTA} strokeWidth={5} />
        <path d="M 176 98 L 198 98" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />
      </>
    ),
    monster: (
      <>
        <path d="M 20 72 Q 20 50 46 48 L 150 46 Q 182 48 184 70 L 182 80 L 22 82 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <rect x={64} y={80} width={70} height={10} fill="#3B3756" stroke={TINTA} strokeWidth={4} />
      </>
    ),
    turbo: (
      <>
        <path d="M 20 96 Q 14 66 46 62 L 126 60 Q 162 60 182 84 Q 188 96 176 100 L 26 102 Z" fill={cor} stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />
        <rect x={2} y={58} width={34} height={12} rx={6} fill="#C9CBD6" stroke={TINTA} strokeWidth={4} />
        <rect x={6} y={74} width={30} height={12} rx={6} fill="#C9CBD6" stroke={TINTA} strokeWidth={4} />
      </>
    ),
  }[modelo];

  const fogo = turbo === "dourado" ? ["#FFF6B0", "#FFD23F", "#FF9F1C"] : ["#FFFFFF", "#7FDBFF", "#1E6BFF"];

  return (
    <g>
      <ellipse cx={100} cy={124} rx={88} ry={7} fill={TINTA} opacity={0.22} />
      {turbo && (
        <g className="arn-fogo">
          <path d="M 14 80 Q -40 70 -70 84 Q -40 98 14 90 Z" fill={fogo[2]} />
          <path d="M 14 82 Q -24 76 -44 85 Q -24 94 14 88 Z" fill={fogo[1]} />
          <path d="M 14 83 Q -8 80 -18 85 Q -8 90 14 87 Z" fill={fogo[0]} />
        </g>
      )}
      <g className="arn-fumaca" opacity={turbo ? 0 : 0.7}>
        <circle cx={6} cy={84} r={6} fill="#E8E8F0" />
      </g>
      {corpo}
      {/* Piloto: corpo, volante e capacete com a foto */}
      <path d={`M ${cx - 18} ${cy + 46} Q ${cx - 16} ${cy + 18} ${cx} ${cy + 18} Q ${cx + 18} ${cy + 18} ${cx + 22} ${cy + 46} Z`} fill={escura} stroke={TINTA} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${cx + 16} ${cy + 34} L ${cx + 36} ${cy + 28}`} stroke={TINTA} strokeWidth={6} strokeLinecap="round" />
      <defs>
        <clipPath id={`rosto-${uid}`}>
          <circle cx={cx + 3} cy={cy + 1} r={17} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={27} fill={cor} stroke={TINTA} strokeWidth={5} />
      <circle cx={cx + 3} cy={cy + 1} r={19} fill="#FFE9D6" stroke={TINTA} strokeWidth={3} />
      {foto ? (
        <image
          href={foto}
          x={cx + 3 - 17}
          y={cy + 1 - 17}
          width={34}
          height={34}
          clipPath={`url(#rosto-${uid})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text x={cx + 3} y={cy + 8} textAnchor="middle" fontSize={17} fontWeight={900} fill={TINTA} fontFamily="'Arial Black', Arial, sans-serif">
          {iniciais(nome)}
        </text>
      )}
      <path d={`M ${cx - 24} ${cy - 10} Q ${cx} ${cy - 30} ${cx + 24} ${cy - 10}`} fill="none" stroke={clara} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      {/* Número na lateral */}
      <circle cx={modelo === "monster" ? 150 : 140} cy={modelo === "monster" ? 64 : 82} r={12} fill={clara} stroke={TINTA} strokeWidth={3} />
      <text
        x={modelo === "monster" ? 150 : 140}
        y={modelo === "monster" ? 69 : 87}
        textAnchor="middle"
        fontSize={14}
        fontWeight={900}
        fill={TINTA}
        fontFamily="'Arial Black', Arial, sans-serif"
      >
        {numero}
      </text>
      <Roda x={tx} y={ty} r={tr} cor={cor} girando={girando} />
      <Roda x={fx} y={fy} r={fr} cor={cor} girando={girando} />
    </g>
  );
}

/** O kart sozinho, para o painel. */
export function Kart(props: PropsDoKart & { largura?: number; className?: string }) {
  const { largura = 160, className, ...resto } = props;
  // Com turbo, sobra espaço atrás para o fogo.
  const [x, y, w, h] = props.turbo ? [-80, 0, 290, 135] : [-6, -6, 212, 142];
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={largura} height={(largura * h) / w} className={className} role="img" aria-label={`Kart de ${props.nome}`}>
      <KartG {...resto} girando={props.girando ?? false} />
    </svg>
  );
}
