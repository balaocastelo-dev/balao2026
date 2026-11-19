import type { Artigo, Fonte } from "@/lib/blog/tipos";

const OBS: Fonte = {
  nome: "OBS Project — OBS Studio",
  url: "https://obsproject.com/",
  data: "consulta em 19 de novembro de 2026",
};

const ROCKSTARVI: Fonte = {
  nome: "Rockstar Games — página oficial de Grand Theft Auto VI",
  url: "https://www.rockstargames.com/VI",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "comecar-no-twitch-youtube-ou-kick",
  titulo: "Como começar no Twitch, YouTube ou Kick com um PC",
  resumo: "Dá para abrir conta e transmitir no Twitch, no YouTube ou no Kick. Comece pela categoria, pelo título honesto, pelo horário repetido e pelo áudio.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Twitch",
    "YouTube",
    "Kick",
  ],
  capa: {
    src: "/blog/capas/comecar-no-twitch-youtube-ou-kick.webp",
    alt: "Capa sobre começar a transmitir no Twitch, no YouTube ou no Kick, sem eleger uma plataforma vencedora",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-07T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Como começar no Twitch, YouTube ou Kick",
    palavrasChave: [
      "começar no twitch",
      "live no youtube",
      "começar no kick",
      "primeira live no pc",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Dá para abrir uma conta e transmitir no Twitch, no YouTube ou no Kick. As três são portas de live a partir do computador que você já tem. Nenhuma fica acima das outras neste texto, e nenhuma promete que alguém vai encontrar você. No primeiro dia, o que muda é a categoria do jogo na tela, o título que não mente, o horário repetido e o áudio.",
    },
    {
      tipo: "paragrafo",
      texto: "O PC entra como a máquina que roda o jogo e o programa de captura, não como talismã de audiência. GTA 6 de computador não estava na [página da Rockstar](https://www.rockstargames.com/VI) até 19 de novembro de 2026, então a primeira live usa o jogo que você já abre. Overlay e alerta esperam a voz ficar inteligível. Sem isso, a conta nova publica um murmúrio com desenho em cima.",
    },
    {
      tipo: "resumo",
      itens: [
        "**Dá para abrir conta nos três.** Twitch, YouTube e Kick transmitem a partir do PC.",
        "**Cada um tem uma diferença, sem pódio.** Estrutura não é ranking nem promessa de descoberta.",
        "**Comece por categoria e título honesto.** O horário repetido vem junto.",
        "**Áudio inteligível antes do overlay.** Enfeite não conserta frase opaca.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Três lugares onde dá para abrir conta",
    },
    {
      tipo: "paragrafo",
      texto: "No Twitch você cria a conta, escolhe a categoria do jogo que está aberto e transmite para essa prateleira de canais ao vivo. A navegação principal do serviço é essa prateleira. Estar na categoria certa coloca a live junto dos outros canais daquele jogo. Não enche a sala. Só evita que você fique na prateleira de outro jogo, onde quem procura o seu título nem passa.",
    },
    {
      tipo: "paragrafo",
      texto: "No YouTube a live acontece dentro de um canal, o mesmo que também publica vídeo. A transmissão pode permanecer no canal depois que termina, ao lado dos vídeos que continuam lá. Você não está só numa grade que some ao encerrar. Também não está, por causa disso, garantido na frente de ninguém. O canal guarda. A descoberta é outra conversa, e este texto não a promete.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/comecar-no-twitch-youtube-ou-kick-plataformas.webp",
        alt: "Três cartões com uma diferença do Twitch, do YouTube e do Kick, sem eleger plataforma",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Cada cartão é uma frase de diferença. Nenhum deles diz que você será encontrado.",
    },
    {
      tipo: "paragrafo",
      texto: "No Kick você abre uma conta própria, num serviço à parte, e transmite ao vivo por lá. Não é um modo escondido do Twitch nem uma aba do YouTube. A diferença que cabe numa frase é essa: outra casa, outra conta, o mesmo tipo de tarefa. Comparar pagamento, fama ou facilidade de crescer fica fora desta página. Crescer não é um botão de cadastro.",
    },
    {
      tipo: "paragrafo",
      texto: "Mandar a mesma imagem para as três no mesmo dia multiplica o envio. A subida da internet precisa carregar cada destino. O guia de [internet para fazer live](/blog/internet-para-fazer-live) explica por que o download do plano não responde a essa conta. No primeiro ciclo, um destino só já mostra se a voz, a categoria e a rede aguentam.",
    },
    {
      tipo: "tabela",
      titulo: "Diferença e limite de cada porta",
      colunas: [
        "Onde",
        "Uma diferença",
        "O que não está prometido",
      ],
      linhas: [
        [
          "Twitch",
          "Prateleira ao vivo por categoria",
          "Que alguém entre",
        ],
        [
          "YouTube",
          "Live dentro de um canal de vídeos",
          "Alcance por existir vídeo",
        ],
        [
          "Kick",
          "Serviço e conta à parte",
          "Atalho de crescimento",
        ],
        [
          "Os três",
          "Dá para abrir conta e transmitir",
          "Plateia ou pagamento",
        ],
      ],
      nota: "A tabela descreve estrutura. Não ordena plataformas e não estima audiência.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Conta aberta não é live pronta",
    },
    {
      tipo: "paragrafo",
      texto: "O cadastro termina em minutos. A live pronta é outra etapa: jogo estável, programa recebendo o jogo e o microfone, título escrito, categoria conferida. Pular da conta para o overlay deixa um buraco no meio. Nesse buraco mora a voz que ninguém entende e o jogo errado na prateleira. Volte uma etapa. A conta espera sem estragar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Categoria certa e título que não mente",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/comecar-no-twitch-youtube-ou-kick-comeco.webp",
        alt: "Fluxo para começar a live: categoria do jogo, título honesto, horário repetido e áudio antes do enfeite",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Categoria errada e título inflado não se consertam com borda colorida. O áudio vem antes do desenho.",
    },
    {
      tipo: "paragrafo",
      texto: "A categoria é a do jogo que está na tela. Se você está em GTA V, a categoria é essa. Colocar outro título para associar a live a um lançamento empurra quem entra para uma sessão diferente da que foi pedida. A pessoa sai. GTA 6 de PC, sem versão anunciada, não é uma categoria que o seu computador esteja cumprindo.",
    },
    {
      tipo: "paragrafo",
      texto: "O título honesto diz o que você está fazendo: o modo, a missão, a cidade da sessão, o fato de ser a primeira live. Não promete prêmio e não copia a frase de um canal grande. Título inflado atrai quem procura outra coisa e aumenta a saída. Se a sessão for RP de GTA V, o guia de [GTA RP](/blog/gta-rp-e-o-que-o-gta-6-nao-e) evita anunciar um modo de GTA 6 que não existe.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O mesmo horário, várias vezes",
    },
    {
      tipo: "paragrafo",
      texto: "Horário repetido é escolher dias e uma hora de início que você consegue cumprir de novo. Quem voltaria precisa de um momento previsível. Sem repetição, cada live é um acidente, e você não sabe se a falha foi o envio da noite, o cansaço ou o título. O hábito serve para comparar uma semana com a outra. Não é promessa de público.",
    },
    {
      tipo: "paragrafo",
      texto: "Escolha um bloco que caiba na sua vida real, com a casa no estado em que a rede vai estar. Uma hora que você só consegue em silêncio absoluto, e que nunca mais se repete, não serve de teste. Combine com o que está em [internet para fazer live](/blog/internet-para-fazer-live): medir o envio naquele horário. Se a subida oscila às nove, mudar de plataforma não muda o relógio do bairro.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Áudio inteligível antes do overlay",
    },
    {
      tipo: "paragrafo",
      texto: "A pessoa precisa entender a frase antes de admirar a borda. Microfone perto da boca, como está em [microfone para live](/blog/microfone-para-live-de-jogo), vem antes de alerta e moldura. Grave um minuto e ouça no fone. Se a própria voz pede esforço, ainda não é hora de enfeite. O OBS, gratuito em [obsproject.com](https://obsproject.com/), está explicado em [OBS para live de jogo](/blog/obs-para-live-de-jogo).",
    },
    {
      tipo: "paragrafo",
      texto: "Comece com cena limpa: jogo e voz. Câmera, se entrar, entra com luz na cara, não como adesivo. O [setup de streamer](/blog/setup-de-streamer-para-gta-6) organiza essa ordem no canto físico. Quando a cena limpa se sustenta por uma hora, aí o desenho tem o que enfeitar. Antes disso, o overlay só decora um problema.",
    },
    {
      tipo: "destaque",
      tom: "nota",
      titulo: "Nenhuma das três descobre você por cadastro",
      texto: "Abrir conta no Twitch, no YouTube ou no Kick permite transmitir. Não promete que a live será encontrada, recomendada ou paga. Categoria, título, horário e áudio são condições, não um contrato de audiência.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O computador entra na conta, não no lugar dela",
    },
    {
      tipo: "paragrafo",
      texto: "O PC precisa abrir o jogo e o programa de captura ao mesmo tempo, com folga para a voz. Isso vale nas três plataformas, porque as três recebem a imagem que o computador produz. Um notebook também faz essa função, com uma tela só e aquecimento em sessão longa. A página de [notebooks](/notebooks) cabe se a máquina é essa. Ela não escolhe a plataforma.",
    },
    {
      tipo: "paragrafo",
      texto: "Não troque de computador para corrigir categoria errada, título inflado ou envio que oscila. Essas falhas sobrevivem à peça nova. A conversa de máquina começa quando o jogo e a captura não cabem juntos. A série em [GTA 6 no blog](/blog/gta-6) separa anúncio de requisito. Até haver versão de PC, a conta transmite o jogo que já roda.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/comecar-no-twitch-youtube-ou-kick-fecho.webp",
        alt: "Quatro passos para começar no Twitch, YouTube ou Kick: categoria, título honesto, horário repetido e áudio antes do enfeite",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Nenhuma plataforma é eleita aqui. O que as três pedem no começo é o mesmo: categoria, título, horário e voz.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Twitch, YouTube e Kick ficam descritos por uma diferença cada, sem ranking",
        "Categoria, título honesto, horário repetido e áudio formam um começo repetível",
        "Um destino só, no início, não multiplica o envio antes da hora",
      ],
      contras: [
        "Nenhuma conta promete descoberta nem audiência",
        "Overlay antes da voz inteligível decora um problema",
        "Mandar a mesma live para os três de uma vez pede mais da subida",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Abrir a conta e dizer o que o PC já faz",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, diga qual conta você abriu e se a voz se entende com o jogo aberto. A equipe olha a máquina por esse uso e mostra ela ligada. A escolha entre Twitch, YouTube e Kick continua sua. A loja não elege uma plataforma nem promete que a live será encontrada.",
    },
    {
      tipo: "paragrafo",
      texto: "WhatsApp (19) 98751-0267. A decisão é começar por uma conta, na categoria do jogo que está na tela, com título honesto e áudio claro, no horário que você consegue repetir. Se a máquina não aguenta jogo e captura juntos, a conversa é essa folga. Se aguenta, a peça nova pode esperar.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta não escolhe a plataforma por você.",
      texto: "No WhatsApp (19) 98751-0267, diga o jogo que já abre e se a voz cabe junto. A decisão é a máquina desse uso, sem promessa de audiência.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Preciso eleger uma plataforma para começar?",
      resposta: "Não. No Twitch a prateleira é a de canais ao vivo por categoria. No YouTube a live fica num canal que também guarda vídeo. No Kick a conta é de um serviço à parte. Nenhum dos três promete que você será encontrado.",
    },
    {
      pergunta: "O que eu faço no primeiro dia de live?",
      resposta: "Abra uma conta, escolha a categoria do jogo que está na tela, escreva um título honesto e repita um horário que você consegue cumprir. Deixe o áudio inteligível antes de colocar overlay. Um destino só já basta para o teste.",
    },
    {
      pergunta: "Overlay ajuda quem está começando?",
      resposta: "Não antes da voz. Alerta e borda não tornam a frase compreensível. Grave um minuto, ouça no fone e só então enfeite a cena, se a cena limpa já se sustenta.",
    },
    {
      pergunta: "Preciso de GTA 6 no PC para a primeira live?",
      resposta: "Não. Até 19 de novembro de 2026 a versão de PC não estava anunciada. Você transmite o jogo que o computador já abre, na categoria desse jogo, com título que não finja outro lançamento.",
    },
  ],
  fontes: [
    OBS,
    ROCKSTARVI,
  ],
};

export default artigo;
