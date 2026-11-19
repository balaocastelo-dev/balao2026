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

const YAHOOPC: Fonte = {
  nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
  url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
  data: "15 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "obs-para-live-de-jogo",
  titulo: "OBS para live de jogo: o que configurar antes de ir ao ar",
  resumo: "O OBS Studio é gratuito e organiza cena, fonte e codificador. Bitrate e resolução ficam na documentação atual do projeto, não numa receita fixa.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "OBS",
    "Live",
    "Transmissão",
  ],
  capa: {
    src: "/blog/capas/obs-para-live-de-jogo.webp",
    alt: "Capa do OBS Studio com cena, fonte e codificador em três blocos, sem número de bitrate",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-09T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "OBS para live: o que configurar antes de ir ao ar",
    palavrasChave: [
      "obs para live de jogo",
      "configurar obs studio",
      "obs codificador",
      "cena e fonte no obs",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "OBS para live de jogo é o OBS Studio, o programa gratuito do [OBS Project](https://obsproject.com/). Ele não joga por você. Ele monta o que o espectador vê: cenas, fontes e um codificador que comprime o vídeo. Antes de ir ao ar, essas três peças precisam existir. O número de bitrate, a resolução “certa” e o preset milagroso não saem deste texto.",
    },
    {
      tipo: "paragrafo",
      texto: "A documentação publicada pelo próprio projeto é quem atualiza esses números. Eles mudam com a versão do programa e com o destino da live. Copiar um valor velho daqui deixaria o artigo mentindo daqui a um mês. Você configura a estrutura hoje e consulta a documentação atual na hora de preencher o campo numérico. É assim que este guia se mantém honesto.",
    },
    {
      tipo: "resumo",
      itens: [
        "**OBS Studio é o programa gratuito em obsproject.com.** Cena, fonte e codificador são o miolo.",
        "**Codificador por hardware entra quando a placa oferece.** Se não oferece, codifica o processador.",
        "**Um teste gravado vem antes da live aberta.** O erro aparece sem plateia.",
        "**Bitrate, resolução e preset numérico ficam na documentação atual.** Este texto não fixa esses valores.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que é o OBS Studio",
    },
    {
      tipo: "paragrafo",
      texto: "O OBS Studio é o programa gratuito de gravar e transmitir mantido pelo OBS Project, em obsproject.com. Você instala, cria um perfil e passa a empilhar fontes dentro de cenas. Não é painel da placa de vídeo nem aplicativo do jogo. É a camada que decide o que entra no vídeo e quem comprime esse vídeo.",
    },
    {
      tipo: "paragrafo",
      texto: "Na série sobre GTA 6, o OBS entra porque a live de jogo no PC usa essa camada. O jogo ainda não tem versão de computador: a [página oficial](https://www.rockstargames.com/VI), até 19 de novembro de 2026, lista console, e o [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) não achou requisito. O OBS que você configura agora é o da live que já existe. A máquina está no guia de [PC para live](/blog/pc-para-live-de-gta-6).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Cena e fonte, antes do número",
    },
    {
      tipo: "paragrafo",
      texto: "Cena é um arranjo: uma de jogo, uma de intervalo e, se a voz continua quando o jogo sai, uma só com a câmera. Você troca de cena em vez de arrastar janela no meio da live. Fonte é cada ingrediente, como a captura do jogo ou o microfone. Sem uma cena com esses dois, a live abre em tela vazia.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/obs-para-live-de-jogo-cena.webp",
        alt: "Fluxo do OBS antes da live: montar a cena, escolher a fonte, apontar o codificador e gravar um teste",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "O teste gravado mostra a falha com a transmissão ainda fechada.",
    },
    {
      tipo: "paragrafo",
      texto: "Captura do jogo e captura da tela não são a mesma fonte. A primeira pede o jogo. A segunda pede o monitor inteiro e leva o que estiver visível, inclusive notificação. Para jogar, a captura do jogo costuma ser o caminho limpo. A de tela serve quando o programa não aceita a primeira. Você escolhe pelo que o OBS lista nessa máquina.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Codificador de placa ou de processador",
    },
    {
      tipo: "paragrafo",
      texto: "O codificador comprime o quadro. Quando a placa de vídeo tem codificador por hardware e o driver expõe isso ao OBS, a opção aparece na lista. A compressão sai pela placa e o processador fica mais disponível para o jogo. Quando a placa não oferece, o codificador é o do processador, em software. Os dois caminhos são legítimos. Nenhum deles é um botão secreto de qualidade.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "O número mora na documentação",
    },
    {
      tipo: "paragrafo",
      texto: "Bitrate, resolução de saída, quadro do vídeo e preset são campos numéricos do OBS, e a combinação boa depende da sua rede, do destino e da versão do programa. O OBS Project mantém essa orientação na documentação do site. Abra a página atual e use o valor de lá. Um número colado neste artigo envelheceria e ainda passaria por recomendação. Este texto não traz esse número.",
    },
    {
      tipo: "tabela",
      titulo: "O que fechar no OBS e o que consultar na documentação",
      colunas: [
        "Item",
        "Onde se decide",
        "O que este texto faz",
      ],
      linhas: [
        [
          "Cena",
          "No OBS, antes de ir ao ar",
          "Explica o arranjo",
        ],
        [
          "Fonte do jogo e do microfone",
          "Na cena",
          "Separa jogo e tela",
        ],
        [
          "Tipo de codificador",
          "Na lista que a sua máquina mostra",
          "Placa se houver, senão processador",
        ],
        [
          "Bitrate, resolução, preset",
          "Documentação atual do OBS",
          "Não fixa número",
        ],
      ],
      fonte: OBS,
      nota: "Os valores numéricos mudam com a versão do programa e com o destino da live.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/obs-para-live-de-jogo-codifica.webp",
        alt: "Duas colunas comparam codificador por hardware na placa e codificador pelo processador no OBS",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Hardware quando a placa tem. Processador quando não tem. Os dois são caminhos reais.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Sem receita numérica",
      texto: "Cena, fonte e o tipo de codificador dá para fechar lendo este texto. Bitrate, resolução e preset você confere na documentação atual do OBS, no dia em que for preencher.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que conferir com a transmissão fechada",
    },
    {
      tipo: "paragrafo",
      texto: "Antes de abrir a live para alguém, grave um trecho curto no disco. Assista. A voz está presente. O jogo está no quadro. O alerta de notificação não atravessou a tela. O áudio do jogo não cobre a sua fala a ponto de sumir. Esse ensaio usa a mesma cena da live e custa um arquivo, não uma plateia. Se o ensaio falha, a live ia falhar do mesmo jeito.",
    },
    {
      tipo: "paragrafo",
      texto: "Confira também o dispositivo do microfone pelo nome, não pelo “padrão do sistema”, que muda quando você espeta outro fone. Separe a faixa da voz e a faixa do jogo se o OBS mostrar as duas, para abaixar uma sem abaixar a outra. O arranjo físico da mesa, da luz e do retorno está no texto de [setup de quem transmite](/blog/setup-de-streamer-para-gta-6). Aqui a checagem é a do programa.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que este texto não fixa",
    },
    {
      tipo: "paragrafo",
      texto: "Não fixa bitrate de upload, não fixa 1080p como obrigação, não fixa preset lento nem rápido, não fixa intervalo de keyframe. Esses nomes existem no OBS e os valores corretos para o seu caso estão na documentação atual, porque mudam. Também não fixa que toda placa nova codifica por hardware: a lista do OBS na sua máquina é a prova, não a geração da placa.",
    },
    {
      tipo: "paragrafo",
      texto: "Não fixa, por fim, que o OBS deixa qualquer computador pronto para GTA 6. Sem versão de PC, não há jogo para capturar. A [máquina da live](/blog/pc-para-live-de-gta-6) se dimensiona pelos jogos que você já transmite, com folga além do jogo para a codificação. O OBS entra em cima dessa folga. Não cria a folga.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/obs-para-live-de-jogo-fecho.webp",
        alt: "Quatro peças do OBS antes da live: cena, fonte, codificador e um teste gravado, sem número de bitrate",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "O número de bitrate muda. O OBS publica a recomendação atual. Esta figura não inventa um valor.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "Cena, fonte e codificador ficam separados, então você sabe o que montar antes de procurar número",
        "O codificador da placa entra quando existe, e o do processador cobre o caso em que não existe",
        "O teste gravado acha voz, tela e notificação com a live ainda fechada",
      ],
      contras: [
        "Bitrate e resolução não estão neste texto de propósito: um valor fixo aqui ficaria velho",
        "Captura de tela pode vazar notificação se você escolher a fonte errada",
        "O OBS não compensa máquina sem folga, nem antecipa um GTA 6 de PC que não foi anunciado",
      ],
    },
    {
      tipo: "chamada",
      tema: "pc-gamer",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Se o jogo não couber na máquina",
    },
    {
      tipo: "paragrafo",
      texto: "Se a cena está certa e o ensaio gravado ainda soluça, o limite deixou de ser o OBS e passou a ser o computador. Na Balão da Informática Anchieta, Av. Anchieta, 789, no Cambuí, em Campinas, a conversa é essa folga: jogo que você já transmite, codificador pela placa ou pelo processador, memória e disco. O ensaio é na máquina acesa, antes de você decidir.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp (19) 98751-0267 recebe o modelo da placa e se o OBS lista codificador por hardware. O orçamento é o do dia, porque o preço muda. A assistência é no mesmo endereço. O programa continua gratuito em obsproject.com. A documentação de lá é quem diz o número. A loja não inventa bitrate no balcão.",
    },
    {
      tipo: "chamada",
      titulo: "A cena já existe e o jogo ainda soluça?",
      texto: "Conte o que você transmite e se o OBS mostra codificador da placa. A conversa é a folga da máquina, não um número mágico.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "OBS Studio é pago?",
      resposta: "Não. O OBS Studio é o programa gratuito do OBS Project, em obsproject.com. Você baixa, cria cenas e fontes e escolhe o codificador. O que este guia não inclui de graça são os números de bitrate e de resolução: esses ficam na documentação atual do projeto.",
    },
    {
      pergunta: "Qual bitrate eu coloco no OBS?",
      resposta: "O deste artigo, nenhum. Bitrate, resolução e preset dependem da sua rede, do destino da live e da versão do OBS. A documentação atual em obsproject.com é o lugar do número. Um valor fixado aqui envelheceria.",
    },
    {
      pergunta: "Uso codificador da placa ou do processador?",
      resposta: "Use o da placa quando o OBS listar um codificador por hardware. Use o do processador quando essa opção não aparecer. Os dois comprimem o vídeo. Nenhum é um preset universal, e a prova é a lista da sua máquina, não a geração da placa.",
    },
    {
      pergunta: "O que eu testo antes de abrir a live?",
      resposta: "Grave um trecho com a mesma cena. Veja se a voz entra, se o jogo está no quadro e se uma notificação não atravessou a captura de tela. Troque o microfone pelo nome do dispositivo. Se o ensaio falha, a live aberta falharia igual.",
    },
    {
      pergunta: "O OBS deixa o PC pronto para GTA 6?",
      resposta: "Não. Até 19 de novembro de 2026 não havia versão de PC para capturar. O OBS organiza a live dos jogos que você já transmite, desde que a máquina tenha folga para codificar vídeo além de rodar o jogo.",
    },
  ],
  fontes: [
    OBS,
    ROCKSTARVI,
    YAHOOPC,
  ],
};

export default artigo;
