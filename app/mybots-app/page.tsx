import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import { Gift, Home, Infinity as Infinito, Monitor, Rocket, ShieldCheck, Smartphone, Bot, type LucideIcon } from "lucide-react";
import estilos from "./estilos.module.css";
import PlayerDoComercial from "./PlayerDoComercial";

// Landing de divulgação do app MyBots.
// O endereço é /mybots-app de propósito: /mybots é o Hub (rewrite no
// next.config.ts para o túnel Cloudflare) e não pode virar esta página.
//
// Para trocar o comercial, substitua estes dois arquivos (mesmo nome):
//   public/mybots-app/comercial.mp4
//   public/mybots-app/poster.jpg

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
const LOGO = "/mybots-app/logo.png";
const WHATS_NUMERO = "(19) 98751-0267";
const WHATS = `https://wa.me/5519987510267?text=${encodeURIComponent("Olá! Quero conhecer o MyBots.")}`;

const TITULO = "MyBots — seus bots trabalham por você";
const DESCRICAO =
  "Baixe o app MyBots para Android. O aplicativo e o uso são 100% grátis. Você pede em português; o bot trabalha no computador e no celular, e nada sai sem a sua aprovação. Balão da Informática Anchieta.";

export const viewport: Viewport = {
  themeColor: "#070414",
};

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: URL_PAGINA },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/mybots-app/logo.png", type: "image/png" },
    ],
    apple: "/mybots-app/logo.png",
  },
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
    images: [{ url: "/mybots-app/telas/lista.jpg", width: 1440, height: 900, alt: "Lista de bots do MyBots" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyBots — app e uso 100% grátis",
    description: DESCRICAO,
    images: ["/mybots-app/telas/lista.jpg"],
  },
};

const CARTOES: {
  titulo: string;
  texto: string;
  Icone: LucideIcon;
  Extra: LucideIcon;
  tom: string;
}[] = [
  {
    titulo: "Bots inteligentes",
    texto: "Cada um com uma função: vídeo, atendimento, planilha, o que você precisar no dia.",
    Icone: Bot,
    Extra: Rocket,
    tom: estilos.tomRoxo,
  },
  {
    titulo: "Controle pelo celular",
    texto: "Peça por texto ou por voz. Acompanhe o computador e o celular do bot na mesma tela.",
    Icone: Smartphone,
    Extra: ShieldCheck,
    tom: estilos.tomCiano,
  },
  {
    titulo: "Grátis para sempre",
    texto: "Baixe, use e aproveite sem pagar nada. Sem mensalidade.",
    Icone: Gift,
    Extra: Infinito,
    tom: estilos.tomVerde,
  },
];

const PASSOS_USO = [
  {
    titulo: "Baixe ou entre",
    texto: "No Android, baixe o aplicativo. No computador, entre pelo navegador com e-mail e senha.",
  },
  {
    titulo: "Escolha o bot",
    texto: "Abra um bot que já existe ou crie outro e diga a função dele: vendas, planilha, atendimento, texto.",
  },
  {
    titulo: "Peça e aprove",
    texto: "Fale ou escreva o que precisa. Quando for enviar, publicar ou pagar, o bot para e espera o seu ok.",
  },
];

const PASSOS_INSTALAR = [
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

type Funcao = {
  id: string;
  titulo: string;
  texto: string;
  pontos: string[];
  imagem: string;
  largura: number;
  altura: number;
  alt: string;
  legenda: string;
};

const FUNCOES: Funcao[] = [
  {
    id: "equipe",
    titulo: "Uma equipe, não um chat solto",
    texto: "Você vê quem está trabalhando agora e o que cada um está fazendo. O gerente organiza; os outros cuidam da parte deles.",
    pontos: [
      "Cada bot tem o próprio computador e o próprio celular, para trabalhar mesmo com o seu telefone no bolso.",
      "A lista mostra quem está livre e quem espera o seu ok.",
    ],
    imagem: "/mybots-app/telas/lista.jpg",
    largura: 1440,
    altura: 900,
    alt: "Lista de bots do MyBots, com Gerente Geral, Ana, Heitor e Pixel",
    legenda: "A lista de verdade do MyBots. Os nomes e os textos são de exemplo: nenhuma conta de cliente.",
  },
  {
    id: "conversa",
    titulo: "Você pede como fala. Ele lembra.",
    texto: "A conversa é simples, parecida com uma mensagem. O que você combina fica guardado: o bot não esquece quando você fecha a tela.",
    pontos: [
      "Dá para escrever ou falar no microfone. A voz é em português, natural, e ele também lê a resposta em voz alta.",
      "Na chamada, você fala e ele responde. Não é um rádio: se você falar no meio, ele cala e escuta.",
    ],
    imagem: "/mybots-app/telas/chat.jpg",
    largura: 1440,
    altura: 900,
    alt: "Conversa com o bot Pixel e o pedido de aprovação antes de enviar no WhatsApp",
    legenda: "Antes de enviar a legenda no WhatsApp, o bot para. Você toca em Aprovar ou Recusar.",
  },
  {
    id: "pc",
    titulo: "O computador do bot, na sua frente",
    texto: "Cada bot trabalha num computador só dele. Você vê a tela: o texto que ele escreveu, os arquivos, o que está aberto.",
    pontos: [
      "Dá para só olhar. O botão se chama “Só olhar”.",
      "Quando você precisa clicar ou digitar no lugar dele, toca em “Assumir o controle”. A tela volta a ser sua.",
    ],
    imagem: "/mybots-app/telas/pc.jpg",
    largura: 1440,
    altura: 900,
    alt: "Aba Meu PC com a tela do computador do bot Pixel",
    legenda: "Aba Meu PC: a tela do computador do bot, ao lado da conversa. Exemplo, sem dados de cliente.",
  },
  {
    id: "celular",
    titulo: "O celular do bot, com WhatsApp",
    texto: "Além do computador, o bot tem um celular. Dá para abrir o WhatsApp nessa tela. Quem entra na conta é você, lendo o código. O bot não entra sozinho.",
    pontos: [
      "Para mexer no aparelho, o botão é “Assumir o celular”. Enquanto isso, você só assiste.",
      "Mensagem que sai espera a sua aprovação. Nada é enviado no escuro.",
    ],
    imagem: "/mybots-app/telas/celular.jpg",
    largura: 1440,
    altura: 900,
    alt: "Aba Celular do bot, com o WhatsApp aguardando o dono ler o código",
    legenda: "Aba Celular. O WhatsApp fica nessa tela até você ler o código. Sem login automático.",
  },
  {
    id: "trabalho",
    titulo: "A aba Trabalho mostra o que ele fez",
    texto: "Não precisa caçar mensagem antiga. A aba Trabalho junta o que o bot produziu: imagem, texto, planilha, PDF.",
    pontos: [
      "Dá para ver só os arquivos daquele bot ou de todos.",
      "Baixar e abrir ficam no mesmo cartão.",
    ],
    imagem: "/mybots-app/telas/trabalho.jpg",
    largura: 1440,
    altura: 900,
    alt: "Aba Trabalho com a capa da vitrine e o roteiro feitos pelo bot",
    legenda: "Aba Trabalho do Pixel: a capa e o roteiro que ele acabou de entregar.",
  },
  {
    id: "arquivos",
    titulo: "Todos os arquivos, num lugar só",
    texto: "O botão de pasta abre os arquivos de todos os bots. Imagem, texto, planilha e PDF ficam separados por tipo.",
    pontos: [
      "Você vê quem fez, a hora e o tamanho.",
      "Dá para voltar na conversa daquele bot com um toque.",
    ],
    imagem: "/mybots-app/telas/arquivos.jpg",
    largura: 1440,
    altura: 900,
    alt: "Janela Arquivos do MyBots com capa, roteiro, planilha e PDF de exemplo",
    legenda: "Arquivos de todos os bots. Tudo aqui é exemplo, feito para mostrar a tela.",
  },
  {
    id: "habilidades",
    titulo: "Ele já nasce sabendo fazer coisas",
    texto: "Na hora de criar o bot, você escolhe a especialidade: vendas, atendimento, marketing, planilha, texto e outras. Todo bot novo já traz um conjunto de habilidades — escrever, lembrar, pesquisar, montar arquivo — e pede licença antes de agir para fora.",
    pontos: [
      "A busca aceita a palavra do dia a dia: “vendas”, “advogado”, “amigo”.",
      "O que depende de uma conta sua só funciona depois que você configura. O bot avisa, em vez de inventar que deu certo.",
    ],
    imagem: "/mybots-app/telas/habilidades.jpg",
    largura: 1440,
    altura: 900,
    alt: "Criação de bot com a lista de especialidades do MyBots",
    legenda: "Especialidades de verdade do MyBots, na tela de criar um bot.",
  },
  {
    id: "android",
    titulo: "O aplicativo de Android",
    texto: "No celular a lista ocupa a tela inteira. Você toca no bot, conversa, aprova e volta. O arquivo para instalar é o APK desta página.",
    pontos: [
      "O microfone fica no campo de escrever: fale e, quando parar, a frase segue.",
      "O app é para Android. No iPhone, use o acesso pelo navegador.",
    ],
    imagem: "/mybots-app/telas/android.jpg",
    largura: 780,
    altura: 1688,
    alt: "Aplicativo MyBots no celular, com a lista de bots",
    legenda: "O MyBots no tamanho do celular. Pixel está esperando o seu ok.",
  },
  {
    id: "login",
    titulo: "Entre de qualquer lugar",
    texto: "Além do aplicativo, dá para abrir o MyBots no navegador. A entrada pede e-mail e senha. Sem isso, a tela não abre.",
    pontos: [
      "A mesma equipe aparece no computador e no celular.",
      "Só uma janela fica ativa por vez, para dois painéis não falarem juntos.",
    ],
    imagem: "/mybots-app/telas/login.jpg",
    largura: 900,
    altura: 820,
    alt: "Tela de login do MyBots, com e-mail e senha",
    legenda: "A entrada online. Não há conta de exemplo preenchida: o acesso é o seu.",
  },
];

const PERFIS = [
  {
    titulo: "Dono de loja",
    texto: "Peça a planilha do que entrou, a capa da vitrine e um texto para o cliente. O que for para fora espera você aprovar.",
  },
  {
    titulo: "Profissional liberal",
    texto: "Organize o dia, peça um texto ou um lembrete. O bot guarda o que você combinou e não mistura com outra pessoa.",
  },
  {
    titulo: "Vendedor",
    texto: "Monte um roteiro de conversa e deixe a resposta pronta. Ela só segue depois do seu ok.",
  },
  {
    titulo: "Quem quer automatizar o dia",
    texto: "Crie uma rotina, por exemplo toda sexta. No horário, o bot faz a tarefa e deixa o arquivo na aba Trabalho.",
  },
];

const PERGUNTAS = [
  {
    pergunta: "O aplicativo é pago?",
    resposta: "Não. O app e o uso são 100% grátis. Não tem mensalidade e não tem compra dentro do aplicativo.",
  },
  {
    pergunta: "Precisa da Play Store?",
    resposta: "Não. O arquivo é o APK desta página. Na primeira vez o Android pede para permitir fontes desconhecidas. O passo a passo está aqui embaixo.",
  },
  {
    pergunta: "O bot manda mensagem sozinho?",
    resposta: "Não. Mensagem, publicação e pagamento esperam a sua aprovação. Você vê o texto e toca em Aprovar ou Recusar.",
  },
  {
    pergunta: "Funciona no iPhone?",
    resposta: "O arquivo para instalar é de Android. No iPhone e no computador, entre pelo navegador, com e-mail e senha.",
  },
  {
    pergunta: "Preciso entender de computador?",
    resposta: "Não. Você pede em português, do jeito que fala. A tela mostra o que o bot fez e o que está esperando você.",
  },
  {
    pergunta: "O WhatsApp entra sozinho?",
    resposta: "Não. O celular do bot abre o WhatsApp e mostra o código. Quem lê o código é você. Sem isso, ninguém entra na conta.",
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

function IconeWhats() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10.1 10.1 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 14.15c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.12.1-1.81-.11-.42-.13-.95-.3-1.64-.59-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.3.01.44.03.64.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.27.48-.14.16-.29.36-.41.48-.14.13-.28.28-.12.54.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.16 1.34.27.13.42.11.58-.07.16-.17.67-.78.85-1.05.18-.26.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.44.2.51.31.06.11.06.64-.18 1.32z"
      />
    </svg>
  );
}

function Acoes() {
  return (
    <div className={estilos.acoes}>
      <a className={estilos.botao} href={APK} download="MyBots.apk">
        <IconeAndroid />
        Baixar APK para Android
      </a>
      <a className={estilos.whats} href={WHATS} target="_blank" rel="noopener noreferrer">
        <IconeWhats />
        WhatsApp {WHATS_NUMERO}
      </a>
    </div>
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
          <img className={estilos.logo} src={LOGO} width={256} height={256} alt="" />
          <div>
            <p className={estilos.nome}>MyBots</p>
            <p className={estilos.assinatura}>By Thiago Herrera</p>
          </div>
        </div>
        <div className={estilos.topoAcoes}>
          <a className={estilos.whatsTopo} href={WHATS} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <Link className={estilos.inicio} href="/">
            <Home size={18} aria-hidden />
            Início
          </Link>
        </div>
      </header>

      <main className={estilos.miolo}>
        <section className={estilos.hero}>
          <div>
            <h1 className={estilos.titulo}>
              <span className={estilos.branco}>
                Seus bots <span className={estilos.roxo}>trabalham</span>
              </span>{" "}
              <span className={estilos.ciano}>por você</span>
            </h1>
            <p className={estilos.lead}>
              Você pede em português. O bot pesquisa, escreve, organiza e deixa o arquivo pronto.
              Mensagem, publicação e pagamento só saem quando você aprova.
            </p>
            <p className={estilos.chamada}>
              App e uso <strong className={estilos.gratis}>100% grátis</strong>
            </p>
            <Acoes />
          </div>
          <div className={estilos.celularWrap}>
            <div className={estilos.moldura}>
              <img
                src="/mybots-app/telas/android.jpg"
                width={780}
                height={1688}
                alt="Aplicativo MyBots aberto no celular, com a lista de bots"
              />
            </div>
          </div>
        </section>

        <figure className={estilos.player}>
          <figcaption className={estilos.legenda}>
            <span aria-hidden>▶</span> Conheça os Bots MyBots
          </figcaption>
          <PlayerDoComercial src={VIDEO} poster={POSTER} />
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

        <section className={estilos.bloco} aria-labelledby="o-que-e">
          <h2 id="o-que-e">O que é o MyBots</h2>
          <p>
            É uma equipe de ajudantes no seu celular. Cada um tem uma função. Você conversa com eles
            por texto ou por voz, vê o computador e o celular em que eles trabalham, e confere o que
            produziram. Quem manda é você: o que sai para o mundo passa pela sua mão.
          </p>
        </section>

        <section className={estilos.bloco} aria-labelledby="como-funciona">
          <h2 id="como-funciona">Como funciona em 3 passos</h2>
          <ol className={estilos.passos}>
            {PASSOS_USO.map((passo, indice) => (
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
          <Acoes />
        </section>

        <section className={estilos.bloco} aria-labelledby="funcoes">
          <h2 id="funcoes">O que você faz com ele</h2>
          <p className={estilos.notaTelas}>
            As imagens são telas reais do MyBots, rodadas com dados de exemplo. Não há cliente, chave nem conta de ninguém.
          </p>
          {FUNCOES.map((funcao, indice) => (
            <article className={indice % 2 ? `${estilos.funcao} ${estilos.invert}` : estilos.funcao} key={funcao.id} id={funcao.id}>
              <div>
                <h3>{funcao.titulo}</h3>
                <p>{funcao.texto}</p>
                <ul>
                  {funcao.pontos.map((ponto) => (
                    <li key={ponto}>{ponto}</li>
                  ))}
                </ul>
              </div>
              <figure className={estilos.foto}>
                <img
                  src={funcao.imagem}
                  width={funcao.largura}
                  height={funcao.altura}
                  alt={funcao.alt}
                  loading="lazy"
                />
                <figcaption>{funcao.legenda}</figcaption>
              </figure>
            </article>
          ))}
        </section>

        <section className={estilos.bloco} aria-labelledby="para-quem">
          <h2 id="para-quem">Para quem é</h2>
          <div className={estilos.perfis}>
            {PERFIS.map((perfil) => (
              <article className={estilos.perfil} key={perfil.titulo}>
                <h3>{perfil.titulo}</h3>
                <p>{perfil.texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={estilos.bloco} aria-labelledby="seguranca">
          <h2 id="seguranca">Nada sai sem a sua aprovação</h2>
          <p>
            O padrão é supervisionado: o bot pede licença para o que muda alguma coisa. Mensagem para
            fora, publicação e pagamento pedem o seu ok em qualquer modo — inclusive se um dia você
            liberar o bot para agir mais sozinho. Você vê o pedido na conversa, com o texto, e escolhe
            Aprovar ou Recusar.
          </p>
          <ul className={estilos.listaSegura}>
            <li>O WhatsApp só entra quando você lê o código.</li>
            <li>Dá para só olhar a tela do computador ou do celular, e assumir o controle quando quiser.</li>
            <li>Um botão para tudo: a fala, o microfone e o que estava em andamento.</li>
          </ul>
          <Acoes />
        </section>

        <section className={estilos.bloco} aria-labelledby="perguntas">
          <h2 id="perguntas">Perguntas frequentes</h2>
          <div className={estilos.faq}>
            {PERGUNTAS.map((item) => (
              <details key={item.pergunta}>
                <summary>{item.pergunta}</summary>
                <p>{item.resposta}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={estilos.instalar} aria-labelledby="como-instalar">
          <h2 id="como-instalar">Como instalar no Android</h2>
          <p>
            O app e o uso são grátis. Como o arquivo não vem da Play Store, o celular pede permissão na
            primeira vez — é o aviso de fontes desconhecidas.
          </p>
          <ol className={estilos.passos}>
            {PASSOS_INSTALAR.map((passo, indice) => (
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
          <Acoes />
        </section>

        <section className={estilos.ctaFinal} aria-labelledby="cta-final">
          <h2 id="cta-final">Comece agora, no seu celular</h2>
          <p>Baixe o aplicativo ou chame no WhatsApp {WHATS_NUMERO} que a gente te ajuda a abrir o primeiro bot.</p>
          <Acoes />
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

      <div className={estilos.barraFixa}>
        <a className={estilos.botao} href={APK} download="MyBots.apk">
          <IconeAndroid />
          Baixar APK
        </a>
        <a className={estilos.whats} href={WHATS} target="_blank" rel="noopener noreferrer">
          <IconeWhats />
          WhatsApp
        </a>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
