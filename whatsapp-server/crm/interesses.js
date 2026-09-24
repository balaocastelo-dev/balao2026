// Segmentação automática: descobre do que cada cliente fala.
//
// A loja já tem milhares de conversas guardadas. Sozinhas elas são só uma
// lista comprida; classificadas por assunto, viram base de remarketing. A
// classificação usa três sinais, todos que já existem:
//
//   1. as palavras da própria conversa;
//   2. o produto que o CRM já enviou para aquele cliente;
//   3. a categoria desse produto no catálogo.
//
// Tudo aqui é função pura (sem rede, sem banco) para dar para testar com
// frases de verdade. Sem IA de propósito: regra de palavra é previsível,
// explicável para o vendedor e não erra caro.

const INTERESSES = {
  pc_gamer: {
    nome: "PC Gamer",
    termos: [
      "pc gamer", "computador gamer", "setup gamer", "gamer", "rtx", "gtx", "rx 6", "rx 7",
      "placa de video", "placa de vídeo", "geforce", "radeon", "ryzen", "core i5", "core i7",
      "core i9", "fps", "jogar", "jogos", "game", "cs2", "valorant", "fortnite", "gabinete",
      "water cooler", "fonte 650", "fonte 750", "memoria ram ddr", "memória ram ddr",
    ],
    categorias: ["gamer", "placa de vídeo", "placa de video", "processador", "placa mãe", "placa mae", "memória", "memoria", "fonte", "gabinete", "cooler"],
  },
  notebook: {
    nome: "Notebook",
    termos: [
      "notebook", "note book", "laptop", "ultrabook", "macbook", "dell inspiron", "vaio",
      "lenovo ideapad", "acer aspire", "samsung book", "positivo motion", "tela do notebook",
      "bateria do notebook", "carregador de notebook", "dobradiça", "dobradica", "teclado do notebook",
    ],
    categorias: ["notebook", "notebooks", "laptop"],
  },
  assistencia: {
    nome: "Assistência Técnica",
    termos: [
      "conserto", "consertar", "arrumar", "orçamento de conserto", "orcamento de conserto",
      "nao liga", "não liga", "não está ligando", "nao esta ligando", "travando", "travou",
      "lento", "lentidao", "lentidão", "formatar", "formatação", "formatacao", "reinstalar windows",
      "virus", "vírus", "tela azul", "superaquecendo", "esquentando", "limpeza", "pasta termica",
      "pasta térmica", "manutencao", "manutenção", "defeito", "quebrou", "queimou", "assistencia",
      "assistência", "ordem de servico", "ordem de serviço", "os aberta", "meu pc", "meu note",
    ],
    categorias: ["serviço", "servico", "assistência", "assistencia"],
  },
  impressora: {
    nome: "Impressora e Suprimentos",
    termos: [
      "impressora", "multifuncional", "cartucho", "toner", "tinta", "bulk ink", "tanque de tinta",
      "epson l3", "hp deskjet", "hp smart tank", "brother dcp", "não imprime", "nao imprime",
      "imprimindo falhado", "cabeça de impressão", "cabeca de impressao", "papel atolado",
    ],
    categorias: ["impressora", "impressoras", "suprimentos", "cartucho", "toner"],
  },
  pecas_upgrade: {
    nome: "Peças e Upgrade",
    termos: [
      "upgrade", "melhorar meu pc", "trocar a placa", "ssd", "hd", "nvme", "m.2", "memoria ram",
      "memória ram", "ddr3", "ddr4", "ddr5", "fonte", "placa mae", "placa mãe", "processador",
      "cooler", "gabinete", "pente de memoria", "pente de memória",
    ],
    categorias: ["ssd", "hd", "armazenamento", "memória", "memoria", "hardware", "peças", "pecas"],
  },
  perifericos: {
    nome: "Periféricos e Monitor",
    termos: [
      "monitor", "teclado", "mouse", "headset", "fone", "webcam", "caixa de som", "mousepad",
      "cadeira gamer", "suporte de monitor", "hz", "polegadas",
    ],
    categorias: ["monitor", "monitores", "periférico", "periferico", "teclado", "mouse", "headset", "áudio", "audio"],
  },
  rede: {
    nome: "Rede e Internet",
    termos: [
      "roteador", "wifi", "wi-fi", "internet caindo", "repetidor", "cabo de rede", "switch",
      "mesh", "sinal fraco", "rede cabeada", "patch cord", "rj45",
    ],
    categorias: ["rede", "roteador", "cabo", "conectividade"],
  },
  celular: {
    nome: "Celular",
    termos: [
      "celular", "smartphone", "iphone", "android", "capinha", "pelicula", "película",
      "tela do celular", "bateria do celular", "carregador turbo", "fone bluetooth",
    ],
    categorias: ["celular", "smartphone", "acessórios para celular", "acessorios para celular"],
  },
  consignado: {
    nome: "Consignado / Usado",
    termos: [
      "consignado", "consignacao", "consignação", "usado", "seminovo", "semi novo", "de segunda",
      "vender meu", "trocar o meu", "quanto vale o meu",
    ],
    categorias: ["seminovo", "seminovos", "usado", "consignado"],
  },
  orcamento: {
    nome: "Pediu orçamento",
    termos: [
      "orçamento", "orcamento", "quanto custa", "qual o valor", "qual o preço", "qual o preco",
      "tem em estoque", "tem disponivel", "tem disponível", "faz por quanto", "melhor preço",
      "melhor preco", "parcela", "parcelado", "no pix", "desconto",
    ],
    categorias: [],
  },
};

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Os termos são comparados já sem acento, então guardamos a versão normalizada
// uma vez só, no carregamento do módulo.
const TABELA = Object.entries(INTERESSES).map(([chave, def]) => ({
  chave,
  nome: def.nome,
  termos: def.termos.map(normalizar),
  categorias: def.categorias.map(normalizar),
}));

/**
 * Pontos por interesse a partir de um texto solto (uma mensagem, ou várias
 * juntas). Cada termo encontrado vale 1 ponto, contado uma vez por termo.
 */
function analisarTexto(texto) {
  const t = normalizar(texto);
  if (!t || t.length < 3) return {};
  const pontos = {};
  for (const item of TABELA) {
    let n = 0;
    for (const termo of item.termos) if (t.includes(termo)) n++;
    if (n) pontos[item.chave] = n;
  }
  return pontos;
}

/**
 * Interesse correspondente à categoria de um produto do catálogo. Vale mais
 * que uma palavra solta: se a loja mandou um notebook para o cliente, ele está
 * olhando notebook.
 */
function analisarCategoria(categoria, peso = 3) {
  const c = normalizar(categoria);
  if (!c) return {};
  const pontos = {};
  for (const item of TABELA) {
    if (item.categorias.some((cat) => c.includes(cat) || cat.includes(c))) pontos[item.chave] = peso;
  }
  return pontos;
}

/** Nome do produto também carrega sinal ("Notebook Dell...", "Placa de vídeo..."). */
function analisarProduto(nome, categoria) {
  return somar(analisarTexto(nome), analisarCategoria(categoria));
}

function somar(...mapas) {
  const total = {};
  for (const m of mapas) for (const [k, v] of Object.entries(m || {})) total[k] = (total[k] || 0) + v;
  return total;
}

/** Lista ordenada, do interesse mais forte para o mais fraco. */
function ranking(pontos, minimo = 1) {
  return Object.entries(pontos || {})
    .filter(([, v]) => v >= minimo)
    .sort((a, b) => b[1] - a[1])
    .map(([chave, v]) => ({ chave, nome: INTERESSES[chave]?.nome || chave, pontos: v }));
}

function nomeDoInteresse(chave) {
  return INTERESSES[chave]?.nome || chave;
}

function listarInteresses() {
  return Object.entries(INTERESSES).map(([chave, d]) => ({ chave, nome: d.nome }));
}

module.exports = {
  INTERESSES,
  normalizar,
  analisarTexto,
  analisarCategoria,
  analisarProduto,
  somar,
  ranking,
  nomeDoInteresse,
  listarInteresses,
};
