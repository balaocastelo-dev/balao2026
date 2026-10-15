/**
 * Textos e listas da página do Overclock. Ficam aqui para a página continuar
 * legível e para o JSON-LD (perguntas frequentes) ler o mesmo texto da tela.
 */

export const DORES = [
  {
    titulo: "Anúncio caro",
    texto: "Parou de pagar o Google, o telefone parou de tocar. Todo mês a mesma conta.",
  },
  {
    titulo: "Site parado",
    texto: "Preço desatualizado, produto que já acabou, ninguém acha a loja na busca.",
  },
  {
    titulo: "WhatsApp bagunçado",
    texto: "Um celular para cinco vendedores. Cliente esperando, conversa perdida.",
  },
  {
    titulo: "Assistência no papel",
    texto: "Ficha some, cliente liga para saber do conserto, garantia sem registro.",
  },
] as const;

/** Os 15 passos da tela /instalar, na ordem em que aparecem. */
export const PASSOS_INSTALACAO = [
  { titulo: "Código de instalação", texto: "Você recebe o código e abre a tela de instalação." },
  { titulo: "Chave de IA grátis", texto: "Gemini ou Groq. Com ela, o assistente passa a ajudar em cada passo." },
  { titulo: "CNPJ", texto: "Digite o CNPJ e a razão social e o endereço se preenchem sozinhos." },
  { titulo: "Logo e cores", texto: "Envie a logo. A IA tira as cores da sua marca e mostra a prévia na hora." },
  { titulo: "Contato e horário", texto: "Telefone, WhatsApp, e-mail e horário de atendimento." },
  { titulo: "Redes sociais", texto: "Instagram, Facebook e o que mais a loja usar." },
  { titulo: "Região e bairros", texto: "Onde você atende. A IA sugere os bairros para aparecer no Google." },
  { titulo: "Vendas", texto: "PIX, desconto, parcelas e entrega." },
  { titulo: "Equipe e senhas", texto: "Quem acessa o quê. As senhas são guardadas com segurança (hash)." },
  { titulo: "Conta da Vercel", texto: "Onde o site vai ficar no ar, no nome da sua loja." },
  { titulo: "Domínio", texto: "O endereço da loja. O sistema confere se o DNS está certo." },
  { titulo: "E-mail", texto: "Envio de e-mails da loja pelo Resend." },
  { titulo: "WhatsApp", texto: "Na sua VPS com um comando, ou pela API oficial da Meta." },
  { titulo: "Módulos e catálogo", texto: "Liga o que vai usar e escolhe de onde vêm os produtos." },
  { titulo: "Google grátis e publicar", texto: "Search Console, Perfil da Empresa, Merchant Center e Analytics. Revisa tudo e publica." },
] as const;

export type AreaFuncionalidade = {
  id: string;
  titulo: string;
  resumo: string;
  itens: string[];
  beta?: boolean;
};

export const AREAS: AreaFuncionalidade[] = [
  {
    id: "loja",
    titulo: "Loja virtual completa",
    resumo: "Tudo o que o cliente precisa para escolher e comprar.",
    itens: [
      "Catálogo com categorias, filtros e busca",
      "Página de produto com ficha técnica",
      "Carrinho, PIX com desconto, parcelamento e cupons",
      "Vitrine de ofertas e queda de preço (de/por)",
      "Seminovos e consignação",
      "Páginas de serviço: assistência, montagem de PC gamer, recuperação de dados, reparo Apple",
      "Configurador de PC",
    ],
  },
  {
    id: "seo",
    titulo: "Google sem pagar anúncio",
    resumo: "Feito para a loja aparecer na busca de graça.",
    itens: [
      "Páginas para cada cidade e bairro que você atende",
      "Dados estruturados para o Google entender loja, produtos e artigos",
      "Mapa do site e prévia bonita ao compartilhar o link",
      "Blog com regras de qualidade e artigos escritos com IA",
      "Arquivo llms.txt, que apresenta a loja para as ferramentas de IA",
    ],
  },
  {
    id: "marketing",
    titulo: "Marketing com IA",
    resumo: "O mês de conteúdo planejado, e você só aprova.",
    itens: [
      "Calendário do mês gerado pela IA: feed, stories, roteiros de reels e artigos",
      "Posts para o Perfil da Empresa no Google",
      "Aprovação pelo painel ou pelo Telegram",
      "Publicação automática no Facebook e no Instagram",
    ],
  },
  {
    id: "whatsapp",
    titulo: "CRM de WhatsApp",
    resumo: "Um número da loja, toda a equipe atendendo.",
    itens: [
      "Um QR Code e login para cada vendedor",
      "Caixa compartilhada e kanban de cada um",
      "Etiquetas, respostas rápidas e assinatura automática",
      "Campanhas com SAIR e limites de envio",
      "Áudio vira texto, e um assistente de IA ajuda no atendimento",
    ],
  },
  {
    id: "ura",
    titulo: "URA ativa",
    resumo: "Ligações automáticas para a sua lista de clientes.",
    beta: true,
    itens: [
      "Ligação por SIP com menu: 1 fala com atendente, 2 recebe WhatsApp, 9 não liga mais",
      "Respeita horário e consentimento",
    ],
  },
  {
    id: "gestao",
    titulo: "Gestão e assistência técnica",
    resumo: "O balcão e a bancada no mesmo sistema da loja.",
    itens: [
      "Orçamento com link para o cliente aprovar",
      "Ordem de serviço com fotos na entrada, diagnóstico, aprovação online, peças e garantia",
      "Termo impresso e página para o cliente acompanhar o conserto",
      "Estoque com número de série, compras, contas a pagar e a receber",
      "Caixa e comissão de vendedor",
    ],
  },
  {
    id: "balcao",
    titulo: "Balcão e equipe",
    resumo: "Para o dia a dia de quem está na loja.",
    itens: [
      "PDV (caixa) de balcão",
      "Fechamento da assistência e controle de peças",
      "Entregas com integração 99",
      "Arena de vendas: a equipe competindo no telão",
    ],
  },
  {
    id: "painel",
    titulo: "Painel e segurança",
    resumo: "Uma entrada só, cada pessoa com o seu acesso.",
    itens: [
      "Painel único com senha e indicadores",
      "Acesso separado para cada pessoa da equipe",
      "Chaves e segredos só no servidor, nunca no navegador",
      "Senhas com hash, banco fechado ao público e avisos (webhooks) assinados",
    ],
  },
];

export const TECNOLOGIAS = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Postgres (Supabase)",
  "Vercel",
  "Node.js",
  "Express",
  "Socket.IO",
  "Evolution API",
  "Baileys",
  "WhatsApp Cloud API",
  "Docker",
  "Caddy (HTTPS automático)",
  "Asterisk",
  "Google Gemini",
  "Groq (Llama e Whisper)",
  "Resend",
  "Meta Graph API",
  "Google Perfil da Empresa",
  "Bling API v3",
  "BrasilAPI",
  "Python",
  "Playwright",
  "Vitest",
];

export const NUMEROS_PROJETO = [
  { valor: "171 mil", rotulo: "linhas de código" },
  { valor: "103", rotulo: "páginas" },
  { valor: "178", rotulo: "rotas de API" },
  { valor: "+1.000", rotulo: "testes automáticos, em 136 arquivos" },
  { valor: "4", rotulo: "aplicações: loja, WhatsApp, URA e assistente de instalação" },
  { valor: "5", rotulo: "bancos de módulos" },
];

/**
 * Média salarial de desenvolvedor pleno no Brasil, segundo o Indeed
 * (br.indeed.com/career/desenvolvedor-pleno/salaries, atualizado em
 * 4/out/2026, cerca de mil salários informados). Consultado em 15/out/2026.
 */
export const SALARIO_DEV_PLENO = 6207;
export const FONTE_SALARIO = {
  nome: "Indeed",
  url: "https://br.indeed.com/career/desenvolvedor-pleno/salaries",
  data: "out/2026",
};
/** 3 devs × 9 meses e 4 devs × 12 meses, só salário. */
export const CUSTO_EQUIPE_MIN = 3 * 9 * SALARIO_DEV_PLENO; // 167.589
export const CUSTO_EQUIPE_MAX = 4 * 12 * SALARIO_DEV_PLENO; // 297.936

export const CONTAS_DA_LOJA = [
  { conta: "GitHub", guarda: "o código" },
  { conta: "Vercel", guarda: "o site, a loja e o painel" },
  { conta: "Supabase", guarda: "o banco de dados" },
  { conta: "Hostinger (VPS)", guarda: "o WhatsApp e a URA, se usar" },
  { conta: "Google e Groq", guarda: "as chaves de IA" },
];

/**
 * Custo de manter, pago direto aos fornecedores. Valores conferidos nas
 * páginas oficiais em 15/out/2026.
 */
export type CustoInfra = {
  servico: string;
  paraQue: string;
  preco: string;
  obs?: string;
  opcional?: boolean;
};

export const CUSTOS_INFRA: CustoInfra[] = [
  {
    servico: "Vercel Pro",
    paraQue: "Deixa o site e o painel no ar",
    preco: "US$ 20 por mês",
    obs: "Por pessoa que mexe no projeto. O plano grátis (Hobby) é só para uso pessoal, não para loja.",
  },
  {
    servico: "Supabase",
    paraQue: "Banco de dados",
    preco: "Grátis para começar",
    obs: "No grátis: até 500 MB e o projeto pausa depois de 1 semana sem uso. Plano Pro a partir de US$ 25 por mês.",
  },
  {
    servico: "Domínio .com.br",
    paraQue: "O endereço da loja, no Registro.br",
    preco: "R$ 40 por ano",
  },
  {
    servico: "Google Gemini",
    paraQue: "A IA do sistema",
    preco: "Tem camada gratuita",
    obs: "Modelos Flash e Flash-Lite sem custo, dentro dos limites do Google.",
  },
  {
    servico: "Groq",
    paraQue: "IA e áudio do WhatsApp virando texto",
    preco: "Tem plano gratuito",
    obs: "Com limites de uso.",
  },
  {
    servico: "Resend",
    paraQue: "E-mails da loja",
    preco: "Grátis até 3.000 e-mails por mês",
    obs: "Limite de 100 por dia. Plano Pro: US$ 20 por mês.",
  },
  {
    servico: "Hostinger VPS KVM 1",
    paraQue: "WhatsApp e URA",
    preco: "A partir de R$ 29,99 por mês",
    obs: "1 vCPU e 4 GB. Preço promocional, pago de uma vez pelo período; renova por R$ 59,99 por mês.",
    opcional: true,
  },
  {
    servico: "Hostinger VPS KVM 2",
    paraQue: "WhatsApp e URA com mais folga",
    preco: "A partir de R$ 43,99 por mês",
    obs: "2 vCPU e 8 GB. Preço promocional, pago de uma vez pelo período; renova por R$ 77,99 por mês.",
    opcional: true,
  },
  {
    servico: "WhatsApp API oficial (Meta)",
    paraQue: "Alternativa à VPS para o WhatsApp",
    preco: "Consulte o preço atual",
    obs: "A Meta cobra por mensagem, conforme o tipo.",
    opcional: true,
  },
];

export const PERGUNTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Preciso saber programar?",
    resposta:
      "Não. A instalação é feita por telas, em português, com a IA explicando cada passo. E a gente faz a instalação junto com você.",
  },
  {
    pergunta: "Quanto tempo leva para instalar?",
    resposta:
      "Com as contas criadas, dá para fazer numa tarde. O domínio e as confirmações do Google podem levar alguns dias para valer, porque dependem deles, não da gente.",
  },
  {
    pergunta: "Posso trocar de fornecedor?",
    resposta:
      "Pode. A KaBuM já vem ligada, mas os produtos também entram por planilha Excel ou CSV, pelo Bling ou por fornecedor na Kyte. Você liga e desliga o que quiser.",
  },
  {
    pergunta: "E se eu já tenho site?",
    resposta:
      "Seu domínio continua seu. Na instalação, você aponta o endereço para o Overclock, e os produtos que já tem podem entrar por planilha.",
  },
  {
    pergunta: "O WhatsApp pode ser bloqueado?",
    resposta:
      "Depende da forma que você escolher. Pela VPS, o WhatsApp funciona lendo um QR Code, como o WhatsApp Web. Essa forma não é oficial: o WhatsApp pode bloquear números que mandam muita mensagem ou recebem denúncias. Por isso as campanhas têm limite, intervalo e opção de SAIR, mas o risco existe. Pela API oficial da Meta, o uso é autorizado e segue as regras da Meta, só que cada mensagem é cobrada e as mensagens de campanha precisam de modelo aprovado.",
  },
  {
    pergunta: "Meus dados ficam com quem?",
    resposta:
      "Com a sua loja. O banco fica no seu Supabase, os arquivos na sua Vercel e o código no seu GitHub. A gente só entra se você convidar, por exemplo para o suporte.",
  },
  {
    pergunta: "Tem mensalidade?",
    resposta:
      "Para nós, não. Você paga só a infraestrutura, direto para cada fornecedor, como mostra a tabela de custos desta página.",
  },
  {
    pergunta: "O que acontece depois dos 12 meses?",
    resposta:
      "O sistema continua seu e funcionando. Depois desse prazo, você deixa de receber as atualizações novas. Se quiser continuar recebendo, fale com a gente.",
  },
  {
    pergunta: "Posso usar em mais de uma loja?",
    resposta:
      "A licença vale para uma loja, um CNPJ, e não permite revenda. Tem outra loja? Fale com a gente.",
  },
];
