/**
 * Textos e endereços da landing www.soubots.com.
 *
 * Vídeos (ainda não publicados — a página mostra um quadro até o arquivo existir):
 *   public/mybots-app/videos/00_hero_loop.mp4
 *   public/mybots-app/videos/00_hero_loop.webm
 *   public/mybots-app/videos/00_hero_poster.jpg
 *   public/mybots-app/videos/01_documentario.mp4
 *   public/mybots-app/videos/01_documentario.webm
 *   public/mybots-app/videos/01_documentario_poster.jpg
 *   public/mybots-app/videos/02_equipe_de_bolso.mp4
 *   public/mybots-app/videos/02_equipe_de_bolso.webm
 *   public/mybots-app/videos/02_equipe_de_bolso_poster.jpg
 *   public/mybots-app/videos/03_dia_que_sobrou.mp4
 *   public/mybots-app/videos/03_dia_que_sobrou.webm
 *   public/mybots-app/videos/03_dia_que_sobrou_poster.jpg
 *   public/mybots-app/videos/04_antes_e_depois.mp4
 *   public/mybots-app/videos/04_antes_e_depois.webm
 *   public/mybots-app/videos/04_antes_e_depois_poster.jpg
 *
 * O hero usa o 00 em loop, mudo, playsinline, com o poster 00_hero_poster.jpg.
 * Os quatro de baixo usam preload=none e o poster do próprio slot.
 * Pode mandar só o mp4, só o webm, ou os dois. O poster é opcional.
 */

import { URL_SITE } from "@/lib/soubots";

/** Primeira opção de title do anexo de SEO. Sem o sufixo da loja. */
export const TITULO = "MyBots: crie sua equipe de bots de IA que trabalham por você";

/** Primeira opção de meta description. */
export const DESCRICAO =
  "Entre com o Google e ganhe na hora 3 bots de IA: um Programador, um especialista em SEO e AEO e um Director de vídeo. Disponível para Windows e Android.";

/** Texto do SoftwareApplication. Sem offers: valor ainda não entra no schema. */
export const DESCRICAO_SCHEMA =
  "Plataforma de bots de IA com Hub próprio. Cada conta nasce com os bots PROGRAMADOR, SEO & AEO Desk e Director. Login com Google.";

export const H1 = "Sua equipe de bots de IA, pronta no primeiro login";

export const SUBTITULO =
  "Entre com o Google e comece com três bots especialistas que programam, cuidam do seu SEO e produzem vídeos.";

/**
 * APK Android já publicado neste repositório (applicationId info.balao.mybots).
 * Conferido em public/downloads/MyBots.apk.
 */
export const URL_APK = "/downloads/MyBots.apk";
export const NOME_APK = "MyBots.apk";

/**
 * Instalador Windows.
 * Conferido em 04/11/2026: não há .exe nem .msi publicado.
 * - balaocastelo-dev/balao2026: public/downloads só tem MyBots.apk.
 *   A release app-build-3 é balao-da-informatica.apk (app da loja, não o MyBots).
 * - balaocastelo-dev/Mybots: nenhuma release. O workflow android-apk.yml
 *   só sobe um APK de debug como artefato. install-hub.ps1 é script local.
 * Quando o arquivo existir, troque só esta constante (caminho em public/
 * ou URL absoluta). O botão da landing já aponta para cá.
 */
export const URL_INSTALADOR_WINDOWS = "/downloads/MyBots-Setup.exe";
export const NOME_INSTALADOR_WINDOWS = "MyBots-Setup.exe";

export type SlotDeVideo = {
  id: string;
  titulo: string;
  mp4: string;
  webm: string;
  poster: string;
};

function slot(id: string, titulo: string, poster: string): SlotDeVideo {
  return {
    id,
    titulo,
    mp4: `/mybots-app/videos/${id}.mp4`,
    webm: `/mybots-app/videos/${id}.webm`,
    poster,
  };
}

/** Ordem fixa. O primeiro é o fundo do hero; os outros descem a página. */
export const SLOTS_DE_VIDEO: SlotDeVideo[] = [
  slot("00_hero_loop", "MyBots", "/mybots-app/videos/00_hero_poster.jpg"),
  slot("01_documentario", "Documentário", "/mybots-app/videos/01_documentario_poster.jpg"),
  slot("02_equipe_de_bolso", "Conheça os bots", "/mybots-app/videos/02_equipe_de_bolso_poster.jpg"),
  slot("03_dia_que_sobrou", "O dia que sobrou", "/mybots-app/videos/03_dia_que_sobrou_poster.jpg"),
  slot("04_antes_e_depois", "Antes e depois", "/mybots-app/videos/04_antes_e_depois_poster.jpg"),
];

export const VIDEO_HERO = SLOTS_DE_VIDEO[0];
export const VIDEO_DOCUMENTARIO = SLOTS_DE_VIDEO[1];
export const VIDEO_EQUIPE = SLOTS_DE_VIDEO[2];
export const VIDEO_BENEFICIOS = SLOTS_DE_VIDEO[3];
export const VIDEO_ANTES_DEPOIS = SLOTS_DE_VIDEO[4];

export const BOTS = [
  {
    nome: "PROGRAMADOR",
    texto: "Cuida do código dos seus sistemas e entrega cada mudança pronta para revisão.",
  },
  {
    nome: "SEO & AEO Desk",
    texto: "Descobre o que as pessoas buscam e perguntam às IAs e escreve briefings para o seu conteúdo.",
  },
  {
    nome: "Director",
    texto: "Transforma uma ideia em vídeo curto, anúncio ou explicativo.",
  },
] as const;

export const PASSOS = [
  "Entre com sua conta Google.",
  "Seus três bots já aparecem prontos.",
  "Peça uma tarefa em português e acompanhe o resultado.",
] as const;

export const PUBLICOS = [
  "Pequenas empresas",
  "Lojistas",
  "Criadores de conteúdo",
  "Quem desenvolve sistemas",
] as const;

/** Sem a pergunta de valor. As respostas são as que aparecem na página e no FAQPage. */
export const PERGUNTAS = [
  {
    pergunta: "O que é o MyBots?",
    resposta:
      "O MyBots é uma plataforma de bots de IA com um Hub próprio. Você entra com o Google e já recebe três bots especialistas: PROGRAMADOR, SEO & AEO Desk e Director.",
  },
  {
    pergunta: "Como eu crio uma conta?",
    resposta:
      "Clique em Entrar com Google no soubots.com. A conta é criada na hora e os bots já ficam disponíveis.",
  },
  {
    pergunta: "Quais bots vêm na conta?",
    resposta:
      "O PROGRAMADOR cuida de código, o SEO & AEO Desk faz pesquisa de palavras-chave e briefings, e o Director produz vídeos.",
  },
  {
    pergunta: "O MyBots funciona no celular?",
    resposta: "Sim. Tem app para Android e para Windows.",
  },
  {
    pergunta: "Preciso saber programar?",
    resposta: "Não. Você pede as tarefas em português, como numa conversa.",
  },
] as const;

export const PALAVRAS_CHAVE = [
  "MyBots",
  "soubots",
  "bots de IA",
  "plataforma de bots de IA",
  "agentes de IA para empresas",
  "assistente de IA em português",
  "bot programador IA",
  "IA para SEO",
  "ferramenta de AEO",
  "IA para criar vídeos",
  "como criar um bot de IA sem programar",
  "equipe de agentes de IA",
  "app de IA para Windows",
  "app de IA para Android",
];

/** Amebas oficiais (pacote v2 do MyBots), reduzidas para a landing. */
export const AMEBAS = [
  { src: "/mybots-app/amebas/ameba-001.webp", lado: "esq" as const },
  { src: "/mybots-app/amebas/ameba-042.webp", lado: "dir" as const },
  { src: "/mybots-app/amebas/ameba-065.webp", lado: "esq" as const },
  { src: "/mybots-app/amebas/ameba-092.webp", lado: "dir" as const },
];

export type Deslocamento = { x: number; y: number; giro: number };

/**
 * Posição de uma ameba fixa na borda, ao longo da rolagem.
 * `progresso` vai de 0 (topo) a 1 (fim). `altura` é a janela, em px.
 */
export function deslocamentoDaAmeba(progresso: number, indice: number, altura: number): Deslocamento {
  const p = Math.min(1, Math.max(0, progresso));
  const fase = indice * 1.4;
  const faixa = indice >= 2 ? 0.32 : 0;
  const y = altura * (0.18 + faixa + p * 0.22) + Math.sin(p * Math.PI * 2 + fase) * 10;
  const x = Math.sin(p * Math.PI * 4 + fase) * 10;
  const giro = Math.sin(p * Math.PI * 2 + fase) * 5;
  return { x, y, giro };
}

/** Balanço curto das amebas que ficam no hero, no celular. */
export function balancoDoHero(progresso: number, indice: number): Deslocamento {
  const p = Math.min(1, Math.max(0, progresso));
  const fase = indice * 1.7;
  const sentido = indice % 2 === 0 ? -1 : 1;
  return {
    x: Math.sin(p * Math.PI * 3 + fase) * 8,
    y: Math.sin(p * Math.PI * 2 + fase) * 10 + p * 18 * sentido,
    giro: Math.sin(p * Math.PI * 2 + fase) * 4,
  };
}

export function jsonLdDaLanding() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "MyBots",
        url: URL_SITE,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Windows, Android",
        inLanguage: "pt-BR",
        description: DESCRICAO_SCHEMA,
        downloadUrl: `${URL_SITE}${URL_APK}`,
      },
      {
        "@type": "FAQPage",
        mainEntity: PERGUNTAS.map((item) => ({
          "@type": "Question",
          name: item.pergunta,
          acceptedAnswer: { "@type": "Answer", text: item.resposta },
        })),
      },
    ],
  };
}
