/**
 * Troca as ilustrações da série por fotografias.
 * Loja: fotos enviadas pelo Thiago, com rosto e placa já desfocados.
 * Demais: Pexels License (uso comercial, atribuição não obrigatória).
 *
 *   node scripts/serie-gta6/aplicar-fotos.mjs
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import { MATERIAS } from "./materias/index.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "../..");
const lojaDir = "/tmp/loja-ok";
const licencaPexels = "Pexels License — uso comercial permitido, atribuição não obrigatória";
const licencaLoja = "Fotografia da própria loja, enviada pelo Thiago em 16/11/2026. Rostos e placas de carro desfocados antes da publicação.";

const p = (id, autor, tema, alt, pagina) => ({
  id: `pexels-${id}`,
  tema,
  alt,
  autor,
  pagina: pagina || `https://www.pexels.com/photo/${id}/`,
  licenca: licencaPexels,
  url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`,
});

const STOCK = [
  p(33888375, "Atahan Demir", "pc", "Mesa escura com gabinete iluminado, dois monitores e teclado."),
  p(30469972, "Atahan Demir", "pc", "Mesa de jogo com monitor e luz colorida no gabinete."),
  p(30469967, "Atahan Demir", "pc", "Estação de jogo no escuro, com gabinete e periféricos iluminados."),
  p(17784701, "Pramod Tiwari", "pc", "Computador, notebook e teclado sobre uma mesa de jogo."),
  p(17840843, "Pramod Tiwari", "pc", "Computador montado sobre uma mesa preparada para jogar."),
  p(10684919, "Timur Kozmenko", "pc", "Interior de um gabinete com ventoinhas e luz colorida."),
  p(17576302, "Andrey Matveev", "gpu", "Placa de vídeo dentro de um gabinete escuro, com luz colorida."),
  p(13071303, "Isabella Mendes", "pc", "Gabinete com luz e monitor numa mesa de jogo."),
  p(36614464, "Andrey Matveev", "pc", "Gabinete branco aberto, com as ventoinhas à mostra."),
  p(32602655, "Andrey Matveev", "pc", "Gabinete aberto sobre uma mesa, pronto para montagem."),
  p(18966455, "Matheus Bertelli", "monitor", "Monitor, gabinete com luz e headset numa mesa de demonstração."),
  p(27559560, "Minh Phuc", "pc", "Mesa com gabinete, monitor curvo e caixas de som."),
  p(8622911, "Nana Dua", "gpu", "Placa de vídeo NVIDIA em close, com o dissipador à mostra."),
  p(34552796, "Matheus Bertelli", "gpu", "Placa GeForce instalada dentro do computador."),
  p(34552802, "Matheus Bertelli", "gpu", "Close de uma placa GeForce RTX, com os coolers."),
  p(35713954, "Andrey Matveev", "gpu", "Placa de vídeo e processadores dispostos sobre a mesa."),
  p(34552793, "Matheus Bertelli", "cpu", "Interior de PC gamer com water cooler e memórias."),
  p(30083229, "Atahan Demir", "cpu", "Processador Ryzen encaixado na placa-mãe."),
  p(37368169, "Jonathan Borba", "cpu", "Processador Intel instalado na placa-mãe."),
  p(37368171, "Jonathan Borba", "cpu", "Placa-mãe com processador e SSD instalados."),
  p(37113174, "Marta Branco", "ram", "Processador e módulos de memória lado a lado."),
  p(33384161, "Andrey Matveev", "ram", "Módulos de memória DDR5 com iluminação, sobre fundo amarelo."),
  p(34576700, "Domaintechnik Ledl.net", "ram", "Memórias instaladas ao lado do processador num servidor."),
  p(19693216, "William Warby", "ram", "Módulo de memória visto de cima, com os chips aparentes."),
  p(11216304, "Keifer Costa", "ssd", "SSD Samsung sobre uma superfície escura."),
  p(5222605, "Andrey Matveev", "ssd", "SSD M.2 no formato de palito, sobre fundo claro."),
  p(35984425, "Przemek Leśniewski", "ssd", "SSD NVMe Lexar encaixado numa placa."),
  p(32920312, "Marta Branco", "hdd", "Discos rígidos empilhados, do tipo mecânico."),
  p(4675007, "Nothing Ahead", "hdd", "HD externo com cabo USB, em close."),
  p(20076002, "Aleksander Dumała", "hdd", "HD portátil com o cabo ao lado."),
  p(20076003, "Aleksander Dumała", "rede", "Hub com portas USB, HDMI e rede, sobre fundo branco."),
  p(97975, "Markus Spiske", "rede", "Cabo de rede Ethernet enrolado, com o conector RJ-45."),
  p(18071864, "Jaycee300s", "rede", "Roteador ao lado de um monitor, numa mesa de casa."),
  p(32698507, "Pascal", "rede", "Roteador Wi-Fi com antenas e cabo, sobre uma mesa de madeira."),
  p(6045231, "Skylar Kang", "monitor", "Notebook e monitor lado a lado numa mesa."),
  p(15555796, "Pexels", "monitor", "Monitor e notebook abertos na mesma mesa."),
  p(20648390, "Minh Phuc", "monitor", "Monitor curvo, teclado e fone sobre a mesa."),
  p(19761838, "Amar Preciado", "monitor", "Monitor, teclado e equipamento de áudio numa mesa com luz baixa."),
  p(4499765, "Chelsey Horne", "monitor", "Monitor, teclado e mouse numa mesa escura."),
  p(28842073, "Atahan Demir", "periferico", "Mouse e teclado mecânico com luz azul."),
  p(12786603, "Pew Nguyen", "periferico", "Teclado mecânico e mouse sobre um mousepad."),
  p(27679707, "Simone Cisale", "periferico", "Fone sobre um teclado iluminado, com mouse ao lado."),
  p(18966452, "Matheus Bertelli", "periferico", "Teclado, mouse e headset claros, numa mesa de feira."),
  p(7862584, "Alena Darmel", "periferico", "Mãos no teclado e no mouse, com luz colorida na mesa."),
  p(28993064, "Matheus Bertelli", "headset", "Headset branco, mouse e teclado numa mesa de jogo."),
  p(18966439, "Matheus Bertelli", "headset", "Headset e teclado iluminado na frente de dois monitores."),
  p(9072340, "Yan Krukau", "headset", "Pessoa de headset sentada numa mesa de jogo, à noite."),
  p(9072298, "Yan Krukau", "headset", "Close de uma pessoa de headset, jogando no escuro."),
  p(6919947, "Kaboompics", "mic", "Microfone de mesa, notebook e fone num espaço de gravação."),
  p(6953871, "George Milton", "mic", "Microfone no pedestal, ligado a um notebook."),
  p(38125420, "Jakub Zerdzicki", "mic", "Microfone e fone num setup de gravação."),
  p(33923597, "Abdellah Benziane", "mic", "Microfone e câmera apontados para a mesma mesa."),
  p(37045294, "Jakub Zerdzicki", "webcam", "Celular na mão, com microfone e fone na mesa de gravação."),
  p(10864871, "Ella Wei", "webcam", "Notebook, monitor e webcam numa mesa clara."),
  p(7745560, "I'm Zion", "webcam", "Monitor com uma câmera pequena ao lado e fone na mesa."),
  p(30111699, "Noland Live", "streamer", "Pessoa de fone e microfone, transmitindo sentada à mesa."),
  p(9072382, "Yan Krukau", "streamer", "Pessoa de headset olhando para o monitor, no escuro."),
  p(8791330, "Ian van der Linde", "gamer", "Pessoa de headset e controle, jogando com luz verde."),
  p(32772105, "Shalom Ejiofor", "gamer", "Pessoa de fone jogando no computador, em casa."),
  p(35730202, "khezez", "gamer", "Pessoa de fone jogando no sofá, à noite."),
  p(7855665, "Ron Lach", "controle", "Pessoa segurando um controle, com a mesa de jogo ao lado."),
  p(15686453, "Youssef Samuil", "controle", "Gatilhos de um controle de PlayStation, em close."),
  p(18641166, "Ruben Boekeloo", "xbox", "Controle de Xbox em close, carregando."),
  p(32713615, "Pascal", "ps5", "Controle de PlayStation 5 apoiado no console."),
  p(33513532, "Pascal", "ps5", "PlayStation 5 e controle DualSense numa prateleira."),
  p(32967534, "Pascal", "ps5", "PlayStation 5 em pé, com o controle ao lado, numa mesa."),
  p(16776031, "Martin Martz", "xbox", "Console Xbox e controle, em fundo escuro."),
  p(10997627, "Nathan J Hilton", "xbox", "Console Xbox branco e controle, em close."),
  p(12339571, "Imthiyaz Syed", "xbox", "Console e controle brancos sobre uma superfície reflexiva."),
  p(5961216, "Kerde Severin", "console", "Console branco com o controle na frente."),
  p(35065601, "Abhishek Navlakha", "miami", "Orla de Miami Beach, com prédios e água, de dia."),
  p(28426337, "Nina Hill", "miami", "Horizonte de Miami com palmeiras na frente da água."),
  p(34650327, "Arian Fernandez", "miami", "Prédios de Miami, palmeiras e o mar sob céu nublado."),
  p(8311267, "Lalada", "miami", "Palmeira na beira do mar em Miami Beach."),
  p(11457815, "Luis Erives", "miami", "Ocean Drive à noite, com letreiros coloridos."),
  p(11457826, "Luis Erives", "miami", "Rua cheia à noite em Miami Beach, com neon."),
  p(11457818, "Luis Erives", "miami", "Hotéis iluminados na beira da rua, à noite, em Miami."),
  p(37680039, "Tamara G.P", "miami", "Hotéis e palmeiras de Miami Beach no fim da tarde."),
  p(36391552, "Marcelo Gonzalez", "miami", "Avenida do centro de Miami à noite, com rastros de luz."),
  p(23196617, "Jojo Tesini", "miami", "Miami Beach no crepúsculo, com palmeiras e a rua acesa."),
  p(31958539, "Chris The Island", "miami", "Praia da Flórida vista de cima, com água azul."),
  p(16403226, "Amit Shubinsky", "miami", "Praia de Siesta Key, na Flórida, vista de drone."),
  p(36358872, "Pexels", "notebook", "Teclado de notebook e mouse sem fio, em close."),
  p(8891159, "MIKHAIL ANDRSN", "notebook", "Notebook, microfone e câmera numa mesa de gravação."),
  p(30836163, "Minh Phuc", "periferico", "Teclado, mouse e controles numa mesa clara."),
  p(15372901, "Pew Nguyen", "periferico", "Fone, teclado mecânico e acessórios sobre o mousepad."),
  p(33061113, "Pascal", "controle", "Controle branco de PlayStation 5 sobre fundo vermelho."),
  p(33644890, "Andrey Matveev", "pc", "Interior de um PC gamer, com placa de vídeo e cooler."),
  p(34301922, "Gibson Chan", "pc", "Luz colorida dentro de um gabinete montado."),
  p(31987226, "Zayn Haddad", "gamer", "Pessoa de óculos e cabelo colorido numa mesa de jogo com neon."),
  p(31862216, "UMUT", "gamer", "Pessoa jogando num PC com luz vermelha e azul."),
  p(20798222, "Orhan Pergel", "gamer", "Homem jogando no escuro, com o monitor iluminando o rosto."),
  p(7923236, "Andres Garcia", "gamer", "Jovem jogando num espaço com luz colorida."),
  p(28993124, "Matheus Bertelli", "headset", "Pessoa de headset numa mesa de jogo com neon."),
];

const LOJA = {
  "fachada-letreiro": { arquivo: "10-fachada-principal_0710.jpg", crop: { x: 0, y: 0.08, w: 1, h: 0.42 }, alt: "Fachada vermelha da Balão da Informática Anchieta, com o letreiro preto e o logotipo do balão." },
  "fachada-porta": { arquivo: "10-fachada-principal_0710.jpg", crop: { x: 0, y: 0.28, w: 0.52, h: 0.32 }, alt: "Porta de vidro da loja e a bandeira vermelha de notebooks, na Av. Anchieta." },
  "fachada-predio": { arquivo: "09-fachada-lateral-estacionamento_e432.jpg", crop: { x: 0.38, y: 0.02, w: 0.62, h: 0.46 }, alt: "Prédio vermelho da loja visto de lado, com o céu e os prédios de Campinas ao fundo." },
  "balao-inflavel": { arquivo: "09-fachada-lateral-estacionamento_e432.jpg", crop: { x: 0.22, y: 0.36, w: 0.42, h: 0.28 }, alt: "Balão inflável listrado da loja, encostado na parede vermelha." },
  "balcao": { arquivo: "01-balcao-escada-parede-vermelha-logo_1639.jpg", crop: { x: 0.05, y: 0.4, w: 0.9, h: 0.5 }, alt: "Balcão curvo vermelho e branco, com um iMac e caixas de computador." },
  "escada": { arquivo: "01-balcao-escada-parede-vermelha-logo_1639.jpg", crop: { x: 0.28, y: 0, w: 0.7, h: 0.48 }, alt: "Escada branca e parede vermelha com o quadro da Balão da Informática." },
  "imac": { arquivo: "01-balcao-escada-parede-vermelha-logo_1639.jpg", crop: { x: 0, y: 0.42, w: 0.55, h: 0.4 }, alt: "iMac sobre o balcão curvo, com teclado e mouse ao lado." },
  "gpus-topo": { arquivo: "02-estante-notebooks-placas-de-video_ac59.jpg", crop: { x: 0, y: 0.02, w: 1, h: 0.24 }, alt: "Caixas de placa de vídeo enfileiradas no topo da estante branca da loja." },
  "acessorios": { arquivo: "03-parede-acessorios-mesas-atendimento_2b9c.jpg", crop: { x: 0, y: 0.28, w: 0.62, h: 0.42 }, alt: "Parede de acessórios em saquinhos, atrás das mesas de atendimento." },
  "mesas": { arquivo: "03-parede-acessorios-mesas-atendimento_2b9c.jpg", crop: { x: 0.15, y: 0.5, w: 0.75, h: 0.4 }, alt: "Mesas brancas de atendimento com monitores, na loja do Cambuí." },
  "mesa-sem-pessoa": { arquivo: "04-acessorios-atendimento-com-atendente_fae4.jpg", crop: { x: 0.4, y: 0.2, w: 0.58, h: 0.55 }, alt: "Mesa branca e mostruário de placas, no canto do atendimento, sem pessoas no quadro." },
  "corredor": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0.1, y: 0.15, w: 0.8, h: 0.7 }, alt: "Corredor da loja, com o balcão branco, estantes e as luminárias em X no teto." },
  "estantes-direita": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0.55, y: 0.2, w: 0.45, h: 0.7 }, alt: "Estantes brancas do corredor, com caixas e monitores." },
  "gpus-parede": { arquivo: "06-gpus-pcs-gamer-com-tecnicos_ccb3.jpg", crop: { x: 0, y: 0.28, w: 0.55, h: 0.42 }, alt: "Prateleiras brancas com caixas de placa de vídeo, na parede vermelha da loja." },
  "pc-rgb": { arquivo: "06-gpus-pcs-gamer-com-tecnicos_ccb3.jpg", crop: { x: 0.48, y: 0.55, w: 0.5, h: 0.4 }, alt: "Gabinete branco com ventoinhas coloridas, sobre o balcão da loja." },
  "vitrine-totem": { arquivo: "07-vitrine-entrada-totem_23d8.jpg", crop: { x: 0.52, y: 0.12, w: 0.46, h: 0.7 }, alt: "Totem de autoatendimento e estante branca, ao lado da vitrine de entrada." },
  "vitrine-displays": { arquivo: "07-vitrine-entrada-totem_23d8.jpg", crop: { x: 0, y: 0.22, w: 0.52, h: 0.5 }, alt: "Displays da vitrine de entrada, com telas mostrando computadores." },
  "pdv": { arquivo: "08-balcao-caixa-pdv_27d8.jpg", crop: { x: 0, y: 0.28, w: 0.62, h: 0.62 }, alt: "Balcão do caixa, com o computador do PDV, teclado e o iMac ao lado." },
  "pdv-teclado": { arquivo: "08-balcao-caixa-pdv_27d8.jpg", crop: { x: 0.28, y: 0.45, w: 0.4, h: 0.4 }, alt: "Teclado e monitor do caixa, no balcão vermelho da loja." },
  "corredor-fundo": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0.2, y: 0.35, w: 0.45, h: 0.4 }, alt: "Fundo do corredor, com a parede vermelha e a escada da loja." },
  "acessorios-baixo": { arquivo: "03-parede-acessorios-mesas-atendimento_2b9c.jpg", crop: { x: 0, y: 0.48, w: 0.5, h: 0.35 }, alt: "Bancada branca sob a parede de acessórios, com monitor e caixas." },
  "gpus-detalhe": { arquivo: "06-gpus-pcs-gamer-com-tecnicos_ccb3.jpg", crop: { x: 0.18, y: 0.34, w: 0.38, h: 0.22 }, alt: "Caixas de placa de vídeo nas prateleiras do meio, na parede vermelha." },
  "caixa-branca": { arquivo: "06-gpus-pcs-gamer-com-tecnicos_ccb3.jpg", crop: { x: 0.72, y: 0.68, w: 0.28, h: 0.28 }, alt: "Gabinete branco aberto no balcão, com a lateral de acrílico." },
  "teclado-roxo": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0, y: 0.68, w: 0.4, h: 0.28 }, alt: "Teclado com luz roxa no balcão da frente do corredor." },
  "teto-luz": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0.15, y: 0, w: 0.6, h: 0.28 }, alt: "Teto escuro da loja com as luminárias cruzadas em X." },
  "pc-preto": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0, y: 0.32, w: 0.28, h: 0.28 }, alt: "Gabinete preto numa estante branca, no corredor da loja." },
  "monitor-corredor": { arquivo: "05-corredor-interno-loja_f246.jpg", crop: { x: 0.28, y: 0.42, w: 0.32, h: 0.28 }, alt: "Monitores sobre as mesas do corredor da loja." },
  "fachada-predio": { arquivo: "09-fachada-lateral-estacionamento_e432.jpg", crop: { x: 0.4, y: 0.05, w: 0.55, h: 0.42 }, alt: "Lateral do prédio vermelho da loja, com as janelas espelhadas." },
  "balao": { arquivo: "09-fachada-lateral-estacionamento_e432.jpg", crop: { x: 0.22, y: 0.4, w: 0.36, h: 0.22 }, alt: "Balão inflável branco e vermelho na calçada da loja." },
};

const POR_ARTIGO = {
  "gta-6-lancamento-19-novembro-2026": { capa: "ps5", datas: "miami", confirmado: "xbox", fecho: "controle" },
  "gta-6-plataformas-ps5-xbox-e-pc": { capa: "ps5", aparelhos: "xbox", nativo: "pc", fecho: "controle" },
  "gta-6-trailers-oficiais": { capa: "pc", videos: "periferico", limites: "miami", fecho: "miami" },
  "gta-6-mapa-leonida-e-vice-city": { capa: "miami", nomes: "miami", leitura: "miami", fecho: "miami" },
  "gta-6-lucia-e-jason": { capa: "miami", dupla: "gamer", origem: "miami", fecho: "miami" },
  "gta-6-preco-e-edicoes": { capa: "console", precos: "ps5", incluso: "xbox", fecho: "miami" },
  "gta-6-perguntas-frequentes": { capa: "gamer", aberto: "loja:acessorios", rota: "miami", fecho: "controle" },
  "gta-6-pre-carga-e-tamanho": { capa: "ssd", calendario: "ssd", espaco: "hdd", fecho: "rede" },
  "pc-para-gta-6-sem-requisito-oficial": { capa: "pc", precedente: "pc", decisao: "monitor", fecho: "gpu" },
  "placa-de-video-para-gta-6": { capa: "gpu", vram: "gpu", cenario: "loja:gpus-detalhe", fecho: "gpu" },
  "processador-para-gta-6": { capa: "cpu", troca: "cpu", limites: "cpu", fecho: "cpu" },
  "memoria-ram-para-gta-6": { capa: "ram", usos: "ram", pilha: "pc", fecho: "ram" },
  "ssd-para-gta-6": { capa: "ssd", gigas: "ssd", disco: "hdd", fecho: "pc" },
  "monitor-para-gta-6": { capa: "monitor", telas: "monitor", taxa: "monitor", fecho: "monitor" },
  "perifericos-para-gta-6": { capa: "periferico", pecas: "headset", ordem: "periferico", fecho: "periferico" },
  "pc-gamer-entrada-para-gta-6": { capa: "pc", faixa: "monitor", pedido: "loja:imac", fecho: "loja:pdv" },
  "pc-gamer-intermediario-para-gta-6": { capa: "pc", vram: "gpu", faixas: "loja:vitrine-displays", fecho: "loja:gpus-parede" },
  "pc-gamer-alto-desempenho-gta-6": { capa: "pc", "camadas-alta": "loja:caixa-branca", mesa: "pc", fecho: "loja:pc-rgb" },
  "upgrade-do-pc-antes-do-gta-6": { capa: "loja:gpus-topo", ordem: "ssd", linha: "ram", fecho: "loja:acessorios-baixo" },
  "notebook-gamer-ou-desktop-gta-6": { capa: "notebook", formatos: "loja:teclado-roxo", escolha: "loja:estantes-direita", fecho: "loja:corredor" },
  "pc-gamer-gta-6-campinas": { capa: "loja:fachada-letreiro", cidade: "loja:corredor-fundo", espera: "loja:vitrine-totem", fecho: "loja:balcao" },
  "montagem-pc-gamer-campinas": { capa: "loja:fachada-porta", "passos-montagem": "loja:mesas", bancada: "loja:mesa-sem-pessoa", fecho: "loja:escada" },
  "pc-para-live-de-gta-6": { capa: "streamer", cargas: "mic", duas: "pc", fecho: "loja:pc-preto" },
  "obs-para-live-de-jogo": { capa: "monitor", cena: "webcam", codifica: "periferico", fecho: "loja:monitor-corredor" },
  "setup-de-streamer-para-gta-6": { capa: "streamer", zonas: "mic", ordem: "periferico", fecho: "webcam" },
  "microfone-para-live-de-jogo": { capa: "mic", tipos: "mic", "ordem-voz": "headset", fecho: "periferico" },
  "webcam-para-stream": { capa: "webcam", "passos-rosto": "mic", olhar: "loja:pdv-teclado", fecho: "loja:teto-luz" },
  "internet-para-fazer-live": { capa: "rede", caminhos: "rede", teste: "rede", fecho: "periferico" },
  "gta-rp-e-o-que-o-gta-6-nao-e": { capa: "gamer", existe: "controle", maquina: "headset", fecho: "loja:balao" },
  "comecar-no-twitch-youtube-ou-kick": { capa: "streamer", plataformas: "gamer", comeco: "periferico", fecho: "headset" },
};

function fila(tema) {
  return STOCK.filter((foto) => foto.tema === tema);
}

const FAMILIA = {
  pc: ["pc", "gpu", "cpu", "monitor", "notebook"],
  gpu: ["gpu", "pc", "cpu"],
  cpu: ["cpu", "ram", "pc"],
  ram: ["ram", "cpu", "pc"],
  ssd: ["ssd", "hdd", "pc"],
  hdd: ["hdd", "ssd"],
  monitor: ["monitor", "pc", "notebook"],
  notebook: ["notebook", "monitor", "pc"],
  periferico: ["periferico", "headset", "pc"],
  headset: ["headset", "periferico", "mic"],
  mic: ["mic", "headset", "webcam", "streamer"],
  webcam: ["webcam", "mic", "streamer"],
  streamer: ["streamer", "gamer", "headset", "mic"],
  gamer: ["gamer", "streamer", "controle", "headset"],
  controle: ["controle", "ps5", "xbox", "console"],
  ps5: ["ps5", "controle", "console", "xbox"],
  xbox: ["xbox", "controle", "console", "ps5"],
  console: ["console", "ps5", "xbox", "controle"],
  miami: ["miami"],
  rede: ["rede", "notebook", "monitor"],
};

function escolher() {
  const usado = new Set();
  const lojaUsada = new Set();
  const cursor = {};
  const escolhas = [];
  const pegarTema = (tema) => {
    const lista = fila(tema);
    let i = cursor[tema] || 0;
    while (i < lista.length && usado.has(lista[i].id)) i += 1;
    cursor[tema] = i;
    if (i >= lista.length) return null;
    cursor[tema] = i + 1;
    usado.add(lista[i].id);
    return lista[i];
  };
  const pegar = (tema) => {
    const ordem = FAMILIA[tema] || [tema];
    for (const candidato of ordem) {
      const foto = pegarTema(candidato);
      if (foto) return foto;
    }
    return null;
  };
  for (const materia of MATERIAS) {
    const mapa = POR_ARTIGO[materia.slug];
    if (!mapa) throw new Error(`Sem mapa de fotos: ${materia.slug}`);
    for (const img of materia.imagens) {
      const chave = mapa[img.id];
      if (!chave) throw new Error(`Sem foto para ${materia.slug} / ${img.id}`);
      if (chave.startsWith("loja:")) {
        const nome = chave.slice(5);
        const loja = LOJA[nome];
        if (!loja) throw new Error(`Recorte desconhecido ${chave}`);
        if (lojaUsada.has(nome)) throw new Error(`Recorte de loja repetido: ${nome}`);
        lojaUsada.add(nome);
        escolhas.push({ materia, img, loja, id: nome });
      } else {
        let foto = pegar(chave);
        if (!foto && chave !== "miami") {
          for (const tema of Object.keys(FAMILIA)) {
            if (tema === "miami") continue;
            foto = pegarTema(tema);
            if (foto) break;
          }
        }
        if (!foto) {
          throw new Error(`Acabou o tema ${chave} em ${materia.slug}/${img.id}. stock ${usado.size}/${STOCK.length} loja ${lojaUsada.size} escolhas ${escolhas.length}`);
        }
        escolhas.push({ materia, img, foto });
      }
    }
  }
  return escolhas;
}

async function baixar(url, destino) {
  const resposta = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!resposta.ok) throw new Error(`${resposta.status} ${url}`);
  await pipeline(resposta.body, createWriteStream(destino));
}

async function gravarWebp(entrada, destino, capa) {
  const largura = capa ? 1536 : 1600;
  const altura = capa ? 1024 : 900;
  await sharp(entrada).rotate().resize(largura, altura, { fit: "cover", position: "centre" }).webp({ quality: 76 }).toFile(destino);
  return { largura, altura };
}

async function gravarRecorte(loja, destino, capa) {
  const entrada = join(lojaDir, loja.arquivo);
  const meta = await sharp(entrada).metadata();
  const left = Math.round(loja.crop.x * meta.width);
  const top = Math.round(loja.crop.y * meta.height);
  const width = Math.round(loja.crop.w * meta.width);
  const height = Math.round(loja.crop.h * meta.height);
  const largura = capa ? 1536 : 1600;
  const altura = capa ? 1024 : 900;
  await sharp(entrada)
    .extract({ left, top, width: Math.min(width, meta.width - left), height: Math.min(height, meta.height - top) })
    .resize(largura, altura, { fit: "cover", position: "centre" })
    .webp({ quality: 76 })
    .toFile(destino);
  return { largura, altura };
}

function destinoDe(materia, img) {
  if (img.papel === "capa") return join(raiz, "public/blog/capas", `${materia.slug}.webp`);
  return join(raiz, "public/blog/figuras", `${materia.slug}-${img.id}.webp`);
}

function publicoDe(materia, img) {
  if (img.papel === "capa") return `/blog/capas/${materia.slug}.webp`;
  return `/blog/figuras/${materia.slug}-${img.id}.webp`;
}

function legendaDe(escolha) {
  if (escolha.loja) return `${escolha.loja.alt} Foto da loja, na Av. Anchieta, 789, Cambuí.`;
  return `${escolha.foto.alt} Foto de ${escolha.foto.autor} (Pexels).`;
}

async function atualizarTexto(escolhas) {
  const porArquivo = new Map();
  for (const escolha of escolhas) {
    const arquivo = join(raiz, "content/blog/artigos", `${escolha.materia.slug}.ts`);
    if (!porArquivo.has(arquivo)) porArquivo.set(arquivo, []);
    porArquivo.get(arquivo).push(escolha);
  }
  for (const [arquivo, lista] of porArquivo) {
    let texto = await readFile(arquivo, "utf8");
    for (const escolha of lista) {
      const src = publicoDe(escolha.materia, escolha.img);
      const alt = escolha.loja ? escolha.loja.alt : escolha.foto.alt;
      const bloco = texto.indexOf(`src: "${src}"`);
      if (bloco < 0) throw new Error(`Não achei ${src} em ${arquivo}`);
      const altEm = texto.indexOf("alt:", bloco);
      const fimAlt = texto.indexOf("\n", altEm);
      texto = `${texto.slice(0, altEm)}alt: ${JSON.stringify(alt)},${texto.slice(fimAlt)}`;
      const pronta = texto.indexOf("pronta:", bloco);
      texto = `${texto.slice(0, pronta)}pronta: false,${texto.slice(texto.indexOf("\n", pronta))}`;
      if (escolha.img.papel !== "capa") {
        const legendaEm = texto.indexOf("legenda:", bloco);
        const fim = texto.indexOf("\n", legendaEm);
        texto = `${texto.slice(0, legendaEm)}legenda: ${JSON.stringify(legendaDe(escolha))},${texto.slice(fim)}`;
      }
    }
    await writeFile(arquivo, texto);
  }
}

function manifesto(escolhas) {
  const linhas = [
    "# Origem das imagens da série GTA 6",
    "",
    "Cada matéria tem 4 fotografias: a capa e três no corpo. Nenhuma ilustração gerada por código permanece no ar.",
    "Fotos da loja: enviadas pelo Thiago em 16/11/2026. Rostos (fotos 04 e 06) e placas de carro (fotos 09 e 10) foram desfocados. Onde o mesmo original aparece duas vezes, o recorte é outro.",
    "Fotos de banco: Pexels License, uso comercial permitido, atribuição não obrigatória. https://www.pexels.com/license/",
    "",
    "| Arquivo | Matéria | O que mostra | Origem | Autor | Licença |",
    "|---|---|---|---|---|---|",
  ];
  for (const escolha of escolhas) {
    const arquivo = publicoDe(escolha.materia, escolha.img);
    const alt = (escolha.loja ? escolha.loja.alt : escolha.foto.alt).replace(/\|/g, "/");
    if (escolha.loja) {
      linhas.push(`| \`${arquivo}\` | ${escolha.materia.slug} | ${alt} | Foto da loja (\`${escolha.loja.arquivo}\`, recorte \`${escolha.id.split("-").slice(1, -1).join("-") || "loja"}\`) | Balão da Informática Anchieta | ${licencaLoja} |`);
    } else {
      linhas.push(`| \`${arquivo}\` | ${escolha.materia.slug} | ${alt} | ${escolha.foto.pagina} | ${escolha.foto.autor} | ${licencaPexels} |`);
    }
  }
  linhas.push("");
  return linhas.join("\n");
}

const escolhas = escolher();
const cache = join("/tmp/pexels-serie");
await mkdir(cache, { recursive: true });
await mkdir(join(raiz, "public/blog/capas"), { recursive: true });
await mkdir(join(raiz, "public/blog/figuras"), { recursive: true });

for (const escolha of escolhas) {
  const destino = destinoDe(escolha.materia, escolha.img);
  if (escolha.loja) {
    await gravarRecorte(escolha.loja, destino, escolha.img.papel === "capa");
  } else {
    const bruto = join(cache, `${escolha.foto.id}.jpg`);
    try {
      await readFile(bruto);
    } catch {
      await baixar(escolha.foto.url, bruto);
    }
    await gravarWebp(bruto, destino, escolha.img.papel === "capa");
  }
  process.stdout.write(".");
}
process.stdout.write("\n");
await atualizarTexto(escolhas);
await writeFile(join(raiz, "docs/blog/serie-gta6-imagens.md"), manifesto(escolhas));
console.log(`${escolhas.length} fotografias gravadas.`);
