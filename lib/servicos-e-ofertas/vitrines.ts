// ============================================================
// Prateleiras da página /servicos-e-ofertas.
//
// A versão antiga pegava "qualquer produto com gamer/notebook/ssd no nome" e
// mostrava kit de parafuso de cadeira e adaptador de R$ 17 como "oferta". O
// Thiago quer produto que impressiona, com foto. Por isso reaproveitamos as
// regras das vitrines da página inicial (categoria certa, preço mínimo, foto
// de verdade, marcas e faixas de preço variadas) e escolhemos só as
// prateleiras que fazem sentido aqui, na ordem de quem procura serviço.
// ============================================================

import { montarVitrines, type Vitrine } from "@/lib/home/vitrines";
import { parsePriceToNumber, type Product } from "@/lib/utils";

export const ORDEM_DAS_PRATELEIRAS = [
  "pc-gamer",
  "notebooks",
  "monitores",
  "hardware",
  "pronta-entrega",
  "perifericos",
  "games",
] as const;

/** Quantos produtos em cada prateleira (rolagem lateral). */
export const POR_PRATELEIRA = 8;

/** Chamada curta de cada prateleira, ligando o produto ao serviço da loja. */
export const GANCHO_DA_PRATELEIRA: Record<string, string> = {
  "pc-gamer": "Montado e testado na bancada da loja antes de ir para a sua casa.",
  notebooks: "Leve já configurado, com os seus arquivos passados do aparelho antigo.",
  "pronta-entrega": "Está na loja: compre e retire hoje no Cambuí.",
  monitores: "Gamer, trabalho e ultrawide, para ver ligado antes de levar.",
  hardware: "Comprou a peça? A instalação na loja sai com desconto na mão de obra.",
  perifericos: "Teclado, mouse, headset e cadeira para completar o setup.",
  games: "Console, controle e acessório, e a assistência técnica do lado.",
};

/**
 * Pisos de preço desta página, mais altos que os da home: aqui a prateleira é
 * para impressionar (suporte de moto de R$ 80 não segura ninguém). O corte é
 * feito antes de escolher, para cada prateleira continuar cheia.
 */
export const PISO_GERAL = 120;
export const PISO_PRONTA_ENTREGA = 150;

/**
 * Foto do catálogo do fornecedor (Kyte/Firebase): é a que vem com marca
 * d'água, e o Thiago pediu foto da internet no lugar. Nesta página, que
 * precisa impressionar, produto com essa foto fica de fora.
 */
export function fotoDoFornecedor(p: Product): boolean {
  const img = String(p.image || "");
  return /firebasestorage\.googleapis\.com\/v0\/b\/kyte-|kyte\.(site|com)/i.test(img);
}

function forteOBastante(p: Product): boolean {
  if (fotoDoFornecedor(p)) return false;
  const preco = parsePriceToNumber(p.price);
  const pronta = String(p.availability || "").toLowerCase().includes("pronta");
  return preco >= (pronta ? PISO_PRONTA_ENTREGA : PISO_GERAL);
}

export function prateleirasDaPagina(produtos: Product[]): Vitrine[] {
  const todas = montarVitrines(produtos.filter(forteOBastante), POR_PRATELEIRA);
  const porId = new Map(todas.map((v) => [v.id, v]));
  return ORDEM_DAS_PRATELEIRAS.map((id) => porId.get(id)).filter((v): v is Vitrine => !!v);
}

/** Todos os produtos mostrados, para a lista estruturada (schema ItemList). */
export function produtosMostrados(prateleiras: Vitrine[]): Product[] {
  return prateleiras.flatMap((v) => v.produtos);
}
