import Image from "next/image";
import { Barlow_Condensed } from "next/font/google";
import { ArrowRight, BadgeCheck, Cpu, Gpu, HardDrive, MemoryStick, Monitor, ShieldCheck } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";

/**
 * Destaque da home: notebook Acer Predator Helios 300 PH315-54 (2021), seminovo.
 *
 * Fica acima do kit PlayStation 5 (`HomePs5Gta6Destaque`). Não substitui aquele
 * bloco e não aponta para página de produto: este notebook não tem anúncio
 * no catálogo. O botão abre o WhatsApp da loja.
 *
 * Foto do quadro: imprensa Acer, 11/05/2021, `Predator-Helios-300-PH-315-54-Bl1-Bk-02a.jpg`
 * (3/4, tela acesa). Fundo: a mesma matéria, foto lifestyle do PH315-54
 * (`04-ph315-54-lifestyle.jpg`), recortada e tratada em vermelho escuro para
 * o bloco não ficar preto liso. Fonte:
 * https://news.acer.com/acer-announces-predator-triton-300-predator-helios-300-and-nitro-5-gaming-notebooks-with-new-11th-gen-intel-core-mobile-h-series-processors
 */

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["italic"],
});

const MENSAGEM =
  "Olá! Quero o Notebook Acer Predator Helios 300 seminovo (i7-11800H, 16GB, SSD 512GB, RTX 3060 6GB), por R$ 4.499 à vista ou 12x de R$ 449.";

const WHATSAPP = `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(MENSAGEM)}`;

const FOTO = "/images/destaque-predator/helios-300-ph315-54.webp";
const FUNDO = "/images/destaque-predator/fundo-helios-300.webp";
const PRECO_A_VISTA = "4499.00";
const URL_DA_OFERTA = "https://www.balao.info/";

const specs = [
  { icon: Cpu, texto: "Intel Core i7-11800H" },
  { icon: MemoryStick, texto: "16GB DDR4" },
  { icon: HardDrive, texto: "SSD 512GB" },
  { icon: Monitor, texto: 'Tela 15.6"' },
  { icon: Gpu, texto: "RTX 3060 6GB" },
];

const schemaDaOferta = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Notebook Acer Predator Helios 300 seminovo",
  description:
    "Notebook gamer seminovo Acer Predator Helios 300 (Intel Core i7-11800H, 16GB DDR4, SSD 512GB, tela 15,6 polegadas, RTX 3060 6GB) na Balão da Informática Anchieta, em Campinas. R$ 4.499 à vista ou 12x de R$ 449. 6 meses de garantia da loja.",
  image: `${URL_DA_OFERTA.replace(/\/$/, "")}${FOTO}`,
  brand: { "@type": "Brand", name: "Acer" },
  category: "Notebook gamer",
  offers: {
    "@type": "Offer",
    url: URL_DA_OFERTA,
    priceCurrency: "BRL",
    price: PRECO_A_VISTA,
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/UsedCondition",
    seller: {
      "@type": "Organization",
      name: "Balão da Informática Anchieta",
      url: URL_DA_OFERTA,
    },
  },
};

export default function HomePredatorHeliosDestaque() {
  return (
    <div className="rounded-[2.5rem] bg-gradient-to-r from-[#00C2F0] via-[#0057FF] to-[#7AF0FF] p-[3px] shadow-2xl shadow-[#0057FF]/40">
      <JsonLd data={schemaDaOferta} />
      <section
        aria-labelledby="destaque-predator-helios"
        className="group relative isolate overflow-hidden rounded-[2.3rem] bg-[#05070C]"
      >
        <Image
          src={FUNDO}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority={false}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#E60012]/35 via-[#7A1024]/28 to-[#FF5A3C]/22 mix-blend-soft-light"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/80 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/45 lg:to-black/10"
        />

        <div className="relative z-10 grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="relative min-h-[340px] sm:min-h-[460px] lg:order-last lg:min-h-[620px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[52%] h-[72%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,194,240,0.62)_0%,rgba(0,87,255,0.42)_46%,transparent_72%)] blur-2xl"
            />
            <div className="absolute inset-4 z-10 flex items-center justify-center sm:inset-8 lg:inset-6">
              <div className="w-full max-w-[680px] overflow-hidden rounded-[1.75rem] bg-[#f4f1ea] shadow-[0_26px_40px_rgba(0,0,0,0.5)]">
                <Image
                  src={FOTO}
                  alt="Notebook Acer Predator Helios 300 seminovo, tela acesa, na Balão da Informática Anchieta"
                  width={1600}
                  height={1098}
                  sizes="(max-width: 1023px) 100vw, 55vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
            <div
              className={`${display.className} absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#2EE6D6]/80 bg-black/70 px-3 py-1.5 text-sm font-bold uppercase italic tracking-[0.14em] text-[#2EE6D6] shadow-[0_0_18px_rgba(46,230,214,0.35)] backdrop-blur-sm sm:right-6 sm:top-6 sm:text-base`}
            >
              <span className="h-2 w-2 rounded-full bg-[#00C2F0] shadow-[0_0_10px_#00C2F0]" aria-hidden="true" />
              Seminovo
            </div>
          </div>

          <div className="flex flex-col justify-center p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="rounded-3xl bg-black/75 p-5 text-center shadow-2xl sm:p-7 lg:bg-black/60">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00A3E0] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Seminovo
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#2EE6D6]">
                  Destaque da loja
                </span>
              </div>

              <h2
                id="destaque-predator-helios"
                className={`${display.className} mt-4 text-center text-[2.35rem] font-extrabold uppercase italic leading-[0.88] tracking-tight text-white sm:text-6xl lg:text-5xl xl:text-6xl`}
              >
                <span className="block drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)]">Predator</span>
                <span className="mt-1 block">
                  <span className="box-decoration-clone bg-gradient-to-r from-[#00C2F0] via-[#0057FF] to-[#7AF0FF] px-2 py-0.5 text-white">
                    Helios 300
                  </span>
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-base font-bold leading-snug text-white sm:text-lg">
                Notebook gamer seminovo, com RTX 3060, na Balão da Informática Anchieta.
              </p>

              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {specs.map(({ icon: Icon, texto }) => (
                  <li
                    key={texto}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-bold text-white sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
                  >
                    <Icon size={15} className="shrink-0 text-[#2EE6D6]" aria-hidden="true" />
                    {texto}
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-white/15 pt-5">
                <p className={`${display.className} text-5xl font-extrabold italic leading-none tracking-tight text-white sm:text-6xl`}>
                  <span className="sr-only">Preço à vista </span>
                  R$ 4.499
                </p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-[#2EE6D6]">à vista</p>
                <p className="mt-1 text-lg font-bold text-[#9BE7FF] sm:text-xl">ou 12x de R$ 449</p>
              </div>

              <div className="mt-5 flex flex-col items-center gap-2 border-t border-white/15 pt-5 text-center">
                <ShieldCheck size={26} className="shrink-0 text-[#00C2F0]" aria-hidden="true" />
                <div>
                  <p className="text-base font-black text-white sm:text-lg">6 meses de garantia da loja</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-100">
                    Seminovo, com Windows 11 trial e Office 2019 trial. Na vitrine da Balão da Informática
                    Anchieta, Av. Anchieta, 789, Cambuí, Campinas. Venha ver ou chame no WhatsApp{" "}
                    <span className="whitespace-nowrap">(19) 98751-0267</span>.
                  </p>
                </div>
              </div>

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
                Chamar no WhatsApp
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
