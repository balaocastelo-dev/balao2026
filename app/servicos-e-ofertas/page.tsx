// ============================================================
// /servicos-e-ofertas — página de captação (refeita em 12/10/2026).
//
// Pedido do Thiago: "um ímã de leads", bonita, rápida, com produtos que
// impressionam (com foto), bem preenchida e fácil de achar no Google e nas IAs.
//
// Como a página capta:
//  1. No topo, "do que você precisa?" em botões que abrem o WhatsApp da loja
//     já com o assunto, e um formulário de 3 campos (abre o WhatsApp e avisa
//     a loja por e-mail — ver app/api/leads/servicos).
//  2. Produtos de verdade (regras das vitrines da home: foto, categoria certa,
//     preço mínimo) e a queda de preço da semana, cada prateleira com um
//     gancho para o serviço.
//  3. Serviços com foto e botão de orçamento, passo a passo, diferenciais,
//     perguntas frequentes e onde atendemos — tudo com dados estruturados.
//
// Todo texto que afirma algo sobre a loja está em lib/servicos-e-ofertas/conteudo.ts.
// ============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Star,
  Store,
  Wrench,
} from "lucide-react";

import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import HomeQuedaDePreco from "@/components/home/HomeQuedaDePreco";
import FormularioDeOrcamento from "@/components/servicos-e-ofertas/FormularioDeOrcamento";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateOrganizationSchema,
} from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/config";
import { getCachedProducts, getCachedQuedasDePreco } from "@/lib/cache";
import { produtosEmQueda } from "@/lib/precos/queda";
import { getProductHref, parsePriceToNumber, type Product } from "@/lib/utils";
import {
  BAIRROS,
  CIDADES,
  DIFERENCIAIS,
  NECESSIDADES,
  PASSOS,
  PERGUNTAS,
  SERVICOS,
  URL_DA_PAGINA,
  linkDoWhatsApp,
} from "@/lib/servicos-e-ofertas/conteudo";
import { GANCHO_DA_PRATELEIRA, prateleirasDaPagina, produtosMostrados } from "@/lib/servicos-e-ofertas/vitrines";

// Produtos e preços vêm do cache do catálogo; a página se refaz a cada 5 min.
export const revalidate = 300;

const TITULO = "Assistência Técnica e Ofertas de Informática em Campinas (Cambuí)";
const DESCRICAO =
  "Conserto de notebook, PC, iPhone e MacBook, montagem de PC gamer, recuperação de dados e ofertas com 10% no Pix ou 10x sem juros. Loja física no Cambuí, Campinas. Orçamento pelo WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  keywords: [
    "assistência técnica informática Campinas",
    "conserto de notebook Campinas",
    "troca de tela iPhone Campinas",
    "assistência Apple Campinas",
    "montagem de PC gamer Campinas",
    "recuperação de dados Campinas",
    "conserto de PS5 Campinas",
    "loja de informática Cambuí",
    "ofertas de informática Campinas",
    "PC gamer Campinas",
    "notebook em promoção Campinas",
    "upgrade de SSD e memória Campinas",
  ],
  alternates: { canonical: URL_DA_PAGINA },
  openGraph: {
    title: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    url: URL_DA_PAGINA,
    type: "website",
    locale: "pt_BR",
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/servicos-e-ofertas/og.jpg", width: 1200, height: 630, alt: "Bancada de montagem e assistência técnica da Balão da Informática em Campinas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITULO} | Balão da Informática`,
    description: DESCRICAO,
    images: ["/images/servicos-e-ofertas/og.jpg"],
  },
};

async function carregar(): Promise<{ produtos: Product[]; quedas: Product[] }> {
  const [produtos, quedas] = await Promise.all([
    getCachedProducts().catch(() => [] as Product[]),
    getCachedQuedasDePreco().catch(() => [] as Product[]),
  ]);
  return { produtos, quedas };
}

function schemaDaPagina(mostrados: Product[]) {
  const servicos = SERVICOS.map((s) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: s.titulo,
      description: `${s.resumo} ${s.itens.join(". ")}.`,
      url: `https://www.balao.info${s.href}`,
      areaServed: CIDADES.map((c) => ({ "@type": "City", name: c })),
      provider: { "@id": "https://www.balao.info/#organization" },
    },
  }));

  const produtos = mostrados.map((p, i) => {
    const preco = parsePriceToNumber(p.price);
    return {
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        image: p.image,
        url: `https://www.balao.info${getProductHref(p)}`,
        ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
        offers: {
          "@type": "Offer",
          priceCurrency: "BRL",
          ...(preco > 0 ? { price: preco.toFixed(2) } : {}),
          availability: "https://schema.org/InStock",
          seller: { "@id": "https://www.balao.info/#organization" },
        },
      },
    };
  });

  return [
    {
      "@type": "WebPage",
      "@id": `${URL_DA_PAGINA}#pagina`,
      url: URL_DA_PAGINA,
      name: TITULO,
      description: DESCRICAO,
      inLanguage: "pt-BR",
      about: { "@id": "https://www.balao.info/#organization" },
      primaryImageOfPage: "https://www.balao.info/images/servicos-e-ofertas/og.jpg",
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["#resumo-da-loja"] },
    },
    generateOrganizationSchema(),
    {
      "@type": "OfferCatalog",
      "@id": `${URL_DA_PAGINA}#servicos`,
      name: "Serviços de assistência técnica e informática em Campinas",
      itemListElement: servicos,
    },
    {
      "@type": "ItemList",
      "@id": `${URL_DA_PAGINA}#ofertas`,
      name: "Ofertas de informática da semana",
      numberOfItems: produtos.length,
      itemListElement: produtos,
    },
    generateFAQSchema(PERGUNTAS),
    generateBreadcrumbSchema([
      { name: "Início", item: "https://www.balao.info" },
      { name: "Serviços e Ofertas", item: URL_DA_PAGINA },
    ]),
  ];
}

const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const ROTULO = "text-xs font-black uppercase tracking-[0.2em] text-[#ff4d58]";

export default async function ServicosEOfertasPage() {
  const { produtos, quedas } = await carregar();
  const prateleiras = prateleirasDaPagina(produtos);
  const emQueda = produtosEmQueda(quedas);
  const mostrados = produtosMostrados(prateleiras);

  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] font-sans text-white selection:bg-[#E60012] selection:text-white">
      <JsonLd data={schemaDaPagina(mostrados)} />
      <Header />

      <main className="flex-1">
        {/* ============ TOPO: promessa + captação ============ */}
        <section className="relative isolate overflow-hidden border-b border-slate-800">
          <Image
            src="/images/servicos-e-ofertas/capa.webp"
            alt="Técnico da Balão da Informática consertando notebook na bancada da loja em Campinas"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-right opacity-40"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#090d16] via-[#090d16]/90 to-[#090d16]/40" />

          <div className={`${CONTAINER} grid gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20`}>
            <div className="space-y-6">
              <nav aria-label="Você está em" className="text-xs text-slate-400">
                <Link href="/" className="hover:text-white">Início</Link> <span aria-hidden>/</span>{" "}
                <span className="text-slate-300">Serviços e Ofertas</span>
              </nav>
              <p className={ROTULO}>Bancada própria · Loja física · Orçamento pelo WhatsApp</p>
              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Assistência técnica e ofertas de informática{" "}
                <span className="text-[#E60012]">no Cambuí, em Campinas</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-300">
                Notebook, PC, iPhone, MacBook e videogame consertados na nossa bancada, PC gamer montado sob medida e
                produtos com <strong className="text-white">10% de desconto no Pix</strong> ou{" "}
                <strong className="text-white">10x sem juros</strong>. Diga do que precisa e receba o orçamento pelo WhatsApp.
              </p>

              <div>
                <p className="mb-3 text-sm font-bold text-slate-200">Do que você precisa? Toque e fale com a loja:</p>
                <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {NECESSIDADES.map((n) => (
                    <li key={n.id}>
                      <a
                        href={linkDoWhatsApp(n.mensagem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-conversion-source="servicos_e_ofertas_atalho"
                        data-conversion-service={n.rotulo}
                        className="flex h-full items-center gap-1.5 rounded-2xl border border-slate-600 bg-[#111827]/90 px-3 py-2.5 text-[13px] font-bold leading-tight text-white transition hover:border-[#E60012] hover:bg-[#E60012] sm:rounded-full sm:px-4 sm:text-sm"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                        {n.rotulo}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#E60012] text-[#E60012]" aria-hidden /> Mais de 700 avaliações no Google
                </li>
                <li className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-[#E60012]" aria-hidden /> Mais de 25 anos de marca
                </li>
                <li className="flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-[#E60012]" aria-hidden /> {SITE_CONFIG.addressShort}
                </li>
              </ul>
            </div>

            <div id="orcamento" className="scroll-mt-24 rounded-3xl border border-slate-700 bg-[#111827]/95 p-6 shadow-2xl shadow-black/50 sm:p-8">
              <p className={ROTULO}>Orçamento pelo WhatsApp</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Conte o que precisa. A loja responde.</h2>
              <p className="mt-2 mb-5 text-sm text-slate-400">
                Preço e prazo antes de qualquer serviço. Atendimento {SITE_CONFIG.openingHoursDisplay}.
              </p>
              <FormularioDeOrcamento />
            </div>
          </div>
        </section>

        {/* ============ FAIXA DE CONDIÇÕES ============ */}
        <section aria-label="Condições de compra" className="border-b border-slate-800 bg-[#0d1322]">
          <ul className={`${CONTAINER} grid grid-cols-2 gap-4 py-6 lg:grid-cols-4`}>
            {[
              { icone: QrCode, forte: "10% OFF no Pix", fraco: "Desconto à vista" },
              { icone: CreditCard, forte: "10x sem juros", fraco: "No cartão de crédito" },
              { icone: Store, forte: "Retire na loja", fraco: "Pronta entrega no Cambuí" },
              { icone: ShieldCheck, forte: "Nota fiscal e garantia", fraco: "Em todo produto novo" },
            ].map(({ icone: Icone, forte, fraco }) => (
              <li key={forte} className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E60012]/15">
                  <Icone className="h-5 w-5 text-[#ff4d58]" aria-hidden />
                </span>
                <span>
                  <span className="block font-black leading-tight">{forte}</span>
                  <span className="block text-xs text-slate-400">{fraco}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-16 py-12 sm:space-y-20 sm:py-16">
          {/* ============ QUEDA DE PREÇO ============ */}
          {emQueda.length > 0 && (
            <div className={CONTAINER}>
              <HomeQuedaDePreco quedas={emQueda} />
            </div>
          )}

          {/* ============ OFERTAS (prateleiras) ============ */}
          <section id="ofertas" aria-labelledby="titulo-ofertas" className="scroll-mt-24 space-y-12">
            <div className={`${CONTAINER} flex flex-col gap-3 md:flex-row md:items-end md:justify-between`}>
              <div>
                <p className={ROTULO}>Ofertas da semana</p>
                <h2 id="titulo-ofertas" className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                  Produtos para levar hoje, com a assistência do lado
                </h2>
                <p className="mt-2 max-w-2xl text-slate-400">
                  Preços atualizados todo dia. No Pix sai com 10% de desconto; no cartão, em até 10x sem juros.
                </p>
              </div>
              <a
                href={linkDoWhatsApp("Olá! Quero saber o melhor preço e a disponibilidade de um produto.")}
                target="_blank"
                rel="noopener noreferrer"
                data-conversion-source="servicos_e_ofertas_ofertas"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-[#ff4d58]"
              >
                Pedir o melhor preço no WhatsApp <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>

            {prateleiras.length === 0 && (
              <div className={CONTAINER}>
                <p className="rounded-2xl border border-slate-800 bg-[#111827] p-6 text-slate-300">
                  As ofertas estão sendo atualizadas. Enquanto isso, <Link href="/" className="font-bold text-white underline">veja o catálogo completo</Link>.
                </p>
              </div>
            )}

            {prateleiras.map((v, indice) => (
              <div key={v.id} className="space-y-4">
                <div className={`${CONTAINER} flex items-end justify-between gap-4`}>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{v.titulo}</h3>
                    <p className="text-sm text-slate-400">{GANCHO_DA_PRATELEIRA[v.id] || v.subtitulo}</p>
                  </div>
                  <Link href={v.href} className="shrink-0 text-sm font-bold text-slate-200 hover:text-[#ff4d58]">
                    Ver todos <ArrowRight className="inline h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className={`${CONTAINER} !px-0 sm:!px-6 lg:!px-8`}>
                  <ul className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 sm:scroll-px-0 sm:px-0 [scrollbar-width:thin]">
                    {v.produtos.map((p) => (
                      <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23.5%]">
                        <ProductCard product={p} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chamada no meio das ofertas: quem não achou vira contato. */}
                {indice === 1 && (
                  <div className={`${CONTAINER} pt-6`}>
                    <div className="flex flex-col items-start gap-4 rounded-3xl border border-[#E60012]/40 bg-gradient-to-r from-[#2a0a10] to-[#111827] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                      <div>
                        <p className="text-xl font-black sm:text-2xl">Não achou o modelo que queria?</p>
                        <p className="text-slate-300">
                          Diga o que procura e o quanto quer gastar. A loja encontra, compara e separa para você.
                        </p>
                      </div>
                      <a
                        href={linkDoWhatsApp("Olá! Não achei no site o produto que procuro. Posso dizer o que preciso e o meu orçamento?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-conversion-source="servicos_e_ofertas_nao_achou"
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-95"
                      >
                        <MessageCircle className="h-5 w-5" aria-hidden /> Pedir para a loja achar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* ============ SERVIÇOS ============ */}
          <section id="servicos" aria-labelledby="titulo-servicos" className={`${CONTAINER} scroll-mt-24`}>
            <div className="mb-8 max-w-3xl">
              <p className={ROTULO}>Assistência técnica em Campinas</p>
              <h2 id="titulo-servicos" className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                Serviços feitos na nossa bancada, no Cambuí
              </h2>
              <p className="mt-2 text-slate-400">
                Você traz, a gente avalia e passa o orçamento. O serviço só começa depois que você aprova.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICOS.map((s) => (
                <li key={s.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#111827] transition hover:border-[#E60012]/70">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={s.foto}
                      alt={s.fotoAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    {s.selo && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#E60012] px-3 py-1 text-xs font-black">
                        <Clock className="h-3.5 w-3.5" aria-hidden /> {s.selo}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-black leading-snug">{s.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-300">{s.resumo}</p>
                    <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-400">
                      {s.itens.map((item) => (
                        <li key={item} className="flex gap-2">
                          <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff4d58]" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 grid gap-2">
                      <a
                        href={linkDoWhatsApp(s.mensagem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-conversion-source="servicos_e_ofertas_servico"
                        data-conversion-service={s.titulo}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#E60012] px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 active:scale-95"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden /> Orçar no WhatsApp
                      </a>
                      <Link
                        href={s.href}
                        className="flex items-center justify-center gap-1 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
                      >
                        Ver detalhes <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ============ COMO FUNCIONA ============ */}
          <section aria-labelledby="titulo-passos" className={CONTAINER}>
            <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 sm:p-10">
              <p className={ROTULO}>Como funciona</p>
              <h2 id="titulo-passos" className="mt-1 text-3xl font-black tracking-tight">Três passos e está resolvido</h2>
              <ol className="mt-8 grid gap-6 md:grid-cols-3">
                {PASSOS.map((passo, i) => (
                  <li key={passo.titulo} className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E60012] text-xl font-black">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-black">{passo.titulo}</h3>
                      <p className="text-sm text-slate-400">{passo.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#orcamento"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E60012] px-6 py-4 font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden /> Pedir orçamento agora
                </a>
                <a
                  href={`tel:+${SITE_CONFIG.phone.number}`}
                  data-conversion-source="servicos_e_ofertas_passos"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-4 font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  <Phone className="h-5 w-5" aria-hidden /> Ligar {SITE_CONFIG.phone.display}
                </a>
              </div>
            </div>
          </section>

          {/* ============ DIFERENCIAIS ============ */}
          <section aria-labelledby="titulo-diferenciais" className={CONTAINER}>
            <div className="mb-8 max-w-3xl">
              <p className={ROTULO}>Por que a Balão</p>
              <h2 id="titulo-diferenciais" className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                O preço da internet com a segurança de uma loja de verdade
              </h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DIFERENCIAIS.map((d) => (
                <li key={d.titulo} className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
                  <BadgeCheck className="h-7 w-7 text-[#ff4d58]" aria-hidden />
                  <h3 className="mt-3 text-lg font-black">{d.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{d.texto}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* ============ RESUMO (para quem tem pressa, para o Google e para as IAs) ============ */}
          <section id="resumo-da-loja" aria-labelledby="titulo-resumo" className={CONTAINER}>
            <div className="grid gap-8 rounded-3xl border border-slate-800 bg-[#0d1322] p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h2 id="titulo-resumo" className="text-2xl font-black tracking-tight sm:text-3xl">
                  Balão da Informática: assistência técnica e loja de informática no Cambuí
                </h2>
                <p className="mt-4 leading-relaxed text-slate-300">
                  A Balão da Informática Castelo é uma loja de informática com assistência técnica própria na{" "}
                  {SITE_CONFIG.address}. Conserta notebooks, computadores, iPhones, MacBooks, iPads e videogames
                  (PlayStation, Xbox e Nintendo Switch), monta PC gamer sob medida, recupera dados de HD e SSD, faz upgrade
                  de SSD, memória e placa de vídeo, vende seminovos e consignados, cria sites e sistemas para empresas e
                  vende computadores, notebooks, monitores, peças e periféricos com nota fiscal e garantia.
                </p>
                <p className="mt-3 leading-relaxed text-slate-300">
                  Atende Campinas e região ({CIDADES.slice(1).join(", ")}) e envia produtos para todo o Brasil.
                </p>
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
                {[
                  ["Endereço", SITE_CONFIG.address],
                  ["Horário", SITE_CONFIG.openingHoursDisplay],
                  ["WhatsApp", SITE_CONFIG.whatsapp.display],
                  ["Telefone", SITE_CONFIG.phone.display],
                  ["Pagamento", "Pix com 10% de desconto, cartão em até 10x sem juros"],
                  ["CNPJ", SITE_CONFIG.cnpj],
                ].map(([rotulo, valor]) => (
                  <div key={rotulo}>
                    <dt className="text-xs font-black uppercase tracking-wider text-slate-500">{rotulo}</dt>
                    <dd className="font-semibold text-white">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ============ PERGUNTAS FREQUENTES ============ */}
          <section aria-labelledby="titulo-perguntas" className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className={`${ROTULO} text-center`}>Perguntas frequentes</p>
            <h2 id="titulo-perguntas" className="mt-1 mb-8 text-center text-3xl font-black tracking-tight">
              Dúvidas sobre conserto, compra e entrega
            </h2>
            <div className="space-y-3">
              {PERGUNTAS.map((q, i) => (
                <details key={q.question} open={i === 0} className="group rounded-2xl border border-slate-800 bg-[#111827] open:border-slate-700">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold [&::-webkit-details-marker]:hidden">
                    <h3 className="text-base">{q.question}</h3>
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate-300">{q.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ============ ONDE ATENDEMOS + CHAMADA FINAL ============ */}
          <section aria-labelledby="titulo-final" className={CONTAINER}>
            <div className="grid gap-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#1a0b12] via-[#111827] to-[#090d16] p-6 sm:p-10 lg:grid-cols-2">
              <div>
                <p className={ROTULO}>
                  <MapPin className="mr-1 inline h-4 w-4" aria-hidden /> Onde atendemos
                </p>
                <h2 id="titulo-final" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Pertinho de você em Campinas e região
                </h2>
                <p className="mt-3 text-slate-300">
                  {SITE_CONFIG.address}. {SITE_CONFIG.openingHoursDisplay}.
                </p>
                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Cidades</p>
                  <p className="mt-1 text-sm text-slate-300">{CIDADES.join(" · ")}</p>
                  <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">Bairros de Campinas</p>
                  <p className="mt-1 text-sm text-slate-300">{BAIRROS.join(" · ")}</p>
                </div>
                <a
                  href={SITE_CONFIG.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-[#ff4d58]"
                >
                  Como chegar pelo Google Maps <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <div className="flex flex-col justify-center gap-4 rounded-2xl border border-slate-700 bg-[#090d16]/70 p-6 sm:p-8">
                <p className="text-2xl font-black">Fale agora com a loja</p>
                <p className="text-slate-300">Mande uma foto do problema ou o link do produto. Quanto mais detalhe, mais rápido o orçamento.</p>
                <a
                  href={linkDoWhatsApp("Olá! Quero atendimento da Balão da Informática.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-conversion-source="servicos_e_ofertas_final"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#E60012] px-6 py-4 text-lg font-black text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 active:scale-95"
                >
                  <MessageCircle className="h-6 w-6" aria-hidden /> WhatsApp {SITE_CONFIG.whatsapp.display}
                </a>
                <a
                  href={`tel:+${SITE_CONFIG.phone.number}`}
                  data-conversion-source="servicos_e_ofertas_final"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-6 py-3 font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  <Phone className="h-5 w-5" aria-hidden /> Ligar {SITE_CONFIG.phone.display}
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
