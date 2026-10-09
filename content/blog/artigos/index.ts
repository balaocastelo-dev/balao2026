import type { Artigo } from "@/lib/blog/tipos";

import rtx5060Ti8gbOu16gb from "./rtx-5060-ti-8gb-ou-16gb";
import steamSetembro2026Vram16gb from "./steam-setembro-2026-vram-16gb";

/**
 * Os artigos escritos neste repositório.
 *
 * Publicar um artigo novo é: criar o arquivo (`npm run blog:novo -- "Título"`
 * já cria e registra aqui), escrever, rodar `npm run blog:conferir` e enviar.
 * Artigo em rascunho ou reprovado na régua não aparece no site.
 */
export const ARTIGOS_AUTORAIS: Artigo[] = [
  rtx5060Ti8gbOu16gb,
  steamSetembro2026Vram16gb,
  // novos artigos entram acima desta linha
];
