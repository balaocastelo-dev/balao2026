import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import Header from "@/components/Header";
import FileiraDeProdutos from "@/components/catalogo/FileiraDeProdutos";
import { GradeDeQuedas } from "@/components/home/HomeQuedaDePreco";
import CapaArtigo from "@/components/blog/CapaArtigo";
import JsonLd, {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateServiceSchema,
} from "@/components/JsonLd";
import { archivo } from "@/components/premium/fonte";
import { SITE_CONFIG } from "@/lib/config";
import { produtosEmQueda } from "@/lib/precos/queda";
import type { Product } from "@/lib/utils";
import type { DadosDaPagina } from "@/lib/landing/dados";
import { urlDaPagina } from "@/lib/landing/paginas";
import type { PaginaDeCaptacao as Pagina, Secao } from "@/lib/landing/tipos";
import PalcoDoTopo from "./PalcoDoTopo";
import AssistenteDeOrcamento from "./AssistenteDeOrcamento";
import ImagemComProfundidade from "./ImagemComProfundidade";
import BarraDoCelular from "./BarraDoCelular";
import "./captacao.css";

/**
 * Monta uma página de captação a partir do arquivo de conteúdo dela
 * (lib/landing/paginas/<slug>.ts). A ordem é sempre a mesma moldura —
 * topo com o assistente, prova, as seções da página, artigos do blog,
 * perguntas, páginas vizinhas e o balcão — e o miolo é da página.
 *
 * `especiais` recebe blocos que só uma página tem (as fileiras da /pcgamer,
 * o modelo 3D da /pcgamer3d, o formulário da /sistemas...), referidos nas
 * seções como { tipo: "especial", id }.
 */

const whats = (mensagem: string) => `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(mensagem)}`;

function Cabecalho({ titulo, texto, id }: { titulo: string; texto?: string; id?: string }) {
  return (
    <div className="max-w-3xl">
      <h2 id={id} className="cpt-h2">
        {titulo}
      </h2>
      {texto ? <p className="cpt-corpo mt-4">{texto}</p> : null}
    </div>
  );
}

function Prova() {
  return (
    <section className="cpt-secao cpt-secao--painel !py-10" aria-label="Por que a Balão">
      <div className="cpt-miolo">
        <div className="cpt-prova">
          <p>
            <strong>Mais de 25 anos</strong>
            <span>de Balão da Informática em Campinas</span>
          </p>
          <p>
            <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="group">
              <strong>700+ avaliações</strong>
              <span className="underline-offset-4 group-hover:underline">no Google: leia antes de vir</span>
            </a>
          </p>
          <p>
            <strong>Loja de verdade</strong>
            <span>{SITE_CONFIG.addressShort}, com bancada técnica</span>
          </p>
          <p>
            <strong>WhatsApp da loja</strong>
            <span>quem responde é a equipe que vende e conserta</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function RenderSecao({
  secao,
  indice,
  dados,
  indiceDaVitrine,
  especiais,
  origem,
  temAssistente,
}: {
  secao: Secao;
  indice: number;
  dados: DadosDaPagina;
  indiceDaVitrine: number;
  especiais: Record<string, ReactNode>;
  origem: string;
  temAssistente: boolean;
}) {
  const painel = indice % 2 === 1 ? " cpt-secao--painel" : "";
  const id = `secao-${indice + 1}`;

  switch (secao.tipo) {
    case "dores":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <ul className="cpt-grade cpt-grade--3 mt-10">
              {secao.itens.map((item) => (
                <li key={item.titulo}>
                  <h3 className="cpt-h3">{item.titulo}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">{item.texto}</p>
                </li>
              ))}
            </ul>
            {temAssistente ? (
              <a
                href="#orcamento"
                className="mt-8 inline-flex text-[1rem] font-bold text-white underline decoration-[var(--cpt-vermelho)] decoration-2 underline-offset-[6px] hover:decoration-white"
              >
                Reconheceu o caso? Monte o pedido de orçamento
              </a>
            ) : null}
          </div>
        </section>
      );

    case "beneficios":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <div className={secao.imagem ? "grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]" : ""}>
              <div>
                <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
                <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                  {secao.itens.map((item) => (
                    <div key={item.titulo} className="border-l-2 border-[var(--cpt-vermelho)] pl-5">
                      <dt className="cpt-h3">{item.titulo}</dt>
                      <dd className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">{item.texto}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {secao.imagem ? <ImagemComProfundidade src={secao.imagem.src} alt={secao.imagem.alt} /> : null}
            </div>
          </div>
        </section>
      );

    case "passos":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <ol
              className="cpt-passos mt-10"
              style={{ ["--cpt-colunas" as string]: String(Math.min(secao.itens.length, 4)) }}
            >
              {secao.itens.map((item) => (
                <li key={item.titulo}>
                  <h3 className="cpt-h3">{item.titulo}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">{item.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      );

    case "comparativo":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <div className="mt-8 overflow-x-auto">
              <table className="cpt-tabela min-w-[36rem]">
                <thead>
                  <tr>
                    {secao.colunas.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {secao.linhas.map(([a, b, c]) => (
                    <tr key={a}>
                      <th scope="row">{a}</th>
                      <td>{b}</td>
                      <td>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );

    case "texto": {
      const imagemPrimeiro = secao.lado === "esquerda";
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <div
              className={
                secao.imagem ? "grid items-center gap-10 lg:grid-cols-2 lg:gap-16" : ""
              }
            >
              <div className={imagemPrimeiro ? "lg:order-2" : ""}>
                <h2 id={id} className="cpt-h2 max-w-3xl">
                  {secao.titulo}
                </h2>
                <div className="mt-5 space-y-4">
                  {secao.paragrafos.map((p, i) => (
                    <p key={i} className="cpt-corpo">
                      {p}
                    </p>
                  ))}
                </div>
                {secao.lista?.length ? (
                  <ul className="mt-6 space-y-3">
                    {secao.lista.map((item) => (
                      <li key={item} className="flex gap-3 text-[1rem] leading-relaxed text-[var(--cpt-texto-2)]">
                        <span className="mt-[0.6rem] h-1.5 w-1.5 flex-none rounded-full bg-[var(--cpt-vermelho)]" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {secao.imagem ? (
                <div className={imagemPrimeiro ? "lg:order-1" : ""}>
                  <ImagemComProfundidade src={secao.imagem.src} alt={secao.imagem.alt} />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    case "marcas":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {secao.marcas.map((m) => (
                <li key={m} className="cpt-marca">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "regras":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <div className="cpt-grade cpt-grade--2 mt-10">
              {secao.itens.map((item) => (
                <article key={item.titulo}>
                  <h3 className="cpt-h3">{item.titulo}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">{item.texto}</p>
                  {item.pontos?.length ? (
                    <ul className="mt-4 space-y-2">
                      {item.pontos.map((p) => (
                        <li key={p} className="flex gap-3 text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-2)]">
                          <span className="mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full bg-[var(--cpt-vermelho)]" aria-hidden />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      );

    case "dados":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <dl className="mt-8 max-w-3xl border-t border-[var(--cpt-fio)]">
              {secao.linhas.map(([rotulo, valor]) => (
                <div key={rotulo} className="grid gap-1 border-b border-[var(--cpt-fio)] py-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
                  <dt className="text-[0.9375rem] text-[var(--cpt-texto-3)]">{rotulo}</dt>
                  <dd className="text-[1rem] font-semibold text-white">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      );

    case "loja":
      return <Balcao key={id} titulo={secao.titulo} texto={secao.texto} origem={origem} painel={painel} />;

    case "atalhos":
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {secao.itens.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="cpt-vizinha h-full">
                    <span className="cpt-vizinha__foto">
                      {item.imagem ? <Image src={item.imagem} alt="" fill sizes="88px" className="object-cover" /> : null}
                    </span>
                    <span>
                      <span className="cpt-vizinha__nome block font-bold leading-snug text-white">{item.titulo}</span>
                      <span className="mt-1 block text-[0.875rem] leading-snug text-[var(--cpt-texto-3)]">{item.texto}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );

    case "vitrine": {
      const fileiras = dados.fileiras[indiceDaVitrine] ?? [];
      return (
        <section id={indiceDaVitrine === 0 ? "vitrine" : undefined} className={`cpt-secao${painel} scroll-mt-20`} aria-labelledby={id}>
          <div className="cpt-miolo">
            {secao.titulo ? <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} /> : null}
            {fileiras.length > 0 ? (
              <div className={`space-y-12 ${secao.titulo ? "mt-10" : ""}`}>
                {fileiras.map((f, i) => (
                  <div key={f.id}>
                    <FileiraDeProdutos
                      id={`fileira-${f.id}`}
                      numero={i + 1}
                      titulo={f.titulo}
                      subtitulo={f.subtitulo ?? ""}
                      produtos={f.produtos}
                    />
                    {f.verTodos ? (
                      <Link
                        href={f.verTodos.href}
                        className="mt-4 inline-flex text-[0.9375rem] font-bold text-white underline decoration-[var(--cpt-fio-forte)] underline-offset-[6px] hover:decoration-white"
                      >
                        {f.verTodos.rotulo}
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[20px] border border-[var(--cpt-fio)] p-6 sm:p-8">
                <p className="cpt-corpo">
                  A vitrine não carregou agora. Pergunte no WhatsApp: a equipe manda fotos, preços e o que tem para retirar hoje.
                </p>
                <a href={whats(`Olá! Estou na página ${urlDaPagina(origem)} e quero ver as opções disponíveis.`)} target="_blank" rel="noopener noreferrer" className="cpt-botao cpt-botao--acao mt-5">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Ver opções no WhatsApp
                </a>
              </div>
            )}
          </div>
        </section>
      );
    }

    case "quedas": {
      const quedas = produtosEmQueda(dados.quedas).slice(0, secao.limite ?? 12);
      if (quedas.length === 0) return null;
      return (
        <section className={`cpt-secao${painel}`} aria-labelledby={id}>
          <div className="cpt-miolo">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Cabecalho id={id} titulo={secao.titulo} texto={secao.texto} />
              <Link href="/queda-de-preco" className="cpt-botao cpt-botao--linha">
                Todas as quedas de preço
              </Link>
            </div>
            <div className="mt-10">
              <GradeDeQuedas quedas={quedas} />
            </div>
          </div>
        </section>
      );
    }

    case "especial":
      return especiais[secao.id] ?? null;
  }
}

function Balcao({ titulo, texto, origem, painel = "" }: { titulo: string; texto?: string; origem: string; painel?: string }) {
  return (
    <section className={`cpt-secao${painel}`} aria-labelledby="balcao">
      <div className="cpt-miolo grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <h2 id="balcao" className="cpt-h2">
            {titulo}
          </h2>
          {texto ? <p className="cpt-corpo mt-4">{texto}</p> : null}
          <ul className="mt-8 space-y-4 text-[1rem] text-[var(--cpt-texto-2)]">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
              <span>
                {SITE_CONFIG.address}
                <br />
                <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4">
                  Abrir no Google Maps
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
              <span>{SITE_CONFIG.openingHoursDisplay}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
              <a href={`tel:+${SITE_CONFIG.phone.number}`} className="underline-offset-4 hover:underline">
                {SITE_CONFIG.phone.display}
              </a>
            </li>
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[var(--cpt-fio)]">
          <Image
            src="/images/apple/hub-hero-real.png"
            alt="Balcão de atendimento da Balão da Informática"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <span className="sr-only">{origem}</span>
    </section>
  );
}

export default function PaginaDeCaptacao({
  pagina,
  dados,
  especiais = {},
  migalhas,
  produtosDosEspeciais = [],
}: {
  pagina: Pagina;
  dados: DadosDaPagina;
  especiais?: Record<string, ReactNode>;
  /** Produtos que os blocos especiais mostram (para o topo e o ItemList). */
  produtosDosEspeciais?: Product[];
  /** Caminho de migalhas além de "Início" (padrão: só a página). */
  migalhas?: { name: string; item: string }[];
}) {
  const url = urlDaPagina(pagina.slug);
  const mensagem = pagina.hero.mensagem;
  const produtosDaPagina = [...produtosDosEspeciais, ...dados.fileiras.flat().flatMap((f) => f.produtos)];
  // Fotos diferentes entre si (vários modelos usam a mesma foto de catálogo).
  const vistas = new Set<string>();
  const flutuantes = [...produtosDaPagina, ...dados.quedas]
    .filter((p) => p.image && !vistas.has(p.image) && Boolean(vistas.add(p.image)))
    .slice(0, 4)
    .map((p) => ({ src: p.image, alt: p.name }));

  let vitrines = 0;
  const indicesDaVitrine = pagina.secoes.map((s) => (s.tipo === "vitrine" ? vitrines++ : -1));

  const caminho = [
    { name: "Início", item: "https://www.balao.info" },
    ...(migalhas ?? [{ name: pagina.nome, item: url }]),
  ];

  return (
    <div className={`cpt ${archivo.variable} flex min-h-screen flex-col`}>
      <JsonLd
        data={[
          generateOrganizationSchema(),
          generateBreadcrumbSchema(caminho),
          ...(pagina.perguntas.length ? [generateFAQSchema(pagina.perguntas.map((p) => ({ question: p.pergunta, answer: p.resposta })))] : []),
          ...(pagina.seo.tipoDeServico
            ? [
                generateServiceSchema({
                  name: pagina.seo.titulo.split("|")[0].trim(),
                  description: pagina.seo.descricao,
                  url,
                  serviceType: pagina.seo.tipoDeServico,
                }),
              ]
            : []),
          ...(produtosDaPagina.length ? [generateItemListSchema(produtosDaPagina.slice(0, 24), url)] : []),
        ]}
      />
      <Header />

      <main className="flex-1">
        <PalcoDoTopo
          contexto={pagina.hero.contexto}
          titulo={pagina.hero.titulo}
          texto={pagina.hero.texto}
          imagem={pagina.hero.imagem}
          linkDoWhats={whats(mensagem)}
          botao={pagina.hero.botao}
          secundario={pagina.hero.secundario}
          fatos={pagina.hero.fatos}
          flutuantes={flutuantes}
          origem={pagina.slug}
          assistente={pagina.assistente ? <AssistenteDeOrcamento assistente={pagina.assistente} origem={pagina.slug} /> : undefined}
        />

        <Prova />

        {pagina.secoes.map((secao, i) => (
          <RenderSecao
            key={`${secao.tipo}-${i}`}
            secao={secao}
            indice={i}
            dados={dados}
            indiceDaVitrine={indicesDaVitrine[i]}
            especiais={especiais}
            origem={pagina.slug}
            temAssistente={Boolean(pagina.assistente)}
          />
        ))}

        {dados.artigos.length > 0 ? (
          <section className="cpt-secao" aria-labelledby="leia-antes">
            <div className="cpt-miolo">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <Cabecalho id="leia-antes" titulo="Antes de decidir, leia" texto="Artigos do blog da Balão sobre o mesmo assunto, escritos por quem atende no balcão." />
                <Link href="/blog" className="cpt-botao cpt-botao--linha">
                  Ir para o blog
                </Link>
              </div>
              <ul className="mt-10 grid gap-6 md:grid-cols-3">
                {dados.artigos.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="group block">
                      <span className="relative block aspect-[16/10] overflow-hidden rounded-[18px] ring-1 ring-inset ring-white/10">
                        <CapaArtigo artigo={a} sizes="(min-width: 768px) 30vw, 100vw" className="absolute inset-0" />
                      </span>
                      <span className="mt-4 block text-[1.125rem] font-bold leading-snug text-white group-hover:underline group-hover:underline-offset-4">
                        {a.titulo}
                      </span>
                      <span className="mt-2 block text-[0.9375rem] leading-relaxed text-[var(--cpt-texto-3)] line-clamp-3">{a.resumo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {pagina.perguntas.length > 0 ? (
          <section className="cpt-secao cpt-secao--painel" aria-labelledby="perguntas">
            <div className="cpt-miolo grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <Cabecalho id="perguntas" titulo="Perguntas que chegam no WhatsApp" texto="As dúvidas mais comuns de quem chega até esta página, respondidas como respondemos no balcão." />
              <div className="cpt-faq">
                {pagina.perguntas.map((p, i) => (
                  <details key={p.pergunta} open={i === 0}>
                    <summary>{p.pergunta}</summary>
                    <p>{p.resposta}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {dados.vizinhas.length > 0 ? (
          <section className="cpt-secao" aria-labelledby="tambem">
            <div className="cpt-miolo">
              <Cabecalho id="tambem" titulo="Também resolvemos" />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {dados.vizinhas.map((v) => (
                  <li key={v.slug}>
                    <Link href={`/${v.slug}`} className="cpt-vizinha h-full">
                      <span className="cpt-vizinha__foto">
                        <Image src={v.hero.imagem.src} alt="" fill sizes="88px" className="object-cover" />
                      </span>
                      <span>
                        <span className="cpt-vizinha__nome block font-bold leading-snug text-white">{v.nome}</span>
                        <span className="mt-1 block text-[0.875rem] leading-snug text-[var(--cpt-texto-3)]">{v.chamada}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="cpt-secao cpt-secao--painel" aria-labelledby="fecho">
          <div className="cpt-miolo grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <h2 id="fecho" className="cpt-titulo text-[2rem] sm:text-[2.75rem]">
                {pagina.final.titulo}
              </h2>
              <p className="cpt-lead mt-5">{pagina.final.texto}</p>
              <a href={whats(pagina.final.mensagem ?? mensagem)} target="_blank" rel="noopener noreferrer" className="cpt-botao cpt-botao--acao mt-8">
                <MessageCircle className="h-5 w-5" aria-hidden />
                {pagina.final.botao}
              </a>
            </div>
            <ul className="space-y-4 text-[1rem] text-[var(--cpt-texto-2)]">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
                <span>
                  {SITE_CONFIG.address}.{" "}
                  <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-4">
                    Como chegar
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
                <span>{SITE_CONFIG.openingHoursDisplay}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 flex-none text-white" aria-hidden />
                <a href={`tel:+${SITE_CONFIG.phone.number}`} className="underline-offset-4 hover:underline">
                  {SITE_CONFIG.phone.display}
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <BarraDoCelular mensagem={mensagem} origem={pagina.slug} rotulo="Chamar no WhatsApp" />
    </div>
  );
}
