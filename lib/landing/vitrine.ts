// ============================================================
// Vitrines das páginas de captação.
//
// As páginas de serviço montavam a vitrine com busca por palavra solta
// ("hp", "fonte", "apple"...) em nome, categoria e descrição. Era assim que
// a página de toner mostrava notebook HP e a de reparo Apple mostrava cabo
// qualquer. Aqui cada fileira diz ONDE o produto está (caminho de categoria)
// ou COMO o nome começa, e o que fica de fora. Mesma ideia da /notebooks.
//
// Tudo aqui é função pura: recebe a lista do catálogo, devolve as fileiras.
// ============================================================

import { parsePriceToNumber, type Product } from "@/lib/utils";
import type { RegraDeVitrine } from "./tipos";

export type ProdutoDaVitrine = Pick<
  Product,
  "id" | "name" | "price" | "image" | "category" | "slug" | "availability" | "supplier" | "brand"
> &
  Partial<Product>;

export type FileiraPronta<T> = {
  id: string;
  titulo: string;
  subtitulo?: string;
  produtos: T[];
  verTodos?: { rotulo: string; href: string };
};

export const LIMITE_PADRAO = 12;

export const normalizar = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Termo inteiro: "hp" não casa com "chip"; "toner" casa com "toner preto". */
function contemTermo(nome: string, termo: string): boolean {
  const t = normalizar(termo);
  if (!t) return false;
  const escapado = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapado}($|[^a-z0-9])`).test(nome);
}

export function naCategoria(categoria: unknown, caminhos: string[]): boolean {
  const atual = String(categoria || "");
  return caminhos.some((c) => atual === c || atual.startsWith(`${c}/`));
}

/** Foto que o catálogo marcou como "sem foto" não vai para vitrine de captação. */
export function temFoto(p: Pick<Product, "image">): boolean {
  const url = String(p.image || "").trim();
  return url.length > 4 && !/produto-sem-foto|placeholder|no-image|sem-foto/i.test(url);
}

const indisponivel = (p: Pick<Product, "availability">) =>
  /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));

const prontaEntrega = (p: Pick<Product, "availability">) => /pronta entrega/i.test(String(p.availability || ""));

/** Palavras que dizem o que é o produto, não de quem é. */
const GENERICAS = new Set(
  (
    "kit combo fonte carregador cartucho toner tinta refil controle placa de da do para p/ com video mae " +
    "ssd hd memoria ram processador gabinete cooler water air fan notebook macbook iphone ipad apple watch " +
    "smartphone celular cabo capa pelicula suporte adaptador console jogo game headset fone mouse teclado " +
    "monitor pc computador gamer impressora multifuncional pen drive cartao externo portatil interno nvme " +
    "sata m.2 power bank tomada veicular parede usb-c usb tipo c original"
  ).split(" ")
);

/** Marca aproximada, só para variar a vitrine: primeira palavra que não é genérica. */
export function marcaDoProduto(p: Pick<Product, "name" | "brand">): string {
  const daFicha = normalizar(p.brand);
  if (daFicha) return daFicha;
  const palavras = normalizar(p.name).split(" ");
  return palavras.find((w) => w.length > 1 && !GENERICAS.has(w) && !/^\d/.test(w)) || palavras[0] || "";
}

/** O produto passa pela regra? */
export function casaComRegra(p: ProdutoDaVitrine, regra: RegraDeVitrine): boolean {
  const nome = normalizar(p.name);
  if (!nome) return false;

  const pelaCategoria = regra.categorias?.length ? naCategoria(p.category, regra.categorias) : false;
  const peloNome = regra.nomeComeca?.length ? regra.nomeComeca.some((n) => nome.startsWith(normalizar(n))) : false;
  const temOrigem = Boolean(regra.categorias?.length || regra.nomeComeca?.length);
  if (temOrigem && !pelaCategoria && !peloNome) return false;

  if (regra.nomeContem?.length && !regra.nomeContem.some((t) => contemTermo(nome, t))) return false;
  if (regra.excluir?.some((t) => contemTermo(nome, t))) return false;
  if (regra.semFornecedor?.some((f) => normalizar(p.supplier) === normalizar(f))) return false;

  const preco = parsePriceToNumber(p.price);
  if (!(preco > 0)) return false;
  if (regra.precoMin != null && preco < regra.precoMin) return false;
  if (regra.precoMax != null && preco > regra.precoMax) return false;
  if (regra.soProntaEntrega && !prontaEntrega(p)) return false;
  return true;
}

/**
 * Monta uma fileira: só produto com foto e disponível, sem repetir nome,
 * no máximo `porMarca` da mesma marca, do mais caro para o mais barato
 * (padrão das vitrines da loja) ou o contrário.
 */
export function montarFileira<T extends ProdutoDaVitrine>(
  produtos: T[],
  regra: RegraDeVitrine,
  jaUsados: Set<string> = new Set()
): FileiraPronta<T> {
  const limite = Math.max(1, regra.limite ?? LIMITE_PADRAO);
  const porMarca = regra.porMarca ?? 3;
  const ordem = regra.ordem ?? "maior";

  const candidatos = (Array.isArray(produtos) ? produtos : []).filter(
    (p) => p && temFoto(p) && !indisponivel(p) && casaComRegra(p, regra)
  );

  candidatos.sort((a, b) => {
    const diferenca = parsePriceToNumber(a.price) - parsePriceToNumber(b.price);
    return (ordem === "maior" ? -diferenca : diferenca) || String(a.name).localeCompare(String(b.name), "pt-BR");
  });

  const nomes = new Set<string>();
  const marcas = new Map<string, number>();
  const escolhidos: T[] = [];
  const sobras: T[] = [];

  for (const p of candidatos) {
    const id = String(p.id || "");
    const nome = normalizar(p.name);
    if (!id || jaUsados.has(id) || nomes.has(nome)) continue;
    nomes.add(nome);
    const marca = marcaDoProduto(p);
    const usadas = marcas.get(marca) ?? 0;
    if (usadas >= porMarca) {
      sobras.push(p);
      continue;
    }
    marcas.set(marca, usadas + 1);
    escolhidos.push(p);
    if (escolhidos.length >= limite) break;
  }

  // Poucas marcas na categoria: completa com o que ficou de fora pela variedade.
  for (const p of sobras) {
    if (escolhidos.length >= limite) break;
    escolhidos.push(p);
  }

  for (const p of escolhidos) jaUsados.add(String(p.id));

  return {
    id: regra.id,
    titulo: regra.titulo,
    subtitulo: regra.subtitulo,
    produtos: escolhidos,
    verTodos: regra.verTodos,
  };
}

/** Todas as fileiras de uma página, sem repetir produto entre elas. */
export function montarFileiras<T extends ProdutoDaVitrine>(produtos: T[], regras: RegraDeVitrine[]): FileiraPronta<T>[] {
  const usados = new Set<string>();
  return regras.map((r) => montarFileira(produtos, r, usados)).filter((f) => f.produtos.length > 0);
}

/**
 * O que pedir ao banco para montar essas fileiras: os caminhos de categoria e
 * os começos de nome. Só isso vai para a consulta; o resto é filtrado aqui.
 */
export function origensDasRegras(regras: RegraDeVitrine[]): { categorias: string[]; nomes: string[] } {
  const categorias = new Set<string>();
  const nomes = new Set<string>();
  for (const r of regras) {
    for (const c of r.categorias ?? []) categorias.add(c);
    for (const n of r.nomeComeca ?? []) nomes.add(normalizar(n));
  }
  return { categorias: [...categorias].sort(), nomes: [...nomes].sort() };
}
