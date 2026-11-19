import type { Artigo } from "@/lib/blog/tipos";

const artigo: Artigo = {
  "slug": "internet-para-fazer-live",
  "titulo": "Internet para fazer live: o que medir antes de abrir",
  "resumo": "Internet para fazer live depende da subida, não do download do anúncio. Use cabo, meça na hora da live e deixe folga acima do bitrate.",
  "categoria": "guias",
  "etiquetas": [
    "Internet",
    "Live",
    "Streaming"
  ],
  "capa": {
    "src": "/blog/capas/internet-para-fazer-live.webp",
    "alt": "Cabo de rede Ethernet com conector RJ-45, o caminho estável de internet para fazer live.",
    "largura": 1536,
    "altura": 1024,
    "pronta": false
  },
  "publicadoEm": "2026-11-08T12:00:00.000Z",
  "atualizadoEm": "2026-11-19T12:00:00.000Z",
  "autor": {
    "nome": "Balão da Informática Anchieta",
    "cargo": "Loja de informática em Campinas",
    "url": "/sobre-nos"
  },
  "origem": "autoral",
  "seo": {
    "titulo": "Internet para fazer live: upload, cabo e teste",
    "descricao": "Internet para fazer live depende da subida, não do download do anúncio. Use cabo, meça na hora da live e deixe folga acima do bitrate.",
    "palavrasChave": [
      "internet para fazer live",
      "upload para stream",
      "quantos megas para live",
      "cabo ou wifi para transmitir"
    ]
  },
  "blocos": [
    {
      "tipo": "paragrafo",
      "texto": "Internet para fazer live é a subida, o upload, estável na hora em que você transmite. A propaganda do plano fala o download, que baixa jogo e página. Quem assiste a sua live depende do caminho contrário. O OBS manda o vídeo para a Twitch, o YouTube ou a Kick. Se essa subida oscila, a imagem para, mesmo com o PC sobrando."
    },
    {
      "tipo": "resumo",
      "titulo": "Resposta rápida",
      "itens": [
        "Cabo Ethernet no PC. Wi-Fi serve para o celular, e oscila quando o micro-ondas ou a parede entram no meio.",
        "Meça a subida no horário da live, não às três da tarde de um domingo vazio.",
        "O bitrate do OBS precisa caber na subida com folga. O número certo é o da recomendação atual da plataforma, não um print antigo."
      ]
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Internet para fazer live: subida, cabo e horário"
    },
    {
      "tipo": "paragrafo",
      "texto": "Faça um teste de velocidade no computador que vai transmitir, com cabo, no horário em que a live acontece. Anote a subida, não só a descida. Repita em dois dias. Se um dia dá um número e no outro cai pela metade, o problema é estabilidade, e bitrate alto só vai piorar. O assistente do OBS sugere um ponto de partida. A Central de Criadores da Twitch e a ajuda de transmissão do YouTube publicam a recomendação vigente. Use a de agora, porque essas tabelas mudam."
    },
    {
      "tipo": "paragrafo",
      "texto": "Deixe folga. Se o OBS manda quase o total da sua subida, qualquer outra pessoa da casa num vídeo já derruba a live. Feche backup de nuvem e atualização de jogo antes de ir ao ar. Baixar o GTA e transmitir ao mesmo tempo, no mesmo enlace, é o jeito clássico de culpar a plataforma por um congestionamento que está na sua rede."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/internet-para-fazer-live-caminhos.webp",
        "alt": "Roteador ao lado de um monitor, cenário de internet para fazer live com cabo em vez de Wi-Fi.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Roteador ao lado do monitor: perto do PC o cabo é curto, e curto é bom. Wi-Fi atravessando a casa é que falha."
    },
    {
      "tipo": "tabela",
      "titulo": "O que medir de verdade",
      "colunas": [
        "Medida",
        "Por que importa",
        "O que ignorar"
      ],
      "linhas": [
        [
          "Upload no horário da live",
          "É o vídeo saindo",
          "O download gigante do anúncio do plano"
        ],
        [
          "Teste repetido",
          "Mostra se oscila",
          "Um único teste às 15h"
        ],
        [
          "Cabo no PC da live",
          "Tira o Wi-Fi do caminho",
          "O celular ao lado do roteador, que não é o PC"
        ],
        [
          "Bitrate abaixo da subida, com folga",
          "Cabe o vídeo e o resto da casa",
          "O maior número que um tutorial de 2021 citou"
        ]
      ],
      "nota": "Método de teste. O valor em megabits recomendado está na documentação atual da Twitch, do YouTube e do assistente do OBS."
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Wi-Fi, cabo e o resto da casa"
    },
    {
      "tipo": "paragrafo",
      "texto": "Wi-Fi 5 GHz, perto do roteador, às vezes aguenta uma live leve. Parede, micro-ondas e o videogame de outra pessoa no mesmo rádio derrubam quadro sem o PC ter culpa. Cabo não discute com a parede. Se o roteador está longe, um cabo passado com cuidado, ou um par de adaptadores que você teste de verdade, vale mais do que trocar de plano às cegas. Meça de novo depois da mudança. Se o número não mudou, o limite é o plano ou o horário, não o rádio."
    },
    {
      "tipo": "paragrafo",
      "texto": "Quem divide a conexão combina a regra da noite de live: sem download grande na mesma hora. Isso é conversa de casa, e resolve mais do que o modo turbo do roteador. O PC em si, se a gravação local é boa e só a live ao vivo trava, está inocente. A matéria de [PC para live](/blog/pc-para-live-de-gta-6) separa esse diagnóstico. O [OBS](/blog/obs-para-live-de-jogo) é onde o bitrate se ajusta."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/internet-para-fazer-live-teste.webp",
        "alt": "Roteador Wi-Fi com antenas e cabo, escolha de internet para fazer live pelo Ethernet.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Antena e cabo no mesmo roteador. Para a live, use o cabo. Deixe o Wi-Fi para o celular do chat, se precisar."
    },
    {
      "tipo": "pros-contras",
      "titulo": "Live sem travar no meio",
      "pros": [
        "Ethernet no computador que transmite.",
        "Upload medido no horário real, com folga acima do bitrate.",
        "Download grande pausado enquanto você está no ar."
      ],
      "contras": [
        "Testar a velocidade no celular e achar que o PC, do outro lado da casa, tem o mesmo número.",
        "Subir o bitrate porque a imagem “ficou mais nítida no preview” e a subida não cabe.",
        "Trocar de plano sem medir. Às vezes o cabo já resolvia."
      ]
    },
    {
      "tipo": "paragrafo",
      "texto": "Onde abrir o canal, depois que a rede passa no teste, está em [Twitch, YouTube ou Kick](/blog/comecar-no-twitch-youtube-ou-kick)."
    },
    {
      "tipo": "imagem",
      "imagem": {
        "src": "/blog/figuras/internet-para-fazer-live-fecho.webp",
        "alt": "Pessoa de headset jogando no escuro, live que depende de internet estável para fazer live.",
        "largura": 1600,
        "altura": 900,
        "pronta": false
      },
      "legenda": "Headset e tela no escuro: se a imagem parar, olhe a subida antes de culpar o jogo."
    },
    {
      "tipo": "destaque",
      "tom": "dica",
      "titulo": "Ordem do diagnóstico",
      "texto": "Grave local primeiro. Se o arquivo no disco está liso e só a transmissão ao vivo trava, é rede. Se o arquivo local já soluça, é PC, e a internet nem foi testada ainda."
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "O que pausar na hora de abrir"
    },
    {
      "tipo": "paragrafo",
      "texto": "Atualização de jogo, backup de nuvem e o download de outra pessoa na mesma rede comem a subida que você mediu de manhã. Combine em casa: na hora da live, ninguém baixa filme. Pause a loja de jogos. Se o roteador tiver um modo de prioridade para o PC da transmissão, ligue e teste, não assuma que o nome do botão faz o serviço. Meça de novo com o cabo, no horário, e compare com o teste anterior. Número parecido significa que a prioridade ajudou ou que o cabo já bastava."
    },
    {
      "tipo": "paragrafo",
      "texto": "Quando a imagem para e o arquivo local está liso, anote a hora. Se para sempre no mesmo horário, é a rede do bairro ou o plano no pico, e bitrate menor naquele horário transmite melhor do que insistir no número alto. Se para o tempo todo, olhe o cabo e o Wi-Fi. O diagnóstico continua o mesmo: local bom e ao vivo ruim é internet. Local ruim é PC, e a matéria do computador para live é o próximo passo, não a troca de operadora."
    },
    {
      "tipo": "lista",
      "itens": [
        "Pause atualização e backup antes de ir ao ar.",
        "Combine o horário com quem divide a rede.",
        "Bitrate menor no pico ainda é live. Bitrate alto que não cabe é tela parada."
      ]
    },
    {
      "tipo": "titulo",
      "nivel": 2,
      "texto": "Três testes valem mais do que um anúncio"
    },
    {
      "tipo": "paragrafo",
      "texto": "Anote três testes de subida, em três dias, no horário da live, no cabo. A mediana é o número com que você conversa com o bitrate, não o pico bonito. Se a mediana não cabe a qualidade que você quer, baixe a qualidade ou mude o horário. Trocar de plano sem essa anotação é chute, e o chute continua oscilando no mesmo horário do bairro."
    },
    {
      "tipo": "paragrafo",
      "texto": "Guarde o print com a data. Quando a live cair na semana seguinte, você compara com o número antigo em vez de discutir no escuro. Subida estável é o que segura a transmissão. O download do plano, sozinho, não diz nada sobre essa queda."
    },
    {
      "tipo": "chamada",
      "tema": "geral",
      "titulo": "A rede passa e o PC não?",
      "texto": "A Balão da Informática Anchieta, loja de informática em Campinas olha memória, placa e disco no Cambuí. Av. Anchieta, 789, Campinas. WhatsApp (19) 98751-0267.",
      "rotulo": "Chamar a loja",
      "href": "/fale-conosco",
      "mensagem": "Olá! Li a matéria de internet para fazer live e quero ver se o travamento é o PC ou a rede."
    },
    {
      "tipo": "paragrafo",
      "texto": "Internet para fazer live segue, com o restante da série, em [GTA 6 no blog](/blog/gta-6)."
    }
  ],
  "perguntas": [
    {
      "pergunta": "Quantos megas preciso para fazer live?",
      "resposta": "O número que importa é a subida, e ele tem de caber o bitrate do OBS com folga. A recomendação vigente está na Twitch, no YouTube e no assistente do OBS. Meça no seu horário, não copie um tutorial antigo."
    },
    {
      "pergunta": "Wi-Fi serve para transmitir?",
      "resposta": "Perto do roteador, às vezes. Cabo é mais estável. Parede e outros aparelhos no mesmo Wi-Fi derrubam a live sem o PC ter culpa."
    },
    {
      "pergunta": "Download alto garante a live?",
      "resposta": "Não. Download baixa arquivo. A live usa a subida. Plano com download enorme e upload curto trava a transmissão."
    },
    {
      "pergunta": "Como saber se o problema é a internet?",
      "resposta": "Grave no disco. Se o arquivo local está bom e só a live ao vivo trava, é a subida ou a estabilidade da rede."
    },
    {
      "pergunta": "Posso baixar o jogo durante a live?",
      "resposta": "Pode, e a imagem vai sofrer se os dois dividirem o mesmo enlace no limite. Pause atualização e backup antes de abrir."
    }
  ],
  "fontes": [
    {
      "nome": "OBS Studio — guia de início rápido",
      "url": "https://obsproject.com/kb/quick-start-guide",
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
