import type { Metadata, Viewport } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { Archivo, Lexend } from "next/font/google";
import {
  BadgeDollarSign,
  Bot,
  Boxes,
  Check,
  ClipboardList,
  Download,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  MonitorOff,
  PhoneCall,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Wrench,
} from "lucide-react";
import estilos from "./overclock.module.css";
import MonitorDaLoja from "./_componentes/MonitorDaLoja";
import Calculadora from "./_componentes/Calculadora";
import BarraCelular from "./_componentes/BarraCelular";
import Videos from "./_componentes/Videos";
import { BotaoDemonstracao, BotaoQuero, Secao } from "./_componentes/ui";
import {
  CASO_GOOGLE_ADS,
  FORMAS_DE_PAGAMENTO,
  INCLUIDO_EM_TODOS,
  LINK_DEMONSTRACAO,
} from "./_dados/oferta";
import {
  AREAS,
  CONTAS_DA_LOJA,
  CUSTOS_INFRA,
  CUSTO_EQUIPE_MAX,
  CUSTO_EQUIPE_MIN,
  DORES,
  FONTE_SALARIO,
  NUMEROS_PROJETO,
  PASSOS_INSTALACAO,
  PERGUNTAS,
  SALARIO_DEV_PLENO,
  TECNOLOGIAS,
} from "./_dados/conteudo";

// A página é toda estática: o botão do PDF aparece só se o arquivo existir na
// hora do build (public/overclock/overclock-apresentacao.pdf).
export const dynamic = "force-static";

const fonteTitulo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--fonte-oc-titulo",
  display: "swap",
});

const fonteTexto = Lexend({
  subsets: ["latin"],
  variable: "--fonte-oc-texto",
  display: "swap",
});

const URL_PAGINA = "https://www.balao.info/overclock";
const TITULO = "Overclock: o sistema que acelera sua loja de informática";
const DESCRICAO =
  "Sistema completo para loja de informática: loja virtual com catálogo da KaBuM ao vivo, Google sem pagar anúncio, CRM de WhatsApp, assistência técnica, PDV e marketing com IA. Roda nas contas da sua loja, sem mensalidade.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: URL_PAGINA },
  robots: { index: true, follow: true },
  keywords: [
    "sistema para loja de informática",
    "loja virtual para loja de informática",
    "CRM de WhatsApp",
    "sistema de ordem de serviço assistência técnica",
    "white label loja de informática",
    "Overclock",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_PAGINA,
    siteName: "Overclock",
    title: TITULO,
    description:
      "Loja virtual, WhatsApp da equipe, assistência técnica e marketing num sistema só. Feito e usado numa loja de informática de verdade.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description:
      "Loja virtual, WhatsApp da equipe, assistência técnica e marketing num sistema só. Feito e usado numa loja de informática de verdade.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1f25",
};

const ICONES_DORES = [BadgeDollarSign, MonitorOff, MessagesSquare, ClipboardList];

const ICONES_AREAS: Record<string, typeof Store> = {
  loja: ShoppingCart,
  seo: Search,
  marketing: Megaphone,
  whatsapp: MessagesSquare,
  ura: PhoneCall,
  gestao: Wrench,
  balcao: Store,
  painel: LayoutDashboard,
};

function reaisInteiros(n: number) {
  return `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
}

function arredondarMil(n: number) {
  return `R$ ${Math.round(n / 1000).toLocaleString("pt-BR")} mil`;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${URL_PAGINA}#produto`,
      name: "Overclock",
      description: DESCRICAO,
      url: URL_PAGINA,
      image: `${URL_PAGINA}/opengraph-image`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "pt-BR",
      brand: { "@type": "Brand", name: "Overclock" },
      publisher: {
        "@type": "Organization",
        name: "Balão da Informática Castelo",
        url: "https://www.balao.info",
      },
      offers: FORMAS_DE_PAGAMENTO.map((forma) => ({
        "@type": "Offer",
        name: `${forma.nome}: ${forma.destaque}`,
        description: forma.detalhe,
        price: forma.total.toFixed(2),
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        url: URL_PAGINA,
        seller: { "@type": "Organization", name: "Balão da Informática Castelo" },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${URL_PAGINA}#perguntas`,
      mainEntity: PERGUNTAS.map((p) => ({
        "@type": "Question",
        name: p.pergunta,
        acceptedAnswer: { "@type": "Answer", text: p.resposta },
      })),
    },
  ],
};

export default function PaginaOverclock() {
  const temPdf = existsSync(path.join(process.cwd(), "public", "overclock", "overclock-apresentacao.pdf"));
  const maiorBarra = CASO_GOOGLE_ADS.maiorMes;

  return (
    <div className={`${fonteTitulo.variable} ${fonteTexto.variable} ${estilos.raiz} pb-24 md:pb-0`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Topo */}
      <header className="relative overflow-hidden">
        <div className={`${estilos.trilhas} pointer-events-none absolute inset-0`} aria-hidden />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-5 sm:px-6">
          <a href="#inicio" className="flex items-center gap-2" aria-label="Overclock, início da página">
            <Gauge className="h-8 w-8 text-(--oc-laranja)" aria-hidden />
            <span className={`${estilos.titulo} text-2xl`}>Overclock</span>
          </a>
          <a
            href={LINK_DEMONSTRACAO}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-12 items-center rounded-lg border-2 border-(--oc-linha) px-4 text-base font-bold hover:border-(--oc-texto) sm:inline-flex"
          >
            Agendar demonstração
          </a>
        </div>

        <div
          id="inicio"
          className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-16 sm:px-6 md:pt-16 md:pb-24 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-14"
        >
          <div>
            <h1 className={`${estilos.titulo} text-[2.6rem] sm:text-[3.6rem] lg:text-[4.4rem]`}>
              O sistema que acelera sua loja de informática.
            </h1>
            <p className={`${estilos.texto} mt-6 text-xl leading-relaxed md:text-[1.4rem]`}>
              Loja virtual, WhatsApp da equipe, assistência técnica e marketing num sistema só. Criado e usado
              todo dia numa loja de verdade, a Balão da Informática, em Campinas-SP. Lá, o gasto com anúncio no
              Google caiu para zero.
            </p>
            <div id="oc-topo" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BotaoQuero className="w-full sm:w-auto" />
              <BotaoDemonstracao className="w-full sm:w-auto" />
            </div>
            <p className="mt-5 flex items-center gap-2 text-base text-(--oc-suave)">
              <KeyRound className="h-5 w-5 shrink-0 text-(--oc-verde)" aria-hidden />
              É seu, não é aluguel: roda nas contas da sua loja, sem mensalidade para nós.
            </p>
          </div>
          <MonitorDaLoja />
        </div>
      </header>

      <div>
        {/* O problema */}
        <Secao
          id="rotina"
          titulo="Você conhece essa rotina."
          intro={<p>Quem tem loja de informática passa por isso toda semana.</p>}
        >
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {DORES.map((dor, i) => {
              const Icone = ICONES_DORES[i];
              return (
                <li key={dor.titulo} className="flex gap-4">
                  <Icone className="mt-1 h-8 w-8 shrink-0 text-(--oc-laranja)" aria-hidden />
                  <div>
                    <h3 className="text-[1.4rem] font-bold leading-tight">{dor.titulo}</h3>
                    <p className="mt-1 text-(--oc-suave)">{dor.texto}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className={`${estilos.texto} mt-12 text-[1.4rem] font-bold leading-snug`}>
            O Overclock junta tudo isso num sistema só, com o nome, a logo e as cores da sua loja.
          </p>
        </Secao>

        {/* O caso real */}
        <Secao
          id="caso-real"
          fundo="painel"
          titulo="O caso real: a loja que zerou o Google Ads."
          intro={
            <p>
              Os números abaixo são das faturas do Google Ads da Balão da Informática. Desde{" "}
              {CASO_GOOGLE_ADS.semAnuncioDesde}, com o Overclock no ar, a loja parou de pagar anúncio. O cliente
              continua achando a loja no Google, de graça, e falando com ela pelo WhatsApp.
            </p>
          }
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <figure>
              <figcaption className="text-lg font-bold">Gasto com Google Ads por mês</figcaption>
              <dl className="mt-6 space-y-6">
                {[
                  {
                    rotulo: `O mês mais caro (${CASO_GOOGLE_ADS.maiorMesRotulo})`,
                    valor: CASO_GOOGLE_ADS.maiorMes,
                    texto: reaisInteiros(CASO_GOOGLE_ADS.maiorMes),
                    cor: "bg-(--oc-laranja)",
                  },
                  {
                    rotulo: "Média de abr/2025 a fev/2026",
                    valor: CASO_GOOGLE_ADS.mediaMesPeriodo,
                    texto: "cerca de R$ 3,1 mil",
                    cor: "bg-(--oc-amarelo)",
                  },
                  {
                    rotulo: `Desde ${CASO_GOOGLE_ADS.semAnuncioDesde}`,
                    valor: 0,
                    texto: "R$ 0",
                    cor: "bg-(--oc-verde)",
                  },
                ].map((barra) => (
                  <div key={barra.rotulo}>
                    <dt className="flex flex-wrap items-baseline justify-between gap-x-4 text-base text-(--oc-suave)">
                      <span>{barra.rotulo}</span>
                      <span className={`${estilos.numero} text-2xl text-(--oc-texto)`}>{barra.texto}</span>
                    </dt>
                    <dd className="mt-2 h-5 rounded-md bg-(--oc-fundo)">
                      <div
                        className={`h-full rounded-md ${barra.cor}`}
                        style={{ width: barra.valor === 0 ? "6px" : `${(barra.valor / maiorBarra) * 100}%` }}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </figure>

            <ul className="space-y-5 border-l-4 border-(--oc-laranja) pl-6">
              <li>
                <strong className={`${estilos.numero} block text-3xl`}>R$ 169 por dia</strong>
                <span className="text-(--oc-suave)">foi a média em out/2025, o mês de R$ 5.231.</span>
              </li>
              <li>
                <strong className={`${estilos.numero} block text-3xl`}>R$ 104 por dia</strong>
                <span className="text-(--oc-suave)">foi a média de abr/2025 a fev/2026.</span>
              </li>
              <li>
                <strong className={`${estilos.numero} block text-3xl`}>Mais de R$ 52 mil</strong>
                <span className="text-(--oc-suave)">investidos em Google Ads ao longo dos anos.</span>
              </li>
              <li>
                <strong className={`${estilos.numero} block text-3xl text-(--oc-verde)`}>Até R$ 169 por dia</strong>
                <span className="text-(--oc-suave)">que deixaram de sair do caixa. Mais de R$ 3 mil por mês.</span>
              </li>
            </ul>
          </div>
          <p className="mt-10 text-base text-(--oc-suave)">
            Resultados da loja Balão da Informática; cada loja tem seu resultado.
          </p>
        </Secao>

        {/* Como funciona */}
        <Secao
          id="como-funciona"
          titulo="Instalação em uma tarde, com a IA do lado."
          intro={
            <p>
              A tela de instalação tem 15 passos. Em cada um, ela mostra onde conseguir o que precisa, o que
              clicar, tem o botão “Pergunte à IA” e confere na hora se está certo. E a gente faz junto com você.
            </p>
          }
        >
          <ol className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {PASSOS_INSTALACAO.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4 border-t border-(--oc-linha) py-5">
                <span
                  className={`${estilos.numero} w-10 shrink-0 text-2xl ${i === PASSOS_INSTALACAO.length - 1 ? "text-(--oc-verde)" : "text-(--oc-laranja)"}`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold leading-tight">{passo.titulo}</h3>
                  <p className="mt-1 text-base text-(--oc-suave)">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex gap-4 rounded-2xl border border-(--oc-linha) bg-(--oc-painel) p-6">
            <Bot className="mt-1 h-8 w-8 shrink-0 text-(--oc-verde)" aria-hidden />
            <div>
              <h3 className="text-xl font-bold">Assistente de Instalação, se você quiser</h3>
              <p className={`${estilos.texto} mt-2 text-(--oc-suave)`}>
                Um programa para Windows, Mac ou Linux que abre cada site e mostra onde clicar para criar as
                contas. Ele para e espera você confirmar cada passo. Nunca digita senha e nunca paga nada.
              </p>
            </div>
          </div>
        </Secao>

        {/* Funcionalidades */}
        <Secao
          id="funcionalidades"
          fundo="painel"
          titulo="Tudo o que a loja precisa, num sistema só."
          intro={<p>Cada parte pode ser ligada ou desligada. Você usa o que fizer sentido para a sua loja.</p>}
        >
          <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
            {AREAS.map((area) => {
              const Icone = ICONES_AREAS[area.id] ?? Boxes;
              return (
                <article key={area.id} className="border-t-2 border-(--oc-laranja) pt-5">
                  <div className="flex items-center gap-3">
                    <Icone className="h-7 w-7 shrink-0 text-(--oc-laranja)" aria-hidden />
                    <h3 className="text-[1.45rem] font-bold leading-tight">
                      {area.titulo}
                      {area.beta ? (
                        <span className="ml-3 rounded-md border border-(--oc-amarelo) px-2 py-0.5 align-middle text-sm font-bold text-(--oc-amarelo)">
                          beta
                        </span>
                      ) : null}
                    </h3>
                  </div>
                  <p className="mt-2 text-(--oc-suave)">{area.resumo}</p>
                  <ul className="mt-4 space-y-2">
                    {area.itens.map((item) => (
                      <li key={item} className="flex gap-3 text-[1.05rem] leading-snug">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-(--oc-verde)" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </Secao>

        {/* KaBuM */}
        <Secao
          id="kabum"
          titulo="KaBuM, fornecedor oficial do Overclock."
          intro={
            <p>
              Sua loja já nasce com catálogo. O Overclock copia os produtos vendidos pela KaBuM com foto, ficha
              técnica e preço ao vivo, atualizado a cada 10 minutos com a VPS. Você só define a sua margem.
            </p>
          }
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="rounded-2xl border border-(--oc-linha) bg-(--oc-painel) p-6 sm:p-8">
              <p className="text-lg font-bold">Como sai o preço na sua loja</p>
              <dl className="mt-5 text-lg">
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt>Preço na KaBuM</dt>
                  <dd className={`${estilos.numero} text-xl`}>R$ 1.000,00</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2">
                  <dt>
                    <span className="mr-2 font-bold text-(--oc-laranja)" aria-hidden>
                      +
                    </span>
                    Sua margem de 12%
                  </dt>
                  <dd className={`${estilos.numero} text-xl`}>R$ 120,00</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-4 border-t-2 border-(--oc-texto) pt-3">
                  <dt className="font-bold">
                    <span className="mr-2 text-(--oc-verde)" aria-hidden>
                      =
                    </span>
                    Preço na sua loja
                  </dt>
                  <dd className={`${estilos.numero} text-[1.7rem] text-(--oc-verde)`}>R$ 1.120,00</dd>
                </div>
              </dl>
              <p className="mt-5 text-base text-(--oc-suave)">
                Exemplo com números redondos. A margem é você quem define, por departamento.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "21 departamentos já ligados na instalação",
                "Preço segue a KaBuM sozinho, a cada 10 minutos",
                "Produto que some da KaBuM fica indisponível sozinho na sua loja",
                "Queda de preço fica segurada para você conferir antes de valer",
                "Produtos bloqueados e margem por categoria ou faixa de preço",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 h-6 w-6 shrink-0 text-(--oc-verde)" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
              <li className="border-t border-(--oc-linha) pt-4 text-(--oc-suave)">
                Prefere outra fonte? Os produtos também entram por planilha Excel ou CSV, pelo Bling (ERP) ou por
                fornecedor na Kyte.
              </li>
            </ul>
          </div>
        </Secao>

        {/* Ficha técnica + tecnologias + valor */}
        <Secao
          id="ficha-tecnica"
          fundo="painel"
          titulo="A ficha técnica do Overclock."
          intro={
            <p>
              No ar na loja desde março de 2026, com o código começado em janeiro. São cerca de 9 meses de
              desenvolvimento e de uso real, com centenas de versões publicadas: 467 alterações só entre agosto e
              outubro de 2026. Desenvolvido e testado numa loja de verdade.
            </p>
          }
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <dl className="border-t border-(--oc-linha)">
                {NUMEROS_PROJETO.map((n) => (
                  <div
                    key={n.rotulo}
                    className="grid grid-cols-[minmax(6.5rem,auto)_1fr] items-baseline gap-4 border-b border-(--oc-linha) py-3 sm:grid-cols-[9rem_1fr]"
                  >
                    <dt className={`${estilos.numero} text-[1.7rem] text-(--oc-laranja)`}>{n.valor}</dt>
                    <dd>{n.rotulo}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-10 text-xl font-bold">Feito com</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {TECNOLOGIAS.map((t) => (
                  <li
                    key={t}
                    className="rounded-md border border-(--oc-linha) bg-(--oc-fundo) px-3 py-1.5 text-base"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="rounded-2xl border border-(--oc-linha) bg-(--oc-fundo) p-6 sm:p-8">
              <h3 className="text-xl font-bold">Quanto custaria fazer do zero?</h3>
              <p className="mt-3">
                Uma estimativa: um sistema desse porte levaria uma equipe de <strong>3 a 4 desenvolvedores</strong>{" "}
                por <strong>9 a 12 meses</strong>.
              </p>
              <p className="mt-3">
                Só em salário, com a média de {reaisInteiros(SALARIO_DEV_PLENO)} por mês de um desenvolvedor
                pleno, dá de{" "}
                <strong className={`${estilos.numero} whitespace-nowrap text-(--oc-laranja)`}>{arredondarMil(CUSTO_EQUIPE_MIN)}</strong>{" "}
                a{" "}
                <strong className={`${estilos.numero} whitespace-nowrap text-(--oc-laranja)`}>{arredondarMil(CUSTO_EQUIPE_MAX)}</strong>
                , sem contar encargos, design, servidores e os testes numa loja de verdade.
              </p>
              <p className="mt-3 text-base text-(--oc-suave)">
                E ele ocupa o lugar de várias mensalidades: loja virtual, CRM de WhatsApp, agendador de redes
                sociais, sistema de ordem de serviço e caixa.
              </p>
              <p className="mt-5 text-sm text-(--oc-suave)">
                Estimativa, não orçamento. Salário médio de desenvolvedor pleno no Brasil segundo o{" "}
                <a href={FONTE_SALARIO.url} target="_blank" rel="noopener noreferrer" className="underline">
                  {FONTE_SALARIO.nome}
                </a>
                , consultado em {FONTE_SALARIO.data}.
              </p>
            </aside>
          </div>
        </Secao>

        {/* É seu */}
        <Secao
          id="e-seu"
          titulo="É seu, não é aluguel."
          intro={
            <p>
              Você recebe o código e tudo roda nas contas da sua loja, no nome dela. Não tem mensalidade para
              nós. Os dados dos seus clientes ficam com você.
            </p>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CONTAS_DA_LOJA.map((c) => (
              <li key={c.conta} className="rounded-xl border border-(--oc-linha) p-5">
                <ShieldCheck className="h-7 w-7 text-(--oc-verde)" aria-hidden />
                <p className="mt-3 text-lg font-bold">{c.conta}</p>
                <p className="text-base text-(--oc-suave)">Guarda {c.guarda}.</p>
              </li>
            ))}
          </ul>
        </Secao>

        {/* Quanto custa manter */}
        <Secao
          id="custo-de-manter"
          fundo="painel"
          titulo="Quanto custa manter no ar."
          intro={
            <p>
              Você paga direto para cada fornecedor, sem passar pela gente. Dá para começar com custo baixo: Vercel
              Pro, domínio e o banco no plano grátis saem por cerca de US$ 20 por mês e R$ 40 por ano. Com o
              WhatsApp na VPS, some a partir de R$ 29,99 por mês.
            </p>
          }
        >
          <div className="overflow-hidden rounded-2xl border border-(--oc-linha)">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Custos mensais de infraestrutura, pagos pela loja</caption>
              <thead className="hidden bg-(--oc-painel-2) md:table-header-group">
                <tr>
                  <th scope="col" className="px-5 py-3 text-base">
                    Serviço
                  </th>
                  <th scope="col" className="px-5 py-3 text-base">
                    Para quê
                  </th>
                  <th scope="col" className="px-5 py-3 text-base">
                    Preço
                  </th>
                </tr>
              </thead>
              <tbody>
                {CUSTOS_INFRA.map((c) => (
                  <tr
                    key={c.servico}
                    className="block border-t border-(--oc-linha) bg-(--oc-fundo) px-5 py-4 first:border-t-0 md:table-row md:p-0"
                  >
                    <th scope="row" className="block font-bold md:table-cell md:px-5 md:py-4 md:align-top">
                      {c.servico}
                      {c.opcional ? (
                        <span className="ml-2 text-sm font-normal text-(--oc-suave)">(opcional)</span>
                      ) : null}
                    </th>
                    <td className="block text-base text-(--oc-suave) md:table-cell md:px-5 md:py-4 md:align-top">
                      {c.paraQue}
                    </td>
                    <td className="mt-2 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="font-bold text-(--oc-verde)">{c.preco}</span>
                      {c.obs ? <span className="mt-1 block text-sm text-(--oc-suave)">{c.obs}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-(--oc-suave)">
            Preços nas páginas oficiais de cada fornecedor, consultados em out/2026. Podem mudar; confira antes
            de contratar.
          </p>
        </Secao>

        {/* Preços */}
        <Secao
          id="precos"
          titulo="Preço do Overclock."
          intro={<p>Pagamento único. Escolha a forma que cabe no caixa da loja.</p>}
        >
          <ul className="grid gap-5 md:grid-cols-3">
            {FORMAS_DE_PAGAMENTO.map((forma) => {
              const principal = forma.id === "avista";
              return (
                <li
                  key={forma.id}
                  className={`flex flex-col rounded-2xl p-6 sm:p-7 ${
                    principal
                      ? "border-2 border-(--oc-laranja) bg-(--oc-painel)"
                      : "border border-(--oc-linha) bg-(--oc-painel)"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold">{forma.nome}</h3>
                    {principal ? (
                      <span className="rounded-md bg-(--oc-laranja) px-2.5 py-1 text-sm font-bold text-(--oc-fundo)">
                        Menor total
                      </span>
                    ) : forma.observacao ? (
                      <span className="rounded-md border border-(--oc-linha) px-2.5 py-1 text-sm text-(--oc-suave)">
                        {forma.observacao}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-5 h-7 text-lg font-bold text-(--oc-suave)">{forma.prefixo ?? "Pagamento único"}</p>
                  <p className={`${estilos.numero} text-[2.2rem] leading-tight whitespace-nowrap lg:text-[2.4rem]`}>
                    {forma.valor}
                  </p>
                  <p className="mt-2 text-base text-(--oc-suave)">{forma.detalhe}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
            <div>
              <h3 className="text-xl font-bold">Incluído em todas as formas</h3>
              <ul className="mt-4 space-y-3">
                {INCLUIDO_EM_TODOS.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-1 h-6 w-6 shrink-0 text-(--oc-verde)" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <BotaoQuero className="w-full" />
              <p className="text-base text-(--oc-suave)">
                A infraestrutura (tabela acima) é paga pela loja, direto aos fornecedores.
              </p>
            </div>
          </div>
        </Secao>

        {/* Calculadora */}
        <Secao
          id="calculadora"
          fundo="painel"
          titulo="Faça a conta com o seu anúncio."
          intro={
            <p>
              Digite quanto a sua loja gasta com anúncio por mês. A conta mostra em quanto tempo o Overclock se
              paga em cada forma de pagamento, se esse dinheiro deixar de ir para o anúncio.
            </p>
          }
        >
          <Calculadora />
        </Secao>

        {/* Vídeos e material */}
        <Secao id="videos" titulo="Veja funcionando.">
          <Videos />
          {temPdf ? (
            <div className="mt-10 flex flex-col gap-4 border-t border-(--oc-linha) pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg">Quer mostrar para o seu sócio? Leve a apresentação em PDF.</p>
              <a
                href="/overclock/overclock-apresentacao.pdf"
                download
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 border-(--oc-texto) px-6 text-lg font-bold hover:bg-(--oc-texto) hover:text-(--oc-fundo)"
              >
                <Download className="h-6 w-6" aria-hidden />
                Baixar apresentação em PDF
              </a>
            </div>
          ) : null}
        </Secao>

        {/* Perguntas */}
        <Secao id="perguntas" fundo="painel" titulo="Perguntas frequentes.">
          <div className={`${estilos.perguntas} max-w-4xl divide-y divide-(--oc-linha) border-y border-(--oc-linha)`}>
            {PERGUNTAS.map((p) => (
              <details key={p.pergunta} className="group">
                <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4 text-[1.3rem] font-bold leading-snug">
                  {p.pergunta}
                  <Plus className={`${estilos.seta} h-7 w-7 shrink-0 text-(--oc-laranja)`} aria-hidden />
                </summary>
                <p className={`${estilos.texto} pb-6 text-(--oc-suave)`}>{p.resposta}</p>
              </details>
            ))}
          </div>
        </Secao>

        {/* Chamada final */}
        <section
          id="oc-chamada-final"
          aria-labelledby="oc-chamada-final-titulo"
          className="border-t border-(--oc-linha) px-4 py-20 sm:px-6 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className={`${estilos.escalaTermica} h-1.5 w-40 rounded-full`} aria-hidden />
            <h2
              id="oc-chamada-final-titulo"
              className={`${estilos.titulo} mt-8 max-w-4xl text-[2.3rem] sm:text-[3rem] lg:text-[3.6rem]`}
            >
              Coloque a sua loja para rodar no Overclock.
            </h2>
            <p className={`${estilos.texto} mt-6 text-xl`}>
              Fale com quem usa o sistema todo dia na própria loja. A gente mostra funcionando, tira as dúvidas e
              instala junto com você.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BotaoQuero className="w-full sm:w-auto" />
              <BotaoDemonstracao className="w-full sm:w-auto" />
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-(--oc-linha) px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-base text-(--oc-suave) sm:flex-row sm:items-center sm:justify-between">
          <p>
            Overclock é um produto de Balão da Informática Castelo — CNPJ 34.397.947/0001-08 — Campinas-SP
          </p>
          <a href="https://www.balao.info" className="underline hover:text-(--oc-texto)">
            balao.info
          </a>
        </div>
      </footer>

      <BarraCelular />
    </div>
  );
}
