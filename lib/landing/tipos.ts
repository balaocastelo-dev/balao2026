/**
 * As páginas de captação do site (serviços, vitrines e institucionais).
 *
 * Cada página é um arquivo de conteúdo em `lib/landing/paginas/` e um
 * `page.tsx` curto que entrega esse conteúdo ao montador
 * (`components/landing/PaginaDeCaptacao.tsx`). O texto, as seções, o
 * assistente de orçamento e a vitrine são próprios de cada página; o que se
 * repete é só a moldura.
 *
 * Regras de conteúdo (valem para todas):
 * - Só o que a loja de fato faz. Nada de prazo, garantia ou número que o
 *   Thiago não confirmou; garantia legal (90 dias para serviço, 7 dias de
 *   arrependimento na compra a distância) pode, porque é lei.
 * - Nada de depoimento inventado. A prova social é a nota pública no Google,
 *   com link para lá.
 * - Preço só na vitrine, que lê o catálogo do site. Texto não fala preço.
 */

/** Uma pergunta do assistente que monta a mensagem do WhatsApp. */
export type PerguntaDoAssistente = {
  /** Como a resposta entra na mensagem: "Aparelho: {resposta}". */
  rotulo: string;
  pergunta: string;
  opcoes: string[];
  /** Aceita várias respostas (ex.: sintomas). */
  varias?: boolean;
};

export type Assistente = {
  titulo: string;
  /** Uma linha sob o título: o que a pessoa ganha respondendo. */
  texto: string;
  perguntas: PerguntaDoAssistente[];
  /** Começo da mensagem; as respostas vêm depois, uma por linha. */
  abertura: string;
  /** Pedido que fecha a mensagem (ex.: "Posso mandar foto?"). */
  fecho?: string;
  /** Texto do botão final. */
  botao: string;
};

/** Regra que escolhe os produtos de uma fileira a partir do catálogo. */
export type RegraDeVitrine = {
  id: string;
  titulo: string;
  subtitulo?: string;
  /** Caminhos de categoria aceitos (o produto pode estar em subcategoria). */
  categorias?: string[];
  /** O nome começa por um destes (sem acento, minúsculo). */
  nomeComeca?: string[];
  /** O nome precisa conter ao menos um destes termos. */
  nomeContem?: string[];
  /** O nome não pode conter nenhum destes termos. */
  excluir?: string[];
  /** Fornecedores que ficam de fora. */
  semFornecedor?: string[];
  precoMin?: number;
  precoMax?: number;
  /** Só "Pronta entrega" (fornecedores locais). */
  soProntaEntrega?: boolean;
  /** Quantos produtos mostrar (padrão 12). */
  limite?: number;
  /** "maior": do mais caro para o mais barato (padrão das vitrines da loja). */
  ordem?: "maior" | "menor";
  /** Máximo de produtos da mesma marca (primeira palavra útil do nome). */
  porMarca?: number;
  /** Link "ver todos" (categoria com filtros). */
  verTodos?: { rotulo: string; href: string };
};

export type Imagem = { src: string; alt: string };

export type Topico = { titulo: string; texto: string };

/** As seções do corpo, na ordem em que a página quer contar a história. */
export type Secao =
  | {
      tipo: "dores";
      titulo: string;
      texto?: string;
      itens: Topico[];
    }
  | {
      tipo: "beneficios";
      titulo: string;
      texto?: string;
      itens: Topico[];
      imagem?: Imagem;
    }
  | {
      tipo: "passos";
      titulo: string;
      texto?: string;
      itens: Topico[];
    }
  | {
      tipo: "comparativo";
      titulo: string;
      texto?: string;
      colunas: [string, string, string];
      linhas: [string, string, string][];
    }
  | {
      tipo: "texto";
      titulo: string;
      paragrafos: string[];
      lista?: string[];
      imagem?: Imagem;
      /** Lado da imagem no computador. */
      lado?: "esquerda" | "direita";
    }
  | {
      tipo: "marcas";
      titulo: string;
      texto?: string;
      marcas: string[];
    }
  | {
      tipo: "regras";
      titulo: string;
      texto?: string;
      itens: { titulo: string; texto: string; pontos?: string[] }[];
    }
  | {
      tipo: "dados";
      titulo: string;
      texto?: string;
      linhas: [string, string][];
    }
  | {
      tipo: "loja";
      titulo: string;
      texto?: string;
    }
  | {
      tipo: "atalhos";
      titulo: string;
      texto?: string;
      /** Slugs de páginas desta mesma rede (ou caminhos internos). */
      itens: { titulo: string; texto: string; href: string; imagem?: string }[];
    }
  | { tipo: "vitrine"; regras: RegraDeVitrine[]; titulo?: string; texto?: string }
  | { tipo: "quedas"; titulo: string; texto?: string; limite?: number }
  | { tipo: "especial"; id: string };

export type Pergunta = { pergunta: string; resposta: string };

export type PaginaDeCaptacao = {
  /** Endereço sem a barra: "manutencao", "wendell/apple". */
  slug: string;
  /** Nome curto, para links e migalhas. */
  nome: string;
  /** Uma linha que vende a página nos links de outras páginas. */
  chamada: string;
  seo: {
    titulo: string;
    descricao: string;
    palavras: string[];
    tipoDeServico?: string;
    imagem?: string;
  };
  hero: {
    /** Linha de contexto acima do título (local + o que é). */
    contexto: string;
    titulo: string;
    texto: string;
    imagem: Imagem;
    /** Ação principal: abre o WhatsApp com esta mensagem. */
    mensagem: string;
    botao: string;
    /** Ação secundária (âncora ou página). */
    secundario?: { rotulo: string; href: string };
    /** Até quatro fatos curtos sob os botões. */
    fatos?: { valor: string; rotulo: string }[];
  };
  assistente?: Assistente;
  secoes: Secao[];
  perguntas: Pergunta[];
  /** Temas que ligam esta página às outras e aos artigos do blog. */
  temas: string[];
  /** Termos para achar artigos do blog sobre o assunto. */
  termosDoBlog: string[];
  /** Páginas que sempre aparecem em "Também resolvemos", na ordem. */
  relacionadas?: string[];
  /** Fecho da página. */
  final: { titulo: string; texto: string; botao: string; mensagem?: string };
};
