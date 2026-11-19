import { p, h2, ul, rapida, img, nota, tabela, pros, chamada, fontes } from "./blocos.mjs";

const loja = "Balão da Informática Anchieta, loja de informática em Campinas";

export const pecas = [
  {
    slug: "placa-de-video-para-gta-6",
    titulo: "Placa de vídeo para GTA 6: o que olhar na hora de comprar",
    seoTitulo: "Placa de vídeo para GTA 6: VRAM e resolução",
    resumo:
      "Placa de vídeo para GTA 6: ainda sem ficha oficial. Escolha pela tela, Full HD, Quad HD ou 4K, e pela VRAM que os jogos grandes de hoje já pedem.",
    palavrasChave: ["placa de vídeo para gta 6", "gpu gta 6", "vram gta 6", "nvidia ou amd gta 6"],
    etiquetas: ["GTA 6", "Placa de vídeo", "VRAM", "NVIDIA", "AMD"],
    capaAlt: "Placa de vídeo na bancada, a peça central de um PC pensado para GTA 6 no futuro.",
    fontes: fontes("rockstarVi", "yahooPc", "nvidia", "gtavPc"),
    blocos: [
      p("A placa de vídeo para GTA 6 é a pergunta que chega na loja junto com o trailer. A resposta honesta, dita uma vez: a Rockstar não publicou versão de PC nem a placa mínima. Dá para escolher a GPU pelos jogos de mundo aberto que você já roda e pela resolução do monitor que está na mesa. É essa escolha que muda o quanto a rua, o carro e a chuva aparecem nítidos."),
      rapida([
        "Sem ficha de PC, a placa se escolhe pela tela: Full HD, Quad HD ou 4K.",
        "Em jogo grande atual, a memória de vídeo decide se a textura alta cabe ou se o jogo começa a piscar e a buscar dado no disco.",
        "NVIDIA e AMD disputam o mesmo trabalho. O que importa é o modelo na sua resolução, não o adesivo da marca.",
      ]),
      h2("Placa de vídeo para GTA 6: a tela manda na compra"),
      p("A GPU desenha cada quadro. Quanto mais pixels, mais trabalho. Um monitor Full HD, de 1920 por 1080, pede bem menos do que um Quad HD de 2560 por 1440, e os dois pedem menos do que um 4K. Por isso a primeira pergunta na bancada não é “qual a placa mais cara”. É “qual monitor você vai usar nos próximos anos”. Se a tela é Full HD de 60 Hz, uma placa de vitrine 4K é dinheiro parado. Se você já olha um Quad HD, a placa de entrada sofre para segurar qualidade alta."),
      p("GTA V no PC, desde 14 de abril de 2015, já mostrava esse desenho: a Rockstar liberou resolução além de 4K, taxa alta e um controle de densidade de carros e pedestres. Aquilo é histórico do GTA V, não uma prévia técnica do GTA 6. Serve para lembrar que, quando a Rockstar leva um mundo aberto ao computador, a placa e a tela conversam o tempo todo. O anúncio está no newswire de 2015."),
      img(
        "Na loja, as caixas de placa ficam na parede vermelha. Dá para ver o modelo antes de fechar.",
        "Caixas de placa de vídeo na parede da Balão da Informática Anchieta, opções de placa de vídeo para GTA 6 no futuro.",
      ),
      tabela({
        titulo: "Como a resolução puxa a placa, nos jogos grandes de hoje",
        colunas: ["Sua tela", "O que a placa faz", "Memória de vídeo que costuma sobrar"],
        linhas: [
          ["Full HD", "Qualidade alta em mundo aberto atual, com folga para o navegador", "8 GB ainda aparece; 12 GB deixa textura alta mais tranquila"],
          ["Quad HD", "Quase o dobro de pixels do Full HD", "12 GB é o piso confortável; 16 GB é a folga"],
          ["4K", "A placa trabalha o quadro inteiro, o tempo todo", "16 GB é o que quem joga em 4K separa hoje"],
        ],
        nota: "Leitura de jogos atuais, não ficha de Grand Theft Auto VI. A Rockstar não publicou GPU, VRAM nem resolução oficial de PC.",
      }),
      h2("VRAM: o número que a geração atual já cobrou"),
      p("Memória de vídeo guarda textura, resolução e os efeitos que ficam ligados ao mesmo tempo. Quando ela acaba, o jogo não “fica só um pouco mais feio”: ele busca textura no meio do movimento, e a cidade parece que carregou atrasada. A matéria da [RTX 5060 Ti de 8 GB ou 16 GB](/blog/rtx-5060-ti-8gb-ou-16gb) mostra, com teste de terceiros, onde os 8 GB empatam e onde ficam para trás. A ficha da família está no site da NVIDIA. Nada disso é número de GTA 6. É o motivo para não repetir a economia de memória numa placa que você pretende manter por anos."),
      p("DLSS, da NVIDIA, e FSR, da AMD, desenham o quadro numa resolução menor e reconstroem a imagem. Eles ajudam a segurar fluidez. Não transformam uma placa de Full HD em placa de 4K, e não substituem memória de vídeo quando a textura não cabe. Use o recurso como folga, não como desculpa para comprar o modelo errado para a sua tela."),
      img(
        "VRAM é o número pequeno na ficha que decide a textura. Vale ler antes do adesivo luminoso.",
        "Placa de vídeo em detalhe, com foco na memória usada em jogos de mundo aberto e, no futuro, em GTA 6.",
      ),
      pros(
        "Na hora de comparar duas placas",
        [
          "A mais cara só vale se a sua tela e os seus jogos usam essa folga.",
          "16 GB de VRAM envelhecem melhor em Quad HD do que 8 GB no mesmo chip.",
          "Dá para ver a placa ligada na loja, no gabinete, antes de pagar.",
        ],
        [
          "Não existe modelo “certificado para GTA 6”.",
          "Marca não ganha sozinha: um modelo de entrada de qualquer uma sofre em 4K.",
          "Fonte fraca ou gabinete sem ar derruba a placa nova no primeiro verão.",
        ],
      ),
      h2("O que levar anotado para a loja"),
      ul([
        "Resolução e taxa do monitor. Sem isso, a indicação é chute.",
        "Fonte: potência real e conector. Placa nova às vezes pede cabo que a fonte antiga não tem.",
        "Tamanho do gabinete. Tem placa que não fecha a tampa.",
        "Os dois ou três jogos que você mais abre hoje, para a máquina servir antes de qualquer anúncio futuro.",
      ]),
      p("O processador que acompanha essa placa está em [processador para GTA 6](/blog/processador-para-gta-6). A tela, que deveria ser a primeira compra consciente, está em [monitor para GTA 6](/blog/monitor-para-gta-6). As máquinas fechadas por faixa estão no [PC de entrada](/blog/pc-gamer-entrada-para-gta-6), no [intermediário](/blog/pc-gamer-intermediario-para-gta-6) e no [alto desempenho](/blog/pc-gamer-alto-desempenho-gta-6)."),
      img(
        "Gabinete aberto no balcão: é assim que a placa aparece de verdade, não só na caixa.",
        "Gabinete de PC aberto na loja, mostrando a placa de vídeo escolhida para jogos como GTA 6.",
      ),
      chamada({
        tema: "placas-de-video",
        titulo: "Quer ver a placa antes de decidir?",
        texto: `Na ${loja} você olha a placa na parede e, se quiser, no computador ligado. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Ver placas de vídeo",
        href: "/categoria/hardware-placa-de-video-vga",
        mensagem: "Olá! Li a matéria de placa de vídeo para GTA 6 e quero indicação para o meu monitor.",
      }),
      p("A série completa está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual placa de vídeo roda GTA 6?",
        resposta:
          "A Rockstar não publicou essa ficha. Escolha a placa pela resolução do seu monitor e pelos jogos de mundo aberto que você já joga.",
      },
      {
        pergunta: "8 GB de VRAM ainda servem?",
        resposta:
          "Em Full HD, muita placa de 8 GB ainda joga bem os títulos atuais. Em Quad HD e em textura alta, 12 GB ou 16 GB deixam mais folga. Isso é leitura da geração atual, não número oficial do GTA 6.",
      },
      {
        pergunta: "NVIDIA ou AMD?",
        resposta:
          "As duas fazem o trabalho. Compare o modelo na sua resolução, a memória de vídeo e se a sua fonte aguenta. O adesivo não decide sozinho.",
      },
      {
        pergunta: "DLSS ou FSR dispensam uma placa melhor?",
        resposta:
          "Ajudam a ganhar fluidez. Não criam memória de vídeo que a placa não tem e não fazem milagre em 4K numa placa de entrada.",
      },
      {
        pergunta: "Preciso trocar a fonte junto?",
        resposta:
          "Às vezes sim. Leve o modelo da fonte. Conector e potência têm de combinar com a placa, senão o PC desliga no pico.",
      },
    ],
  },
  {
    slug: "processador-para-gta-6",
    titulo: "Processador para GTA 6: o que pesa em mundo aberto",
    seoTitulo: "Processador para GTA 6: núcleos, cache e plataforma",
    resumo:
      "O processador para GTA 6 não tem modelo oficial. Em mundo aberto, ele cuida de trânsito, pedestre e do que roda por trás do jogo, como Discord e captura.",
    palavrasChave: ["processador para gta 6", "cpu gta 6", "ryzen ou intel gta 6", "núcleos para mundo aberto"],
    etiquetas: ["GTA 6", "Processador", "AMD", "Intel"],
    capaAlt: "Processador na mão, a peça que segura o trânsito de um mundo aberto como GTA 6.",
    fontes: fontes("rockstarVi", "yahooPc", "gtavPc"),
    blocos: [
      p("O processador para GTA 6 ainda não tem um modelo escrito pela Rockstar. Versão de PC não foi anunciada. O que dá para decidir agora é o que um mundo aberto pede do CPU nos jogos que já estão no computador: cidade cheia, carro, pedestre, física e, se você transmite, o programa de captura aberto ao lado."),
      rapida([
        "A placa desenha o quadro. O processador sustenta o mundo: trânsito, NPC e as tarefas de fundo.",
        "Para jogar e deixar Discord, navegador ou OBS abertos, um chip de seis núcleos já ficou curto em máquina que a pessoa pretende manter.",
        "AMD e Intel servem. A plataforma (placa-mãe e memória) pesa tanto quanto o nome do processador.",
      ]),
      h2("Processador para GTA 6: onde ele aparece no jogo"),
      p("Em cidade grande, a GPU pode estar folgada e o jogo mesmo assim engasgar quando você entra numa avenida cheia. Esse soluço, nos mundos abertos atuais, costuma ser CPU: muita coisa para decidir ao mesmo tempo, além do desenho. GTA V no PC ganhou um controle de densidade de carros e pedestres justamente porque isso pesa. O recurso é de 2015, no newswire da versão de computador, e não descreve o GTA 6. Mostra que a Rockstar já tratou multidão como ajuste de PC, não só como efeito visual."),
      p("Se você só joga, em tela cheia, sem nada aberto, um processador mediano de geração recente aguenta a maioria dos jogos atuais em Full HD, desde que a placa acompanhe. Se você joga com o Discord na orelha, um navegador com guia de mapa e o OBS gravando, o mesmo chip divide atenção. A matéria de [PC para live](/blog/pc-para-live-de-gta-6) separa essas duas cargas."),
      img(
        "Trocar só o processador sem olhar a placa-mãe é o erro clássico. O soquete tem de ser o mesmo.",
        "Mãos montando um PC, etapa em que o processador para jogos de mundo aberto como GTA 6 entra na placa-mãe.",
      ),
      tabela({
        titulo: "O que pedir ao processador, conforme o uso de hoje",
        colunas: ["Seu uso", "O que observar", "O que não comprar no escuro"],
        linhas: [
          ["Jogar em Full HD, sem transmitir", "Chip recente de 6 núcleos, com folga de placa de vídeo", "Um CPU de topo com placa de entrada: a tela não usa"],
          ["Quad HD ou cidade no máximo", "6 núcleos fortes ou 8, e memória em dois pentes", "Processador antigo de 4 núcleos “porque o jogo é GPU”"],
          ["Jogar e gravar ou transmitir", "8 núcleos ajudam a separar jogo e codificador", "O mesmo chip velho com OBS aberto em qualidade alta"],
        ],
        nota: "Orientação para jogos atuais e para live. Não é a ficha de Grand Theft Auto VI.",
      }),
      h2("Plataforma: o processador não mora sozinho"),
      p("Um Ryzen novo pede placa-mãe AM5 e memória DDR5. Um Intel recente pede o soquete da geração dele. Comprar o processador “porque estava em promoção” e descobrir que a placa-mãe não aceita é a reforma que estoura o orçamento. Na loja, a pergunta útil é: você vai trocar só o chip ou aceita trocar o conjunto. Muita máquina de 2018 ou 2019 chega no teto da plataforma. Nesse caso, o [upgrade](/blog/upgrade-do-pc-antes-do-gta-6) começa pela placa-mãe, não por um adesivo."),
      p("Cache maior ajuda em jogo que fica o tempo todo buscando o que tem na próxima esquina. É um diferencial real entre dois chips da mesma linha. Não é, sozinho, motivo para ignorar a placa de vídeo. Se o monitor é 4K, o dinheiro extra quase sempre rende mais na GPU. Se o monitor é Full HD e o jogo engasga com a rua cheia, aí sim o processador é o suspeito."),
      img(
        "Cooler e pasta entram no mesmo pacote. Processador quente derruba o clock no meio da cidade.",
        "Cooler sobre o processador, peça que segura a temperatura em sessões longas de mundo aberto e de GTA 6 quando houver PC.",
      ),
      pros(
        "Sinais de que vale trocar o processador",
        [
          "A rua enche e a fluidez cai, com a placa de vídeo folgada no medidor.",
          "Você quer transmitir e o jogo já usa o chip quase inteiro.",
          "A plataforma atual não aceita mais memória nem um chip novo.",
        ],
        [
          "Trocar de CPU e manter um único pente de memória, lento.",
          "Comprar o topo de linha para um monitor Full HD de 60 Hz.",
          "Prometer que o chip “vai rodar GTA 6 no ultra”. Essa frase não tem fonte.",
        ],
      ),
      h2("Como a loja confere sem desmontar à toa"),
      ul([
        "Modelo da placa-mãe ou uma foto da especificação do sistema.",
        "Quantos pentes de memória, e de quantos gigabytes. Canal simples segura o processador.",
        "Se a máquina esquenta a ponto de baixar o clock. Às vezes o ganho é limpeza, não chip novo. A bancada de [manutenção](/manutencao) vê isso.",
        "A resolução do monitor, de novo. Ela muda a prioridade entre CPU e GPU.",
      ]),
      p("A memória em si está em [memória RAM para GTA 6](/blog/memoria-ram-para-gta-6). A placa, em [placa de vídeo para GTA 6](/blog/placa-de-video-para-gta-6)."),
      img(
        "Pasta térmica nova faz parte da troca. Chip quente não entrega o clock da caixa.",
        "Pasta térmica ao lado do processador, cuidado de montagem num PC preparado para jogos pesados como GTA 6.",
      ),
      chamada({
        tema: "montagem",
        titulo: "Não sabe se o processador cabe na sua placa?",
        texto: `Manda o modelo no WhatsApp (19) 98751-0267. A ${loja} confere o soquete antes da compra. Loja na Av. Anchieta, 789, Cambuí, Campinas.`,
        rotulo: "Pedir a conferência",
        href: "/montagempc",
        mensagem: "Olá! Li a matéria de processador para GTA 6 e quero saber se o chip cabe na minha placa-mãe.",
      }),
      p("O conjunto das matérias está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Qual processador roda GTA 6?",
        resposta:
          "Não há modelo oficial. A Rockstar não anunciou a versão de PC. Dá para escolher o chip pelo que os mundos abertos atuais e a sua live já exigem.",
      },
      {
        pergunta: "Seis núcleos bastam?",
        resposta:
          "Para jogar em Full HD, sem transmitir, um chip recente de seis núcleos aguenta a maior parte dos jogos atuais. Para jogar e capturar ao mesmo tempo, oito núcleos deixam mais espaço.",
      },
      {
        pergunta: "AMD ou Intel?",
        resposta:
          "Os dois servem. O limite real é a placa-mãe que você já tem e a memória em dois pentes. Trocar de marca só por torcida, sem trocar a plataforma, não funciona.",
      },
      {
        pergunta: "O processador esquenta e o jogo cai de fluidez?",
        resposta:
          "Pode ser cooler sujo ou pasta ressecada, não chip fraco. Uma limpeza na bancada custa menos do que um processador novo e devolve clock.",
      },
      {
        pergunta: "Vale o processador mais caro da loja?",
        resposta:
          "Vale se você joga em tela alta e ainda transmite, e se a placa de vídeo acompanha. Em Full HD, o dinheiro extra quase sempre rende mais na GPU ou no monitor.",
      },
    ],
  },
  {
    slug: "memoria-ram-para-gta-6",
    titulo: "Memória RAM para GTA 6: quanto deixa o jogo folgado",
    seoTitulo: "Memória RAM para GTA 6: 16 GB ou 32 GB",
    resumo:
      "Memória RAM para GTA 6: sem número oficial. Nos jogos de hoje, 16 GB é o piso e 32 GB é a folga para navegador, Discord e live.",
    palavrasChave: ["memória ram para gta 6", "16 ou 32 gb gta 6", "quanta ram para gta 6", "ddr5 gta 6"],
    etiquetas: ["GTA 6", "Memória RAM", "Upgrade"],
    capaAlt: "Pentes de memória RAM sobre a mesa, a folga de um PC que vai encarar jogos como GTA 6.",
    fontes: fontes("rockstarVi", "steam", "yahooPc"),
    blocos: [
      p("Memória RAM para GTA 6 é uma conta que a Rockstar ainda não fez em público: não há versão de PC nem quantidade oficial. A conta que dá para fazer hoje é a dos jogos grandes que já estão instalados, mais tudo o que você deixa aberto junto. Dezesseis gigabytes viraram o piso. Trinta e dois são a folga de quem joga, conversa e ainda deixa um navegador com o mapa."),
      rapida([
        "16 GB jogam a maior parte dos títulos atuais, se o sistema estiver enxuto.",
        "32 GB cabem jogo, Discord, navegador e um programa de captura sem o Windows começar a usar o disco como memória.",
        "Dois pentes iguais batem um pente só do mesmo tamanho. Canal duplo é ganho grátis.",
      ]),
      h2("Memória RAM para GTA 6: 16 GB ou 32 GB"),
      p("O jogo em si, nos mundos abertos recentes, cabe em 16 GB quando você fecha o resto. O problema é que quase ninguém joga assim. Fica o Discord, fica um vídeo em segundo plano, fica a loja da Steam aberta, fica o OBS se você grava a corrida. Cada um come um pedaço. Quando a soma passa do que está instalado, o Windows empurra dado para o SSD. Aí a cidade, que deveria estar fluida, troca textura no meio da curva."),
      p("A pesquisa de hardware da Steam mostra, mês a mês, o que os PCs da plataforma usam de verdade. Vale olhar a página antes de decidir, porque o número se move. O que não se move é o conselho prático: se você já está em 16 GB e o gerenciador de tarefas passa de 80% assim que o jogo abre com o navegador do lado, o próximo passo é 32 GB, não um pente avulso de 8 GB numa máquina que já mistura frequências."),
      img(
        "Dois pentes iguais, instalados no par certo de slots, entregam o canal duplo.",
        "Pentes de memória RAM encaixados na placa-mãe, configuração de memória RAM para GTA 6 e jogos atuais.",
      ),
      tabela({
        titulo: "Quanto de RAM combina com cada jeito de usar o PC",
        colunas: ["Jeito de usar", "Quantidade que faz sentido", "Por quê"],
        linhas: [
          ["Jogo em tela cheia, resto fechado", "16 GB", "Os jogos atuais cabem, com o sistema enxuto"],
          ["Jogo, Discord e navegador", "32 GB", "A soma estoura 16 GB com facilidade"],
          ["Jogo e live ou gravação", "32 GB", "O codificador e a cena do OBS comem um bloco à parte"],
          ["8 GB hoje", "Trocar, não completar com outro pente diferente", "8 GB já briga com o próprio Windows"],
        ],
        nota: "Faixas para o PC que você usa agora. Grand Theft Auto VI não tem quantidade de RAM publicada.",
      }),
      h2("Dois pentes, mesma velocidade"),
      p("Um pente de 16 GB deixa o processador conversando por um canal só. Dois de 8 GB, ou dois de 16 GB, abrem o canal duplo. Em jogo, a diferença aparece na estabilidade dos quadros mínimos, aquele número que você sente quando a câmera gira, mais do que na média bonita do benchmark. Os pentes precisam ser iguais em capacidade e, de preferência, no mesmo kit. Misturar um pente velho com um novo faz os dois rodarem na velocidade do mais lento."),
      p("DDR4 ou DDR5 não é escolha solta: é a que a placa-mãe aceita. Não existe adaptador honesto. Se a máquina é DDR4 e você quer DDR5, o conjunto inteiro muda, processador incluído na maioria dos casos. Aí a conversa deixa de ser “só memória” e vira a do [upgrade](/blog/upgrade-do-pc-antes-do-gta-6). Frequência altíssima, com tempo de resposta ruim, também engana. Um kit equilibrado, no perfil XMP ou EXPO ligado na BIOS, rende mais do que o número maior da caixa com o perfil desligado."),
      img(
        "Kit vendido junto evita misturar velocidade. A caixinha combina os dois pentes.",
        "Caixa de kit de memória RAM, o jeito certo de comprar memória RAM para GTA 6 sem misturar pente.",
      ),
      pros(
        "Quando subir para 32 GB",
        [
          "Você transmite ou grava e o jogo já ocupa a maior parte dos 16 GB.",
          "O disco acende toda hora no meio da partida, sinal de memória estourada.",
          "Vai ficar nessa plataforma por alguns anos e quer folga.",
        ],
        [
          "Completar 16 GB com um terceiro pente de outra marca.",
          "Comprar a frequência mais alta da prateleira e esquecer de ligar o perfil na BIOS.",
          "Trocar RAM achando que isso substitui placa de vídeo numa tela 4K.",
        ],
      ),
      h2("O que fotografar antes de pedir o pente"),
      ul([
        "A tela do Gerenciador de Tarefas com o jogo aberto e o que você costuma deixar junto.",
        "O modelo da placa-mãe, para saber se é DDR4 ou DDR5 e quantos slots sobram.",
        "Uma foto dos pentes já instalados. Dá para ler capacidade e velocidade sem desmontar no escuro.",
      ]),
      p("O disco que segura a instalação está em [SSD para GTA 6](/blog/ssd-para-gta-6). O chip que conversa com essa memória está em [processador para GTA 6](/blog/processador-para-gta-6). Quem vai transmitir soma esta folga com a do [PC para live](/blog/pc-para-live-de-gta-6)."),
      img(
        "Memória é barata de instalar e fácil de errar o slot. A bancada faz os dois em minutos.",
        "Bancada com placa-mãe e memória, instalação de memória RAM para quem espera jogos como GTA 6.",
      ),
      nota(
        "dica",
        "Ligue o perfil",
        "Depois de instalar, entre na BIOS e ative XMP, no Intel, ou EXPO, na AMD. Sem isso, o pente novo pode rodar na velocidade padrão, bem abaixo do que a caixa anuncia.",
      ),
      chamada({
        tema: "upgrade",
        titulo: "Manda uma foto do pente que já está aí",
        texto: `A ${loja} diz se cabe mais memória ou se o caminho é um kit novo. Av. Anchieta, 789, Cambuí. WhatsApp (19) 98751-0267.`,
        rotulo: "Ver memória RAM",
        href: "/categoria/hardware-memoria-ram",
        mensagem: "Olá! Li a matéria de memória RAM para GTA 6 e quero saber se meu PC aceita 32 GB.",
      }),
      p("A série está em [GTA 6 no blog](/blog/gta-6)."),
    ],
    perguntas: [
      {
        pergunta: "Quantos GB de RAM o GTA 6 vai pedir?",
        resposta:
          "A Rockstar não publicou. Para os jogos grandes de hoje, 16 GB é o piso e 32 GB é a folga de quem deixa outros programas abertos.",
      },
      {
        pergunta: "16 GB ainda jogam?",
        resposta:
          "Jogam, se você fecha navegador e captura. Com Discord, guia de mapa e o jogo juntos, 16 GB enchem e o disco vira memória improvisada.",
      },
      {
        pergunta: "Um pente de 16 GB ou dois de 8 GB?",
        resposta:
          "Dois pentes iguais. O canal duplo ajuda nos quadros mínimos. Um pente só deixa metade da conversa com o processador parada.",
      },
      {
        pergunta: "DDR4 ou DDR5?",
        resposta:
          "O que a sua placa-mãe aceita. Não dá para misturar. Se a troca de geração exigir placa-mãe nova, o orçamento muda de figura.",
      },
      {
        pergunta: "Subir a RAM melhora o gráfico?",
        resposta:
          "Melhora a estabilidade quando o problema era falta de memória. Não aumenta a qualidade visual: isso é placa de vídeo e monitor.",
      },
    ],
  },
];
