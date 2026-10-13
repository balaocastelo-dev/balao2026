import type { PaginaDeCaptacao } from "../tipos";

// Licença não está no catálogo de produtos: a página vende pelo WhatsApp e
// pelo balcão. A única vitrine é de notebooks que já saem de fábrica com
// Windows 11 (para quem vai trocar de máquina), sem PC montado.
export const microsoft: PaginaDeCaptacao = {
  slug: "microsoft",
  nome: "Windows e Office originais",
  chamada: "Windows 11 Home ou Pro e Office originais, instalados e ativados na loja enquanto você espera.",
  seo: {
    titulo: "Windows 11 e Office originais em Campinas (Cambuí) | Balão da Informática",
    descricao:
      "Licença original de Windows 11 Home e Pro, Office e Microsoft 365 no Cambuí, em Campinas. Traga o computador e saia com tudo instalado e ativado. Peça no WhatsApp.",
    palavras: [
      "licença Windows 11 original Campinas",
      "comprar Windows 11 Pro Campinas",
      "Windows 11 Home ou Pro qual escolher",
      "Office original Campinas",
      "Microsoft 365 Family Campinas",
      "instalar Windows original no Cambuí",
      "ativar Windows 11 Campinas",
      "fim do suporte do Windows 10 o que fazer",
      "licença Windows para empresa Campinas",
      "Office vitalício ou Microsoft 365",
      "formatar e instalar Windows original Campinas",
    ],
    tipoDeServico: "Venda, instalação e ativação de licenças Microsoft",
  },
  hero: {
    contexto: "Licenças Microsoft no Cambuí, em Campinas",
    titulo: "Windows e Office originais, ativados e funcionando no seu computador",
    texto:
      "Windows 11 Home ou Pro, Office e Microsoft 365 com licença original. Traga o computador à loja do Cambuí e a equipe instala e ativa na hora; se preferir, leve só a licença. Antes, a gente confere se a sua máquina roda o Windows 11.",
    imagem: { src: "/images/landing/v2/microsoft.jpg", alt: "Mesa de escritório com monitor e notebook mostrando uma tela azul abstrata" },
    mensagem: "Olá! Vim pela página de licenças Microsoft da Balão e quero Windows/Office original.",
    botao: "Pedir licença no WhatsApp",
    secundario: { rotulo: "Home ou Pro?", href: "#secao-1" },
    fatos: [
      { valor: "Original", rotulo: "ativação que recebe todas as atualizações" },
      { valor: "Instala na hora", rotulo: "traga o computador à loja" },
      { valor: "Windows 10", rotulo: "sem suporte desde 14/10/2025" },
      { valor: "Empresa", rotulo: "licenças para vários computadores" },
    ],
  },
  assistente: {
    titulo: "Licença certa em três toques",
    texto: "Com isso a equipe responde qual licença serve e como fica a instalação.",
    abertura: "Olá! Vim pela página de licenças Microsoft e quero uma licença original.",
    fecho: "Posso mandar foto da tela de configurações do computador (Sistema > Sobre)?",
    botao: "Enviar para a loja",
    perguntas: [
      {
        rotulo: "Preciso de",
        pergunta: "O que você precisa?",
        varias: true,
        opcoes: ["Windows 11 Home", "Windows 11 Pro", "Office", "Microsoft 365", "Não sei, quero ajuda"],
      },
      {
        rotulo: "Computadores",
        pergunta: "Para quantos computadores?",
        opcoes: ["1", "2 a 5", "Mais de 5"],
      },
      {
        rotulo: "Instalação",
        pergunta: "Como prefere?",
        opcoes: ["Instalar e ativar na loja", "Só a licença", "Formatar e instalar do zero"],
      },
    ],
  },
  secoes: [
    {
      tipo: "comparativo",
      titulo: "Windows 11 Home ou Pro?",
      texto: "Os dois são o mesmo Windows no dia a dia. O Pro acrescenta recursos de gestão e segurança que fazem diferença em empresa.",
      colunas: ["Recurso", "Windows 11 Home", "Windows 11 Pro"],
      linhas: [
        ["Uso em casa, estudo e jogos", "Atende completo", "Atende completo"],
        ["Criptografia do disco com BitLocker", "Não tem (alguns aparelhos têm só a criptografia básica do dispositivo)", "Tem"],
        ["Acesso remoto ao computador (Área de Trabalho Remota)", "Só acessa outros computadores", "Pode ser acessado de fora"],
        ["Entrar em domínio da empresa e políticas de grupo", "Não tem", "Tem"],
        ["Máquinas virtuais (Hyper-V) e Área Restrita", "Não tem", "Tem"],
        ["Passar de Home para Pro depois", "Dá, com uma licença de upgrade, sem formatar", "—"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Licença original: por que a ativação importa",
      paragrafos: [
        "O Windows sem ativação, ou ativado com programa de terceiros, até liga e funciona por um tempo. O problema aparece depois: atualizações de segurança que não chegam ou quebram a ativação, recursos bloqueados, aviso na tela e, nos casos de ativador pirata, programa malicioso escondido dentro do próprio ativador. Em computador de empresa, ainda há o risco legal de usar software sem licença.",
        "Com a licença original, o Windows fica ligado à sua máquina ou à sua conta Microsoft, recebe todas as atualizações mensais de segurança e as atualizações de versão. Isso pesa ainda mais agora: a Microsoft encerrou o suporte do Windows 10 em 14 de outubro de 2025. Ele continua funcionando, mas deixou de receber as atualizações de segurança regulares, e quem usa o computador para banco, e-mail e trabalho fica mais exposto a cada mês.",
        "Antes de vender o Windows 11, a equipe confere se o seu computador cumpre os requisitos: processador compatível, TPM 2.0 e inicialização segura. Muitas máquinas de poucos anos atrás passam; as muito antigas não. Nesses casos você fica sabendo antes de gastar, junto com as opções de upgrade ou de notebook novo.",
      ],
      lista: [
        "Desconfie de chave muito barata vendida solta na internet: pode ser bloqueada depois",
        "Licença original passa a acompanhar a máquina ou a sua conta Microsoft",
        "Na troca de Windows 10 para 11, os arquivos podem ser mantidos; quando precisa formatar, a loja faz backup antes",
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Office vitalício ou Microsoft 365?",
      texto: "Os dois trazem Word, Excel e PowerPoint. O que muda é a forma de pagar e o que vem junto.",
      colunas: ["", "Office vitalício (compra única)", "Microsoft 365 (assinatura)"],
      linhas: [
        ["Como paga", "Uma vez só", "Por ano ou por mês, enquanto usar"],
        ["Em quantos computadores", "Um computador", "Vários aparelhos; o plano Family atende até seis pessoas"],
        ["Atualização de versão", "Fica na versão comprada, com correções de segurança", "Sempre na versão mais nova"],
        ["Armazenamento em nuvem", "Não inclui", "Inclui espaço no OneDrive para cada pessoa"],
        ["Para quem compensa", "Quem usa o básico num computador só, por anos", "Família, quem usa em vários aparelhos ou precisa da nuvem"],
      ],
    },
    {
      tipo: "passos",
      titulo: "Como funciona na loja",
      texto: "Você sai com o computador ativado e conferido, sem precisar mexer em nada.",
      itens: [
        { titulo: "Conte o que precisa", texto: "Pelo assistente acima ou no WhatsApp: qual licença, para quantos computadores e se quer instalação." },
        { titulo: "Confira a máquina", texto: "Mande foto de Configurações > Sistema > Sobre, ou traga o computador. A equipe confirma se ele roda o Windows 11." },
        { titulo: "Instalação e ativação", texto: "Na loja do Cambuí, a equipe instala e ativa com você esperando, ou formata com backup se for o caso." },
        { titulo: "Saia funcionando", texto: "Windows ativado, atualizações em dia e Office abrindo. Serviço com garantia legal de 90 dias." },
      ],
    },
    {
      tipo: "regras",
      titulo: "Para empresas",
      texto: "Escritório com computadores sem licença ou ainda no Windows 10 é o caso mais comum que chega.",
      itens: [
        {
          titulo: "Regularize de uma vez",
          texto: "Mande quantos computadores são, qual Windows e Office cada um tem hoje e o que a equipe usa. A loja indica a combinação de licenças e combina a instalação.",
          pontos: ["Windows 11 Pro para quem precisa de acesso remoto e BitLocker", "Microsoft 365 para quem trabalha com e-mail e arquivos compartilhados"],
        },
        {
          titulo: "Instalação na loja ou retirada",
          texto: "Os computadores podem ser trazidos ao Cambuí ou retirados em Campinas e região, combinando pelo WhatsApp. Computador que não roda o Windows 11 pode ganhar upgrade na bancada.",
          pontos: ["Pagamento com 10% de desconto no Pix ou parcelado no cartão", "Assistência técnica no mesmo endereço"],
        },
      ],
    },
    {
      tipo: "vitrine",
      titulo: "Vai trocar de computador? Notebooks que já saem com Windows 11",
      texto: "Estes modelos vêm de fábrica com o Windows 11 ativado. Os que saem com Linux ou KeepOS recebem a licença original na loja, se você quiser.",
      regras: [
        {
          id: "notebooks-windows",
          titulo: "Notebooks com Windows 11 de fábrica",
          subtitulo: "Ativação original do fabricante, pronta para usar",
          categorias: ["Computadores/Notebooks"],
          nomeComeca: ["notebook"],
          nomeContem: ["windows 11", "win 11", "win11", "w11", "win 11h", "w11h", "windows 11 home", "windows 11 pro"],
          porMarca: 3,
          ordem: "menor",
          limite: 12,
          verTodos: { rotulo: "Ver todos os notebooks", href: "/notebooks" },
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Qual a diferença entre Windows 11 Home e Pro?",
      resposta:
        "No dia a dia são iguais. O Pro acrescenta BitLocker para criptografar o disco, acesso remoto ao computador, entrada em domínio de empresa, políticas de grupo e máquinas virtuais. Para casa e estudo o Home basta; para empresa, o Pro costuma ser o certo.",
    },
    {
      pergunta: "Ainda dá para usar o Windows 10?",
      resposta:
        "Ele continua ligando, mas a Microsoft encerrou o suporte em 14 de outubro de 2025 e as atualizações de segurança regulares acabaram. Para computador usado em banco, e-mail ou trabalho, o recomendado é passar para o Windows 11, se a máquina for compatível.",
    },
    {
      pergunta: "Meu computador roda o Windows 11?",
      resposta:
        "Depende do processador, do TPM 2.0 e da inicialização segura. Mande foto da tela Configurações > Sistema > Sobre no WhatsApp, ou traga o computador, e a equipe confere antes de você comprar a licença.",
    },
    {
      pergunta: "Office vitalício ou Microsoft 365: qual comprar?",
      resposta:
        "O vitalício é pago uma vez e vale para um computador, na versão comprada. O Microsoft 365 é assinatura, funciona em vários aparelhos, inclui espaço no OneDrive e está sempre atualizado. Para uma pessoa que só usa Word e Excel num computador, o vitalício costuma compensar.",
    },
    {
      pergunta: "Vocês instalam e ativam o Windows na loja?",
      resposta:
        "Sim. Traga o computador à loja do Cambuí e a equipe instala e ativa a licença com você esperando, ou formata com backup quando for o caso. O serviço tem a garantia legal de 90 dias.",
    },
    {
      pergunta: "Dá para passar do Windows 11 Home para o Pro sem formatar?",
      resposta:
        "Dá. Com uma licença de upgrade para o Pro, o Windows muda de edição mantendo arquivos e programas. A equipe faz a troca na loja ou orienta pelo WhatsApp.",
    },
    {
      pergunta: "Qual o problema de ativar o Windows com programa da internet?",
      resposta:
        "Ativador pirata pode trazer vírus escondido, perder a ativação numa atualização e deixar a empresa exposta por usar software sem licença. Com a licença original, o Windows recebe todas as atualizações sem risco de bloqueio.",
    },
  ],
  temas: ["licenca", "empresa", "notebook", "pc", "assistencia", "compra"],
  termosDoBlog: ["windows", "windows 11", "windows 10", "office", "microsoft", "licença"],
  relacionadas: ["notebooks", "manutencao", "sistemas", "tonner"],
  final: {
    titulo: "Peça a licença e saia com o computador ativado",
    texto: "Diga qual licença precisa e para quantos computadores. A equipe confere a sua máquina e instala e ativa na loja da Av. Anchieta, no Cambuí.",
    botao: "Pedir licença original",
  },
};
