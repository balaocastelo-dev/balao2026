// ============================================================
// Foto de verdade para cada peça da página do setup (/p/[slug]).
//
// Pedido do Thiago em 25/10: "não gosto dos desenhos das peças (parece feito
// no Paintbrush); coloca uma foto meio original e escreve que é imagem
// ilustrativa". A página do setup mostrava, para processador, memória, SSD,
// placa de vídeo e resfriamento, os desenhos em SVG de lib/vitrine/core.ts
// (pickComponentImage).
//
// Agora cada peça recebe a FOTO de um produto do mesmo tipo do catálogo da
// loja (ex.: placa "RX 6600" → foto de uma RX 6600 à venda; processador
// "Ryzen 5 5500" → foto de um Ryzen 5 5500). Como pode não ser a peça exata
// do PC, o endereço leva "#ilustrativa" e o selo "Imagem ilustrativa"
// aparece em cima (components/SeloProntaEntrega.tsx → AvisoImagemIlustrativa).
// Regras puras, testadas em __tests__/lib/vitrine-fotos-pecas.test.ts.
// ============================================================

import type { Product } from "@/lib/utils";
import { placaDedicada } from "./rotativa";

export type TipoDePeca = "cpu" | "ram" | "storage" | "gpu" | "cooling";

/** Categoria do catálogo onde procurar a foto de cada peça. */
export const CATEGORIA_DA_PECA: Record<TipoDePeca, string> = {
  cpu: "Hardware/Processadores",
  ram: "Hardware/Memória RAM",
  storage: "Hardware/SSD",
  gpu: "Hardware/Placa de vídeo (VGA)",
  cooling: "Hardware/Coolers/Air Cooler",
};

const sem = (t: string) =>
  String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const junto = (t: string) => sem(t).replace(/[^a-z0-9]/g, "");

export const MARCA_ILUSTRATIVA = "#ilustrativa";

export function comoIlustrativa(url: string): string {
  const limpo = String(url || "").trim();
  if (!limpo) return "";
  return limpo.endsWith(MARCA_ILUSTRATIVA) ? limpo : `${limpo}${MARCA_ILUSTRATIVA}`;
}

function comFoto(produtos: Product[]): Product[] {
  return produtos.filter((p) => String(p.image || "").startsWith("http"));
}

/** Palavras que a foto precisa ter no nome, conforme a peça do setup. */
export function termosDaPeca(tipo: TipoDePeca, descricao: string): string[][] {
  const t = sem(descricao);
  switch (tipo) {
    case "gpu": {
      const placa = placaDedicada(descricao);
      if (!placa) return [];
      // "RX 6600" → procura "rx6600" (e prefere sem "xt" quando a do setup não tem).
      return [[junto(placa)]];
    }
    case "cpu": {
      const ryzen = t.match(/ryzen\s?([3579])\s?(\d{4,5}[a-z]{0,2})/);
      if (ryzen) return [["ryzen", ryzen[2]], ["ryzen", ryzen[2].replace(/[a-z]+$/, "")]];
      const intel = t.match(/\b(?:core\s?)?i([3579])[\s-]?(\d{4,5}[a-z]{0,2})/);
      if (intel) return [[`i${intel[1]}`, intel[2]], [intel[2].replace(/[a-z]+$/, "")]];
      const ultra = t.match(/ultra\s?([579])\s?(\d{3}[a-z]?)/);
      if (ultra) return [["ultra", ultra[2]]];
      return [];
    }
    case "ram":
      return t.includes("ddr5") ? [["ddr5", "16gb"], ["ddr5"]] : [["ddr4", "16gb"], ["ddr4"]];
    case "storage":
      return t.includes("nvme") || t.includes("m.2") || t.includes("m2")
        ? [["nvme", "1tb"], ["nvme"], ["ssd"]]
        : [["ssd", "sata"], ["ssd"]];
    case "cooling":
      return [["cooler"], [""]];
  }
}

/**
 * Escolhe a foto ilustrativa de uma peça entre os produtos do catálogo daquela
 * categoria. Tenta os termos do mais específico para o mais geral; sem nada,
 * devolve "" (a página usa a foto do PC ou, por último, o desenho antigo).
 */
export function fotoDaPeca(tipo: TipoDePeca, descricao: string, catalogo: Product[]): string {
  const lista = comFoto(catalogo);
  if (lista.length === 0) return "";
  const nomes = lista.map((p) => ({ p, n: junto(p.name) }));

  for (const termos of termosDaPeca(tipo, descricao)) {
    const achados = nomes.filter(({ n }) => termos.every((termo) => !termo || n.includes(junto(termo))));
    if (achados.length === 0) continue;
    // Placa "RX 6600" não deve pegar foto de "RX 6600 XT" se houver a certa.
    if (tipo === "gpu") {
      const alvo = junto(placaDedicada(descricao) || "");
      const exato = achados.find(({ n }) => {
        const i = n.indexOf(alvo);
        const depois = n.slice(i + alvo.length, i + alvo.length + 2);
        return !/^(xt|ti|su)/.test(depois) || /(xt|ti|super)$/.test(alvo);
      });
      if (exato) return comoIlustrativa(exato.p.image);
    }
    return comoIlustrativa(achados[0].p.image);
  }
  return "";
}
