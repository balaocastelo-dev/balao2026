import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, PackageCheck, ShieldCheck } from "lucide-react";

/**
 * Destaque da home: MacBook Pro M5 seminovo.
 *
 * É um produto único da loja — não vem do espelhamento de preços (Kabum e
 * afins), então os valores ficam aqui, à mão. Mudou o preço? É só trocar as
 * constantes abaixo; a parcela e o "abaixo do mercado" se ajustam sozinhos.
 *
 * Os mesmos dois preços (à vista e no cartão) aparecem em /macbookm5 — se
 * mudar aqui, mude lá também.
 */
const PRECO_DE_MERCADO = 15000;
const PRECO_A_VISTA = 9999;
const PRECO_NO_CARTAO = 10999;
const PARCELAS = 10;

const PAGINA_DO_PRODUTO = "/macbookm5";

const emReais = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const valorDaParcela = (PRECO_NO_CARTAO / PARCELAS).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// O preço de mercado é aproximado, então a economia também é dita por alto.
const economiaEmMil = Math.round((PRECO_DE_MERCADO - PRECO_A_VISTA) / 1000);

const condicoes = [
  { icon: Clock3, texto: "6 meses de uso" },
  { icon: PackageCheck, texto: "Caixa original" },
  { icon: ShieldCheck, texto: "Na garantia Apple" },
];

export default function HomeMacbookM5Destaque() {
  return (
    <section
      aria-labelledby="destaque-macbook-m5"
      className="group relative isolate w-full overflow-hidden rounded-[2.5rem] border-2 border-[#E60012]/70 bg-[#06070b] shadow-2xl shadow-red-950/40 transition-colors duration-300 hover:border-[#E60012]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(230,0,18,0.20),transparent_42%)]"
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Foto do produto: em cima no celular, à direita no computador */}
        <div className="relative min-h-[230px] overflow-hidden bg-black sm:min-h-[340px] lg:order-last lg:min-h-[460px] lg:bg-[radial-gradient(ellipse_75%_62%_at_55%_46%,rgba(150,12,24,0.34),#000_74%)]">
          {/* No celular a foto preenche a faixa; no computador aparece inteira.
              O arquivo já tem as bordas transparentes, então some no fundo sem emenda. */}
          <Image
            src="/images/macbook-m5/macbook-pro-m5-destaque.webp"
            alt="MacBook Pro M5 seminovo à venda na Balão da Informática"
            fill
            sizes="(max-width: 1023px) 100vw, 55vw"
            className="object-cover object-center transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.03] lg:object-contain"
          />
          {/* Funde a foto com o painel, sem deixar emenda */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#06070b] to-transparent lg:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#06070b] to-transparent lg:block"
          />

          {/* Selo de seminovo: discreto, no canto da foto */}
          <div
            aria-hidden="true"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-100 backdrop-blur-sm sm:right-6 sm:top-6 sm:text-[11px]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E60012]" />
            Seminovo
          </div>
        </div>

        {/* Oferta */}
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10 xl:p-12">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E60012] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-md">
              <BadgeCheck size={14} aria-hidden="true" />
              Seminovo
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
              Destaque da loja
            </span>
          </div>

          <h2
            id="destaque-macbook-m5"
            className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-4xl xl:text-5xl"
          >
            MacBook Pro M5
          </h2>
          <p className="mt-2 text-lg font-bold text-slate-200 sm:text-xl">
            16GB de RAM · SSD de 512GB
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {condicoes.map(({ icon: Icon, texto }) => (
              <li
                key={texto}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-100 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-sm"
              >
                <Icon size={15} className="shrink-0 text-[#E60012]" aria-hidden="true" />
                {texto}
              </li>
            ))}
          </ul>

          {/* Preço cheio riscado + preço promocional (à vista) + preço no cartão */}
          <div className="mt-6 border-t border-slate-700/80 pt-5">
            <p className="text-sm font-bold text-slate-300 sm:text-base">
              Preço de mercado:{" "}
              <s className="text-lg font-black text-slate-200 decoration-[#E60012] decoration-2 sm:text-xl">
                {emReais(PRECO_DE_MERCADO)}
              </s>
            </p>

            <div className="mt-1.5 flex flex-wrap items-end gap-x-4 gap-y-2.5">
              <p className="whitespace-nowrap text-6xl font-black leading-none tracking-tight text-white sm:text-7xl">
                <span className="sr-only">Preço promocional à vista: </span>
                {emReais(PRECO_A_VISTA)}
              </p>
              <span
                aria-hidden="true"
                className="mb-1 rounded-full bg-[#E60012] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-white sm:mb-2"
              >
                À vista
              </span>
            </div>

            <p className="mt-3 text-base font-bold text-slate-100 sm:text-lg">
              ou <span className="font-black text-white">{emReais(PRECO_NO_CARTAO)}</span> em até{" "}
              {PARCELAS}x de {valorDaParcela} sem juros
            </p>
            <p className="mt-1.5 text-sm text-slate-300">
              À vista, cerca de R$ {economiaEmMil} mil abaixo do preço de mercado.
            </p>
          </div>

          {/* Garantia */}
          <div className="mt-5 flex items-start gap-3.5 border-t border-slate-700/80 pt-5">
            <ShieldCheck size={26} className="mt-0.5 shrink-0 text-[#E60012]" aria-hidden="true" />
            <div>
              <p className="text-base font-black text-white sm:text-lg">
                Garantia Apple + garantia Balão
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                O aparelho ainda está na garantia Apple. Quando ela terminar, a Balão completa
                1 ano com garantia própria da loja.
              </p>
            </div>
          </div>

          {/* O ::after estica o link: o bloco inteiro leva para a página do produto.
              Não pôr scale/transform neste link: isso encolheria a área clicável
              de volta para o botão bem na hora do clique. */}
          <Link
            href={PAGINA_DO_PRODUTO}
            className="mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#E60012] px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-colors after:absolute after:inset-0 after:content-[''] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70 group-hover:bg-red-700 sm:w-fit sm:px-9 sm:text-base"
          >
            Ver o MacBook Pro M5
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
