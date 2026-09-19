import { parsePriceToNumber, type CarouselImage, type Category, type Product } from "./utils";
import catalogoBackup from "@/data/catalogo-backup.json";

// ============================================================
// Espelho do catálogo, guardado na VPS e com backup estático bundled.
//
// O banco da Hostinger aceita 500 conexões por HORA. Quando a cota estoura,
// ele recusa TUDO e o catálogo some do site e do CRM até a hora virar — no
// meio de um atendimento, o vendedor fica sem preço para mandar.
//
// A VPS que roda o WhatsApp já fica no ar o dia inteiro e tem disco, então
// guarda uma cópia do catálogo. Aqui é a leitura dessa cópia.
//
// Se tanto o banco quanto a VPS falharem, o backup estático garante que a
// loja e o CRM nunca fiquem vazios com 0 produtos.
// ============================================================

function enderecoDoEspelho() {
  return (
    process.env.WHATSAPP_PANEL_SERVER_URL ||
    process.env.NEXT_PUBLIC_WHATSAPP_PANEL_SERVER_URL ||
    "https://srv1963897.hstgr.cloud"
  ).replace(/\/$/, "");
}

interface CopiaDoEspelho {
  produtos: Product[];
  categorias: Category[];
  banners: CarouselImage[];
  blog: unknown[];
}

function getBackupEstatico(): CopiaDoEspelho {
  const b = catalogoBackup as any;
  const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    produtos: lista<Product>(b?.produtos),
    categorias: lista<Category>(b?.categorias),
    banners: lista<CarouselImage>(b?.banners),
    blog: lista<unknown>(b?.blog),
  };
}

async function buscarEspelho(): Promise<CopiaDoEspelho> {
  const base = enderecoDoEspelho();
  const fallback = getBackupEstatico();

  if (!base) return fallback;

  try {
    const resposta = await fetch(`${base}/api/crm/catalogo`, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!resposta.ok) return fallback;

    const dados = await resposta.json();
    const lista = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
    const produtos = lista<Product>(dados?.produtos);

    if (produtos.length === 0) return fallback;

    return {
      produtos,
      categorias: lista<Category>(dados?.categorias).length ? lista<Category>(dados?.categorias) : fallback.categorias,
      banners: lista<CarouselImage>(dados?.banners).length ? lista<CarouselImage>(dados?.banners) : fallback.banners,
      blog: lista<unknown>(dados?.blog).length ? lista<unknown>(dados?.blog) : fallback.blog,
    };
  } catch {
    return fallback;
  }
}

export async function lerCatalogoDoEspelho(): Promise<Product[]> {
  return (await buscarEspelho()).produtos;
}

/**
 * Categorias guardadas na VPS ou backup.
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
 * Roda a consulta no banco e, se ela vier vazia ou falhar, tenta a cópia da VPS/backup.
 */
export async function comEspelho<T>(
  doBanco: () => Promise<T>,
  doEspelho: (produtos: Product[]) => T,
  estaVazio: (valor: T) => boolean
): Promise<T> {
  try {
    const resultado = await doBanco();
    if (!estaVazio(resultado)) return resultado;
  } catch (error) {
    console.warn("[catalogo] Erro ao consultar banco primário:", error);
  }

  const produtos = await lerCatalogoDoEspelho();
  if (produtos.length === 0) {
    return doEspelho([]);
  }

  console.warn(
    `[catalogo] Banco devolveu vazio ou falhou; servindo ${produtos.length} produtos da cópia da VPS/backup.`
  );
  return doEspelho(produtos);
}

// ---------- as mesmas consultas, feitas sobre a cópia ----------

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

/** Paginação do admin e CRM: busca, categoria, ordenação e fatia. */
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
