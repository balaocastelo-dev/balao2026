import type { Artigo, Fonte } from "@/lib/blog/tipos";

const OBS: Fonte = {
  nome: "OBS Project — OBS Studio",
  url: "https://obsproject.com/",
  data: "consulta em 19 de novembro de 2026",
};

const YAHOOPC: Fonte = {
  nome: "Yahoo / Just Jared — “GTA 6 PC Release Date: Is Grand Theft Auto VI Coming to PC?”",
  url: "https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html",
  data: "15 de novembro de 2026",
};

const artigo: Artigo = {
  slug: "webcam-para-stream",
  titulo: "Webcam para stream: o que olhar antes de comprar",
  resumo: "1080p é o piso comum de uma câmera de rosto. Luz na cara pesa mais que megapixel, e nenhuma marca é obrigatória para a live começar inteligível.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Webcam",
    "Live",
  ],
  capa: {
    src: "/blog/capas/webcam-para-stream.webp",
    alt: "Monitor com uma câmera pequena ao lado e fone na mesa.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-08T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Webcam para stream: o que olhar antes de comprar",
    palavrasChave: [
      "webcam para stream",
      "câmera para live",
      "webcam 1080p",
      "luz na webcam",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Antes de comparar caixa de webcam, olhe para a sua cara na luz em que você joga. Uma câmera de rosto tem um trabalho pequeno e difícil: mostrar quem fala, com traço reconhecível, sem transformar o quarto num cenário. Se a testa some na sombra, nenhum número impresso na embalagem acende a lâmpada. A compra começa por essa imagem, não pelo adesivo de megapixel.",
    },
    {
      tipo: "paragrafo",
      texto: "1080p é o piso comum dessa câmera de rosto. Abaixo disso, o rosto em tamanho de live fica mole com facilidade. Acima disso pode existir, e não é o que separa uma cara legível de uma cara escura. Não há marca obrigatória. Uma checagem republicada no [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) em 15 de novembro de 2026 também não achou webcam oficial de GTA 6, porque o PC do jogo não estava anunciado.",
    },
    {
      tipo: "resumo",
      itens: [
        "**1080p é o piso comum do rosto.** É o chão da câmera, não um troféu.",
        "**Luz na cara pesa mais.** Megapixel não acende a testa.",
        "**A altura é a dos olhos.** Câmera baixa filma queixo e narina.",
        "**Não há marca obrigatória.** A cena no OBS recebe a câmera depois da luz.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a câmera de rosto tem de mostrar",
    },
    {
      tipo: "paragrafo",
      texto: "Quem assiste precisa reconhecer o seu rosto enquanto você fala, não ler a marca da câmera. Olho, boca e a direção do olhar bastam. O jogo segue no centro da tela. A câmera ocupa um recorte. Se nesse recorte você vira silhueta, o recorte atrapalha. O teste é o recorte, na luz real, não a foto de estúdio da caixa.",
    },
    {
      tipo: "paragrafo",
      texto: "Você não é obrigado a aparecer. Se a live for só jogo e voz, a câmera pode esperar. Quando decidir aparecer, trate o rosto como uma fonte a mais, do mesmo jeito que o microfone é uma fonte. O texto de [microfone para live](/blog/microfone-para-live-de-jogo) continua valendo ao lado: voz inteligível primeiro. Uma cara nítida com frase muda não segura ninguém na conversa.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "1080p como piso, não como troféu",
    },
    {
      tipo: "paragrafo",
      texto: "1080p, aqui, é uma imagem de rosto com pontos suficientes para o recorte da live. É o piso comum, o chão a partir do qual a cara não nasce já borrada. Não é ordem para caçar o maior número da prateleira. Duas câmeras em 1080p podem diferir na sua mesa por causa da luz e da altura. O piso evita o erro grosseiro. Não escolhe vencedor.",
    },
    {
      tipo: "paragrafo",
      texto: "Megapixel a mais não fura sombra. Um sensor mais capaz pode ajudar em pouca luz, e mesmo assim a lâmpada na cara muda mais do que a linha de especificação. Se a página do produto só grita resolução e não mostra o rosto numa sala parecida com a sua, ela não respondeu. Grave você mesmo com a luz que já tem.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/webcam-para-stream-passos-rosto.webp",
        alt: "Pessoa de headset sentada numa mesa de jogo, à noite.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Pessoa de headset sentada numa mesa de jogo, à noite. Foto de Yan Krukau (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Resolução não é luz",
    },
    {
      tipo: "paragrafo",
      texto: "Luz e resolução se confundem na embalagem porque as duas usam número. São coisas distintas. Resolução é quantos pontos desenham o rosto. Luz é se esses pontos enxergam o olho ou só a sombra do capuz. Você pode ter 1080p e uma cara preta. Pode ter luz boa e um piso modesto que ainda assim apresenta você. Ajuste a luz antes de discutir o segundo número.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Luz na cara, antes do megapixel",
    },
    {
      tipo: "paragrafo",
      texto: "A luz que importa está na cara, não atrás de você. Janela nas costas transforma você em silhueta mesmo com uma câmera capaz. Uma luminária simples, à frente e um pouco acima, ou a própria janela de frente, devolve olho e boca. Evite o único ponto forte bem no topo, que cava a órbita. Você confere isso na câmera do celular, na mesma cadeira, antes de gastar com webcam.",
    },
    {
      tipo: "paragrafo",
      texto: "Fundo bagunçado incomoda menos do que rosto escuro. Dá para girar a cadeira, fechar uma cortina ou tirar o abajur de trás da cabeça sem comprar cenário. Fundo virtual, no programa, recorta mal quando a luz é desigual e quando o cabelo se mistura com a parede. Ele é um efeito depois da imagem pronta. Não é o primeiro conserto. A ordem do desenho acima começa na luz de propósito.",
    },
    {
      tipo: "tabela",
      titulo: "O que conferir na sua mesa antes da webcam",
      colunas: [
        "Conferência",
        "Pronto",
        "Ainda cedo para comprar",
      ],
      linhas: [
        [
          "Rosto",
          "Olho e boca visíveis na sua luz",
          "Testa some na sombra",
        ],
        [
          "Altura",
          "Lente na linha dos olhos",
          "Câmera filma o queixo",
        ],
        [
          "Piso",
          "1080p como chão do rosto",
          "Caçar megapixel no escuro",
        ],
        [
          "Cena",
          "Fonte separada no programa",
          "Overlay no lugar da luz",
        ],
      ],
      nota: "1080p é o piso comum citado neste guia. A tabela não indica marca.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Onde a câmera entra na cena",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/webcam-para-stream-olhar.webp",
        alt: "Teclado e monitor do caixa, no balcão vermelho da loja.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Teclado e monitor do caixa, no balcão vermelho da loja. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "paragrafo",
      texto: "No OBS, a webcam é uma fonte da cena, ao lado do jogo e do microfone. Você pode deixá-la numa cena e tirá-la de outra. O programa é gratuito em [obsproject.com](https://obsproject.com/), e o uso de cenas está em [OBS para live de jogo](/blog/obs-para-live-de-jogo). Encaixe o recorte depois que o rosto está legível. Aumentar a janela não cria a luz que a lente não viu.",
    },
    {
      tipo: "paragrafo",
      texto: "A altura física importa tanto quanto a fonte no programa. Câmera em cima do monitor, na linha dos olhos, conversa com quem assiste. Câmera baixa, na mesa, filma narina e queixo e parece outro gesto. Se o monitor é alto demais para apoiar a câmera, use um apoio que suba até os olhos. Isso é ajuste de [setup](/blog/setup-de-streamer-para-gta-6), não um modelo novo.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Celular na mesma cadeira",
      texto: "Antes da webcam, grave o rosto com o celular na altura dos olhos e com a luz que você realmente usa. Se a cara some, compre luz ou mude a janela de lugar. A câmera nova herdaria a mesma sombra.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que a troca de câmera não conserta",
    },
    {
      tipo: "paragrafo",
      texto: "Trocar de webcam não conserta envio instável, voz longe da boca nem jogo que ocupa o processador inteiro. São falhas vizinhas. A rede está em [internet para fazer live](/blog/internet-para-fazer-live). A voz está no guia do microfone. A folga está no setup. Cara escura espera a luz. Cara clara abaixo do piso de 1080p é que pede câmera nova.",
    },
    {
      tipo: "paragrafo",
      texto: "GTA 6 não publicou câmera de referência para PC, e o computador do jogo seguia sem anúncio nessa checagem de novembro de 2026. Comprar webcam para esse jogo é decidir com um uso que a Rockstar não descreveu. Compre para o rosto da live de agora, na luz da sua mesa. A câmera continua sendo câmera de rosto, não peça de requisito.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/webcam-para-stream-fecho.webp",
        alt: "Teto escuro da loja com as luminárias cruzadas em X.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Teto escuro da loja com as luminárias cruzadas em X. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "1080p funciona como piso do rosto, e você não precisa caçar o maior número",
        "A luz na cara se testa com o que você já tem, na cadeira em que joga",
        "A webcam entra como fonte da cena, depois da imagem legível",
      ],
      contras: [
        "Megapixel não substitui lâmpada nem janela de frente",
        "Nenhuma marca é obrigatória, e não há modelo oficial de GTA 6",
        "Fundo virtual e aro colorido não corrigem silhueta",
      ],
    },
    {
      tipo: "chamada",
      tema: "geral",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Ver o rosto na luz da sua casa",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, descreva a luz da mesa: janela na frente ou nas costas, luminária, horário em que você joga. Se puder, leve o recorte filmado na mesma cadeira. A conversa usa 1080p como piso e não empurra uma marca. A câmera só faz sentido se o rosto já tem luz.",
    },
    {
      tipo: "paragrafo",
      texto: "WhatsApp (19) 98751-0267. A decisão é direta. Se a cara está escura, arrume a luz antes da webcam. Se a cara está clara e a câmera atual fica abaixo do piso comum de 1080p, aí você escolhe um modelo sem tratar logotipo como obrigação.",
    },
    {
      tipo: "chamada",
      titulo: "A Balão da Informática Anchieta olha a luz da sua mesa.",
      texto: "No WhatsApp (19) 98751-0267, diga se a janela está na cara ou nas costas. A decisão é o rosto legível, com 1080p como piso.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "720p serve como câmera de rosto na live?",
      resposta: "O piso comum de uma câmera de rosto é 1080p. Abaixo disso o recorte tende a ficar mole. 1080p é chão, não troféu: passar disso não compensa uma cara sem luz.",
    },
    {
      pergunta: "Mais megapixel resolve quarto escuro?",
      resposta: "Não. Megapixel desenha o que a lente viu. Se a janela está nas suas costas, a câmera vê silhueta, em qualquer número. Ponha luz na cara e teste de novo antes de trocar de aparelho.",
    },
    {
      pergunta: "Qual marca de webcam é obrigatória?",
      resposta: "Nenhuma. Não há marca obrigatória nem câmera oficial de GTA 6, já que a versão de PC não estava anunciada. Olhe luz, altura dos olhos e o piso de 1080p.",
    },
    {
      pergunta: "Onde a webcam fica no programa de live?",
      resposta: "No OBS ela é uma fonte dentro da cena, junto do jogo e do microfone. Dá para ter uma cena com rosto e outra sem. O recorte só entra depois que o rosto está legível na luz real.",
    },
  ],
  fontes: [
    OBS,
    YAHOOPC,
  ],
};

export default artigo;
