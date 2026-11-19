/**
 * A terceira figura de cada matéria. O arquivo muda com o slug, o desenho
 * muda com o assunto, e nenhuma repete a capa nem as outras duas figuras.
 */
const nota = "Ilustração original da Balão da Informática Anchieta.";

const fluxo = (alt, titulo, legenda, passos) => ({
  id: "fecho",
  papel: "corpo",
  layout: "fluxo",
  alt,
  titulo,
  nota,
  legenda,
  passos,
});

const cartoes = (alt, titulo, legenda, itens) => ({
  id: "fecho",
  papel: "corpo",
  layout: "cartoes",
  alt,
  titulo,
  nota,
  legenda,
  itens,
});

const camadas = (alt, titulo, legenda, itens) => ({
  id: "fecho",
  papel: "corpo",
  layout: "camadas",
  alt,
  titulo,
  nota,
  legenda,
  itens,
});

export const TERCEIRAS = {
  "gta-6-lancamento-19-novembro-2026": fluxo(
    "Quatro passos para ler a data de GTA 6: comunicado mais novo, console, ignorar maio e não copiar requisito de PC",
    "Como ler a data sem misturar anúncio velho",
    "A data de console que ficou de pé é 19 de novembro de 2026. Maio foi uma promessa substituída.",
    ["Pegue o comunicado mais novo", "Separe console de PC", "Descarte maio de 2026", "Não invente requisito"],
  ),
  "gta-6-plataformas-ps5-xbox-e-pc": fluxo(
    "Quatro caminhos de aparelho no dia 19: PS5 nativo, Xbox Series nativo, Xbox One só na nuvem e PC sem anúncio",
    "Qual aparelho existe no dia 19",
    "PS4 fica de fora. A nuvem do Xbox One não é o jogo instalado, e o PC não está na lista.",
    ["PS5 roda nativo", "Series X e S também", "Xbox One só na nuvem", "PC sem anúncio"],
  ),
  "gta-6-trailers-oficiais": camadas(
    "Quatro tipos de vídeo oficial de GTA 6: trailer, olhar estendido, trailer de lançamento e aviso de pré-carga",
    "O que cada formato de vídeo sustenta",
    "A página de mídia data os vídeos. Só o Extended Look tem, na PlayStation, a frase de captura in-game.",
    [
      { nome: "Trailer", texto: "Apresenta o jogo. Não é ficha técnica." },
      { nome: "Extended Look", texto: "A PlayStation chama de captura no PS5." },
      { nome: "Launch Trailer", texto: "Vídeo de outubro de 2026, não é o dia 19." },
      { nome: "Pre-Load Now", texto: "Avisa a pré-carga. Não muda a plataforma." },
    ],
  ),
  "gta-6-mapa-leonida-e-vice-city": fluxo(
    "Quatro leituras do mapa de GTA 6: sinopse oficial, nome na edição, não é atlas e sem escala inventada",
    "Como tratar um nome de lugar",
    "Leonida e Vice City estão na sinopse. Nomes da Ultimate Edition não fecham um mapa.",
    ["Leia a sinopse oficial", "Separe nome de edição", "Não chame de atlas", "Não invente escala"],
  ),
  "gta-6-lucia-e-jason": camadas(
    "Três camadas sobre Lucia e Jason: nomes oficiais, sobrenomes da imprensa e o que ninguém deve completar",
    "O que dá para dizer da dupla",
    "O site da Rockstar usa os primeiros nomes. Os sobrenomes estão na cobertura da The Verge.",
    [
      { nome: "Texto oficial", texto: "Jason e Lucia, na sinopse da Rockstar." },
      { nome: "Imprensa", texto: "Duval e Caminos, na The Verge." },
      { nome: "Fora do texto", texto: "Idade, emprego e biografia não publicados." },
    ],
  ),
  "gta-6-preco-e-edicoes": fluxo(
    "Quatro passos do preço de GTA 6: dólares no comunicado, reais fora dele, conferir a loja e não copiar anúncio velho",
    "O preço anunciado não é o da prateleira daqui",
    "Standard e Ultimate saíram em dólares no comunicado da Take-Two. O valor em reais não está nesse texto.",
    ["Leia o dólar anunciado", "Não converta no chute", "Confira a loja do dia", "Ignore anúncio velho"],
  ),
  "gta-6-perguntas-frequentes": cartoes(
    "Quatro respostas curtas de GTA 6: data de console, PC sem anúncio, preço em dólares e campanha solo",
    "Quatro respostas que já têm página",
    "Cada cartão aponta para um fato publicado. O que não está aqui continua sem comunicado.",
    [
      { titulo: "Data", texto: "19 de novembro de 2026 no console." },
      { titulo: "PC", texto: "Sem versão e sem requisito até essa data." },
      { titulo: "Preço", texto: "Anunciado em dólares, não em reais." },
      { titulo: "Online", texto: "A PlayStation descreve campanha solo." },
    ],
  ),
  "gta-6-pre-carga-e-tamanho": fluxo(
    "Quatro cuidados da pré-carga de GTA 6: data de 10 de novembro, espaço no console, caixa sem disco e não copiar o número para o PC",
    "Antes de liberar espaço no console",
    "A pré-carga que ficou de pé é 10 de novembro. 212 GB é número de console, dito de dois jeitos por fontes diferentes.",
    ["Confira a data de 10 nov", "Separe espaço no PS5", "A caixa não traz disco", "Não copie o número ao PC"],
  ),
  "pc-para-gta-6-sem-requisito-oficial": fluxo(
    "Quatro passos para montar sem ficha de GTA 6: jogos de hoje, monitor atual, folga de peça e espera do anúncio",
    "O que decidir enquanto a ficha não existe",
    "Sem requisito oficial, a compra descreve o uso de agora. GTA 6 no PC entra quando a Rockstar publicar.",
    ["Liste os jogos de hoje", "Olhe o monitor", "Deixe folga de peça", "Espere a ficha oficial"],
  ),
  "placa-de-video-para-gta-6": fluxo(
    "Quatro passos da placa de vídeo sem ficha de GTA 6: resolução, memória nos jogos atuais, fonte e nada de modelo obrigatório",
    "A placa segue a tela, não um jogo sem PC",
    "A lição de 8 e 16 GB vale para jogos que já existem. Não é a lista de GTA 6.",
    ["Comece pela resolução", "Lembre a VRAM atual", "Confira fonte e espaço", "Não eleja um modelo"],
  ),
  "processador-para-gta-6": cartoes(
    "Quatro limites do processador: soquete da placa-mãe, cooler, gabinete e o gargalo dos jogos que você já roda",
    "O chip só entra se o resto aceita",
    "Não há um processador de GTA 6. A troca depende do que a placa-mãe e o cooler já suportam.",
    [
      { titulo: "Soquete", texto: "A placa-mãe diz qual família cabe." },
      { titulo: "Cooler", texto: "O dissipador precisa alcançar o novo calor." },
      { titulo: "Gabinete", texto: "Altura e fluxo de ar limitam a troca." },
      { titulo: "Uso atual", texto: "O gargalo aparece nos jogos de hoje." },
    ],
  ),
  "memoria-ram-para-gta-6": fluxo(
    "Quatro leituras da RAM: contar programas abertos, 16 GB como piso de hoje, 32 GB se houver captura e nenhum dos dois como ficha de GTA 6",
    "16 GB e 32 GB não são requisito",
    "16 GB é o piso comum de um PC de jogo hoje. 32 GB é folga de quem deixa mais coisa aberta.",
    ["Conte o que fica aberto", "16 GB é piso de hoje", "32 GB se captura junto", "Nenhum é ficha do jogo"],
  ),
  "ssd-para-gta-6": cartoes(
    "Quatro cuidados de disco: sair do HD, deixar faixa livre, não copiar os 212 GB do console e pedir o SSD do uso atual",
    "O número do console não vira ficha de SSD",
    "212 GB é espaço de PlayStation 5, não a capacidade que um PC de GTA 6 teria de ter.",
    [
      { titulo: "HD", texto: "Jogo grande em disco mecânico sofre." },
      { titulo: "Folga", texto: "Não encha o SSD até o último arquivo." },
      { titulo: "212 GB", texto: "É número de console, com fonte." },
      { titulo: "Pedido", texto: "O tamanho sai do que você já instala." },
    ],
  ),
  "monitor-para-gta-6": fluxo(
    "Quatro passos do monitor: escolher a resolução, decidir a taxa, casar a placa e não comprar tela por um jogo sem PC",
    "A tela escolhe a placa, não o contrário",
    "Full HD ainda é a tela mais comum na Steam de setembro de 2026. Quad HD pede mais da placa nos jogos de agora.",
    ["Escolha a resolução", "Decida a taxa", "Case a placa com a tela", "Não compre por GTA 6"],
  ),
  "perifericos-para-gta-6": camadas(
    "Quatro camadas de periférico: mouse, teclado, headset e o que não faz o jogo rodar",
    "Periférico melhora a sessão, não o requisito",
    "Sem marca obrigatória. O incômodo da sessão diz qual peça trocar primeiro.",
    [
      { nome: "Mouse", texto: "Sensor estável pesa mais que luz colorida." },
      { nome: "Teclado", texto: "O que importa é aguentar as horas." },
      { nome: "Headset", texto: "Entra quando a sala compete com o jogo." },
      { nome: "Limite", texto: "Nenhum deles faz um jogo sem PC existir." },
    ],
  ),
  "pc-gamer-entrada-para-gta-6": camadas(
    "Quatro peças da faixa de entrada: placa dedicada, 16 GB de RAM, SSD e tela Full HD, sem o rótulo de PC de GTA 6",
    "O que a entrada descreve",
    "Entrada é o PC que joga em Full HD o que você já joga. O orçamento é do dia, no WhatsApp.",
    [
      { nome: "Placa", texto: "Dedicada, da faixa que segura Full HD hoje." },
      { nome: "Memória", texto: "16 GB como piso comum, não como ficha." },
      { nome: "Disco", texto: "SSD, com espaço sobrando." },
      { nome: "Tela", texto: "Full HD. Quad HD já é outra faixa." },
    ],
  ),
  "pc-gamer-intermediario-para-gta-6": fluxo(
    "Quatro decisões da faixa intermediária: tela Quad HD, folga de VRAM, não saltar para a alta sem uso e não chamar de config de GTA 6",
    "Quando a intermediária faz sentido",
    "A faixa sobe com a tela. Sem Quad HD, a entrada não fica errada só porque existe uma acima.",
    ["A tela é Quad HD?", "Peça folga de VRAM", "Não suba sem esse uso", "Não chame de ficha"],
  ),
  "pc-gamer-alto-desempenho-gta-6": fluxo(
    "Quatro peças da faixa alta: placa forte, 32 GB, SSD rápido e folga para capturar, ainda sem ficha de GTA 6",
    "Alto desempenho é uso, não anúncio",
    "A faixa alta cabe em quem já joga pesado e ainda captura. Continua não sendo requisito de GTA 6.",
    ["Placa para o ajuste alto", "32 GB se o uso pede", "SSD rápido com folga", "Sobra para capturar"],
  ),
  "upgrade-do-pc-antes-do-gta-6": cartoes(
    "Quatro travas do upgrade: compatibilidade, sair do HD, completar RAM e placa por último",
    "A ordem evita trocar a peça errada",
    "A placa só entra depois que fonte, gabinete e o disco já foram olhados.",
    [
      { titulo: "Cabe?", texto: "Placa-mãe, fonte e espaço vêm antes." },
      { titulo: "Disco", texto: "HD mecânico é o primeiro atraso." },
      { titulo: "RAM", texto: "8 GB com troca para o disco pede mais." },
      { titulo: "Placa", texto: "Última, se a tela já justifica." },
    ],
  ),
  "notebook-gamer-ou-desktop-gta-6": fluxo(
    "Quatro passos para escolher notebook ou desktop: se você carrega, se a tampa abre, se a placa é soldada e se troca peça com frequência",
    "O formato segue o jeito de usar",
    "A placa de notebook em geral não se troca. RAM e SSD dependem do modelo, por isso a tampa se abre na loja.",
    ["Você carrega a máquina?", "A tampa abre?", "A placa é soldada?", "Você troca peça seguido?"],
  ),
  "pc-gamer-gta-6-campinas": fluxo(
    "Quatro passos em Campinas: dizer os jogos, ir à Anchieta 789, ver a máquina ligada e pedir orçamento sem promessa de GTA 6",
    "O que a visita em Campinas resolve",
    "A loja mostra o computador ligado. Ela não promete que essa máquina roda um jogo sem versão de PC.",
    ["Diga os jogos de hoje", "Venha à Anchieta, 789", "Veja a máquina ligada", "Orçamento sem promessa"],
  ),
  "montagem-pc-gamer-campinas": cartoes(
    "Quatro dados da montagem em Campinas: tela, lista de jogos, fonte com gabinete e a máquina ligada antes de pagar",
    "O que a bancada precisa ouvir",
    "A montagem em Campinas parte do uso atual. GTA 6 não entra como lista de peças.",
    [
      { titulo: "Tela", texto: "Resolução e taxa definem a placa." },
      { titulo: "Jogos", texto: "Os que você já abre, não o futuro." },
      { titulo: "Caixa", texto: "Fonte e gabinete limitam a placa." },
      { titulo: "Prova", texto: "A máquina liga antes do pagamento." },
    ],
  ),
  "pc-para-live-de-gta-6": fluxo(
    "Quatro cargas de um PC de live: jogo estável, codificador, áudio e só então um jogo de PC que ainda não existe",
    "A live pede uma segunda carga",
    "Transmitir ocupa codificador, voz e disco além do jogo. GTA 6 no PC ainda não tem ficha para dimensionar isso.",
    ["O jogo de hoje estável", "Codificador com folga", "Voz sem comer o jogo", "GTA 6 fica para a ficha"],
  ),
  "obs-para-live-de-jogo": cartoes(
    "Quatro peças do OBS antes da live: cena, fonte, codificador e um teste gravado, sem número de bitrate",
    "O que configurar antes de abrir a live",
    "O número de bitrate muda. O OBS publica a recomendação atual. Esta figura não inventa um valor.",
    [
      { titulo: "Cena", texto: "O que o espectador vê junto." },
      { titulo: "Fonte", texto: "Jogo, voz e, se houver, câmera." },
      { titulo: "Codificador", texto: "Placa se ela tem, senão o processador." },
      { titulo: "Teste", texto: "Grave um minuto antes de ir ao ar." },
    ],
  ),
  "setup-de-streamer-para-gta-6": camadas(
    "Quatro zonas da mesa de live: tela do jogo, microfone, câmera e folga da máquina, sem requisito de GTA 6",
    "O canto, na ordem que importa",
    "A câmera é a última zona. Áudio ruim derruba a live antes de um overlay bonito.",
    [
      { nome: "Tela", texto: "O jogo que você já transmite, estável." },
      { nome: "Microfone", texto: "Perto da boca, antes de qualquer efeito." },
      { nome: "Câmera", texto: "Entra depois que a voz já se entende." },
      { nome: "Folga", texto: "A máquina codifica sem engolir o jogo." },
    ],
  ),
  "microfone-para-live-de-jogo": fluxo(
    "Quatro decisões do microfone: distância da boca, ruído da sala, dinâmico ou condensador, e a marca por último",
    "A voz muda antes da marca",
    "Dinâmico ignora mais a sala. Condensador pega mais detalhe e mais barulho. A posição pesa nos dois.",
    ["Chegue o microfone", "Ouça a sala", "Escolha o tipo", "A marca fica por último"],
  ),
  "webcam-para-stream": camadas(
    "Quatro cuidados da webcam: luz na cara, altura do rosto, 1080p como piso comum e a câmera dentro da cena",
    "O rosto depende mais da luz",
    "1080p é o piso comum de uma câmera de rosto. Megapixel a mais não corrige um rosto no escuro.",
    [
      { nome: "Luz", texto: "Na cara, não atrás da cabeça." },
      { nome: "Altura", texto: "Na linha dos olhos, não no teto." },
      { nome: "1080p", texto: "Piso comum. Não é uma marca." },
      { nome: "Cena", texto: "A câmera entra no OBS como fonte." },
    ],
  ),
  "internet-para-fazer-live": cartoes(
    "Quatro testes de internet para live: envio, estabilidade, horário da transmissão e chamada ao provedor se oscilar",
    "O que medir antes de culpar o PC",
    "Download alto não descreve o envio. Não há um número de mega nesta figura.",
    [
      { titulo: "Envio", texto: "A live sobe. O download não mede isso." },
      { titulo: "Estabilidade", texto: "Oscilar derruba mais que um pico." },
      { titulo: "Horário", texto: "Teste na hora em que você transmite." },
      { titulo: "Provedor", texto: "Se cai sempre, o fio é o assunto." },
    ],
  ),
  "gta-rp-e-o-que-o-gta-6-nao-e": fluxo(
    "Quatro limites do GTA RP: é cena de GTA V, não é modo de GTA 6, o PC precisa rodar o GTA V e não há tutorial de servidor aqui",
    "O que esta página não ensina",
    "GTA 6, na PlayStation, é campanha solo. RP de hoje não migra para esse jogo por esta página.",
    ["RP hoje é GTA V", "GTA 6 não anunciou RP", "O PC roda o jogo atual", "Sem tutorial de servidor"],
  ),
  "comecar-no-twitch-youtube-ou-kick": camadas(
    "Quatro passos para começar no Twitch, YouTube ou Kick: categoria, título honesto, horário repetido e áudio antes do enfeite",
    "A ordem de quem está abrindo a conta",
    "Nenhuma plataforma é eleita aqui. O que as três pedem no começo é o mesmo: categoria, título, horário e voz.",
    [
      { nome: "Categoria", texto: "O jogo que está na tela, não outro." },
      { nome: "Título", texto: "Diz o que a live é, sem promessa." },
      { nome: "Horário", texto: "Um começo que você consegue repetir." },
      { nome: "Áudio", texto: "Inteligível antes de overlay." },
    ],
  ),
};
