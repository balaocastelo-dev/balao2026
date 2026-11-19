import Image from "next/image";
import { Barlow_Condensed } from "next/font/google";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  Fan,
  Gpu,
  HardDrive,
  MemoryStick,
  ShieldCheck,
  Zap,
} from "lucide-react";

/**
 * Destaque da home: PC gamer montado na loja, pronto para GTA 6.
 *
 * Histórico do bloco: MacBook Pro M5 (vendido em 16/10) → MacBook M2 (vendido
 * em 25/10) → Avell Storm 480 (vendido em 10/11) → Acer Aspire Go 15 →
 * PC Gamer pronto pro GTA 6.
 *
 * Sem preço e sem parcelamento: o botão abre o WhatsApp da loja. A página do
 * Acer Aspire Go 15 continua no ar; só saiu da vitrine da home.
 *
 * O fundo é arte original (pôr do sol, palmeiras, neon, oceano turquesa).
 * O gabinete é a foto da loja, com o fundo branco recortado, em
 * public/images/pc-gamer-gta6/. A placa da foto é a Radeon RX 7600 XT.
 */

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["italic"],
});

const WHATSAPP =
  "https://wa.me/5519987510267?text=Ol%C3%A1!%20Quero%20saber%20o%20pre%C3%A7o%20do%20PC%20Gamer%20pronto%20pro%20GTA%206";

const MIDIA = "/images/pc-gamer-gta6";

const especificacoes = [
  { icon: Cpu, texto: "AMD Ryzen 7 5700X" },
  { icon: Gpu, texto: "Radeon RX 7600 XT 16GB" },
  { icon: MemoryStick, texto: "32GB DDR4" },
  { icon: HardDrive, texto: "SSD NVMe 1TB" },
  { icon: Zap, texto: "Fonte 650W 80 Plus" },
  { icon: Fan, texto: "Gabinete gamer RGB" },
];

export default function HomePcGamerGta6Destaque() {
  return (
    <div className="rounded-[2.5rem] bg-gradient-to-r from-[#FF3D8B] via-[#7B2CBF] to-[#FF8A3D] p-[3px] shadow-2xl shadow-[#7B2CBF]/40">
      <section
        aria-labelledby="destaque-pc-gamer-gta6"
        className="group relative isolate overflow-hidden rounded-[2.3rem] bg-[#140816]"
      >
        <Image
          src={`${MIDIA}/fundo-vice-city.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_40%]"
          priority={false}
        />
        {/* Reforça a paleta (magenta → roxo → laranja) sem apagar a foto. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FF3D8B]/35 via-[#7B2CBF]/25 to-[#FF8A3D]/30 mix-blend-soft-light"
        />
        {/* No celular o texto fica embaixo, então o escuro desce.
            No computador o escuro fica à esquerda, atrás da oferta. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/45 lg:to-black/10"
        />

        {/* Atrás do card e do gabinete: o avião no céu, o jet ski na água. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[4%] z-[3] h-12 overflow-hidden sm:h-14 lg:top-[5%]">
          <div className="gta-trilha h-full">
            <div className="gta-aviao w-32 sm:w-40">
              <svg viewBox="0 0 168 40" className="h-10 w-full sm:h-12" fill="none">
                <g className="gta-espuma">
                  <path d="M92 16h70" stroke="white" strokeWidth="2.5" strokeDasharray="7 7" strokeLinecap="round" />
                  <path d="M108 22h48" stroke="#FFD0E4" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
                </g>
                <path d="M78 20h46l6 5-6 4H78l-8-4 8-5Z" fill="#FF3D8B" />
                <path d="M6 17 74 13l10 6-10 6L6 22l8-2.5L6 17Z" fill="#F7F4FF" />
                <path d="M42 15 58 4l6 11H42Z" fill="#F7F4FF" />
                <path d="M50 23 68 34l-8-11H50Z" fill="#F7F4FF" />
                <path d="M70 13 84 8l-4 8 4 7-14-4 4-3-4-3Z" fill="#FF8A3D" />
              </svg>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[28%] z-[3] h-14 overflow-hidden sm:h-16 lg:top-auto lg:bottom-[7%]">
          <div className="gta-trilha h-full">
            <div className="gta-jet w-36 sm:w-48">
              <svg viewBox="0 0 176 52" className="h-12 w-full sm:h-14" fill="none">
                <g className="gta-espuma">
                  <ellipse cx="22" cy="40" rx="18" ry="4" fill="white" />
                  <ellipse cx="46" cy="37" rx="12" ry="3" fill="#E7FBFF" />
                  <ellipse cx="64" cy="35" rx="7" ry="2.2" fill="white" />
                </g>
                <path d="M70 34c18 8 52 8 78 1 6-2 16-8 18-12l-6 6c-16 8-48 10-84 4l-6 1Z" fill="#F4FEFF" />
                <path d="M78 33c22-6 48-4 70 2" stroke="#2EE6D6" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="112" cy="20" r="5.5" fill="#120814" />
                <path d="M104 27c6-6 16-6 24-1l-2 9h-22l0-8Z" fill="#120814" />
                <path d="M126 24c8 1 14 4 16 8" stroke="#120814" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[460px] lg:order-last lg:min-h-[620px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[52%] h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,61,139,0.62)_0%,rgba(123,44,191,0.42)_46%,transparent_72%)] blur-2xl"
            />
            <Image
              src={`${MIDIA}/gabinete.webp`}
              alt="PC gamer com gabinete de vidro e três fans RGB, montado pela Balão da Informática, pronto para GTA 6"
              fill
              sizes="(max-width: 1023px) 100vw, 55vw"
              className="z-10 object-contain object-bottom p-1 drop-shadow-[0_26px_30px_rgba(0,0,0,0.55)] sm:p-2 lg:object-center lg:p-3"
            />
            <div
              className={`${display.className} absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#2EE6D6]/80 bg-black/70 px-3 py-1.5 text-sm font-bold uppercase italic tracking-[0.14em] text-[#2EE6D6] shadow-[0_0_18px_rgba(46,230,214,0.35)] backdrop-blur-sm sm:right-6 sm:top-6 sm:text-base`}
            >
              <span className="h-2 w-2 rounded-full bg-[#FF3D8B] shadow-[0_0_10px_#FF3D8B]" aria-hidden="true" />
              Pronto pro GTA VI
            </div>
          </div>

          <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="rounded-3xl bg-black/92 p-5 text-center shadow-2xl sm:p-7">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF3D8B] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Na vitrine
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#2EE6D6]">
                  Destaque da loja
                </span>
              </div>

              <h2
                id="destaque-pc-gamer-gta6"
                className={`${display.className} mt-4 text-center text-[2.35rem] font-extrabold uppercase italic leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-5xl xl:text-6xl`}
              >
                <span className="block drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">PC Gamer</span>
                <span className="mt-1 block">
                  <span className="box-decoration-clone bg-gradient-to-r from-[#FF3D8B] via-[#7B2CBF] to-[#FF8A3D] px-2 py-0.5 text-white">
                    pronto pro GTA 6
                  </span>
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-base font-bold leading-snug text-white sm:text-lg">
                Montado na loja, com RGB e folga para o Vice City.{" "}
                <span className="text-[#FFB088]">Você confere o preço no WhatsApp.</span>
              </p>

              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {especificacoes.map(({ icon: Icon, texto }) => (
                  <li
                    key={texto}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-bold text-white sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
                  >
                    <Icon size={15} className="shrink-0 text-[#2EE6D6]" aria-hidden="true" />
                    {texto}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col items-center gap-2 border-t border-white/15 pt-5 text-center">
                <ShieldCheck size={26} className="shrink-0 text-[#FF8A3D]" aria-hidden="true" />
                <div>
                  <p className="text-base font-black text-white sm:text-lg">Garantia e montagem pela loja</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-100">
                    Está na vitrine da loja, na Av. Anchieta, 789, Cambuí, Campinas. Venha ver a máquina
                    ligada ou chame no WhatsApp.
                  </p>
                </div>
              </div>

              {/* Sem position/transform neste link: o ::after cobre a seção inteira.
                  backdrop-filter num ancestral prenderia o clique só no painel. */}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-6 inline-flex w-auto max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#E60012] px-4 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-colors after:absolute after:inset-0 after:z-30 after:content-[''] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 group-hover:bg-red-700 sm:gap-2.5 sm:px-8 sm:py-5 sm:text-lg"
              >
                <span className="relative h-7 w-[23px] shrink-0 overflow-hidden sm:h-8 sm:w-[26px]" aria-hidden="true">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={500}
                    height={154}
                    className="absolute left-0 top-1/2 h-7 w-auto max-w-none -translate-y-1/2 brightness-0 invert sm:h-8"
                  />
                </span>
                Confira o preço
                <ArrowRight
                  size={20}
                  aria-hidden="true"
                  className="transition-transform motion-safe:group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
