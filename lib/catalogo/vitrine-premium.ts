// ============================================================
// Seleção das páginas /premium e /ia-local.
//
// Entra a lista de computadores do catálogo (desktops e notebooks), sai o que
// as duas páginas mostram, já pronto para desenhar:
//   • os desktops mais caros da loja, do mais caro para o mais barato;
//   • os notebooks mais caros;
//   • todas as máquinas que atendem ao critério de IA local.
//
// Nada aqui é cadastro: quando o preço muda ou um produto entra/sai do
// catálogo, a próxima leitura já devolve a lista nova.
//
// O preço mostrado é SEMPRE o do catálogo. A página antiga multiplicava o
// preço por 0,5 e escrevia "50% OFF"; o cliente chegava no produto e o valor
// era o dobro. Não há conta de preço neste arquivo de propósito.
// ============================================================

import { lerFicha, rotuloDeMemoria, rotuloDePlaca, tipoDeVitrine, tituloDaMaquina } from "@/lib/catalogo/ficha";
import { nivelDeIA, type NivelDeIA } from "@/lib/catalogo/ia-local";
import { getProductHref, parsePriceToNumber, type Product } from "@/lib/utils";

export { emReais } from "@/lib/catalogo/reais";

export const RAIZ_DESKTOPS = "Computadores/PC";
export const RAIZ_NOTEBOOKS = "Computadores/Notebooks";

export const TOTAL_DESKTOPS = 24;
export const TOTAL_NOTEBOOKS = 4;

type ProdutoDeVitrine = Pick<
  Product,
  "id" | "name" | "price" | "image" | "category" | "slug" | "price_card" | "installment" | "availability" | "product_url"
>;

export interface MaquinaDeVitrine {
  id: string;
  href: string;
  /** Nome completo do catálogo (vai no `alt` da foto e nos dados estruturados). */
  nome: string;
  /** Nome de vitrine: "Ryzen 7 9800X3D com RTX 5070 Ti". */
  titulo: string;
  /** "Workstation", "Desktop", "iMac", "Notebook"… */
  tipo: string;
  imagem: string;
  /** Preço à vista, em reais. */
  valor: number;
  /** Preço no cartão quando é diferente do à vista. */
  valorNoCartao: number | null;
  /** "10x de R$ 3.989,87", como vem do catálogo. */
  parcelas: string | null;
  processador: string | null;
  placa: string | null;
  memoria: string | null;
  armazenamento: string | null;
  vramGb: number | null;
  memoriaGb: number | null;
  apple: boolean;
  nivelDeIA: NivelDeIA | null;
  notebook: boolean;
}

export interface VitrinePremium {
  desktops: MaquinaDeVitrine[];
  notebooks: MaquinaDeVitrine[];
  iaLocal: MaquinaDeVitrine[];
  /** Quantos computadores a loja tem no catálogo (para o texto da página). */
  totalDeComputadores: number;
}

const dentro = (categoria: unknown, raiz: string) => {
  const atual = String(categoria || "");
  return atual === raiz || atual.startsWith(`${raiz}/`);
};

const indisponivel = (p: ProdutoDeVitrine) => /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));

export function montarMaquina(produto: ProdutoDeVitrine): MaquinaDeVitrine | null {
  const valor = parsePriceToNumber(produto.price);
  if (!(valor > 0) || !produto.id || !String(produto.name || "").trim()) return null;

  const ficha = lerFicha(produto);
  const noCartao = parsePriceToNumber(produto.price_card);

  return {
    id: String(produto.id),
    href: getProductHref(produto),
    nome: String(produto.name).trim(),
    titulo: tituloDaMaquina(produto, ficha),
    tipo: tipoDeVitrine(produto, ficha),
    imagem: String(produto.image || "").trim(),
    valor,
    valorNoCartao: noCartao > 0 && Math.abs(noCartao - valor) >= 0.01 ? noCartao : null,
    parcelas: String(produto.installment || "").trim() || null,
    processador: ficha.processador,
    placa: rotuloDePlaca(ficha),
    memoria: rotuloDeMemoria(ficha),
    armazenamento: ficha.armazenamento,
    vramGb: ficha.vramGb,
    memoriaGb: ficha.memoriaGb,
    apple: ficha.appleSilicon,
    nivelDeIA: nivelDeIA(ficha),
    notebook: ficha.tipo === "notebook" || ficha.tipo === "macbook",
  };
}

/** Do mais caro para o mais barato; empate decide pelo nome, para a ordem não dançar. */
export const porPrecoDecrescente = (a: MaquinaDeVitrine, b: MaquinaDeVitrine) =>
  b.valor - a.valor || a.nome.localeCompare(b.nome, "pt-BR");

export function montarVitrine(produtos: ProdutoDeVitrine[]): VitrinePremium {
  const desktops: MaquinaDeVitrine[] = [];
  const notebooks: MaquinaDeVitrine[] = [];
  const vistos = new Set<string>();

  for (const produto of produtos) {
    const ehDesktop = dentro(produto.category, RAIZ_DESKTOPS);
    const ehNotebook = !ehDesktop && dentro(produto.category, RAIZ_NOTEBOOKS);
    if (!ehDesktop && !ehNotebook) continue;
    if (indisponivel(produto)) continue;

    const maquina = montarMaquina(produto);
    if (!maquina || vistos.has(maquina.id)) continue;
    vistos.add(maquina.id);
    (ehDesktop ? desktops : notebooks).push(maquina);
  }

  desktops.sort(porPrecoDecrescente);
  notebooks.sort(porPrecoDecrescente);

  return {
    desktops: desktops.slice(0, TOTAL_DESKTOPS),
    notebooks: notebooks.slice(0, TOTAL_NOTEBOOKS),
    iaLocal: [...desktops, ...notebooks].filter((m) => m.nivelDeIA != null).sort(porPrecoDecrescente),
    totalDeComputadores: desktops.length + notebooks.length,
  };
}
