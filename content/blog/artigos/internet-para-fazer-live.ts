import type { Artigo, Fonte } from "@/lib/blog/tipos";

const OBS: Fonte = {
  nome: "OBS Project — OBS Studio",
  url: "https://obsproject.com/",
  data: "consulta em 19 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "internet-para-fazer-live",
  titulo: "Internet para fazer live: envio, estabilidade e teste",
  resumo: "A live depende do envio e da estabilidade, não só do download. Teste no horário em que você vai transmitir e fale com o provedor se o envio oscila.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Internet",
    "Live",
  ],
  capa: {
    src: "/blog/capas/internet-para-fazer-live.webp",
    alt: "Cabo de rede Ethernet enrolado, com o conector RJ-45.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-08T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Internet para live: envio, estabilidade e teste",
    palavrasChave: [
      "internet para live",
      "upload para transmitir",
      "estabilidade de live",
      "teste de envio",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "A live que engasga para quem assiste, enquanto o seu jogo continua liso, quase sempre está no caminho de subida. Esse caminho é o envio, o upload. O número grande de download, o que você usa para baixar o jogo, não descreve essa subida. Você pode ter uma linha folgada para receber arquivo e uma linha curta, ou instável, para transmitir. São medidas diferentes no mesmo fio.",
    },
    {
      tipo: "paragrafo",
      texto: "Este guia não publica um mega para você copiar. Um número fixo ignoraria o horário, o programa de captura e o que mais a casa faz na mesma rede. O que dá para fazer é testar na hora em que você vai transmitir, olhar o envio, repetir, e falar com o provedor se esse envio oscila. O OBS, em [obsproject.com](https://obsproject.com/), só entrega o que a sua subida consegue carregar.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A live sobe pelo envio.** Download alto não descreve essa subida.",
        "**Estabilidade pesa mais que um pico.** Um instante bonito não segura a hora.",
        "**Teste no horário real.** Com o jogo e a captura abertos, se for assim que você transmite.",
        "**Oscilou: fale com o provedor.** Leve o horário e o que aconteceu, sem mega inventado.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A live sobe pelo envio",
    },
    {
      tipo: "paragrafo",
      texto: "Quando você assiste a um vídeo, os dados descem até a sua casa. Quando você transmite, a imagem sobe da sua casa até a plataforma, e de lá desce para quem assiste. O plano anuncia a descida com mais destaque. A subida vem menor, às vezes na letra miúda. Para a live, a letra que importa é a do envio. Ler só o download é olhar o caminho contrário.",
    },
    {
      tipo: "paragrafo",
      texto: "O programa de captura prepara a imagem, e a rede a carrega. Se o envio não comporta o que o programa tenta subir, quem está de fora vê parada, quadros pulados ou queda. O seu monitor pode seguir normal, porque o jogo não depende dessa subida. Confundir as duas telas faz você trocar peça do computador para consertar um fio. Separe as falhas antes de abrir o gabinete.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/internet-para-fazer-live-caminhos.webp",
        alt: "Roteador ao lado de um monitor, numa mesa de casa.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Roteador ao lado de um monitor, numa mesa de casa. Foto de Jaycee300s (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Um pico bonito não é estabilidade",
    },
    {
      tipo: "paragrafo",
      texto: "Estabilidade é o envio se manter durante a hora da live, não um instante alto no começo do teste. Muita linha sobe bem por trinta segundos e oscila quando o bairro enche, ou quando o wi-fi disputa com a parede. A live dura mais que o instante do medidor. O que derruba a transmissão é a oscilação no meio.",
    },
    {
      tipo: "paragrafo",
      texto: "Cabo, com a máquina perto do roteador, tira oscilação que o wi-fi acrescenta na distância e na parede. Não transforma envio curto em envio largo. Serve para tirar o rádio da equação e ver a linha em si. Se no cabo o envio ainda sobe e desce, o assunto é o provedor. Se só no wi-fi oscila, o assunto é o caminho até o roteador.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "A casa inteira usa o mesmo envio",
    },
    {
      tipo: "paragrafo",
      texto: "Videochamada, backup de foto e outra televisão disputam a mesma rede no mesmo horário. Uma live testada com a casa vazia mente sobre a live das nove da noite. Combine o teste com o uso real: quem mais está em casa e se o computador está no cabo ou no wi-fi. Anotar isso evita culpar o jogo por um envio que já saiu dividido.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Testar na hora em que você transmite",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/internet-para-fazer-live-teste.webp",
        alt: "Roteador Wi-Fi com antenas e cabo, sobre uma mesa de madeira.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Roteador Wi-Fi com antenas e cabo, sobre uma mesa de madeira. Foto de Pascal (Pexels).",
    },
    {
      tipo: "paragrafo",
      texto: "Escolha um medidor que mostre o envio, não só o download. Rode na hora em que a live aconteceria, não de manhã se você transmite à noite. Deixe o jogo e o programa de captura abertos, porque é nesse estado que a rede vai trabalhar. Anote o horário, o que estava aberto e se o envio oscilou. Não anote uma meta tirada de outro texto.",
    },
    {
      tipo: "paragrafo",
      texto: "Repita em outro dia, no mesmo horário. Um único teste pega um acaso: obra na rua, chuva no rádio, alguém baixando atualização. Dois ou três registros no mesmo período mostram um padrão. Se o envio segura, a folga do computador volta à conversa, como no guia de [PC para live de GTA 6](/blog/pc-para-live-de-gta-6). Se oscila, o próximo chamado não é a placa de vídeo.",
    },
    {
      tipo: "tabela",
      titulo: "O que anotar num teste de live",
      colunas: [
        "O que anotar",
        "Para que serve",
        "O que não anotar",
      ],
      linhas: [
        [
          "Horário",
          "Bater com a hora da live",
          "Um mega copiado de guia",
        ],
        [
          "Envio",
          "Ver se a subida existe",
          "Só o download do plano",
        ],
        [
          "Oscilação",
          "Ver se cai no meio",
          "O pico do primeiro segundo",
        ],
        [
          "O que estava aberto",
          "Jogo, captura, outra pessoa",
          "Teste com a casa vazia",
        ],
      ],
      nota: "A tabela não traz velocidade de referência. O dado é o comportamento da sua linha no horário real.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que dizer ao provedor",
    },
    {
      tipo: "paragrafo",
      texto: "Se o envio oscila no horário da live, fale com o provedor com o bilhete na mão. Diga o horário, diga que a transmissão depende da subida, e diga que o envio cai enquanto o teste roda. Peça para olharem a linha nesse período. Não invente um número de mega para exigir. Você mediu o que a sua linha fez. O provedor enxerga o enlace.",
    },
    {
      tipo: "paragrafo",
      texto: "Leve também o que você já separou: cabo ou wi-fi, casa em uso ou vazia, um dia ou três. Quanto mais concreto o relato, menos a conversa vira um “a internet está ruim”. Se o provedor ajustar a linha e o envio passar a segurar no mesmo horário, a live ganha o caminho que faltava. Se continuar oscilando, o registro serve para a conversa seguinte.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não copie mega de outro guia",
      texto: "Um valor de envio que serviu na casa de outra pessoa não é a sua meta. Teste no seu horário, anote se oscilou e, se oscilou, fale com o seu provedor. O número universal não existe nesta página.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a rede não conserta no PC",
    },
    {
      tipo: "paragrafo",
      texto: "Envio estável não acerta microfone longe, câmera no escuro nem processador no limite. Se o teste segura e a live ainda falha, olhe a máquina e o programa. Cena, fonte e codificador estão em [OBS para live de jogo](/blog/obs-para-live-de-jogo). A luz do rosto está em [webcam para stream](/blog/webcam-para-stream). Trocar de plataforma não alarga o envio: Twitch, YouTube e Kick, no guia de [como começar](/blog/comecar-no-twitch-youtube-ou-kick), recebem a mesma subida.",
    },
    {
      tipo: "paragrafo",
      texto: "Enviar a mesma imagem para mais de um destino ao mesmo tempo pede mais da subida. No começo, um destino só já mostra se a linha aguenta. GTA 6 de PC não entra com um requisito de rede, porque essa versão não tinha ficha publicada. A internet que você prova é a da live de hoje. O jogo sem versão de computador não fornece um número para copiar.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/internet-para-fazer-live-fecho.webp",
        alt: "Close de uma pessoa de headset, jogando no escuro.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Close de uma pessoa de headset, jogando no escuro. Foto de Yan Krukau (Pexels).",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Você separa download de envio e deixa de ler o número do caminho contrário",
        "O teste no horário real, repetido, mostra oscilação em vez de um pico isolado",
        "O relato para o provedor leva horário e sintoma, sem meta inventada",
      ],
      contras: [
        "Um instante alto no medidor não segura a hora inteira da live",
        "Wi-fi, outra pessoa em casa e dois destinos ao mesmo tempo mudam o envio",
        "Linha estável não conserta voz, luz nem máquina no limite",
      ],
    },
    {
      tipo: "chamada",
      tema: "geral",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Levar o teste junto com a máquina",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, leve o bilhete do teste: horário, se o envio oscilou, se estava no cabo, se o jogo e a captura estavam abertos. Se a subida cai, o primeiro chamado é o provedor, não uma peça nova. Se a subida segura e a live ainda falha, a conversa passa para a folga do computador.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp é (19) 98751-0267. A decisão é não trocar de máquina para consertar envio que oscila, e não culpar a rede quando o teste já segurou. Cada uma dessas frases pede um próximo passo diferente, e as duas cabem numa mensagem curta.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta lê o teste com você.",
      texto: "No WhatsApp (19) 98751-0267, diga se o envio oscilou no horário da live. A decisão segue esse registro, sem um mega copiado.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Download alto garante que a live vai bem?",
      resposta: "Não. Download é o que desce até a sua casa. A live sobe pelo envio. Um plano com descida larga pode ter subida curta ou instável. Leia as duas medidas e teste a subida no horário em que você transmite.",
    },
    {
      pergunta: "Que horas eu testo a internet da live?",
      resposta: "Na hora em que a transmissão acontece, com o jogo e o programa de captura abertos, se for assim que você vai ao ar. Repita em outro dia no mesmo horário. Manhã vazia não descreve a noite cheia.",
    },
    {
      pergunta: "O que eu falo para o provedor se o envio oscila?",
      resposta: "Diga o horário, diga que a live depende da subida e diga que o envio cai ou varia durante o teste. Peça para olharem a linha nesse período. Não invente um número de mega para exigir.",
    },
    {
      pergunta: "Trocar de computador resolve envio oscilando?",
      resposta: "Não, se o teste já mostra a subida caindo. Aí o caminho é o provedor, o cabo ou o uso da casa na mesma rede. Troca de máquina entra na conversa quando o envio segura e a live ainda falha.",
    },
    {
      pergunta: "Posso transmitir para duas plataformas ao mesmo tempo?",
      resposta: "Pode, e a subida precisa carregar os dois envios. No começo, um destino só já mostra se a linha aguenta. Se um destino oscila, dois destinos não ficam mais folgados.",
    },
  ],
  fontes: [
    OBS,
  ],
};

export default artigo;
