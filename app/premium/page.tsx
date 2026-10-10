import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import JsonLd, { generateBreadcrumbSchema, generateFAQSchema } from "@/components/JsonLd";
import { semQuebra } from "@/components/premium/LinhaDeMaquina";
import ListaComFiltro from "@/components/premium/ListaComFiltro";
import Preco from "@/components/premium/Preco";
import ReguaDeMemoria from "@/components/premium/ReguaDeMemoria";
import { archivo } from "@/components/premium/fonte";
import { linkDoWhatsApp } from "@/components/premium/whatsapp";
import "@/components/premium/premium.css";
import { getCachedCategories, getCachedVitrinePremium } from "@/lib/cache";
import { NIVEIS, type NivelDeIA } from "@/lib/catalogo/ia-local";
import { emReais } from "@/lib/catalogo/reais";
import { RAIZ_DESKTOPS, RAIZ_NOTEBOOKS, type MaquinaDeVitrine } from "@/lib/catalogo/vitrine-premium";
import { SITE_CONFIG } from "@/lib/config";

// A página lê o catálogo: quando um preço muda ou um computador entra ou sai,
// a lista se refaz sozinha em até cinco minutos. Não existe mais "categoria
// Premium" para alguém manter à mão.
export const revalidate = 300;

const URL_DA_PAGINA = "https://www.balao.info/premium";
const TITULO = "Computadores Premium e Workstations em Campinas";
const DESCRICAO =
  "Os computadores de maior desempenho da Balão da Informática, no Cambuí: workstations para medicina, engenharia, pesquisa e desenvolvimento, e máquinas para rodar IA local. Montados e testados na loja.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: URL_DA_PAGINA },
  robots: { index: true, follow: true },
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
  other: {
    "geo.region": "BR-SP",
    "geo.placename": "Campinas",
    "geo.position": "-22.9099;-47.0626",
    ICBM: "-22.9099, -47.0626",
  },
};

// Para quem a página fala. Cada texto diz o que pesa na escolha da máquina
// naquele trabalho; o link abre o WhatsApp da loja já com o assunto.
const OFICIOS = [
  {
    titulo: "Medicina e diagnóstico por imagem",
    texto:
      "Visualizadores DICOM e reconstrução 3D consomem memória e placa de vídeo. Vale priorizar 64 GB de RAM e uma placa dedicada com bastante memória.",
    mensagem:
      "Olá! Sou da área médica e procuro um computador para laudos e imagens. Vi a página Premium do site. Pode me indicar uma configuração?",
  },
  {
    titulo: "Engenharia e arquitetura",
    texto:
      "CAD e BIM respondem ao processador mais rápido por núcleo. Render e simulação usam todos os núcleos e a placa de vídeo ao mesmo tempo.",
    mensagem:
      "Olá! Trabalho com engenharia/arquitetura (CAD, BIM, render) e vi a página Premium do site. Pode me indicar uma configuração?",
  },
  {
    titulo: "Pesquisa e ciência de dados",
    texto:
      "Treinar e rodar modelos depende da memória da placa de vídeo. Bases grandes pedem RAM de sobra e um SSD NVMe rápido.",
    mensagem:
      "Olá! Trabalho com pesquisa e ciência de dados e vi a página Premium do site. Pode me indicar uma configuração?",
  },
  {
    titulo: "Desenvolvimento de software",
    texto:
      "Compilar, subir contêineres e rodar um modelo local ao mesmo tempo pede muitos núcleos e 32 GB de RAM ou mais.",
    mensagem:
      "Olá! Sou desenvolvedor(a) e vi a página Premium do site. Pode me indicar uma máquina para compilar, usar contêineres e rodar IA local?",
  },
];

const PASSOS = [
  {
    titulo: "Você conta o que faz",
    texto: "Os programas que usa, o tamanho dos arquivos, quantos monitores. A indicação sai do seu trabalho, não de uma tabela.",
  },
  {
    titulo: "A loja monta",
    texto: "Montagem na bancada do Cambuí, com os cabos organizados e o fluxo de ar pensado para a máquina trabalhar o dia inteiro.",
  },
  {
    titulo: "A máquina é testada",
    texto: "Sistema instalado e teste de estabilidade antes de sair. A ideia é ligar e trabalhar.",
  },
  {
    titulo: "Você retira ou recebe",
    texto: "Retirada na loja, no Cambuí, ou entrega em Campinas e região. O suporte depois da compra é no mesmo balcão.",
  },
];

const PERGUNTAS = [
  {
    question: "O preço desta página é o mesmo da página do produto?",
    answer:
      "É. A lista é lida do catálogo do site: o valor à vista e o valor no cartão que aparecem aqui são os mesmos que você encontra ao abrir a máquina.",
  },
  {
    question: "Posso mudar a configuração de uma máquina da lista?",
    answer:
      "Pode. As máquinas servem de ponto de partida: dá para trocar memória, armazenamento, placa de vídeo ou gabinete antes da montagem. Fale com a loja pelo WhatsApp para fechar a configuração e o valor.",
  },
  {
    question: "As máquinas são testadas antes da entrega?",
    answer:
      "São. Depois de montada, a máquina recebe o sistema e passa por teste de estabilidade na bancada antes de ser entregue.",
  },
  {
    question: "Vocês entregam fora de Campinas?",
    answer:
      "Atendemos Campinas e região e também enviamos para outras cidades. O prazo e o valor da entrega são confirmados pelo WhatsApp.",
  },
  {
    question: "Qual computador serve para rodar inteligência artificial na própria máquina?",
    answer:
      "O que decide é a memória da placa de vídeo. A loja separa numa categoria própria as máquinas com placa NVIDIA RTX de 12 GB ou mais e pelo menos 32 GB de RAM, além dos Apple com 24 GB ou mais de memória unificada. Veja em balao.info/ia-local.",
  },
];

function CartaoDeNotebook({ maquina }: { maquina: MaquinaDeVitrine }) {
  const linhas = [
    maquina.processador,
    maquina.apple ? null : maquina.placa,
    [maquina.memoria && (maquina.apple ? maquina.memoria : `${maquina.memoria} de RAM`), maquina.armazenamento]
      .filter(Boolean)
      .join(", "),
  ].filter((linha): linha is string => Boolean(linha));

  return (
    <Link href={maquina.href} className="prm-cartao">
      <span className="prm-cartao__foto">
        {maquina.imagem ? (
          <Image src={maquina.imagem} alt={maquina.nome} fill sizes="(min-width: 60rem) 260px, 45vw" unoptimized />
        ) : null}
      </span>
      <span className="prm-cartao__titulo">{maquina.titulo}</span>
      <span className="prm-cartao__dados">
        {linhas.map((linha) => (
          <span key={linha}>{semQuebra(linha)}</span>
        ))}
      </span>
      <Preco maquina={maquina} />
    </Link>
  );
}

export default async function PremiumPage() {
  const [vitrine, categorias] = await Promise.all([getCachedVitrinePremium(), getCachedCategories()]);

  const [topo, ...demais] = vitrine.desktops;
  const slugDe = (caminho: string, reserva: string) => categorias.find((c) => c.full_path === caminho)?.slug || reserva;
  const todosOsDesktops = `/categoria/${slugDe(RAIZ_DESKTOPS, "computadores-pc")}?ordem=maior`;
  const todosOsNotebooks = `/categoria/${slugDe(RAIZ_NOTEBOOKS, "computadores-notebooks")}?ordem=maior`;

  const totaisDeIA = Object.fromEntries(
    NIVEIS.map((n) => [n.id, vitrine.iaLocal.filter((m) => m.nivelDeIA === n.id).length])
  ) as Record<NivelDeIA, number>;
  const precosDeIA = vitrine.iaLocal.map((m) => m.valor);
  const faixaDeIA =
    precosDeIA.length > 1 ? { de: Math.min(...precosDeIA), ate: Math.max(...precosDeIA) } : null;

  const falarComEspecialista = linkDoWhatsApp(
    "Olá! Vi a página Premium do site e quero ajuda para escolher um computador de alto desempenho. Meu uso é: "
  );

  const emLista = [...vitrine.desktops, ...vitrine.notebooks];
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
      { name: "Premium", item: URL_DA_PAGINA },
    ]),
    {
      "@type": "ItemList",
      url: URL_DA_PAGINA,
      name: "Computadores de maior valor da loja",
      numberOfItems: emLista.length,
      itemListElement: emLista.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.balao.info${m.href}`,
        name: m.nome,
      })),
    },
    generateFAQSchema(PERGUNTAS),
  ];

  return (
    <>
      <JsonLd data={dadosEstruturados} />
      {/* O cabeçalho lê a busca da URL; dentro do Suspense só ele espera o
          navegador, e o resto da página sai pronto no HTML do servidor. Fica
          fora do bloco .prm para continuar com a letra do resto do site. */}
      <Suspense fallback={null}>
        <Header />
      </Suspense>

      <div className={`prm ${archivo.variable}`}>

      <section className="prm-abertura">
        <div className="prm-miolo">
          <nav aria-label="Você está em">
            <ol className="prm-trilha">
              <li>
                <Link href="/">Início</Link>
              </li>
              <li aria-current="page">Premium</li>
            </ol>
          </nav>

          <h1 className="prm-titulo-1">Computadores à{"\u00a0"}altura do{"\u00a0"}seu trabalho.</h1>
          <p className="prm-abre">
            Workstations e desktops de alto desempenho para medicina, engenharia, pesquisa e desenvolvimento. Os
            desktops são montados e testados na nossa bancada, no Cambuí, em Campinas.
          </p>
          <div className="prm-acoes">
            <a href={falarComEspecialista} target="_blank" rel="noopener noreferrer" className="prm-botao prm-botao--claro">
              Falar com um especialista
            </a>
            <a href="#maquinas" className="prm-link">
              Ver as máquinas
            </a>
          </div>
        </div>

        {topo ? (
          <div className="prm-palco">
            <div className="prm-miolo">
              <article className="prm-peca" aria-labelledby="no-topo">
                <div className="prm-peca__foto">
                  {topo.imagem ? (
                    <Image
                      src={topo.imagem}
                      alt={topo.nome}
                      fill
                      priority
                      sizes="(min-width: 60rem) 640px, 100vw"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="prm-peca__ficha">
                  <p className="prm-nota">No topo do catálogo hoje</p>
                  <h2 id="no-topo" className="prm-peca__titulo">
                    {topo.titulo}
                  </h2>
                  <dl className="prm-ficha">
                    <div>
                      <dt>Processador</dt>
                      <dd>{topo.processador || "Consulte a ficha"}</dd>
                    </div>
                    <div>
                      <dt>Placa de vídeo</dt>
                      <dd>{topo.placa || "Consulte a ficha"}</dd>
                    </div>
                    <div>
                      <dt>Memória</dt>
                      <dd>{topo.memoria || "Consulte a ficha"}</dd>
                    </div>
                    <div>
                      <dt>Armazenamento</dt>
                      <dd>{topo.armazenamento || "Consulte a ficha"}</dd>
                    </div>
                  </dl>
                  <Preco maquina={topo} grande />
                  <Link href={topo.href} className="prm-botao prm-botao--vermelho">
                    Ver esta máquina
                  </Link>
                </div>
              </article>
            </div>
          </div>
        ) : null}
      </section>

      <section className="prm-faixa" aria-labelledby="para-quem">
        <div className="prm-miolo">
          <h2 id="para-quem" className="prm-titulo-2">
            A máquina certa depende do que você faz nela.
          </h2>
          <ul className="prm-oficios">
            {OFICIOS.map((oficio) => (
              <li key={oficio.titulo}>
                <h3 className="prm-titulo-3">{oficio.titulo}</h3>
                <p>{oficio.texto}</p>
                <a href={linkDoWhatsApp(oficio.mensagem)} target="_blank" rel="noopener noreferrer" className="prm-link">
                  Pedir indicação no WhatsApp
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="maquinas" className="prm-faixa prm-faixa--colada" aria-labelledby="topo-do-catalogo">
        <div className="prm-miolo">
          <div className="prm-cabeca">
            <div>
              <h2 id="topo-do-catalogo" className="prm-titulo-2">
                O topo do catálogo
              </h2>
              <p className="prm-abre">
                Os desktops de maior valor da loja hoje, do mais caro para o mais barato. A lista acompanha o catálogo:
                quando um preço muda, a ordem muda junto.
              </p>
            </div>
          </div>

          {demais.length > 0 ? (
            <ListaComFiltro maquinas={demais} />
          ) : (
            <p className="prm-vazio">
              A lista não carregou agora. Tente de novo em alguns minutos ou{" "}
              <a href={falarComEspecialista} target="_blank" rel="noopener noreferrer" className="prm-link">
                fale com a loja pelo WhatsApp
              </a>
              .
            </p>
          )}

          <div className="prm-rodape-de-lista">
            <p className="prm-nota">Preços do catálogo do site. A disponibilidade é confirmada no atendimento.</p>
            <Link href={todosOsDesktops} className="prm-link">
              Ver todos os desktops, do mais caro ao mais barato
            </Link>
          </div>
        </div>
      </section>

      <section className="prm-faixa prm-faixa--carbono" aria-labelledby="ia-local">
        <div className="prm-miolo">
          <div className="prm-ia">
            <div>
              <h2 id="ia-local" className="prm-titulo-2">
                Máquinas para rodar IA local
              </h2>
              <p className="prm-abre">
                Modelos de linguagem e de imagem rodando no seu computador: sem mensalidade por uso e sem que prontuário,
                projeto ou código-fonte saia da máquina. O que define o tamanho do modelo é a memória da placa de vídeo.
              </p>
              {vitrine.iaLocal.length > 1 ? (
                <p className="prm-abre">
                  A loja separou numa categoria própria as {vitrine.iaLocal.length} máquinas do catálogo que dão conta
                  disso{faixaDeIA ? `, de ${emReais(faixaDeIA.de)} a ${emReais(faixaDeIA.ate)}` : ""}.
                </p>
              ) : null}
              <div className="prm-acoes">
                <Link href="/ia-local" className="prm-botao prm-botao--claro">
                  Abrir a categoria IA local
                </Link>
              </div>
            </div>
            <ReguaDeMemoria totais={totaisDeIA} comLinks />
          </div>
        </div>
      </section>

      {vitrine.notebooks.length > 0 ? (
        <section className="prm-faixa" aria-labelledby="notebooks">
          <div className="prm-miolo">
            <div className="prm-cabeca">
              <div>
                <h2 id="notebooks" className="prm-titulo-2">
                  O mesmo nível, na mochila
                </h2>
                <p className="prm-abre">Os notebooks de maior valor da loja hoje.</p>
              </div>
              <Link href={todosOsNotebooks} className="prm-link">
                Ver todos os notebooks
              </Link>
            </div>
            <ul className="prm-grade">
              {vitrine.notebooks.map((maquina) => (
                <li key={maquina.id}>
                  <CartaoDeNotebook maquina={maquina} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="prm-faixa prm-faixa--nevoa" aria-labelledby="como-funciona">
        <div className="prm-miolo">
          <h2 id="como-funciona" className="prm-titulo-2">
            Da conversa à máquina ligada
          </h2>
          <ol className="prm-passos">
            {PASSOS.map((passo) => (
              <li key={passo.titulo}>
                <h3 className="prm-titulo-3">{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="prm-faixa" aria-labelledby="perguntas">
        <div className="prm-miolo prm-perguntas">
          <h2 id="perguntas" className="prm-titulo-2">
            Perguntas de quem está escolhendo
          </h2>
          <div className="prm-perguntas__lista">
            {PERGUNTAS.map((pergunta) => (
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
              Conte o que você faz. A loja indica a máquina.
            </h2>
            <div className="prm-acoes">
              <a href={falarComEspecialista} target="_blank" rel="noopener noreferrer" className="prm-botao prm-botao--vermelho">
                Chamar no WhatsApp
              </a>
              <a href={`tel:+${SITE_CONFIG.phone.number}`} className="prm-link">
                Ligar para {SITE_CONFIG.phone.display}
              </a>
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
