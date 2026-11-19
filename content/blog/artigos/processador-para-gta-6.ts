import type { Artigo, Fonte } from "@/lib/blog/tipos";

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

const TAKETWO: Fonte = {
  nome: "Take-Two Interactive — comunicado de pré-venda de Grand Theft Auto VI",
  url: "https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/",
  data: "24 de junho de 2026",
};

const artigo: Artigo = {
  slug: "processador-para-gta-6",
  titulo: "Processador para GTA 6: o que observar na montagem",
  resumo: "Mundo aberto costuma usar vários núcleos, mas GTA 6 não tem requisito de PC. Observe gargalo, placa-mãe e cooler da máquina que você já tem.",
  categoria: "hardware",
  etiquetas: [
    "GTA 6",
    "Processador",
    "Montagem",
  ],
  capa: {
    src: "/blog/capas/processador-para-gta-6.webp",
    alt: "Capa sobre processador decidido por gargalo, placa-mãe e cooler, sem um modelo apontado como o de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-13T15:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Processador para GTA 6: o que observar",
    palavrasChave: [
      "processador para gta 6",
      "cpu para gta 6",
      "gargalo de processador",
      "processador para mundo aberto",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Processador para GTA 6 é uma busca que já chega com um modelo na ponta da língua. O modelo não tem onde se apoiar. Na data de corte, 19 de novembro de 2026, não havia requisito de processador porque não havia versão de PC anunciada. A [página da Rockstar](https://www.rockstargames.com/VI) lista console. Um chip “certo para o jogo” seria invenção.",
    },
    {
      tipo: "paragrafo",
      texto: "O que dá para observar é o computador que você já tem. Mundo aberto costuma espalhar trabalho em vários núcleos, porque simula cidade, trânsito e física ao mesmo tempo. Isso é um hábito de gênero, não uma ficha. Sem número oficial, o critério vira prático: o processador atual limita os jogos que você abre, e a placa-mãe aceita a troca?",
    },
    {
      tipo: "resumo",
      itens: [
        "**Não há processador de GTA 6.** Até 19 de novembro de 2026 a Rockstar não publicou versão de PC nem requisito.",
        "**Vários núcleos são hábito de mundo aberto.** Não são uma contagem oficial deste jogo.",
        "**O sinal útil é o gargalo de hoje.** Se os seus jogos já esbarram no chip, a conversa começa.",
        "**Placa-mãe e cooler entram na mesma decisão.** Trocar só o processador às vezes não cabe.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Vários núcleos não são uma ficha",
    },
    {
      tipo: "paragrafo",
      texto: "Cidade aberta, muitos personagens e física ao mesmo tempo pedem um processador que saiba dividir tarefa. Por isso um chip de um núcleo só ficou para trás nos jogos atuais, e por isso um PC de jogo montado agora já sai com vários núcleos. Dizer isso não diz quantos núcleos GTA 6 vai usar. A Rockstar não publicou esse número.",
    },
    {
      tipo: "paragrafo",
      texto: "A tentação é transformar o hábito em cota: “mundo aberto pede oito núcleos, então este modelo é o do jogo”. A primeira metade é uma tendência de gênero. A segunda é um chute com nome de produto. Enquanto não houver ficha, qualquer contagem específica de núcleos atribuída a GTA 6 está na coluna errada. A [checagem do Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html), em 15 de novembro de 2026, não achou essa ficha.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/processador-para-gta-6-troca.webp",
        alt: "Fluxo em quatro passos: limite nos jogos atuais, soquete da placa-mãe, cooler e gabinete, e só então a troca do processador",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "O nome do chip vem por último. Antes entram o limite de hoje, o soquete e o espaço do cooler.",
    },
    {
      tipo: "paragrafo",
      texto: "O [comunicado da Take-Two](https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/) confirma o lado de cá do problema: a pré-venda de junho de 2026 fala de PlayStation 5 e Xbox Series. Não fala de soquete, de núcleos nem de frequência. Quem preenche esses campos está escrevendo a ficha no lugar da empresa.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O gargalo aparece nos jogos que você já abre",
    },
    {
      tipo: "paragrafo",
      texto: "O teste caseiro, sem bancada e sem número inventado, é simples. Abra um jogo que você já joga e veja onde a máquina espera. Se a placa de vídeo está folgada e o processador está no teto o tempo todo, o limite da sessão é o chip. Se a placa é que está no teto, trocar o processador não muda o quadro que chega no monitor.",
    },
    {
      tipo: "paragrafo",
      texto: "Esse olhar vale para os jogos de hoje. Não vale para prever GTA 6. Um mundo aberto futuro pode puxar mais o chip, ou pode puxar mais a placa, e a resposta oficial ainda não existe. Usar o gargalo atual para decidir a sua máquina é honesto. Usar o gargalo atual para assinar um requisito é outra frase, e essa a gente não escreve.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Soquete velho puxa a plataforma",
    },
    {
      tipo: "paragrafo",
      texto: "Processador novo quase sempre pede placa-mãe da mesma geração de soquete. Se a sua placa-mãe já está no fim da linha, a troca deixa de ser uma peça e vira plataforma: chip, placa-mãe e, às vezes, memória. É uma decisão de montagem, descrita na categoria de [processadores](/categoria/hardware-processadores), e continua sem relação com uma ficha de GTA 6.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não existe o modelo certo",
      texto: "Indicar um processador como o de GTA 6 exige um requisito que, até 19 de novembro de 2026, a Rockstar não publicou. O chip se escolhe pelo limite dos seus jogos e pelo que a placa-mãe aceita.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Placa-mãe e cooler decidem se a troca cabe",
    },
    {
      tipo: "paragrafo",
      texto: "O cooler que segurava o chip antigo pode não segurar o novo, e pode não caber no gabinete quando a memória tem dissipador alto. Essa checagem é física: altura, fluxo de ar e o suporte do soquete. Ela acontece na [montagem](/montagempc), com a máquina aberta, e não numa lista de “processador para GTA 6” copiada de vídeo.",
    },
    {
      tipo: "tabela",
      titulo: "Sinais do PC atual e o que não dá para concluir",
      colunas: [
        "Sinal no seu PC",
        "Leitura honesta",
        "O que não concluir",
      ],
      linhas: [
        [
          "Jogos atuais no teto do chip",
          "Faz sentido olhar processador",
          "Que GTA 6 exige aquele modelo",
        ],
        [
          "Placa de vídeo no teto",
          "Trocar o chip muda pouco",
          "Que o processador está “pronto” para o jogo",
        ],
        [
          "Soquete no fim da linha",
          "A troca puxa a plataforma",
          "Que existe cota oficial de núcleos",
        ],
        [
          "Cooler no limite",
          "O chip novo pode não caber",
          "Que basta comprar o processador",
        ],
      ],
      colunaDestaque: 1,
      fonte: ROCKSTARVI,
      nota: "A página da Rockstar, consultada em 19 de novembro de 2026, não lista processador de PC. A leitura é do seu uso atual.",
    },
    {
      tipo: "paragrafo",
      texto: "A fonte entra na mesma visita. Uma plataforma nova puxa mais da tomada do que o chip sozinho sugere, sobretudo se a placa de vídeo também for trocada. A matéria de [PC sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) lembra a ordem: tela e jogos de hoje primeiro. O processador não fura essa fila por causa de um nome de jogo.",
    },
    {
      tipo: "chamada",
      tema: "montagem",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Nome de modelo não é requisito",
    },
    {
      tipo: "paragrafo",
      texto: "Citamos de propósito nenhum processador como escolha de GTA 6. Citar seria fabricar a ficha. O que existe no mercado é uma faixa larga de chips com vários núcleos, adequada aos jogos atuais, e uma faixa antiga que já limita esses mesmos jogos. Você se localiza pelo gargalo, não por um ranking com o nome do jogo no título.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/processador-para-gta-6-limites.webp",
        alt: "Quatro camadas da decisão de processador: chip, placa-mãe, cooler e fonte, cada uma com o que ela trava",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Soquete, cooler e fonte decidem se o chip novo cabe na máquina que você já tem.",
    },
    {
      tipo: "paragrafo",
      texto: "Se a placa de vídeo é a próxima compra, ela também conversa com o processador: uma placa muito acima do chip deixa o chip no teto, e um chip muito acima da placa não desenha quadro que a placa não entrega. A matéria de [placa de vídeo](/blog/placa-de-video-para-gta-6) fica do outro lado dessa conta. As duas se encontram no monitor, não num requisito.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Sinais de que o processador atual segue",
    },
    {
      tipo: "paragrafo",
      texto: "O processador atual segue quando os jogos que você abre não o deixam no teto, a temperatura fica sob controle com o cooler que você tem e a placa-mãe ainda recebe a memória que você usa. Nesse quadro, trocar “porque GTA 6 vem aí” antecipa uma exigência não publicada. A sessão desta semana não melhora.",
    },
    {
      tipo: "paragrafo",
      texto: "O processador pede conversa quando o teto já aparece nos seus jogos, quando o soquete não aceita mais nada acima, ou quando o cooler vive no limite. São três portas de entrada, todas observáveis. Nenhuma delas se chama requisito de GTA 6. A página de [plataformas](/blog/gta-6-plataformas-ps5-xbox-e-pc) separa o que o dia 19 de fato inclui, e processador de PC não está na lista.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/processador-para-gta-6-fecho.webp",
        alt: "Quatro limites do processador: soquete da placa-mãe, cooler, gabinete e o gargalo dos jogos que você já roda",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Não há um processador de GTA 6. A troca depende do que a placa-mãe e o cooler já suportam.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A decisão usa o gargalo dos jogos que você já abre",
        "Placa-mãe, cooler e fonte entram antes do nome do chip",
        "Nenhum modelo é vendido aqui como o processador de GTA 6",
      ],
      contras: [
        "Sem ficha, não dá para saber quantos núcleos o jogo vai usar",
        "Troca de soquete puxa placa-mãe e pode puxar a memória",
        "Um anúncio futuro de PC pode pedir outra leitura, e só então",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de trocar o processador",
    },
    {
      tipo: "paragrafo",
      texto: "Se a troca estiver na mesa, a Balão da Informática Anchieta, na Av. Anchieta, 789, no Cambuí, em Campinas, olha soquete, cooler e fonte juntos. O recado pode ir pelo WhatsApp (19) 98751-0267 com o modelo da placa-mãe. Sem esse modelo, qualquer chip indicado é palpite.",
    },
    {
      tipo: "paragrafo",
      texto: "A equipe não aponta um processador como o de GTA 6, porque essa frase não tem fonte até 19 de novembro de 2026. A decisão é mexer no chip só se a sua máquina atual mostra limite, nunca porque um modelo foi apresentado como o certo para o jogo.",
    },
    {
      tipo: "chamada",
      titulo: "O processador atual limita os seus jogos?",
      texto: "Diga o modelo da placa-mãe e um jogo em que a máquina espera. A resposta diz se a troca cabe, sem inventar requisito de GTA 6.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Qual processador é o certo para GTA 6?",
      resposta: "Nenhum foi publicado. Até 19 de novembro de 2026 não havia versão de PC nem requisito. Indicar um modelo como o do jogo seria escrever a ficha no lugar da Rockstar. O critério disponível é o limite do seu PC atual.",
    },
    {
      pergunta: "Mundo aberto precisa de muitos núcleos?",
      resposta: "Jogos de mundo aberto costumam dividir trabalho entre vários núcleos, e um PC de jogo montado hoje já sai assim. Isso é hábito de gênero. Não é uma contagem oficial de núcleos de GTA 6, que a Rockstar não divulgou.",
    },
    {
      pergunta: "Troco só o processador ou a plataforma inteira?",
      resposta: "Depende do soquete. Se a placa-mãe aceita um chip acima do seu, a troca pode ser só o processador e o cooler. Se o soquete acabou, entram placa-mãe e, em muitos casos, memória nova. É decisão de montagem, não de ficha de jogo.",
    },
    {
      pergunta: "Como sei se o meu processador está no limite?",
      resposta: "Abra um jogo que você já joga. Se o chip fica no teto e a placa de vídeo sobra, o limite da sessão é o processador. Se a placa é que está no teto, trocar o chip não muda o que o monitor mostra. O olhar é sobre os jogos de hoje.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    TAKETWO,
  ],
};

export default artigo;
