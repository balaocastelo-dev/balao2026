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

const artigo: Artigo = {
  slug: "memoria-ram-para-gta-6",
  titulo: "Memória RAM para GTA 6: 16 GB, 32 GB e o chute",
  resumo: "16 GB é o piso comum num PC de jogo hoje e 32 GB é folga para multitarefa e captura. Nenhum dos dois é requisito de GTA 6.",
  categoria: "hardware",
  etiquetas: [
    "GTA 6",
    "Memória RAM",
  ],
  capa: {
    src: "/blog/capas/memoria-ram-para-gta-6.webp",
    alt: "Capa com 16 GB como piso de uso atual e 32 GB como folga de multitarefa, sem requisito de GTA 6",
    largura: 1536,
    altura: 1024,
    pronta: true,
  },
  publicadoEm: "2026-11-13T12:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "RAM para GTA 6: 16 GB, 32 GB e o chute",
    palavrasChave: [
      "memória ram para gta 6",
      "16 gb ou 32 gb",
      "ram para pc gamer",
      "quanta ram para jogar",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Memória RAM para GTA 6 virou uma briga entre dois números, 16 GB e 32 GB, antes de existir o terceiro dado que decidiria a briga. O corte desta página é 19 de novembro de 2026. Até esse dia, memória de GTA 6 no PC não tinha número oficial, porque o PC não estava anunciado na [página da Rockstar](https://www.rockstargames.com/VI). Os dois números são outra conversa.",
    },
    {
      tipo: "paragrafo",
      texto: "A conversa é o PC de jogo de hoje. Dezesseis gigabytes são o piso comum: dá para jogar com pouco aberto ao lado. Trinta e dois são folga para quem deixa navegador, Discord e captura ligados. Nenhum dos dois é requisito de GTA 6. Tratar um deles como se fosse é o chute que o título desta matéria nomeia.",
    },
    {
      tipo: "resumo",
      itens: [
        "**16 GB são o piso comum.** É de onde um PC de jogo sai hoje quando a sessão é o jogo.",
        "**32 GB são folga de multitarefa.** Navegador, Discord e captura cabem com mais calma.",
        "**Os dois não são ficha.** Até 19 de novembro de 2026 a Rockstar não publicou requisito de PC.",
        "**A placa-mãe limita a conta.** Slots e máximo suportado decidem se a folga cabe.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Dezesseis gigabytes são o piso de hoje",
    },
    {
      tipo: "paragrafo",
      texto: "Num computador montado para jogar agora, 16 GB deixaram de ser luxo e passaram a ser o chão. O sistema, o jogo e uma janela ou outra cabem. Abaixo disso, a máquina começa a empurrar dados para o disco no meio da sessão, e a sessão tropeça nos jogos que você já tem. Isso se observa sem precisar de GTA 6 na história.",
    },
    {
      tipo: "paragrafo",
      texto: "Chegar nos 16 GB pode ser um pente só ou dois de 8 GB. Dois pentes iguais, nos slots certos, deixam a placa-mãe acessar os dois ao mesmo tempo. É prática de máquina atual, não uma exigência publicada pela Rockstar. A categoria de [memória RAM](/categoria/hardware-memoria-ram) é onde essa combinação se confere com o modelo da placa-mãe, antes de o pente ir para o carrinho.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/memoria-ram-para-gta-6-usos.webp",
        alt: "Duas colunas comparando 16 GB como piso de jogo hoje e 32 GB como folga com programas abertos ao lado",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "Dezesseis cobrem o jogo com pouco ao lado. Trinta e dois entram quando a sessão não fecha as outras janelas.",
    },
    {
      tipo: "paragrafo",
      texto: "Subir para 16 GB quando você está abaixo desse piso melhora os jogos de hoje. Não “prepara para GTA 6” no sentido de cumprir um requisito, porque o requisito não existe. A [checagem do Yahoo em 15 de novembro de 2026](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) não encontrou versão de PC, pré-venda nem lista de hardware. O piso é do parque atual.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Trinta e dois entram com a sessão cheia",
    },
    {
      tipo: "paragrafo",
      texto: "Trinta e dois gigabytes passam a fazer sentido quando a sessão não é só o jogo. Navegador com várias abas, Discord aberto e uma captura de tela gravando ao mesmo tempo somam um uso que 16 GB apertam. Quem transmite ou grava clipe enquanto joga reconhece o sintoma: o jogo está bem e o resto da tela tropeça.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Captura e navegador não são o jogo",
    },
    {
      tipo: "paragrafo",
      texto: "Convém separar as duas contas. A memória que o jogo usa e a memória que a sessão inteira usa não são o mesmo número. Dizer que 32 GB são necessários para GTA 6 mistura as contas e ainda inventa a ficha. Dizer que 32 GB cabem quando você não fecha nada é uma descrição do seu hábito, e essa dá para checar hoje.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/memoria-ram-para-gta-6-pilha.webp",
        alt: "Camadas do que ocupa a memória durante o jogo: o próprio jogo, o navegador, o Discord e a captura",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "O jogo sozinho e a sessão com janelas abertas não pedem a mesma quantidade de memória.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "Não transforme o hábito em ficha",
      texto: "16 GB são ponto de partida comum e 32 GB são folga de quem deixa programa aberto. Até 19 de novembro de 2026 nenhum dos dois foi publicado como requisito de GTA 6.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Nenhum dos dois é número de GTA 6",
    },
    {
      tipo: "paragrafo",
      texto: "Os dois números vão continuar circulando como se fossem oficiais, porque são redondos e fáceis de repetir. A página da Rockstar não escolheu entre eles. O comunicado de pré-venda também não. Quando uma versão de PC existir, a ficha pode cair num, no outro, ou numa frase diferente. Até lá, repetir “o jogo pede 32 GB” é escrever no lugar da empresa.",
    },
    {
      tipo: "tabela",
      titulo: "16 GB, 32 GB e o que seria chute",
      colunas: [
        "O que fica aberto",
        "16 GB",
        "32 GB",
      ],
      linhas: [
        [
          "Quase só o jogo",
          "Costuma caber no piso atual",
          "Folga que você pode não usar",
        ],
        [
          "Navegador e Discord",
          "Aperta no meio da sessão",
          "Cabe com mais calma",
        ],
        [
          "Captura ou transmissão",
          "Estoura com facilidade",
          "É o caso em que a folga se justifica",
        ],
        [
          "Frase sobre GTA 6",
          "Não é requisito oficial",
          "Também não é requisito oficial",
        ],
      ],
      colunaDestaque: 2,
      fonte: ROCKSTARVI,
      nota: "A última linha é o corte: a página do jogo, em 19 de novembro de 2026, não informa memória de PC.",
    },
    {
      tipo: "paragrafo",
      texto: "A matéria de [PC sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) aplica o mesmo corte à máquina inteira. Memória é a peça em que o chute parece mais inocente, porque 16 e 32 já são conselho de loja para outros usos. O conselho continua válido. O rótulo “para GTA 6” é que não cola.",
    },
    {
      tipo: "chamada",
      tema: "upgrade",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Dois pentes e o limite da placa-mãe",
    },
    {
      tipo: "paragrafo",
      texto: "Antes de dobrar a memória, leia o que a placa-mãe aceita: quantos slots existem, qual o máximo e se os pentes atuais ocupam os dois canais. Dois slots já preenchidos com 8 GB cada um não recebem mais 16 GB sem você tirar os antigos. Quatro slots com dois ocupados deixam caminho. É uma conta de manual, não de boato.",
    },
    {
      tipo: "paragrafo",
      texto: "Velocidade e latência só importam dentro do que a plataforma aceita. Um pente mais rápido do que a placa-mãe reconhece desce para a velocidade suportada. Comprar o número maior da embalagem, sem olhar o manual, não aumenta a memória útil. Na [montagem](/montagempc) essa leitura acontece antes do pedido, com o modelo da placa em mãos.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Notebook não ganha memória do mesmo jeito",
    },
    {
      tipo: "paragrafo",
      texto: "Em parte dos notebooks a memória vem soldada. Não há slot, e o anúncio de “dá para pôr 32 GB” é falso para aquela máquina. Em outros há um slot livre ao lado de um pente soldado, e a conta muda. A página de [notebooks](/notebooks) é o lugar para cruzar o modelo com essa possibilidade, em vez de repetir a regra do PC de mesa.",
    },
    {
      tipo: "paragrafo",
      texto: "PC de mesa e notebook também não compartilham um requisito de GTA 6, porque esse requisito não foi escrito para nenhum dos dois. Se a dúvida é só espaço em disco, ela está na matéria de [SSD](/blog/ssd-para-gta-6), e os 212 GB de lá são número de console. Memória e disco são faltas diferentes: uma aperta no meio do jogo, a outra na hora de instalar.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/memoria-ram-para-gta-6-fecho.webp",
        alt: "Quatro leituras da RAM: contar programas abertos, 16 GB como piso de hoje, 32 GB se houver captura e nenhum dos dois como ficha de GTA 6",
        largura: 1600,
        altura: 900,
        pronta: true,
      },
      legenda: "16 GB é o piso comum de um PC de jogo hoje. 32 GB é folga de quem deixa mais coisa aberta.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "16 GB ficam no lugar certo: piso do PC de jogo de hoje",
        "32 GB ficam no lugar certo: folga de navegador, Discord e captura",
        "A placa-mãe entra na conta antes da compra do pente",
      ],
      contras: [
        "Nenhum dos dois números é requisito de GTA 6",
        "Notebook soldado não aceita o upgrade do PC de mesa",
        "Pente mais rápido que a placa-mãe não entrega o que a caixa promete",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Antes de comprar memória",
    },
    {
      tipo: "paragrafo",
      texto: "Diga o que fica aberto junto do jogo. Na Balão da Informática Anchieta, Av. Anchieta, 789, Cambuí, Campinas, a equipe confere quantos slots a placa-mãe ainda tem e se o pente novo combina com o que já está lá. O WhatsApp é (19) 98751-0267. Mande o modelo da placa-mãe ou do notebook.",
    },
    {
      tipo: "paragrafo",
      texto: "Sem esse modelo, 16 GB e 32 GB são só dois números redondos. Com ele, dá para saber qual dos dois cabe na sua sessão de hoje. A decisão é 16 GB para o jogo com pouco ao lado e 32 GB se a sessão vive com outras janelas, sem chamar nenhum dos dois de requisito.",
    },
    {
      tipo: "chamada",
      titulo: "Você joga com mais coisa aberta ao lado?",
      texto: "Conte as janelas que ficam ligadas e mande o modelo da placa-mãe. A quantidade sai desse uso, não de uma ficha de GTA 6.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "GTA 6 vai precisar de 32 GB de RAM?",
      resposta: "Não há essa informação. Até 19 de novembro de 2026 a Rockstar não anunciou versão de PC nem requisito. 32 GB são folga para quem deixa navegador, Discord e captura abertos. Chamar isso de requisito do jogo é chute.",
    },
    {
      pergunta: "16 GB ainda servem para jogar?",
      resposta: "Servem como piso comum de um PC de jogo hoje, quando a sessão é o jogo e pouca coisa ao lado. Não são um carimbo oficial de GTA 6. Se o computador está abaixo de 16 GB, o aperto já aparece nos jogos que você tem.",
    },
    {
      pergunta: "Dois pentes são melhores que um?",
      resposta: "Em PC de mesa, dois pentes iguais nos slots certos deixam a placa-mãe acessar os dois ao mesmo tempo. É prática de máquina atual. Os slots livres e o máximo da placa-mãe decidem se isso cabe, e notebook soldado fica de fora dessa regra.",
    },
    {
      pergunta: "Dá para aumentar a memória depois?",
      resposta: "No PC de mesa, sim, se sobrar slot ou se você trocar os pentes dentro do máximo da placa-mãe. Em notebook, só quando existe slot. Por isso o modelo da máquina vem antes da quantidade, e a quantidade não espera uma ficha de GTA 6.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
  ],
};

export default artigo;
