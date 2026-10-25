import Image from "next/image";
import { ArrowRight, BadgeCheck, Cpu, HardDrive, MemoryStick, Monitor, ShieldCheck } from "lucide-react";

/**
 * Destaque da home: notebook gamer Avell Storm 480 que está na vitrine da loja.
 *
 * Histórico do bloco: MacBook Pro M5 (vendido em 16/10) → MacBook M2 (vendido
 * em 25/10) → Avell Storm 480.
 *
 * É um produto único da loja — não vem do espelhamento de preços (Kabum e
 * afins), então os valores ficam aqui, à mão. Mudou o preço? É só trocar as
 * constantes abaixo; a economia se ajusta sozinha.
 *
 * Mídia em public/images/avell-storm-480/: foto oficial da Avell e um vídeo de
 * 4 s em loop feito a partir dela (scripts/gerar-video-destaque.py).
 */
const VALOR_DA_NOTA_FISCAL = 19333;
const PRECO = 13999;

const MENSAGEM_WHATSAPP =
  "Olá! Vi no site o notebook Avell Storm 480 (i9 14ª geração, 64GB DDR5, SSD 1TB, RTX 4080 12GB) por R$ 13.999. Ainda está disponível?";
const LINK_WHATSAPP = `https://wa.me/5519987510267?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`;

const MIDIA = "/images/avell-storm-480";

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const economia = VALOR_DA_NOTA_FISCAL - PRECO;

const especificacoes = [
  { icon: Cpu, texto: "Intel Core i9 14ª geração" },
  { icon: MemoryStick, texto: "64GB DDR5" },
  { icon: HardDrive, texto: "SSD de 1TB" },
  { icon: Monitor, texto: "RTX 4080 de 12GB" },
];

export default function HomeAvellStorm480Destaque() {
  return (
    <section
      aria-labelledby="destaque-avell-storm-480"
      className="group relative isolate w-full overflow-hidden rounded-[2.5rem] border-2 border-[#E60012]/70 bg-[#06070b] shadow-2xl shadow-red-950/40 transition-colors duration-300 hover:border-[#E60012]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(230,0,18,0.20),transparent_42%)]"
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Vídeo do produto: em cima no celular, à direita no computador */}
        <div className="relative min-h-[230px] overflow-hidden bg-black sm:min-h-[340px] lg:order-last lg:min-h-[460px]">
          {/* A foto parada fica por baixo: aparece enquanto o vídeo carrega e
              para quem pediu ao aparelho menos movimento na tela. */}
          <Image
            src={`${MIDIA}/avell-storm-480-poster.webp`}
            alt="Notebook gamer Avell Storm 480 à venda na Balão da Informática"
            fill
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="object-cover object-center lg:object-contain"
          />
          <video
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={`${MIDIA}/avell-storm-480-poster.jpg`}
            className="absolute inset-0 h-full w-full object-cover object-center motion-reduce:hidden lg:object-contain"
          >
            <source src={`${MIDIA}/avell-storm-480.webm`} type="video/webm" />
            <source src={`${MIDIA}/avell-storm-480.mp4`} type="video/mp4" />
          </video>

          {/* Funde o vídeo com o painel, sem deixar emenda */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06070b] to-transparent lg:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#06070b] to-transparent lg:block"
          />

          {/* Selo discreto no canto */}
          <div
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-100 backdrop-blur-sm sm:right-6 sm:top-6 sm:text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E60012]" />
            Pronta entrega
          </div>
        </div>

        {/* Oferta */}
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10 xl:p-12">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E60012] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
              <BadgeCheck size={14} aria-hidden="true" />
              Na vitrine
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              Destaque da loja
            </span>
          </div>

          <h2
            id="destaque-avell-storm-480"
            className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-4xl xl:text-5xl"
          >
            Avell Storm 480
          </h2>
          <p className="mt-2 text-lg font-bold text-slate-200 sm:text-xl">
            Notebook gamer · <span className="whitespace-nowrap">tela de 17&quot; 240 Hz</span>
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {especificacoes.map(({ icon: Icon, texto }) => (
              <li
                key={texto}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-100 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <Icon size={15} className="shrink-0 text-[#E60012]" aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>

          {/* Valor da nota fiscal riscado + preço da loja */}
          <div className="mt-6 border-t border-slate-700/80 pt-5">
            <p className="text-sm font-bold text-slate-300 sm:text-base">
              Valor na nota fiscal:{" "}
              <s className="text-lg font-black text-slate-200 decoration-[#E60012] decoration-2 sm:text-xl">
                {emReais(VALOR_DA_NOTA_FISCAL)}
              </s>
            </p>

            <p className="mt-1.5 whitespace-nowrap text-6xl font-black leading-none tracking-tight text-white sm:text-7xl">
              <span className="sr-only">Preço: </span>
              {emReais(PRECO)}
            </p>

            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              {emReais(economia)} abaixo do valor da nota fiscal.
            </p>
          </div>

          {/* Garantia */}
          <div className="mt-5 flex items-start gap-3.5 border-t border-slate-700/80 pt-5">
            <ShieldCheck size={26} className="mt-0.5 shrink-0 text-[#E60012]" aria-hidden="true" />
            <div>
              <p className="text-base font-black text-white sm:text-lg">1 ano de garantia</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Está na vitrine da loja, na Av. Anchieta, 789, Cambuí, Campinas. Venha ver de perto
                ou chame no WhatsApp.
              </p>
            </div>
          </div>

          {/* O ::after estica o link: o bloco inteiro leva para o WhatsApp da loja.
              Não pôr scale/transform neste link: isso encolheria a área clicável
              de volta para o botão bem na hora do clique. */}
          <a
            href={LINK_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 group-hover:bg-red-700 sm:w-fit sm:px-9 sm:text-base"
          >
            Quero o Avell Storm 480
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
