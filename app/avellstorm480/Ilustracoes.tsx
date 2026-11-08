/**
 * Ilustrações das peças do Avell Storm 480 (vetor, feitas à mão).
 *
 * Não há foto oficial das peças internas deste notebook, então cada bloco da
 * página usa uma ilustração da peça — e a página avisa que é ilustração.
 * Cores: preto com dourado champanhe, o mesmo acabamento da página.
 */

const OURO_CLARO = "#ead6a6";
const OURO = "#c9a66b";
const OURO_ESCURO = "#7d6338";

function DegradesOuro({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`${id}-ouro`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={OURO_CLARO} />
        <stop offset=".45" stopColor={OURO} />
        <stop offset="1" stopColor={OURO_ESCURO} />
      </linearGradient>
      <linearGradient id={`${id}-espelho`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a3a40" />
        <stop offset=".35" stopColor="#0c0c0f" />
        <stop offset=".62" stopColor="#1b1b20" />
        <stop offset="1" stopColor="#050506" />
      </linearGradient>
      <linearGradient id={`${id}-pcb`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#17171b" />
        <stop offset="1" stopColor="#09090b" />
      </linearGradient>
      <linearGradient id={`${id}-reflexo`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset=".5" stopColor="#fff" stopOpacity=".16" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </>
  );
}

/** Processador: encapsulamento com o die exposto, como nos chips HX de notebook. */
export function IlustracaoProcessador({ className }: { className?: string }) {
  const id = "cpu";
  const capacitores = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Ilustração do processador Intel Core i9-14900HX">
      <defs>
        <DegradesOuro id={id} />
        <linearGradient id={`${id}-substrato`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d2a22" />
          <stop offset="1" stopColor="#0a110d" />
        </linearGradient>
      </defs>
      {/* Substrato */}
      <rect x="40" y="40" width="320" height="320" rx="14" fill={`url(#${id}-substrato)`} />
      <rect x="40.5" y="40.5" width="319" height="319" rx="14" fill="none" stroke={`url(#${id}-ouro)`} strokeOpacity=".55" />
      {/* Trilhas finas */}
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${70 + i * 30} 58 v18 l10 10`}
          stroke={OURO}
          strokeOpacity=".25"
          strokeWidth="1"
          fill="none"
        />
      ))}
      {/* Capacitores dourados em volta do die */}
      {capacitores.map((i) => (
        <g key={i}>
          <rect x={92 + i * 16} y="96" width="8" height="5" rx="1" fill={`url(#${id}-ouro)`} />
          <rect x={92 + i * 16} y="299" width="8" height="5" rx="1" fill={`url(#${id}-ouro)`} />
        </g>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <rect x="96" y={118 + i * 16} width="5" height="8" rx="1" fill={`url(#${id}-ouro)`} />
          <rect x="299" y={118 + i * 16} width="5" height="8" rx="1" fill={`url(#${id}-ouro)`} />
        </g>
      ))}
      {/* Die espelhado */}
      <rect x="118" y="118" width="164" height="164" rx="6" fill={`url(#${id}-espelho)`} />
      <rect x="118.5" y="118.5" width="163" height="163" rx="6" fill="none" stroke="#fff" strokeOpacity=".12" />
      <polygon points="118,200 200,118 236,118 118,236" fill={`url(#${id}-reflexo)`} />
      <text x="200" y="196" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fontStyle="italic" fill={`url(#${id}-ouro)`}>
        i9
      </text>
      <text x="200" y="222" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="10.5" letterSpacing="2.5" fill={OURO} fillOpacity=".85">
        14900HX
      </text>
      <text x="200" y="240" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7.5" letterSpacing="2" fill="#fff" fillOpacity=".4">
        24 NÚCLEOS · 32 THREADS
      </text>
      {/* Marca de canto */}
      <polygon points="52,52 70,52 52,70" fill={`url(#${id}-ouro)`} />
    </svg>
  );
}

/** Placa de vídeo: chip AD104 com os 6 módulos de memória GDDR6 em volta (192 bits, 12 GB). */
export function IlustracaoPlacaDeVideo({ className }: { className?: string }) {
  const id = "gpu";
  const memorias = [
    { x: 70, y: 100 },
    { x: 70, y: 175 },
    { x: 70, y: 250 },
    { x: 290, y: 100 },
    { x: 290, y: 175 },
    { x: 290, y: 250 },
  ];
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Ilustração da placa de vídeo NVIDIA GeForce RTX 4080 de 12GB">
      <defs>
        <DegradesOuro id={id} />
      </defs>
      <rect x="30" y="50" width="340" height="300" rx="16" fill={`url(#${id}-pcb)`} />
      <rect x="30.5" y="50.5" width="339" height="299" rx="16" fill="none" stroke={`url(#${id}-ouro)`} strokeOpacity=".5" />
      {/* Trilhas entre o chip e as memórias */}
      {memorias.map((m, i) => (
        <g key={i} stroke={OURO} strokeOpacity=".22" strokeWidth="1" fill="none">
          {[0, 8, 16, 24].map((d) => (
            <path key={d} d={m.x < 200 ? `M${m.x + 40} ${m.y + 8 + d} H150` : `M${m.x} ${m.y + 8 + d} H250`} />
          ))}
        </g>
      ))}
      {/* Memórias GDDR6 */}
      {memorias.map((m, i) => (
        <g key={`m${i}`}>
          <rect x={m.x} y={m.y} width="40" height="44" rx="3" fill={`url(#${id}-espelho)`} />
          <rect x={m.x + 0.5} y={m.y + 0.5} width="39" height="43" rx="3" fill="none" stroke="#fff" strokeOpacity=".1" />
          <text x={m.x + 20} y={m.y + 26} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="1" fill={OURO} fillOpacity=".8">
            GDDR6
          </text>
        </g>
      ))}
      {/* Moldura e chip */}
      <rect x="140" y="130" width="120" height="140" rx="6" fill="#1a1a1f" stroke={`url(#${id}-ouro)`} strokeOpacity=".7" />
      <rect x="156" y="148" width="88" height="104" rx="4" fill={`url(#${id}-espelho)`} />
      <polygon points="156,210 214,148 236,148 156,232" fill={`url(#${id}-reflexo)`} />
      <text x="200" y="196" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fill={`url(#${id}-ouro)`}>
        RTX
      </text>
      <text x="200" y="214" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" letterSpacing="2" fill={OURO}>
        4080
      </text>
      <text x="200" y="230" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6.5" letterSpacing="1.5" fill="#fff" fillOpacity=".4">
        AD104
      </text>
      {/* Indutores da alimentação */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={128 + i * 25} y="300" width="18" height="18" rx="3" fill="#2a2a30" stroke="#fff" strokeOpacity=".08" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={`c${i}`} x={130 + i * 25} y="82" width="14" height="8" rx="2" fill={`url(#${id}-ouro)`} fillOpacity=".85" />
      ))}
    </svg>
  );
}

function PenteSoDimm({ id, y, opacidade = 1 }: { id: string; y: number; opacidade?: number }) {
  return (
    <g opacity={opacidade} transform={`translate(0 ${y})`}>
      <path
        d="M30 0 H430 a8 8 0 0 1 8 8 V118 H262 v-8 h-12 v8 H22 V8 a8 8 0 0 1 8 -8Z"
        fill={`url(#${id}-pcb)`}
        stroke={`url(#${id}-ouro)`}
        strokeOpacity=".5"
      />
      {/* Chips de memória */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={48 + i * 96} y="20" width="74" height="54" rx="3" fill={`url(#${id}-espelho)`} />
          <rect x={48.5 + i * 96} y="20.5" width="73" height="53" rx="3" fill="none" stroke="#fff" strokeOpacity=".1" />
        </g>
      ))}
      <polygon points="48,74 102,20 122,20 68,74" fill={`url(#${id}-reflexo)`} />
      {/* Contatos dourados */}
      {Array.from({ length: 52 }, (_, i) => {
        const x = 30 + i * 7.9;
        if (x > 244 && x < 266) return null;
        return <rect key={i} x={x} y="94" width="5" height="20" rx="1" fill={`url(#${id}-ouro)`} />;
      })}
      <text x="230" y="86" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" letterSpacing="3" fill={OURO} fillOpacity=".75">
        DDR5 · SO-DIMM
      </text>
    </g>
  );
}

/** Memória: dois pentes DDR5 SO-DIMM, somando 64 GB. */
export function IlustracaoMemoria({ className }: { className?: string }) {
  const id = "ram";
  return (
    <svg viewBox="0 0 460 300" className={className} role="img" aria-label="Ilustração da memória de 64GB DDR5">
      <defs>
        <DegradesOuro id={id} />
      </defs>
      <PenteSoDimm id={id} y={22} opacidade={0.55} />
      <g transform="translate(0 0)">
        <PenteSoDimm id={id} y={150} />
      </g>
    </svg>
  );
}

/** Armazenamento: SSD M.2 2280 NVMe. */
export function IlustracaoSsd({ className }: { className?: string }) {
  const id = "ssd";
  return (
    <svg viewBox="0 0 480 170" className={className} role="img" aria-label="Ilustração do SSD NVMe de 1TB">
      <defs>
        <DegradesOuro id={id} />
      </defs>
      <path
        d="M40 25 H446 a6 6 0 0 1 6 6 V62 a14 14 0 0 0 0 46 V139 a6 6 0 0 1 -6 6 H40 V101 h-6 v-8 h6 Z"
        fill={`url(#${id}-pcb)`}
        stroke={`url(#${id}-ouro)`}
        strokeOpacity=".55"
      />
      {/* Contatos */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="20" y={32 + i * 9.4} width="22" height="5.5" rx="1" fill={`url(#${id}-ouro)`} />
      ))}
      <rect x="18" y="88" width="24" height="12" fill="#060607" />
      {/* Controlador */}
      <rect x="72" y="48" width="70" height="70" rx="4" fill={`url(#${id}-espelho)`} />
      <rect x="72.5" y="48.5" width="69" height="69" rx="4" fill="none" stroke={`url(#${id}-ouro)`} strokeOpacity=".6" />
      <text x="107" y="88" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" letterSpacing="1.5" fill={OURO}>
        PCIe 4.0
      </text>
      {/* Cache */}
      <rect x="160" y="58" width="40" height="50" rx="3" fill={`url(#${id}-espelho)`} />
      {/* Memória flash */}
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={220 + i * 104} y="42" width="92" height="82" rx="4" fill={`url(#${id}-espelho)`} />
          <rect x={220.5 + i * 104} y="42.5" width="91" height="81" rx="4" fill="none" stroke="#fff" strokeOpacity=".1" />
        </g>
      ))}
      <polygon points="220,124 302,42 326,42 244,124" fill={`url(#${id}-reflexo)`} />
      <text x="320" y="138" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" letterSpacing="3" fill={OURO} fillOpacity=".75">
        NVMe · 1 TB
      </text>
      <circle cx="452" cy="85" r="7" fill="none" stroke={`url(#${id}-ouro)`} strokeWidth="2" />
    </svg>
  );
}
