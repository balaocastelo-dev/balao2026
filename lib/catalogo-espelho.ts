import { parsePriceToNumber, type CarouselImage, type Category, type Product } from "./utils";

// ============================================================
// Espelho do catálogo, guardado na VPS.
//
// O banco da Hostinger aceita 500 conexões por HORA. Quando a cota estoura,
// ele recusa TUDO e o catálogo some do site e do CRM até a hora virar — no
// meio de um atendimento, o vendedor fica sem preço para mandar.
//
// A VPS que roda o WhatsApp já fica no ar o dia inteiro e tem disco, então
// guarda uma cópia do catálogo. Aqui é a leitura dessa cópia.
//
// IMPORTANTE: isto é rede de segurança, não a fonte. O caminho normal continua
// sendo o banco (com cache). A cópia entra quando o banco devolve vazio —
// melhor o catálogo de meia hora atrás do que catálogo nenhum.
// ============================================================

function enderecoDoEspelho() {
  return (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    ""
  ).replace(/\/$/, "");
}

/**
 * Baixa a cópia do catálogo da VPS.
 *
 * Devolve lista vazia (nunca lança) quando não há espelho configurado ou a VPS
 * não responde: o espelho existe para melhorar um dia ruim, não para criar um
 * novo jeito de a página quebrar.
 */
interface CopiaDoEspelho {
  produtos: Product[];
  categorias: Category[];
  banners: CarouselImage[];
  blog: unknown[];
}

async function buscarEspelho(): Promise<CopiaDoEspelho> {
  const vazio: CopiaDoEspelho = { produtos: [], categorias: [], banners: [], blog: [] };
  const base = enderecoDoEspelho();
  if (!base) return vazio;

  try {
    const resposta = await fetch(`${base}/api/crm/catalogo`, {
      signal: AbortSignal.timeout(8000),
      // O cache é do Next, na camada de cima (lib/cache.ts). Aqui a busca é
      // sempre fresca para não empilhar dois caches com prazos diferentes.
      cache: "no-store",
    });
    if (!resposta.ok) return vazio;

    const dados = await resposta.json();
    const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
    return {
      produtos: lista<Product>(dados?.produtos),
      categorias: lista<Category>(dados?.categorias),
      banners: lista<CarouselImage>(dados?.banners),
      blog: lista<unknown>(dados?.blog),
    };
  } catch {
    return vazio;
  }
}

export async function lerCatalogoDoEspelho(): Promise<Product[]> {
  return (await buscarEspelho()).produtos;
}

/**
 * Categorias guardadas na VPS.
 *
 * Precisa existir junto com os produtos: a home e as páginas `/categoria/*`
 * descobrem QUAL categoria está aberta olhando esta árvore. Sem ela, a página
 * nem chega a perguntar por produto — e o catálogo continuava sumindo dessas
 * telas mesmo com a cópia dos produtos a salvo.
 */
export async function lerCategoriasDoEspelho(): Promise<Category[]> {
  return (await buscarEspelho()).categorias;
}

/** Banners do carrossel guardados na VPS. Sem eles a home perde o topo. */
export async function lerBannersDoEspelho(): Promise<CarouselImage[]> {
  return (await buscarEspelho()).banners;
}

/** Posts do blog guardados na VPS, para a seção de blog da home. */
export async function lerBlogDoEspelho<T>(): Promise<T[]> {
  return (await buscarEspelho()).blog as T[];
}

/**
 * Roda a consulta no banco e, se ela vier vazia, tenta a cópia da VPS.
 *
 * "Vazio" é o sinal de falha aqui porque `lib/db.ts` engole os erros e devolve
 * lista vazia — inclusive quando a cota estourou. Do lado de fora, catálogo
 * vazio e banco recusando são indistinguíveis, e nos dois casos a cópia é uma
 * resposta melhor que uma página em branco.
 */
export async function comEspelho<T>(
  doBanco: () => Promise<T>,
  doEspelho: (produtos: Product[]) => T,
  estaVazio: (valor: T) => boolean
): Promise<T> {
  const resultado = await doBanco();
  if (!estaVazio(resultado)) return resultado;

  const produtos = await lerCatalogoDoEspelho();
  if (produtos.length === 0) return resultado;

  console.warn(
    `[catalogo] Banco devolveu vazio; servindo ${produtos.length} produtos da cópia da VPS.`
  );
  return doEspelho(produtos);
}

// ---------- as mesmas consultas, feitas sobre a cópia ----------
//
// Cada função abaixo repete o que o SQL de lib/db.ts faz. Se a regra mudar lá,
// tem que mudar aqui — senão, no dia em que o banco cair, o site passa a
// mostrar uma seleção diferente da de sempre.

const porPreco = (itens: Product[]) =>
  [...itens].sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));

const texto = (valor: unknown) => String(valor ?? "").toLowerCase();

/** `SELECT * FROM products ORDER BY created_at DESC` + ordenação por preço. */
export function espelhoTodos(produtos: Product[]): Product[] {
  return porPreco(produtos);
}

/** `WHERE slug = ? OR id = ? LIMIT 1` */
export function espelhoPorIdentificador(produtos: Product[], identificador: string): Product | null {
  const alvo = String(identificador || "");
  return produtos.find((p) => p.slug === alvo || String(p.id) === alvo) || null;
}

/** `WHERE category IN (...)` */
export function espelhoPorCategoriasExatas(produtos: Product[], nomes: string[]): Product[] {
  const alvos = new Set(nomes.map((n) => String(n || "").trim()).filter(Boolean));
  if (alvos.size === 0) return [];
  return porPreco(produtos.filter((p) => alvos.has(String(p.category || ""))));
}

/** `WHERE category = ? OR category LIKE 'caminho/%'` */
export function espelhoPorCaminhoDeCategoria(produtos: Product[], caminho: string): Product[] {
  const alvo = String(caminho || "");
  if (!alvo) return [];
  return porPreco(
    produtos.filter((p) => {
      const categoria = String(p.category || "");
      return categoria === alvo || categoria.startsWith(`${alvo}/`);
    })
  );
}

/** `WHERE (nome LIKE %k% OR categoria LIKE %k% OR descrição LIKE %k%) OR ...` */
export function espelhoPorPalavrasChave(
  produtos: Product[],
  palavras: string[],
  limite = 24
): Product[] {
  const chaves = [...new Set(palavras.map((k) => texto(k).trim()).filter(Boolean))];
  if (chaves.length === 0) return [];

  const achados = produtos.filter((p) => {
    const nome = texto(p.name);
    const categoria = texto(p.category);
    const descricao = texto(p.description);
    return chaves.some(
      (k) => nome.includes(k) || categoria.includes(k) || descricao.includes(k)
    );
  });

  return porPreco(achados).slice(0, limite);
}

/** Busca da caixa de pesquisa: TODOS os termos precisam bater. */
export function espelhoPorTodosOsTermos(
  produtos: Product[],
  termos: string[],
  limite = 10
): Product[] {
  const limpos = termos.map((t) => texto(t).trim()).filter(Boolean);
  if (limpos.length === 0) return [];

  const achados = produtos.filter((p) => {
    const nome = texto(p.name);
    const descricao = texto(p.description);
    return limpos.every((t) => nome.includes(t) || descricao.includes(t));
  });

  return porPreco(achados).slice(0, limite);
}

/** Paginação do admin: busca, categoria, ordenação e fatia. */
export function espelhoPaginado(
  produtos: Product[],
  opcoes: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: "price_asc" | "recent";
  }
): { products: Product[]; total: number } {
  const pagina = Math.max(1, opcoes.page || 1);
  const limite = Math.min(200, Math.max(1, opcoes.limit || 50));

  let lista = produtos;

  const busca = texto(opcoes.search).trim();
  if (busca) {
    lista = lista.filter(
      (p) =>
        texto(p.name).includes(busca) ||
        texto(p.id).includes(busca) ||
        texto(p.supplier).includes(busca) ||
        texto(p.category).includes(busca)
    );
  }

  const categoria = String(opcoes.category || "").trim();
  if (categoria) {
    lista = lista.filter((p) => {
      const atual = String(p.category || "");
      return atual === categoria || atual.startsWith(`${categoria}/`);
    });
  }

  const ordenada = opcoes.sort === "price_asc" ? porPreco(lista) : lista;
  const inicio = (pagina - 1) * limite;

  return { products: ordenada.slice(inicio, inicio + limite), total: ordenada.length };
}
