import type { PaginaDeCaptacao } from "../tipos";

const MENSAGEM =
  "Olá! Quero formatar meu ( ) notebook ( ) PC, ( ) com backup. Modelo: ____. Qual o preço e o prazo?";

export const formatacao: PaginaDeCaptacao = {
  slug: "formatacao",
  nome: "Formatação com backup",
  chamada: "Formatação de notebook e PC no Cambuí, com backup combinado antes e aviso quando o problema é o disco, não o sistema.",
  seo: {
    titulo: "Formatação de Notebook em Campinas com Backup Incluído",
    descricao:
      "Formatação de notebook e PC com backup no Cambuí. Seus arquivos salvos, Windows instalado e retirada no balcão. Preço pelo WhatsApp.",
    palavras: [
      "formatação notebook campinas",
      "formatar pc com backup campinas",
      "remover vírus notebook campinas",
      "quanto custa formatar notebook",
      "instalar windows campinas",
      "formatação cambuí",
      "backup antes de formatar",
      "notebook lento vírus",
    ],
    tipoDeServico: "Formatação com backup",
    catalogo: ["Formatação de notebook", "Formatação de PC", "Backup de arquivos", "Instalação de Windows"],
  },
  hero: {
    contexto: "Bancada própria no Cambuí, em Campinas",
    titulo: "Formatação com backup, no balcão do Cambuí",
    texto:
      "PC ou notebook lento, com vírus ou janela que abre sozinha: a bancada diz se formatar resolve ou se o disco é que está no fim. Com backup, documentos, fotos e favoritos do navegador são salvos antes. Preço e prazo confirmados pelo WhatsApp.",
    imagem: { src: "/images/landing/v2/sistemas.jpg", alt: "Computador na bancada durante instalação de sistema" },
    mensagem: MENSAGEM,
    botao: "Pedir preço no WhatsApp",
    secundario: { rotulo: "Ver o que entra no backup", href: "#secao-3" },
    fatos: [
      { valor: "Backup antes", rotulo: "o que será salvo é combinado" },
      { valor: "Windows", rotulo: "licença tratada à parte, se você não tiver" },
      { valor: "Honestidade", rotulo: "avisamos se formatar não resolve" },
      { valor: "Mesmo balcão", rotulo: "Av. Anchieta, 789, Cambuí" },
    ],
  },
  assistente: {
    titulo: "Notebook ou PC, com ou sem backup",
    texto: "A mensagem já sai com o que a bancada precisa para passar preço e prazo.",
    abertura: MENSAGEM,
    botao: "Enviar para a bancada",
    perguntas: [
      { rotulo: "Aparelho", pergunta: "O que vai formatar?", opcoes: ["Notebook", "PC"] },
      { rotulo: "Backup", pergunta: "Precisa de backup?", opcoes: ["Sim", "Não", "Não sei"] },
      { rotulo: "Sintoma", pergunta: "O que está acontecendo?", opcoes: ["Lento", "Vírus ou propaganda", "Não liga o sistema", "Quero só reinstalar"] },
    ],
  },
  secoes: [
    {
      tipo: "texto",
      titulo: "Formatação com backup",
      paragrafos: [
        "Formatar apaga o sistema e instala de novo. Sem backup, fotos e documentos que só estavam naquele disco somem. Por isso a Balão da Informática Anchieta separa dois serviços: a formatação simples, quando você já guardou o que importa, e a formatação com backup, em que a bancada copia antes e devolve depois.",
        "O Windows que volta na máquina depende da licença. Se você já tem uma, a equipe usa a sua. Se não tem, a loja vende licença de Windows e pode incluir no orçamento. Office não entra automático: peça se quiser, na página de licenças. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
        "A retirada é no balcão da Av. Anchieta, 789, Cambuí, com o computador ligado para você ver. Em Campinas e região dá para combinar motoboy. O custo da coleta não está nesta página: é confirmado pelo WhatsApp.",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Preço: simples ou com backup",
      texto:
        "Os dois serviços não custam a mesma coisa, porque o backup leva tempo de cópia e de devolução dos arquivos. A loja não publica o valor nesta página. Preço e prazo confirmados pelo WhatsApp.",
      colunas: ["Serviço", "Quando faz sentido", "O que você precisa dizer"],
      linhas: [
        ["Formatação simples", "Você já copiou fotos e documentos para outro lugar", "Modelo e se já tem licença de Windows"],
        ["Formatação com backup", "Os arquivos importantes estão só nesse computador", "O que não pode se perder"],
        ["Não formatar", "O disco é que está lento ou falhando", "Se o computador demora até para acender o disco"],
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Diga se é notebook ou PC e se precisa de backup. A equipe retorna no WhatsApp com preço e prazo.",
      assunto: "Formatação com backup",
      campos: [
        { nome: "aparelho", rotulo: "Notebook ou PC?", opcoes: ["Notebook", "PC"] },
        { nome: "backup", rotulo: "Precisa de backup?", opcoes: ["Sim", "Não", "Não sei"] },
      ],
    },
    {
      tipo: "regras",
      titulo: "O que salvamos no backup",
      texto: "A lista abaixo é o combinado padrão. O que for diferente no seu caso é falado antes de apagar qualquer coisa.",
      itens: [
        {
          titulo: "Documentos e fotos",
          texto: "Pastas de documentos, área de trabalho, downloads que você apontar e fotos. Diga se usa outra pasta, senão ela pode ficar de fora.",
        },
        {
          titulo: "Favoritos do navegador",
          texto: "Os favoritos do navegador entram no backup. Senha salva no navegador e conversa de aplicativo não entram nesta lista: confirme no WhatsApp se você precisa delas, porque nem todo caso a bancada consegue exportar.",
        },
        {
          titulo: "E-mail",
          texto: "Conta que fica na nuvem volta quando você entra de novo. E-mail guardado só no computador precisa ser avisado antes, para a equipe procurar o arquivo.",
        },
      ],
    },
    {
      tipo: "texto",
      titulo: "Windows e programas",
      paragrafos: [
        "A formatação entrega o sistema instalado e os drivers do modelo, para rede, vídeo e som voltarem a funcionar. Programa que você comprou à parte (o editor, a assinatura digital, o sistema do banco) precisa do instalador ou do login. Traga isso ou avise, senão o computador volta limpo e sem aquele programa.",
        "A licença de Windows é um item do orçamento, não um brinde escondido. Quem já tem licença não paga outra. Quem não tem, vê o valor da licença junto com o serviço, na página de licenças Microsoft ou na conversa. A loja não instala sistema sem licença.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Quando formatar não resolve",
      paragrafos: [
        "Formatar devolve um sistema limpo. Não cura HD que já está no fim da vida: o computador continua lento ou perde arquivo de novo. Nesses casos a troca por SSD é o caminho, e a bancada avisa antes de cobrar a formatação. Veja o upgrade de SSD e memória.",
        "Também não resolve tela quebrada, teclado morto, bateria que não carrega nem placa que não liga. Se o sintoma é de hardware, o conserto de notebook é a página certa. Se o disco já não abre, pare de tentar e fale de recuperação de dados: cada tentativa a mais pode piorar.",
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Caminhos vizinhos",
      itens: [
        { titulo: "Upgrade de SSD", texto: "Quando a lentidão é o HD, não o sistema.", href: "/upgrade-ssd", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Conserto de notebook", texto: "Defeito de tela, carga, calor ou placa.", href: "/manutencao", imagem: "/images/landing/v2/manutencao.jpg" },
        { titulo: "Licenças Microsoft", texto: "Windows e Office, se você ainda não tem.", href: "/microsoft", imagem: "/images/landing/v2/microsoft.jpg" },
        { titulo: "Recuperação de dados", texto: "Disco que já não abre ou arquivo que sumiu.", href: "/recuperacaodados", imagem: "/images/landing/v2/recuperacaodados.jpg" },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Quanto custa formatar um notebook em Campinas?",
      resposta:
        "Na Balão da Informática Anchieta, no Cambuí, a formatação simples e a formatação com backup têm valores diferentes. A retirada é no balcão, e o prazo depende da agenda e do tamanho do backup. Preço e prazo confirmados pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Perco meus arquivos ao formatar?",
      resposta:
        "Na formatação com backup, a loja salva documentos, fotos e favoritos do navegador antes e devolve o que foi salvo depois da instalação. O que entra no backup é combinado antes. Se o disco já estiver falhando, o caso pode ser recuperação de dados, e você fica sabendo antes.",
    },
    {
      pergunta: "Formatar resolve notebook lento?",
      resposta:
        "Só quando a lentidão é de sistema. Se o HD estiver desgastado, a troca por SSD resolve melhor, e a bancada avisa antes de cobrar a formatação.",
    },
    {
      pergunta: "O Windows é original?",
      resposta:
        "Sim. Ou usamos a licença que você já tem, ou a loja inclui uma licença no orçamento. A instalação sem licença não é o serviço.",
    },
    {
      pergunta: "Vocês instalam Office?",
      resposta:
        "Se você pedir. O Office não vem incluso na formatação. A licença é a da página de Microsoft, somada ao serviço quando você quiser.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["assistencia", "notebook", "pc", "licenca", "upgrade", "ssd", "manutencao"],
  termosDoBlog: ["formatação", "formatar", "windows", "backup", "vírus", "notebook lento"],
  relacionadas: ["manutencao", "upgrade-ssd", "microsoft", "recuperacaodados"],
  final: {
    titulo: "Diga o modelo e se precisa de backup",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Preço e prazo confirmados pelo WhatsApp.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
