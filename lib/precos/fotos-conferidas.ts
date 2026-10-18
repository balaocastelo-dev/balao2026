// ============================================================
// Fotos conferidas uma a uma e guardadas no servidor da loja
// (public/fotos-produtos/<código>.webp).
//
// Problema achado em 18/10/2026: um produto que some do fornecedor por uns
// dias é apagado no fechamento da passada e, quando volta, entra de novo como
// produto novo — com a foto da fonte (marca d'água, logo) ou "sem foto". A
// foto conferida em 12/10 se perdia: 11 produtos estavam assim.
//
// Agora a gravação das fontes (banco.ts → gravarPagina) consulta esta lista:
// se o código tem foto conferida, é ela que vai para o produto, novo ou não.
//
// A lista (data/fotos-conferidas.json) acompanha os arquivos da pasta; o teste
// __tests__/lib/fotos-conferidas.test.ts falha se um arquivo ficar de fora.
// data/fotos-ilustrativas.json marca as que são só ilustrativas.
// ============================================================

import lista from "@/data/fotos-conferidas.json";
import ilustrativas from "@/data/fotos-ilustrativas.json";

export const PASTA_DAS_FOTOS_CONFERIDAS = "/fotos-produtos";
const SITE = "https://www.balao.info";

const conferidas = new Set<string>(lista as string[]);

/**
 * Das fotos da pasta, as que são ilustrativas (mesmo tipo de produto, não o
 * item exato). Pedido do Thiago em 18/10 para não perder os produtos de pronta
 * entrega da TechSupri que não têm foto exata em lugar nenhum. O site mostra o
 * aviso "Imagem ilustrativa" (endereço termina em #ilustrativa).
 */
const soIlustrativas = new Set<string>(ilustrativas as string[]);
export const MARCA_DE_ILUSTRATIVA = "#ilustrativa";

/** Endereço da foto conferida do produto, ou "" se ele não tiver. */
export function fotoConferida(codigo: string): string {
  if (!conferidas.has(codigo)) return "";
  const url = `${SITE}${PASTA_DAS_FOTOS_CONFERIDAS}/${encodeURIComponent(codigo)}.webp`;
  return soIlustrativas.has(codigo) ? `${url}${MARCA_DE_ILUSTRATIVA}` : url;
}

/** Põe a foto conferida no item da fonte, no lugar da foto que a fonte mandou. */
export function comFotoConferida<T extends { codigo: string; foto: string; fotos: string[] }>(item: T): T {
  const foto = fotoConferida(item.codigo);
  if (!foto) return item;
  return { ...item, foto, fotos: [foto] };
}
