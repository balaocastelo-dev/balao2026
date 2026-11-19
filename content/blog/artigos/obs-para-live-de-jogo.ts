import type { Artigo } from "@/lib/blog/tipos";

const artigo: Artigo = {
  "slug": "obs-para-live-de-jogo",
  "titulo": "OBS para live de jogo: como montar a primeira transmissão",
  "resumo": "OBS para live de jogo: uma cena simples, o codificador da placa e um teste gravado. O passo a passo antes de abrir a Twitch ou o YouTube.",
  "categoria": "guias",
  "etiquetas": [
    "OBS",
    "Live",
    "Streaming",
    "GTA 6"
  ],
  "capa": {
    "src": "/blog/capas/obs-para-live-de-jogo.webp",
    "alt": "Notebook, microfone e câmera numa mesa, o ponto de partida do OBS para live de jogo.",
    "largura": 1536,
    "altura": 1024,
    "pronta": false
  },
  "publicadoEm": "2026-11-09T15:00:00.000Z",
  "atualizadoEm": "2026-11-19T12:00:00.000Z",
  "autor": {
    "nome": "Balão da Informática Anchieta",
    "cargo": "Loja de informática em Campinas",
    "url": "/sobre-nos"
  },
  "origem": "autoral",
  "seo": {
    "titulo": "OBS para live de jogo: cenas, encoder e teste",
    "descricao": "OBS para live de jogo: uma cena simples, o codificador da placa e um teste gravado. O passo a passo antes de abrir a Twitch ou o YouTube.",
    "palavrasChave": [
      "obs para live de jogo",
      "configurar obs",
      "obs studio live",
      "cena obs gta"
    ]
  },
  "blocos": [
    {
      "tipo": "paragrafo",
      "texto": "OBS para live de jogo é o programa gratuito que junta a tela, a sua voz e a câmera num vídeo só. O guia de início rápido do próprio OBS é a fonte. Esta matéria traduz isso para quem quer transmitir GTA, hoje no GTA V, sem se perder em filtro. O GTA 6 de PC não foi anunciado. O OBS que você aprende agora serve para qualquer jogo que já esteja instalado."
    },
    {
      "tipo": "resumo",
      "titulo": "Resposta rápida",
      "itens": [
        "Uma cena com o jogo em tela cheia, a webcam num canto e o microfone na mistura já é uma live.",
        "Prefira o codificador da placa. O guia de NVENC da OBS explica o caminho nas GeForce.",
        "Grave em disco antes de ir ao ar. A Central de Criadores da Twitch e a ajuda do YouTube entram depois que o arquivo local está bom."
      ]
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "OBS para live de jogo: a primeira cena"
    },
    {
      "tipo": "paragrafo",
      "texto": "Abra o OBS e crie uma cena chamada Jogo. Nela, uma fonte de captura do jogo, ou da tela, em tela cheia. Por cima, a webcam, pequena, num canto que não tape o minimapa. O microfone entra no misturador, não como enfeite. Alerta de seguidor, borda animada e três câmeras ficam para a segunda semana. A primeira live boa é legível: dá para ver o jogo e ouvir você."
    },
    {
      "tipo": "paragrafo",
      "texto": "O áudio estoura com facilidade. Fale no volume em que você comenta a partida e olhe a barrinha. Se ela bate no vermelho, baixe o ganho. Se o teclado aparece mais alto do que a voz, afaste o microfone das teclas ou troque o tipo, assunto da matéria de [microfone](/blog/microfone-para-live-de-jogo). Fone fechado evita que o som do jogo volte para o microfone."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/obs-para-live-de-jogo-cena.webp",
        "alt": "Celular, microfone e fone na mesa, fontes de uma cena de OBS para live de jogo.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Celular, microfone e fone na mesma mesa. No OBS, cada um vira uma fonte. Comece com poucos."
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Codificador: deixe a placa trabalhar"
    },
    {
      "tipo": "paragrafo",
      "texto": "No menu de configuração, a saída em modo avançado deixa escolher o codificador. Nas GeForce, NVENC é a escolha que o guia da OBS detalha: a placa codifica e o processador continua com o jogo. Qualidade, preset e bitrate mudam com a sua internet. Não copie um número de vídeo de 2022. Use o assistente de configuração automática do OBS como ponto de partida e compare com a recomendação atual da plataforma, na Central de Criadores da Twitch ou na ajuda de transmissão do YouTube."
    },
    {
      "tipo": "paragrafo",
      "texto": "x264 no processador serve quando a placa não tem codificador decente ou quando você grava um arquivo pesado com o jogo fechado. No meio da partida, ele compete com a cidade. Se o teste mostrar queda de quadro só quando a live arma, volte o codificador para a GPU."
    },
    {
      "tipo": "tabela",
      "titulo": "Três cenas que bastam no começo",
      "colunas": [
        "Cena",
        "O que tem",
        "Quando usar"
      ],
      "linhas": [
        [
          "Jogo",
          "Captura, webcam pequena, microfone",
          "Quase a live inteira"
        ],
        [
          "Pausa",
          "Tela parada e a sua câmera maior",
          "Banheiro, água, carregando"
        ],
        [
          "Começo e fim",
          "Seu nome e o jogo do dia",
          "Trinta segundos, não um filme"
        ]
      ],
      "nota": "Roteiro simples. O manual do programa é o guia de início rápido da OBS."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/obs-para-live-de-jogo-codifica.webp",
        "alt": "Mãos no teclado e no mouse com luz colorida, captura de jogo dentro do OBS para live.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Mãos no teclado e no mouse: a captura do jogo é a fonte principal. O resto não pode tapar a mira."
    },
    {
      "tipo": "lista",
      "ordenada": true,
      "itens": [
        "Instale o OBS pelo site oficial e rode o assistente.",
        "Monte a cena Jogo com captura, câmera e microfone.",
        "Fale um minuto e olhe se a barra de áudio estoura.",
        "Grave localmente, assista, e só então conecte a chave da plataforma.",
        "A chave da Twitch ou do YouTube fica no painel do criador, não em print de terceiros."
      ]
    },
    {
      "tipo": "pros-contras",
      "titulo": "OBS estável",
      "pros": [
        "Poucas fontes. Cada navegador aberto na cena come memória.",
        "Codificador da placa e teste gravado.",
        "Cena de pausa pronta, para você não transmitir a área de trabalho sem querer."
      ],
      "contras": [
        "Dez alertas piscando em cima do minimapa.",
        "Bitrate copiado de um vídeo antigo, maior do que a sua subida aguenta.",
        "Atualizar o OBS no minuto em que a live ia começar."
      ]
    },
    {
      "tipo": "paragrafo",
      "texto": "A máquina que segura isso está em [PC para live](/blog/pc-para-live-de-gta-6). A subida da rede, em [internet para fazer live](/blog/internet-para-fazer-live). Onde criar o canal, em [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick)."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/obs-para-live-de-jogo-fecho.webp",
        "alt": "Monitores na Balão da Informática Anchieta, referência de tela para configurar o OBS para live de jogo.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Monitores no corredor da loja: é o tipo de tela em que a cena do OBS tem de continuar legível."
    },
    {
      "tipo": "destaque",
      "tom": "atencao",
      "titulo": "Chave de transmissão",
      "texto": "A chave é a senha da sua live. Não cole em print, não mande em grupo. Se vazou, gere outra no painel da plataforma."
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Áudio que não briga com o jogo"
    },
    {
      "tipo": "paragrafo",
      "texto": "No misturador do OBS, o jogo e o microfone são faixas separadas. Baixe o jogo até você se ouvir por cima do motor do carro, sem sumir. Fone fechado é o que impede o som do jogo de voltar ao microfone e criar eco. Se você usa caixa, abaixe até quase nada ou aceite o eco. Filtro de ruído no microfone ajuda ventilador constante. Não recupera um mic em cima do teclado. A posição do microfone, na matéria própria, resolve mais do que mais um plugin."
    },
    {
      "tipo": "paragrafo",
      "texto": "Atalhos evitam o pânico. Defina uma tecla para mutar o microfone e outra para cortar para a cena de pausa. Teste as duas com a gravação local, não na primeira live com gente. Atualize o OBS num dia sem transmissão: versão nova muda botão e você não quer descobrir isso ao vivo. A chave da plataforma fica salva no programa. Se alguém sentar no seu PC, remova a chave. Gerar outra no painel da Twitch ou do YouTube leva um minuto e fecha a porta."
    },
    {
      "tipo": "lista",
      "itens": [
        "Jogo mais baixo do que a voz, no fone.",
        "Tecla de mudo e tecla de pausa, testadas.",
        "Atualize o OBS fora do horário da live."
      ]
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Quando a live cai, o que olhar primeiro"
    },
    {
      "tipo": "paragrafo",
      "texto": "Se a imagem parou e o jogo na sua tela continua, é codificador ou rede. Olhe a estatística do OBS: quadros perdidos por rede apontam a subida. Quadro perdido por codificação aponta preset pesado demais para a placa. Baixe um degrau, grave de novo e compare. Não mude cinco coisas de uma vez, senão você não sabe qual salvou."
    },
    {
      "tipo": "paragrafo",
      "texto": "Se o jogo em si caiu de fluidez, feche a pré-visualização do OBS, que também custa. Ainda ruim, a máquina está no limite e a matéria do PC para live é o próximo passo. O programa certo numa máquina curta não cria quadro. Ele só organiza o que a máquina entrega."
    },
    {
      "tipo": "chamada",
      "tema": "pc-gamer",
      "titulo": "O OBS está pronto e o PC não acompanha?",
      "texto": "A Balão da Informática Anchieta, loja de informática em Campinas vê se falta memória, placa ou disco. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.",
      "rotulo": "Ver a máquina",
      "href": "/montagempc",
      "mensagem": "Olá! Li a matéria de OBS para live de jogo e quero ver se meu PC aguenta transmitir."
    },
    {
      "tipo": "paragrafo",
      "texto": "OBS para live de jogo segue, com o restante da série, em [GTA 6 no blog](/blog/gta-6)."
    }
  ],
  "perguntas": [
    {
      "pergunta": "OBS serve para live de GTA?",
      "resposta": "Serve. É o programa gratuito que captura o jogo, a câmera e o microfone. Hoje isso vale para o GTA V. O GTA 6 de PC ainda não foi anunciado."
    },
    {
      "pergunta": "Qual codificador usar?",
      "resposta": "O da placa, quando ela tem. Nas GeForce, a OBS documenta o NVENC. Deixe o x264 para quando a GPU não puder codificar."
    },
    {
      "pergunta": "Quantas cenas eu preciso?",
      "resposta": "Três chegam: jogo, pausa, e uma de começo e fim. O resto é enfeite que come memória."
    },
    {
      "pergunta": "Como testar sem ir ao ar?",
      "resposta": "Grave localmente por alguns minutos e assista. Quadro caindo ou voz estourando se resolve antes da plateia entrar."
    },
    {
      "pergunta": "Onde pego a chave da live?",
      "resposta": "No painel de criador da Twitch ou na ajuda de transmissão do YouTube, na sua conta. Não use chave que apareceu em tutorial."
    }
  ],
  "fontes": [
    {
      "nome": "OBS Studio — guia de início rápido",
      "url": "https://obsproject.com/kb/quick-start-guide",
      "data": "consulta em 19 de novembro de 2026"
    },
    {
      "nome": "OBS Studio — guia de NVENC",
      "url": "https://obsproject.com/kb/nvenc-performance-guide",
      "data": "consulta em 19 de novembro de 2026"
    },
    {
      "nome": "Twitch — Central de Criadores",
      "url": "https://help.twitch.tv/s/article/creator-dashboard",
      "data": "consulta em 19 de novembro de 2026"
    },
    {
      "nome": "Ajuda do YouTube — transmitir ao vivo",
      "url": "https://support.google.com/youtube/answer/2474026",
      "data": "consulta em 19 de novembro de 2026"
    }
  ]
};

export default artigo;
