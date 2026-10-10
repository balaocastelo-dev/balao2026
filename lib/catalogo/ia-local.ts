// ============================================================
// Categoria "IA local": as máquinas que rodam modelos de linguagem e de imagem
// no próprio computador.
//
// É uma categoria por REGRA, não por cadastro. O produto continua onde está
// no catálogo (Computadores/PC, Notebooks…) e entra aqui sozinho quando a
// ficha dele atende ao critério — e sai sozinho quando deixa de atender ou
// some da fonte de preços. Ninguém precisa marcar produto por produto.
//
// O critério (o mesmo texto aparece para o cliente em /ia-local):
//   • placa NVIDIA GeForce RTX com 12 GB ou mais de memória de vídeo (VRAM)
//     E 32 GB ou mais de RAM; ou
//   • Apple com chip M e 24 GB ou mais de memória unificada.
//
// Por que assim: o tamanho do modelo que roda inteiro na placa é limitado
// pela VRAM; abaixo de 12 GB só cabem os modelos pequenos. A RAM de 32 GB é
// o que deixa carregar o modelo e dividir com a placa o que não coube. E só
// NVIDIA porque é a placa que todas as ferramentas de IA local aceitam sem
// ajuste; as Radeon rodam, mas não é a compra sem susto que a categoria
// promete.
// ============================================================

import type { FichaDaMaquina } from "@/lib/catalogo/ficha";

export type NivelDeIA = "vram-24" | "vram-16" | "vram-12" | "apple";

export const VRAM_MINIMA = 12;
export const RAM_MINIMA = 32;
export const MEMORIA_UNIFICADA_MINIMA = 24;

export interface DescricaoDoNivel {
  id: NivelDeIA;
  /** Rótulo curto do filtro: "16 GB de VRAM". */
  rotulo: string;
  /** Título da faixa. */
  titulo: string;
  /** O que cabe, em linguagem de quem vai usar. */
  cabe: string;
  /** Posição na régua de memória, em GB (onde a faixa começa). */
  apartirDeGb: number;
}

// Os tamanhos são ordem de grandeza, para modelos quantizados em 4 bits
// (o formato em que quase todo mundo roda modelo local): cerca de 0,6 GB de
// memória por bilhão de parâmetros, mais a folga do contexto.
export const NIVEIS: DescricaoDoNivel[] = [
  {
    id: "vram-24",
    rotulo: "24 GB de VRAM ou mais",
    titulo: "24 GB ou mais na placa",
    cabe: "Modelos de linguagem na casa dos 30 bilhões de parâmetros inteiros na placa, e geração de imagem e vídeo sem aperto.",
    apartirDeGb: 24,
  },
  {
    id: "vram-16",
    rotulo: "16 GB de VRAM",
    titulo: "16 GB na placa",
    cabe: "Modelos de linguagem de até uns 20 bilhões de parâmetros inteiros na placa, com resposta rápida. Geração de imagem em alta resolução.",
    apartirDeGb: 16,
  },
  {
    id: "vram-12",
    rotulo: "12 GB de VRAM",
    titulo: "12 GB na placa",
    cabe: "Modelos de linguagem de até uns 14 bilhões de parâmetros inteiros na placa. Assistente de código, transcrição de áudio e geração de imagem.",
    apartirDeGb: 12,
  },
  {
    id: "apple",
    rotulo: "Apple, memória unificada",
    titulo: "Apple com memória unificada",
    cabe: "No chip M a placa de vídeo usa a mesma memória do sistema: com 24 GB ou mais, modelos médios rodam em silêncio e com pouco consumo.",
    apartirDeGb: MEMORIA_UNIFICADA_MINIMA,
  },
];

export function descricaoDoNivel(nivel: NivelDeIA): DescricaoDoNivel {
  return NIVEIS.find((n) => n.id === nivel)!;
}

/** Em qual faixa de IA local a máquina entra — ou `null` se não entra. */
export function nivelDeIA(ficha: FichaDaMaquina): NivelDeIA | null {
  if (ficha.appleSilicon) {
    return (ficha.memoriaGb ?? 0) >= MEMORIA_UNIFICADA_MINIMA ? "apple" : null;
  }

  const ehRtx = ficha.fabricanteDaPlaca === "nvidia" && /\bRTX\b/.test(ficha.placaDeVideo || "");
  if (!ehRtx) return null;

  const vram = ficha.vramGb ?? 0;
  if (vram < VRAM_MINIMA) return null;
  if ((ficha.memoriaGb ?? 0) < RAM_MINIMA) return null;

  if (vram >= 24) return "vram-24";
  if (vram >= 16) return "vram-16";
  return "vram-12";
}

export function ehNivelDeIA(valor: unknown): valor is NivelDeIA {
  return NIVEIS.some((n) => n.id === valor);
}
