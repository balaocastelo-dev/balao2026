/**
 * Vitrines da página /especialidades.
 *
 * A página antiga mostrava os oito primeiros produtos do catálogo — pilha de
 * R$ 3,75 e adaptador P2. Aqui cada vitrine sai de uma área de serviço da loja
 * (PC gamer montado na bancada, notebooks, Apple, upgrade de SSD e memória) e
 * mostra produtos que fazem o cliente parar: com foto de verdade, disponíveis,
 * variando marca e faixa de preço, do mais caro para o mais em conta.
 */
import { escolherVariados } from "@/lib/home/vitrines";
import { parsePriceToNumber, type Product } from "@/lib/utils";

const indisponivel = (p: Product) => /indispon|esgotad|sem estoque/i.test(String(p.availability || ""));

/** Foto do produto exato: sem a imagem padrão e sem foto "ilustrativa". */
export function temFotoDoProduto(p: Product): boolean {
  const img = String(p?.image || "").trim();
  return !!img && !img.includes("produto-sem-foto") && !img.endsWith("#ilustrativa");
}

/**
 * Escolhe `quantos` produtos para uma vitrine: só com preço, foto do produto e
 * disponível; varia marca e faixa de preço; devolve do mais caro para o mais
 * barato (o card mais forte abre a fileira).
 */
export function escolherDestaques(produtos: Product[], quantos = 4, filtro?: (p: Product) => boolean): Product[] {
  const vistos = new Set<string>();
  const candidatos = (Array.isArray(produtos) ? produtos : []).filter((p) => {
    if (!p || !p.id) return false;
    const id = String(p.id);
    if (vistos.has(id)) return false;
    vistos.add(id);
    if (!(parsePriceToNumber(p.price) > 0)) return false;
    if (indisponivel(p) || !temFotoDoProduto(p)) return false;
    return filtro ? filtro(p) : true;
  });

  return escolherVariados(candidatos, quantos).sort(
    (a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price)
  );
}

/** SSD que vale como upgrade de bancada: NVMe ou M.2 interno. */
export const ehSsdDeUpgrade = (p: Product) =>
  /nvme|m\.2|pcie/i.test(`${p.name} ${p.category}`) &&
  /\b(500|512|1|2)\s?(gb|tb)\b/i.test(p.name) &&
  !/externo|portátil|portatil|case|gaveta|adaptador|dissipador/i.test(p.name);

/** Pente de memória RAM (não kit de upgrade completo nem dissipador). */
export const ehMemoriaRam = (p: Product) =>
  /mem[oó]ria/i.test(p.name) &&
  /ddr\s?[45]/i.test(`${p.name} ${p.category}`) &&
  /\b(8|16|32)\s?gb\b/i.test(p.name) &&
  !/dissipador|cooler|adaptador/i.test(p.name);
