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

const PLAYSTATION: Fonte = {
  nome: "PlayStation — página de Grand Theft Auto VI",
  url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
  data: "consulta em 19 de novembro de 2026",
};

const VERGETAMANHO: Fonte = {
  nome: "The Verge — “GTA VI’s download will need up to 212GB of hard drive space”",
  url: "https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games",
  data: "novembro de 2026",
};

const STEAM: Fonte = {
  nome: "Steam — Pesquisa de hardware e software",
  url: "https://store.steampowered.com/hwsurvey/",
  data: "setembro de 2026",
};

const artigo: Artigo = {
  slug: "upgrade-do-pc-antes-do-gta-6",
  titulo: "Upgrade do PC antes de o GTA 6 chegar ao computador",
  resumo: "A ordem típica é tirar o HD, completar a RAM se os 8 GB empurram o uso para o disco e só então trocar a placa, se couber.",
  categoria: "guias",
  etiquetas: [
    "GTA 6",
    "Upgrade",
    "SSD",
    "Memória",
  ],
  capa: {
    src: "/blog/capas/upgrade-do-pc-antes-do-gta-6.webp",
    alt: "Caixas de placa de vídeo enfileiradas no topo da estante branca da loja.",
    largura: 1536,
    altura: 1024,
    pronta: false,
  },
  publicadoEm: "2026-11-10T18:00:00.000Z",
  autor: {
    nome: "Equipe Balão da Informática",
    url: "/sobre-nos",
  },
  origem: "autoral",
  seo: {
    titulo: "Upgrade do PC antes do GTA 6 no computador",
    palavrasChave: [
      "upgrade de pc para gta 6",
      "trocar hd por ssd",
      "aumentar memória ram",
      "upgrade de placa de vídeo",
    ],
  },
  blocos: [
    {
      tipo: "paragrafo",
      texto: "Upgrade antes de GTA 6 no computador não é uma lista de peças do jogo. É a ordem que costuma destravar a máquina que você já tem. Primeiro sai o HD. Se a memória está em 8 GB e o uso escapa para o disco, completa-se a RAM. A placa de vídeo só vem depois, e só se a fonte e o gabinete aguentam.",
    },
    {
      tipo: "paragrafo",
      texto: "Essa ordem existe porque o sintoma engana. Jogo que trava enquanto o disco range muitas vezes está esperando arquivo, não esperando uma placa nova. Até 19 de novembro de 2026 a [página da Rockstar](https://www.rockstargames.com/VI) não tinha versão de PC, e o [Yahoo](https://tech.yahoo.com/gaming/articles/gta-6-pc-release-date-150338948.html) também não achou requisito. Não há ficha para “já deixar no ponto”.",
    },
    {
      tipo: "resumo",
      itens: [
        "**A compatibilidade vem antes do desejo.** Placa-mãe, fonte e espaço cortam a lista.",
        "**Tirar o HD é o primeiro alívio típico.** O sistema no SSD muda a espera do dia a dia.",
        "**8 GB com uso no disco pedem memória.** Completar a RAM ataca a troca para o HD.",
        "**A placa é o terceiro passo.** Só entra se a fonte e o gabinete comportam.",
      ],
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A ordem que costuma destravar o uso",
    },
    {
      tipo: "paragrafo",
      texto: "A sequência típica cabe em três movimentos, e um filtro antes deles. O filtro é a compatibilidade: soquete e geração da placa-mãe, limite de memória que ela aceita, conectores da fonte e centímetros livres no gabinete. Sem isso, a peça desejada não assenta. Com isso, dá para escolher o passo que o sintoma pede, em vez do passo que o anúncio de um jogo futuro sugere.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/upgrade-do-pc-antes-do-gta-6-ordem.webp",
        alt: "Interior de um PC gamer, com placa de vídeo e cooler.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Interior de um PC gamer, com placa de vídeo e cooler. Foto de Andrey Matveev (Pexels).",
    },
    {
      tipo: "tabela",
      titulo: "Ordem típica quando o PC ainda sofre",
      colunas: [
        "Passo",
        "Quando entra",
        "O que pode impedir",
      ],
      linhas: [
        [
          "Sair do HD",
          "O sistema ainda está no disco mecânico",
          "Baia ocupada ou disco sem troca",
        ],
        [
          "Completar a RAM",
          "8 GB e o uso já vai para o disco",
          "Limite da placa-mãe",
        ],
        [
          "Trocar a placa",
          "Disco e memória já não são o gargalo",
          "Fonte, conector e espaço",
        ],
        [
          "Não trocar peça",
          "O sintoma é falha, não falta de folga",
          "A conversa vira manutenção",
        ],
      ],
    },
    {
      tipo: "paragrafo",
      texto: "O [upgrade de SSD](/upgrade-ssd) é o caminho quando o sistema ainda mora num HD. A [faixa intermediária](/blog/pc-gamer-intermediario-para-gta-6) só passa a fazer sentido depois que o disco e a memória deixam de ser o gargalo, e se a sua tela é Quad HD. Trocar a placa com o Windows num HD deixa o disco lento no lugar.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Sair do HD antes de culpar a placa",
    },
    {
      tipo: "paragrafo",
      texto: "O HD mecânico ainda aparece em computadores que a pessoa chama de gamer porque um dia receberam uma placa. O sistema operacional, o jogo e a memória virtual disputam o mesmo disco lento. A troca pelo SSD não aumenta a memória de vídeo. Diminui a espera para abrir o mapa, para carregar a área e para o computador voltar de uma travada.",
    },
    {
      tipo: "titulo",
      nivel: 3,
      texto: "Uso no disco parece placa fraca",
    },
    {
      tipo: "paragrafo",
      texto: "Quando a RAM acaba, o sistema empurra o excedente para o disco. Em 8 GB isso acontece cedo se você joga com navegador, voz e captura abertos. O sintoma é soluço e disco em atividade constante. Parece placa fraca. Muitas vezes é memória curta escrevendo num HD. Completar a RAM, com o sistema já no SSD, ataca as duas pontas.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/upgrade-do-pc-antes-do-gta-6-linha.webp",
        alt: "Módulo de memória visto de cima, com os chips aparentes.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Módulo de memória visto de cima, com os chips aparentes. Foto de William Warby (Pexels).",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Completar a memória quando o disco sofre",
    },
    {
      tipo: "paragrafo",
      texto: "O passo da memória não é automático. Entra quando você está em 8 GB e o uso já vai para o disco. A placa-mãe diz até onde dá para ir e se o pente novo combina com o que já está instalado. Dois pentes iguais costumam ser o caminho limpo. Um pente de velocidade diferente pode ligar e não entregar o que o rótulo sugere.",
    },
    {
      tipo: "paragrafo",
      texto: "16 GB de RAM é o piso das faixas deste guia, da entrada ao meio. 32 GB pertence à faixa alta, quando há captura ou muita coisa aberta junto do jogo. Sair de 8 GB para 16 GB, no computador que troca para o disco, muda o uso de hoje. Não cria requisito de GTA 6. Cria folga para o que você já abre.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "A placa só se a fonte e o gabinete aguentam",
    },
    {
      tipo: "paragrafo",
      texto: "A placa de vídeo é o passo mais fácil de errar na pressa. Ela precisa caber no comprimento, usar um conector que a fonte tenha e deixar ar circular. Se a fonte está no limite, a placa nova liga o jogo e desliga a máquina. Se o gabinete encosta na tampa, o calor fica e a folga some. Por isso a placa não abre a fila.",
    },
    {
      tipo: "paragrafo",
      texto: "Na hora de escolher a memória da placa, o parque da Steam em setembro de 2026 está em [16 GB e 8 GB](/blog/steam-setembro-2026-vram-16gb), com 27,21% e 26,71%. A diferença prática entre essas duas quantidades, numa mesma família, está na [RTX 5060 Ti](/blog/rtx-5060-ti-8gb-ou-16gb). Use os dois textos para o monitor que você tem. Não use como ficha de um jogo sem versão de PC.",
    },
    {
      tipo: "destaque",
      tom: "atencao",
      titulo: "212 GB não é cota do seu SSD",
      texto: "A PlayStation fala em pelo menos 212 GB para o jogo de console. A The Verge fala em até 212 GB, conforme o aparelho. Isso não mede a versão de PC, que não existe. O seu disco se mede pelos jogos que você instala hoje.",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "O que o GTA 6 ainda não decide",
    },
    {
      tipo: "paragrafo",
      texto: "O console chega em 19 de novembro de 2026. O computador não tem data nessa página. O espaço de 212 GB citado pela [PlayStation](https://www.playstation.com/en-us/games/grand-theft-auto-vi/) e pela [The Verge](https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games) é tamanho de console. Comprar SSD “de 212 GB para o GTA” mistura as plataformas. Deixe folga para os jogos atuais e espere o número do PC, se ele vier.",
    },
    {
      tipo: "paragrafo",
      texto: "O texto de [PC para GTA 6 sem requisito](/blog/pc-para-gta-6-sem-requisito-oficial) junta o que já dá para decidir. Se o computador também falha fora do jogo, a conversa pode ser de [manutenção](/manutencao), não de peça nova: poeira, sistema no limite ou disco que já avisa erro. Upgrade não é o remédio de todo sintoma.",
    },
    {
      tipo: "imagem",
      imagem: {
        src: "/blog/figuras/upgrade-do-pc-antes-do-gta-6-fecho.webp",
        alt: "Bancada branca sob a parede de acessórios, com monitor e caixas.",
        largura: 1600,
        altura: 900,
        pronta: false,
      },
      legenda: "Bancada branca sob a parede de acessórios, com monitor e caixas. Foto da loja, na Av. Anchieta, 789, Cambuí.",
    },
    {
      tipo: "pros-contras",
      pros: [
        "A ordem tira o HD do caminho antes de gastar a troca na placa errada",
        "8 GB com uso no disco ganham um passo próprio, em vez de serem tratados como placa fraca",
        "Fonte, gabinete e placa-mãe cortam a lista antes do desejo, inclusive o desejo ligado a GTA 6",
      ],
      contras: [
        "Um PC muito antigo pode esbarrar na placa-mãe e não aceitar o passo que você queria",
        "Completar a RAM não acelera um jogo que está limitado pela placa, se a memória já não estoura",
        "Nada desta ordem garante GTA 6, porque o requisito de computador não foi publicado",
      ],
    },
    {
      tipo: "chamada",
      tema: "upgrade",
    },
    {
      tipo: "titulo",
      nivel: 2,
      texto: "Levar o modelo para a conversa",
    },
    {
      tipo: "paragrafo",
      texto: "Na Balão da Informática Anchieta, na Av. Anchieta, 789, Cambuí, em Campinas, leve o modelo da placa-mãe ou uma foto da etiqueta, a quantidade de RAM e se ainda existe HD. A equipe confere o que assenta. Você vê a máquina ligada antes de pagar quando a conversa termina em computador montado. A assistência fica no mesmo endereço.",
    },
    {
      tipo: "paragrafo",
      texto: "O WhatsApp (19) 98751-0267 recebe esses dados. O orçamento é o do dia em que você pergunta, porque o preço muda. Não há peça “do GTA 6” para separar no pedido. Há o próximo passo que a sua máquina aguenta, começando pelo disco se o HD ainda é o sistema.",
    },
    {
      tipo: "chamada",
      titulo: "Qual peça vem primeiro no seu computador?",
      texto: "Mande o modelo da placa-mãe, quanto de memória há hoje e se ainda existe HD. A ordem sai dessa compatibilidade.",
      rotulo: "Pedir orçamento no WhatsApp",
    },
  ],
  perguntas: [
    {
      pergunta: "Devo trocar a placa de vídeo por causa de GTA 6?",
      resposta: "Não por causa do jogo. Até 19 de novembro de 2026 não havia requisito de PC. A placa só entra depois de tirar o HD, se ele ainda é o sistema, e de completar a RAM se você está em 8 GB e o uso vai para o disco. Fonte e gabinete precisam aguentar.",
    },
    {
      pergunta: "8 GB de RAM impedem um upgrade de placa?",
      resposta: "Não impedem no papel, mas atrapalham na prática se o sistema já empurra o uso para o disco. Completar a memória ataca esse soluço. Trocar só a placa deixa o disco lento fazendo o trabalho da RAM.",
    },
    {
      pergunta: "O SSD precisa ter 212 GB livres para o GTA?",
      resposta: "212 GB é número de console: pelo menos 212 GB na PlayStation e até 212 GB conforme o aparelho, na The Verge. Não é o tamanho da versão de PC, que não existe. Dimensione o SSD pelos jogos que você instala hoje, com folga.",
    },
    {
      pergunta: "Como sei se a placa nova cabe?",
      resposta: "Pelo comprimento livre no gabinete, pela energia e pelo conector da fonte, e pelo espaço que sobra para o ar circular. A placa-mãe também limita processador e memória. Sem esses dados, a escolha é chute.",
    },
    {
      pergunta: "Vale formatar em vez de trocar peça?",
      resposta: "Se o disco apresenta erro ou o sistema encheu de coisa que você não usa, a conversa pode ser manutenção, não peça nova. Formatar não aumenta VRAM nem transforma 8 GB em 16 GB. O sintoma é que escolhe o caminho.",
    },
  ],
  fontes: [
    ROCKSTARVI,
    YAHOOPC,
    PLAYSTATION,
    VERGETAMANHO,
    STEAM,
  ],
};

export default artigo;
