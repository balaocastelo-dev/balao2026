import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import {
  Bot,
  Calculator,
  FlaskConical,
  Gift,
  Home,
  Infinity as Infinito,
  Languages,
  Lightbulb,
  Monitor,
  Rocket,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import estilos from "./estilos.module.css";

// Landing de divulgação do app MyBots.
// O endereço é /mybots-app de propósito: /mybots é o Hub (rewrite no
// next.config.ts para o túnel Cloudflare) e não pode virar esta página.

const fonte = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--fonte-mybots",
  display: "swap",
});

const URL_PAGINA = "https://www.balao.info/mybots-app";
const APK = "/downloads/MyBots.apk";
const VIDEO = "/mybots-app/comercial.mp4";
const POSTER = "/mybots-app/poster.jpg";

const TITULO = "MyBots — seus bots de IA, no seu bolso";
const DESCRICAO =
  "Baixe o app MyBots para Android. O aplicativo e o uso são 100% grátis: bots de IA no seu bolso, da Balão da Informática Anchieta.";

export const viewport: Viewport = {
  themeColor: "#070414",
};

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: URL_PAGINA },
  robots: { index: true, follow: true },
  keywords: [
    "MyBots",
    "app grátis",
    "bots de IA",
    "APK Android",
    "Balão da Informática Anchieta",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_PAGINA,
    siteName: "Balão da Informática",
    title: "MyBots — app e uso 100% grátis",
    description: DESCRICAO,
    images: [{ url: POSTER, width: 1280, height: 720, alt: "Amebas de IA do comercial MyBots" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyBots — app e uso 100% grátis",
    description: DESCRICAO,
    images: [POSTER],
  },
};

const BOTS: { nome: string; texto: string; Icone: LucideIcon }[] = [
  {
    nome: "Cientista",
    texto: "Explica ciência de forma simples e divertida.",
    Icone: FlaskConical,
  },
  {
    nome: "Tradutor",
    texto: "Traduz textos rápido e com precisão.",
    Icone: Languages,
  },
  {
    nome: "Criativo",
    texto: "Gera ideias, textos e histórias incríveis.",
    Icone: Lightbulb,
  },
  {
    nome: "Matemático",
    texto: "Resolve contas e te ajuda a aprender.",
    Icone: Calculator,
  },
];

const CARTOES: {
  titulo: string;
  texto: string;
  Icone: LucideIcon;
  Extra: LucideIcon;
  tom: string;
}[] = [
  {
    titulo: "Bots inteligentes",
    texto: "IA prática para te ajudar no dia a dia.",
    Icone: Bot,
    Extra: Rocket,
    tom: estilos.tomRoxo,
  },
  {
    titulo: "Controle pelo celular",
    texto: "Gerencie tudo direto do seu Android.",
    Icone: Smartphone,
    Extra: ShieldCheck,
    tom: estilos.tomCiano,
  },
  {
    titulo: "Grátis para sempre",
    texto: "Baixe, use e aproveite sem pagar nada.",
    Icone: Gift,
    Extra: Infinito,
    tom: estilos.tomVerde,
  },
];

const PASSOS = [
  {
    titulo: "Baixe o APK",
    texto: "Toque no botão verde “Baixar APK para Android”. O arquivo MyBots.apk chega no celular. O download é grátis.",
  },
  {
    titulo: "Abra o arquivo",
    texto: "Quando terminar, toque na notificação do download ou abra MyBots.apk na pasta Downloads.",
  },
  {
    titulo: "Permita fontes desconhecidas",
    texto: "O Android avisa porque o app não veio da Play Store. Toque em Configurações e ative “Permitir desta fonte”. Volte e confirme Instalar.",
  },
  {
    titulo: "Abra e use de graça",
    texto: "Pronto. O app e o uso são 100% grátis: sem mensalidade e sem compra dentro do aplicativo.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MyBots",
  operatingSystem: "Android",
  applicationCategory: "UtilitiesApplication",
  description: DESCRICAO,
  url: URL_PAGINA,
  downloadUrl: "https://www.balao.info/downloads/MyBots.apk",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
  author: { "@type": "Person", name: "Thiago Herrera" },
  publisher: { "@type": "Organization", name: "Balão da Informática Anchieta" },
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

function Logo() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
      <defs>
        <linearGradient id="mybots-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="40" height="36" rx="12" fill="url(#mybots-logo)" />
      <circle cx="18" cy="24" r="3" fill="#12081f" />
      <circle cx="30" cy="24" r="3" fill="#12081f" />
      <path
        d="M18 31.2c2.2 2.2 9.8 2.2 12 0"
        stroke="#12081f"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M24 8V3" stroke="#a5f3fc" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="2.5" r="2" fill="#a5f3fc" />
    </svg>
  );
}

function BotaoBaixar() {
  return (
    <a className={estilos.botao} href={APK} download="MyBots.apk">
      <IconeAndroid />
      Baixar APK para Android
    </a>
  );
}

export default function PaginaMyBots() {
  return (
    <div className={`${estilos.pagina} ${fonte.variable}`}>
      <div className={estilos.estrelas} aria-hidden />
      <svg className={estilos.ondas} viewBox="0 0 1440 180" preserveAspectRatio="none" aria-hidden>
        <path
          fill="rgba(88,28,135,0.35)"
          d="M0 90c180 50 320-40 520-20s280 80 460 50 280-70 460-30v90H0Z"
        />
        <path
          fill="rgba(34,211,238,0.12)"
          d="M0 120c200 40 300-30 500-10s300 50 480 20 260-40 460-10v60H0Z"
        />
      </svg>

      <header className={`${estilos.miolo} ${estilos.topo}`}>
        <div className={estilos.marca}>
          <Logo />
          <div>
            <p className={estilos.nome}>MyBots</p>
            <p className={estilos.assinatura}>By Thiago Herrera</p>
          </div>
        </div>
        <Link className={estilos.inicio} href="/">
          <Home size={18} aria-hidden />
          Início
        </Link>
      </header>

      <main className={estilos.miolo}>
        <section className={estilos.hero}>
          <div>
            <h1 className={estilos.titulo}>
              <span className={estilos.branco}>
                Seus bots <span className={estilos.roxo}>de IA,</span>
              </span>{" "}
              <span className={estilos.ciano}>no seu bolso</span>
            </h1>
            <p className={estilos.chamada}>
              App e uso <strong className={estilos.gratis}>100% grátis</strong>
            </p>
            <BotaoBaixar />
          </div>

          <div className={estilos.celularWrap}>
            <div className={estilos.celular}>
              <div className={estilos.tela}>
                <div className={estilos.barraTela}>
                  <div className={estilos.marcaTela}>
                    <Bot size={18} aria-hidden />
                    MyBots
                  </div>
                  <div className={estilos.menu} aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <p className={estilos.ola}>Olá!</p>
                <p className={estilos.dica}>Escolha um bot e comece a usar agora.</p>
                <ul className={estilos.listaBots}>
                  {BOTS.map((bot) => (
                    <li className={estilos.bot} key={bot.nome}>
                      <div>
                        <strong>{bot.nome}</strong>
                        <p>{bot.texto}</p>
                      </div>
                      <span className={estilos.iconeBot}>
                        <bot.Icone size={16} aria-hidden />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={estilos.conectado}>
                  <span className={estilos.ponto} aria-hidden />
                  Conectado
                </p>
              </div>
            </div>
          </div>
        </section>

        <figure className={estilos.player}>
          <figcaption className={estilos.legenda}>
            <span aria-hidden>▶</span> Conheça os Bots MyBots
          </figcaption>
          <video
            className={estilos.video}
            controls
            playsInline
            preload="metadata"
            poster={POSTER}
            aria-label="Comercial dos bots MyBots, 20 segundos"
          >
            <source src={VIDEO} type="video/mp4" />
          </video>
        </figure>

        <section className={estilos.grade} aria-label="O que o MyBots oferece">
          {CARTOES.map((cartao) => (
            <article className={estilos.cartao} key={cartao.titulo}>
              <span className={`${estilos.iconeCartao} ${cartao.tom}`}>
                <cartao.Icone size={28} strokeWidth={1.75} aria-hidden />
              </span>
              <h2>{cartao.titulo}</h2>
              <p>{cartao.texto}</p>
              <cartao.Extra className={estilos.extra} size={22} aria-hidden />
            </article>
          ))}
        </section>

        <section className={estilos.instalar} aria-labelledby="como-instalar">
          <h2 id="como-instalar">Como instalar no Android</h2>
          <p>
            O app e o uso são grátis. Como o arquivo não vem da Play Store, o celular pede permissão na
            primeira vez — é o aviso de fontes desconhecidas.
          </p>
          <ol className={estilos.passos}>
            {PASSOS.map((passo, indice) => (
              <li className={estilos.passo} key={passo.titulo}>
                <span className={estilos.numero} aria-hidden>
                  {indice + 1}
                </span>
                <div>
                  <h3>{passo.titulo}</h3>
                  <p>{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <BotaoBaixar />
        </section>
      </main>

      <footer className={`${estilos.miolo} ${estilos.rodape}`}>
        <Link className={estilos.loja} href="/">
          <span className={estilos.iconeLoja}>
            <Monitor size={26} aria-hidden />
          </span>
          <span>
            <strong>Balão da Informática Anchieta</strong>
            <span>Tecnologia acessível para transformar sua rotina.</span>
          </span>
        </Link>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
