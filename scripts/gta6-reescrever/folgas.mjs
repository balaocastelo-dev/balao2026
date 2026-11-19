import { p, h2, ul } from "./blocos.mjs";

/** Trechos extras, um ângulo por matéria, para completar a leitura sem repetir o miolo. */
const extras = {
  "placa-de-video-para-gta-6": [
    h2("Como ler a caixa da placa na loja"),
    p("Na parede da loja a caixa traz três números que mudam a compra mais do que o adesivo luminoso. O comprimento, em milímetros, diz se a tampa do seu gabinete fecha. A potência recomendada da fonte diz se o cabo que você tem em casa existe ou se a troca da placa puxa a fonte junto. A memória de vídeo, em gigabytes, diz a folga de textura na resolução da sua tela. Se um desses três não está na caixa, peça a ficha no site do fabricante antes de pagar. Não precisa ser o modelo do GTA 6. Precisa ser o modelo que cabe na sua máquina."),
    p("Depois da instalação, o driver é parte da placa. Uma GPU nova com o driver que veio no Windows costuma funcionar e ficar para trás do que o fabricante já corrigiu. Baixe o pacote atual da NVIDIA ou da AMD, reinicie, e abra um jogo que você já conhece o comportamento. Se a imagem pisca ou o PC desliga no pico, o suspeito é cabo e fonte, não “incompatibilidade com um jogo que ainda não tem versão de PC”."),
    ul([
      "Meça o gabinete antes de escolher a placa de três ventoinhas.",
      "Confira conector de 8 pinos, ou o padrão novo, na fonte que já está aí.",
      "Atualize o driver e teste um jogo conhecido no mesmo dia.",
    ]),
  ],
  "processador-para-gta-6": [
    h2("Como ver se o chip é o gargalo, no GTA V"),
    p("Abra o GTA V, que já está no PC desde 2015, entre numa avenida cheia e deixe o Gerenciador de Tarefas visível no segundo plano, ou use o contador da própria placa. Se a GPU fica baixa e o processador encosta no topo enquanto a câmera gira no trânsito, o chip é o limite daquela cena. Se a GPU fica no topo e o processador sobra, trocar o chip não aumenta quadro: a placa é que desenha. Esse teste usa um jogo que existe. Ele não prevê o GTA 6. Evita a troca errada hoje."),
    p("Olhe também a temperatura. Um processador em 95 graus baixa o clock sozinho e parece “fraco” sendo apenas mal refrigerado. Limpeza, pasta e um cooler que caiba no gabinete devolvem o desempenho que a caixa anunciou, sem troca de plataforma. Se a limpeza não muda a temperatura, aí sim a conversa é cooler novo ou chip novo, com a placa-mãe no meio da conta."),
    ul([
      "Teste numa rua cheia, não no menu.",
      "Compare o uso da GPU e o do processador ao mesmo tempo.",
      "Se estiver muito quente, limpe antes de condenar o chip.",
    ]),
  ],
  "memoria-ram-para-gta-6": [
    h2("Como conferir os slots sem abrir no escuro"),
    p("No Windows, o Gerenciador de Tarefas mostra a memória instalada e a velocidade. Se aparece metade da velocidade do anúncio, o perfil XMP ou EXPO está desligado na BIOS, ou os pentes são diferentes e o conjunto desceu para o mais lento. A tela de desempenho também mostra quantos slots estão em uso quando você cruza com o manual da placa-mãe. Dois slots ocupados num par certo é o que a gente quer. Um slot só, mesmo com 16 GB, deixa desempenho na mesa."),
    p("Antes de comprar outro pente “para completar”, anote a capacidade, a velocidade e se é DDR4 ou DDR5. Pente avulso de outra leva mistura e o PC pode nem ligar, ou ligar instável. Kit vendido junto custa um pouco mais e evita essa roleta. Se os dois slots já estão cheios com 8 GB cada, o caminho é trocar o kit por 2x16 GB, não enfiar um terceiro pente num slot que a placa trata como exceção."),
    ul([
      "Anote DDR4 ou DDR5 antes de sair de casa.",
      "Prefira kit de dois pentes iguais.",
      "Ligue XMP ou EXPO depois de instalar e confira a velocidade de novo.",
    ]),
  ],
  "ssd-para-gta-6": [
    h2("Clonar o Windows ou instalar de novo"),
    p("Se o sistema está num SSD pequeno e lotado, há dois caminhos. Clonar copia o Windows para o NVMe novo e você liga como se nada tivesse mudado, com os programas no lugar. Instalar de novo é mais limpo e mais trabalhoso: você baixa o que usa e perde a bagunça acumulada. Os dois pedem backup do que não está na nuvem. Save de jogo, quando a plataforma sincroniza, volta sozinho. Documento que só existe na área de trabalho não volta. Copie isso antes de apagar o disco antigo."),
    p("Não formate o disco velho no mesmo dia. Deixe-o no gaveteiro por uma semana, com o PC já bootando no novo. Se faltou um arquivo, ele ainda está lá. Só então apague e use o disco antigo como arquivo, se for SSD, ou aposente se for HD barulhento. Jogo grande, na reinstalação, vai direto para o NVMe. Repetir o erro de instalar no disco lento é o jeito de não sentir a troca."),
    ul([
      "Backup do que não está na nuvem, antes de qualquer clone.",
      "Não apague o disco antigo no mesmo dia.",
      "Instale o jogo do dia a dia no NVMe, não no que sobrou.",
    ]),
  ],
  "monitor-para-gta-6": [
    h2("Cabo, taxa e o modo jogo da tela"),
    p("Monitor novo em 60 Hz com a caixa dizendo 144 é quase sempre cabo ou configuração. No Windows, a taxa fica nas configurações de vídeo avançadas. No jogo, há outro limite, e o VSync pode prender tudo em 60. DisplayPort costuma entregar a taxa que o HDMI antigo da gaveta não entrega. Troque o cabo antes de trocar a tela de novo. E desligue o “modo cinema” da TV, se for o caso: esse processamento deixa a imagem bonita e atrasada. O modo jogo existe para cortar esse atraso."),
    p("Distância também muda a polegada. Numa mesa funda, 27 polegadas em Quad HD ficam confortáveis. Na mesa rasa de apartamento, o mesmo 27 invade o mouse. Meça da parede até onde o teclado termina e leve esse número. Suporte VESA, aqueles quatro furos atrás, permite prender a tela num braço e devolver a mesa. Sem o padrão, o braço não serve e o pé original fica. Vale virar a tela na loja e olhar atrás antes de comprar o acessório."),
    ul([
      "Confira a taxa no Windows, não só na caixa.",
      "Leve um cabo DisplayPort se o seu for antigo.",
      "Olhe os furos VESA se a mesa for pequena.",
    ]),
  ],
  "perifericos-para-gta-6": [
    h2("O controle no PC, sem adaptador misterioso"),
    p("No computador, o controle de Xbox costuma aparecer no jogo assim que o cabo ou o receptor está ligado. O DualSense, do PS5, funciona por cabo em muitos jogos e perde alguns recursos de gatilho que são do ecossistema da PlayStation. Para dirigir no GTA V, vale testar os dois por dez minutos: tem gente que mira no mouse e vira o carro no analógico. Não há jeito oficial do GTA 6 nessa escolha. O teste no GTA V já mostra o seu hábito, e o hábito é o que a mesa tem de atender."),
    p("Pilhas acabam na perseguição. Um cabo reservado na gaveta, ou o controle carregado antes da sessão, evita a pausa. Drift, aquele analógico que anda sozinho no menu, não se resolve com software na maior parte das vezes. Controle com drift vai para a assistência ou para a troca. Insistir estraga a corrida e a live, porque a câmera passeia sem você pedir."),
    ul([
      "Teste mouse e controle no mesmo jogo, por alguns minutos.",
      "Deixe um cabo ou a carga pronta antes da sessão.",
      "Analógico que anda sozinho é defeito, não “configuração”.",
    ]),
  ],
  "pc-para-gta-6-sem-requisito-oficial": [
    h2("Um pedido de orçamento que a loja consegue atender"),
    p("Mensagem útil no WhatsApp cabe em quatro linhas. A resolução do monitor, por exemplo 1920 por 1080. O tamanho, se você sabe, 24 ou 27 polegadas. Dois jogos que você abre toda semana, com o GTA V na lista se for o caso. E se o Discord, o navegador ou a live ficam abertos junto. Com isso a equipe separa entrada, intermediário ou alto desempenho sem chutar. “Quero o melhor para o GTA 6” não tem resposta honesta. “Quero Quad HD com live” tem."),
    p("Se você já tem PC, mande também o modelo da placa de vídeo e uma foto da etiqueta da fonte. Muita visita que pedia torre nova sai com uma placa e um SSD, e o resto fica. O contrário também acontece: plataforma de 2017 que não aceita a GPU atual vira montagem, e é melhor saber isso antes de comprar peça solta na internet. O balcão em Campinas faz essa leitura. O texto geral das faixas está nas matérias de entrada, intermediário e alto desempenho."),
    ul([
      "Resolução, dois jogos, e se há live.",
      "Foto da fonte se a máquina é antiga.",
      "Peça para ver ligada, não só a lista de peças.",
    ]),
  ],
  "pc-gamer-entrada-para-gta-6": [
    h2("O que a entrada aguenta numa noite comum"),
    p("Numa noite típica dessa faixa você abre um mundo aberto em Full HD, com qualidade alta, Discord em segundo plano se a memória for 16 GB bem administrada, e fecha o navegador de dez guias. A partida flui. A gravação em qualidade alta, com câmera e alerta, já pede cuidado: dá para ensaiar, e a live pesada mora na faixa de cima. Se o seu plano é transmitir toda quinta, diga isso no pedido e a entrada cresce em memória e em codificador, ou você sobe de faixa com honestidade."),
    p("Gabinete da entrada ainda precisa de uma entrada de ar na frente e de espaço para a placa. O modelo mais barato, lacrado, com a GPU colada no vidro, esquenta em dezembro em Campinas e o clock cai. Vale gastar a diferença num gabinete que respira e guardar o RGB para depois. Fonte com selo de fabricante conhecido entra no mesmo raciocínio. É a peça que ninguém fotografa e a que desliga o PC quando a cidade fica cheia de carro."),
    ul([
      "Full HD com qualidade alta é o alvo, não o 4K.",
      "Live pesada não é promessa desta faixa.",
      "Gabinete com ar e fonte de marca fecham o pedido.",
    ]),
  ],
  "pc-gamer-intermediario-para-gta-6": [
    h2("Quad HD na prática, fora do anúncio"),
    p("Em 1440p a imagem de uma rua com letreiro, placa de carro e fachada fica mais limpa do que em Full HD na mesma polegada. Você percebe isso em jogo que já tem, andando devagar e olhando para o meio da tela. Também percebe o custo: a mesma placa que sobrava em 1080p passa a trabalhar perto do limite. Por isso a faixa intermediária sobe a GPU e a memória de vídeo juntas, não só uma delas. Textura no alto com 8 GB aperta. O exemplo da RTX 5060 Ti, na análise do blog, mostra um caso medido por terceiros."),
    p("Se você ainda está no Full HD e o Quad HD é plano para o ano que vem, dá para nascer com a placa desta faixa e o monitor atual. A máquina fica folgada agora e pronta para a tela. O contrário, tela Quad HD com placa de entrada, obriga a baixar qualidade em todo lançamento. Quando for orçar, diga qual monitor está na mesa hoje e qual você pretende. A configuração muda. O GTA 6 continua sem ficha, e a escolha continua sendo a da tela que você olha."),
    ul([
      "Olhe um jogo que você já tem em 1440p antes de cravar a faixa.",
      "Suba placa e VRAM juntos.",
      "Diga se o monitor Quad HD é de agora ou do plano.",
    ]),
  ],
  "pc-gamer-alto-desempenho-gta-6": [
    h2("Folga que se mede, não que se promete"),
    p("Alto desempenho se prova com o contador de quadros num jogo pesado que você já tem, em Quad HD ou em 4K, com o OBS aberto se a live faz parte do pedido. Se a GPU fica em 70% e o quadro se mantém com a câmera e o microfone na cena, há folga. Se fica em 99% com tudo no mínimo, a faixa foi vendida no nome e não na peça. Peça esse teste na loja, na máquina montada, antes de levar. Dez minutos na bancada valem mais do que o adjetivo “topo”."),
    p("O ruído entra na mesma prova. Sente na cadeira e grave um minuto de voz no celular, do lado da torre. Se a ventoinha cobre a fala, ajuste a curva ou o gabinete antes de ir embora. Live com turbina no fundo cansa a plateia mais rápido do que um quadro a menos. A Balão da Informática Anchieta faz esse acerto no Cambuí, com a máquina ainda aberta se precisar recolocar um cabo na frente do ventilador."),
    ul([
      "Teste com o jogo pesado e, se for o caso, com o OBS aberto.",
      "Ouça a torre, não só olhe o FPS.",
      "Fonte no limite não é folga, é desligamento no pico.",
    ]),
  ],
  "upgrade-do-pc-antes-do-gta-6": [
    h2("O que fotografar e mandar antes de sair de casa"),
    p("Cinco fotos evitam a ida em vão. A tela do Gerenciador de Tarefas com o jogo aberto. A aba de memória, para ver gigabytes e se está em canal duplo na velocidade certa. O gerenciador de discos, para ver se o jogo está em SSD ou em HD. A etiqueta da fonte, com a potência. E, se der, o modelo da placa-mãe na informação do sistema. Com esse pacote a equipe diz a primeira troca pelo WhatsApp. Sem ele, o palpite é “traz o gabinete”, o que também resolve, só que você carrega a torre à toa quando era só um pente."),
    p("Anote o que você não quer trocar. Tem gente que gosta do gabinete e só quer a placa. Tem gente que quer silêncio e aceita trocar o cooler. O orçamento muda. Dizer “pode trocar o que for preciso, menos o gabinete” é uma instrução. Dizer “deixa ele novo” sem teto vira uma montagem inteira com outro nome. Os dois caminhos existem. O sintoma, lá no começo da matéria, escolhe qual dos dois é o seu."),
    ul([
      "Fotos: desempenho, memória, disco, fonte e placa-mãe.",
      "Diga o que deve ficar.",
      "Se a plataforma for antiga demais, a montagem nova é mais limpa do que cinco upgrades.",
    ]),
  ],
  "notebook-gamer-ou-desktop-gta-6": [
    h2("Tomada, calor e a mesa do notebook"),
    p("Notebook gamer na cama, em cima do edredom, tapa a entrada de ar e o clock cai em minutos. A sessão longa pede mesa firme, o carregador na parede e um apoio que levante a traseira meio centímetro, se o fabricante deixou a ventilação embaixo. Na bateria, o desempenho é outro: o jogo fica mais lento para não desligar. Para comparar com um desktop, ligue os dois na tomada, na mesma resolução, e jogue o mesmo trecho. A diferença de barulho aparece sem planilha."),
    p("Teclado de notebook esquenta na mão em cidade cheia. Isso é normal até o ponto em que trava ou desliga. Se desligar, é assunto de assistência, não de “jogo pesado demais”. A bancada limpa a ventoinha e avalia a pasta. Desktop não tem esse colo quente, e em troca não vai para a sala sem um monitor. Se você joga nos dois cômodos da casa, o notebook ganha mesmo perdendo na troca de placa daqui a três anos."),
    ul([
      "Jogue no notebook em cima da mesa, na tomada.",
      "Compare com o desktop no mesmo jogo e na mesma resolução.",
      "Desligar sozinho é manutenção, não característica.",
    ]),
  ],
  "pc-gamer-gta-6-campinas": [
    h2("Como chegar e o que esperar do balcão"),
    p("A loja fica na Av. Anchieta, 789, no Cambuí, em Campinas. O letreiro e a fachada vermelha estão na calçada. Lá dentro, o corredor leva ao balcão curvo e à parede de placas. Não é preciso marcar para olhar uma máquina exposta. Para fechar uma montagem no mesmo dia, avise pelo WhatsApp (19) 98751-0267 se a peça que você quer está na loja ou se precisa encomendar. O telefone (19) 3255-1661 tira a mesma dúvida. Sábado o balcão para às 13h. Chegar ao meio-dia com um pedido longo aperta todo mundo."),
    p("Traga o monitor só se a dúvida for a tela em si. Para o PC, a resolução anotada basta, junto com os jogos. Se a torre atual vier para upgrade, traga o gabinete e a senha do Windows, se houver. A equipe liga, olha e devolve com a peça nova ou com o diagnóstico. Você não deixa o computador e some: o endereço de retirada é o mesmo da entrega. Assistência futura também. É o motivo de montar em Campinas em vez de num anúncio de outra cidade."),
    ul([
      "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h.",
      "WhatsApp (19) 98751-0267 para adiantar a lista de jogos e a resolução.",
      "Se for upgrade, leve o gabinete. Se for montagem nova, leve a medida da mesa.",
    ]),
  ],
  "montagem-pc-gamer-campinas": [
    h2("O que você confere antes de levar a torre"),
    p("Na hora de retirar, peça para ver três coisas na tela. O sistema reconhece a placa de vídeo pelo nome, não por um adaptador genérico. O disco do sistema é o SSD, com o jogo de teste instalado nele se ficou combinado. A memória aparece com a capacidade total, nos dois pentes. Se algum item falha, a tampa abre de novo na bancada, não na sua casa. Cabo encostando na ventoinha também se ouve: ligue e escute um minuto. Ruído de cabo no ventilador é ajuste de um minuto ali, e uma semana de irritação se sair."),
    p("Leve uma sacola ou venha de carro com espaço: gabinete com vidro não viaja solto no banco, batendo. A caixa da fonte e o manual podem ficar, se você quiser a nota e a garantia no mesmo envelope. A nota sai no nome de quem paga. Guarde. Quando a máquina voltar para limpeza no verão, o mesmo endereço, Av. Anchieta, 789, abre o histórico. A montagem não acaba na calçada. Acaba quando você liga em casa, na sua tomada, e a tela acende como acendeu no balcão."),
    ul([
      "Confira placa, SSD e memória na tela antes de sair.",
      "Escute a ventoinha por um minuto.",
      "Guarde a nota. A assistência é no mesmo balcão do Cambuí.",
    ]),
  ],
  "pc-para-live-de-gta-6": [
    h2("Separar gravação local e transmissão"),
    p("O primeiro ensaio não precisa de plateia. Grave dez minutos do GTA V, ou do jogo que você já transmite, com a cena do OBS completa: jogo, microfone e câmera se for usar. Assista o arquivo. Quadro liso e voz sem estouro significam que o PC aguenta. Aí sim conecte a plataforma. Se o arquivo local já falha, mexer na internet não cura. Falta memória, codificador ou disco. Se o arquivo está bom e só a live ao vivo trava, o PC passou e a subida da rede é o próximo capítulo."),
    p("Deixe um atalho de cena de pausa. Quando você levanta para beber água, a área de trabalho não deve ir ao ar com a pasta de downloads aberta. Uma tela parada com o seu nome resolve. Isso não pede PC mais forte. Pede o hábito, e o hábito cabe na mesma máquina. A faixa alta existe para quem faz isso toda semana com jogo no máximo. A entrada transmite em Full HD se o teste local passar. Os dois combinados com a loja, no WhatsApp, fecham sem adivinhar."),
    ul([
      "Dez minutos gravados e assistidos, antes de abrir a live.",
      "Cena de pausa pronta, para a área de trabalho não vazar.",
      "Falha no arquivo local é PC. Falha só ao vivo é rede.",
    ]),
  ],
  "obs-para-live-de-jogo": [
    h2("Áudio que não briga com o jogo"),
    p("No misturador do OBS, o jogo e o microfone são faixas separadas. Baixe o jogo até você se ouvir por cima do motor do carro, sem sumir. Fone fechado é o que impede o som do jogo de voltar ao microfone e criar eco. Se você usa caixa, abaixe até quase nada ou aceite o eco. Filtro de ruído no microfone ajuda ventilador constante. Não recupera um mic em cima do teclado. A posição do microfone, na matéria própria, resolve mais do que mais um plugin."),
    p("Atalhos evitam o pânico. Defina uma tecla para mutar o microfone e outra para cortar para a cena de pausa. Teste as duas com a gravação local, não na primeira live com gente. Atualize o OBS num dia sem transmissão: versão nova muda botão e você não quer descobrir isso ao vivo. A chave da plataforma fica salva no programa. Se alguém sentar no seu PC, remova a chave. Gerar outra no painel da Twitch ou do YouTube leva um minuto e fecha a porta."),
    ul([
      "Jogo mais baixo do que a voz, no fone.",
      "Tecla de mudo e tecla de pausa, testadas.",
      "Atualize o OBS fora do horário da live.",
    ]),
  ],
  "setup-de-streamer-para-gta-6": [
    h2("A mesa de quem joga por duas horas"),
    p("Altura do cotovelo decide se o pulso aguenta a sessão. Teclado alto, ombro encolhido, e a live de duas horas vira dor, não conteúdo. Cadeira com encosto, mesa estável e monitor com o topo na linha dos olhos resolvem antes de qualquer LED. O mouse fica no mesmo plano do teclado, com espaço para o giro da câmera em terceira pessoa. Se o giro bate no copo, aumente o mousepad ou mude o copo de lugar. É prosaico e é o que a gravação mostra quando você se estica toda hora."),
    p("O gabinete não fica colado no microfone. Ventoinha no fundo da voz cansa quem assiste. Chão ao lado da mesa, com o cabo de rede alcançando, é o lugar comum. Em cima da mesa só se o mic estiver do outro lado e você tiver testado a gravação. Luz na cara, difusa, separada da luz colorida do gabinete. A colorida é clima. A da cara é para a webcam enxergar o olho. As duas juntas, sem a da cara, deixam você azul e granulado."),
    ul([
      "Cotovelo apoiado, monitor na linha dos olhos.",
      "Gabinete longe do microfone.",
      "Uma luz de frente, além do RGB.",
    ]),
  ],
  "microfone-para-live-de-jogo": [
    h2("O minuto de teste que vale a compra"),
    p("Grave no OBS a frase que você diz quando erra a curva, no volume real, com o teclado do lado, como na partida. Assista de fone. Se a tecla aparece mais do que a palavra, afaste o mic ou troque para um dinâmico. Se a voz estoura nos P e nos B, afaste um dedo e use o filtro de pop, aquela tela redonda, ou só o ângulo de lado. Se o ventilador vira um ronco constante, baixe o ganho antes de comprar outro microfone. Muita troca é posição."),
    p("Confira se o OBS está no dispositivo certo. Monitor com microfone embutido sequestra a live quando o USB do mic pisca e o programa volta para o padrão. Trave o dispositivo nas configurações. Fone fechado na orelha, volume do jogo abaixo da voz. Caixa de som e microfone sensível no mesmo metro produzem eco que nenhum filtro apaga direito. Esse teste cabe na loja, no balcão, antes de você levar o modelo para casa e descobrir no quarto."),
    ul([
      "Grave uma frase no volume da partida, com o teclado perto.",
      "Trave o dispositivo no OBS.",
      "Fone fechado, não caixa, na hora do teste.",
    ]),
  ],
  "webcam-para-stream": [
    h2("Cor, exposição e o canto da tela"),
    p("No software da câmera, ou nas propriedades da fonte no OBS, trave a exposição. No automático, a tela do jogo clareia e o seu rosto escurece a cada explosão. Exposição manual, com a luz da cara ligada, deixa a imagem estável. Balanço de branco no tom da sua lâmpada evita o rosto azul. Não precisa parecer estúdio. Precisa o olho aparecer e a cor não mudar no meio da frase."),
    p("O tamanho da janela no OBS é o outro ajuste. Grande demais, tapa o minimapa do GTA e a câmera vira o assunto. Pequena demais, ninguém vê a reação. Um retângulo do peito para cima, num canto, é o padrão que funciona. Recorte no próprio OBS se a câmera filma teto demais. Fundo virtual só se a parede for impossível e o teste de quadro, com o jogo aberto, continuar liso. Se o quadro cair, desligue o fundo. A cara com a parede real é melhor do que a cara recortada com o jogo engasgando."),
    ul([
      "Exposição manual, para o rosto não pulsar com o jogo.",
      "Janela pequena, sem tapar a interface.",
      "Fundo virtual só se o quadro continuar liso.",
    ]),
  ],
  "internet-para-fazer-live": [
    h2("O que pausar na hora de abrir"),
    p("Atualização de jogo, backup de nuvem e o download de outra pessoa na mesma rede comem a subida que você mediu de manhã. Combine em casa: na hora da live, ninguém baixa filme. Pause a loja de jogos. Se o roteador tiver um modo de prioridade para o PC da transmissão, ligue e teste, não assuma que o nome do botão faz o serviço. Meça de novo com o cabo, no horário, e compare com o teste anterior. Número parecido significa que a prioridade ajudou ou que o cabo já bastava."),
    p("Quando a imagem para e o arquivo local está liso, anote a hora. Se para sempre no mesmo horário, é a rede do bairro ou o plano no pico, e bitrate menor naquele horário transmite melhor do que insistir no número alto. Se para o tempo todo, olhe o cabo e o Wi-Fi. O diagnóstico continua o mesmo: local bom e ao vivo ruim é internet. Local ruim é PC, e a matéria do computador para live é o próximo passo, não a troca de operadora."),
    ul([
      "Pause atualização e backup antes de ir ao ar.",
      "Combine o horário com quem divide a rede.",
      "Bitrate menor no pico ainda é live. Bitrate alto que não cabe é tela parada.",
    ]),
  ],
  "gta-rp-e-o-que-o-gta-6-nao-e": [
    h2("Como entrar num servidor sem estragar a noite"),
    p("Escolha um servidor cujo tom você aguenta. Tem comunidade mais familiar, tem comunidade pesada, e a regra está no site ou no Discord deles, não neste blog. Leia o que acontece se você atira sem motivo, se pode usar carro de emergência e como se cria o personagem. Entre primeiro para ouvir, com o microfone testado. A voz é o personagem. Mic no teclado faz a rua inteira ouvir o clique e ninguém ouvir o seu nome."),
    p("O PC é o do GTA V com a cidade cheia: SSD, memória para o Discord do servidor aberto, e a placa da sua tela. Se você transmite o RP, some o codificador. Nada disso prepara um “RP do GTA 6”, porque esse modo não foi anunciado. Quando a Rockstar publicar PC, a conversa muda. Até lá, o servidor que existe é o de GTA V, e a máquina se prova entrando nele por uma hora, não por um anúncio de peça."),
    ul([
      "Leia a regra do servidor antes do primeiro personagem.",
      "Teste o microfone. No RP, a voz é o jogo.",
      "Ajuste o PC no GTA V lotado, que é o jogo do servidor.",
    ]),
  ],
  "comecar-no-twitch-youtube-ou-kick": [
    h2("Depois da primeira live, uma coisa só"),
    p("Assista os vinte minutos que você transmitiu. Anote um problema, o mais chato: voz baixa, jogo sem contexto, ou você em silêncio por muito tempo. Na live seguinte, conserte esse. Não redesenhe o overlay, não troque de plataforma e não compre outro microfone no mesmo dia. Canal cresce quando você volta no horário combinado. Se você disse quinta às nove, apareça quinta às nove, mesmo curta. A plateia que volta é a que acredita no horário, não a da estreia com contagem regressiva."),
    p("Título da live diz o jogo e o que vai acontecer. “GTA V, personagem novo no servidor” orienta. “Live on” não orienta. No YouTube, o mesmo título ajuda o VOD no dia seguinte. Na Twitch, a categoria certa coloca você na prateleira do jogo, não na de bate-papo. Na Kick, confira onde a categoria fica no painel deles. Os três detalhes cabem em cinco minutos e mudam quem te encontra. O PC e a mesa, se já passaram no teste, ficam quietos enquanto você pratica aparecer."),
    ul([
      "Uma correção por live, não um reformo.",
      "Horário repetido vale mais do que a estreia.",
      "Título com o jogo e a categoria certa.",
    ]),
  ],
};

const reforco = {
  "pc-para-gta-6-sem-requisito-oficial": [
    p("Guarde o orçamento com a data. Peça muda, e um print antigo não é a prateleira de hoje. Ver a máquina ligada no mesmo dia pega ventoinha que raspa e cabo curto. Leve em conta a tomada e o espaço embaixo da mesa. Tela, placa, memória e disco têm matéria própria nesta série, para a decisão não depender de uma lista única."),
  ],
  "processador-para-gta-6": [
    p("Se o chip novo exigir placa-mãe nova, a memória entra na mesma conta, DDR5 na plataforma atual. Peça os preços separados. Quando o conjunto chega perto de uma máquina de entrada inteira, compare as duas folhas. Revitalizar uma plataforma de 2018 peça por peça, às vezes, sai mais caro do que uma torre com tudo novo e testado junto."),
  ],
  "memoria-ram-para-gta-6": [
    p("Depois de instalar, abra o jogo que enchia a memória e o Discord junto. A barra do Gerenciador de Tarefas precisa de folga, não pode ficar colada no topo. Se continuar no talo, falta pente reconhecido ou o perfil de velocidade desligado. Os dois aparecem na hora. Anote o número e guarde com a nota."),
  ],
  "pc-gamer-entrada-para-gta-6": [
    h2("Uma noite de Full HD para validar a máquina"),
    p("Atualize o Windows e a loja, instale um jogo que você já conhece e ande por uma cidade em 1080p. A textura tem de chegar no tempo, a ventoinha fica num ronco constante e o cabo da fonte não esquenta na mão. Dez minutos nesse passeio dizem se a entrada cumpriu o combinado, melhor do que qualquer selo na caixa."),
    p("Se a imagem só fica boa com tudo no baixo, a placa ficou curta para a tela ou o jogo está no HD. Os dois têm conserto diferente, e a loja separa um do outro antes de você trocar a peça errada. Full HD bem feito dura. Full HD no limite, com live por cima, pede a faixa seguinte."),
  ],
  "pc-gamer-intermediario-para-gta-6": [
    h2("O que observar na primeira semana em Quad HD"),
    p("Passe o jogo que você mais abre para 1440p e use por alguns dias, não por um benchmark de dois minutos. Cidade, interior e câmera rápida contam histórias diferentes. Se só a câmera rápida cai, a placa está no limite da taxa. Se a textura demora em todo lugar, olhe o disco e a memória de vídeo. Anote o que doeu e leve na conversa de upgrade, em vez de trocar tudo."),
    p("Mantenha o driver da placa em dia e o cabo DisplayPort, se a taxa do monitor for alta. Quad HD em 60 Hz por cabo velho desperdiça a faixa que você pagou. A loja testa a taxa na entrega quando o monitor sai junto. Se o monitor é o seu, leve o cabo que você usa em casa."),
  ],
  "pc-gamer-alto-desempenho-gta-6": [
    h2("Entrega da faixa alta, item por item"),
    p("Na retirada, peça o nome da placa na tela, a memória em 32 GB e o SSD como disco do sistema. Abra um jogo pesado por cinco minutos com o gabinete no chão, do jeito que vai ficar em casa, não no balcão aberto. O ar muda. Se a temperatura sobe demais nessa posição, o fluxo do gabinete precisa de ajuste antes de ir para o carro."),
    p("Combine onde a torre vai sentar: em cima da mesa ela compete com o microfone, no chão ela precisa de cabo de vídeo e de rede que alcancem. A faixa alta sem esse plano vira uma máquina boa num lugar que a sufoca. A Balão da Informática Anchieta ajusta isso no Cambuí, com a máquina ainda por perto."),
    p("Se a live for semanal, deixe 32 GB e o codificador da placa confirmados na entrega, com uma gravação curta de voz ao lado da torre. Alto desempenho que não passa nesse minuto vira decepção na quinta à noite. O minuto cabe no balcão."),
  ],
  "upgrade-do-pc-antes-do-gta-6": [
    h2("Depois da troca, o teste de uma hora"),
    p("Não julgue o upgrade no menu. Jogue uma hora do título que doía, com os programas que você deixa abertos. Se o sintoma sumiu, a peça certa entrou. Se mudou de sintoma, por exemplo o disco parou de sofrer e a placa passou a ficar no talo, a próxima troca está dada, e você não precisa adivinhar. Anote e volte quando fizer sentido, não no mesmo dia por ansiedade."),
    p("Guarde a peça antiga por uma semana. Memória e SSD retirados ainda salvam um arquivo esquecido. Placa antiga pode ficar de reserva se a nova der defeito na garantia. Jogar fora no estacionamento é pressa. A nota da peça nova fica com você, e a assistência do mesmo endereço conhece o que foi instalado."),
  ],
  "notebook-gamer-ou-desktop-gta-6": [
    h2("Prova rápida dos dois, na tomada"),
    p("Peça os dois ligados no mesmo jogo e na mesma resolução, o notebook na tomada e o desktop com o monitor que representa a sua mesa. Caminhe pela cidade por cinco minutos em cada um. Ouça, sinta o teclado e olhe se a imagem que você quer cabe. A ficha técnica não entrega esse minuto. O balcão entrega."),
    p("Se o notebook ganhar pela mobilidade, pergunte da assistência de ventoinha e de tela no mesmo endereço. Se o desktop ganhar pela folga, pergunte do espaço na sua mesa e do monitor. A decisão fecha com uma frase sua, não com a preferência de quem vende. Os dois saem testados. Nenhum promete o GTA 6."),
    p("Quem viaja com o notebook toda semana aceita menos peça trocável. Quem fica na mesma mesa aceita o gabinete. Os dois jogam os mundos abertos de hoje. Escrever os dois no orçamento e riscar um depois de sentar na cadeira é melhor do que decidir pelo anúncio. Se ainda empatar, escolha o que você consegue levar para a assistência no Cambuí sem chamar um carro só para isso."),
  ],
  "pc-gamer-gta-6-campinas": [
    p("Se vier de outro bairro, o WhatsApp adianta a lista e você não espera a peça encomendar com você já no balcão. Chegou, olhou a máquina, fechou ou levou o orçamento para casa. As duas saídas são normais. Pressa de sábado à tarde não é: o expediente acaba às 13h. Durante a semana, até as 18h, cabe sentar e ver a tela ligada com calma."),
  ],
  "montagem-pc-gamer-campinas": [
    h2("A primeira noite em casa"),
    p("Na sua tomada, ligue direto na parede se o filtro estiver lotado de fonte velha. Abra o sistema, confira se a placa aparece com o mesmo nome da loja e deixe um jogo rodar vinte minutos. Se desligar, anote o que estava na tela e chame no WhatsApp antes de abrir a tampa. Parafuso a mais, “só para ver”, custa a garantia do cabo que você puxou."),
    p("O endereço de volta é a Av. Anchieta, 789. Limpeza de verão, upgrade no ano seguinte e a dúvida do cabo que faltou passam pelo mesmo balcão. Guarde a nota no mesmo lugar do manual. Montagem boa é a que você ainda sabe onde levar daqui a um ano."),
  ],
  "pc-para-live-de-gta-6": [
    h2("Checklist da véspera, sem abrir a live"),
    p("Atualize o jogo de dia. Feche backup de nuvem. Confira o cabo de rede. Grave cinco minutos com a cena final e assista o começo e o fim. Se a voz entra, o jogo não soluça e a câmera não estoura, pode marcar horário. Se algo falha, conserte nessa gravação. A plateia não é o lugar do ensaio."),
    p("Deixe água, a cena de pausa e o mudo do microfone no lugar. Live longa sem pausa derruba a voz e a vontade. O PC aguenta a técnica. O resto é ritmo, e o ritmo se treina no GTA V ou no jogo que você já narra bem."),
  ],
  "obs-para-live-de-jogo": [
    h2("Quando a live cai, o que olhar primeiro"),
    p("Se a imagem parou e o jogo na sua tela continua, é codificador ou rede. Olhe a estatística do OBS: quadros perdidos por rede apontam a subida. Quadro perdido por codificação aponta preset pesado demais para a placa. Baixe um degrau, grave de novo e compare. Não mude cinco coisas de uma vez, senão você não sabe qual salvou."),
    p("Se o jogo em si caiu de fluidez, feche a pré-visualização do OBS, que também custa. Ainda ruim, a máquina está no limite e a matéria do PC para live é o próximo passo. O programa certo numa máquina curta não cria quadro. Ele só organiza o que a máquina entrega."),
  ],
  "setup-de-streamer-para-gta-6": [
    h2("Um ensaio filmado da própria mesa"),
    p("Grave pelo celular, de lado, cinco minutos de você jogando e falando. Veja se o microfone sai do quadro, se a luz faz sombra no olho e se você se estica para alcançar o mouse. Esse vídeo caseiro mostra o que a live vai mostrar, sem depender da plataforma. Ajuste uma coisa e grave de novo."),
    p("Cabo que aparece bonito na foto e puxa o controle na curva tem de sumir por baixo da mesa. Velcro resolve. O visual da mesa importa menos do que você não brigar com ela na segunda hora. Quando a gravação ficar quieta, aí sim pense em LED. Antes disso, LED é distração de compra."),
    p("A segunda tela, se entrar, mostra o chat e o OBS, não uma cópia do jogo. Assim você lê o nome de quem chegou sem alt-tab. Um celular no suporte faz esse papel no primeiro mês e custa menos do que outro monitor. Quando o celular apertar, aí o monitor extra entra, com a mesa já estável. Não compre a segunda tela antes de a primeira live repetir duas vezes: você ainda vai mudar a altura e o lugar do microfone."),
  ],
  "microfone-para-live-de-jogo": [
    h2("Ganho, distância e a barra verde"),
    p("Fale a frase alta e a frase baixa, as duas que você usa na partida. A barra do OBS fica verde nas duas, sem bater no teto na alta e sem sumir na baixa. Se só uma funciona, aproxime o mic em vez de subir o ganho até o quarto entrar. Dinâmico perto da boca perdoa. Longe, nenhum modelo salva."),
    p("Grave com o jogo no fone, no volume real. Se o microfone pega o vazamento do fone aberto, troque para fechado ou abaixe o jogo. Esse teste leva um minuto e evita a compra do “microfone melhor” quando o problema era o fone. Na loja, dá para fazer no balcão antes de levar."),
    p("Suporte de braço só vale se a mesa não balança. Mesa bamba transforma o braço num pêndulo e a voz sai oscilando. Nesse caso, um pedestal firme na mesa, com o mic ao lado da boca, é mais estável do que o braço longo."),
  ],
  "webcam-para-stream": [
    h2("A imagem que você aguentaria assistir"),
    p("Assista trinta segundos mudos da sua câmera, do lado do jogo. Se você não se reconhece no escuro, a luz vem antes de outra webcam. Se o enquadramento corta a testa toda vez que você comemora, recule a cadeira ou diminua o zoom. Reação cortada é pior do que janela pequena."),
    p("Trave a exposição e o balanço de branco, e confirme depois de uma hora: a lâmpada esquenta e a cor muda. Um retoque no meio da semana deixa a live consistente. Consistente ganha de perfeito num dia e azul no seguinte. A plateia acostuma com a sua cara, não com um filtro novo toda quinta."),
    p("Se a câmera filma a janela atrás de você ao meio-dia, feche a cortina ou mude de lugar. Nenhuma regulagem ganha de uma janela estourada. À noite, a luminária de frente devolve o rosto que a janela apagou de dia. Teste os dois horários se você transmite de dia e de noite. A regulagem que ficou boa às 15h costuma estourar às 21h, quando só a luminária está acesa."),
  ],
  "internet-para-fazer-live": [
    h2("Três testes valem mais do que um anúncio"),
    p("Anote três testes de subida, em três dias, no horário da live, no cabo. A mediana é o número com que você conversa com o bitrate, não o pico bonito. Se a mediana não cabe a qualidade que você quer, baixe a qualidade ou mude o horário. Trocar de plano sem essa anotação é chute, e o chute continua oscilando no mesmo horário do bairro."),
    p("Guarde o print com a data. Quando a live cair na semana seguinte, você compara com o número antigo em vez de discutir no escuro. Subida estável é o que segura a transmissão. O download do plano, sozinho, não diz nada sobre essa queda."),
  ],
  "gta-rp-e-o-que-o-gta-6-nao-e": [
    h2("Se a praça derruba o jogo"),
    p("Na primeira hora no servidor, fale pouco e ouça o tom da cidade. O microfone já testado evita você repetir o nome três vezes. Se o jogo cair toda vez que a praça enche, o PC é o assunto, não a regra. SSD e memória resolvem a maior parte desses tombos no GTA V. Anote a hora da queda e o que estava aberto. Com isso a loja não troca a placa à toa."),
    p("Feche o navegador de guias infinitas antes de culpar o servidor. Muita queda é memória estourada com o Discord, o mapa do servidor e o jogo juntos. 32 GB deixam essa combinação respirar. O GTA 6 não entra nessa conta: o servidor de hoje é GTA V."),
  ],
  "comecar-no-twitch-youtube-ou-kick": [
    h2("O que deixar pronto na conta"),
    p("Foto, nome pronunciável e uma frase sobre o que você joga. Sem isso, quem chega não sabe se fica. A chave de transmissão fica só no OBS, e você gera outra se desconfiar que vazou. Leia a idade mínima e a regra de conteúdo da plataforma escolhida antes da segunda live, não depois de um corte sair do controle."),
    p("Não abra as três no mesmo dia. Escolha uma, faça duas lives nela, e só então pense em espelhar. Espelhar cedo divide uma plateia que ainda não existe. O hábito em um lugar constrói o canal. O PC, a rede e o microfone, quando já passam no teste, ficam quietos enquanto você pratica aparecer."),
  ],
};

export function aplicarFolga(spec) {
  const extra = [...(extras[spec.slug] ?? []), ...(reforco[spec.slug] ?? [])];
  if (extra.length === 0) return spec;
  const i = spec.blocos.findIndex((b) => b.tipo === "chamada");
  const blocos = i === -1 ? [...spec.blocos, ...extra] : [...spec.blocos.slice(0, i), ...extra, ...spec.blocos.slice(i)];
  return { ...spec, blocos };
}
