import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Header";
import CardProduto, { CONDICOES } from "@/components/CardProduto";
import JsonLd, { generateHomeAiAndGoogleSchema } from "@/components/JsonLd";
import { getCachedProducts } from "@/lib/cache";
import { SITE_CONFIG } from "@/lib/config";
import type { Product } from "@/lib/utils";
import {
  MessageCircle, MapPin, Clock, ShieldCheck, Wrench, HardDrive, Apple,
  Smartphone, Cpu, RefreshCw, ArrowRight, Star, Truck, CreditCard,
  Monitor, Laptop, Printer, Keyboard, Gamepad2, Package,
} from "lucide-react";

export const revalidate = 60;

/* Prova social confirmada no perfil do Google em 13/09/2026.
 * Null = a página omite a afirmação em vez de publicar número não conferido. */
const PROVA_SOCIAL = {
  googleNota: 4.8 as number | null,
  googleAvaliacoes: 839 as number | null,
  anosDeMercado: 25,
};

/* Avaliações públicas do Google, transcritas literalmente. */
const AVALIACOES = [
  { nome: "José Paulo Olímpio", quando: "3 meses atrás", texto: "Levei minha impressora toda falhada, até achei que não tinha conserto. Porém voltou consertada e funcionando perfeitamente, paguei apenas a mão de obra. Recomendo." },
  { nome: "Caroline Bianca", quando: "3 meses atrás", texto: "Resolveram em 1 hora meu problema! Precisei de uma nova fonte de computador, em 1 horinha recebi. Excelente atendimento." },
  { nome: "Winderson Oliveira", quando: "3 meses atrás", texto: "Precisei de um adaptador de rede com certa urgência e fui muito bem atendido pela equipe. Foram atenciosos, prestativos e ainda fizeram a entrega diretamente no meu trabalho." },
  { nome: "Gilberto Filho", quando: "3 meses atrás", texto: "Loja top, preços justos, atendimento ótimo, Thiago e sua equipe são muito prestativos, super recomendo." },
];

/* Fotos reais da loja, sem pessoas em cena. */
const FOTOS_LOJA = [
  { src: "/images/loja/fachada.jpg", alt: "Fachada da Balão da Informática na Av. Anchieta, 789, no Cambuí" },
  { src: "/images/loja/salao.jpg", alt: "Salão da loja com prateleiras e corredor central" },
  { src: "/images/loja/estoque-notebooks.jpg", alt: "Prateleiras com notebooks e periféricos em exposição" },
  { src: "/images/loja/monitores-acessorios.jpg", alt: "Monitores em exposição e parede de acessórios" },
];

const DEPARTAMENTOS = [
  { nome: "PC Gamer", href: "/pcgamer", icone: Gamepad2 },
  { nome: "Notebooks", href: "/notebooks", icone: Laptop },
  { nome: "Monitores", href: "/categoria/monitores", icone: Monitor },
  { nome: "Hardware", href: "/categoria/hardware", icone: Cpu },
  { nome: "Periféricos", href: "/categoria/perifericos", icone: Keyboard },
  { nome: "Impressão", href: "/categoria/impressao", icone: Printer },
  { nome: "Seminovos", href: "/seminovos", icone: RefreshCw },
  { nome: "Monte seu PC", href: "/monteseupc", icone: Package },
];

const PRATELEIRAS = [
  { titulo: "Computadores e PC Gamer", cats: ["Computadores"], href: "/pcgamer" },
  { titulo: "Notebooks", cats: ["Notebooks"], href: "/notebooks" },
  { titulo: "Monitores", cats: ["Monitores"], href: "/categoria/monitores" },
  { titulo: "Placas de vídeo", cats: ["Hardware/Placas de Vídeo"], href: "/categoria/hardware-placas-de-video" },
  { titulo: "Memória, fonte, placa-mãe e gabinete", cats: ["Hardware/Memórias RAM","Hardware/Fontes","Hardware/Placas Mãe","Hardware/Processadores","Hardware/Water Coolers","Hardware/Gabinetes","Hardware/SSDs e NVMe","Hardware"], href: "/categoria/hardware" },
  { titulo: "Periféricos, impressão e escritório", cats: ["Periféricos","Impressão","Acessórios","Escritório/Cadeiras Gamer"], href: "/categoria/perifericos" },
];

const SERVICOS = [
  { icone: Apple, titulo: "Reparo Apple", href: "/reparoapple", msg: "Olá! Preciso de reparo em um aparelho Apple." },
  { icone: HardDrive, titulo: "Recuperação de dados", href: "/recuperacaodados", msg: "Olá! Preciso recuperar dados de um disco." },
  { icone: Smartphone, titulo: "Troca de tela e bateria", href: "/telaiphone", msg: "Olá! Quero orçamento de troca de tela." },
  { icone: Cpu, titulo: "Montagem e upgrade", href: "/montagempc", msg: "Olá! Quero montar um PC sob medida." },
  { icone: Wrench, titulo: "Manutenção", href: "/manutencao", msg: "Olá! Meu computador está com problema." },
  { icone: RefreshCw, titulo: "Consignação", href: "/consignacao", msg: "Olá! Quero saber sobre consignação." },
];

const WPP = SITE_CONFIG.whatsapp.number;
const wpp = (msg: string) => `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;

export const metadata: Metadata = {
  title: "Balão da Informática | Loja de informática em Campinas — PC Gamer, notebooks e assistência técnica",
  description:
    "Loja física no Cambuí, em Campinas. PC gamer, notebooks, monitores, hardware e periféricos com 5% de desconto no PIX e 12x sem juros. Assistência técnica no mesmo lugar e atendimento humano no WhatsApp.",
  alternates: { canonical: "https://www.balao.info" },
  openGraph: {
    title: "Balão da Informática | Loja de informática em Campinas",
    description:
      "Você vê o equipamento ligado antes de pagar. Loja física no Cambuí, assistência técnica e atendimento humano no WhatsApp.",
    url: "https://www.balao.info",
    type: "website",
  },
};

export default async function Home() {
  let catalogo: Product[] = [];
  try {
    catalogo = await getCachedProducts();
  } catch {
    catalogo = [];
  }

  const prateleiras = PRATELEIRAS.map((p) => ({
    ...p,
    itens: catalogo.filter((x) => p.cats.includes(String(x.category || ""))).slice(0, 8),
  })).filter((p) => p.itens.length > 0);

  const destaques = catalogo.slice(0, 4);
  const temProvaGoogle =
    PROVA_SOCIAL.googleNota !== null && PROVA_SOCIAL.googleAvaliacoes !== null;

  return (
    <div data-home-theme="light" className="bg-neutral-50">
      <JsonLd data={generateHomeAiAndGoogleSchema()} />
      <Header />

      {/* ===================== BARRA DE DEPARTAMENTOS ==================== */}
      <nav aria-label="Departamentos" className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {DEPARTAMENTOS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-[#E60012]/5 hover:text-[#E60012]"
            >
              <d.icone size={16} /> {d.nome}
            </Link>
          ))}
        </div>
      </nav>

      {/* ============================= HERO ============================= */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[2fr_1fr]">
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl lg:min-h-[380px]">
          <Image
            src="/images/loja/pc-ligado.jpg"
            alt="Gabinete gamer montado e ligado na bancada da loja"
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 780px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative flex h-full flex-col justify-center p-7 md:p-10">
            <span className="w-fit rounded-full bg-[#E60012] px-3 py-1 text-xs font-bold text-white">
              Loja física no Cambuí
            </span>
            <h1 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Você vê o computador ligado antes de pagar
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/80 md:text-base">
              {CONDICOES.descontoPixPercentual}% de desconto no PIX,{" "}
              {CONDICOES.parcelas}x sem juros e retirada no mesmo dia em Campinas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={wpp(SITE_CONFIG.whatsapp.messageDefault)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
              >
                <MessageCircle size={18} /> Falar com a loja
              </a>
              <Link
                href="/pcgamer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-neutral-900 transition hover:bg-neutral-100"
              >
                Ver PCs montados <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/monteseupc"
            className="group relative overflow-hidden rounded-2xl bg-neutral-900 p-6 text-white transition hover:brightness-110"
          >
            <Package size={26} className="text-[#E60012]" />
            <h2 className="mt-3 text-lg font-bold">Monte seu PC</h2>
            <p className="mt-1 text-sm text-white/70">
              Escolha peça por peça. A gente monta, testa e entrega funcionando.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#E60012]">
              Começar <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/manutencao"
            className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-[#E60012]/40 hover:shadow-lg"
          >
            <Wrench size={26} className="text-[#E60012]" />
            <h2 className="mt-3 text-lg font-bold text-neutral-900">Assistência técnica</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Conserto, upgrade e recuperação de dados na bancada da loja.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#E60012]">
              Ver serviços <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* ======================= BARRA DE BENEFÍCIOS ===================== */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 md:grid-cols-4">
          {[
            { i: CreditCard, t: `${CONDICOES.descontoPixPercentual}% no PIX`, d: `ou ${CONDICOES.parcelas}x sem juros` },
            { i: Truck, t: "Retirada hoje", d: "e entrega na região" },
            { i: Wrench, t: "Assistência própria", d: "conserto no mesmo lugar" },
            { i: ShieldCheck, t: "Nota fiscal", d: "em compra e serviço" },
          ].map((b) => (
            <div key={b.t} className="flex items-center gap-3">
              <b.i size={22} className="shrink-0 text-[#E60012]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-neutral-900">{b.t}</p>
                <p className="truncate text-xs text-neutral-500">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== DESTAQUES =========================== */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-2xl bg-[#E60012] p-1">
            <div className="rounded-[0.9rem] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold text-neutral-900">
                  Destaques da semana
                </h2>
                <Link href="/vitrine" className="text-sm font-bold text-[#E60012] hover:underline">
                  Ver a vitrine
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {destaques.map((p) => <CardProduto key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================== PRATELEIRAS ========================= */}
      {prateleiras.map((p) => (
        <section key={p.titulo} className="mx-auto max-w-7xl px-4 py-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <h2 className="text-xl font-extrabold text-neutral-900">{p.titulo}</h2>
              <Link href={p.href} className="inline-flex items-center gap-1 text-sm font-bold text-[#E60012] hover:underline">
                Ver todos <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {p.itens.map((prod) => <CardProduto key={prod.id} product={prod} />)}
            </div>
          </div>
        </section>
      ))}

      {/* ===================== FAIXA DE SERVIÇOS ======================== */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl bg-neutral-900 p-6 md:p-9">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            O que a loja da esquina faz e o site grande não faz
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Serviço técnico é o motivo de existir uma loja física. Tudo abaixo é
            feito aqui no Cambuí.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s) => (
              <div key={s.titulo} className="flex items-center gap-3 rounded-xl bg-white/5 p-4 transition hover:bg-white/10">
                <s.icone size={20} className="shrink-0 text-[#E60012]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">{s.titulo}</p>
                  <div className="mt-1 flex gap-3 text-xs">
                    <a href={wpp(s.msg)} className="font-semibold text-[#25D366] hover:underline">WhatsApp</a>
                    <Link href={s.href} className="text-white/50 hover:text-white">Detalhes</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= AVALIAÇÕES =========================== */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-neutral-900">O que os clientes escreveram</h2>
          {temProvaGoogle && (
            <p className="text-sm text-neutral-500">
              <span className="font-bold text-neutral-900">
                {String(PROVA_SOCIAL.googleNota).replace(".", ",")}
              </span>{" "}
              de 5 em {PROVA_SOCIAL.googleAvaliacoes} avaliações no Google
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {AVALIACOES.map((a) => (
            <figure key={a.nome} className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex gap-0.5 text-[#E60012]" aria-label="5 de 5 estrelas">
                {[0,1,2,3,4].map((i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
              </div>
              <blockquote className="mt-3 text-[13px] leading-relaxed text-neutral-700">“{a.texto}”</blockquote>
              <figcaption className="mt-3 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-900">{a.nome}</span> · {a.quando} · Google
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ========================= LOJA FÍSICA ========================== */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 md:text-3xl">Passa aqui</h2>
            <p className="mt-2 text-neutral-600">
              Loja de 300 m² no Cambuí. Tem bancada, tem estoque e tem gente pra explicar sem pressa.
            </p>
            <ul className="mt-7 space-y-4">
              <li className="flex gap-3">
                <MapPin size={19} className="mt-0.5 shrink-0 text-[#E60012]" />
                <div>
                  <p className="font-semibold text-neutral-900">{SITE_CONFIG.address}</p>
                  <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#E60012] hover:underline">
                    Abrir no Google Maps
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock size={19} className="mt-0.5 shrink-0 text-[#E60012]" />
                <p className="text-neutral-800">{SITE_CONFIG.openingHoursDisplay}</p>
              </li>
              <li className="flex gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#E60012]" />
                <p className="text-neutral-800">
                  CNPJ {SITE_CONFIG.cnpj} — {PROVA_SOCIAL.anosDeMercado} anos em Campinas.
                </p>
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FOTOS_LOJA.map((f) => (
              <div key={f.src} className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={f.src} alt={f.alt} fill unoptimized sizes="(max-width:768px) 50vw, 280px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= CTA ============================== */}
      <section className="bg-[#E60012]">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            Não achou? Pergunta no WhatsApp.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
            O site mostra uma seleção — boa parte do estoque não está publicada.
            Orçamento de serviço e consulta de estoque no mesmo número.
          </p>
          <a
            href={wpp(SITE_CONFIG.whatsapp.messageDefault)}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-[#E60012] shadow-lg transition hover:bg-neutral-50"
          >
            <MessageCircle size={19} /> {SITE_CONFIG.whatsapp.display}
          </a>
        </div>
      </section>
    </div>
  );
}
