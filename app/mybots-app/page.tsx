import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Cenario from "./Cenario";
import VideoFundoHero from "./VideoFundoHero";
import VideoLeve from "./VideoLeve";
import estilos from "./estilos.module.css";
import { midiaDoSlot } from "@/lib/mybots-arquivos";
import {
  AMEBAS,
  BOTS,
  DESCRICAO,
  H1,
  NOME_APK,
  NOME_INSTALADOR_WINDOWS,
  PALAVRAS_CHAVE,
  PASSOS,
  PERGUNTAS,
  PUBLICOS,
  SUBTITULO,
  TITULO,
  URL_APK,
  URL_INSTALADOR_WINDOWS,
  VIDEO_ANTES_DEPOIS,
  VIDEO_BENEFICIOS,
  VIDEO_DOCUMENTARIO,
  VIDEO_EQUIPE,
  VIDEO_HERO,
  jsonLdDaLanding,
  type SlotDeVideo,
} from "@/lib/mybots-landing";
import { URL_PAINEL, URL_SITE } from "@/lib/soubots";

// Landing do MyBots em www.soubots.com (a raiz desse host reescreve para cá).
// /mybots e /app continuam o Hub. A fonte é arquivo local: não usar next/font/google.

const fonte = localFont({
  src: "./outfit-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--fonte-mybots",
  display: "swap",
});

const URL_PAGINA = URL_SITE;
const IMAGEM_OG = `${URL_SITE}/mybots-app/telas/lista.jpg`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070414",
};

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: URL_PAGINA },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/mybots-app/logo.png", type: "image/png" }],
    apple: "/mybots-app/logo.png",
  },
  keywords: PALAVRAS_CHAVE,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_PAGINA,
    siteName: "MyBots",
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: IMAGEM_OG, width: 1440, height: 900, alt: "Lista de bots do MyBots" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITULO,
    description: DESCRICAO,
    images: [IMAGEM_OG],
  },
};

function IconeAndroid() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M17.6 9.48 19.44 6.3a.5.5 0 0 0-.87-.5l-1.86 3.22a7.4 7.4 0 0 0-8.42 0L6.43 5.8a.5.5 0 0 0-.87.5L7.4 9.48A7.47 7.47 0 0 0 4.5 15.5h15a7.47 7.47 0 0 0-1.9-6.02zM8.5 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
      />
    </svg>
  );
}

function IconeWindows() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path fill="currentColor" d="M3 5.2 10.6 4.1v7.1H3V5.2zm8.4-.95L21 3v8.2h-9.6V4.25zM3 12.8h7.6V20L3 18.9v-6.1zm8.4 0H21V21l-9.6-1.3v-6.9z" />
    </svg>
  );
}

function EntrarGoogle({ classe }: { classe: string }) {
  return (
    <a className={classe} href={URL_PAINEL}>
      Entrar com Google
    </a>
  );
}

function Baixar({ curto = false }: { curto?: boolean }) {
  return (
    <>
      <a className={estilos.botaoWindows} href={URL_INSTALADOR_WINDOWS} download={NOME_INSTALADOR_WINDOWS}>
        <IconeWindows />
        {curto ? "Windows" : "Baixar para Windows"}
      </a>
      <a className={estilos.botaoAndroid} href={URL_APK} download={NOME_APK}>
        <IconeAndroid />
        {curto ? "Android" : "Baixar para Android"}
      </a>
    </>
  );
}

function Quadro({ slot, midia }: { slot: SlotDeVideo; midia: ReturnType<typeof midiaDoSlot> }) {
  return (
    <VideoLeve
      titulo={slot.titulo}
      mp4={midia.mp4}
      webm={midia.webm}
      poster={midia.poster}
      disponivel={midia.disponivel}
    />
  );
}

export default function PaginaMyBots() {
  const hero = midiaDoSlot(VIDEO_HERO);
  const documentario = midiaDoSlot(VIDEO_DOCUMENTARIO);
  const equipe = midiaDoSlot(VIDEO_EQUIPE);
  const beneficios = midiaDoSlot(VIDEO_BENEFICIOS);
  const antesDepois = midiaDoSlot(VIDEO_ANTES_DEPOIS);
  const jsonLd = JSON.stringify(jsonLdDaLanding()).replace(/</g, "\\u003c");

  return (
    <Cenario classeFonte={fonte.variable}>
      <a className={estilos.pular} href="#conteudo">
        Ir para o conteúdo
      </a>

      <header className={estilos.topo}>
        <div className={`${estilos.miolo} ${estilos.topoMiolo}`}>
          <div className={estilos.marca}>
            <img className={estilos.logo} src="/mybots-app/logo.png" width={256} height={256} alt="" />
            <p className={estilos.nome}>MyBots</p>
          </div>
          <a className={estilos.entrar} href={URL_PAINEL}>
            Entrar
          </a>
        </div>
      </header>

      <main id="conteudo">
        <section className={estilos.hero} aria-labelledby="titulo">
          <VideoFundoHero
            mp4={hero.mp4}
            webm={hero.webm}
            poster={hero.poster}
            disponivel={hero.disponivel}
          />
          <div className={`${estilos.miolo} ${estilos.heroMiolo}`}>
            <p className={estilos.selo}>MyBots</p>
            <h1 id="titulo" className={estilos.titulo}>
              {H1}
            </h1>
            <p className={estilos.lead}>{SUBTITULO}</p>
            <div className={estilos.duplaHero} aria-hidden>
              {AMEBAS.filter((_, indice) => indice === 0 || indice === 3).map((ameba, indice) => (
                <img
                  key={ameba.src}
                  className={estilos.amebaHero}
                  data-ameba=""
                  data-papel="hero"
                  data-indice={indice}
                  src={ameba.src}
                  alt=""
                  width={192}
                  height={192}
                  decoding="async"
                />
              ))}
            </div>
            <div className={estilos.acoes}>
              <EntrarGoogle classe={estilos.botaoEntrar} />
              <Baixar />
            </div>
          </div>
        </section>

        <section className={`${estilos.miolo} ${estilos.faixaVideo}`} aria-label={VIDEO_DOCUMENTARIO.titulo}>
          <Quadro slot={VIDEO_DOCUMENTARIO} midia={documentario} />
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="bots">
          <p className={estilos.olho}>Conheça os bots</p>
          <h2 id="bots">Três bots trabalhando desde o primeiro dia</h2>
          <Quadro slot={VIDEO_EQUIPE} midia={equipe} />
          <div className={estilos.grade}>
            {BOTS.map((bot) => (
              <article className={estilos.cartao} key={bot.nome}>
                <h3>{bot.nome}</h3>
                <p>{bot.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="hub">
          <h2 id="hub">Tudo num só lugar: o Hub MyBots</h2>
          <p>Converse com seus bots, acompanhe as tarefas e encontre novos bots no Hub.</p>
          <div className={estilos.telas}>
            <figure className={estilos.foto}>
              <img
                src="/mybots-app/telas/lista.jpg"
                width={1440}
                height={900}
                alt="Lista de bots no Hub do MyBots"
                loading="lazy"
              />
              <figcaption>Tela do Hub. Os nomes são de demonstração.</figcaption>
            </figure>
            <figure className={`${estilos.foto} ${estilos.fotoCelular}`}>
              <img
                src="/mybots-app/telas/android.jpg"
                width={780}
                height={1688}
                alt="Aplicativo MyBots no Android, com a lista de bots"
                loading="lazy"
              />
              <figcaption>O aplicativo no Android. Tela de demonstração.</figcaption>
            </figure>
          </div>
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="como">
          <h2 id="como">Como funciona</h2>
          <ol className={estilos.passos}>
            {PASSOS.map((passo, indice) => (
              <li className={estilos.passo} key={passo}>
                <span className={estilos.numero} aria-hidden>
                  {indice + 1}
                </span>
                <p>{passo}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="dia">
          <h2 id="dia">O dia que sobrou</h2>
          <p>
            O PROGRAMADOR entrega cada mudança pronta para revisão. O SEO &amp; AEO Desk escreve briefings
            para o conteúdo. O Director transforma uma ideia em vídeo. Você pede em português e acompanha o
            resultado.
          </p>
          <Quadro slot={VIDEO_BENEFICIOS} midia={beneficios} />
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} id="baixar" aria-labelledby="aparelhos">
          <h2 id="aparelhos">Use no computador e no celular</h2>
          <p>App para Windows e Android, com suas conversas sincronizadas.</p>
          <Quadro slot={VIDEO_ANTES_DEPOIS} midia={antesDepois} />
          <div className={estilos.acoes}>
            <Baixar />
          </div>
          <h3 className={estilos.sub}>No Android</h3>
          <ol className={estilos.passos}>
            <li className={estilos.passo}>
              <span className={estilos.numero} aria-hidden>
                1
              </span>
              <p>Toque em Baixar para Android. O arquivo MyBots.apk chega no celular.</p>
            </li>
            <li className={estilos.passo}>
              <span className={estilos.numero} aria-hidden>
                2
              </span>
              <p>Abra o arquivo na pasta Downloads.</p>
            </li>
            <li className={estilos.passo}>
              <span className={estilos.numero} aria-hidden>
                3
              </span>
              <p>
                Na primeira vez, o Android pede para permitir fontes desconhecidas. Ative e confirme
                Instalar.
              </p>
            </li>
            <li className={estilos.passo}>
              <span className={estilos.numero} aria-hidden>
                4
              </span>
              <p>Abra o MyBots e entre com a conta Google.</p>
            </li>
          </ol>
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="para-quem">
          <h2 id="para-quem">Para quem é</h2>
          <p>Pequenas empresas, lojistas, criadores de conteúdo e quem desenvolve sistemas.</p>
          <ul className={estilos.publicos}>
            {PUBLICOS.map((nome) => (
              <li key={nome}>{nome}</li>
            ))}
          </ul>
        </section>

        <section className={`${estilos.miolo} ${estilos.bloco}`} aria-labelledby="perguntas">
          <h2 id="perguntas">Perguntas frequentes</h2>
          <div className={estilos.faq}>
            {PERGUNTAS.map((item) => (
              <article key={item.pergunta}>
                <h3>{item.pergunta}</h3>
                <p>{item.resposta}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${estilos.miolo} ${estilos.ctaFinal}`} aria-labelledby="cta-final">
          <h2 id="cta-final">Monte sua equipe de IA hoje</h2>
          <EntrarGoogle classe={estilos.botaoEntrar} />
        </section>
      </main>

      <footer className={`${estilos.miolo} ${estilos.rodape}`}>
        <p>MyBots</p>
        <a href="https://www.balao.info">Balão da Informática</a>
      </footer>

      <div className={estilos.barraFixa}>
        <Baixar curto />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </Cenario>
  );
}
