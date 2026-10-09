/**
 * O modelo de um artigo do blog.
 *
 * Um artigo NÃO é um HTML solto: é uma lista de blocos tipados. É isso que
 * deixa a página montar sozinha o sumário, o tempo de leitura, os dados
 * estruturados (JSON-LD) e os componentes ricos — gráfico de benchmark, tabela
 * comparativa, prós e contras, citação, chamada contextual — sem ninguém
 * escrever marcação à mão, e sem `dangerouslySetInnerHTML` em lugar nenhum.
 *
 * Texto corrido aceita uma marcação mínima, a mesma em todos os blocos:
 *   **negrito**   *itálico*   [texto do link](/caminho-ou-https://...)
 */

export type CategoriaSlug = "guias" | "hardware" | "analises" | "noticias" | "assistencia";

/** Texto com a marcação mínima descrita acima. */
export type TextoRico = string;

/** De onde saiu um número, uma tabela ou uma frase citada. */
export type Fonte = {
  nome: string;
  url: string;
  /** Mês/ano ou data da publicação consultada, do jeito que aparece para o leitor. */
  data?: string;
};

export type Imagem = {
  src: string;
  alt: string;
  largura?: number;
  altura?: number;
  /**
   * A imagem já foi desenhada nas cores do blog, com o assunto na parte de
   * cima. Não recebe o filtro das fotos e, quando cortada, mantém o topo.
   */
  pronta?: boolean;
};

export type BlocoParagrafo = { tipo: "paragrafo"; texto: TextoRico };

export type BlocoTitulo = {
  tipo: "titulo";
  nivel: 2 | 3;
  texto: string;
  /** Âncora do sumário. Se faltar, sai do próprio texto. */
  id?: string;
};

export type BlocoLista = { tipo: "lista"; ordenada?: boolean; itens: TextoRico[] };

/** "Em resumo": a resposta do artigo em poucos pontos, logo depois da abertura. */
export type BlocoResumo = { tipo: "resumo"; titulo?: string; itens: TextoRico[] };

export type BlocoDestaque = {
  tipo: "destaque";
  tom: "dica" | "atencao" | "nota";
  titulo?: string;
  texto: TextoRico;
};

export type BarraDeBenchmark = { nome: string; valor: number; destaque?: boolean };

export type GrupoDeBenchmark = {
  /** O que foi medido: jogo, programa, teste. */
  rotulo: string;
  /** Condição do teste: resolução, qualidade, DLSS… */
  detalhe?: string;
  barras: BarraDeBenchmark[];
};

export type BlocoBenchmark = {
  tipo: "benchmark";
  titulo: string;
  /** "fps", "MB/s", "s", "°C"… */
  unidade: string;
  /** Por padrão, barra maior é resultado melhor. */
  maiorMelhor?: boolean;
  grupos: GrupoDeBenchmark[];
  /** Número sem origem não entra: a régua reprova o artigo. */
  fonte: Fonte;
  nota?: TextoRico;
};

export type BlocoTabela = {
  tipo: "tabela";
  titulo?: string;
  colunas: string[];
  linhas: TextoRico[][];
  /** Índice da coluna recomendada (a primeira coluna, de rótulos, é a 0). */
  colunaDestaque?: number;
  fonte?: Fonte;
  nota?: TextoRico;
};

export type BlocoProsContras = {
  tipo: "pros-contras";
  titulo?: string;
  pros: string[];
  contras: string[];
};

export type BlocoCitacao = {
  tipo: "citacao";
  texto: string;
  autor: string;
  cargo?: string;
  /** Citação só entra com a publicação de onde foi tirada. */
  fonte: Fonte;
  /** Verdadeiro quando o original não é em português. */
  traduzida?: boolean;
};

/** Temas de chamada já prontos em `lib/blog/chamadas.ts`. */
export type TemaDeChamada =
  | "placas-de-video"
  | "pc-gamer"
  | "montagem"
  | "manutencao"
  | "dados"
  | "notebooks"
  | "seminovos"
  | "upgrade"
  | "empresas"
  | "geral";

export type BlocoChamada = {
  tipo: "chamada";
  /** Usa o texto pronto do tema… */
  tema?: TemaDeChamada;
  /** …ou escreve o seu. */
  titulo?: string;
  texto?: TextoRico;
  rotulo?: string;
  /** Link interno. Sem `href`, a chamada abre o WhatsApp da loja. */
  href?: string;
  /** Mensagem que já vai escrita no WhatsApp. */
  mensagem?: string;
};

export type BlocoImagem = { tipo: "imagem"; imagem: Imagem; legenda?: string };

export type Bloco =
  | BlocoParagrafo
  | BlocoTitulo
  | BlocoLista
  | BlocoResumo
  | BlocoDestaque
  | BlocoBenchmark
  | BlocoTabela
  | BlocoProsContras
  | BlocoCitacao
  | BlocoChamada
  | BlocoImagem;

/** Veredito de uma análise. É o que gera o JSON-LD de `Review`. */
export type Analise = {
  /** O que foi avaliado. */
  item: { nome: string; marca?: string; categoria?: string; imagem?: string };
  /** De 0 a 10, uma casa decimal. */
  nota: number;
  veredito: string;
  criterios?: { nome: string; nota: number }[];
  /** Para quem serve — aparece junto da nota. */
  indicadoPara?: string;
};

export type Pergunta = { pergunta: string; resposta: string };

export type Autor = {
  nome: string;
  cargo?: string;
  url?: string;
  /** Verdadeiro quando quem assina é uma pessoa, e não a equipe da loja. */
  pessoa?: boolean;
};

export type Artigo = {
  slug: string;
  titulo: string;
  /** A linha fina: uma ou duas frases que respondem à busca. Vira a descrição no Google. */
  resumo: string;
  categoria: CategoriaSlug;
  etiquetas: string[];
  capa: Imagem | null;
  /** ISO 8601. */
  publicadoEm: string;
  atualizadoEm?: string;
  autor: Autor;
  /**
   * `autoral` nasce neste repositório; `soro` vem da ferramenta Soro; `diario`
   * é publicado pela rotina diária, no ramo de conteúdo.
   */
  origem: "autoral" | "soro" | "diario";
  /** Sobe para a vitrine do topo. Número maior aparece primeiro. */
  destaque?: number;
  /** Ainda em escrita: fica fora do site até esta linha sair. */
  rascunho?: boolean;
  seo?: { titulo?: string; descricao?: string; palavrasChave?: string[] };
  blocos: Bloco[];
  analise?: Analise;
  perguntas?: Pergunta[];
  fontes?: Fonte[];
  /** Como os dados foram levantados. Obrigatório em análise. */
  metodologia?: TextoRico;
};

/** O que os cartões e a busca precisam — pequeno o bastante para ir ao navegador. */
export type ArtigoResumido = {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaSlug;
  etiquetas: string[];
  capa: Imagem | null;
  publicadoEm: string;
  minutos: number;
  temAnalise: boolean;
  nota?: number;
  /** Peso na vitrine do topo (só os artigos marcados têm). */
  destaque?: number;
};

export type ItemDoSumario = { id: string; texto: string; nivel: 2 | 3 };
