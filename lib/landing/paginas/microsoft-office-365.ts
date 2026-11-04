import type { PaginaDeCaptacao } from "../tipos";

// Office 2024 e Microsoft 365. Sem preço (nem preço de tabela de terceiros),
// sem CSP, sem "parceiro", sem certificação. Office 2021: suporte encerrado
// em 13/10/2026, dado público. "Vitalício" só para explicar que não existe.

const MENSAGEM =
  "Olá! Quero Office/Microsoft 365 para (  ) uso pessoal (  ) empresa com __ usuários. Qual vocês recomendam e instalam?";

export const microsoftOffice365: PaginaDeCaptacao = {
  slug: "microsoft/office-365",
  nome: "Office e Microsoft 365",
  chamada: "Office 2024 ou Microsoft 365, escolhido pelo perfil, com nota fiscal de venda e instalação no Cambuí.",
  seo: {
    titulo: "Office 2024 ou Microsoft 365? Qual Comprar em 2026 | Balão da Informática Anchieta",
    descricao:
      "Compra única ou assinatura? Office para você ou sua empresa, com licença original, nota fiscal de venda e instalação no Cambuí. 12x sem juros.",
    palavras: [
      "office 2024 ou microsoft 365",
      "comprar office original",
      "microsoft 365 para empresa campinas",
      "office vitalício é original",
      "office 2021 fim do suporte",
      "instalar office campinas",
      "microsoft 365 business campinas",
      "office com nota fiscal campinas",
    ],
    tipoDeServico: "Venda e instalação de Office e Microsoft 365",
    catalogo: ["Office 2024", "Microsoft 365 Personal", "Microsoft 365 Família", "Microsoft 365 Business", "Instalação do Office", "E-mail no domínio"],
  },
  hero: {
    contexto: "Office e Microsoft 365 no Cambuí, em Campinas",
    titulo: "Office 2024 ou Microsoft 365, conforme o seu uso",
    texto:
      "Compra única ou assinatura, para casa ou para empresa. A Balão da Informática Anchieta é especialista em licenciamento de Microsoft Office e trabalha com licenças originais adquiridas de fornecedores oficiais Microsoft. A venda sai com nota fiscal de venda. A equipe instala. No cartão, 12x sem juros para pessoa física e para CNPJ. O plano certo e o valor saem no orçamento pelo WhatsApp.",
    imagem: { src: "/images/landing/v3/microsoft-office-365/notebooks.webp", alt: "Pessoa trabalhando em planilha no notebook em mesa de escritório clara" },
    mensagem: MENSAGEM,
    botao: "Pedir a indicação no WhatsApp",
    secundario: { rotulo: "Ver por perfil", href: "#secao-1" },
    fatos: [
      { valor: "2024 ou 365", rotulo: "compra única ou assinatura, conforme o uso" },
      { valor: "Nota de venda", rotulo: "a venda sai com nota fiscal de venda" },
      { valor: "12x sem juros", rotulo: "no cartão, também para CNPJ" },
      { valor: "Instala", rotulo: "ativação e instalação pela equipe da loja" },
    ],
  },
  assistente: {
    titulo: "Pessoal, família ou empresa",
    texto: "Três respostas e a equipe indica o caminho, sem você decorar nome de plano.",
    abertura: MENSAGEM,
    botao: "Enviar para a loja",
    perguntas: [
      { rotulo: "Uso", pergunta: "Para quem é?", opcoes: ["Uso pessoal", "Família", "Empresa"] },
      { rotulo: "Usuários", pergunta: "Quantas pessoas vão usar?", opcoes: ["1", "2 a 6", "Mais de 6"] },
      { rotulo: "E-mail", pergunta: "Precisa de e-mail no domínio da empresa?", opcoes: ["Sim", "Não", "Não sei"] },
    ],
  },
  secoes: [
    {
      tipo: "regras",
      titulo: "Resposta rápida por perfil",
      texto: "Um ponto de partida. O plano exato, e o valor, saem no orçamento pelo WhatsApp, porque a edição certa depende do que você já tem.",
      itens: [
        {
          titulo: "Autônomo, um computador",
          texto: "Se o uso é Word, Excel e PowerPoint num PC só, com pouco arquivo na nuvem, o Office 2024 de compra única costuma bastar. Você paga uma vez e fica nessa versão.",
        },
        {
          titulo: "Família",
          texto: "Várias pessoas, cada uma com os próprios aparelhos, pedem assinatura familiar, não uma cópia única instalada no computador da sala. Esse plano é de uso doméstico.",
        },
        {
          titulo: "Escritório pequeno",
          texto: "Cinco pessoas que compartilham e-mail no domínio e fazem reunião pedem plano empresarial, em geral com os aplicativos no computador, e-mail e Teams. Plano de casa não cobre a empresa.",
        },
        {
          titulo: "Empresa com dezenas de pessoas",
          texto: "O mesmo raciocínio, com mais usuários. Se a empresa também precisa de gestão dos aparelhos e de mais proteção, o plano mais completo entra na conversa. A quantidade fecha no orçamento.",
        },
      ],
    },
    {
      tipo: "comparativo",
      titulo: "Compra única (Office 2024) ou assinatura (Microsoft 365)",
      texto: "Os dois trazem Word, Excel e PowerPoint. O que muda é se você paga uma vez e para na versão, ou se acompanha as atualizações e a nuvem.",
      colunas: ["", "Office 2024 (compra única)", "Microsoft 365 (assinatura)"],
      linhas: [
        ["Pagamento", "Uma vez", "Enquanto a assinatura estiver ativa"],
        ["Versão", "Fica na versão comprada, com correções desse ciclo", "Aplicativos atualizados"],
        ["Nuvem e aparelhos", "Em geral um computador, sem nuvem inclusa", "Mais de um aparelho e espaço no OneDrive, conforme o plano"],
        ["Empresa", "Existe edição para uso comercial, num computador", "Planos com e-mail no domínio e Teams"],
        ["Em três anos", "Um pagamento só, sem versão nova", "Várias parcelas e o que o plano inclui nesse período"],
      ],
    },
    {
      tipo: "texto",
      titulo: "Em três anos, qual pesa menos",
      paragrafos: [
        "A conta de três anos é o jeito certo de comparar, e ela não cabe numa tabela sem o seu número de pessoas. A compra única é um pagamento. A assinatura soma o período e, no plano empresarial, traz e-mail, armazenamento e aplicativos novos. Para uma pessoa que só edita documento offline, a compra única tende a bastar. Para um escritório em que todo mundo precisa do mesmo e-mail e da mesma versão, a assinatura deixa de ser “mais cara” e passa a ser o produto que inclui o que a empresa já pagaria separado.",
        "Esta página não publica o valor de nenhum dos dois, nem repete preço de tabela de terceiros como se fosse o da loja. A Balão da Informática Anchieta faz a conta no orçamento pelo WhatsApp (19) 98751-0267, com a edição indicada, a nota fiscal de venda e o parcelamento em 12x sem juros no cartão, para pessoa física e para CNPJ.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Office sem prazo de assinatura existe?",
      paragrafos: [
        "O Microsoft 365 é vendido como assinatura. Oferta que promete a assinatura para sempre, entregue como login de uma conta que outra pessoa criou, não é um produto estável: a conta pode ser desligada, e os arquivos que estavam só nela somem junto. A Balão da Informática Anchieta não vende esse tipo de acesso.",
        "O que existe de pagamento único é o Office 2024, que fica na versão comprada. Não recebe as versões seguintes nem, por si, o e-mail e a nuvem da assinatura. Chamar isso de assinatura eterna mistura os dois produtos. Se alguém te ofereceu “365 para sempre”, peça a modalidade por escrito. Na loja, o que se vende são licenças originais adquiridas de fornecedores oficiais Microsoft, com nota fiscal de venda.",
      ],
    },
    {
      tipo: "dados",
      titulo: "Planos de empresa, em uma frase cada",
      texto:
        "Os nomes mudam pouco e a diferença é o que entra. O plano que a loja indica, e o valor, dependem de quantas pessoas e se o e-mail no domínio faz parte. Nada disso tem preço nesta página.",
      linhas: [
        ["Business Basic", "Aplicativos no navegador e no celular, e-mail e Teams. Sem os programas instalados no computador."],
        ["Business Standard", "O Basic mais Word, Excel, PowerPoint e Outlook instalados. É o meio do caminho da maioria dos escritórios."],
        ["Business Premium", "O Standard mais recursos de segurança e de gestão dos aparelhos, para quem precisa disso."],
        ["Uso em casa", "Planos Personal e Família, e o Office de uso doméstico, não cobrem o trabalho comercial da empresa."],
      ],
    },
    {
      tipo: "texto",
      titulo: "O Office 2021 parou de receber suporte",
      paragrafos: [
        "O suporte do Office 2021 encerrou em 13 de outubro de 2026. Os programas podem continuar abrindo. O que acaba é a correção de segurança e o suporte a falhas novas. Computador de trabalho que ainda está nessa versão fica mais exposto a cada mês, no mesmo sentido em que o Windows 10 ficou depois do fim do suporte dele.",
        "A saída é o Office 2024, se a compra única ainda atende, ou o Microsoft 365, se a empresa quer e-mail, nuvem e versão nova. A Balão da Informática Anchieta instala a opção escolhida. Traga o computador ao Cambuí ou combine o atendimento no orçamento. Não há prazo fechado nesta página: ele depende da agenda e de quantas máquinas entram.",
      ],
    },
    {
      tipo: "texto",
      titulo: "Instalação, e-mail no domínio e mudança de caixas",
      paragrafos: [
        "Comprar o plano e não conseguir abrir o Outlook no domínio é onde muita empresa trava. A ativação e a instalação são feitas pela equipe da loja. Para quem precisa de e-mail no próprio domínio, a configuração entra na conversa: quantas caixas, de onde elas estão hoje e se a mudança é de um provedor antigo para o plano novo.",
        "O tamanho desse trabalho não é um pacote único. Uma caixa pessoal e trinta caixas de um escritório não levam o mesmo tempo nem o mesmo cuidado com o que não pode se perder. Por isso o escopo vai no orçamento, por escrito, antes de começar. A licença, separada, sai com nota fiscal de venda.",
        "Plano de casa no computador da empresa não é um atalho. Microsoft 365 Personal, Família e as edições domésticas do Office são para uso pessoal. A empresa usa edição comercial: Office 2024 na linha de negócios, ou Microsoft 365 Business. A loja recusa indicar o plano doméstico para CNPJ.",
      ],
    },
    {
      tipo: "retorno",
      titulo: "Pedir retorno rápido",
      texto: "Pessoa física ou empresa, quantas pessoas e se o e-mail é no domínio. A indicação volta no WhatsApp.",
      assunto: "Office e Microsoft 365",
      campos: [
        { nome: "perfil", rotulo: "Pessoa física ou empresa?", opcoes: ["Pessoa física", "Empresa"] },
        { nome: "usuarios", rotulo: "Número de usuários" },
        { nome: "email", rotulo: "E-mail no domínio?", opcoes: ["Sim", "Não", "Não sei"] },
      ],
    },
    {
      tipo: "atalhos",
      titulo: "Junto com o Office",
      itens: [
        {
          titulo: "Hub de licenças",
          texto: "Windows, servidor e Office num levantamento só.",
          href: "/microsoft",
          imagem: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office",
        },
        {
          titulo: "Licença Windows",
          texto: "O computador também precisa do sistema original.",
          href: "/microsoft/windows",
          imagem: "/images/landing/v3/microsoft/microsoft.webp", alt: "Escritório claro com notebook e monitor prontos para uso com Windows e Office",
        },
        {
          titulo: "Notebooks",
          texto: "Máquina nova, e o Office instalado na entrega se você pedir.",
          href: "/notebooks",
          imagem: "/images/landing/v3/microsoft-office-365/notebooks.webp", alt: "Pessoa trabalhando em planilha no notebook em mesa de escritório clara",
        },
        {
          titulo: "Escritório e home office",
          texto: "Cadeira, monitor e o que completa a mesa.",
          href: "/categoria/escritorio-home-office",
          imagem: "/images/landing/v3/microsoft-office-365/notebooks.webp", alt: "Pessoa trabalhando em planilha no notebook em mesa de escritório clara",
        },
      ],
    },
  ],
  perguntas: [
    {
      pergunta: "Office 2024 ou Microsoft 365: qual comprar?",
      resposta:
        "O Office 2024 é compra única para um PC, sem novas versões nem nuvem; o Microsoft 365 é assinatura com aplicativos sempre atualizados, armazenamento OneDrive e, nos planos empresariais, e-mail e Teams. Para quem usa pouco e offline, o 2024 basta; para equipes, o 365.",
    },
    {
      pergunta: "Office 365 vitalício existe?",
      resposta:
        "Não. A Microsoft vende o Microsoft 365 só como assinatura; ofertas vitalícias costumam ser contas criadas por terceiros, que podem ser desativadas a qualquer momento.",
    },
    {
      pergunta: "Onde comprar Microsoft 365 para empresa em Campinas?",
      resposta:
        "A Balão da Informática Anchieta, no Cambuí, vende Office e Microsoft 365 originais com nota fiscal de venda e faz a instalação; orçamento pelo WhatsApp (19) 98751-0267.",
    },
    {
      pergunta: "Posso usar o plano de casa na empresa?",
      resposta:
        "Não. Planos domésticos são para uso pessoal. Empresa usa edição comercial do Office 2024 ou Microsoft 365 Business. A loja indica o plano empresarial quando o comprador é CNPJ.",
    },
    {
      pergunta: "O Office 2021 ainda recebe correção?",
      resposta:
        "Não. O suporte do Office 2021 encerrou em 13 de outubro de 2026. Os programas podem abrir, mas sem correção de segurança nova. A saída é o Office 2024 ou o Microsoft 365, com instalação pela loja.",
    },
    {
      pergunta: "Parcela para CNPJ e sai nota?",
      resposta:
        "Sim. 12x sem juros no cartão para pessoa física e para CNPJ, com nota fiscal de venda. São licenças originais adquiridas de fornecedores oficiais Microsoft. O valor sai no orçamento pelo WhatsApp.",
    },
  ],
  tituloDasPerguntas: "Perguntas frequentes",
  temas: ["licenca", "empresa", "office", "notebook"],
  termosDoBlog: ["office", "microsoft 365", "excel", "outlook", "notebook"],
  relacionadas: ["microsoft", "microsoft/windows", "notebooks", "sistemas"],
  final: {
    titulo: "Diga se é para casa ou para a empresa, e quantas pessoas",
    texto: "Av. Anchieta, 789, Cambuí. Segunda a sexta, 9h às 18h. Sábado, 9h às 13h. Licença original, nota fiscal de venda, instalação e 12x sem juros também para CNPJ.",
    botao: "Chamar no WhatsApp",
    mensagem: MENSAGEM,
  },
};
