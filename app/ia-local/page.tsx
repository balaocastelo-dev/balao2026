import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema } from "@/components/JsonLd";
import Paginacao from "@/components/catalogo/Paginacao";
import LinhaDeMaquina from "@/components/premium/LinhaDeMaquina";
import ReguaDeMemoria from "@/components/premium/ReguaDeMemoria";
import { archivo } from "@/components/premium/fonte";
import { linkDoWhatsApp } from "@/components/premium/whatsapp";
import "@/components/premium/premium.css";
import { getCachedVitrinePremium } from "@/lib/cache";
import {
  ehNivelDeIA,
  MEMORIA_UNIFICADA_MINIMA,
  NIVEIS,
  RAM_MINIMA,
  VRAM_MINIMA,
  type NivelDeIA,
} from "@/lib/catalogo/ia-local";
import { SITE_CONFIG } from "@/lib/config";

// ============================================================
// Categoria "IA local".
//
// Não existe no cadastro de categorias: é uma lista por regra, lida do
// catálogo. Entra toda máquina com placa NVIDIA RTX de 12 GB ou mais e 32 GB
// de RAM, e todo Apple com 24 GB ou mais de memória unificada (a regra mora em
// lib/catalogo/ia-local.ts). Preço novo, produto novo ou produto que saiu:
// a lista se acerta sozinha.
//
// Endereço: /ia-local?nivel=vram-16&ordem=menor&page=2
// ============================================================

const URL_DA_PAGINA = "https://www.balao.info/ia-local";
const TITULO = "PC para IA local em Campinas: máquinas para rodar modelos no seu computador";
const DESCRICAO =
  "Computadores para rodar IA local, escolhidos pela memória da placa de vídeo: NVIDIA RTX com 12 GB ou mais e 32 GB de RAM, e Apple com memória unificada. Na Balão da Informática, no Cambuí, em Campinas.";
const POR_PAGINA = 24;

type Parametros = Promise<{ nivel?: string | string[]; ordem?: string | string[]; page?: string | string[] }>;

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function lerEndereco(sp: Awaited<Parametros>) {
  const nivel = primeiro(sp.nivel);
  const pagina = Number.parseInt(primeiro(sp.page) || "1", 10);
  return {
    nivel: ehNivelDeIA(nivel) ? nivel : null,
    maisBaratasPrimeiro: primeiro(sp.ordem) === "menor",
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

function endereco(filtro: { nivel: NivelDeIA | null; maisBaratasPrimeiro: boolean; pagina?: number }) {
  const q = new URLSearchParams();
  if (filtro.nivel) q.set("nivel", filtro.nivel);
  if (filtro.maisBaratasPrimeiro) q.set("ordem", "menor");
  if (filtro.pagina && filtro.pagina > 1) q.set("page", String(filtro.pagina));
  const texto = q.toString();
  return `/ia-local${texto ? `?${texto}` : ""}`;
}

export async function generateMetadata({ searchParams }: { searchParams: Parametros }): Promise<Metadata> {
  const filtro = lerEndereco(await searchParams);
  // Recorte, reordenação e página 2 em diante são variações da mesma lista:
  // quem vai para o índice do Google é o endereço limpo.
  const variacao = Boolean(filtro.nivel || filtro.maisBaratasPrimeiro || filtro.pagina > 1);

  return {
    title: TITULO,
    description: DESCRICAO,
    alternates: { canonical: URL_DA_PAGINA },
    robots: variacao ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: `${TITULO} | Balão da Informática`,
      description: DESCRICAO,
      type: "website",
      url: URL_DA_PAGINA,
      siteName: SITE_CONFIG.name,
      images: [{ url: "https://www.balao.info/logo.png", width: 512, height: 512, alt: "Balão da Informática" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${TITULO} | Balão da Informática`,
      description: DESCRICAO,
      images: ["https://www.balao.info/logo.png"],
    },
  };
}

export default async function IaLocalPage({ searchParams }: { searchParams: Parametros }) {
  const filtro = lerEndereco(await searchParams);
  const { iaLocal } = await getCachedVitrinePremium();

  const totais = Object.fromEntries(
    NIVEIS.map((n) => [n.id, iaLocal.filter((m) => m.nivelDeIA === n.id).length])
  ) as Record<NivelDeIA, number>;

  const recorte = filtro.nivel ? iaLocal.filter((m) => m.nivelDeIA === filtro.nivel) : iaLocal;
  const ordenadas = filtro.maisBaratasPrimeiro ? [...recorte].reverse() : recorte;
  const totalDePaginas = Math.max(1, Math.ceil(ordenadas.length / POR_PAGINA));
  if (filtro.pagina > totalDePaginas) notFound();
  const naPagina = ordenadas.slice((filtro.pagina - 1) * POR_PAGINA, filtro.pagina * POR_PAGINA);

  const maiorPlaca = Math.max(0, ...iaLocal.map((m) => m.vramGb ?? 0));
  const temPlacaDe24 = totais["vram-24"] > 0;

  const pedirIndicacao = linkDoWhatsApp(
    "Olá! Vi a categoria IA local no site e quero ajuda para escolher uma máquina para rodar modelos no meu computador. Quero usar para: "
  );

  const perguntas = [
    {
      question: "Por que a placa de vídeo pesa mais que o processador?",
      answer:
        "Porque o modelo é carregado na memória da placa de vídeo e é ela que faz a conta. Quando o modelo não cabe inteiro, uma parte vai para a RAM e a resposta fica bem mais lenta. Por isso a categoria é organizada pela memória da placa.",
    },
    {
      question: "Preciso de internet para usar um modelo local?",
      answer:
        "Só para baixar o modelo e os programas. Depois de baixado, ele roda na máquina: o que você escreve ou envia para análise não sai do computador.",
    },
    {
      question: "Por que só placas NVIDIA?",
      answer:
        "As ferramentas de IA local são feitas primeiro para NVIDIA, e nelas tudo funciona sem ajuste. Placas Radeon também rodam modelos, mas pedem configuração a mais. Se você prefere uma, fale com a loja.",
    },
    {
      question: "E os computadores da Apple?",
      answer: `No chip M a memória é unificada: a placa de vídeo usa a mesma memória do sistema. Por isso entram na categoria os Apple com ${MEMORIA_UNIFICADA_MINIMA} GB ou mais.`,
    },
    {
      question: `Por que a categoria exige ${RAM_MINIMA} GB de RAM?`,
      answer:
        "A RAM é onde o modelo passa antes de ir para a placa, e é para onde vai o que não coube nela. Com menos que isso, a máquina trava justamente quando o modelo é grande.",
    },
    ...(temPlacaDe24 || maiorPlaca === 0
      ? []
      : [
          {
            question: "Preciso de uma placa com 24 GB ou mais. Tem?",
            answer: `Entre as máquinas prontas do catálogo, hoje a maior placa tem ${maiorPlaca} GB. Para uma configuração com placa maior, fale com a loja pelo WhatsApp.`,
          },
        ]),
  ];

  const dadosEstruturados = [
    {
      "@type": "CollectionPage",
      "@id": URL_DA_PAGINA,
      url: URL_DA_PAGINA,
      name: `${TITULO} | Balão da Informática`,
      description: DESCRICAO,
      inLanguage: "pt-BR",
      isPartOf: { "@id": "https://www.balao.info/#website" },
      about: { "@id": "https://www.balao.info/#store" },
    },
    generateBreadcrumbSchema([
      { name: "Início", item: "https://www.balao.info" },
      { name: "Premium", item: "https://www.balao.info/premium" },
      { name: "IA local", item: URL_DA_PAGINA },
    ]),
    {
      "@type": "ItemList",
      url: URL_DA_PAGINA,
      name: "Computadores para rodar IA local",
      numberOfItems: naPagina.length,
      itemListElement: naPagina.map((m, i) => ({
        "@type": "ListItem",
        position: (filtro.pagina - 1) * POR_PAGINA + i + 1,
        url: `https://www.balao.info${m.href}`,
        name: m.nome,
      })),
    },
    generateFAQSchema(perguntas),
  ];

  const opcoes: { nivel: NivelDeIA | null; rotulo: string; total: number }[] = [
    { nivel: null, rotulo: "Todas", total: iaLocal.length },
    ...NIVEIS.filter((n) => totais[n.id] > 0).map((n) => ({ nivel: n.id, rotulo: n.rotulo, total: totais[n.id] })),
  ];

  return (
    <>
      <JsonLd data={dadosEstruturados} />
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div className={`prm ${archivo.variable}`}>

      <section className="prm-abertura prm-faixa--carbono" style={{ paddingBottom: "clamp(3.5rem, 8vw, 6.5rem)" }}>
        <div className="prm-miolo">
          <nav aria-label="Você está em">
            <ol className="prm-trilha">
              <li>
                <Link href="/">Início</Link>
              </li>
              <li>
                <Link href="/premium">Premium</Link>
              </li>
              <li aria-current="page">IA local</li>
            </ol>
          </nav>

          <div className="prm-ia">
            <div>
              <h1 className="prm-titulo-1">Máquinas para rodar IA local.</h1>
              <p className="prm-abre">
                Modelos de linguagem e de imagem rodando no seu computador: sem mensalidade por uso e sem que prontuário,
                projeto ou código-fonte saia da máquina.
              </p>
              <p className="prm-abre">
                O que define o tamanho do modelo é a memória da placa de vídeo. A categoria reúne{" "}
                {iaLocal.length > 1 ? `as ${iaLocal.length} máquinas` : "as máquinas"} do catálogo com
                placa NVIDIA RTX de {VRAM_MINIMA} GB ou mais e pelo menos {RAM_MINIMA} GB de RAM, e os Apple com{" "}
                {MEMORIA_UNIFICADA_MINIMA} GB ou mais de memória unificada.
              </p>
              <div className="prm-acoes">
                <a href="#maquinas" className="prm-botao prm-botao--claro">
                  Ver as máquinas
                </a>
                <a href={pedirIndicacao} target="_blank" rel="noopener noreferrer" className="prm-link">
                  Pedir indicação no WhatsApp
                </a>
              </div>
            </div>
            <ReguaDeMemoria totais={totais} comLinks />
          </div>
        </div>
      </section>

      <section id="maquinas" className="prm-faixa" aria-labelledby="lista">
        <div className="prm-miolo">
          <div className="prm-cabeca">
            <h2 id="lista" className="prm-titulo-2">
              {filtro.nivel ? NIVEIS.find((n) => n.id === filtro.nivel)!.titulo : "Todas as máquinas da categoria"}
            </h2>
            <Link
              href={`${endereco({ nivel: filtro.nivel, maisBaratasPrimeiro: !filtro.maisBaratasPrimeiro })}#maquinas`}
              className="prm-link"
              scroll={false}
            >
              {filtro.maisBaratasPrimeiro ? "Mostrar as mais caras primeiro" : "Mostrar as mais baratas primeiro"}
            </Link>
          </div>

          <ul className="prm-filtro" aria-label="Recortar por memória">
            {opcoes.map((opcao) => (
              <li key={opcao.nivel ?? "todas"}>
                <Link
                  href={`${endereco({ nivel: opcao.nivel, maisBaratasPrimeiro: filtro.maisBaratasPrimeiro })}#maquinas`}
                  className="prm-filtro__opcao"
                  aria-current={opcao.nivel === filtro.nivel ? "true" : undefined}
                  scroll={false}
                >
                  {opcao.rotulo}
                  <span className="prm-filtro__total">{opcao.total}</span>
                </Link>
              </li>
            ))}
          </ul>

          {naPagina.length > 0 ? (
            <ol className="prm-lista" start={(filtro.pagina - 1) * POR_PAGINA + 1}>
              {naPagina.map((maquina) => (
                <li key={maquina.id}>
                  <LinhaDeMaquina maquina={maquina} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="prm-vazio">
              Nenhuma máquina do catálogo atende ao critério agora.{" "}
              <a href={pedirIndicacao} target="_blank" rel="noopener noreferrer" className="prm-link">
                Fale com a loja pelo WhatsApp
              </a>{" "}
              para montar uma sob medida.
            </p>
          )}

          <div className="prm-paginas">
            <Paginacao
              atual={filtro.pagina}
              total={totalDePaginas}
              href={(pagina) => `${endereco({ ...filtro, pagina })}#maquinas`}
              rotulo="Páginas da categoria IA local"
            />
          </div>

          <div className="prm-rodape-de-lista">
            <p className="prm-nota">Preços do catálogo do site. A disponibilidade é confirmada no atendimento.</p>
          </div>
        </div>
      </section>

      <section className="prm-faixa prm-faixa--nevoa" aria-labelledby="perguntas">
        <div className="prm-miolo prm-perguntas">
          <div>
            <h2 id="perguntas" className="prm-titulo-2">
              Antes de escolher
            </h2>
            <p className="prm-abre">
              Os tamanhos de modelo desta página valem para modelos comprimidos em 4 bits, o formato mais usado em
              programas como Ollama e LM Studio. É uma ordem de grandeza: o tamanho da conversa também ocupa memória.
            </p>
          </div>
          <div className="prm-perguntas__lista">
            {perguntas.map((pergunta) => (
              <details key={pergunta.question}>
                <summary>{pergunta.question}</summary>
                <p>{pergunta.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="prm-faixa prm-faixa--carbono" aria-labelledby="fecho">
        <div className="prm-miolo prm-fecho">
          <div>
            <h2 id="fecho" className="prm-titulo-2">
              Diga o que quer rodar. A loja indica a máquina.
            </h2>
            <div className="prm-acoes">
              <a href={pedirIndicacao} target="_blank" rel="noopener noreferrer" className="prm-botao prm-botao--vermelho">
                Chamar no WhatsApp
              </a>
              <Link href="/premium" className="prm-link">
                Ver a página Premium
              </Link>
            </div>
          </div>
          <address className="prm-loja">
            <strong>{SITE_CONFIG.companyName}</strong>
            {SITE_CONFIG.address}
            <br />
            {SITE_CONFIG.openingHoursDisplay}
          </address>
        </div>
      </section>
      </div>
    </>
  );
}
