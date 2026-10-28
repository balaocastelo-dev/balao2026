export type QuemFala = "de" | "para";

export type Roteiro = {
  id: string;
  de: string;
  para: string;
  tarefaDe: string;
  tarefaPara: string;
  falas: { quem: QuemFala; texto: string }[];
};

/**
 * Conversas prontas, no tom da loja. O modo demonstração sorteia uma,
 * espera um pouco e segue para a próxima. {de} e {para} só existem
 * nos roteiros genéricos.
 */
export const ROTEIROS: Roteiro[] = [
  {
    id: "campanha-video",
    de: "malaquias",
    para: "joao",
    tarefaDe: "Pedindo vídeo da campanha",
    tarefaPara: "Gravando vídeo da campanha",
    falas: [
      { quem: "de", texto: "João, fecha um vídeo curto da campanha da semana? Uns vinte segundos, com o produto na bancada." },
      { quem: "para", texto: "Fecho. Me manda o texto e eu corto hoje ainda." },
      { quem: "de", texto: "Texto já está no seu recado. Sem preço na tela, só o convite pra chamar a loja." },
    ],
  },
  {
    id: "os-faturar",
    de: "wendell",
    para: "dinherildo",
    tarefaDe: "Entregando ordem concluída",
    tarefaPara: "Faturando ordem de serviço",
    falas: [
      { quem: "de", texto: "Dinherildo, a ordem do notebook do Cambuí ficou pronta. Pode faturar." },
      { quem: "para", texto: "Beleza. A peça e a mão de obra já estão na ordem?" },
      { quem: "de", texto: "Estão. O Thiaguito avisa o cliente assim que você lançar." },
    ],
  },
  {
    id: "email-cliente",
    de: "futrico",
    para: "thiaguito",
    tarefaDe: "Encaminhando e-mail de cliente",
    tarefaPara: "Respondendo o cliente",
    falas: [
      { quem: "de", texto: "Thiaguito, chegou e-mail de um cliente perguntando da retirada. Te encaminhei." },
      { quem: "para", texto: "Vi. Respondo por aqui e confirmo o horário na loja." },
      { quem: "de", texto: "Deixei o histórico no fio, pra você não pedir o dado de novo." },
    ],
  },
  {
    id: "olx-numeros",
    de: "michael",
    para: "herrera",
    tarefaDe: "Pedindo leitura do anúncio",
    tarefaPara: "Lendo os números da OLX",
    falas: [
      { quem: "de", texto: "Herrera, o anúncio do notebook disparou visita hoje. Consegue ver se virou conversa?" },
      { quem: "para", texto: "Consigo. Te devolvo o comparativo com ontem em seguida." },
      { quem: "de", texto: "Se estiver parado na mensagem, eu ajusto a primeira foto." },
    ],
  },
  {
    id: "candidato",
    de: "hunter",
    para: "thiaguito",
    tarefaDe: "Apresentando um candidato",
    tarefaPara: "Recebendo o candidato",
    falas: [
      { quem: "de", texto: "Thiaguito, a pessoa da vaga de balcão respondeu. Quer que eu marque uma conversa?" },
      { quem: "para", texto: "Marca sim, no começo da tarde, antes do movimento." },
      { quem: "de", texto: "Combinado. Te mando o resumo de uma página, sem enrolação." },
    ],
  },
  {
    id: "pausa-cobranca",
    de: "sagrado",
    para: "kevinho",
    tarefaDe: "Cuidando do ritmo da cobrança",
    tarefaPara: "Reorganizando a fila de cobrança",
    falas: [
      { quem: "de", texto: "Kevinho, você está nessa fila desde cedo. Faz uma pausa de dez minutos que eu seguro o recado." },
      { quem: "para", texto: "Justo. Quando eu voltar, começo pelos acordos que vencem hoje." },
      { quem: "de", texto: "Isso. Cobrança firme, sem pressa torta. A meta continua de pé." },
    ],
  },
  {
    id: "acordo",
    de: "kevinho",
    para: "dinherildo",
    tarefaDe: "Registrando um acordo",
    tarefaPara: "Lançando o acordo no caixa",
    falas: [
      { quem: "de", texto: "Dinherildo, o cliente fechou acordo. Entra essa semana, em duas vezes." },
      { quem: "para", texto: "Anotei. Confiro o lançamento e te falo se faltar algum comprovante." },
      { quem: "de", texto: "O comprovante da primeira já está no e-mail do Futrico." },
    ],
  },
  {
    id: "ficha-imovel",
    de: "kenlinho",
    para: "futrico",
    tarefaDe: "Pedindo envio da ficha",
    tarefaPara: "Enviando ficha do imóvel",
    falas: [
      { quem: "de", texto: "Futrico, manda a ficha do apartamento pra cliente que visitou ontem? Ela pediu por e-mail." },
      { quem: "para", texto: "Mando agora. Quer que eu copie o Thiaguito no fio?" },
      { quem: "de", texto: "Copia. Se ela responder, o relacionamento já fica com ele." },
    ],
  },
  {
    id: "auditoria-caixa",
    de: "robertinho",
    para: "dinherildo",
    tarefaDe: "Apontando diferença no caixa",
    tarefaPara: "Conferindo o caixa",
    falas: [
      { quem: "de", texto: "Dinherildo, o caixa de ontem fechou com uma diferença pequena. Te marquei o lançamento." },
      { quem: "para", texto: "Vou olhar antes do fim do dia. Se for troco, eu ajusto e te devolvo." },
      { quem: "de", texto: "Perfeito. Deixei o recorte do horário do lado." },
    ],
  },
  {
    id: "criativo",
    de: "herrera",
    para: "malaquias",
    tarefaDe: "Entregando o criativo que rendeu",
    tarefaPara: "Reforçando o anúncio que rendeu",
    falas: [
      { quem: "de", texto: "Malaquias, o criativo da bancada rendeu mais conversa que o da vitrine." },
      { quem: "para", texto: "Então a próxima leva fica na bancada. O João já está com o vídeo novo." },
      { quem: "de", texto: "Quando publicar, me avisa que eu acompanho o primeiro dia." },
    ],
  },
  {
    id: "video-pronto",
    de: "joao",
    para: "malaquias",
    tarefaDe: "Entregando o vídeo",
    tarefaPara: "Publicando o vídeo",
    falas: [
      { quem: "de", texto: "Malaquias, o corte ficou pronto. Duas versões: uma com fala e outra só com letra." },
      { quem: "para", texto: "Boa. Uso a de letra no anúncio e a com fala no WhatsApp da loja, quando o Thiago autorizar." },
      { quem: "de", texto: "Arquivos já estão no recado. Sem preço, como combinado." },
    ],
  },
  {
    id: "notebook-pronto",
    de: "wendell",
    para: "thiaguito",
    tarefaDe: "Avisando serviço pronto",
    tarefaPara: "Chamando o cliente pra retirada",
    falas: [
      { quem: "de", texto: "Thiaguito, o notebook da assistência ligou redondo. Pode chamar o cliente." },
      { quem: "para", texto: "Chamo agora. Retirada aqui na loja, no horário de sempre." },
      { quem: "de", texto: "Diz que está na bancada da frente, com o nome dele na ordem." },
    ],
  },
  {
    id: "marketplace-relacionamento",
    de: "michael",
    para: "thiaguito",
    tarefaDe: "Passando interessado da OLX",
    tarefaPara: "Atendendo interessado da OLX",
    falas: [
      { quem: "de", texto: "Thiaguito, um interessado da OLX quer ver o notebook pessoalmente. Te passei o contato." },
      { quem: "para", texto: "Recebi. Ofereço um horário hoje no fim da tarde." },
      { quem: "de", texto: "Avisa se ele sumir, que eu retomo pelo anúncio." },
    ],
  },
  {
    id: "pausa-gravacao",
    de: "sagrado",
    para: "joao",
    tarefaDe: "Cuidando da pausa da gravação",
    tarefaPara: "Pausando a gravação",
    falas: [
      { quem: "de", texto: "João, você está no terceiro take seguido. Para cinco minutos, bebe uma água." },
      { quem: "para", texto: "Paro sim. O próximo é curto, depois eu exporto." },
      { quem: "de", texto: "Isso. Vídeo bom sai de gente descansada." },
    ],
  },
  {
    id: "os-sem-peca",
    de: "robertinho",
    para: "wendell",
    tarefaDe: "Apontando ordem incompleta",
    tarefaPara: "Completando a ordem de serviço",
    falas: [
      { quem: "de", texto: "Wendell, achei uma ordem concluída sem a peça lançada. Te deixei o número." },
      { quem: "para", texto: "Verdade, foi a memória que entrou no fim do serviço. Já lanço." },
      { quem: "de", texto: "Quando lançar, o Dinherildo consegue faturar sem eu travar o caixa." },
    ],
  },
  {
    id: "pessoa-nova",
    de: "hunter",
    para: "sagrado",
    tarefaDe: "Preparando a chegada de gente nova",
    tarefaPara: "Recebendo gente nova na equipe",
    falas: [
      { quem: "de", texto: "Sagrado, se a vaga fechar, a pessoa começa na segunda. Você recebe ela no primeiro dia?" },
      { quem: "para", texto: "Recebo. Mostro o ritmo da casa e quem cuida de cada frente." },
      { quem: "de", texto: "Ótimo. Eu levo o combinado da função, você leva o acolhimento." },
    ],
  },
  {
    id: "boleto-email",
    de: "futrico",
    para: "kevinho",
    tarefaDe: "Encaminhando e-mail de boleto",
    tarefaPara: "Tratando o boleto do cliente",
    falas: [
      { quem: "de", texto: "Kevinho, o cliente mandou o comprovante por e-mail. Está na sua fila." },
      { quem: "para", texto: "Vi o comprovante. Baixo essa parcela e confirmo com o Dinherildo." },
      { quem: "de", texto: "Se faltar o segundo anexo, eu peço de novo sem você precisar escrever." },
    ],
  },
  {
    id: "prioridade-recebimento",
    de: "dinherildo",
    para: "kevinho",
    tarefaDe: "Definindo prioridade do recebimento",
    tarefaPara: "Priorizando a cobrança de hoje",
    falas: [
      { quem: "de", texto: "Kevinho, hoje a prioridade é quem vence até sexta. O resto pode esperar a fila de amanhã." },
      { quem: "para", texto: "Entendido. Começo por esses e te falo o que responder." },
      { quem: "de", texto: "Se alguém pedir acordo, me chama antes de prometer data." },
    ],
  },
  {
    id: "visita-imovel",
    de: "kenlinho",
    para: "thiaguito",
    tarefaDe: "Confirmando visita ao imóvel",
    tarefaPara: "Avisando o cliente da visita",
    falas: [
      { quem: "de", texto: "Thiaguito, a visita do apartamento ficou para amanhã às dez. Avisa o cliente?" },
      { quem: "para", texto: "Aviso agora e peço confirmação por mensagem." },
      { quem: "de", texto: "Se ele remarcar, me devolve que eu seguro a chave." },
    ],
  },
  {
    id: "divergencia",
    de: "herrera",
    para: "robertinho",
    tarefaDe: "Entregando divergência do relatório",
    tarefaPara: "Auditando a divergência",
    falas: [
      { quem: "de", texto: "Robertinho, o relatório de ontem não bate com o que entrou no caixa. Te mandei o trecho." },
      { quem: "para", texto: "Pego agora. Se for lançamento duplicado, eu marco e o Dinherildo corrige." },
      { quem: "de", texto: "Marcado. Amanhã cedo eu gero de novo pra você conferir o ajuste." },
    ],
  },
];

/** Quando todo mundo dos roteiros fixos está ocupado, dois agentes livres improvisam. */
export const ROTEIROS_GENERICOS: Omit<Roteiro, "id" | "de" | "para">[] = [
  {
    tarefaDe: "Passando uma demanda",
    tarefaPara: "Assumindo a demanda",
    falas: [
      { quem: "de", texto: "{para}, sobrou uma frente aqui que é com você." },
      { quem: "para", texto: "Pode mandar, {de}. Eu puxo agora." },
      { quem: "de", texto: "Te encaminhei. Qualquer buraco no meio do caminho, me chama." },
    ],
  },
  {
    tarefaDe: "Pedindo uma conferência",
    tarefaPara: "Conferindo o que chegou",
    falas: [
      { quem: "de", texto: "{para}, dá uma olhada no que te mandei? Quero seguir sem furos." },
      { quem: "para", texto: "Olho sim, {de}. Te devolvo ainda neste turno." },
      { quem: "de", texto: "Valeu. Eu seguro o cliente enquanto isso." },
    ],
  },
  {
    tarefaDe: "Alinhando o próximo passo",
    tarefaPara: "Confirmando o próximo passo",
    falas: [
      { quem: "de", texto: "{para}, fechamos assim: você segue com a sua parte e eu aviso a loja." },
      { quem: "para", texto: "Fechado, {de}. Se mudar o combinado, me corta o caminho." },
      { quem: "de", texto: "Combinado. Deixo registrado pra não viver só na conversa." },
    ],
  },
];
