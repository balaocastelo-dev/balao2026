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
 * O fundo é arte original (pôr do sol, palmeiras, neon, oceano turquesa),
 * gravada em public/images/pc-gamer-gta6/. O gabinete RGB fica por cima.
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
  { icon: Gpu, texto: "RTX 4060 Ti 8GB" },
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

        <div className="relative z-10 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="relative min-h-[270px] sm:min-h-[360px] lg:order-last lg:min-h-[540px]">
            <Image
              src={`${MIDIA}/pc-gamer-rgb.webp`}
              alt="PC gamer com gabinete RGB, montado pela Balão da Informática, pronto para GTA 6"
              fill
              sizes="(max-width: 1023px) 100vw, 48vw"
              className="object-contain object-bottom p-4 drop-shadow-[0_28px_36px_rgba(0,0,0,0.7)] sm:p-6 lg:object-center lg:p-8"
            />
            <div
              className={`${display.className} absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-[#2EE6D6]/80 bg-black/70 px-3 py-1.5 text-sm font-bold uppercase italic tracking-[0.14em] text-[#2EE6D6] shadow-[0_0_18px_rgba(46,230,214,0.35)] backdrop-blur-sm sm:right-6 sm:top-6 sm:text-base`}
            >
              <span className="h-2 w-2 rounded-full bg-[#FF3D8B] shadow-[0_0_10px_#FF3D8B]" aria-hidden="true" />
              Pronto pro GTA VI
            </div>
          </div>

          <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="rounded-3xl bg-black/75 p-5 shadow-2xl sm:p-7 lg:bg-black/60">
              <div className="flex flex-wrap items-center gap-2.5">
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
                className={`${display.className} mt-4 text-[2.35rem] font-extrabold uppercase italic leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-5xl xl:text-6xl`}
              >
                <span className="block drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">PC Gamer</span>
                <span className="mt-1 block">
                  <span className="box-decoration-clone bg-gradient-to-r from-[#FF3D8B] via-[#7B2CBF] to-[#FF8A3D] px-2 py-0.5 text-white">
                    pronto pro GTA 6
                  </span>
                </span>
              </h2>
              <p className="mt-3 max-w-xl text-base font-bold leading-snug text-white sm:text-lg">
                Montado na loja, com RGB e folga para o Vice City.{" "}
                <span className="text-[#FFB088]">Você confere o preço no WhatsApp.</span>
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
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

              <div className="mt-5 flex items-start gap-3.5 border-t border-white/15 pt-5">
                <ShieldCheck size={26} className="mt-0.5 shrink-0 text-[#FF8A3D]" aria-hidden="true" />
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
                className="mt-6 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#E60012] px-4 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-colors after:absolute after:inset-0 after:z-30 after:content-[''] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 group-hover:bg-red-700 sm:w-auto sm:gap-2.5 sm:px-8 sm:py-5 sm:text-lg"
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
